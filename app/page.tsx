import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { CategoriesSection } from "@/components/home/categories-section";
import { EventsSection } from "@/components/home/events-section";
import { ImpactTracker } from "@/components/home/impact-tracker";
import { FABDiscovery } from "@/components/home/fab-discovery";
import { CursorFollower } from "@/components/cursor-follower";
import { SectionReveal } from "@/components/home/section-reveal";
import { ContactForm } from "@/components/contact-form";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Custom cursor — client component */}
      <CursorFollower />

      <Header />

      <main className="flex-1">
        {/* Hero carousel with animated bg */}
        <HeroCarousel />

        {/* Section animations via Framer Motion */}
        <SectionReveal delay={0}>
          <ImpactTracker />
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <CategoriesSection />
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <EventsSection />
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <ContactForm />
        </SectionReveal>
      </main>

      <Footer />

      {/* Floating Action Button — fixed position */}
      <FABDiscovery />
    </div>
  );
}
