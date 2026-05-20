import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(session.user.id)
      .select('-password')
      .populate({
        path: 'participatingEvents',
        select: 'title description date location address image category'
      })
      .populate({
        path: 'savedEvents',
        select: 'title description date location address image category'
      })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (user.isBanned) return NextResponse.json({ error: 'Conta banida', status: 'banned' }, { status: 403 })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro /api/users/me:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
