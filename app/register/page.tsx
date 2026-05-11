"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Eye, EyeOff, Lock, Mail, Film, Popcorn, Star,
  Clapperboard, Loader2, User, CheckCircle,
} from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter um número"),
  confirmPassword: z.string(),
  isNgo: z.boolean().default(false),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

// ─── StrengthBar ─────────────────────────────────────────────────────────────
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

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }: {
  message: string; type: "success" | "error"; visible: boolean;
}) {
  return (
    <div className={cn(
      "fumacinha-toast",
      type === "success" ? "fumacinha-toast-success" : "fumacinha-toast-error",
      visible && "fumacinha-visible",
    )}>
      <span className="fumacinha-toast-dot" />
      {message}
    </div>
  );
}

// ─── StarRow ─────────────────────────────────────────────────────────────────
function StarRow() {
  return (
    <div className="fumacinha-star-row">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" style={{ opacity: 0.6 + i * 0.08 }} />
      ))}
    </div>
  );
}

// ─── FilmParticle ────────────────────────────────────────────────────────────
function FilmParticle({ style }: { style: React.CSSProperties }) {
  return <div className="fumacinha-film-particle" style={style} />;
}

// ─── Success Screen ──────────────────────────────────────────────────────────
function SuccessScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    style: {
      width: `${5 + (i * 6) % 9}px`, height: `${5 + (i * 6) % 9}px`,
      left: `${(i * 19 + 3) % 97}%`, top: `${(i * 13 + 8) % 92}%`,
      animationDelay: `${(i * 0.5) % 7}s`, animationDuration: `${6 + (i * 1.1) % 5}s`,
      opacity: 0.06 + (i % 5) * 0.025,
    } as React.CSSProperties,
  }));

  return (
    <>
      <div className="fumacinha-cinema-label">
        <Film size={13} />Tela Livre — Cinema Gratuito para Todos<Clapperboard size={13} />
      </div>
      <div className="fumacinha-bg-scene">
        <div className="fumacinha-curtain-left" /><div className="fumacinha-curtain-right" />
        <div className="fumacinha-orb fumacinha-orb-1" /><div className="fumacinha-orb fumacinha-orb-2" />
        <div className="fumacinha-orb fumacinha-orb-3" /><div className="fumacinha-orb fumacinha-orb-4" />
        <div className="fumacinha-grid-overlay" /><div className="fumacinha-spotlight" />
        {particles.map((p) => <FilmParticle key={p.id} style={p.style} />)}
      </div>
      <div className="fumacinha-page-wrap">
        <div
          className={cn("fumacinha-login-card", mounted && "fumacinha-mounted")}
          style={{ textAlign: "center" }}
        >
          <div className="fumacinha-card-accent" />
          <div
            className="fumacinha-logo-wrap"
            style={{ background: "linear-gradient(135deg,#15803d,#16a34a,#22c55e)" }}
          >
            <CheckCircle size={30} color="#fff" />
          </div>
          <div className="fumacinha-hero-badge"><Popcorn size={11} />Tela Livre</div>
          <StarRow />
          <h1 className="fumacinha-card-title">Cadastro realizado!</h1>
          <p className="fumacinha-card-sub" style={{ marginBottom: 28 }}>
            Verifique seu email para ativar a conta.<br />Você será redirecionado em breve.
          </p>
          <button className="fumacinha-submit-btn" onClick={onGoLogin}>
            🎬 Ir para o login
          </button>
          <div className="fumacinha-film-strip" style={{ marginTop: 28 }}>
            {[...Array(9)].map((_, i) => <div key={i} className="fumacinha-film-hole" />)}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageStep, setPageStep] = useState<"form" | "success">("form");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string; type: "success" | "error"; visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", isNgo: false },
  });

  const watchPassword = form.watch("password");
  const watchIsNgo = form.watch("isNgo");

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.isNgo ? ROLES.NGO : ROLES.USER,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "Erro ao criar conta.", "error");
        triggerShake();
        return;
      }
      showToast("Conta criada com sucesso! 🎬", "success");
      setPageStep("success");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      showToast("Erro inesperado. Tente novamente.", "error");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    style: {
      width: `${5 + (i * 6) % 9}px`, height: `${5 + (i * 6) % 9}px`,
      left: `${(i * 19 + 3) % 97}%`, top: `${(i * 13 + 8) % 92}%`,
      animationDelay: `${(i * 0.5) % 7}s`, animationDuration: `${6 + (i * 1.1) % 5}s`,
      opacity: 0.06 + (i % 5) * 0.025,
    } as React.CSSProperties,
  }));

  if (pageStep === "success") {
    return <SuccessScreen onGoLogin={() => router.push("/login")} />;
  }

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
        <div className="fumacinha-orb fumacinha-orb-1" />
        <div className="fumacinha-orb fumacinha-orb-2" />
        <div className="fumacinha-orb fumacinha-orb-3" />
        <div className="fumacinha-orb fumacinha-orb-4" />
        <div className="fumacinha-grid-overlay" />
        <div className="fumacinha-spotlight" />
        {particles.map((p) => <FilmParticle key={p.id} style={p.style} />)}
      </div>

      <div className="fumacinha-page-wrap">
        <div className={cn(
          "fumacinha-login-card",
          mounted && "fumacinha-mounted",
          shake && "fumacinha-shake",
        )}>
          <div className="fumacinha-card-accent" />

          {/* ── Header ── */}
          <div style={{ textAlign: "center" }}>
            <div className="fumacinha-logo-wrap">
              <Film size={30} color="#fff" />
            </div>
            <div className="fumacinha-hero-badge">
              <Popcorn size={11} />
              Tela Livre
            </div>
            <StarRow />
            <h1 className="fumacinha-card-title">Crie sua conta</h1>
            <p className="fumacinha-card-sub">
              Junte-se à comunidade e descubra cinema gratuito perto de você
            </p>
          </div>

          {/* ── Social ── */}
          <div className="fumacinha-social-grid">
            <button className="fumacinha-social-btn" type="button" disabled={loading}>Google</button>
            <button className="fumacinha-social-btn" type="button" disabled={loading}>GitHub</button>
          </div>

          <div className="fumacinha-divider">ou continue com email</div>

          {/* ── Form ── */}
          <form onSubmit={form.handleSubmit(onSubmit, () => triggerShake())}>

            {/* Nome */}
            <div className="fumacinha-input-group">
              <label className="fumacinha-input-label">Nome completo</label>
              <div className={cn("fumacinha-input-wrap", focusedInput === "name" && "fumacinha-focused")}>
                <User size={15} className="fumacinha-input-icon" />
                <input
                  type="text"
                  className="fumacinha-input-field"
                  placeholder="Seu nome completo"
                  {...form.register("name")}
                  onFocus={() => setFocusedInput("name")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              {form.formState.errors.name && (
                <p className="fumacinha-field-error">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="fumacinha-input-group">
              <label className="fumacinha-input-label">Email</label>
              <div className={cn("fumacinha-input-wrap", focusedInput === "email" && "fumacinha-focused")}>
                <Mail size={15} className="fumacinha-input-icon" />
                <input
                  type="email"
                  className="fumacinha-input-field"
                  placeholder="seu@email.com"
                  {...form.register("email")}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              {form.formState.errors.email && (
                <p className="fumacinha-field-error">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="fumacinha-input-group">
              <label className="fumacinha-input-label">Senha</label>
              <div className={cn("fumacinha-input-wrap", focusedInput === "password" && "fumacinha-focused")}>
                <Lock size={15} className="fumacinha-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  className="fumacinha-input-field"
                  placeholder="••••••••"
                  {...form.register("password")}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
                <button
                  type="button"
                  className="fumacinha-toggle-eye"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="fumacinha-field-error">{form.formState.errors.password.message}</p>
              )}
              <StrengthBar password={watchPassword} />
            </div>

            {/* Confirmar senha */}
            <div className="fumacinha-input-group">
              <label className="fumacinha-input-label">Confirmar senha</label>
              <div className={cn("fumacinha-input-wrap", focusedInput === "confirmPassword" && "fumacinha-focused")}>
                <Lock size={15} className="fumacinha-input-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  className="fumacinha-input-field"
                  placeholder="••••••••"
                  {...form.register("confirmPassword")}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                />
                <button
                  type="button"
                  className="fumacinha-toggle-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="fumacinha-field-error">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {/* ONG Checkbox */}
            <label className="fumacinha-checkbox-row" htmlFor="isNgo">
              <input
                type="checkbox"
                id="isNgo"
                className="fumacinha-checkbox"
                {...form.register("isNgo")}
                onChange={(e) => form.setValue("isNgo", e.target.checked)}
              />
              <div className="fumacinha-checkbox-text">
                <strong>Sou uma ONG ou organização cultural</strong>
                Acesse o dashboard para criar e gerenciar eventos
              </div>
            </label>

            {watchIsNgo && (
              <div className="fumacinha-ngo-tip">
                ✓ Você terá acesso ao painel completo para publicar sessões gratuitas e alcançar
                mais pessoas na sua cidade.
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="fumacinha-submit-btn" disabled={loading}>
              {loading ? <Loader2 className="fumacinha-spinner" /> : "🎬 Criar conta"}
            </button>
          </form>

          <p className="fumacinha-card-footer">
            Já tem conta? <Link href="/login">Faça login</Link>
          </p>

          <div className="fumacinha-film-strip">
            {[...Array(9)].map((_, i) => <div key={i} className="fumacinha-film-hole" />)}
          </div>
        </div>
      </div>
    </>
  );
}
