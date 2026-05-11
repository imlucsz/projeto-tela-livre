"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";

const fabStyles = `
  .tl-fab-btn {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 100;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
    color: #fff;
    box-shadow: 0 4px 32px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
  }
  .tl-fab-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .tl-fab-btn:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 8px 48px rgba(124,58,237,0.7), 0 0 0 1px rgba(255,255,255,0.15) inset;
  }
  .tl-fab-btn:hover::before { opacity: 1; }

  /* Ripple ring */
  .tl-fab-ring {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid rgba(124,58,237,0.4);
    pointer-events: none;
    animation: tl-ring 2.5s ease-out infinite;
    z-index: 99;
  }
  @keyframes tl-ring {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  /* Modal */
  .tl-fab-modal {
    position: fixed;
    bottom: 96px;
    right: 28px;
    z-index: 101;
    width: 340px;
    max-height: 480px;
    border-radius: 20px;
    background: rgba(10, 8, 20, 0.92);
    border: 1px solid rgba(124,58,237,0.25);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tl-fab-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tl-fab-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #06b6d4);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .tl-fab-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .tl-fab-messages::-webkit-scrollbar { width: 4px; }
  .tl-fab-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }

  .tl-msg-bot, .tl-msg-user {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.55;
  }
  .tl-msg-bot {
    background: rgba(124,58,237,0.12);
    border: 1px solid rgba(124,58,237,0.18);
    color: rgba(255,255,255,0.85);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  .tl-msg-user {
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2));
    border: 1px solid rgba(124,58,237,0.2);
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }

  .tl-fab-input-row {
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .tl-fab-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 13.5px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  .tl-fab-input::placeholder { color: rgba(255,255,255,0.3); }
  .tl-fab-input:focus {
    border-color: rgba(124,58,237,0.4);
    background: rgba(124,58,237,0.06);
  }
  .tl-fab-send {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    transition: transform 0.2s, opacity 0.2s;
  }
  .tl-fab-send:hover { transform: scale(1.1); }
  .tl-fab-send:disabled { opacity: 0.4; cursor: default; transform: none; }

  .tl-typing {
    display: flex;
    gap: 4px;
    padding: 10px 14px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.15);
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    align-self: flex-start;
    width: fit-content;
  }
  .tl-typing span {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(167,139,250,0.6);
    animation: tl-bounce 1.2s ease-in-out infinite;
  }
  .tl-typing span:nth-child(2) { animation-delay: 0.15s; }
  .tl-typing span:nth-child(3) { animation-delay: 0.30s; }
  @keyframes tl-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30%            { transform: translateY(-5px); }
  }

  @media (max-width: 400px) {
    .tl-fab-modal { width: calc(100vw - 40px); right: 20px; }
    .tl-fab-btn, .tl-fab-ring { right: 20px; }
  }
`;

// ── Simple suggestion chips ────────────────────────────────────────────────

const suggestions = [
  "Filmes esta semana",
  "Eventos infantis em SP",
  "Oficinas gratuitas",
];

// ── Bot replies ────────────────────────────────────────────────────────────

const botReplies: Record<string, string> = {
  default: "Olá! Posso ajudar você a descobrir sessões de cinema gratuitas, oficinas e projetos sociais perto de você. O que você procura? 🎬",
  filmes: "Encontrei 5 sessões esta semana em São Paulo! Destaque para **Interestelar** no Sesc Pompeia (sex, 19h) e **Tropa de Elite** no Centro Cultural SP (sáb, 18h). Quer ver todos?",
  infantis: "Ótima escolha! Há 3 sessões infantis disponíveis em SP: **Alice no País das Maravilhas** na ONG Tela Livre (dom, 15h) e mais 2 opções no ABC Paulista. Ver detalhes?",
  oficinas: "Temos 8 oficinas gratuitas abertas! Roteiro, direção, edição de vídeo e fotografia. A próxima começa em **3 dias** na Fatec Itaquera. Quer se inscrever?",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("film") || lower.includes("semanа") || lower.includes("cinema")) return botReplies.filmes;
  if (lower.includes("infant") || lower.includes("crian")) return botReplies.infantis;
  if (lower.includes("oficin") || lower.includes("workshop") || lower.includes("curso")) return botReplies.oficinas;
  return "Entendido! Estou buscando eventos que combinam com isso... Encontrei algumas opções incríveis perto de você. Posso te mostrar as próximas 3 mais relevantes?";
}

// ── Component ──────────────────────────────────────────────────────────────

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
}

export function FABDiscovery() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, type: "bot", text: botReplies.default },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), type: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));
    setTyping(false);
    const botReply = getBotReply(text);
    setMessages((prev) => [...prev, { id: Date.now() + 1, type: "bot", text: botReply }]);
  };

  return (
    <>
      <style>{fabStyles}</style>

      {/* Ring pulse */}
      {!open && <div className="tl-fab-ring" />}

      {/* FAB button */}
      <motion.button
        className="tl-fab-btn"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        aria-label="IA Discovery"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={20} strokeWidth={1.5} />
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sparkles size={20} strokeWidth={1.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="tl-fab-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="tl-fab-header">
              <div className="tl-fab-avatar">
                <Bot size={16} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                  IA Discovery
                </p>
                <p style={{ fontSize: 11.5, color: 'rgba(167,139,250,0.7)' }}>
                  Encontra eventos pra você ✨
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="tl-fab-messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={msg.type === "bot" ? "tl-msg-bot" : "tl-msg-user"}
                  dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              ))}

              {typing && (
                <div className="tl-typing">
                  <span /><span /><span />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            {messages.length === 1 && !typing && (
              <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 100,
                      border: '1px solid rgba(124,58,237,0.25)',
                      background: 'rgba(124,58,237,0.08)',
                      color: 'rgba(167,139,250,0.85)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'rgba(124,58,237,0.18)';
                      (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'rgba(124,58,237,0.08)';
                      (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.25)';
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="tl-fab-input-row">
              <input
                ref={inputRef}
                className="tl-fab-input"
                placeholder="Ex: filmes para crianças em SP..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
              />
              <button
                className="tl-fab-send"
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                aria-label="Enviar"
              >
                <Send size={14} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
