/**
 * EXEMPLO DE ROTA PROTEGIDA COM VALIDAÇÃO DE ROLE
 * 
 * Este é um exemplo de como proteger suas rotas de API
 * com o novo sistema de Roles com SEGURANÇA e TYPE-SAFETY.
 * 
 * Copie este padrão para suas outras rotas!
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requireNgo, canUserAction } from '@/lib/auth-utils'
import { ROLES } from '@/lib/constants'
import Event, { IEvent } from '@/lib/models/Event'
import { connectDB } from '@/lib/mongodb'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  date: z.string().transform(s => new Date(s)),
  location: z.string(),
  address: z.string(),
  image: z.string().optional(),
  category: z.enum(['cinema', 'oficinas', 'projetos']),
})

/**
 * GET /api/events
 * Lista todos os eventos (público, mas pode filtrar)
 * 
 * Query params:
 * - createdBy=userId (filtrar por criador)
 * - approved=true (apenas aprovados)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const createdBy = searchParams.get('createdBy')
    const approved = searchParams.get('approved') === 'true'

    // Construir query dinamicamente
    let query: any = {}

    if (createdBy) {
      query.createdBy = createdBy
    }

    if (approved) {
      query.approved = true
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    return NextResponse.json({ events, total: events.length })
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events
 * 🔐 PROTEGIDO: Apenas ONGs podem criar eventos
 * 
 * Segurança:
 * - Valida que session.user.role === 'NGO'
 * - Recria o role do banco a cada requisição (no session callback)
 * - Usa ROLES constant para evitar typos
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Passo 1: Obter sessão do usuário
    const session = await auth()

    // ✅ Passo 2: Validar que é NGO (lança erro se não for)
    // Isso valida session.user.role === ROLES.NGO
    await requireNgo(session)

    // ✅ Passo 3: Conectar ao banco
    await connectDB()

    // ✅ Passo 4: Validar dados com Zod
    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // ✅ Passo 5: Validar extra - usuário ainda existe
    // (opcional, mas recomendado)
    if (!session?.user.id) {
      throw new Error('Usuário não identificado')
    }

    // ✅ Passo 6: Criar evento associado à ONG
    const newEvent = new Event({
      ...validatedData,
      createdBy: session.user.id,
      approved: false // Admin deve aprovar depois
    })

    await newEvent.save()

    return NextResponse.json(
      {
        message: 'Evento criado com sucesso!',
        event: newEvent
      },
      { status: 201 }
    )
  } catch (error) {
    // Tratamento específico de erros
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Erro de acesso negado do requireNgo()
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    console.error('Erro ao criar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/events/[id]
 * 🔐 PROTEGIDO: Apenas a ONG que criou pode editar
 * 
 * Segurança:
 * - Valida que é ONG
 * - Valida que é o criador do evento (ownership)
 * - Role é revalidado do banco automaticamente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    // ✅ Validar que é ONG
    await requireNgo(session)
    
    await connectDB()

    const eventId = params.id
    const body = await request.json()

    // ✅ Buscar evento
    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // ✅ Validar ownership (apenas o criador pode editar)
    if (event.createdBy.toString() !== session!.user.id) {
      return NextResponse.json(
        { error: 'Você só pode editar seus próprios eventos' },
        { status: 403 }
      )
    }

    // ✅ Atualizar evento
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { ...body, updatedAt: new Date() },
      { new: true }
    )

    return NextResponse.json({
      message: 'Evento atualizado com sucesso!',
      event: updatedEvent
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]
 * 🔐 SUPER PROTEGIDO: Apenas admin pode deletar
 * 
 * Segurança:
 * - Apenas usuarios com role ADMIN
 * - Sem validação de ownership (admin pode deletar qualquer evento)
 */
import { requireAdmin } from '@/lib/auth-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    // ✅ Apenas admin pode deletar
    await requireAdmin(session)

    await connectDB()

    const eventId = params.id
    const event = await Event.findByIdAndDelete(eventId)

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Evento deletado com sucesso' 
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    console.error('Erro ao deletar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
