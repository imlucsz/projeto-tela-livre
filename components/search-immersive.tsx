"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, MapPin, Calendar, Music, Theater, Trophy, Film, Users, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

// Categorias baseadas nos dados
const CATEGORIES = [
  { name: "Cinema", icon: Film, color: "bg-red-100 text-red-600", key: "cinema" },
  { name: "Oficinas", icon: BookOpen, color: "bg-blue-100 text-blue-600", key: "oficinas" },
  { name: "Projetos", icon: Users, color: "bg-green-100 text-green-600", key: "projetos" },
];

interface SearchImmersiveProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchImmersive({ isOpen: externalIsOpen, onOpenChange }: SearchImmersiveProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();

  // Debouncing para performance
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Bloqueia o scroll do body quando o search está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Atalho de teclado (ESC para fechar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtrar eventos baseado na query
  const filteredEvents = useMemo(() => {
    if (!debouncedQuery) return events.slice(0, 4); // Mostra primeiros 4 se sem query
    return events.filter(event =>
      event.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      (event.category || '').toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      (event.location || '').toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      ((event.genre || '') as string).toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 8); // Limita a 8 resultados
  }, [debouncedQuery]);

  // Carrega eventos aprovados uma vez (para busca local)
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/events?approved=true');
        const json = await res.json();
        if (mounted && json?.success) {
          const normalized = (json.data || []).map((e: any) => ({ ...e, id: e._id || e.id }));
          setEvents(normalized);
        }
      } catch (e) {
        console.error('Erro ao carregar eventos para busca:', e);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const handleEventClick = (eventId: string) => {
    setIsOpen(false);
    router.push(`/event/${eventId}`);
  };

  const handleCategoryClick = (category: string) => {
    setIsOpen(false);
    router.push(`/?category=${category}`);
  };

  return (
    <>
      {/* TRIGGER */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative w-full max-w-2xl mx-auto cursor-pointer group"
      >
        <div className="flex items-center w-full h-14 px-5 bg-white border border-border rounded-full shadow-sm group-hover:shadow-md transition-all duration-300">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <span className="text-muted-foreground flex-1">Buscar eventos, shows, teatros...</span>
          <div className="hidden md:flex items-center px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-mono">
            QUALQUER LUGAR
          </div>
        </div>
      </div>

      {/* OVERLAY IMERSIVO */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            {/* Header da Busca */}
            <div className="w-full border-b bg-white p-4">
              <div className="max-w-5xl mx-auto flex items-center gap-4">
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-4 w-6 h-6 text-primary" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="O que você está procurando?"
                    className="w-full h-14 pl-14 pr-4 text-xl outline-none bg-transparent"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-8 h-8 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Painel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-y-auto p-6 md:p-12"
            >
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

                {/* Coluna 1: Categorias */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Categorias</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.key)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                      >
                        <div className={`p-3 rounded-lg ${cat.color} group-hover:scale-110 transition-transform`}>
                          <cat.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-slate-700">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coluna 2 e 3: Eventos */}
                <div className="md:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {debouncedQuery ? "Resultados da Busca" : "Eventos em Destaque"}
                    </h4>
                    <button
                      onClick={() => { setIsOpen(false); router.push("/"); }}
                      className="text-primary text-sm font-semibold hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event.id)}
                        className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="w-24 h-24 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <span className="text-xs font-bold text-primary uppercase">{event.category}</span>
                          <h5 className="font-bold text-slate-800 line-clamp-2">{event.title}</h5>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredEvents.length === 0 && debouncedQuery && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-slate-500">Nenhum evento encontrado para "{debouncedQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}