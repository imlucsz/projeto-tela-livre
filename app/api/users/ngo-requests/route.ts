import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const admin = await User.findById(session.user.id).select('role')
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const requests = await User.find({ ngoRequested: true }).select('-password')
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Erro ao listar pedidos de ONG:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const admin = await User.findById(session.user.id).select('role')
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, action } = body as { userId?: string; action?: 'approve' | 'reject' }
    if (!userId || !['approve', 'reject'].includes(action || '')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (action === 'approve') {
      user.role = 'NGO'
      user.ngoRequested = false
      // sinalizar para que o usuário receba uma notificação única ao entrar
      user.showNgoApprovedNotification = true
      await user.save()
      return NextResponse.json({ message: 'Usuário aprovado como ONG' })
    }

    // reject
    user.ngoRequested = false
    await user.save()
    return NextResponse.json({ message: 'Pedido de ONG recusado' })

  } catch (error) {
    console.error('Erro ao processar pedido de ONG:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
