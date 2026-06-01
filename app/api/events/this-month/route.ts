import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Event from '@/lib/models/Event'

export const dynamic = 'force-dynamic'

function getMonthRange(date = new Date()) {
  const start = new Date(date)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  return { start, end }
}

export async function GET() {
  try {
    await connectDB()

    const { start, end } = getMonthRange(new Date())

    const [total, events] = await Promise.all([
      Event.countDocuments({
        approved: true,
        date: { $gte: start, $lt: end },
      }),
      Event.find({
        approved: true,
        date: { $gte: start, $lt: end },
      })
        .sort({ date: 1 })
        .select({
          title: 1,
          location: 1,
          date: 1,
          status: 1,
          approved: 1,
        })
        .lean(),
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          monthLabel: start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          count: total,
          events,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar eventos deste mês',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}

