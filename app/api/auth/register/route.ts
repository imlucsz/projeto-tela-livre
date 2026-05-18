import { NextRequest, NextResponse } from 'next/server'
import User from '@/lib/models/User'
import { connectDB } from '@/lib/mongodb'
import { ROLES } from '@/lib/constants'
import { z } from 'zod'

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/u

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50)
    .regex(nameRegex, 'Nome contém caracteres inválidos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  // Não confiar no role enviado pelo cliente — sempre gravamos como USER
  role: z.enum([ROLES.USER, ROLES.NGO]).default(ROLES.USER)
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    // Verificar se usuário já existe
    const existingUser = await User.findOne({ 
      email: validatedData.email.toLowerCase().trim() 
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Usuário já existe com este email' 
      }, { status: 409 })
    }
    
    // Segurança: não permitir atribuição direta de ONG pelo cliente.
    // Se o usuário marcou role === NGO, gravamos como USER e marcamos
    // ngoRequested=true para revisão manual do admin.
    const ngoRequested = (body.role === ROLES.NGO) || (validatedData.role === ROLES.NGO)

    const newUser = new User({
      name: validatedData.name,
      email: validatedData.email.toLowerCase().trim(),
      password: validatedData.password,
      role: ROLES.USER,
      ngoRequested,
      emailVerified: false // Será verificado depois
    })
    
    await newUser.save()
    
    return NextResponse.json({ 
      message: 'Usuário criado com sucesso!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    console.error('Erro ao registrar:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
