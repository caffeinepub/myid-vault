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
  adminDeleteAccount,
  adminGetUserIDCount,
  adminGetUserIDs,
  adminLoadAccounts,
  adminResetPassword,
  adminToggleBan,
} from "../hooks/usePasswordAuth";

const ADMIN_PASSWORD = "admin@myid2026";

interface UserRow {
  username: string;
  name: string;
  securityQuestion: string;
  banned: boolean;
  createdAt: number;
  idCount: number;
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
              padding: "0.75rem 1rem",
              borderRadius: "9px",
              border: "1.5px solid rgba(255,140,0,0.3)",
              background: "rgba(20,10,0,0.5)",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.88rem",
              outline: "none",
              marginBottom: "0.75rem",
              boxSizing: "border-box",
            }}
          />
          {authError && (
            <p
              data-ocid="admin.error_state"
              style={{
                color: "#ff6666",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.78rem",
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
            className="neon-btn"
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "9px",
              border: "1.5px solid rgba(255,140,0,0.5)",
              background: "rgba(255,140,0,0.08)",
              color: "rgba(255,180,0,0.9)",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.82rem",
              cursor: authLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {authLoading ? (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Shield size={16} />
            )}
            {authLoading ? "Verifying…" : "Access Admin Panel"}
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onExit={onExit} />;
}

function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [accounts, setAccounts] = useState<UserRow[]>(() => {
    const all = adminLoadAccounts();
    return Object.values(all).map((a) => ({
      username: a.username,
      name: a.name,
      securityQuestion: a.securityQuestion,
      banned: a.banned,
      createdAt: a.createdAt,
      idCount: adminGetUserIDCount(a.username),
    }));
  });

  const reload = () => {
    const all = adminLoadAccounts();
    setAccounts(
      Object.values(all).map((a) => ({
        username: a.username,
        name: a.name,
        securityQuestion: a.securityQuestion,
        banned: a.banned,
        createdAt: a.createdAt,
        idCount: adminGetUserIDCount(a.username),
      })),
    );
  };

  const totalIDs = accounts.reduce((sum, u) => sum + u.idCount, 0);
  const bannedCount = accounts.filter((u) => u.banned).length;

  const handleBan = (username: string) => {
    adminToggleBan(username);
    const isBanned = adminLoadAccounts()[username]?.banned ?? false;
    toast.success(isBanned ? "User banned" : "User unbanned");
    reload();
  };

  const handleDelete = (username: string) => {
    if (!confirm("Permanently delete this account and all its data?")) return;
    adminDeleteAccount(username);
    toast.success("Account deleted");
    reload();
  };

  const handleResetPassword = async (username: string) => {
    const newPass = prompt(`Set new password for @${username}:`);
    if (!newPass) return;
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      await adminResetPassword(username, newPass);
      toast.success("Password reset successfully");
    } catch {
      toast.error("Failed to reset password");
    }
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
          data-ocid="admin.secondary_button"
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
                key={user.username}
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
  onBan: (u: string) => void;
  onDelete: (u: string) => void;
  onReset: (u: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const ids = expanded ? adminGetUserIDs(user.username) : [];

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
                color: user.banned
                  ? "rgba(255,80,80,0.7)"
                  : "rgba(255,255,255,0.85)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {user.name}
            </p>
            {user.banned && (
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
            @{user.username}
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
            {user.idCount} IDs
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
          }}
        >
          {/* IDs */}
          {ids.length > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              <p
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: "0.4rem",
                }}
              >
                Stored IDs:
              </p>
              {ids.map((id, j) => (
                <div
                  key={`${id.cardType.__kind__}-${j}`}
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.72rem",
                    color: "rgba(0,255,255,0.5)",
                    padding: "0.2rem 0",
                    borderBottom:
                      j < ids.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  {id.cardType.__kind__ === "collegeStudent"
                    ? id.cardType.collegeStudent.fullName
                    : id.cardType.other.fullName}{" "}
                  — {id.cardType.__kind__}
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div style={{ marginBottom: "0.75rem" }}>
            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              Security Q: {user.securityQuestion || "Not set"}
            </p>
            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              data-ocid={`admin.toggle.${index + 1}`}
              onClick={() => onBan(user.username)}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: `1px solid ${user.banned ? "rgba(0,255,100,0.4)" : "rgba(255,80,80,0.4)"}`,
                background: user.banned
                  ? "rgba(0,255,100,0.08)"
                  : "rgba(255,80,80,0.08)",
                color: user.banned
                  ? "rgba(0,255,100,0.8)"
                  : "rgba(255,80,80,0.8)",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.72rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Ban size={12} />
              {user.banned ? "Unban" : "Ban"}
            </button>
            <button
              type="button"
              data-ocid={`admin.edit_button.${index + 1}`}
              onClick={() => onReset(user.username)}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,200,255,0.3)",
                background: "rgba(0,200,255,0.06)",
                color: "rgba(0,200,255,0.8)",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.72rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <KeyRound size={12} />
              Reset Password
            </button>
            <button
              type="button"
              data-ocid={`admin.delete_button.${index + 1}`}
              onClick={() => onDelete(user.username)}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid rgba(255,50,50,0.3)",
                background: "rgba(255,50,50,0.07)",
                color: "rgba(255,80,80,0.8)",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.72rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
