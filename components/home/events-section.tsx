"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard, EventCardSkeleton } from "@/components/event-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EventsSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/events?approved=true');
        const json = await res.json();
        if (mounted && json?.success) {
          const normalized = (json.data || []).map((e: any) => ({ ...e, id: e._id || e.id }));
          setEvents(normalized);
        }
      } catch (e) {
        console.error('Erro ao carregar eventos:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const filteredEvents =
    activeTab === "all" ? events : events.filter((event) => event.category === activeTab);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Próximos eventos
            </h2>
            <p className="mt-2 text-muted-foreground">
              Participe de experiências culturais transformadoras
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:grid-cols-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Todos
              </TabsTrigger>
              <TabsTrigger value="cinema" className="text-xs sm:text-sm">
                Cinema
              </TabsTrigger>
              <TabsTrigger value="oficinas" className="text-xs sm:text-sm">
                Oficinas
              </TabsTrigger>
              <TabsTrigger value="projetos" className="text-xs sm:text-sm">
                Projetos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ChevronRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Nenhum evento encontrado
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Não há eventos nesta categoria no momento.
              </p>
            </div>
          )}
        </div>

        {!isLoading && filteredEvents.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" className="gap-2">
              Ver mais eventos
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
