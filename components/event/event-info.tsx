"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function EventInfo({ event }: { event: any }) {
  const eventId = useMemo(() => event?.id ?? event?._id, [event]);

  const [isParticipating, setIsParticipating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [participationLoading, setParticipationLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [inlineError, setInlineError] = useState<string | null>(null);

  const formattedDate = new Date(event.date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    let mounted = true;

    async function loadUserStatus() {
      setIsLoadingStatus(true);
      setInlineError(null);

      try {
        const response = await fetch("/api/users/me", {
          credentials: "include",
        });

        // Se não estiver logado, o endpoint deve retornar 401.
        if (!response.ok) return;

        const data = await response.json();
        if (!mounted || !data?.user) return;

        const savedEvents = Array.isArray(data.user.savedEvents)
          ? data.user.savedEvents
          : [];
        const participatingEvents = Array.isArray(data.user.participatingEvents)
          ? data.user.participatingEvents
          : [];

        const saved = savedEvents.some(
          (item: any) => item?._id?.toString() === eventId?.toString() || item?.id === eventId
        );
        const participating = participatingEvents.some(
          (item: any) =>
            item?._id?.toString() === eventId?.toString() || item?.id === eventId
        );

        setIsSaved(saved);
        setIsParticipating(participating);
      } catch {
        // ignora
      } finally {
        if (mounted) setIsLoadingStatus(false);
      }
    }

    if (eventId) loadUserStatus();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleConfirmParticipation = async () => {
    if (!eventId) return;

    setParticipationLoading(true);
    setInlineError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setInlineError(body?.error || "Não foi possível confirmar a participação.");
        return;
      }

      setIsParticipating(true);
      setIsDialogOpen(false);
      toast.success("Participação confirmada!");
    } catch {
      setInlineError("Erro ao confirmar participação. Tente novamente.");
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleToggleParticipation = async () => {
    if (!eventId) return;

    setInlineError(null);

    if (!isParticipating) {
      // abre modal de responsabilidade
      setIsDialogOpen(true);
      return;
    }

    // cancelamento
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: "DELETE",
        credentials: "include",
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403) {
          const message =
            body?.error ||
            "Prazo de cancelamento expirou. Cancelamentos só são permitidos com 3 dias de antecedência.";
          toast.error(message);
          setInlineError(message);
          return;
        }

        const message = body?.error || "Erro ao cancelar participação.";
        toast.error(message);
        setInlineError(message);
        return;
      }

      setIsParticipating(false);
      toast.success("Participação cancelada com sucesso.");
    } catch {
      const message = "Erro ao cancelar participação. Tente novamente.";
      toast.error(message);
      setInlineError(message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!eventId || saveLoading) return;

    setSaveLoading(true);
    setInlineError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/save`, {
        method: "POST",
        credentials: "include",
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = body?.error || "Não foi possível salvar o evento.";
        toast.error(message);
        setInlineError(message);
        return;
      }

      // A rota alterna no backend; no frontend, invertimos o estado.
      setIsSaved((prev) => !prev);
      toast.success(body?.message || (isSaved ? "Removido" : "Salvo"));
    } catch {
      const message = "Erro ao salvar evento. Tente novamente.";
      toast.error(message);
      setInlineError(message);
    } finally {
      setSaveLoading(false);
    }
  };

  const cancelDisabled = !isParticipating || cancelLoading || isLoadingStatus;
  const participateDisabled = isLoadingStatus || participationLoading;

  return (
    <div className="space-y-8">
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium capitalize text-foreground">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">{event.time}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.participants?.length ?? 0} participantes</span>
            </div>

          </div>

          <Separator className="my-6" />

          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Local</p>
              <p className="font-medium text-foreground">{event.location}</p>
              <p className="mt-1 text-sm text-muted-foreground">{event.address}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              variant={isParticipating ? "secondary" : "default"}
              onClick={handleToggleParticipation}
              disabled={isLoadingStatus || participationLoading || cancelLoading}
            >
              <Users className="h-4 w-4" />
              {cancelLoading ? "Cancelando..." : isParticipating ? "Participando" : "Participar"}
            </Button>

            <Button
              size="lg"
              variant={isSaved ? "secondary" : "outline"}
              className="flex-1 gap-2"
              onClick={handleToggleSave}
              disabled={saveLoading || isLoadingStatus}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
              {saveLoading ? "Salvando..." : isSaved ? "Salvo" : "Salvar evento"}
            </Button>
          </div>

          {inlineError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {inlineError}
            </div>
          ) : null}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atenção</DialogTitle>
                <DialogDescription>
                  Ao confirmar, você se compromete a comparecer. Cancelamentos só são permitidos com 3 dias de antecedência.
                  Faltar sem aviso prévio resultará no seu banimento permanente da plataforma.
                </DialogDescription>
              </DialogHeader>

              {inlineError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {inlineError}
                </p>
              ) : null}

              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={participationLoading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleConfirmParticipation} disabled={participateDisabled}>
                  {participationLoading ? "Confirmando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Sobre o evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">{event.description}</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Sobre a ONG</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <img
              src={event.ngo.logo}
              alt={event.ngo.name}
              className="h-16 w-16 rounded-xl"
            />
            <div>
              <h3 className="font-semibold text-foreground">{event.ngo.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {event.ngo.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

