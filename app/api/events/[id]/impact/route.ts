import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export const dynamic = 'force-dynamic';

/**
 * GET /api/events/[id]/impact
 * Calcula o impacto social acumulado da ONG que criou este evento
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    // Buscar o evento para pegar o createdBy
    const event = await Event.findById(resolvedParams.id).select('createdBy').lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Se createdBy é null (evento de seed sem ONG atribuída), retornar dados mockados
    if (!event.createdBy) {
      return NextResponse.json(
        {
          success: true,
          data: {
            people: 0,
            communities: 0,
            sessions: 0,
            isSystemEvent: true,
            message: 'Evento organizado pelo sistema'
          }
        },
        { status: 200 }
      );
    }

    // Buscar todos os eventos criados por esta ONG
    const orgEvents = await Event.find({ createdBy: event.createdBy }).lean();

    // 1. Pessoas Impactadas: Total de IDs únicos em todos os arrays participants
    const allParticipantIds = new Set<string>();
    orgEvents.forEach((e) => {
      if (Array.isArray(e.participants)) {
        e.participants.forEach((id: any) => {
          allParticipantIds.add(id.toString());
        });
      }
    });
    const peopleImpacted = allParticipantIds.size;

    // 2. Sessões Realizadas: Número total de eventos da ONG
    const sessionsCount = orgEvents.length;

    // 3. Comunidades Atendidas: Número de locais distintos (locations)
    const uniqueLocations = new Set<string>();
    orgEvents.forEach((e) => {
      if (e.location && e.location.trim()) {
        uniqueLocations.add(e.location.toLowerCase());
      }
    });
    const communitiesCount = uniqueLocations.size;

    return NextResponse.json(
      {
        success: true,
        data: {
          people: peopleImpacted,
          communities: communitiesCount,
          sessions: sessionsCount,
          isSystemEvent: false
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao calcular impacto:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao calcular impacto',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
