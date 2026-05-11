"use client";

import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Descubra sessões de cinema gratuitas perto de você
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Conectamos você a eventos culturais organizados por ONGs. Cinema ao
            ar livre, oficinas e projetos sociais que transformam comunidades.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg shadow-primary/5 sm:flex-row sm:items-center sm:p-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cidade ou bairro"
                className="border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
              />
            </div>
            
            <div className="h-px w-full bg-border sm:h-8 sm:w-px" />
            
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <Select>
                <SelectTrigger className="border-0 bg-transparent pl-10 text-base shadow-none focus:ring-0 [&>span]:text-muted-foreground data-[state=open]:[&>span]:text-foreground">
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="cinema">Cinema gratuito</SelectItem>
                  <SelectItem value="oficinas">Oficinas</SelectItem>
                  <SelectItem value="projetos">Projetos sociais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button size="lg" className="gap-2 px-6 sm:px-8">
              <Search className="h-4 w-4" />
              <span className="sm:inline">Buscar</span>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">150+</p>
            <p className="text-sm text-muted-foreground">ONGs parceiras</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">500+</p>
            <p className="text-sm text-muted-foreground">Eventos realizados</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">50k+</p>
            <p className="text-sm text-muted-foreground">Pessoas impactadas</p>
          </div>
        </div>
      </div>
    </section>
  );
}
