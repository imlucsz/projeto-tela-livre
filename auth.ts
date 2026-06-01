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
          console.log("[AUTH] Missing email or password");
          return null
        }

        try {
          const { connectDB } = await import('@/lib/mongodb')
          const User = (await import('@/lib/models/User')).default

          await connectDB()

          const user = await User.findOne({ email: (credentials.email as string).toLowerCase().trim() })
          console.log("[AUTH] User found:", { email: credentials.email, exists: !!user, role: user?.role });
          
          if (!user) {
            console.log("[AUTH] User not found in database");
            return null
          }

          if (user.isBanned) {
            console.log("[AUTH] User is banned:", user.email);
            return null
          }

          const isPasswordValid = await user.comparePassword(credentials.password as string)
          console.log("[AUTH] Password valid:", isPasswordValid);
          
          if (!isPasswordValid) {
            console.log("[AUTH] Password is invalid");
            return null
          }

          const returnedUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role
          };
          
          console.log("[AUTH] Login successful, returning user:", { 
            id: returnedUser.id, 
            role: returnedUser.role,
            email: returnedUser.email 
          });
          
          return returnedUser;
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
        console.log("[JWT] Setting token from user:", { id: token.id, role: token.role });
      }

      // OAuth - não fazer operações de DB aqui (roda em Edge Runtime)
      // Apenas guardar dados que vieram do provider
      if (account?.provider === 'google' && user) {
        token.id = user.id
        token.role = user.role
        console.log("[JWT] Setting token from Google OAuth:", { id: token.id, role: token.role });
      }

      return token
    },

    async session({ session, token }) {
      console.log("[SESSION] Callback input - token role:", token.role);
      
      if (token && session.user) {
        session.user.id = (token.id as string) || ''
        session.user.role = ((token.role as string) || 'USER') as 'USER' | 'NGO' | 'ADMIN'
        console.log("[SESSION] Session updated:", { 
          id: session.user.id, 
          role: session.user.role,
          email: session.user.email
        });
      } else {
        console.log("[SESSION] Token or session.user missing:", { hasToken: !!token, hasUser: !!session.user });
      }
      
      return session
    }
  },

  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  secret: process.env.NEXTAUTH_SECRET
})

