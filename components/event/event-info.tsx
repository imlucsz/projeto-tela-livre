"use client";

import { useEffect, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

export function EventInfo({ event }: { event: any }) {
  const [isParticipating, setIsParticipating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);

      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!mounted || !data?.user) return;

        const savedEvents = Array.isArray(data.user.savedEvents) ? data.user.savedEvents : [];
        const participatingEvents = Array.isArray(data.user.participatingEvents)
          ? data.user.participatingEvents
          : [];

        const saved = savedEvents.some(
          (item: any) => item?._id?.toString() === event.id || item?.id === event.id
        );
        const participating = participatingEvents.some(
          (item: any) => item?._id?.toString() === event.id || item?.id === event.id
        );

        setIsSaved(saved);
        setIsParticipating(participating);
      } catch (error) {
        // ignore: usuário possivelmente não está logado
      } finally {
        if (mounted) setIsLoadingStatus(false);
      }
    }

    loadUserStatus();

    return () => {
      mounted = false;
    };
  }, [event.id]);

  const handleConfirmParticipation = async () => {
    setActionLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/events/${event.id}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const body = await response.json();
      if (!response.ok) {
        setErrorMessage(body?.error || "Não foi possível confirmar a participação.");
        return;
      }

      setIsParticipating(true);
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMessage("Erro ao confirmar participação. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/events/${event.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const body = await response.json();
      if (!response.ok) {
        setErrorMessage(body?.error || "Não foi possível salvar o evento.");
        return;
      }

      setIsSaved(!isSaved);
    } catch (error) {
      setErrorMessage("Erro ao salvar evento. Tente novamente.");
    } finally {
      setSaveLoading(false);
    }
  };

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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  variant={isParticipating ? "secondary" : "default"}
                  disabled={isParticipating || isLoadingStatus}
                >
                  <Users className="h-4 w-4" />
                  {isParticipating ? "Participando" : "Participar"}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Termo de participação</DialogTitle>
                  <DialogDescription>
                    Ao confirmar, você se compromete a comparecer. Cancelamentos devem ser feitos com 3 dias de antecedência. O não comparecimento resultará em banimento da plataforma.
                  </DialogDescription>
                </DialogHeader>
                {errorMessage ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </p>
                ) : null}
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmParticipation}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Confirmando..." : "Eu concordo"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              size="lg"
              variant={isSaved ? "secondary" : "outline"}
              className="flex-1 gap-2"
              onClick={handleToggleSave}
              disabled={saveLoading}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
              {isSaved ? "Salvo" : "Salvar evento"}
            </Button>
          </div>
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
