"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Film, Calendar, MapPin, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCreationForm from "@/components/dashboard/event-creation-form";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  address?: string;
  category: string;

  image?: string;
  approved: boolean;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function EventsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";
  const userId = (session?.user as any)?.id;

  // Buscar eventos apenas quando a sessão estiver pronta
  useEffect(() => {
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || `Erro ao buscar eventos (${response.status})`;
        throw new Error(message);
      }

      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Erro ao deletar evento");
      
      toast.success("Evento deletado com sucesso");
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar evento");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      cinema: "🎬 Cinema",
      oficinas: "🎨 Oficinas",
      projetos: "💡 Projetos",
    };
    return labels[category.toLowerCase()] || category;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Filmes & Sessões</h1>
          <p className="text-amber-200/60 mt-2">
            Crie e gerencie os eventos de sua {isAdmin ? "organização" : "ONG"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Evento
        </Button>
      </div>

      {/* Formulário de Criação/Edição */}
      {showForm && (
        <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
          <EventCreationForm
            initialEvent={editingEvent}
            onSuccess={() => {
              setShowForm(false);
              setEditingEvent(null);
              fetchEvents();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
          />
        </Card>
      )}

      {/* Lista de Eventos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {isAdmin ? "Todos os Eventos" : "Seus Eventos"}
        </h2>

        {status === "loading" || isLoading ? (
          <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
            <p className="text-amber-200/60 text-center py-8">Carregando eventos...</p>
          </Card>
        ) : events.length === 0 ? (
          <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
            <p className="text-amber-200/60 text-center py-12">
              {isAdmin
                ? "Nenhum evento encontrado"
                : "Você ainda não criou eventos. Clique em 'Novo Evento' para começar!"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card
                key={event._id}
                className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6 hover:bg-black/40 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Image */}
                  {event.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {event.title}
                        </h3>
                        <p className="text-amber-200/60 text-sm mt-1">
                          {event.description?.substring(0, 100)}
                          {event.description?.length > 100 ? "..." : ""}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <Badge
                          className={`${
                            event.approved
                              ? "bg-green-500/20 text-green-400 border-green-400/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                          }`}
                        >
                          {event.approved ? "✓ Aprovado" : "⏳ Pendente"}
                        </Badge>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30">
                          {getCategoryLabel(event.category)}
                        </Badge>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-amber-200/70 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-amber-400" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-400" />
                        {event.location || "Não especificado"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-400" />
                        {event.createdBy.name}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      {isAdmin || event.createdBy.name === session?.user?.name ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-400 hover:bg-amber-500/20"
                            onClick={() => {
                              setEditingEvent(event);
                              setShowForm(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/20"
                            onClick={() => handleDelete(event._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
