/**
 * NeonRainBackground
 * Blurred neon light curtains that pour smoothly from top to bottom.
 * Wide, heavily-blurred glowing beams — cinematic light-movie feel.
 * Pure CSS — compositor thread only, no JS animation loop.
 */
import React from "react";

interface Beam {
  id: number;
  left: string;
  width: string;
  height: string;
  color: string;
  duration: string;
  delay: string;
  blurX: string;
  blurY: string;
  opacity: number;
}

// Wide, soft-edged neon light beams that fall from top to bottom
const BEAMS: Beam[] = [
  // --- Thick ambient curtains (very wide, very blurred) ---
  {
    id: 1,
    left: "-5%",
    width: "35vw",
    height: "85vh",
    color: "#00eaffcc",
    duration: "5.5s",
    delay: "0s",
    blurX: "60px",
    blurY: "40px",
    opacity: 0.13,
  },
  {
    id: 2,
    left: "20%",
    width: "30vw",
    height: "75vh",
    color: "#7c3aed99",
    duration: "7.2s",
    delay: "-2.5s",
    blurX: "70px",
    blurY: "50px",
    opacity: 0.11,
  },
  {
    id: 3,
    left: "50%",
    width: "38vw",
    height: "90vh",
    color: "#2563ebaa",
    duration: "6.0s",
    delay: "-1.8s",
    blurX: "65px",
    blurY: "45px",
    opacity: 0.12,
  },
  {
    id: 4,
    left: "70%",
    width: "28vw",
    height: "70vh",
    color: "#e879f9aa",
    duration: "8.5s",
    delay: "-4.2s",
    blurX: "55px",
    blurY: "40px",
    opacity: 0.1,
  },

  // --- Medium beams (moderate blur) ---
  {
    id: 5,
    left: "5%",
    width: "12vw",
    height: "60vh",
    color: "#00e5ffdd",
    duration: "4.2s",
    delay: "-0.8s",
    blurX: "30px",
    blurY: "20px",
    opacity: 0.22,
  },
  {
    id: 6,
    left: "28%",
    width: "10vw",
    height: "55vh",
    color: "#a855f7dd",
    duration: "5.8s",
    delay: "-3.1s",
    blurX: "28px",
    blurY: "18px",
    opacity: 0.2,
  },
  {
    id: 7,
    left: "45%",
    width: "14vw",
    height: "65vh",
    color: "#60a5fadd",
    duration: "4.9s",
    delay: "-1.5s",
    blurX: "32px",
    blurY: "22px",
    opacity: 0.18,
  },
  {
    id: 8,
    left: "63%",
    width: "11vw",
    height: "58vh",
    color: "#c084fcdd",
    duration: "6.3s",
    delay: "-4.7s",
    blurX: "26px",
    blurY: "18px",
    opacity: 0.21,
  },
  {
    id: 9,
    left: "80%",
    width: "13vw",
    height: "62vh",
    color: "#00d4ffdd",
    duration: "4.6s",
    delay: "-2.2s",
    blurX: "30px",
    blurY: "20px",
    opacity: 0.2,
  },

  // --- Narrow bright accents (sharper, faster) ---
  {
    id: 10,
    left: "12%",
    width: "4vw",
    height: "45vh",
    color: "#00ffffff",
    duration: "3.0s",
    delay: "-0.4s",
    blurX: "10px",
    blurY: "8px",
    opacity: 0.28,
  },
  {
    id: 11,
    left: "35%",
    width: "5vw",
    height: "50vh",
    color: "#d946efff",
    duration: "3.5s",
    delay: "-1.9s",
    blurX: "12px",
    blurY: "10px",
    opacity: 0.25,
  },
  {
    id: 12,
    left: "55%",
    width: "3vw",
    height: "40vh",
    color: "#38bdf8ff",
    duration: "2.8s",
    delay: "-0.7s",
    blurX: "8px",
    blurY: "6px",
    opacity: 0.3,
  },
  {
    id: 13,
    left: "72%",
    width: "4vw",
    height: "48vh",
    color: "#a78bfaff",
    duration: "3.8s",
    delay: "-2.9s",
    blurX: "10px",
    blurY: "8px",
    opacity: 0.26,
  },
  {
    id: 14,
    left: "90%",
    width: "4vw",
    height: "42vh",
    color: "#22d3eeff",
    duration: "3.2s",
    delay: "-1.3s",
    blurX: "9px",
    blurY: "7px",
    opacity: 0.27,
  },

  // --- Extra slow deep ambient glows ---
  {
    id: 15,
    left: "-10%",
    width: "55vw",
    height: "120vh",
    color: "#0ea5e944",
    duration: "10s",
    delay: "-3s",
    blurX: "90px",
    blurY: "70px",
    opacity: 0.08,
  },
  {
    id: 16,
    left: "45%",
    width: "65vw",
    height: "130vh",
    color: "#8b5cf644",
    duration: "12s",
    delay: "-6s",
    blurX: "100px",
    blurY: "80px",
    opacity: 0.07,
  },
];

export default function NeonRainBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "oklch(0.055 0.014 260)", // deep near-black
      }}
    >
      {/* Subtle noise grain overlay for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E\")",
          opacity: 0.45,
        }}
      />

      {/* Neon light beams falling from top to bottom */}
      {BEAMS.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            top: 0,
            left: b.left,
            width: b.width,
            height: b.height,
            background: `linear-gradient(to bottom, ${b.color} 0%, ${b.color} 60%, transparent 100%)`,
            filter: `blur(${b.blurX})`,
            opacity: b.opacity,
            borderRadius: "0 0 50% 50% / 0 0 80px 80px",
            animationName: "neon-beam-fall",
            animationDuration: b.duration,
            animationDelay: b.delay,
            animationTimingFunction: "cubic-bezier(0.33, 0, 0.67, 1)",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
