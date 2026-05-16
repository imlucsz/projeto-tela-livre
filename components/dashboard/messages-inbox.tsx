'use client'

import { useEffect, useState } from 'react'
import { Mail, Eye, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface Message {
  _id: string
  name: string
  email: string
  subject: string
  content: string
  isRead: boolean
  createdAt: string
}

export function MessagesInbox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/messages')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar mensagens')
      }

      const data = await response.json()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao buscar mensagens. Tente novamente.'
      )
      toast.error('Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenMessage(message: Message) {
    setSelectedMessage(message)
    setSheetOpen(true)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function truncateText(text: string, maxLength: number) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-amber-200/60">Carregando mensagens...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="backdrop-blur-xl bg-black/30 border border-red-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Erro ao carregar mensagens</p>
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            className="ml-auto"
          >
            Tentar Novamente
          </Button>
        </div>
      </Card>
    )
  }

  if (messages.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <Mail className="h-12 w-12 text-amber-400/40" />
          <div>
            <p className="text-white font-semibold text-lg">Nenhuma mensagem</p>
            <p className="text-amber-200/60 text-sm">
              Sua caixa de entrada está vazia
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/20 bg-black/40">
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-100/80 w-32">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-100/80">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-100/80">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-100/80">
                  Assunto
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-100/80">
                  Data
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-amber-100/80 w-20">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr
                  key={message._id}
                  className="border-b border-amber-500/10 hover:bg-black/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Badge
                      className={`text-xs font-medium border ${
                        message.isRead
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {message.isRead ? '✓ Lida' : '○ Não lida'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white font-medium truncate">
                      {message.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-amber-200/70 truncate">
                      {message.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-amber-100/80 truncate max-w-xs">
                      {message.subject}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-amber-200/60 whitespace-nowrap">
                      {formatDate(message.createdAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenMessage(message)}
                      className="text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé com contagem */}
        <div className="px-6 py-4 bg-black/40 border-t border-amber-500/10 text-sm text-amber-200/60">
          Total de {messages.length} mensagem{messages.length !== 1 ? 's' : ''}
        </div>
      </Card>

      {/* Sheet para leitura completa */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-lg bg-black/50 border-l border-amber-500/20 text-white"
        >
          {selectedMessage && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white">
                  {selectedMessage.subject}
                </SheetTitle>
                <SheetDescription className="text-amber-200/60">
                  De: {selectedMessage.name} ({selectedMessage.email})
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-8">
                {/* Informações do Remetente */}
                <div className="space-y-2 pb-6 border-b border-amber-500/10">
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider">
                      Nome
                    </p>
                    <p className="text-white font-medium">
                      {selectedMessage.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider">
                      Email
                    </p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-amber-400 hover:text-amber-300 font-medium break-all"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider">
                      Data
                    </p>
                    <p className="text-white">
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider">
                      Status
                    </p>
                    <Badge
                      className={`text-xs font-medium border mt-2 ${
                        selectedMessage.isRead
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {selectedMessage.isRead ? '✓ Lida' : '○ Não lida'}
                    </Badge>
                  </div>
                </div>

                {/* Conteúdo da Mensagem */}
                <div className="space-y-2">
                  <p className="text-xs text-amber-200/60 uppercase tracking-wider">
                    Mensagem
                  </p>
                  <div className="bg-black/40 rounded-lg border border-amber-500/10 p-4 max-h-96 overflow-y-auto">
                    <p className="text-amber-100/90 whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-6 border-t border-amber-500/10">
                  <Button
                    variant="outline"
                    className="flex-1 border-amber-500/30 hover:bg-amber-500/10 text-amber-100"
                    onClick={() => {
                      window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`
                    }}
                  >
                    Responder
                  </Button>
                  <Button
                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-100"
                    onClick={() => {
                      setSheetOpen(false)
                      toast.info('Clique novamente para marcar como lido')
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
