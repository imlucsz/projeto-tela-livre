import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔐 Middleware protegido com NextAuth
export default auth((req) => {
  // ⚠️ IMPORTANTE: Em Edge Runtime (Render), req.auth pode não estar sempre disponível
  // Nunca bloqueamos aqui. Deixamos passar e cada página valida server-side com auth()

  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard')
  const isProfileRoute = req.nextUrl.pathname.startsWith('/profile')
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isRegisterPage = req.nextUrl.pathname === '/register'

  // ✅ Se tá logado e tenta ir para login/register → redireciona para home
  if ((isLoginPage || isRegisterPage) && req.auth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Para /dashboard e /profile:
  // - Se tá logado: passa adiante (página valida role com auth() server-side)
  // - Se não tá logado: redireciona para login
  if ((isDashboardRoute || isProfileRoute) && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url))
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
