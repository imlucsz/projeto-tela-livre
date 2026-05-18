"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

type UserItem = {
  _id: string
  name: string
  email: string
  role: string
  ngoRequested?: boolean
}

export default function NgoRequestsPage() {
  const [requests, setRequests] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchRequests() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/ngo-requests')
      if (!res.ok) throw new Error('Falha ao carregar pedidos')
      const data = await res.json()
      setRequests(data.requests || [])
    } catch (err: any) {
      setError(err.message || 'Erro')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    try {
      setLoading(true)
      const res = await fetch('/api/users/ngo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
        credentials: 'same-origin'
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Erro ao processar')
      }
      await fetchRequests()
    } catch (err: any) {
      setError(err.message || 'Erro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Pedidos de ONG</h2>
        <Link href="/dashboard" className="text-sm text-blue-600">Voltar ao dashboard</Link>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && requests.length === 0 && <p>Nenhum pedido pendente.</p>}

      <div className="space-y-3">
        {requests.map((u) => (
          <div key={u._id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleAction(u._id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded">Aprovar</button>
              <button onClick={() => handleAction(u._id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded">Recusar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
