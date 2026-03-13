import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Car,
  CreditCard,
  Fingerprint,
  GraduationCap,
  Loader2,
  LogOut,
  Plus,
  School,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AppPage } from "../App";
import type { IDCard } from "../backend";
import { useGetAllCards } from "../hooks/useQueries";
import { useGetProfile } from "../hooks/useQueries";
import { getSecurityQuestion } from "../lib/storage";

const BRANDING_FOOTER = (
  <footer
    style={{
      textAlign: "center",
      fontFamily: "'Exo 2', sans-serif",
      fontSize: "0.7rem",
      color: "rgba(0,255,255,0.3)",
      padding: "0.75rem",
      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
      marginTop: "auto",
    }}
  >
    <div>Made with ❤️ by Ankush Singh | Caffeine For Students</div>
    <div style={{ color: "rgba(255,255,255,0.15)", marginTop: "0.15rem" }}>
      &copy; 2026 All Rights Reserved
    </div>
  </footer>
);

function getCategoryIcon(card: IDCard) {
  if (card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    if (c.collegeName.toLowerCase().includes("school"))
      return <School size={20} />;
    return <GraduationCap size={20} />;
  }
  const idType = card.cardType.other.idType;
  if (idType === "Aadhaar") return <Fingerprint size={20} />;
  if (idType === "PAN") return <CreditCard size={20} />;
  if (idType === "Passport") return <BookOpen size={20} />;
  if (idType === "Driving Licence") return <Car size={20} />;
  if (idType === "Voter ID") return <BadgeCheck size={20} />;
  return <CreditCard size={20} />;
}

function getCardInfo(card: IDCard) {
  if (card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    return {
      name: c.fullName,
      idType: "College ID",
      idNumber: c.enrollmentNo,
      subtitle: c.collegeName,
      photoUrl: c.photo.getDirectURL(),
    };
  }
  const o = card.cardType.other;
  return {
    name: o.fullName,
    idType: o.idType,
    idNumber: o.idNumber,
    subtitle: o.issuedBy || o.idType,
    photoUrl: o.photo.getDirectURL(),
  };
}

function maskId(id: string): string {
  if (!id || id.length < 4) return id;
  return `${id.slice(0, 4)} •••• ••••`;
}

const CARD_GRADIENT_MAP: Record<string, string> = {
  Aadhaar: "linear-gradient(135deg, rgba(0,80,60,0.6), rgba(0,40,30,0.8))",
  PAN: "linear-gradient(135deg, rgba(60,40,0,0.6), rgba(30,20,0,0.8))",
  Passport: "linear-gradient(135deg, rgba(0,40,80,0.6), rgba(0,20,40,0.8))",
  "Driving Licence":
    "linear-gradient(135deg, rgba(40,0,80,0.6), rgba(20,0,40,0.8))",
  "Voter ID": "linear-gradient(135deg, rgba(80,0,40,0.6), rgba(40,0,20,0.8))",
  "College ID": "linear-gradient(135deg, rgba(0,60,80,0.6), rgba(0,30,40,0.8))",
};

function IDCardTile({
  card,
  index,
  onClick,
}: {
  card: IDCard;
  index: number;
  onClick: () => void;
}) {
  const info = getCardInfo(card);
  const bg =
    CARD_GRADIENT_MAP[info.idType] ||
    "linear-gradient(135deg, rgba(0,40,60,0.6), rgba(0,20,30,0.8))";

  return (
    <button
      type="button"
      data-ocid={`card.item.${index + 1}`}
      onClick={onClick}
      className="neon-card"
      style={{
        background: bg,
        border: "1px solid rgba(0,255,255,0.18)",
        borderRadius: "14px",
        padding: "1rem",
        cursor: "pointer",
        animationDelay: `${index * 0.06}s`,
        animation: "bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        backdropFilter: "blur(10px)",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <span style={{ color: "rgba(0,255,255,0.7)" }}>
          {getCategoryIcon(card)}
        </span>
        <span
          style={{
            background: "rgba(0,255,255,0.12)",
            border: "1px solid rgba(0,255,255,0.2)",
            color: "rgba(0,255,255,0.8)",
            fontSize: "0.65rem",
            padding: "0.1rem 0.4rem",
            borderRadius: "4px",
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          {info.idType}
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.9)",
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: "0.2rem",
        }}
      >
        {info.name}
      </p>
      <p
        style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: "0.72rem",
          color: "rgba(0,255,255,0.5)",
          letterSpacing: "0.08em",
        }}
      >
        {maskId(info.idNumber)}
      </p>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(0,255,255,0.04)",
        border: "1px solid rgba(0,255,255,0.08)",
        borderRadius: "14px",
        padding: "1rem",
        animation: "gridPulseAnim 1.5s ease-in-out infinite",
      }}
    >
      <div
        style={{
          height: "16px",
          background: "rgba(0,255,255,0.08)",
          borderRadius: "6px",
          marginBottom: "0.6rem",
          width: "40%",
        }}
      />
      <div
        style={{
          height: "14px",
          background: "rgba(0,255,255,0.06)",
          borderRadius: "4px",
          marginBottom: "0.4rem",
          width: "80%",
        }}
      />
      <div
        style={{
          height: "12px",
          background: "rgba(0,255,255,0.04)",
          borderRadius: "4px",
          width: "60%",
        }}
      />
    </div>
  );
}

export default function HomePage({
  navigate,
  principalText,
  onLogout,
}: {
  navigate: (p: AppPage) => void;
  principalText: string;
  onLogout: () => void;
}) {
  const [search, setSearch] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { data: cards, isLoading } = useGetAllCards();
  const { data: profile } = useGetProfile();

  const userName = profile?.name || "User";
  const hasSecQ = !!getSecurityQuestion(principalText);
  const showBanner = !hasSecQ && !bannerDismissed;

  const filtered = (cards || []).filter((c) => {
    if (!search) return true;
    const info = getCardInfo(c);
    const q = search.toLowerCase();
    return (
      info.name.toLowerCase().includes(q) ||
      info.idType.toLowerCase().includes(q) ||
      info.idNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem 0.75rem",
        }}
      >
        <span className="neon-text-3d" style={{ fontSize: "1.4rem" }}>
          MyID Vault
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.78rem",
              color: "rgba(0,255,255,0.5)",
            }}
          >
            {userName}
          </span>
          <button
            type="button"
            data-ocid="home.settings_button"
            onClick={() => navigate({ type: "settings" })}
            className="neon-btn"
            style={{
              background: "transparent",
              border: "1px solid rgba(0,255,255,0.25)",
              borderRadius: "8px",
              padding: "0.45rem",
              color: "rgba(0,255,255,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            data-ocid="home.logout_button"
            onClick={onLogout}
            className="neon-btn"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,100,100,0.25)",
              borderRadius: "8px",
              padding: "0.45rem",
              color: "rgba(255,100,100,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Amber banner */}
      {showBanner && (
        <div
          style={{
            margin: "0 1.25rem 0.75rem",
            background: "rgba(255,180,0,0.1)",
            border: "1px solid rgba(255,180,0,0.35)",
            borderRadius: "10px",
            padding: "0.6rem 0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "#ffb400", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.78rem",
              color: "rgba(255,200,0,0.9)",
              flex: 1,
            }}
          >
            Protect your account — set up a recovery question
          </span>
          <button
            type="button"
            data-ocid="home.setup_secq_button"
            onClick={() => navigate({ type: "settings" })}
            style={{
              background: "rgba(255,180,0,0.2)",
              border: "1px solid rgba(255,180,0,0.4)",
              color: "#ffb400",
              borderRadius: "6px",
              padding: "0.2rem 0.6rem",
              fontSize: "0.72rem",
              fontFamily: "'Orbitron', sans-serif",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Set Up Now
          </button>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,180,0,0.5)",
              cursor: "pointer",
              padding: "0.1rem",
              display: "flex",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search */}
      <div
        style={{
          padding: "0 1.25rem",
          marginBottom: "1rem",
          position: "relative",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "2rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(0,255,255,0.4)",
            pointerEvents: "none",
          }}
        />
        <input
          data-ocid="home.search_input"
          type="text"
          placeholder="Search IDs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(0,255,255,0.05)",
            border: "1px solid rgba(0,255,255,0.2)",
            borderRadius: "10px",
            padding: "0.65rem 0.9rem 0.65rem 2.4rem",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Exo 2', sans-serif",
            fontSize: "0.88rem",
            outline: "none",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "0 1.25rem" }}>
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.85rem",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="home.empty_state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 1rem",
              textAlign: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "3.5rem",
                animation: "particleFloat 3s ease-in-out infinite",
              }}
            >
              📲
            </div>
            <p
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.9rem",
                color: "rgba(0,255,255,0.6)",
                maxWidth: "240px",
                lineHeight: 1.5,
              }}
            >
              {search
                ? "No IDs match your search."
                : "No IDs yet. Tap + to add your first ID card."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.85rem",
            }}
          >
            {filtered.map((card, i) => (
              <IDCardTile
                key={card.id}
                card={card}
                index={i}
                onClick={() => navigate({ type: "view", cardId: card.id })}
              />
            ))}
          </div>
        )}
      </div>

      {BRANDING_FOOTER}

      {/* FAB */}
      <button
        type="button"
        data-ocid="home.primary_button"
        onClick={() => navigate({ type: "add" })}
        className="neon-btn"
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
          right: "1.25rem",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(123,0,255,0.2))",
          border: "1.5px solid rgba(0,255,255,0.5)",
          color: "#00ffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
          boxShadow: "0 4px 20px rgba(0,255,255,0.2)",
        }}
      >
        {isLoading ? (
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Plus size={26} />
        )}
      </button>
    </div>
  );
}
