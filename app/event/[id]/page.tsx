import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EventBanner } from "@/components/event/event-banner";
import { EventInfo } from "@/components/event/event-info";
import { EventImpact } from "@/components/event/event-impact";
import { connectDB } from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export const dynamic = 'force-dynamic';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

function mapDbEventToUiEvent(event: any) {
  const date = new Date(event.date);
  const createdBy = event.createdBy || {};

  return {
    id: event._id?.toString() ?? event.id,
    title: event.title,
    description: event.description || '',
    image: event.image || '/placeholder.jpg',
    location: event.location || 'A definir',
    address: event.address || '',
    date: date.toISOString().split('T')[0],
    time: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    category: event.category || 'cinema',
    ngo: {
      name: createdBy.name || 'Organizador',
      logo: createdBy.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(createdBy.name || 'Organizador')}`,
      description:
        createdBy.name
          ? `Evento organizado por ${createdBy.name}`
          : 'Evento organizado pela comunidade cultural.',
    },
    impact: {
      people: event.impact?.people || 0,
      communities: event.impact?.communities || 0,
      sessions: event.impact?.sessions || 0,
    },
    participantCount: Array.isArray(event.participants) ? event.participants.length : 0,
    participants: Array.isArray(event.participants) ? event.participants : [],
    volunteers: Array.isArray(event.volunteers) ? event.volunteers : [],
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;
  await connectDB();

  const event = await Event.findById(resolvedParams.id)
    .populate('createdBy', 'name image')
    .lean();

  if (!event) {
    notFound();
  }

  const uiEvent = mapDbEventToUiEvent(event);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <EventBanner event={uiEvent} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EventInfo event={uiEvent} />
            </div>
            <div>
              <EventImpact event={uiEvent} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
