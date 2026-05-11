import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔐 Middleware protegido com NextAuth
export default auth((req) => {
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                          req.nextUrl.pathname.startsWith('/profile')
  
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isRegisterPage = req.nextUrl.pathname === '/register'

  // ✅ Se tá logado e tenta ir para login/register → redireciona para dashboard
  if ((isLoginPage || isRegisterPage) && req.auth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // ✅ Se tá no protectedRoute e SEM autenticação → redireciona para login
  if (isProtectedRoute && !req.auth) {
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
