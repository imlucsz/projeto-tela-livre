import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    await connectDB()
    const users = await User.find({}).select('-password')
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

