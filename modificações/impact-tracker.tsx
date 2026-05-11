"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Building2, Star, Film } from "lucide-react";

const impactStyles = `
  .tl-impact-section {
    background: #07070f;
    border-top: 1px solid rgba(124,58,237,0.12);
    border-bottom: 1px solid rgba(124,58,237,0.12);
    position: relative;
    overflow: hidden;
  }
  .tl-impact-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .tl-impact-card {
    position: relative;
    padding: 28px 24px;
    border-radius: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    text-align: center;
    overflow: hidden;
    transition: border-color 0.3s ease, background 0.3s ease;
  }
  .tl-impact-card:hover {
    border-color: rgba(124,58,237,0.3);
    background: rgba(124,58,237,0.04);
  }
  .tl-impact-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .tl-impact-card:hover::after {
    opacity: 1;
  }

  .tl-impact-number {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    background: linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    filter: drop-shadow(0 0 20px rgba(124,58,237,0.4));
  }

  .tl-impact-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.12);
    margin: 0 auto 16px;
    color: #a78bfa;
    border: 1px solid rgba(124,58,237,0.2);
  }

  .tl-pulse-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #22d3ee;
    display: inline-block;
    margin-left: 6px;
    animation: tl-pulse-anim 1.5s ease-in-out infinite;
    vertical-align: middle;
  }
  @keyframes tl-pulse-anim {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(1.5); }
  }
`;

// ── Animated counter hook ──────────────────────────────────────────────────

function useCounter(end: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // ease-out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);
  return count;
}

// ── Stats data ─────────────────────────────────────────────────────────────

const stats = [
  {
    icon: Building2,
    value: 150,
    suffix: "+",
    label: "ONGs Ativas",
    sublabel: "parceiras da rede",
    live: true,
  },
  {
    icon: Film,
    value: 500,
    suffix: "+",
    label: "Eventos Realizados",
    sublabel: "sessões e oficinas",
    live: false,
  },
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Pessoas Impactadas",
    sublabel: "em todo o Brasil",
    live: true,
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "★",
    label: "Avaliação Média",
    sublabel: "dos participantes",
    live: false,
    decimal: true,
  },
];

function formatNumber(n: number, decimal = false): string {
  if (decimal) return n.toFixed(1);
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return n.toString();
}

// ── Component ──────────────────────────────────────────────────────────────

export function ImpactTracker() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const c0 = useCounter(stats[0].value, 1800, inView);
  const c1 = useCounter(stats[1].value, 2200, inView);
  const c2 = useCounter(stats[2].value, 2500, inView);
  const c3 = useCounter(Math.round(stats[3].value * 10), 1500, inView);

  const counts = [c0, c1, c2, c3 / 10];

  return (
    <>
      <style>{impactStyles}</style>
      <section className="tl-impact-section" ref={ref}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>
          
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(167,139,250,0.6)',
              marginBottom: 8,
            }}>
              Impacto em Números
            </p>
            <h2 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 700,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}>
              Transformando comunidades pelo cinema
            </h2>
          </motion.div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const raw = counts[i];
              const displayVal = i === 3
                ? raw.toFixed(1)
                : formatNumber(Math.round(raw));

              return (
                <motion.div
                  key={i}
                  className="tl-impact-card"
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="tl-impact-icon">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="tl-impact-number">
                    {displayVal}{stat.suffix}
                    {stat.live && <span className="tl-pulse-dot" />}
                  </div>
                  <p style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                    {stat.label}
                  </p>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    {stat.sublabel}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}
