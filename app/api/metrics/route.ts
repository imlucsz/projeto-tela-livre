import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics
 * 
 * Retorna métricas agregadas de impacto social dos eventos aprovados
 * Usa MongoDB Aggregation Pipeline para performance otimizada
 * 
 * @returns {
 *   success: boolean,
 *   data: {
 *     totalPeople: number,      // Soma total de pessoas alcançadas
 *     totalSessions: number,    // Total de eventos aprovados
 *     totalCommunities: number, // Soma total de comunidades beneficiadas
 *     averagePeoplePerEvent: number
 *   },
 *   timestamp: string
 * }
 */
export async function GET() {
  try {
    // Conectar ao banco de dados
    await connectDB();

    // MongoDB Aggregation Pipeline para calcular métricas
    const metrics = await Event.aggregate([
      // Stage 1: Filtrar apenas eventos aprovados
      {
        $match: {
          approved: true
        }
      },
      // Stage 2: Agrupar e somar as métricas
      {
        $group: {
          _id: null, // Agrupa todos os documentos em um único grupo
          totalPeople: {
            $sum: '$impact.people' // Soma todos os impact.people
          },
          totalCommunities: {
            $sum: '$impact.communities' // Soma todos os impact.communities
          },
          totalSessions: {
            $sum: '$impact.sessions' // Soma todos os impact.sessions
          },
          eventCount: {
            $sum: 1 // Conta o total de eventos
          }
        }
      },
      // Stage 3: Projeta os resultados e calcula a média
      {
        $project: {
          _id: 0,
          totalPeople: 1,
          totalCommunities: 1,
          totalSessions: 1,
          totalEvents: '$eventCount',
          averagePeoplePerEvent: {
            $cond: [
              { $eq: ['$eventCount', 0] },
              0,
              { $divide: ['$totalPeople', '$eventCount'] }
            ]
          }
        }
      }
    ]);

    // Verificar se há resultados
    const result = metrics.length > 0 ? metrics[0] : {
      totalPeople: 0,
      totalCommunities: 0,
      totalSessions: 0,
      totalEvents: 0,
      averagePeoplePerEvent: 0
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          totalPeople: result.totalPeople,
          totalCommunities: result.totalCommunities,
          totalSessions: result.totalSessions,
          totalEvents: result.totalEvents,
          averagePeoplePerEvent: Math.round(result.averagePeoplePerEvent * 100) / 100 // Arredondar para 2 casas decimais
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar métricas de impacto',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
