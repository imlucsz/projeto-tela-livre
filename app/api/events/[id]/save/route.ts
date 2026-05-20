import { NextRequest, NextResponse } from 'next/server'
import Event from '@/lib/models/Event'
import User from '@/lib/models/User'
import { connectDB } from '@/lib/mongodb'
import { auth } from '@/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await connectDB()
    const resolvedParams = await params
    const eventId = resolvedParams.id
    const userId = session.user.id

    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const savedIndex = (user.savedEvents as any[]).findIndex(
      (item) => item.toString() === eventId
    )

    let message = ''
    if (savedIndex >= 0) {
      user.savedEvents.splice(savedIndex, 1)
      message = 'Evento removido da sua lista de salvos.'
    } else {
      user.savedEvents.push(event._id)
      message = 'Evento salvo com sucesso.'
    }

    await user.save()

    return NextResponse.json({ success: true, saved: savedIndex < 0, message })
  } catch (error) {
    console.error('Erro POST /api/events/[id]/save:', error)
    return NextResponse.json({ error: 'Erro ao salvar evento' }, { status: 500 })
  }
}
