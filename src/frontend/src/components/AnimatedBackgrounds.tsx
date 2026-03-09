/**
 * AnimatedBackgrounds
 * Pure CSS / canvas animated background components for the background selector.
 * All backgrounds are fixed, inset-0, z-0, pointer-events-none, aria-hidden.
 */
import { useEffect, useRef } from "react";

/* ─── Shared base styles ─── */
const BASE_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
};

/* ══════════════════════════════════════════════════════════════
   1. CyberWaveBackground — Animated Gradient
   Smooth 8-second diagonal gradient cycle: cyan → violet → deep blue
   ══════════════════════════════════════════════════════════════ */
export function CyberWaveBackground() {
  return (
    <>
      <style>{`
        @keyframes cyber-wave-shift {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 100% 0%; }
          50%  { background-position: 100% 100%; }
          75%  { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes cyber-wave-shimmer {
          0%   { opacity: 0.4; transform: scale(1); }
          50%  { opacity: 0.7; transform: scale(1.08); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        .cyber-wave-base {
          animation: cyber-wave-shift 8s ease infinite;
          background-size: 300% 300%;
        }
        .cyber-wave-overlay {
          animation: cyber-wave-shimmer 5s ease-in-out infinite;
        }
      `}</style>
      <div aria-hidden="true" style={BASE_STYLE}>
        {/* Base gradient layer */}
        <div
          className="cyber-wave-base"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, oklch(0.04 0.01 260) 0%, oklch(0.72 0.22 195) 25%, oklch(0.65 0.28 300) 50%, oklch(0.12 0.12 260) 75%, oklch(0.04 0.01 260) 100%)",
          }}
        />
        {/* Overlay shimmer blob */}
        <div
          className="cyber-wave-overlay"
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, oklch(0.72 0.22 195 / 0.35) 0%, oklch(0.65 0.28 300 / 0.15) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Dark vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 20%, oklch(0.04 0.01 260 / 0.7) 100%)",
          }}
        />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   2. ParticleStormBackground — Neon Particles
   60 glowing neon particles on a dark canvas, wrapping at edges
   ══════════════════════════════════════════════════════════════ */
const PARTICLE_COLORS = [
  [0, 234, 255], // neon cyan
  [168, 85, 247], // violet
  [236, 72, 153], // pink
  [0, 255, 170], // teal-green
  [100, 120, 255], // blue-violet
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: number[];
  alpha: number;
  alphaDelta: number;
}

export function ParticleStormBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;

    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < 60; i++) {
        const color =
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4,
          r: Math.random() * 2 + 1.5,
          color,
          alpha: Math.random() * 0.5 + 0.4,
          alphaDelta: (Math.random() - 0.5) * 0.015,
        });
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Dark background
      ctx.fillStyle = "oklch(0.04 0.01 260)";
      ctx.fillRect(0, 0, W, H);

      for (const p of particles) {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDelta;
        if (p.alpha > 0.9 || p.alpha < 0.15) p.alphaDelta = -p.alphaDelta;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Glow shadow
        ctx.shadowBlur = 14;
        ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.8)`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", () => {
        resize();
        initParticles();
      });
    };
  }, []);

  return (
    <div aria-hidden="true" style={BASE_STYLE}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3. NeonAuroraBackground — Aurora Blobs
   5 large blurred neon blobs floating slowly
   ══════════════════════════════════════════════════════════════ */
export function NeonAuroraBackground() {
  const blobs = [
    {
      color: "oklch(0.72 0.22 195)",
      top: "-10%",
      left: "5%",
      size: 380,
      dur: 8,
      tx1: 40,
      ty1: 60,
      tx2: -30,
      ty2: 20,
      blur: 90,
    },
    {
      color: "oklch(0.65 0.28 300)",
      top: "20%",
      left: "60%",
      size: 320,
      dur: 11,
      tx1: -60,
      ty1: 30,
      tx2: 40,
      ty2: -50,
      blur: 100,
    },
    {
      color: "oklch(0.65 0.28 350)",
      top: "55%",
      left: "15%",
      size: 280,
      dur: 14,
      tx1: 50,
      ty1: -40,
      tx2: -20,
      ty2: 60,
      blur: 80,
    },
    {
      color: "oklch(0.72 0.22 170)",
      top: "70%",
      left: "65%",
      size: 350,
      dur: 9,
      tx1: -30,
      ty1: -50,
      tx2: 60,
      ty2: 30,
      blur: 110,
    },
    {
      color: "oklch(0.62 0.25 240)",
      top: "30%",
      left: "35%",
      size: 260,
      dur: 12,
      tx1: 30,
      ty1: 50,
      tx2: -50,
      ty2: -30,
      blur: 85,
    },
  ];

  return (
    <>
      <style>{`
        ${blobs
          .map(
            (b, i) => `
          @keyframes aurora-blob-${i} {
            0%   { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(${b.tx1}px, ${b.ty1}px) scale(1.12); }
            66%  { transform: translate(${b.tx2}px, ${b.ty2}px) scale(0.92); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .aurora-blob-${i} {
            animation: aurora-blob-${i} ${b.dur}s ease-in-out infinite;
          }
        `,
          )
          .join("")}
      `}</style>
      <div
        aria-hidden="true"
        style={{ ...BASE_STYLE, background: "oklch(0.04 0.01 260)" }}
      >
        {blobs.map((b, i) => (
          <div
            key={b.color}
            className={`aurora-blob-${i}`}
            style={{
              position: "absolute",
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
              filter: `blur(${b.blur}px)`,
              opacity: 0.65,
            }}
          />
        ))}
        {/* Vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 30%, oklch(0.04 0.01 260 / 0.6) 100%)",
          }}
        />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   4. GridPulseBackground — Neon Grid
   SVG neon cyan grid with pulsing opacity + radial fade overlay
   ══════════════════════════════════════════════════════════════ */
export function GridPulseBackground() {
  return (
    <>
      <style>{`
        @keyframes grid-pulse {
          0%   { opacity: 0.15; }
          50%  { opacity: 0.50; }
          100% { opacity: 0.15; }
        }
        @keyframes grid-scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .grid-lines {
          animation: grid-pulse 3s ease-in-out infinite;
        }
        .grid-scan-line {
          animation: grid-scan 6s linear infinite;
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{ ...BASE_STYLE, background: "oklch(0.04 0.01 260)" }}
      >
        {/* SVG grid */}
        <svg
          className="grid-lines"
          aria-hidden="true"
          role="presentation"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="neon-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="oklch(0.72 0.22 195)"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neon-grid)" />
        </svg>

        {/* Horizontal scan line */}
        <div
          className="grid-scan-line"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, oklch(0.72 0.22 195 / 0.8) 40%, oklch(0.72 0.22 195) 50%, oklch(0.72 0.22 195 / 0.8) 60%, transparent)",
            boxShadow: "0 0 12px 3px oklch(0.72 0.22 195 / 0.5)",
          }}
        />

        {/* Radial vignette — fades edges to dark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at center, transparent 0%, oklch(0.04 0.01 260 / 0.85) 100%)",
          }}
        />

        {/* Centre glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 40% 35% at 50% 50%, oklch(0.72 0.22 195 / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   5. PlasmaFlowBackground — Plasma Wave
   3 rotating radial-gradient layers with screen blend mode
   ══════════════════════════════════════════════════════════════ */
export function PlasmaFlowBackground() {
  return (
    <>
      <style>{`
        @keyframes plasma-rotate-1 {
          from { transform: rotate(0deg) scale(1); }
          to   { transform: rotate(360deg) scale(1.05); }
        }
        @keyframes plasma-rotate-2 {
          from { transform: rotate(0deg) scale(1.1); }
          to   { transform: rotate(-360deg) scale(1); }
        }
        @keyframes plasma-rotate-3 {
          from { transform: rotate(180deg) scale(0.95); }
          to   { transform: rotate(-180deg) scale(1.1); }
        }
        @keyframes plasma-pulse {
          0%   { opacity: 0.55; }
          50%  { opacity: 0.75; }
          100% { opacity: 0.55; }
        }
        .plasma-layer-1 {
          animation:
            plasma-rotate-1 15s linear infinite,
            plasma-pulse 4s ease-in-out infinite;
        }
        .plasma-layer-2 {
          animation:
            plasma-rotate-2 22s linear infinite,
            plasma-pulse 6s ease-in-out infinite 1s;
        }
        .plasma-layer-3 {
          animation:
            plasma-rotate-3 30s linear infinite,
            plasma-pulse 5s ease-in-out infinite 2s;
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{ ...BASE_STYLE, background: "oklch(0.04 0.01 260)" }}
      >
        {/* Layer 1 — orange-red */}
        <div
          className="plasma-layer-1"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "160vmax",
            height: "160vmax",
            marginTop: "-80vmax",
            marginLeft: "-80vmax",
            background:
              "radial-gradient(ellipse 55% 35% at 50% 50%, oklch(0.72 0.28 40) 0%, oklch(0.55 0.25 20 / 0.5) 40%, transparent 70%)",
            mixBlendMode: "screen",
            opacity: 0.65,
          }}
        />

        {/* Layer 2 — cyan-violet */}
        <div
          className="plasma-layer-2"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "140vmax",
            height: "140vmax",
            marginTop: "-70vmax",
            marginLeft: "-70vmax",
            background:
              "radial-gradient(ellipse 40% 60% at 50% 50%, oklch(0.72 0.22 195) 0%, oklch(0.65 0.28 300 / 0.5) 45%, transparent 70%)",
            mixBlendMode: "screen",
            opacity: 0.7,
          }}
        />

        {/* Layer 3 — pink-magenta */}
        <div
          className="plasma-layer-3"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "120vmax",
            height: "120vmax",
            marginTop: "-60vmax",
            marginLeft: "-60vmax",
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.68 0.28 340) 0%, oklch(0.55 0.22 280 / 0.4) 50%, transparent 70%)",
            mixBlendMode: "screen",
            opacity: 0.7,
          }}
        />

        {/* Dark overlay to keep things readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "oklch(0.04 0.01 260 / 0.45)",
          }}
        />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   AnimatedBackground — dispatcher
   ══════════════════════════════════════════════════════════════ */
const ANIMATED_MAP: Record<string, React.ComponentType> = {
  "cyber-wave": CyberWaveBackground,
  "particle-storm": ParticleStormBackground,
  "neon-aurora": NeonAuroraBackground,
  "grid-pulse": GridPulseBackground,
  "plasma-flow": PlasmaFlowBackground,
};

interface AnimatedBackgroundProps {
  animKey: string;
}

export default function AnimatedBackground({
  animKey,
}: AnimatedBackgroundProps) {
  const Component = ANIMATED_MAP[animKey];
  if (!Component) return null;
  return <Component />;
}
