import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    await connectDB()
    const result = await User.deleteMany({})
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

