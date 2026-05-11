"use client";

import { Film, GraduationCap, HeartHandshake, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const categories = [
  {
    id: "cinema",
    name: "Cinema gratuito",
    description: "Sessões de cinema ao ar livre e em espaços comunitários",
    icon: Film,
    color: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    count: 24,
  },
  {
    id: "oficinas",
    name: "Oficinas",
    description: "Aprenda produção audiovisual, roteiro e mais",
    icon: GraduationCap,
    color: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
    count: 18,
  },
  {
    id: "projetos",
    name: "Projetos sociais",
    description: "Iniciativas que transformam comunidades através do cinema",
    icon: HeartHandshake,
    color: "bg-chart-3/10 text-chart-3 group-hover:bg-chart-3 group-hover:text-background",
    count: 12,
  },
];

export function CategoriesSection() {
  return (
    <section id="categorias" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explore por categoria
            </h2>
            <p className="mt-2 text-muted-foreground">
              Encontre o tipo de evento perfeito para você
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/?category=${category.id}`}>
              <Card className="group cursor-pointer border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex items-start gap-4 p-6">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${category.color}`}
                  >
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-primary">
                      {category.count} eventos disponíveis
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
