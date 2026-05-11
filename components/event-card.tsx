"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/mock-data";
import { useState } from "react";

const categoryLabels = {
  cinema: "Cinema gratuito",
  oficinas: "Oficina",
  projetos: "Projeto social",
};

const categoryColors = {
  cinema: "bg-primary/10 text-primary hover:bg-primary/20",
  oficinas: "bg-accent/10 text-accent hover:bg-accent/20",
  projetos: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
};

export function EventCard({ event }: { event: Event }) {
  const [saved, setSaved] = useState(false);

  const formattedDate = new Date(event.date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved(!saved);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
        >
          <Bookmark
            className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
        <Badge
          variant="secondary"
          className={`absolute left-3 top-3 border-0 ${categoryColors[event.category]}`}
        >
          {categoryLabels[event.category]}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {formattedDate} às {event.time}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={event.ngo.logo}
              alt={event.ngo.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {event.ngo.name}
            </span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/event/${event.id}`}>Participar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <CardContent className="p-4">
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-3 flex flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
