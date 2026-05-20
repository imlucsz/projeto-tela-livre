"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface EventAttendanceProps {
  eventId: string;
}

interface EventParticipant {
  _id: string;
  name: string;
  email: string;
}

interface EventData {
  title: string;
  participants: EventParticipant[];
  attended: EventParticipant[];
  isClosed: boolean;
}

export default function EventAttendance({ eventId }: EventAttendanceProps) {
  const { data: session, status } = useSession();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadEvent() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error || "Não foi possível carregar o evento.");
        }

        const { event } = await response.json();
        if (!mounted) return;

        const participants = Array.isArray(event.participants) ? event.participants : [];
        const attended = Array.isArray(event.attended) ? event.attended : [];

        setEventData({
          title: event.title || "Evento",
          participants,
          attended,
          isClosed: event.isClosed || false,
        });

        setSelectedIds(attended.map((attendee: any) => attendee?._id?.toString() || attendee?.id?.toString()).filter(Boolean));
      } catch (err) {
        if (!mounted) return;
        setError((err as Error).message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadEvent();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleToggle = (userId: string) => {
    if (!eventData?.isClosed) {
      setSelectedIds((current) =>
        current.includes(userId)
          ? current.filter((id) => id !== userId)
          : [...current, userId]
      );
    }
  };

  const handleSave = async (finalize: boolean) => {
    if (!eventData) return;

    setError(null);
    setIsSaving(finalize ? false : true);
    setIsFinalizing(finalize ? true : false);

    try {
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendedUserIds: selectedIds,
          finalize,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Erro ao salvar a lista de presença.");
      }

      const updatedAttended = Array.isArray(body?.data?.attended) ? body.data.attended : [];
      setEventData((previous) =>
        previous ? { ...previous, attended: updatedAttended, isClosed: finalize ? true : previous.isClosed } : previous
      );

      if (finalize) {
        toast.success("Evento finalizado. Usuários ausentes foram penalizados conforme definido.");
      } else {
        toast.success("Rascunho salvo com sucesso.");
      }
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
      setIsFinalizing(false);
      setDialogOpen(false);
    }
  };

  const missingCount = eventData
    ? eventData.participants.filter((participant) => !selectedIds.includes(participant._id)).length
    : 0;

  const canEdit = status === "authenticated" && !eventData?.isClosed;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Lista de Presença</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando participantes...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : !eventData ? (
            <p className="text-muted-foreground">Evento não encontrado.</p>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Evento: <span className="font-medium text-foreground">{eventData.title}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Confirmados: <span className="font-medium text-foreground">{eventData.participants.length}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Ausentes marcados: <span className="font-medium text-foreground">{missingCount}</span>
                </p>
                {eventData.isClosed ? (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    Evento encerrado. Não é possível editar esta lista.
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                {eventData.participants.map((participant) => {
                  const isChecked = selectedIds.includes(participant._id);
                  return (
                    <label
                      key={participant._id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                        canEdit ? "hover:border-primary" : "opacity-70"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-foreground">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                      </div>
                      <Checkbox
                        checked={isChecked}
                        disabled={!canEdit}
                        onCheckedChange={() => handleToggle(participant._id)}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Atualize a lista de presença e clique em "Salvar Rascunho" para guardar o progresso.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quando estiver pronto para encerrar o evento, use "Finalizar Evento" para banir os ausentes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={!canEdit || isSaving || isFinalizing}
                  >
                    {isSaving ? "Salvando..." : "Salvar Rascunho"}
                  </Button>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-red-600 text-white hover:bg-red-700 border-0"
                        disabled={!canEdit || isSaving || isFinalizing}
                      >
                        {isFinalizing ? "Finalizando..." : "Finalizar Evento (Bloquear Faltosos)"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tem certeza?</DialogTitle>
                        <DialogDescription>
                          Esta ação é irreversível e banirá os usuários ausentes da plataforma de forma definitiva.
                          Certifique-se de revisar a lista antes de confirmar.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="secondary"
                          onClick={() => setDialogOpen(false)}
                          disabled={isFinalizing}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="bg-red-600 text-white hover:bg-red-700 border-0"
                          onClick={() => handleSave(true)}
                          disabled={isFinalizing}
                        >
                          Confirmar e Finalizar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
