"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, ExternalLink, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import Link from "next/link";
import Image from "next/image";

const categoryLabels: Record<string, string> = {
  cinema: "Cinema gratuito",
  oficinas: "Oficina",
  projetos: "Projeto social",
};

export function ProfileParticipatingEvents() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const participatingEvents: any[] = [];

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Meus Ingressos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 rounded-lg border border-border p-4">
                <div className="h-24 w-32 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (participatingEvents.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Ticket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Você ainda não está participando de nenhum evento
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Explore os eventos disponíveis e confirme sua participação.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Explorar eventos</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Meus Ingressos ({participatingEvents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participatingEvents.map((event) => {
            const formattedDate = new Date(event.date).toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-gradient-to-r from-primary/5 to-transparent p-4 sm:flex-row"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-36">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                    <Ticket className="h-8 w-8 text-background" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {event.title}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">
                        {categoryLabels[event.category]}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Confirmado
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/event/${event.id}`}>
                        Ver detalhes
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
