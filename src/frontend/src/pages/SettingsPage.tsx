import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Check,
  ImageIcon,
  Instagram,
  Mail,
  MessageCircle,
  Monitor,
  Moon,
  Settings,
  Sun,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import type { BackgroundSetting } from "../components/AppBackground";

export interface UserSettings {
  theme: string;
  autoLock: boolean;
  background: BackgroundSetting;
}

const SETTINGS_KEY = "myid-vault-settings-ii";

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw)
      return {
        theme: "system",
        autoLock: false,
        background: { type: "preset", value: "aurora" },
      };
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      theme: parsed.theme ?? "system",
      autoLock: parsed.autoLock ?? false,
      background: parsed.background ?? { type: "preset", value: "aurora" },
    };
  } catch {
    return {
      theme: "system",
      autoLock: false,
      background: { type: "preset", value: "aurora" },
    };
  }
}

function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

interface SettingsPageProps {
  navigate: (page: AppPage) => void;
}

// Apply theme to document
function applyTheme(theme: string) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

type ThemeOption = "dark" | "light" | "system";

export default function SettingsPage({ navigate }: SettingsPageProps) {
  const settings = loadSettings();

  // Preferences state
  const [theme, setTheme] = useState<ThemeOption>(
    (settings.theme as ThemeOption) || "system",
  );
  const [autoLock, setAutoLock] = useState(settings.autoLock ?? false);

  // Background state
  const [currentBg, setCurrentBg] = useState<BackgroundSetting>(
    settings.background ?? { type: "preset", value: "aurora" },
  );
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | null>(
    settings.background?.type === "custom"
      ? (settings.background.value ?? null)
      : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface BgPreset {
    key: string;
    label: string;
    type: "neon" | "preset" | "video";
    value?: string;
    thumbnail?: string;
    isVideo?: boolean;
  }

  const BG_PRESETS: BgPreset[] = [
    { key: "neon", label: "Neon Rain", type: "neon" },
    {
      key: "galaxy",
      label: "Galaxy",
      type: "preset",
      value: "galaxy",
      thumbnail: "/assets/generated/bg-galaxy.dim_1080x1920.jpg",
    },
    {
      key: "waves",
      label: "Waves",
      type: "preset",
      value: "waves",
      thumbnail: "/assets/generated/bg-waves.dim_1080x1920.jpg",
    },
    {
      key: "city",
      label: "City Night",
      type: "preset",
      value: "city",
      thumbnail: "/assets/generated/bg-city.dim_1080x1920.jpg",
    },
    {
      key: "nature",
      label: "Nature",
      type: "preset",
      value: "nature",
      thumbnail: "/assets/generated/bg-nature.dim_1080x1920.jpg",
    },
    {
      key: "aurora",
      label: "Aurora",
      type: "preset",
      value: "aurora",
      thumbnail: "/assets/generated/bg-aurora.dim_1080x1920.jpg",
    },
  ];

  const VIDEO_PRESETS: BgPreset[] = [
    {
      key: "rain-window",
      label: "Rainy Window",
      type: "video",
      value: "rain-window",
      isVideo: true,
    },
    {
      key: "northern-lights",
      label: "Northern Lights",
      type: "video",
      value: "northern-lights",
      isVideo: true,
    },
    {
      key: "ocean-waves",
      label: "Ocean Waves",
      type: "video",
      value: "ocean-waves",
      isVideo: true,
    },
    {
      key: "stars-sky",
      label: "Starry Sky",
      type: "video",
      value: "stars-sky",
      isVideo: true,
    },
    {
      key: "city-lights",
      label: "City Lights",
      type: "video",
      value: "city-lights",
      isVideo: true,
    },
  ];

  const VIDEO_COLORS: Record<string, string> = {
    "rain-window": "oklch(0.65 0.16 220)",
    "northern-lights": "oklch(0.72 0.18 150)",
    "ocean-waves": "oklch(0.65 0.2 200)",
    "stars-sky": "oklch(0.7 0.14 280)",
    "city-lights": "oklch(0.72 0.18 50)",
  };

  const isPresetActive = (preset: BgPreset): boolean => {
    if (preset.type === "neon") return currentBg.type === "neon";
    if (preset.type === "video")
      return currentBg.type === "video" && currentBg.value === preset.value;
    return currentBg.type === "preset" && currentBg.value === preset.value;
  };

  const updateAndSaveSettings = (partial: Partial<UserSettings>) => {
    const current = loadSettings();
    const merged: UserSettings = { ...current, ...partial };
    saveSettings(merged);
  };

  const handleSelectPreset = (preset: BgPreset) => {
    const newBg: BackgroundSetting =
      preset.type === "neon"
        ? { type: "neon" }
        : preset.type === "video"
          ? { type: "video", value: preset.value }
          : { type: "preset", value: preset.value };
    setCurrentBg(newBg);
    setCustomPreviewUrl(null);
    updateAndSaveSettings({ background: newBg });
    window.dispatchEvent(new Event("myid-bg-change"));
    toast.success("Background updated!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image is over 5MB — it may slow down the app slightly.");
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const newBg: BackgroundSetting = { type: "custom", value: dataUrl };
      setCurrentBg(newBg);
      setCustomPreviewUrl(dataUrl);
      updateAndSaveSettings({ background: newBg });
      window.dispatchEvent(new Event("myid-bg-change"));
      toast.success("Background updated!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Apply saved theme on mount
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    updateAndSaveSettings({ theme: newTheme });
    applyTheme(newTheme);
  };

  const handleAutoLockChange = (checked: boolean) => {
    setAutoLock(checked);
    updateAndSaveSettings({ autoLock: checked });
  };

  const themeOptions: {
    value: ThemeOption;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { value: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border rgb-glow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => navigate({ type: "home" })}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            data-ocid="settings.back.button"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors btn-auto-glow-delay-2"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center rgb-glow-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                boxShadow: "0 0 10px 2px oklch(0.72 0.22 195 / 0.25)",
              }}
            >
              <Settings
                className="w-4 h-4"
                style={{ color: "oklch(0.97 0.005 240)" }}
              />
            </div>
            <h1 className="text-base font-display font-bold text-foreground leading-none">
              Settings
            </h1>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* ── Section 1: Preferences ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 22,
            mass: 0.85,
            delay: 0.05,
          }}
          className="rounded-2xl border border-border bg-card overflow-hidden rgb-glow-sm"
        >
          {/* Section header */}
          <div
            className="px-5 py-4 border-b border-border flex items-center gap-3"
            style={{ background: "oklch(0.65 0.28 300 / 0.04)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.65 0.28 300 / 0.12)" }}
            >
              <Settings
                className="w-4 h-4"
                style={{ color: "oklch(0.65 0.28 300)" }}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Preferences
              </h2>
              <p className="text-xs text-muted-foreground">
                Theme and session settings
              </p>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Theme selector */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">App Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose how MyID Vault looks
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => handleThemeChange(opt.value)}
                    whileTap={{ scale: 0.96 }}
                    data-ocid={`settings.theme.${opt.value}.toggle`}
                    className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                      theme === opt.value
                        ? "rgb-glow"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                    style={
                      theme === opt.value
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.72 0.22 195 / 0.1), oklch(0.65 0.28 300 / 0.06))",
                            border: "1.5px solid oklch(0.72 0.22 195 / 0.5)",
                            color: "oklch(0.72 0.22 195)",
                          }
                        : {}
                    }
                  >
                    {opt.icon}
                    <span className="text-xs">{opt.label}</span>
                    {theme === opt.value && (
                      <motion.div
                        layoutId="theme-active"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "oklch(0.72 0.22 195)" }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px w-full rgb-glow-sm"
              style={{ background: "oklch(0.22 0.03 260)" }}
            />

            {/* Auto-lock toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Auto-lock on Tab Close
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  When enabled, you'll be logged out automatically when you
                  close the browser tab.
                </p>
              </div>
              <Switch
                checked={autoLock}
                onCheckedChange={handleAutoLockChange}
                data-ocid="settings.autolock.switch"
                className="mt-0.5 flex-shrink-0"
                aria-label="Auto-lock on tab close"
              />
            </div>
          </div>
        </motion.section>

        {/* ── Section 2: Background ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 22,
            mass: 0.85,
            delay: 0.12,
          }}
          className="rounded-2xl border border-border bg-card overflow-hidden rgb-glow-sm"
          data-ocid="settings.background.section"
        >
          {/* Section header */}
          <div
            className="px-5 py-4 border-b border-border flex items-center gap-3"
            style={{ background: "oklch(0.62 0.22 60 / 0.04)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.62 0.22 60 / 0.14)" }}
            >
              <ImageIcon
                className="w-4 h-4"
                style={{ color: "oklch(0.75 0.22 60)" }}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Background
              </h2>
              <p className="text-xs text-muted-foreground">
                Personalise your app background
              </p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Preset label */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Choose a Preset
            </p>

            {/* Preset grid — 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              {BG_PRESETS.map((preset, idx) => {
                const active = isPresetActive(preset);
                const ocidIdx = idx + 1;
                return (
                  <motion.button
                    key={preset.key}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleSelectPreset(preset)}
                    data-ocid={`settings.background.preset.item.${ocidIdx}`}
                    className="relative flex flex-col items-center rounded-xl overflow-hidden focus:outline-none"
                    style={{
                      border: active
                        ? "2px solid oklch(0.75 0.22 60)"
                        : "2px solid oklch(0.22 0.03 260 / 0.6)",
                      aspectRatio: "9/16",
                      boxShadow: active
                        ? "0 0 12px 2px oklch(0.75 0.22 60 / 0.4)"
                        : "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    aria-label={`Select ${preset.label} background`}
                    aria-pressed={active}
                  >
                    {/* Thumbnail */}
                    {preset.type === "neon" ? (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(160deg, oklch(0.055 0.014 260) 0%, oklch(0.12 0.08 220) 40%, oklch(0.08 0.06 280) 70%, oklch(0.055 0.014 260) 100%)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: "15%",
                            width: "25%",
                            height: "70%",
                            background:
                              "linear-gradient(to bottom, #00eaffaa, transparent)",
                            filter: "blur(8px)",
                            opacity: 0.6,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: "55%",
                            width: "30%",
                            height: "60%",
                            background:
                              "linear-gradient(to bottom, #a855f7aa, transparent)",
                            filter: "blur(10px)",
                            opacity: 0.5,
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={preset.thumbnail}
                        alt={preset.label}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Dark overlay for label readability */}
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0.04 0.01 260 / 0.85) 0%, transparent 100%)",
                        paddingBottom: "6px",
                        paddingTop: "14px",
                      }}
                    >
                      <p
                        className="text-center text-xs font-semibold leading-tight"
                        style={{ color: "oklch(0.97 0.005 240)" }}
                      >
                        {preset.label}
                      </p>
                    </div>

                    {/* Active checkmark overlay */}
                    {active && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: "oklch(0.75 0.22 60)",
                          boxShadow: "0 0 6px 1px oklch(0.75 0.22 60 / 0.6)",
                        }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: "oklch(0.1 0.02 60)" }}
                        />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div
              className="h-px w-full"
              style={{ background: "oklch(0.22 0.03 260)" }}
            />

            {/* Live Video Wallpapers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Live Video Wallpapers
                </p>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.55 0.22 270 / 0.18)",
                    color: "oklch(0.72 0.18 270)",
                    border: "1px solid oklch(0.55 0.22 270 / 0.3)",
                  }}
                >
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {VIDEO_PRESETS.map((preset, idx) => {
                  const active = isPresetActive(preset);
                  const color =
                    VIDEO_COLORS[preset.value ?? ""] ?? "oklch(0.65 0.15 260)";
                  return (
                    <motion.button
                      key={preset.key}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectPreset(preset)}
                      data-ocid={`settings.background.video.item.${idx + 1}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
                      style={{
                        border: active
                          ? `1.5px solid ${color}`
                          : "1.5px solid oklch(0.22 0.03 260 / 0.8)",
                        background: active
                          ? "oklch(0.12 0.03 260 / 0.8)"
                          : "oklch(0.10 0.02 260 / 0.5)",
                        boxShadow: active ? `0 0 10px 1px ${color}55` : "none",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      aria-pressed={active}
                      aria-label={`Select ${preset.label} live wallpaper`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${color}22`,
                          border: `1px solid ${color}44`,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-label="Video wallpaper"
                          role="img"
                        >
                          <title>Video</title>
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect
                            x="1"
                            y="5"
                            width="15"
                            height="14"
                            rx="2"
                            ry="2"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {preset.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Looping ambient video
                        </p>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: color,
                            boxShadow: `0 0 6px 1px ${color}88`,
                          }}
                        >
                          <Check
                            className="w-3 h-3"
                            style={{ color: "oklch(0.1 0.02 260)" }}
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px w-full"
              style={{ background: "oklch(0.22 0.03 260)" }}
            />

            {/* Upload from Gallery */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Upload from Gallery
              </p>

              {/* Custom preview thumbnail */}
              <AnimatePresence>
                {customPreviewUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="relative rounded-xl overflow-hidden"
                      style={{
                        height: "120px",
                        border:
                          currentBg.type === "custom"
                            ? "2px solid oklch(0.75 0.22 60)"
                            : "2px solid oklch(0.22 0.03 260)",
                        boxShadow:
                          currentBg.type === "custom"
                            ? "0 0 12px 2px oklch(0.75 0.22 60 / 0.35)"
                            : "none",
                      }}
                    >
                      <img
                        src={customPreviewUrl}
                        alt="Custom background preview"
                        className="w-full h-full object-cover"
                      />
                      {currentBg.type === "custom" && (
                        <div
                          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: "oklch(0.75 0.22 60 / 0.9)",
                            color: "oklch(0.1 0.02 60)",
                          }}
                        >
                          <Check className="w-3 h-3" />
                          Active
                        </div>
                      )}
                      <div
                        className="absolute bottom-0 left-0 right-0 px-3 py-2"
                        style={{
                          background:
                            "linear-gradient(to top, oklch(0.04 0.01 260 / 0.8), transparent)",
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: "oklch(0.92 0.005 240)" }}
                        >
                          Your custom background
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                aria-label="Upload background image"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => fileInputRef.current?.click()}
                data-ocid="settings.background.upload_button"
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all btn-auto-glow-delay-2"
                style={{
                  border: "1.5px dashed oklch(0.35 0.04 260)",
                  background: "oklch(0.12 0.03 260 / 0.6)",
                  color: "oklch(0.75 0.05 240)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.62 0.22 60 / 0.14)",
                  }}
                >
                  <Upload
                    className="w-4 h-4"
                    style={{ color: "oklch(0.75 0.22 60)" }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {customPreviewUrl ? "Change Photo" : "Choose from Gallery"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    JPG, PNG, WEBP — recommended under 5MB
                  </p>
                </div>
                <Upload
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "oklch(0.75 0.22 60)" }}
                />
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* ── Section 3: Contact Us ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 22,
            mass: 0.85,
            delay: 0.19,
          }}
          className="rounded-2xl border border-border bg-card overflow-hidden rgb-glow-sm"
          data-ocid="settings.contact.section"
        >
          {/* Section header */}
          <div
            className="px-5 py-4 border-b border-border flex items-center gap-3"
            style={{ background: "oklch(0.72 0.22 130 / 0.04)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.72 0.22 130 / 0.12)" }}
            >
              <MessageCircle
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.22 130)" }}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Contact Us
              </h2>
              <p className="text-xs text-muted-foreground">
                Reach out via WhatsApp, Email, or Instagram
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/917309227544"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              data-ocid="settings.contact.whatsapp.button"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl border border-border bg-background hover:border-green-500/40 transition-all group btn-auto-glow-delay-1"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                style={{
                  background: "oklch(0.55 0.22 145 / 0.15)",
                  border: "1px solid oklch(0.55 0.22 145 / 0.3)",
                }}
              >
                <MessageCircle
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.22 145)" }}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">
                  WhatsApp
                </p>
                <p className="text-xs text-muted-foreground">+91 7309227544</p>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors text-xs font-medium">
                Chat →
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:mkumargkp111@gmail.com"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              data-ocid="settings.contact.email.button"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl border border-border bg-background hover:border-blue-500/40 transition-all group btn-auto-glow-delay-2"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                style={{
                  background: "oklch(0.60 0.22 240 / 0.15)",
                  border: "1px solid oklch(0.60 0.22 240 / 0.3)",
                }}
              >
                <Mail
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.22 240)" }}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Email</p>
                <p className="text-xs text-muted-foreground">
                  mkumargkp111@gmail.com
                </p>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors text-xs font-medium">
                Write →
              </div>
            </motion.a>

            {/* Instagram */}
            <motion.a
              href="https://www.instagram.com/er._ankush__singh?igsh=MXJoOW5lYzdrbnM2bg=="
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              data-ocid="settings.contact.instagram.button"
              className="flex items-center gap-4 w-full px-4 py-3 rounded-xl border border-border bg-background hover:border-pink-500/40 transition-all group btn-auto-glow-delay-3"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                style={{
                  background: "oklch(0.60 0.28 350 / 0.15)",
                  border: "1px solid oklch(0.60 0.28 350 / 0.3)",
                }}
              >
                <Instagram
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.28 350)" }}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">
                  Instagram
                </p>
                <p className="text-xs text-muted-foreground">
                  @er._ankush__singh
                </p>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors text-xs font-medium">
                Follow →
              </div>
            </motion.a>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 px-4 text-xs text-muted-foreground border-t border-border rgb-glow-sm space-y-1">
        <p className="font-medium text-foreground/70">
          Made with <span className="text-red-500">♥️</span> by Ankush Singh |
          Caffeine For Students
        </p>
        <p>© 2026 All Rights Reserved</p>
      </footer>
    </div>
  );
}
