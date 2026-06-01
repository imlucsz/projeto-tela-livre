import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// Validação com Zod
// ============================================
const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição não pode exceder 1000 caracteres')
    .optional()
    .default(''),
  date: z
    .string()
    .datetime('Data deve ser uma data válida em formato ISO')
    .transform((val) => new Date(val)),
  location: z
    .string()
    .max(150, 'Local não pode exceder 150 caracteres')
    .optional()
    .default(''),
  address: z
    .string()
    .max(300, 'Endereço não pode exceder 300 caracteres')
    .optional()
    .default(''),
  image: z
    .string()
    .url('URL da imagem deve ser válida')
    .optional()
    .default(''),
  genre: z
    .enum(['geral','comedia','drama','infantil','animacao','documentario','acao','romance','ficcao'], {
      errorMap: () => ({ message: 'Gênero inválido' })
    })
    .default('geral'),
  category: z
    .enum(['cinema', 'oficinas', 'projetos'], {
      errorMap: () => ({ message: 'Categoria deve ser: cinema, oficinas ou projetos' })
    })
    .default('cinema'),
});

type CreateEventPayload = z.infer<typeof CreateEventSchema>;

// ============================================
// GET /api/events
// ============================================
/**
 * Lista eventos com filtros baseados em permissões
 * 
 * Parâmetros:
 * - ?approved=true (qualquer um pode usar) - retorna apenas eventos aprovados
 * - ADMIN: vê todos os eventos
 * - NGO: vê apenas eventos criados por ela (createdBy === userId)
 * - USER: acesso negado (403) a menos que esteja pedindo eventos aprovados
 * 
 * @returns {
 *   success: boolean,
 *   data: Event[],
 *   count: number
 * }
 */
export async function GET(req: NextRequest) {
  // 💡 FORÇA O TURBOPACK A CARREGAR O MODELO DE USUÁRIO PARA O POPULATE NÃO QUEBRAR
  const _forceUserRegistration = User;
  try {
    // Autenticação opcional para este endpoint
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'USER';
    const userId = (session?.user as any)?.id;

    const searchParams = req.nextUrl.searchParams;
    const approvedOnly = searchParams.get('approved') === 'true';
    const search = searchParams.get('search')?.trim();

    await connectDB();

    let query: any = {};
    let events: any[];

    // Se pedir apenas eventos aprovados (público)
    if (approvedOnly) {
      if (search) {
        const searchRegex = new RegExp(escapeRegex(search), 'i');

        events = await Event.aggregate([
          { $match: { approved: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              as: 'createdBy'
            }
          },
          { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
          {
            $match: {
              $or: [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
                { address: searchRegex },
                { 'createdBy.name': searchRegex }
              ]
            }
          },
          { $sort: { createdAt: -1 } }
        ]).exec();
      } else {
        query = { approved: true };
        events = await Event.find(query)
          .populate('createdBy', 'name email role image')
          .sort({ createdAt: -1 })
          .lean();
      }
    } else {
      // Requer autenticação para ver não-aprovados
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: 'Não autenticado' },
          { status: 401 }
        );
      }

      // Apenas ADMIN e NGO podem listar eventos
      if (userRole !== 'ADMIN' && userRole !== 'NGO') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Acesso negado. Apenas ONGs e Admins podem listar eventos.' 
          },
          { status: 403 }
        );
      }

      // Query dinâmico baseado no role
      if (userRole === 'ADMIN') {
        // Admin vê todos os eventos aprovados e não aprovados
        events = await Event.find({})
          .populate('createdBy', 'name email role image')
          .sort({ createdAt: -1 })
          .lean();
      } else {
        // NGO (role === 'NGO') vê apenas seus eventos
        events = await Event.find({ createdBy: userId })
          .populate('createdBy', 'name email role image')
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: events,
        count: events.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar eventos',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/events
// ============================================
/**
 * Cria um novo evento
 * 
 * Segurança:
 * - createdBy é injetado do servidor (session.user.id)
 * - approved é definido pelo servidor baseado no role:
 *   - ADMIN: approved = true (auto-aprovado)
 *   - NGO: approved = false (aguarda aprovação)
 *   - USER: acesso negado (403)
 * 
 * @param {CreateEventPayload} body
 * @returns {
 *   success: boolean,
 *   data: Event (criado),
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticação com NextAuth
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role || 'USER';
    const userId = (session.user as any)?.id;

    // Apenas ADMIN e NGO podem criar eventos
    if (userRole !== 'ADMIN' && userRole !== 'NGO') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Acesso negado. Apenas ONGs e Admins podem criar eventos.' 
        },
        { status: 403 }
      );
    }

    // Parse do body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Payload JSON inválido' },
        { status: 400 }
      );
    }

    // ⚠️ Segurança: Rejeitar se tentar injetar createdBy ou approved
    if ((body as any)?.createdBy !== undefined || (body as any)?.approved !== undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos "createdBy" e "approved" não são aceitos. Eles são definidos pelo servidor.' 
        },
        { status: 400 }
      );
    }

    // Validação com Zod
    const validationResult = CreateEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          issues: validationResult.error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const payload: CreateEventPayload = validationResult.data;

    await connectDB();

    // 🔒 Injetar createdBy e approved no servidor (não confia no cliente)
    const eventData = {
      ...payload,
      createdBy: userId,
      approved: userRole === 'ADMIN' // Admin: auto-aprovado | NGO: aguarda aprovação
    };

    // Salvar evento
    const newEvent = await Event.create(eventData);

    // Populate para retornar dados completos
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('createdBy', 'name email role image')
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedEvent,
        message: userRole === 'ADMIN'
          ? 'Evento criado e aprovado automaticamente'
          : 'Evento criado e aguardando aprovação do administrador'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar evento:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar evento',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

