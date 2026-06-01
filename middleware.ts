import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔐 Middleware protegido com NextAuth
export default auth((req) => {
  // Edge: req.auth pode não existir em alguns cenários; para evitar travas indevidas no Render
  // (especialmente após mudanças), tratamos role como ADMIN/NGO apenas quando presente.

  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard')

  const isProfileRoute = req.nextUrl.pathname.startsWith('/profile')
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isRegisterPage = req.nextUrl.pathname === '/register'

  // ✅ Dashboard - apenas ADMIN e NGO
  if (isDashboardRoute && req.auth?.user) {
    const userRole = (req.auth.user as any)?.role || 'USER'
    if (userRole !== 'ADMIN' && userRole !== 'NGO') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Se req.auth não vier (algum cenário edge/Render), deixa passar e o próprio page decide.


  // ✅ Se tá logado e tenta ir para login/register → redireciona para home
  if ((isLoginPage || isRegisterPage) && req.auth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // ✅ Se tá em rota protegida e SEM autenticação → redireciona para login
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
