import { NextRequest, NextResponse } from 'next/server'
import Event from '@/lib/models/Event'
import { connectDB } from '@/lib/mongodb'
import { auth } from '@/auth'
import { isValidRole, ROLES } from '@/lib/constants'


function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function pickValidatedEventFields(body: any) {
  // Campos permitidos para criação (servidor controla createdBy/approved)
  const allowed = [
    'title',
    'description',
    'date',
    'location',
    'address',
    'image',
    'category',
    'featured',
    'impact'
  ] as const

  const data: Record<string, any> = {}
  for (const key of allowed) {
    if (body?.[key] !== undefined) data[key] = body[key]
  }

  // Validação mínima (mantém simples para não divergir do schema do Mongoose)
  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Campo "title" é obrigatório')
  }

  if (typeof data.description !== 'string') {
    // description tem default no model, mas se vier, deve ser string
    if (data.description !== undefined) {
      throw new Error('Campo "description" deve ser uma string')
    }
  }

  const dateValue = data.date
  if (dateValue === undefined) {
    throw new Error('Campo "date" é obrigatório')
  }
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Campo "date" deve ser uma data válida')
  }

  if (typeof data.location !== 'string' || data.location.trim().length === 0) {
    throw new Error('Campo "location" é obrigatório')
  }

  if (typeof data.address !== 'string' || data.address.trim().length === 0) {
    throw new Error('Campo "address" é obrigatório')
  }

  if (typeof data.category !== 'string' || data.category.trim().length === 0) {
    throw new Error('Campo "category" é obrigatório')
  }

  if (data.image !== undefined) {
    if (typeof data.image !== 'string') throw new Error('Campo "image" deve ser uma string')
  }

  // featured/impact são opcionais
  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    throw new Error('Campo "featured" deve ser boolean')
  }

  if (data.impact !== undefined) {
    if (typeof data.impact !== 'object' || data.impact === null) {
      throw new Error('Campo "impact" deve ser um objeto')
    }
  }

  return {
    ...data,
    title: data.title.trim(),
    description: typeof data.description === 'string' ? data.description : data.description,
    location: data.location.trim(),
    address: data.address.trim(),
    date: parsedDate,
    category: data.category.trim()
  }
}

export async function GET() {
  const session = await auth()

  if (!session) {
    return jsonError('Não autorizado', 401)
  }

  const role = session.user.role
  if (!isValidRole(role)) {
    return jsonError('Role inválida', 403)
  }

  await connectDB()

  try {
    const query = role === ROLES.NGO ? { createdBy: session.user.id } : {}

    const events = await Event.find(query)
      .populate('createdBy', 'name image')
      .populate('participants', 'name')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ events })
  } catch (error) {
    return jsonError('Erro ao buscar eventos', 500)
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return jsonError('Não autorizado', 401)
  }

  const role = session.user.role
  if (!isValidRole(role)) {
    return jsonError('Role inválida', 403)
  }

  const userId = session.user.id

  let body: any
  try {
    body = await request.json()
  } catch {
    return jsonError('Payload inválido (JSON)', 400)
  }

  // Security: createdBy e approved são controlados exclusivamente pelo servidor.
  if (body?.createdBy !== undefined || body?.approved !== undefined) {
    // Não divulgamos regra interna, mas impedimos manipulação silenciosa
    // (mantém comportamento explícito)
    return jsonError('Campos "createdBy" e "approved" não são aceitos no payload', 400)
  }

  let validatedFields: Record<string, any>
  try {
    validatedFields = pickValidatedEventFields(body)
  } catch (e: any) {
    return jsonError(e?.message || 'Payload inválido', 400)
  }

  const approved = role === ROLES.ADMIN

  await connectDB()

  try {
    const event = new Event({
      ...validatedFields,
      createdBy: userId,
      approved
    })

    await event.save()

    return NextResponse.json({ event })
  } catch (error: any) {
    return jsonError(error?.message || 'Erro ao criar evento', 500)
  }
}

