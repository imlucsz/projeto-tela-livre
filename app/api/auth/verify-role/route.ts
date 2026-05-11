import { auth } from '@/auth'
import User from '@/lib/models/User'
import { connectDB } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    await connectDB()
    const dbUser = await User.findById(session.user.id).select('role')
    
    if (!dbUser) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({ 
      valid: true,
      role: dbUser.role as string,
      id: dbUser._id.toString()
    })
  } catch (error) {
    console.error('Erro ao verificar role:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}

