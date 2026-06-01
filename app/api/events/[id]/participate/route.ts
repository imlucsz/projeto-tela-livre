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

    const event = await Event.findById(eventId).select('participants')
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const user = await User.findById(userId).select('_id')
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

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { participants: user._id } },
      { new: true, runValidators: false }
    ).select('participants')

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { participatingEvents: eventId } },
      { new: true, runValidators: false }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Participação confirmada',
        participantCount: updatedEvent?.participants?.length || 0
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro POST /api/events/[id]/participate:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Stack trace:', errorMessage)

    return NextResponse.json(
      { error: 'Erro ao processar participação', details: errorMessage },
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

    const event = await Event.findById(eventId).select('date participants')
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const user = await User.findById(userId).select('_id')
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

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { participants: user._id } },
      { new: true, runValidators: false }
    ).select('participants')

    await User.findByIdAndUpdate(
      userId,
      { $pull: { participatingEvents: eventId } },
      { new: true, runValidators: false }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Participação cancelada',
        participantCount: updatedEvent?.participants?.length || 0
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro DELETE /api/events/[id]/participate:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Stack trace:', errorMessage)

    return NextResponse.json(
      { error: 'Erro ao cancelar participação', details: errorMessage },
      { status: 500 }
    )
  }
}
