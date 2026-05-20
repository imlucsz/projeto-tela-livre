import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Event from '@/lib/models/Event'
import User from '@/lib/models/User'
import { connectDB } from '@/lib/mongodb'
import { auth } from '@/auth'

const AttendancePayload = z.object({
  attendedUserIds: z.array(z.string()).default([]),
  finalize: z.boolean().default(false),
})

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
    const userRole = (session.user as any)?.role || 'USER'

    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const isOrganizer = event.createdBy.toString() === userId
    const isAdmin = userRole === 'ADMIN'
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ error: 'Acesso negado: apenas o organizador ou admin pode gerenciar presenças' }, { status: 403 })
    }

    if (event.isClosed) {
      return NextResponse.json({ error: 'Evento já encerrado. Não é possível atualizar a lista de presença.' }, { status: 400 })
    }

    const body = await request.json()
    const parseResult = AttendancePayload.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Payload inválido', issues: parseResult.error.errors }, { status: 400 })
    }

    const { attendedUserIds, finalize } = parseResult.data
    const normalizedAttended = [...new Set(attendedUserIds.map((id) => id?.toString?.()).filter(Boolean))]

    event.attended = normalizedAttended

    let bannedCount = 0
    if (finalize) {
      event.isClosed = true

      const participantIds = (event.participants as any[]).map((participant) => participant.toString())
      const absentIds = participantIds.filter((participantId) => !normalizedAttended.includes(participantId))

      if (absentIds.length > 0) {
        const absentUsers = await User.find({ _id: { $in: absentIds } })
        await Promise.all(
          absentUsers.map(async (absentUser) => {
            absentUser.isBanned = true
            await absentUser.save()
            bannedCount += 1
          })
        )
      }
    }

    await event.save()

    return NextResponse.json({
      success: true,
      message: finalize
        ? `Evento encerrado. ${bannedCount} usuário(s) ausente(s) banido(s).`
        : 'Lista de presença atualizada como rascunho.',
      data: {
        attended: event.attended,
        isClosed: event.isClosed,
        bannedCount,
      },
    })
  } catch (error) {
    console.error('Erro POST /api/events/[id]/attendance:', error)
    return NextResponse.json({ error: 'Erro ao processar presença' }, { status: 500 })
  }
}
