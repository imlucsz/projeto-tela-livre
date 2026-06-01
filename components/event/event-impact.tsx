"use client";

import { Users, Building2, Film, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "@/lib/mock-data";
import { useState, useEffect } from "react";

interface ImpactData {
  people: number;
  communities: number;
  sessions: number;
  isSystemEvent?: boolean;
  message?: string;
}

export function EventImpact({ event }: { event: Event }) {
  const [impact, setImpact] = useState<ImpactData>({
    people: event.impact.people || 0,
    communities: event.impact.communities || 0,
    sessions: event.impact.sessions || 0,
    isSystemEvent: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadImpact() {
      try {
        const res = await fetch(`/api/events/${event.id}/impact`);
        const json = await res.json();

        if (mounted && json?.success) {
          setImpact(json.data);
        }
      } catch (e) {
        console.error('Erro ao carregar impacto:', e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadImpact();
    return () => {
      mounted = false;
    };
  }, [event.id]);

  const impactStats = [
    {
      label: "Pessoas impactadas",
      value: impact.people.toLocaleString("pt-BR"),
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Comunidades atendidas",
      value: impact.communities,
      icon: Building2,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "Sessões realizadas",
      value: impact.sessions,
      icon: Film,
      color: "bg-chart-3/10 text-chart-3",
    },
  ];

  return (
    <div className="sticky top-24 space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Impacto Social</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {impact.isSystemEvent ? (
            <p className="text-sm text-muted-foreground">
              {impact.message || 'Este é um evento do sistema'}
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Esta ONG já transformou a vida de milhares de pessoas através de
                seus projetos culturais.
              </p>

              <div className="space-y-3">
                {impactStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
                    >
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {loading ? '...' : stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground">
            Quer ajudar ainda mais?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Além de participar, você pode contribuir como voluntário ou fazer
            uma doação para apoiar mais eventos como este.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
