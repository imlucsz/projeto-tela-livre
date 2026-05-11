import { NextRequest, NextResponse } from 'next/server'
import Event from '@/lib/models/Event'
import { connectDB } from '@/lib/mongodb'
import { auth } from '@/auth'

export async function GET(

  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }

) {
  await connectDB()
  
  try {

    const resolvedParams = await params
    const event = await Event.findById(resolvedParams.id)
      .populate('createdBy', 'name image')
      .populate('participants', 'name email')
      .lean()

    
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({ event })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 })
  }
}

export async function PUT(

  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }

) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await connectDB()
    

    const resolvedParams = await params
    const event = await Event.findById(resolvedParams.id)
    
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }


    if (event.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    
    event.title = body.title || event.title
    event.description = body.description || event.description
    event.date = body.date || event.date
    event.location = body.location || event.location
    event.address = body.address || event.address
    event.image = body.image || event.image
    event.category = body.category || event.category

    await event.save()
    
    return NextResponse.json({ event })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await connectDB()
    
const resolvedParams = await params
  const event = await Event.findById(resolvedParams.id)
    
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    if (event.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await Event.findByIdAndDelete(params.id)
    
    return NextResponse.json({ message: 'Evento deletado' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar evento' }, { status: 500 })
  }
}

