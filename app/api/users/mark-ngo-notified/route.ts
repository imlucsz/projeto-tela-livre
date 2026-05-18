import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    user.showNgoApprovedNotification = false
    await user.save()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro /api/users/mark-ngo-notified:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
