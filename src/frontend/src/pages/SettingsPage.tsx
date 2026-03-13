import {
  ArrowLeft,
  Check,
  ChevronRight,
  Instagram,
  Loader2,
  Lock,
  Mail,
  Palette,
  Phone,
  Shield,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import type { BgStyle } from "../components/AnimatedBackground";
import { useGetProfile, useSaveProfile } from "../hooks/useQueries";
import {
  SECURITY_QUESTIONS,
  getAutoLock,
  getBackgroundPreference,
  getSecurityQuestion,
  hashString,
  setAutoLock,
  setBackgroundPreference,
  setSecurityQuestion,
} from "../lib/storage";

const BG_OPTIONS: { key: BgStyle; label: string; desc: string }[] = [
  { key: "neon-aurora", label: "Neon Aurora", desc: "Aurora Blobs" },
  { key: "cyber-wave", label: "Cyber Wave", desc: "Animated Gradient" },
  { key: "particle-storm", label: "Particle Storm", desc: "Neon Particles" },
  { key: "grid-pulse", label: "Grid Pulse", desc: "Neon Grid" },
  { key: "plasma-flow", label: "Plasma Flow", desc: "Plasma Wave" },
];

export default function SettingsPage({
  navigate,
  principalText,
}: {
  navigate: (p: AppPage) => void;
  principalText: string;
}) {
  const existingSecQ = getSecurityQuestion(principalText);
  const [autoLock, setAutoLockState] = useState(() =>
    getAutoLock(principalText),
  );
  const [bg, setBg] = useState(() => getBackgroundPreference());

  // Security question form
  const [showSecQForm, setShowSecQForm] = useState(false);
  const [secQuestion, setSecQuestion] = useState(
    existingSecQ?.question || SECURITY_QUESTIONS[0],
  );
  const [secAnswer, setSecAnswer] = useState("");
  const [secSaving, setSecSaving] = useState(false);

  // Profile name edit
  const { data: profile } = useGetProfile();
  const saveProfile = useSaveProfile();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const handleAutoLockToggle = () => {
    const next = !autoLock;
    setAutoLockState(next);
    setAutoLock(principalText, next);
    toast.success(next ? "Auto-lock enabled" : "Auto-lock disabled");
  };

  const handleBgChange = (style: BgStyle | "photo") => {
    setBg(style);
    setBackgroundPreference(style);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      localStorage.setItem("myid_bg_photo", url);
      setBg("photo");
      setBackgroundPreference("photo");
      toast.success("Background updated");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSecQ = () => {
    if (!secAnswer.trim()) {
      toast.error("Please enter your answer");
      return;
    }
    setSecSaving(true);
    setTimeout(() => {
      setSecurityQuestion(
        principalText,
        secQuestion,
        hashString(secAnswer.trim().toLowerCase()),
      );
      toast.success("Recovery question saved!");
      setShowSecQForm(false);
      setSecAnswer("");
      setSecSaving(false);
    }, 300);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    await saveProfile.mutateAsync(nameValue.trim());
    toast.success("Name updated!");
    setEditingName(false);
  };

  return (
    <div
      data-ocid="settings.page"
      style={{
        minHeight: "100dvh",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0 1.25rem 1rem",
        }}
      >
        <button
          type="button"
          data-ocid="settings.close_button"
          onClick={() => navigate({ type: "home" })}
          className="neon-btn"
          style={{
            background: "transparent",
            border: "1px solid rgba(0,255,255,0.2)",
            borderRadius: "8px",
            padding: "0.45rem",
            color: "rgba(0,255,255,0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1rem",
            color: "rgba(0,255,255,0.9)",
            margin: 0,
          }}
        >
          Settings
        </h2>
      </header>

      <div
        style={{
          padding: "0 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Profile section */}
        <section>
          <SectionTitle icon={<Shield size={16} />} title="Profile" />
          <div className="glass-card" style={{ padding: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(0,255,255,0.6)",
                    marginBottom: "0.2rem",
                  }}
                >
                  DISPLAY NAME
                </p>
                {editingName ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      style={{
                        background: "rgba(0,255,255,0.05)",
                        border: "1px solid rgba(0,255,255,0.3)",
                        borderRadius: "6px",
                        padding: "0.35rem 0.6rem",
                        color: "white",
                        fontFamily: "'Exo 2', sans-serif",
                        fontSize: "0.88rem",
                        outline: "none",
                        width: "140px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={saveProfile.isPending}
                      className="neon-btn"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(0,255,255,0.3)",
                        borderRadius: "6px",
                        padding: "0.3rem",
                        color: "#00ffff",
                        cursor: "pointer",
                      }}
                    >
                      {saveProfile.isPending ? (
                        <Loader2
                          size={14}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {profile?.name || "User"}
                  </p>
                )}
              </div>
              {!editingName && (
                <button
                  type="button"
                  onClick={() => {
                    setNameValue(profile?.name || "");
                    setEditingName(true);
                  }}
                  className="neon-btn"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0,255,255,0.2)",
                    borderRadius: "6px",
                    padding: "0.35rem 0.7rem",
                    color: "rgba(0,255,255,0.6)",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Account Security */}
        <section>
          <SectionTitle icon={<Lock size={16} />} title="Account Security" />
          <div
            className="glass-card"
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {/* Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.72rem",
                    color: "rgba(0,255,255,0.6)",
                    marginBottom: "0.2rem",
                  }}
                >
                  RECOVERY QUESTION
                </p>
                <p
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.82rem",
                    color: existingSecQ
                      ? "rgba(0,255,170,0.8)"
                      : "rgba(255,180,0,0.8)",
                  }}
                >
                  {existingSecQ
                    ? `✅ Set: "${existingSecQ.question.slice(0, 30)}…"`
                    : "⚠️ Not set"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSecQForm((v) => !v)}
                className="neon-btn"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,255,255,0.25)",
                  borderRadius: "6px",
                  padding: "0.35rem 0.7rem",
                  color: "rgba(0,255,255,0.6)",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}
              >
                {existingSecQ ? "Change" : "Set Up"}
              </button>
            </div>

            {/* Form */}
            {showSecQForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  borderTop: "1px solid rgba(0,255,255,0.1)",
                  paddingTop: "0.75rem",
                }}
              >
                <select
                  value={secQuestion}
                  onChange={(e) => setSecQuestion(e.target.value)}
                  data-ocid="settings.select"
                  style={{
                    width: "100%",
                    background: "rgba(0,255,255,0.05)",
                    border: "1px solid rgba(0,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={secAnswer}
                  onChange={(e) => setSecAnswer(e.target.value)}
                  data-ocid="settings.input"
                  style={{
                    width: "100%",
                    background: "rgba(0,255,255,0.05)",
                    border: "1px solid rgba(0,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "0.6rem 0.75rem",
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  data-ocid="settings.save_button"
                  onClick={handleSaveSecQ}
                  disabled={secSaving}
                  className="neon-btn"
                  style={{
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1.5px solid rgba(0,255,255,0.4)",
                    background: "rgba(0,255,255,0.1)",
                    color: "#00ffff",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  {secSaving ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Check size={14} />
                  )}
                  Save Question
                </button>
              </motion.div>
            )}

            {/* Auto-lock */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(0,255,255,0.08)",
                paddingTop: "0.75rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.72rem",
                    color: "rgba(0,255,255,0.6)",
                    marginBottom: "0.15rem",
                  }}
                >
                  AUTO-LOCK
                </p>
                <p
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Lock when tab is closed
                </p>
              </div>
              <button
                type="button"
                data-ocid="settings.switch"
                onClick={handleAutoLockToggle}
                style={{
                  width: "46px",
                  height: "26px",
                  borderRadius: "13px",
                  background: autoLock
                    ? "rgba(0,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  border: autoLock
                    ? "1px solid rgba(0,255,255,0.5)"
                    : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: autoLock ? "23px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: autoLock ? "#00ffff" : "rgba(255,255,255,0.5)",
                    transition: "all 0.2s ease",
                  }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Background */}
        <section>
          <SectionTitle icon={<Palette size={16} />} title="Background" />
          <div className="glass-card" style={{ padding: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "0.6rem",
                marginBottom: "0.75rem",
              }}
            >
              {BG_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => handleBgChange(opt.key)}
                  className="neon-btn"
                  style={{
                    padding: "0.6rem 0.75rem",
                    borderRadius: "8px",
                    border:
                      bg === opt.key
                        ? "1.5px solid rgba(0,255,255,0.6)"
                        : "1px solid rgba(0,255,255,0.15)",
                    background:
                      bg === opt.key
                        ? "rgba(0,255,255,0.12)"
                        : "rgba(0,255,255,0.03)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "0.7rem",
                      color:
                        bg === opt.key ? "#00ffff" : "rgba(255,255,255,0.75)",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {opt.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: "0.65rem",
                      color: "rgba(0,255,255,0.4)",
                    }}
                  >
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
            <label style={{ display: "block" }}>
              <input
                data-ocid="settings.upload_button"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
              <div
                className="neon-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  border:
                    bg === "photo"
                      ? "1.5px solid rgba(0,255,255,0.5)"
                      : "1px solid rgba(0,255,255,0.2)",
                  background:
                    bg === "photo" ? "rgba(0,255,255,0.1)" : "transparent",
                  color: "rgba(0,255,255,0.7)",
                  cursor: "pointer",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.8rem",
                }}
              >
                <Upload size={14} />
                {bg === "photo" ? "Change Photo" : "Upload from Gallery"}
              </div>
            </label>
          </div>
        </section>

        {/* Contact Us */}
        <section>
          <SectionTitle icon={<Phone size={16} />} title="Contact Us" />
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <ContactCard
              icon={<Phone size={18} style={{ color: "#25D366" }} />}
              label="WhatsApp"
              value="+91 7309227544"
              href="https://wa.me/917309227544"
              color="#25D366"
            />
            <div style={{ borderTop: "1px solid rgba(0,255,255,0.07)" }} />
            <ContactCard
              icon={<Mail size={18} style={{ color: "#ea4335" }} />}
              label="Email"
              value="mkumargkp111@gmail.com"
              href="mailto:mkumargkp111@gmail.com"
              color="#ea4335"
            />
            <div style={{ borderTop: "1px solid rgba(0,255,255,0.07)" }} />
            <ContactCard
              icon={<Instagram size={18} style={{ color: "#e1306c" }} />}
              label="Instagram"
              value="@er._ankush__singh"
              href="https://www.instagram.com/er._ankush__singh?igsh=MXJoOW5lYzdrbnM2bg=="
              color="#e1306c"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.5rem",
        color: "rgba(0,255,255,0.6)",
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          color: "rgba(0,255,255,0.6)",
        }}
      >
        {title.toUpperCase()}
      </span>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.9rem 1rem",
        textDecoration: "none",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          `rgba(${color === "#25D366" ? "37,211,102" : color === "#ea4335" ? "234,67,53" : "225,48,108"},0.08)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {icon}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "0.1rem",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {value}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.2)" }} />
    </a>
  );
}
