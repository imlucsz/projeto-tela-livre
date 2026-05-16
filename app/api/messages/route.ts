import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Message from '@/lib/models/Message'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Validação de autenticação
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Validação de role - apenas ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Conectar ao banco
    await connectDB()

    // Buscar todas as mensagens, ordenadas por data decrescente
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: messages,
        count: messages.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching messages:', error)

    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? (error as Error).message
        : 'Erro ao buscar mensagens'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Parse do body
    const body = await request.json()

    const { name, email, subject, content } = body

    // Validação básica
    if (!name || !email || !subject || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nome, email, assunto e conteúdo são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Conectar ao banco
    await connectDB()

    // Criar nova mensagem
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      content: content.trim(),
      isRead: false,
    })

    // Popular e retornar
    await newMessage.save()

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
        message: 'Mensagem enviada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating message:', error)

    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? (error as Error).message
        : 'Erro ao salvar mensagem'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
