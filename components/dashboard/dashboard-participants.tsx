"use client";

import { useState, useEffect } from "react";
import { Search, Download, Mail, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockEvents } from "@/lib/mock-data";

export function DashboardParticipants() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const ngoEvents = mockEvents.filter((e) => e.ngo.name === "Instituto Cultura Viva");

  const allParticipants = ngoEvents.flatMap((event) =>
    event.participants.map((p) => ({
      ...p,
      eventId: event.id,
      eventTitle: event.title,
      type: "participant" as const,
    }))
  );

  const allVolunteers = ngoEvents.flatMap((event) =>
    event.volunteers.map((v) => ({
      ...v,
      eventId: event.id,
      eventTitle: event.title,
      type: "volunteer" as const,
    }))
  );

  const allPeople = [...allParticipants, ...allVolunteers];

  const filteredPeople = allPeople.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent =
      selectedEvent === "all" || person.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allPeople.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum participante ainda
          </h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Quando pessoas se inscreverem nos seus eventos, elas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Participantes ({allPeople.length})</CardTitle>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar lista
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os eventos</SelectItem>
              {ngoEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title.slice(0, 30)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum resultado encontrado para sua busca.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map((person) => (
              <div
                key={`${person.type}-${person.id}`}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{person.name}</p>
                      <Badge
                        variant={person.type === "volunteer" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {person.type === "volunteer" ? "Voluntário" : "Participante"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Evento</p>
                    <p className="text-sm text-foreground line-clamp-1 max-w-[180px]">
                      {person.eventTitle}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
