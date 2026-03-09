/**
 * AppBackground
 * Reads per-user background settings from localStorage and renders the
 * appropriate background. Listens for 'myid-bg-change' window events
 * to re-render when the user changes their background in Settings.
 */
import { useEffect, useState } from "react";
import AnimatedBackground from "./AnimatedBackgrounds";
import NeonRainBackground from "./NeonRainBackground";

export interface BackgroundSetting {
  type: "neon" | "preset" | "custom" | "animated";
  value?: string;
}

const SETTINGS_KEY = "myid-vault-settings-ii";

const DEFAULT_BG: BackgroundSetting = { type: "preset", value: "aurora" };

function readBackground(_username?: string): BackgroundSetting {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_BG;
    const parsed = JSON.parse(raw) as { background?: BackgroundSetting };
    return parsed.background ?? DEFAULT_BG;
  } catch {
    return DEFAULT_BG;
  }
}

interface AppBackgroundProps {
  username?: string;
}

export default function AppBackground({ username }: AppBackgroundProps) {
  const [bg, setBg] = useState<BackgroundSetting>(() =>
    readBackground(username),
  );

  // Re-read when username changes or bg-change event fires
  useEffect(() => {
    setBg(readBackground(username));

    const handler = () => {
      setBg(readBackground(username));
    };

    window.addEventListener("myid-bg-change", handler);
    return () => window.removeEventListener("myid-bg-change", handler);
  }, [username]);

  // Neon animated background
  if (bg.type === "neon") {
    return <NeonRainBackground />;
  }

  // Animated CSS backgrounds
  if (bg.type === "animated" && bg.value) {
    return <AnimatedBackground animKey={bg.value} />;
  }

  // Preset image backgrounds
  if (bg.type === "preset" && bg.value) {
    const imageUrl = `/assets/generated/bg-${bg.value}.dim_1080x1920.jpg`;
    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle dark overlay to keep UI readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, oklch(0.05 0.01 260 / 0.55), oklch(0.05 0.01 260 / 0.45))",
          }}
        />
      </div>
    );
  }

  // Custom uploaded image
  if (bg.type === "custom" && bg.value) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `url('${bg.value}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle dark overlay to keep UI readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, oklch(0.05 0.01 260 / 0.55), oklch(0.05 0.01 260 / 0.45))",
          }}
        />
      </div>
    );
  }

  // Fallback — aurora preset
  const fallbackUrl = "/assets/generated/bg-aurora.dim_1080x1920.jpg";
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: `url('${fallbackUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, oklch(0.05 0.01 260 / 0.55), oklch(0.05 0.01 260 / 0.45))",
        }}
      />
    </div>
  );
}
