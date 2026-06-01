"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Check, X, Clock, AlertCircle, ChevronLeft } from 'lucide-react'

type NGORequest = {
  _id: string
  name: string
  email: string
  createdAt: string
}

export default function NgoRequestsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [requests, setRequests] = useState<NGORequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchRequests()
  }, [isAdmin, router])

  async function fetchRequests() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ong-requests', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Falha ao carregar solicitações')
      const data = await res.json()
      setRequests(data.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar solicitações de ONG')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(userId: string, userName: string, action: 'approve' | 'reject') {
    setProcessingId(userId)
    try {
      const res = await fetch('/api/admin/ong-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action }),
      })
      if (!res.ok) throw new Error('Erro ao processar')
      
      if (action === 'approve') {
        toast.success(`✓ ${userName} agora é uma ONG!`)
      } else {
        toast.success(`✗ Solicitação de ${userName} rejeitada`)
      }
      
      setRequests(requests.filter(r => r._id !== userId))
    } catch (err) {
      console.error(err)
      toast.error('Erro ao processar solicitação')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="text-amber-200/60 hover:bg-amber-500/10 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Gerenciar ONGs</h1>
          </div>
          <p className="text-amber-200/60 mt-2 ml-10">
            Aprove ou rejeite solicitações de organizações para ativar ONGs no sistema
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400 animate-spin" />
            <p className="text-amber-200/60">Carregando solicitações...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-green-400" />
            <p className="text-amber-200/60">Nenhuma solicitação de ONG pendente</p>
          </div>
        </Card>
      )}

      {/* Requests List */}
      {!loading && requests.length > 0 && (
        <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-white">Solicitações Pendentes</h2>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                {requests.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/20 rounded-xl border border-amber-500/10 hover:bg-black/30 transition-all gap-4"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{request.name}</p>
                    <p className="text-sm text-amber-200/60 truncate">{request.email}</p>
                    <p className="text-xs text-amber-200/40 mt-1">
                      Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      disabled={processingId !== null}
                      onClick={() => handleAction(request._id, request.name, 'approve')}
                      className="flex-1 sm:flex-none bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      disabled={processingId !== null}
                      onClick={() => handleAction(request._id, request.name, 'reject')}
                      variant="ghost"
                      className="flex-1 sm:flex-none text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
