import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// 🔐 Middleware protegido com NextAuth
// Objetivo: não quebrar /dashboard em ambientes onde `req.auth`/token
// pode demorar (ex: Edge/Render). Só força redirect quando realmente
// existir sessão e o usuário estiver em login/register.
export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isRegisterPage = req.nextUrl.pathname === '/register'

  if ((isLoginPage || isRegisterPage) && req.auth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register'],
}

