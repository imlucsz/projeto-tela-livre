"use client";

import Image from "next/image";
import { ArrowLeft, Share2, Bookmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/mock-data";
import Link from "next/link";
import { useState } from "react";

const categoryLabels = {
  cinema: "Cinema gratuito",
  oficinas: "Oficina",
  projetos: "Projeto social",
};

export function EventBanner({ event }: { event: Event }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative">
      <div className="relative h-[300px] sm:h-[400px] lg:h-[450px]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/20" />
      </div>

      <div className="absolute left-0 right-0 top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {(event.participantCount ?? 0) > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium text-foreground">
                <Users className="h-4 w-4" />
                <span>{event.participantCount} participantes</span>
              </div>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => setSaved(!saved)}
            >
              <Bookmark
                className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
              />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Badge
            variant="secondary"
            className="mb-4 border-0 bg-primary/90 text-primary-foreground"
          >
            {categoryLabels[event.category]}
          </Badge>
          <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-background sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <Image
              src={event.ngo.logo}
              alt={event.ngo.name}
              width={40}
              height={40}
              className="rounded-full border-2 border-background/20"
            />
            <div>
              <p className="font-medium text-background">{event.ngo.name}</p>
              <p className="text-sm text-background/70">Organizador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
