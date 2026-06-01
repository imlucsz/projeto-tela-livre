import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import ImpactGoal from '@/lib/models/ImpactGoal'

export const dynamic = 'force-dynamic'

function currentYear() {
  return new Date().getFullYear()
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    await connectDB()

    const role = (session.user as any)?.role || 'USER'
    const userId = (session.user as any)?.id

    const year = currentYear()

    // ADM: meta global (ngoId=null)
    // NGO: meta da ONG (ngoId=userId)
    const filter = role === 'ADMIN' ? { ngoId: null, year } : { ngoId: userId, year }

    const goal = await ImpactGoal.findOne(filter).lean()

    const data = {
      year,
      ngoId: role === 'ADMIN' ? null : userId,
      metaPeople: goal?.metaPeople ?? 0,
      metaSessions: goal?.metaSessions ?? 0,
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar metas', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const metaPeople = Number(body?.metaPeople ?? 0)
    const metaSessions = Number(body?.metaSessions ?? 0)

    if (Number.isNaN(metaPeople) || Number.isNaN(metaSessions)) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    await connectDB()

    const role = (session.user as any)?.role || 'USER'
    const userId = (session.user as any)?.id
    const year = currentYear()

    const filter = role === 'ADMIN' ? { ngoId: null, year } : { ngoId: userId, year }

    const updated = await ImpactGoal.findOneAndUpdate(
      filter,
      {
        $set: {
          metaPeople: Math.max(0, metaPeople),
          metaSessions: Math.max(0, metaSessions),
        },
      },
      { new: true, upsert: true }
    ).lean()

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar metas', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}

