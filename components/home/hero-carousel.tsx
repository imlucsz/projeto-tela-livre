"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MovieEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  image: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  'Comédia', 'Drama', 'Infantil', 'Nacional', 'Clássicos', 'Documentários',
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Inline CSS ───────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .tl-hero {
    position: relative;
    background: #07070f;
    overflow: hidden;
  }

  /* Animated gradient orbs */
  .tl-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: tl-float linear infinite alternate;
  }
  .tl-orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
    top: -200px; left: -150px;
    animation-duration: 12s;
  }
  .tl-orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%);
    bottom: -150px; right: -100px;
    animation-duration: 15s;
    animation-direction: alternate-reverse;
  }
  .tl-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
    top: 40%; left: 50%;
    animation-duration: 9s;
  }
  @keyframes tl-float {
    from { transform: translate(0, 0); }
    to   { transform: translate(40px, 30px); }
  }

  /* Grid overlay */
  .tl-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Noise texture overlay */
  .tl-noise {
    position: absolute; inset: 0;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* Swiper overrides */
  .tl-swiper-wrap .swiper {
    padding: 24px 0 64px;
    overflow: visible !important;
  }
  .tl-swiper-wrap {
    overflow-x: clip;
  }

  .tl-swiper-wrap .swiper-slide {
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(3px) saturate(0.5);
    transform: scale(0.82);
    opacity: 0.35;
  }
  .tl-swiper-wrap .swiper-slide-active {
    filter: blur(0) saturate(1.1);
    transform: scale(1.04);
    opacity: 1;
  }
  .tl-swiper-wrap .swiper-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Custom nav buttons */
  .tl-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-80%);
    z-index: 20;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    cursor: pointer;
    transition: all 0.25s ease;
    color: rgba(255,255,255,0.7);
  }
  .tl-nav-btn:hover {
    background: rgba(124,58,237,0.25);
    border-color: rgba(124,58,237,0.5);
    color: #fff;
    box-shadow: 0 0 20px rgba(124,58,237,0.3);
  }
  .tl-nav-prev { left: -56px; }
  .tl-nav-next { right: -56px; }

  /* Pagination */
  .tl-swiper-wrap .swiper-pagination-bullet {
    background: rgba(255,255,255,0.25);
    opacity: 1;
    transition: all 0.3s ease;
    width: 6px; height: 6px;
  }
  .tl-swiper-wrap .swiper-pagination-bullet-active {
    background: linear-gradient(90deg, #7c3aed, #06b6d4);
    width: 24px;
    border-radius: 3px;
  }

  /* Neon CTA button */
  .tl-cta {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 15px;
    color: #fff;
    letter-spacing: 0.01em;
    background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
    border: none;
    cursor: pointer;
    text-decoration: none;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
  }
  .tl-cta::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent 60%);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .tl-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 40px rgba(124,58,237,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset;
  }
  .tl-cta:hover::before { opacity: 1; }

  /* Category pills */
  .tl-pill {
    flex: none;
    padding: 8px 20px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.25s ease;
    backdrop-filter: blur(8px);
    letter-spacing: 0.01em;
  }
  .tl-pill:hover {
    color: #fff;
    border-color: rgba(124,58,237,0.6);
    background: rgba(124,58,237,0.12);
    box-shadow: 0 0 16px rgba(124,58,237,0.2);
  }

  /* Info glass card */
  .tl-info-glass {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 28px 32px;
  }

  /* Meta pill */
  .tl-meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
  }

  /* Scrollbar */
  .tl-no-scrollbar::-webkit-scrollbar { display: none; }
  .tl-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  @media (max-width: 640px) {
    .tl-nav-prev, .tl-nav-next { display: none; }
  }
`;

// ─── Helper Functions ───────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const monthName = monthNames[date.getMonth()];
  
  return `${day} ${monthName}, ${hours}:${minutes}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface HeroCarouselProps {
  events?: MovieEvent[];
  categories?: string[];
}

export function HeroCarousel({
  events: customEvents,
  categories = DEFAULT_CATEGORIES,
}: HeroCarouselProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [apiEvents, setApiEvents] = useState<MovieEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Buscar eventos aprovados da API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?approved=true');
        if (response.ok) {
          const data = await response.json();
          // Transformar eventos da API para o formato do carrossel
          const transformedEvents = (data.data || [])
            .filter((event: any) => event.approved && event.image)
            .map((event: any) => ({
              id: event._id,
              title: event.title,
              location: event.location || 'A designar',
              date: formatDate(event.date),
              image: event.image,
            }))
            .slice(0, 12); // Limitar a 12 eventos
          
          if (transformedEvents.length > 0) {
            setApiEvents(transformedEvents);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
    // Recarregar a cada 30 segundos para sincronização em tempo real
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  const defaultEvents: MovieEvent[] = [
    { id: '1',  title: "Ainda Estou Aqui",           location: "Fatec Itaquera",              date: "28 jun, 19:00", image: "https://i.imgur.com/X9ieYpi.jpeg" },
    { id: '2',  title: "Alice no País das Maravilhas",location: "ONG Tela Livre",              date: "05 jul, 15:00", image: "https://i.imgur.com/CH8MwS0.jpeg" },
    { id: '3',  title: "Até o Último Homem",          location: "CCSP",                        date: "12 jul, 18:00", image: "https://i.imgur.com/OtnVjut.jpeg" },
    { id: '4',  title: "Bagagem de Risco",            location: "Biblioteca Mário de Andrade", date: "19 jul, 20:00", image: "https://i.imgur.com/3ZmV4kR.jpeg" },
    { id: '5',  title: "Formula 1",                   location: "Centro Cultural BB",          date: "26 jul, 19:00", image: "https://i.imgur.com/QinomOQ.jpeg" },
    { id: '6',  title: "Interestelar",                location: "Sesc Pompeia",                date: "02 ago, 19:00", image: "https://i.imgur.com/Et1JYuW.jpeg" },
    { id: '7',  title: "Marty Supreme",               location: "Cinemateca Brasileira",       date: "09 ago, 18:30", image: "https://i.imgur.com/7hPOcbt.jpeg" },
    { id: '8',  title: "Os Pecadores",                location: "Museu de Arte de SP",         date: "23 ago, 20:00", image: "https://i.imgur.com/7CKbjYI.jpeg" },
    { id: '9',  title: "Tropa de Elite",              location: "Centro Cultural SP",          date: "06 set, 18:00", image: "https://i.imgur.com/0lasSWW.jpeg" },
    { id: '10', title: "Velozes e Furiosos 6",        location: "TeatroMundo",                 date: "13 set, 19:30", image: "https://i.imgur.com/U0luBuP.jpeg" },
  ];

  // Usar eventos da API se disponível, senão usar padrão
  const events = useMemo(() => {
    const eventsToUse = apiEvents.length > 0 ? apiEvents : customEvents || defaultEvents;
    return shuffleArray(eventsToUse);
  }, [apiEvents, customEvents]);
  
  const activeEvent = useMemo(() => events[activeIndex % events.length], [activeIndex, events]);

  if (!mounted) return <HeroSkeleton />;

  return (
    <>
      <style>{styles}</style>

      <section className="tl-hero">
        {/* Background atmosphere */}
        <div className="tl-orb tl-orb-1" />
        <div className="tl-orb tl-orb-2" />
        <div className="tl-orb tl-orb-3" />
        <div className="tl-grid" />
        <div className="tl-noise" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '48px 24px 56px' }}>

            {/* ── Section label ── */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: 100,
                padding: '6px 16px',
                marginBottom: 28,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Sessões em Destaque
              </span>
            </motion.div>

            {/* ── Carousel ── */}
            <div style={{ position: 'relative' }} className="tl-swiper-wrap">
              <button ref={prevRef} className="tl-nav-btn tl-nav-prev" aria-label="Anterior">
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button ref={nextRef} className="tl-nav-btn tl-nav-next" aria-label="Próximo">
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>

              <Swiper
                modules={[EffectCoverflow, Autoplay, Navigation, Pagination]}
                effect="coverflow"
                grabCursor
                centeredSlides
                loop
                observer
                observeParents
                autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                slidesPerView={1.15}
                breakpoints={{
                  640: { slidesPerView: 1.3 },
                  768: { slidesPerView: 1.5 },
                  1024: { slidesPerView: 1.65 },
                }}
                coverflowEffect={{
                  rotate: 0,
                  stretch: -60,
                  depth: 140,
                  modifier: 1.4,
                  slideShadows: false,
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onBeforeInit={(swiper) => {
                  // @ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  // @ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                style={{ borderRadius: 20, minHeight: 320 }}
              >
                {events.map((event) => (
                  <SwiperSlide
                    key={event.id}
                    style={{ borderRadius: 20, overflow: 'hidden', background: '#0f0f1a' }}
                  >
                    <Link href={`/event/${event.id}`} style={{ display: 'block' }}>
                      <img
                        src={event.image}
                        alt={event.title}
                        style={{ width: '100%', height: 'auto', aspectRatio: '16/9', display: 'block' }}
                        loading="lazy"
                      />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* ── Event info ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvent.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{ marginTop: 40 }}
              >
                <div className="tl-info-glass" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
                  {/* Meta chips */}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="tl-meta-chip">
                      <MapPin size={13} strokeWidth={1.5} />
                      {activeEvent.location}
                    </span>
                    <span className="tl-meta-chip">
                      <Calendar size={13} strokeWidth={1.5} />
                      {activeEvent.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    marginBottom: 24,
                    textShadow: '0 2px 20px rgba(124,58,237,0.25)',
                  }}>
                    {activeEvent.title}
                  </h2>

                  {/* CTA */}
                  <Link href={`/event/${activeEvent.id}`} className="tl-cta">
                    <Ticket size={16} strokeWidth={1.5} />
                    Reservar Ingresso Grátis
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Category pills ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ marginTop: 48 }}
            >
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 16,
              }}>
                Explorar por categoria
              </p>
              <div
                className="tl-no-scrollbar"
                style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}
              >
                {categories.map((cat, i) => (
                  <motion.button
                    key={i}
                    className="tl-pill"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function HeroSkeleton() {
  return (
    <div style={{ background: '#07070f', padding: '48px 24px 56px', overflow: 'hidden' }}>
      <style>{`
        @keyframes tl-shimmer {
          0%   { background-position: -800px 0; }
          100% { background-position:  800px 0; }
        }
        .tl-sk {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 800px 100%;
          animation: tl-shimmer 1.8s infinite;
          border-radius: 8px;
        }
      `}</style>

      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div className="tl-sk" style={{ width: 160, height: 26, borderRadius: 100, marginBottom: 28 }} />
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', minHeight: 320, marginBottom: 40 }}>
          <div className="tl-sk" style={{ flex: '0 0 18%', aspectRatio: '16/9', borderRadius: 20, opacity: 0.4 }} />
          <div className="tl-sk" style={{ flex: '0 0 52%', aspectRatio: '16/9', borderRadius: 20 }} />
          <div className="tl-sk" style={{ flex: '0 0 18%', aspectRatio: '16/9', borderRadius: 20, opacity: 0.4 }} />
        </div>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
            <div className="tl-sk" style={{ width: 140, height: 32, borderRadius: 100 }} />
            <div className="tl-sk" style={{ width: 120, height: 32, borderRadius: 100 }} />
          </div>
          <div className="tl-sk" style={{ width: '70%', height: 44, margin: '0 auto 24px' }} />
          <div className="tl-sk" style={{ width: 200, height: 50, margin: '0 auto', borderRadius: 100 }} />
        </div>
      </div>
    </div>
  );
}
