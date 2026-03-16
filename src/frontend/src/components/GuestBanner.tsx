import { LogIn, Trash2, UserX } from "lucide-react";
import { motion } from "motion/react";

export default function GuestBanner({
  onLogin,
  onClearData,
}: {
  onLogin: () => void;
  onClearData: () => void;
}) {
  return (
    <motion.div
      data-ocid="guest.panel"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={{
        margin: "0 1.25rem 0.85rem",
        background:
          "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,120,0,0.08))",
        border: "1px solid rgba(255,180,0,0.4)",
        borderRadius: "12px",
        padding: "0.65rem 0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        boxShadow: "0 0 18px rgba(255,180,0,0.08)",
      }}
    >
      <UserX size={16} style={{ color: "#ffb400", flexShrink: 0 }} />
      <span
        style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: "0.78rem",
          color: "rgba(255,200,0,0.9)",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        Guest Mode — data saved locally only
      </span>
      <button
        type="button"
        data-ocid="guest.delete_button"
        onClick={onClearData}
        title="Clear guest data"
        style={{
          background: "rgba(255,100,0,0.12)",
          border: "1px solid rgba(255,100,0,0.3)",
          borderRadius: "6px",
          padding: "0.25rem 0.5rem",
          color: "rgba(255,140,0,0.9)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          fontSize: "0.7rem",
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        <Trash2 size={12} />
        Clear
      </button>
      <button
        type="button"
        data-ocid="guest.login_button"
        onClick={onLogin}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,180,0,0.2), rgba(255,120,0,0.15))",
          border: "1px solid rgba(255,180,0,0.5)",
          borderRadius: "6px",
          padding: "0.25rem 0.65rem",
          color: "#ffb400",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          fontSize: "0.72rem",
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.04em",
          flexShrink: 0,
          boxShadow: "0 0 10px rgba(255,180,0,0.15)",
        }}
      >
        <LogIn size={12} />
        Login
      </button>
    </motion.div>
  );
}
