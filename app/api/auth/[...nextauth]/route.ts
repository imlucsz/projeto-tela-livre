import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
// import GitHubProvider from "next-auth/providers/github"  REMOVIDO
import bcrypt from "bcryptjs"
import User from "@/lib/models/User"
import { connectDB } from "@/lib/mongodb"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // GitHubProvider REMOVIDO

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ✅ Garante que são strings antes do bcrypt
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) return null

        const { email, password } = credentials

        await connectDB()

        const user = await User.findOne({ email })
        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      // Login normal (credentials)
      if (user) {
        token.role = user.role
        token.id = user.id
      }

      // Login OAuth (Google ou GitHub) — salva no SEU User model
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB()
        const existing = await User.findOne({ email: token.email })

        if (!existing) {
          // Primeira vez — cria usuário com role padrão
          const newUser = await User.create({
            name: token.name,
            email: token.email,
            image: token.picture,
            role: "user",           // ← role padrão para OAuth
            provider: account.provider,
          })
          token.id = newUser._id.toString()
          token.role = newUser.role
        } else {
          // Já existe — só pega os dados
          token.id = existing._id.toString()
          token.role = existing.role
        }
      }

      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role  // ← disponível em toda a app
        session.user.id = token.id
      }
      return session
    },
  },
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }