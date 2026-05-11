import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EventBanner } from "@/components/event/event-banner";
import { EventInfo } from "@/components/event/event-info";
import { EventImpact } from "@/components/event/event-impact";
import { mockEvents } from "@/lib/mock-data";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <EventBanner event={event} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EventInfo event={event} />
            </div>
            <div>
              <EventImpact event={event} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}
