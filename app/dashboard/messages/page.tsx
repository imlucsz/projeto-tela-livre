import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessagesInbox } from '@/components/dashboard/messages-inbox'

export const metadata = {
  title: 'Mensagens | Tela Livre',
  description: 'Caixa de entrada de mensagens do admin',
}

export default async function MessagesPage() {
  const session = await auth()

  // Validação de autenticação
  if (!session?.user) {
    redirect('/login')
  }

  // Apenas ADMIN pode acessar
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="h-screen relative overflow-hidden bg-black">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/80" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 h-screen overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-100 mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Mail className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Caixa de Entrada</h1>
                <p className="text-amber-200/60 mt-1">
                  Mensagens de contato enviadas pelos visitantes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Messages Inbox Component */}
        <MessagesInbox />
      </div>
    </div>
  )
}
