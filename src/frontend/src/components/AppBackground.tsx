/**
 * AppBackground
 * Reads per-user background settings from localStorage and renders the
 * appropriate background. Listens for 'myid-bg-change' window events
 * to re-render when the user changes their background in Settings.
 */
import { useEffect, useRef, useState } from "react";
import NeonRainBackground from "./NeonRainBackground";

export interface BackgroundSetting {
  type: "neon" | "preset" | "custom" | "video";
  value?: string;
}

const SETTINGS_KEY = "myid-vault-settings-ii";

const DEFAULT_BG: BackgroundSetting = { type: "preset", value: "aurora" };

// Live video wallpaper sources (looping ambient videos via public CDN)
const VIDEO_SOURCES: Record<string, string> = {
  "rain-window":
    "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-window-18271-large.mp4",
  "northern-lights":
    "https://assets.mixkit.co/videos/preview/mixkit-northern-lights-in-a-starry-night-sky-4901-large.mp4",
  "ocean-waves":
    "https://assets.mixkit.co/videos/preview/mixkit-waves-coming-from-the-sea-on-a-night-beach-18093-large.mp4",
  "stars-sky":
    "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4",
  "city-lights":
    "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4",
};

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

function VideoBackground({ videoKey }: { videoKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = VIDEO_SOURCES[videoKey];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // autoplay blocked — still show static poster
    });
  }, []);

  if (!src) return <NeonRainBackground />;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "oklch(0.05 0.01 260)",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {/* Subtle dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, oklch(0.04 0.01 260 / 0.45), oklch(0.04 0.01 260 / 0.35))",
        }}
      />
    </div>
  );
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

  // Live video backgrounds
  if (bg.type === "video" && bg.value) {
    return <VideoBackground videoKey={bg.value} />;
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
