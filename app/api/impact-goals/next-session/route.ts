import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import Event from '@/lib/models/Event'

export const dynamic = 'force-dynamic'

function diffHuman(ms: number) {
  const abs = Math.max(0, ms)
  const days = Math.floor(abs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`
  return `${minutes} min`
}

export async function GET() {
  try {
    const session = await auth()

    // RSC não bloqueia - retorna dados padrão se necessário
    await connectDB()

    const role = (session?.user as any)?.role || 'ADMIN'
    const userId = (session?.user as any)?.id

    const now = new Date()

    const filter: any = { approved: true, date: { $gte: now } }
    // Somente NGO com userId filtra por createdBy
    if (role === 'NGO' && userId) filter.createdBy = userId

    const nextEvent = await Event.findOne(filter).sort({ date: 1 }).select({ date: 1 }).lean()

    if (!nextEvent?.date) {
      return NextResponse.json({ success: true, data: { nextAt: null, countdown: null } }, { status: 200 })
    }

    const nextAt = new Date(nextEvent.date)
    const countdownMs = nextAt.getTime() - now.getTime()

    return NextResponse.json(
      {
        success: true,
        data: {
          nextAt: nextAt.toISOString(),
          countdown: diffHuman(countdownMs),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar próxima sessão', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

