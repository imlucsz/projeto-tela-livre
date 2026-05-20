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

    const alreadyParticipating = (event.participants as any[]).some(
      (participant) => participant.toString() === userId
    )

    if (alreadyParticipating) {
      return NextResponse.json(
        { error: 'Você já está inscrito neste evento' },
        { status: 409 }
      )
    }

    event.participants.push(user._id)
    if (!(user.participatingEvents as any[]).some((item) => item.toString() === eventId)) {
      user.participatingEvents.push(event._id)
    }

    await Promise.all([event.save(), user.save()])

    return NextResponse.json({ success: true, message: 'Participação confirmada' })
  } catch (error) {
    console.error('Erro POST /api/events/[id]/participate:', error)
    return NextResponse.json(
      { error: 'Erro ao processar participação' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const eventDate = event.date
    const now = new Date()
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000
    const remainingMs = eventDate.getTime() - now.getTime()

    if (remainingMs < threeDaysMs) {
      return NextResponse.json(
        {
          error:
            'Não é mais possível cancelar a participação. Cancelamentos devem ser feitos com pelo menos 3 dias de antecedência.',
        },
        { status: 403 }
      )
    }

    event.participants = (event.participants as any[]).filter(
      (participant) => participant.toString() !== userId
    )
    user.participatingEvents = (user.participatingEvents as any[]).filter(
      (item) => item.toString() !== eventId
    )

    await Promise.all([event.save(), user.save()])

    return NextResponse.json({ success: true, message: 'Participação cancelada' })
  } catch (error) {
    console.error('Erro DELETE /api/events/[id]/participate:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar participação' },
      { status: 500 }
    )
  }
}
