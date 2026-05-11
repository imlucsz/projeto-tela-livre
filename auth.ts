import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { isValidRole } from '@/lib/constants'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const { connectDB } = await import('@/lib/mongodb')
        const User = (await import('@/lib/models/User')).default
        const bcrypt = await import('bcryptjs')

        await connectDB()

        const user = await User.findOne({ email: (credentials.email as string).toLowerCase().trim() })
        if (!user) {
          throw new Error('Nenhum usuário encontrado')
        }

        const isPasswordValid = await user.comparePassword(credentials.password as string)
        if (!isPasswordValid) {
          throw new Error('Senha inválida')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        }
      }
    })
  ],

  pages: {
    signIn: '/login',
  },

  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        // Usar role do token (rápido, Edge Runtime OK)
        // Para verificação precisa do banco, use /api/auth/verify-role
        if (typeof token.role === 'string' && isValidRole(token.role)) {
          session.user.role = token.role
        } else {
          session.user.role = 'USER'
        }
      }
      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET!
})

