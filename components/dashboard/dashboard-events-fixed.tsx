"use client"

import { useState, useEffect } from "react";
import type { Event } from "./types";


import { useSession } from "next-auth/react";
import { Calendar, MapPin, Users, MoreHorizontal, Edit, Trash2, Eye, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";


const categoryLabels: Record<string, string> = {
  cinema: "Cinema gratuito",
  oficinas: "Oficina",
  projetos: "Projeto social",
};


interface DashboardEventsProps {
  onEdit: () => void;
}

export function DashboardEvents({ onEdit }: DashboardEventsProps) {
  const [isLoading, setIsLoading] = useState(true);

  const [ngoEvents, setNgoEvents] = useState<Event[]>([]);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchEvents = async () => {
      const res = await fetch(`/api/events?ong=${userId}`);
      const { events } = await res.json();
      setNgoEvents(events || []);
    };
    fetchEvents();
  }, [userId]);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Meus Eventos</CardTitle>
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

  if (ngoEvents.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum evento criado
          </h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Você ainda não criou nenhum evento. Comece agora!
          </p>
          <Button className="mt-6 gap-2" onClick={onEdit}>
            <Plus className="h-4 w-4" />
            Criar primeiro evento
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Meus Eventos</CardTitle>
        <Button size="sm" className="gap-2" onClick={onEdit}>
          <Plus className="h-4 w-4" />
          Novo evento
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ngoEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row"
            >
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-2">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {event.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0">
                      {categoryLabels[event.category]}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(event.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.participants.length} inscritos
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/event/${event.id}`}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Ver
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

