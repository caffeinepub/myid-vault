import { useMemo } from "react";

export type BgStyle =
  | "cyber-wave"
  | "particle-storm"
  | "neon-aurora"
  | "grid-pulse"
  | "plasma-flow"
  | "photo";

interface Props {
  style: BgStyle;
  photoUrl?: string;
}

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

const AURORA_BEAMS = [
  { color: "#00ffff", width: 45, left: 5, height: 90, duration: 8, delay: 0 },
  {
    color: "#7b00ff",
    width: 55,
    left: 25,
    height: 110,
    duration: 11,
    delay: 2,
  },
  { color: "#0066ff", width: 40, left: 50, height: 95, duration: 9, delay: 1 },
  {
    color: "#ff00cc",
    width: 50,
    left: 65,
    height: 105,
    duration: 12,
    delay: 3,
  },
  {
    color: "#00ffaa",
    width: 35,
    left: 82,
    height: 88,
    duration: 10,
    delay: 1.5,
  },
];

const PLASMA_BLOBS = [
  {
    color: "rgba(0,255,255,0.15)",
    size: 55,
    left: 15,
    top: 20,
    duration: 14,
    delay: 0,
  },
  {
    color: "rgba(123,0,255,0.15)",
    size: 65,
    left: 55,
    top: 60,
    duration: 18,
    delay: 3,
  },
  {
    color: "rgba(0,102,255,0.12)",
    size: 45,
    left: 75,
    top: 15,
    duration: 12,
    delay: 1,
  },
  {
    color: "rgba(255,0,204,0.12)",
    size: 50,
    left: 30,
    top: 70,
    duration: 16,
    delay: 5,
  },
  {
    color: "rgba(0,255,170,0.10)",
    size: 40,
    left: 85,
    top: 45,
    duration: 20,
    delay: 2,
  },
];

export default function AnimatedBackground({ style, photoUrl }: Props) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: (i * 37 + 13) % 100,
        top: (i * 53 + 7) % 100,
        size: (i % 4) + 1.5,
        duration: (i % 6) + 4,
        delay: (i % 7) * 0.8,
        color: ["#00ffff", "#7b00ff", "#00ff88", "#ff00cc", "#0088ff"][i % 5],
        opacity: 0.4 + (i % 5) * 0.12,
      })),
    [],
  );

  const base: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    overflow: "hidden",
    background: "#030308",
  };

  if (style === "photo" && photoUrl) {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
          }}
        />
      </div>
    );
  }

  if (style === "cyber-wave") {
    return (
      <div
        style={{
          ...base,
          background:
            "linear-gradient(-45deg, #000510, #000d1a, #000520, #060018, #001020, #000510)",
          backgroundSize: "400% 400%",
          animation: "cyberWaveAnim 12s ease infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(0,255,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 98px, rgba(0,255,255,0.04) 99px, transparent 100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 98px, rgba(0,255,255,0.04) 99px, transparent 100px)",
          }}
        />
      </div>
    );
  }

  if (style === "particle-storm") {
    return (
      <div style={{ ...base }}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              opacity: p.opacity,
              animation: `particleFloat ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (style === "neon-aurora") {
    return (
      <div style={{ ...base }}>
        {AURORA_BEAMS.map((beam) => (
          <div
            key={beam.color}
            style={{
              position: "absolute",
              top: "-20%",
              left: `${beam.left}%`,
              width: `${beam.width}%`,
              height: `${beam.height}%`,
              background: `linear-gradient(180deg, ${beam.color}33 0%, ${beam.color}88 30%, ${beam.color}44 60%, transparent 100%)`,
              filter: "blur(60px)",
              opacity: 0.7,
              animation: `auroraFlow ${beam.duration}s ease-in-out infinite`,
              animationDelay: `${beam.delay}s`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(0,255,255,0.06) 0%, transparent 60%)",
          }}
        />
      </div>
    );
  }

  if (style === "grid-pulse") {
    return (
      <div style={{ ...base }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,255,255,0.08) 0px, transparent 1px, transparent 59px, rgba(0,255,255,0.08) 60px)," +
              "repeating-linear-gradient(0deg, rgba(0,255,255,0.08) 0px, transparent 1px, transparent 59px, rgba(0,255,255,0.08) 60px)",
            animation: "gridPulseAnim 3s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(123,0,255,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(0,255,255,0.06) 0%, transparent 50%)",
          }}
        />
      </div>
    );
  }

  if (style === "plasma-flow") {
    return (
      <div style={{ ...base }}>
        {PLASMA_BLOBS.map((blob) => (
          <div
            key={blob.color}
            style={{
              position: "absolute",
              left: `${blob.left}%`,
              top: `${blob.top}%`,
              width: `${blob.size}vw`,
              height: `${blob.size}vw`,
              background: blob.color,
              filter: "blur(50px)",
              animation: `plasmaBlob ${blob.duration}s ease-in-out infinite`,
              animationDelay: `${blob.delay}s`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 70%, rgba(0,255,255,0.05) 0%, transparent 60%)",
          }}
        />
      </div>
    );
  }

  // Default fallback
  return <div style={{ ...base }} />;
}
