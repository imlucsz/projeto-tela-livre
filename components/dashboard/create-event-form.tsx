'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Zod schema validation
const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .default(''),
  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'A data deve ser no futuro'),
  image: z
    .string()
    .url('URL da imagem deve ser válida')
    .optional()
    .default(''),
  location: z
    .string()
    .max(100, 'Localização deve ter no máximo 100 caracteres')
    .optional()
    .default(''),
  genre: z
    .enum(['geral','comedia','drama','infantil','animacao','documentario','acao','romance','ficcao'])
    .default('geral'),
  category: z
    .enum(['cinema', 'oficinas', 'projetos'])
    .default('cinema'),
})

type CreateEventFormData = z.infer<typeof createEventSchema>

export function CreateEventForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      image: '',
      location: '',
      category: 'cinema',
      genre: 'geral',
    },
  })

  const category = watch('category')
  const genre = watch('genre')

  const onSubmit = async (data: CreateEventFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMessage =
          error.errors?.[0]?.message ||
          error.error ||
          'Erro ao criar evento'
        toast.error(errorMessage)
        return
      }

      const result = await response.json()
      toast.success('Evento criado com sucesso!')
      reset()
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Erro ao criar evento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Filme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Filme</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do filme que deseja adicionar ao acervo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(value) => setValue('category', value as any)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cinema">Cinema</SelectItem>
                <SelectItem value="oficinas">Oficinas</SelectItem>
                <SelectItem value="projetos">Projetos</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Gênero */}
          <div className="space-y-2">
            <Label htmlFor="genre">Gênero</Label>
            <Select value={genre} onValueChange={(value) => setValue('genre', value as any)}>
              <SelectTrigger id="genre">
                <SelectValue placeholder="Selecione um gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="comedia">Comédia</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="infantil">Infantil</SelectItem>
                <SelectItem value="animacao">Animação</SelectItem>
                <SelectItem value="documentario">Documentário</SelectItem>
                <SelectItem value="acao">Ação</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="ficcao">Ficção Científica</SelectItem>
              </SelectContent>
            </Select>
            {errors.genre && (
              <p className="text-sm text-red-500">{errors.genre.message}</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Digite o título do filme"
              {...register('title')}
              disabled={isLoading}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              placeholder="Digite a descrição do filme (opcional)"
              {...register('description')}
              disabled={isLoading}
              rows={4}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Data <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="datetime-local"
              {...register('date')}
              disabled={isLoading}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              placeholder="Local do evento (opcional)"
              {...register('location')}
              disabled={isLoading}
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="image">URL da Imagem</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg (opcional)"
              {...register('image')}
              disabled={isLoading}
              className={errors.image ? 'border-red-500' : ''}
            />
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                reset()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <span className="mr-2 animate-spin">⏳</span>}
              {isLoading ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
