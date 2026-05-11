"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail, Film, Popcorn, Star, Clapperboard, Loader2 } from "lucide-react";

// ─── Components ───
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const len = password.length;
  const strength = len >= 9 ? "strong" : len >= 5 ? "medium" : "weak";
  const labels = { weak: "Fraca", medium: "Média", strong: "Forte" };
  const colors = { weak: "#ef4444", medium: "#f59e0b", strong: "#22c55e" };
  const fill = { weak: 1, medium: 2, strong: 3 }[strength];

  return (
    <div className="fumacinha-strength-wrap">
      <div className="fumacinha-strength-bars">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="fumacinha-strength-seg"
            style={{ background: i <= fill ? colors[strength] : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>
      <span className="fumacinha-strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

function Toast({ message, type, visible }: { message: string; type: "success" | "error"; visible: boolean }) {
  return (
    <div className={cn("fumacinha-toast", type === "success" ? "fumacinha-toast-success" : "fumacinha-toast-error", visible && "fumacinha-visible")}>
      <span className="fumacinha-toast-dot" />
      {message}
    </div>
  );
}

function StarRow() {
  return (
    <div className="fumacinha-star-row">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" style={{ opacity: 0.6 + i * 0.08 }} />
      ))}
    </div>
  );
}

function FilmParticle({ style }: { style: React.CSSProperties }) {
  return <div className="fumacinha-film-particle" style={style} />;
}

// ─── Main Login Page ───
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
    message: "", type: "success", visible: false,
  });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { 
      triggerShake(); 
      showToast("Preencha todos os campos.", "error");
      return; 
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (result?.ok === false) {
        showToast("Email ou senha incorretos.", "error");
        triggerShake();
      } else {
        showToast("Login realizado com sucesso! 🎬", "success");
        router.push(callbackUrl);
      }
    } catch {
      showToast("Erro inesperado.", "error");
    } finally {
      setLoading(false);
    }
  };

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    style: {
      width: `${5 + (i * 6) % 9}px`,
      height: `${5 + (i * 6) % 9}px`,
      left: `${(i * 19 + 3) % 97}%`,
      top: `${(i * 13 + 8) % 92}%`,
      animationDelay: `${(i * 0.5) % 7}s`,
      animationDuration: `${6 + (i * 1.1) % 5}s`,
      opacity: 0.06 + (i % 5) * 0.025,
    } as React.CSSProperties,
  }));

  return (
    <>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <div className="fumacinha-cinema-label">
        <Film size={13} />
        Tela Livre — Cinema Gratuito para Todos
        <Clapperboard size={13} />
      </div>

      <div className="fumacinha-bg-scene">
        <div className="fumacinha-curtain-left" />
        <div className="fumacinha-curtain-right" />
        <div className="fumacinha-grid-overlay" />
        <div className="fumacinha-spotlight" />
        {particles.map((p) => (
          <FilmParticle key={p.id} style={p.style} />
        ))}
      </div>

      <div className="fumacinha-page-wrap">
        {/* AGORA TUDO DENTRO DO CARD CORRETAMENTE */}
        <div className={cn("fumacinha-login-card", mounted && "fumacinha-mounted", shake && "fumacinha-shake")}>
          <div className="fumacinha-card-accent" />

          <div style={{ textAlign: "center" }}>
            <div className="fumacinha-logo-wrap">
              <Film size={30} color="#fff" />
            </div>
            <div className="fumacinha-hero-badge">
              <Popcorn size={11} />
              Tela Livre
            </div>
            <StarRow />
            <h1 className="fumacinha-card-title">Bem-vindo de volta!</h1>
            <p className="fumacinha-card-sub">Faça login e descubra cinema gratuito perto de você</p>
          </div>

          <div className="fumacinha-social-grid">
            <button className="fumacinha-social-btn" type="button" disabled={loading}>
              Google
            </button>
            <button className="fumacinha-social-btn" type="button" disabled={loading}>
              GitHub
            </button>
          </div>

          <div className="fumacinha-divider">ou continue com email</div>

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="fumacinha-input-group">
              <label className="fumacinha-input-label">Email</label>
              <div className={cn("fumacinha-input-wrap", focusedInput === "email" && "fumacinha-focused")}>
                <Mail size={15} className="fumacinha-input-icon" />
                <input
                  type="email"
                  className="fumacinha-input-field"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  required
                />
              </div>
            </div>

            <div className="fumacinha-input-group">
              <label className="fumacinha-input-label">Senha</label>
              <div className={cn("fumacinha-input-wrap", focusedInput === "password" && "fumacinha-focused")}>
                <Lock size={15} className="fumacinha-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  className="fumacinha-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  required
                />
                <button type="button" className="fumacinha-toggle-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            <div className="fumacinha-forgot-row">
              <Link href="/forgot-password" className="fumacinha-forgot-link">
    Esqueceu a senha?
  </Link>
</div>

            <button type="submit" className="fumacinha-submit-btn" disabled={loading}>
              {loading ? <Loader2 className="fumacinha-spinner" /> : "🎬 Entrar na Tela Livre"}
            </button>
          </form>

          <p className="fumacinha-card-footer">
            Não tem conta? <Link href="/register">Crie uma agora</Link>
          </p>

          <div className="fumacinha-film-strip">
            {[...Array(9)].map((_, i) => <div key={i} className="fumacinha-film-hole" />)}
          </div>
        </div>
      </div>
    </>
  );
}