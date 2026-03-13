import {
  ArrowLeft,
  Ban,
  ChevronDown,
  ChevronRight,
  CreditCard,
  KeyRound,
  Loader2,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type AccountRecord,
  deleteAccount,
  getAccounts,
  hashString,
  setAccountBanned,
} from "../lib/storage";

const ADMIN_PASSWORD = "admin@myid2026";

interface UserRow {
  principal: string;
  record: AccountRecord;
}

export default function AdminPage({ onExit }: { onExit: () => void }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = () => {
    setAuthLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setAuthed(true);
        setAuthError("");
      } else {
        setAuthError("Incorrect admin password");
      }
      setAuthLoading(false);
    }, 400);
  };

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.25rem",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)",
        }}
      >
        <div
          className="glass-card"
          style={{ width: "100%", maxWidth: "380px", padding: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1.5rem",
              gap: "0.5rem",
            }}
          >
            <Shield size={36} style={{ color: "#ff6600" }} />
            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: "rgba(255,140,0,0.9)",
                fontSize: "1.1rem",
                margin: 0,
              }}
            >
              Admin Panel
            </h2>
            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Restricted Access
            </p>
          </div>
          <input
            data-ocid="admin.input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            style={{
              width: "100%",
              background: "rgba(255,140,0,0.05)",
              border: authError
                ? "1px solid rgba(255,80,80,0.5)"
                : "1px solid rgba(255,140,0,0.3)",
              borderRadius: "8px",
              padding: "0.7rem 0.9rem",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.9rem",
              outline: "none",
              marginBottom: "0.5rem",
            }}
          />
          {authError && (
            <p
              data-ocid="admin.error_state"
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(255,80,80,0.8)",
                marginBottom: "0.75rem",
              }}
            >
              {authError}
            </p>
          )}
          <button
            type="button"
            data-ocid="admin.primary_button"
            onClick={handleAuth}
            disabled={authLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1.5px solid rgba(255,140,0,0.5)",
              background: "rgba(255,140,0,0.12)",
              color: "rgba(255,180,0,0.9)",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              letterSpacing: "0.06em",
            }}
          >
            {authLoading ? (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : null}
            Access Admin Panel
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              width: "100%",
              marginTop: "0.75rem",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            <ArrowLeft size={14} /> Back to App
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onExit={onExit} />;
}

function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [accounts, setAccounts] = useState<UserRow[]>(() => {
    const all = getAccounts();
    return Object.entries(all).map(([principal, record]) => ({
      principal,
      record,
    }));
  });

  const reload = () => {
    const all = getAccounts();
    setAccounts(
      Object.entries(all).map(([principal, record]) => ({ principal, record })),
    );
  };

  const totalIDs = accounts.reduce(
    (sum, u) => sum + (u.record.idCount || 0),
    0,
  );
  const bannedCount = accounts.filter((u) => u.record.banned).length;

  const handleBan = (principal: string, banned: boolean) => {
    setAccountBanned(principal, banned);
    toast.success(banned ? "User banned" : "User unbanned");
    reload();
  };

  const handleDelete = (principal: string) => {
    if (!confirm("Permanently delete this account and all its data?")) return;
    deleteAccount(principal);
    toast.success("Account deleted");
    reload();
  };

  const handleResetPassword = (principal: string) => {
    // For ICP users there's no password, but we can set a note
    toast.info(
      `Principal: ${principal.slice(0, 20)}… (ICP auth, no password to reset)`,
    );
  };

  return (
    <div
      data-ocid="admin.page"
      style={{
        minHeight: "100dvh",
        paddingBottom: "2rem",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem 1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Shield size={20} style={{ color: "#ff8800" }} />
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1rem",
              color: "rgba(255,180,0,0.9)",
            }}
          >
            Admin Dashboard
          </span>
        </div>
        <button
          type="button"
          onClick={onExit}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "8px",
            padding: "0.4rem 0.8rem",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Exo 2', sans-serif",
            fontSize: "0.78rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <ArrowLeft size={14} /> Exit
        </button>
      </header>

      <div style={{ padding: "0 1.25rem" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <StatCard
            icon={<Users size={18} />}
            label="Total Users"
            value={accounts.length}
            color="#00ffff"
          />
          <StatCard
            icon={<CreditCard size={18} />}
            label="Total IDs"
            value={totalIDs}
            color="#aa00ff"
          />
          <StatCard
            icon={<Ban size={18} />}
            label="Banned"
            value={bannedCount}
            color="#ff4444"
          />
        </div>

        {/* User list */}
        {accounts.length === 0 ? (
          <div
            data-ocid="admin.empty_state"
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'Exo 2', sans-serif",
            }}
          >
            No registered users yet.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {accounts.map((user, i) => (
              <UserCard
                key={user.principal}
                user={user}
                index={i}
                onBan={handleBan}
                onDelete={handleDelete}
                onReset={handleResetPassword}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="glass-card"
      style={{ padding: "0.85rem", textAlign: "center" }}
    >
      <div style={{ color, marginBottom: "0.3rem" }}>{icon}</div>
      <p
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "1.3rem",
          color,
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: "0.2rem",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function UserCard({
  user,
  index,
  onBan,
  onDelete,
  onReset,
}: {
  user: UserRow;
  index: number;
  onBan: (p: string, b: boolean) => void;
  onDelete: (p: string) => void;
  onReset: (p: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-ocid={`admin.item.${index + 1}`}
      className="glass-card"
      style={{ overflow: "hidden" }}
    >
      {/* Row header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1rem",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.15rem",
            }}
          >
            <p
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.78rem",
                color: user.record.banned
                  ? "rgba(255,80,80,0.7)"
                  : "rgba(255,255,255,0.85)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {user.record.name}
            </p>
            {user.record.banned && (
              <span
                style={{
                  background: "rgba(255,50,50,0.2)",
                  border: "1px solid rgba(255,50,50,0.3)",
                  borderRadius: "4px",
                  padding: "0.1rem 0.3rem",
                  fontSize: "0.6rem",
                  color: "rgba(255,80,80,0.8)",
                  fontFamily: "'Exo 2', sans-serif",
                  flexShrink: 0,
                }}
              >
                BANNED
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.68rem",
              color: "rgba(0,255,255,0.4)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            {user.principal.slice(0, 24)}…
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(123,0,255,0.7)",
            }}
          >
            {user.record.idCount || 0} IDs
          </span>
          {expanded ? (
            <ChevronDown size={16} style={{ color: "rgba(0,255,255,0.4)" }} />
          ) : (
            <ChevronRight size={16} style={{ color: "rgba(0,255,255,0.4)" }} />
          )}
        </div>
      </button>

      {/* Expanded actions */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid rgba(0,255,255,0.08)",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "0.25rem",
            }}
          >
            Joined: {new Date(user.record.createdAt).toLocaleDateString()}
            {" · "}
            Recovery Q: {user.record.hasSecurityQuestion ? "✅" : "❌"}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <ActionBtn
              icon={<KeyRound size={13} />}
              label="Reset Auth"
              color="rgba(0,200,255,0.7)"
              borderColor="rgba(0,200,255,0.25)"
              onClick={() => onReset(user.principal)}
            />
            <ActionBtn
              icon={<Ban size={13} />}
              label={user.record.banned ? "Unban" : "Ban User"}
              color={
                user.record.banned
                  ? "rgba(0,255,170,0.7)"
                  : "rgba(255,180,0,0.7)"
              }
              borderColor={
                user.record.banned
                  ? "rgba(0,255,170,0.25)"
                  : "rgba(255,180,0,0.25)"
              }
              onClick={() => onBan(user.principal, !user.record.banned)}
            />
            <ActionBtn
              icon={<Trash2 size={13} />}
              label="Delete"
              color="rgba(255,80,80,0.7)"
              borderColor="rgba(255,80,80,0.25)"
              onClick={() => onDelete(user.principal)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  color,
  borderColor,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  borderColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="neon-btn"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.4rem 0.75rem",
        borderRadius: "6px",
        border: `1px solid ${borderColor}`,
        background: "transparent",
        color,
        fontFamily: "'Exo 2', sans-serif",
        fontSize: "0.75rem",
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
}
