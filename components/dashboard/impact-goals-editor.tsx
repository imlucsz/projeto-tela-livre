"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ImpactGoalsEditor({ initialPeople, initialSessions }: { initialPeople: number; initialSessions: number }) {
  const [open, setOpen] = useState(false)
  const [metaPeople, setMetaPeople] = useState<number>(initialPeople)
  const [metaSessions, setMetaSessions] = useState<number>(initialSessions)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setMetaPeople(initialPeople)
      setMetaSessions(initialSessions)
    }
  }, [open, initialPeople, initialSessions])

  const onSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/impact-goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ metaPeople, metaSessions }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(json?.error || 'Erro ao salvar metas')
        return
      }

      toast.success('Metas atualizadas')
      setOpen(false)
      window.location.reload()
    } catch {
      toast.error('Erro ao salvar metas')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-amber-100/80 hover:bg-amber-500/10">
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Metas do Impacto Social</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-black/30 border border-amber-500/20 rounded-2xl p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaPeople">Meta Anual de Pessoas</Label>
                <Input
                  id="metaPeople"
                  type="number"
                  min={0}
                  value={metaPeople}
                  onChange={(e) => setMetaPeople(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaSessions">Meta de Sessões</Label>
                <Input
                  id="metaSessions"
                  type="number"
                  min={0}
                  value={metaSessions}
                  onChange={(e) => setMetaSessions(Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="button" onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

