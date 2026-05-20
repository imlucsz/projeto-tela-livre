import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google OAuth - apenas se estiver configurado
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),

    // Credentials provider
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        // Este callback roda no Node.js Runtime, então é seguro usar Node.js modules
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { connectDB } = await import('@/lib/mongodb')
          const User = (await import('@/lib/models/User')).default

          await connectDB()

          const user = await User.findOne({ email: (credentials.email as string).toLowerCase().trim() })
          if (!user) {
            return null
          }

          if (user.isBanned) {
            return null
          }

          const isPasswordValid = await user.comparePassword(credentials.password as string)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
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
    async jwt({ token, user, account }) {
      // Credentiais provider - user é retornado do authorize
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // OAuth - não fazer operações de DB aqui (roda em Edge Runtime)
      // Apenas guardar dados que vieram do provider
      if (account?.provider === 'google' && user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || ''
        session.user.role = ((token.role as string) || 'USER') as 'USER' | 'NGO' | 'ADMIN'
      }
      return session
    }
  },

  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  secret: process.env.NEXTAUTH_SECRET
})

