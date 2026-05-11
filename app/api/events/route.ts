
import { NextRequest, NextResponse } from 'next/server'
import Event from '@/lib/models/Event'
import { connectDB } from '@/lib/mongodb'
import { auth } from '@/auth'

export async function GET() {

  await connectDB()
  
  try {
    const events = await Event.find({ approved: true })
      .populate('createdBy', 'name image')
      .populate('participants', 'name')
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }


  const userId = session.user.id
  const isOng = session.user.isNgo

  if (!isOng) {
    return NextResponse.json({ error: 'Apenas ONGs podem criar eventos' }, { status: 403 })
  }

  try {
    await connectDB()
    
    const body = await request.json()
    
    const event = new Event({
      ...body,
      createdBy: userId,
      approved: false
    })

    await event.save()
    
    return NextResponse.json({ event, message: 'Evento criado com sucesso! Aguardando aprovação.' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 })
  }
}

