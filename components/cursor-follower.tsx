"use client";

import { useEffect, useRef } from "react";

const cursorStyles = `
  .tl-cursor {
    pointer-events: none;
    position: fixed;
    z-index: 9999;
    mix-blend-mode: screen;
    transition: opacity 0.2s ease;
  }
  .tl-cursor-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    position: absolute;
    top: -3px;
    left: -3px;
    transition: transform 0.1s ease;
  }
  .tl-cursor-ring {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(167,139,250,0.35);
    position: absolute;
    top: -14px;
    left: -14px;
    transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
  }

  /* Mobile: hide cursor */
  @media (hover: none) {
    .tl-cursor { display: none; }
  }
`;

export function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const handleEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
    };
    const handleLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    // Expand ring when hovering interactive elements
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("button, a, input, [role='button']");
      if (ringRef.current) {
        if (isInteractive) {
          ringRef.current.style.width = "44px";
          ringRef.current.style.height = "44px";
          ringRef.current.style.top = "-22px";
          ringRef.current.style.left = "-22px";
          ringRef.current.style.borderColor = "rgba(167,139,250,0.6)";
          ringRef.current.style.background = "rgba(124,58,237,0.05)";
        } else {
          ringRef.current.style.width = "28px";
          ringRef.current.style.height = "28px";
          ringRef.current.style.top = "-14px";
          ringRef.current.style.left = "-14px";
          ringRef.current.style.borderColor = "rgba(167,139,250,0.35)";
          ringRef.current.style.background = "transparent";
        }
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mousemove", handleOver);
    document.addEventListener("mouseenter", handleEnter);
    document.addEventListener("mouseleave", handleLeave);

    const animate = () => {
      // Lag the ring position slightly for organic feel
      const speed = 0.12;
      ring.current.x += (pos.current.x - ring.current.x) * speed;
      ring.current.y += (pos.current.y - ring.current.y) * speed;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - pos.current.x}px, ${ring.current.y - pos.current.y}px)`;
      }

      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mousemove", handleOver);
      document.removeEventListener("mouseenter", handleEnter);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <style>{cursorStyles}</style>
      <div ref={cursorRef} className="tl-cursor" style={{ opacity: 0 }}>
        <div ref={dotRef} className="tl-cursor-dot" />
        <div ref={ringRef} className="tl-cursor-ring" />
      </div>
    </>
  );
}
