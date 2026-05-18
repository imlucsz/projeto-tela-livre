"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCard, EventCardSkeleton } from "@/components/event-card";


export function ProfileSavedEvents() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const savedEvents: any[] = [];

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Eventos Salvos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedEvents.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum evento salvo
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Salve eventos que você tem interesse para encontrá-los facilmente depois.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Eventos Salvos ({savedEvents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {savedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
