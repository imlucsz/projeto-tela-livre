"use client";

import { useState } from "react";
import { Save, X, Upload, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardCreateEventProps {
  onCancel: () => void;
}

export function DashboardCreateEvent({ onCancel }: DashboardCreateEventProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    console.log("Form submitted:", formData);
    onCancel();
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Criar Novo Evento</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do evento</Label>
              <Input
                id="title"
                placeholder="Ex: Cinema ao Ar Livre - Clássicos Brasileiros"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o evento, público-alvo e atividades..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Imagem do evento</Label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors hover:border-primary/50 hover:bg-muted">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Arraste uma imagem ou clique para fazer upload
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG até 5MB. Recomendado: 1200x630px
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-2" type="button">
                    <Upload className="h-4 w-4" />
                    Selecionar arquivo
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinema">Cinema gratuito</SelectItem>
                  <SelectItem value="oficinas">Oficina</SelectItem>
                  <SelectItem value="projetos">Projeto social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                placeholder="Ex: Praça da Sé"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço completo</Label>
              <Input
                id="address"
                placeholder="Ex: Praça da Sé, s/n - Centro, São Paulo - SP"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Salvar evento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
