"use client";

import { Bookmark, Calendar, Settings, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface ProfileSidebarProps {
  activeTab: "saved" | "participating";
  setActiveTab: (tab: "saved" | "participating") => void;
}

export function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
  const { data: session } = useSession()
  const user = session?.user
  const savedCount = 0
  const participatingCount = 0

  const menuItems = [
    { id: "participating" as const, label: "Participando", icon: Calendar, count: participatingCount },
    { id: "saved" as const, label: "Eventos Salvos", icon: Bookmark, count: savedCount },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <span className="font-semibold text-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <h2 className="mt-4 font-semibold text-foreground">{user?.name || 'Usuário'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || 'email@email.com'}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{participatingCount}</p>
              <p className="text-xs text-muted-foreground">Participando</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3 text-center">
              <p className="text-2xl font-bold text-accent">{savedCount}</p>
              <p className="text-xs text-muted-foreground">Salvos</p>
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
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.count}
                </span>
              </Button>
            ))}

            <Separator className="my-2" />

            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
