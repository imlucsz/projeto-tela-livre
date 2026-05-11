"use client";

import { Calendar, Clock, MapPin, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Event } from "@/lib/mock-data";
import { useState } from "react";

export function EventInfo({ event }: { event: Event }) {
  const [isParticipating, setIsParticipating] = useState(false);
  const [isVolunteering, setIsVolunteering] = useState(false);

  const formattedDate = new Date(event.date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
                  <p className="font-medium capitalize text-foreground">
                    {formattedDate}
                  </p>
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
              <span>{event.participants.length} participantes</span>
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
              <p className="mt-1 text-sm text-muted-foreground">
                {event.address}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={() => setIsParticipating(!isParticipating)}
              variant={isParticipating ? "secondary" : "default"}
            >
              <Users className="h-4 w-4" />
              {isParticipating ? "Participando" : "Participar"}
            </Button>
            <Button
              size="lg"
              variant={isVolunteering ? "secondary" : "outline"}
              className="flex-1 gap-2"
              onClick={() => setIsVolunteering(!isVolunteering)}
            >
              <Heart
                className={`h-4 w-4 ${isVolunteering ? "fill-primary text-primary" : ""}`}
              />
              {isVolunteering ? "Voluntário confirmado" : "Quero ser voluntário"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Sobre o evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {event.description}
          </p>
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
