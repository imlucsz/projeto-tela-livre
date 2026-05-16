'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Phone, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// Zod schema validation
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Email inválido'),
  subject: z
    .string()
    .min(5, 'Assunto deve ter no mínimo 5 caracteres')
    .max(200, 'Assunto deve ter no máximo 200 caracteres'),
  content: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      content: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Erro ao enviar mensagem')
        return
      }

      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      reset()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-black/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Entre em Contato
              </h2>
              <p className="text-xl text-amber-200/70">
                Tem uma pergunta ou interesse em parceria? Nos envie uma mensagem!
              </p>
            </div>

            <div className="space-y-6">
              {/* Contact Info Cards */}
              <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-lg flex-shrink-0">
                    <Mail className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Email</h3>
                    <a
                      href="mailto:contato@telalivre.org.br"
                      className="text-amber-400 hover:text-amber-300 transition"
                    >
                      contato@telalivre.org.br
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600/20 rounded-lg flex-shrink-0">
                    <Phone className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Telefone</h3>
                    <a
                      href="tel:+551133334444"
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      (11) 3333-4444
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right side - Form */}
          <Card className="backdrop-blur-xl bg-black/40 border border-amber-500/20 rounded-3xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-amber-100">
                  Nome Completo
                </label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  {...register('name')}
                  disabled={isLoading}
                  className={`bg-black/20 border ${
                    errors.name
                      ? 'border-red-500'
                      : 'border-amber-500/20'
                  } rounded-lg text-white placeholder:text-amber-200/40 focus:border-amber-500/40 focus:bg-black/30`}
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-amber-100">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  disabled={isLoading}
                  className={`bg-black/20 border ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-amber-500/20'
                  } rounded-lg text-white placeholder:text-amber-200/40 focus:border-amber-500/40 focus:bg-black/30`}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Assunto */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-amber-100">
                  Assunto
                </label>
                <Input
                  id="subject"
                  placeholder="Assunto da mensagem"
                  {...register('subject')}
                  disabled={isLoading}
                  className={`bg-black/20 border ${
                    errors.subject
                      ? 'border-red-500'
                      : 'border-amber-500/20'
                  } rounded-lg text-white placeholder:text-amber-200/40 focus:border-amber-500/40 focus:bg-black/30`}
                />
                {errors.subject && (
                  <p className="text-xs text-red-400">{errors.subject.message}</p>
                )}
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-amber-100">
                  Mensagem
                </label>
                <textarea
                  id="content"
                  placeholder="Sua mensagem..."
                  {...register('content')}
                  disabled={isLoading}
                  rows={5}
                  className={`flex min-h-[120px] w-full rounded-lg border ${
                    errors.content
                      ? 'border-red-500'
                      : 'border-amber-500/20'
                  } bg-black/20 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-amber-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                />
                {errors.content && (
                  <p className="text-xs text-red-400">{errors.content.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0 font-medium transition-all duration-700 ease-out hover:scale-[1.02] mt-6"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
