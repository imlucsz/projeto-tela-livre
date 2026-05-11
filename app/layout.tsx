import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import '../styles/globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Tela Livre - Cinema Gratuito para Todos',
  description: 'Descubra sessões de cinema gratuitas organizadas por ONGs perto de você. Participe de eventos culturais e projetos sociais.',
  generator: 'luc',
  icons: {
    icon: [
      { url: '/Logo Principal.png', sizes: '32x32' },
      { url: '/Logo Principal.png', sizes: '16x16' },
    ],
    apple: '/Logo Principal.png',
  },
}

import { auth } from '@/auth'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
