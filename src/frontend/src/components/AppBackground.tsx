/**
 * AppBackground
 * Reads per-user background settings from localStorage and renders the
 * appropriate background. Listens for 'myid-bg-change' window events
 * to re-render when the user changes their background in Settings.
 */
import { useEffect, useState } from "react";
import type { BackgroundSetting } from "../hooks/usePasswordAuth";
import NeonRainBackground from "./NeonRainBackground";

const SETTINGS_KEY_PREFIX = "myid-vault-settings-";

function readBackground(username?: string): BackgroundSetting {
  if (!username) return { type: "neon" };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY_PREFIX + username);
    if (!raw) return { type: "neon" };
    const parsed = JSON.parse(raw) as { background?: BackgroundSetting };
    return parsed.background ?? { type: "neon" };
  } catch {
    return { type: "neon" };
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

  // Neon animated background (default)
  if (bg.type === "neon" || !bg.type) {
    return <NeonRainBackground />;
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

  // Fallback
  return <NeonRainBackground />;
}
