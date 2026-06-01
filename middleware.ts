import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔐 Middleware protegido com NextAuth
export default auth((req) => {
  // Em Edge/Render, req.auth pode não estar sempre disponível.
  // Para não quebrar o payload do /dashboard, só redirecionamos login/register
  // quando houver sessão.

  const isLoginPage = req.nextUrl.pathname === '/login'
  const isRegisterPage = req.nextUrl.pathname === '/register'

  if ((isLoginPage || isRegisterPage) && req.auth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})


export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/register'
  ]
}
