import { NextRequest, NextResponse } from 'next/server'
import Event from '@/lib/models/Event'
import { connectDB } from '@/lib/mongodb'
import { auth } from '@/auth'
import { z } from 'zod'

const UpdateEventSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().optional(),
  location: z.string().max(150).optional(),
  address: z.string().max(300).optional(),
  image: z.string().url().optional(),
  category: z.enum(['cinema', 'oficinas', 'projetos']).optional(),
})

export async function GET(

  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }

) {
  await connectDB()
  
  try {

    const resolvedParams = await params
    const event = await Event.findById(resolvedParams.id)
      .populate('createdBy', 'name image')
      .populate('participants', 'name email')
      .lean()

    
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({ event })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 })
  }
}

export async function PATCH(

  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }

) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await connectDB()
    
    const resolvedParams = await params
    const userRole = (session.user as any)?.role || 'USER'
    const userId = session.user.id

    const event = await Event.findById(resolvedParams.id)
    
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    // Apenas o criador ou um admin pode editar
    const isOwner = event.createdBy.toString() === userId
    const isAdmin = userRole === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Você não tem permissão para editar este evento' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = UpdateEventSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          issues: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const updates = validationResult.data
    
    // Atualizar campos
    if (updates.title) event.title = updates.title
    if (updates.description !== undefined) event.description = updates.description
    if (updates.date) event.date = new Date(updates.date)
    if (updates.location !== undefined) event.location = updates.location
    if (updates.address !== undefined) event.address = updates.address
    if (updates.image !== undefined) event.image = updates.image
    if (updates.category) event.category = updates.category

    await event.save()
    
    const updatedEvent = await Event.findById(resolvedParams.id)
      .populate('createdBy', 'name email role image')
      .lean()
    
    return NextResponse.json({ 
      success: true,
      data: updatedEvent,
      message: 'Evento atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await connectDB()
    
    const resolvedParams = await params
    const userRole = (session.user as any)?.role || 'USER'
    const userId = session.user.id

    const event = await Event.findById(resolvedParams.id)
    
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    // Apenas o criador ou um admin pode deletar
    const isOwner = event.createdBy.toString() === userId
    const isAdmin = userRole === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Você não tem permissão para deletar este evento' }, { status: 403 })
    }

    await Event.findByIdAndDelete(resolvedParams.id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Evento deletado com sucesso'
    }, { status: 200 })
  } catch (error) {
    console.error('Erro ao deletar evento:', error)
    return NextResponse.json({ error: 'Erro ao deletar evento' }, { status: 500 })
  }
}

