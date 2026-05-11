"use client"

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Calendar, Plus, Users, BarChart3 } from "lucide-react";


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";




interface DashboardSidebarProps {
  activeTab: "events" | "create" | "participants";
  setActiveTab: (tab: "events" | "create" | "participants") => void;
}

export function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ events: 0, participants: 0 });

  const user = session?.user;
  
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/events?createdBy=${user.id}`)
        .then(res => res.json())
        .then(({ events }) => {
          const totalParticipants = events.reduce((acc: number, e: any) => acc + (e.participants?.length || 0), 0);
          setStats({ events: events.length, participants: totalParticipants });
        })
        .catch(() => setStats({ events: 0, participants: 0 }));
    }
  }, [user?.id]);

  const menuItems = [
    { id: "events" as const, label: "Meus Eventos", icon: Calendar, count: stats.events },
    { id: "create" as const, label: "Criar Evento", icon: Plus },
    { id: "participants" as const, label: "Participantes", icon: Users, count: stats.participants },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">

            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-muted to-accent flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.events}</p>
              <p className="text-xs text-muted-foreground">Eventos</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3 text-center">
              <p className="text-2xl font-bold text-accent">{stats.participants}</p>
              <p className="text-xs text-muted-foreground">Inscritos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-2">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  activeTab === item.id ? "bg-secondary" : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.count !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.count}
                  </span>
                )}
              </Button>
            ))}
          </nav>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Impacto total</p>
              <p className="text-2xl font-bold text-primary">{stats.participants || 0}</p>
              <p className="text-xs text-muted-foreground">pessoas alcançadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

