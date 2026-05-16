"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Zod schema
const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100),
  description: z.string().max(1000, "Descrição muito longa").optional().default(""),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Hora é obrigatória"),
  location: z.string().max(100).optional().default(""),
  address: z.string().max(300).optional().default(""),
  image: z.string().url("URL válida").optional().default(""),
  category: z.enum(["CINEMA", "OFICINAS", "PROJETOS"]).default("CINEMA"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  address?: string;
  image?: string;
  category: string;
}


interface EventCreationFormProps {
  initialEvent?: Event | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EventCreationForm({
  initialEvent,
  onSuccess,
  onCancel,
}: EventCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialEvent;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialEvent
      ? {
          title: initialEvent.title,
          description: initialEvent.description,
          date: new Date(initialEvent.date).toISOString().split("T")[0],
          time: new Date(initialEvent.date).toTimeString().split(" ")[0],
location: initialEvent.location,
          address: initialEvent.address ?? "",
          image: initialEvent.image,

          category: (initialEvent.category.toUpperCase() as any) || "CINEMA",
        }
      : {
          title: "",
          description: "",
          date: "",
          time: "14:00",
          location: "",
          address: "",
          image: "",
          category: "CINEMA",
        },
  });

  const category = watch("category");
  const imageUrl = watch("image");

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      // Combinar data + hora
      const dateTime = new Date(`${data.date}T${data.time}`).toISOString();

      const payload = {
        ...data,
        date: dateTime,
        category: data.category.toLowerCase(),
      };

      const endpoint = isEditing ? `/api/events/${initialEvent._id}` : "/api/events";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        const message = error.errors?.[0]?.message || error.error || "Erro ao salvar evento";
        toast.error(message);
        return;
      }

      toast.success(isEditing ? "Evento atualizado!" : "Evento criado com sucesso!");
      reset();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar evento");
    } finally {
      setIsLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    CINEMA: "🎬 Cinema",
    OFICINAS: "🎨 Oficinas",
    PROJETOS: "💡 Projetos",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-xl font-semibold text-white">
        {isEditing ? "Editar Evento" : "Criar Novo Evento"}
      </h3>

      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-amber-200">
          Categoria
        </Label>
        <Select value={category} onValueChange={(value) => setValue("category", value as any)}>
          <SelectTrigger id="category" className="bg-black/20 border-amber-500/20 text-white">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CINEMA">{categoryLabels.CINEMA}</SelectItem>
            <SelectItem value="OFICINAS">{categoryLabels.OFICINAS}</SelectItem>
            <SelectItem value="PROJETOS">{categoryLabels.PROJETOS}</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-400">{errors.category.message}</p>}
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-amber-200">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: O Auto da Compadecida"
          {...register("title")}
          disabled={isLoading}
          className="bg-black/20 border-amber-500/20 text-white placeholder:text-amber-200/40"
        />
        {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-amber-200">
          Descrição
        </Label>
        <textarea
          id="description"
          placeholder="Descrição detalhada do evento (opcional)"
          {...register("description")}
          disabled={isLoading}
          rows={4}
          className="flex w-full rounded-md border border-amber-500/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-amber-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
        />
        {errors.description && <p className="text-sm text-red-400">{errors.description.message}</p>}
      </div>

      {/* Data e Hora */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-amber-200">
            Data <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            disabled={isLoading}
            className="bg-black/20 border-amber-500/20 text-white"
          />
          {errors.date && <p className="text-sm text-red-400">{errors.date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time" className="text-amber-200">
            Hora <span className="text-red-500">*</span>
          </Label>
          <Input
            id="time"
            type="time"
            {...register("time")}
            disabled={isLoading}
            className="bg-black/20 border-amber-500/20 text-white"
          />
          {errors.time && <p className="text-sm text-red-400">{errors.time.message}</p>}
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-amber-200">
          Localização (Local Popular)
        </Label>
        <Input
          id="location"
          placeholder="Ex: Centro Comunitário São Paulo"
          {...register("location")}
          disabled={isLoading}
          className="bg-black/20 border-amber-500/20 text-white placeholder:text-amber-200/40"
        />
        {errors.location && <p className="text-sm text-red-400">{errors.location.message}</p>}
      </div>

      {/* Endereço */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-amber-200">
          Endereço Completo
        </Label>
        <Input
          id="address"
          placeholder="Ex: Rua das Flores, 123 - Zona Leste, São Paulo"
          {...register("address")}
          disabled={isLoading}
          className="bg-black/20 border-amber-500/20 text-white placeholder:text-amber-200/40"
        />
        {errors.address && <p className="text-sm text-red-400">{errors.address.message}</p>}
      </div>

      {/* URL da Imagem */}
      <div className="space-y-2">
        <Label htmlFor="image" className="text-amber-200">
          URL da Imagem (Poster)
        </Label>
        <Input
          id="image"
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          {...register("image")}
          disabled={isLoading}
          className="bg-black/20 border-amber-500/20 text-white placeholder:text-amber-200/40"
        />
        {errors.image && <p className="text-sm text-red-400">{errors.image.message}</p>}

        {/* Preview da Imagem */}
        {imageUrl && (
          <div className="mt-3">
            <img
              src={imageUrl}
              alt="preview"
              className="max-w-xs h-auto rounded-lg border border-amber-500/20"
              onError={() => toast.error("Erro ao carregar imagem")}
            />
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-6 border-t border-amber-500/20">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0"
        >
          {isLoading
            ? isEditing
              ? "Atualizando..."
              : "Criando..."
            : isEditing
            ? "Atualizar Evento"
            : "Criar Evento"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="text-amber-200 hover:bg-amber-500/10"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
