import { NextRequest, NextResponse } from 'next/server'
import User from '@/lib/models/User'
import { connectDB } from '@/lib/mongodb'
import { ROLES } from '@/lib/constants'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  // 🔐 SEGURANÇA: Apenas USER e NGO são permitidos
  // ADMIN pode APENAS ser atribuído por um admin no backend
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
    
    // Criar usuário novo (senha já hashed pelo pre-save)
    const newUser = new User({
      name: validatedData.name,
      email: validatedData.email.toLowerCase().trim(),
      password: validatedData.password,
      role: validatedData.role,
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
