import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Ban,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { LocalIDCard } from "../hooks/useLocalIDStore";
import {
  adminClearSession,
  adminDeleteAccount,
  adminGetBanned,
  adminGetUserIDCount,
  adminGetUserIDs,
  adminHasSession,
  adminLoadAccounts,
  adminResetPassword,
  adminSaveSession,
  adminToggleBan,
} from "../hooks/usePasswordAuth";

const ADMIN_PASSWORD = "admin@myid2026";

interface AdminPageProps {
  onExit: () => void;
}

interface UserRow {
  username: string;
  name: string;
  securityQuestion: string;
  idCount: number;
  isBanned: boolean;
}

// ─── Helpers ─────────────────────────────────────────────

function getCardDisplayName(card: LocalIDCard): string {
  if (card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    return c.fullName || "College ID";
  }
  const o = card.cardType.other;
  return o.fullName || o.idNumber || "ID Card";
}

function getCardTypeName(card: LocalIDCard): string {
  if (card.cardType.__kind__ === "collegeStudent") return "College Student ID";
  return card.cardType.other.idType || "Other ID";
}

function loadUsers(): UserRow[] {
  const accounts = adminLoadAccounts();
  const banned = adminGetBanned();
  return Object.entries(accounts).map(([username, acc]) => ({
    username,
    name: acc.name,
    securityQuestion: acc.securityQuestion,
    idCount: adminGetUserIDCount(username),
    isBanned: banned.includes(username),
  }));
}

// ─── Stat card ────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 rounded-2xl border p-4 flex flex-col gap-2"
      style={{
        background: "oklch(0.10 0.02 260 / 0.9)",
        border: `1.5px solid ${accent}33`,
        boxShadow: `0 0 18px 2px ${accent}18`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

// ─── User row ─────────────────────────────────────────────

function UserRowCard({
  user,
  index,
  onDelete,
  onBanToggle,
  onResetPassword,
}: {
  user: UserRow;
  index: number;
  onDelete: (username: string) => void;
  onBanToggle: (username: string) => void;
  onResetPassword: (username: string, newPassword: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [userIDs, setUserIDs] = useState<LocalIDCard[]>([]);
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetErrors, setResetErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const ocidIdx = index + 1;

  const handleExpand = () => {
    if (!expanded) {
      setUserIDs(adminGetUserIDs(user.username));
    }
    setExpanded((v) => !v);
    setShowReset(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof resetErrors = {};
    if (!newPassword) errs.password = "Password required";
    else if (newPassword.length < 6) errs.password = "Min. 6 characters";
    if (!confirmPassword) errs.confirm = "Please confirm";
    else if (newPassword !== confirmPassword)
      errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length > 0) {
      setResetErrors(errs);
      return;
    }
    setResetErrors({});
    setResetLoading(true);
    try {
      await onResetPassword(user.username, newPassword);
      toast.success(`Password reset for @${user.username}`);
      setShowReset(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetLoading(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay: index * 0.04,
      }}
      data-ocid={`admin.user.item.${ocidIdx}`}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "oklch(0.09 0.015 260 / 0.95)",
        border: user.isBanned
          ? "1.5px solid oklch(0.577 0.245 27.325 / 0.5)"
          : "1.5px solid oklch(0.22 0.03 260 / 0.8)",
        boxShadow: user.isBanned
          ? "0 0 12px 2px oklch(0.577 0.245 27.325 / 0.1)"
          : "none",
      }}
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: user.isBanned
              ? "oklch(0.577 0.245 27.325 / 0.15)"
              : "oklch(0.72 0.22 195 / 0.15)",
            color: user.isBanned
              ? "oklch(0.577 0.245 27.325)"
              : "oklch(0.72 0.22 195)",
            border: `1.5px solid ${user.isBanned ? "oklch(0.577 0.245 27.325 / 0.3)" : "oklch(0.72 0.22 195 / 0.3)"}`,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </p>
            {user.isBanned && (
              <Badge
                className="text-xs px-1.5 py-0"
                style={{
                  background: "oklch(0.577 0.245 27.325 / 0.15)",
                  color: "oklch(0.577 0.245 27.325)",
                  border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
                }}
              >
                Banned
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            className="text-xs px-2 py-0.5 flex items-center gap-1"
            style={{
              background: "oklch(0.65 0.28 300 / 0.12)",
              color: "oklch(0.65 0.28 300)",
              border: "1px solid oklch(0.65 0.28 300 / 0.25)",
            }}
          >
            <CreditCard className="w-3 h-3" />
            {user.idCount}
          </Badge>
          <Badge
            className="text-xs px-1.5 py-0.5"
            style={
              user.securityQuestion
                ? {
                    background: "oklch(0.72 0.22 195 / 0.1)",
                    color: "oklch(0.72 0.22 195)",
                    border: "1px solid oklch(0.72 0.22 195 / 0.25)",
                  }
                : {
                    background: "oklch(0.62 0.26 25 / 0.1)",
                    color: "oklch(0.72 0.2 25)",
                    border: "1px solid oklch(0.62 0.26 25 / 0.25)",
                  }
            }
          >
            {user.securityQuestion ? (
              <HelpCircle className="w-3 h-3" />
            ) : (
              <HelpCircle className="w-3 h-3 opacity-50" />
            )}
          </Badge>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={handleExpand}
          data-ocid={`admin.user.expand_button.${ocidIdx}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          style={{ background: "oklch(0.14 0.02 260)" }}
          aria-label={expanded ? "Collapse user" : "Expand user"}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-4 pt-1"
              style={{ borderTop: "1px solid oklch(0.18 0.03 260)" }}
            >
              {/* IDs list */}
              {userIDs.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2">
                    Stored IDs
                  </p>
                  {userIDs.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl"
                      style={{
                        background: "oklch(0.12 0.02 260 / 0.8)",
                        border: "1px solid oklch(0.20 0.03 260)",
                      }}
                    >
                      <CreditCard
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "oklch(0.65 0.28 300)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {getCardDisplayName(card)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getCardTypeName(card)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  No IDs stored
                </div>
              )}

              {/* Reset password form */}
              <AnimatePresence>
                {showReset && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.24 }}
                    onSubmit={handleReset}
                    className="space-y-3 overflow-hidden"
                  >
                    <div
                      className="h-px w-full"
                      style={{ background: "oklch(0.20 0.03 260)" }}
                    />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Reset Password
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground/80">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          type={showPw ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`pl-9 pr-9 h-9 rounded-xl text-sm ${resetErrors.password ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle password visibility"
                        >
                          {showPw ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {resetErrors.password && (
                        <p className="text-xs text-destructive">
                          {resetErrors.password}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground/80">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          type={showPw ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`pl-9 h-9 rounded-xl text-sm ${resetErrors.confirm ? "border-destructive" : ""}`}
                        />
                      </div>
                      {resetErrors.confirm && (
                        <p className="text-xs text-destructive">
                          {resetErrors.confirm}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 h-8 text-xs rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                          color: "oklch(0.97 0.005 240)",
                        }}
                      >
                        {resetLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Save New Password"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowReset(false);
                          setNewPassword("");
                          setConfirmPassword("");
                          setResetErrors({});
                        }}
                        className="h-8 text-xs rounded-xl px-3"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReset((v) => !v);
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetErrors({});
                  }}
                  data-ocid={`admin.user.reset_password_button.${ocidIdx}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all btn-auto-glow-delay-1"
                  style={{
                    background: "oklch(0.72 0.22 195 / 0.1)",
                    color: "oklch(0.72 0.22 195)",
                    border: "1px solid oklch(0.72 0.22 195 / 0.3)",
                  }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  {showReset ? "Close Reset" : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={() => onBanToggle(user.username)}
                  data-ocid={`admin.user.ban_button.${ocidIdx}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all btn-auto-glow-delay-2"
                  style={
                    user.isBanned
                      ? {
                          background: "oklch(0.55 0.2 160 / 0.12)",
                          color: "oklch(0.65 0.2 160)",
                          border: "1px solid oklch(0.55 0.2 160 / 0.35)",
                        }
                      : {
                          background: "oklch(0.577 0.245 27.325 / 0.1)",
                          color: "oklch(0.72 0.2 25)",
                          border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
                        }
                  }
                >
                  {user.isBanned ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Unban
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      Ban
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(user.username)}
                  data-ocid={`admin.user.delete_button.${ocidIdx}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: "oklch(0.577 0.245 27.325 / 0.1)",
                    color: "oklch(0.577 0.245 27.325)",
                    border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Admin Login Screen ────────────────────────────────────

function AdminLoginScreen({
  onLogin,
  onBack,
}: {
  onLogin: () => void;
  onBack: () => void;
}) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      triggerShake();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // brief delay for feel
    if (password === ADMIN_PASSWORD) {
      adminSaveSession();
      onLogin();
    } else {
      setError("Incorrect admin password");
      triggerShake();
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "transparent" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 rgb-glow"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.08 280) 0%, oklch(0.55 0.22 300 / 0.8) 100%)",
              boxShadow: "0 0 36px 10px oklch(0.55 0.22 300 / 0.3)",
            }}
          >
            <Shield
              className="w-9 h-9"
              style={{ color: "oklch(0.97 0.005 240)" }}
            />
          </div>
        </motion.div>
        <h1 className="text-3d-animated text-4xl">MyID Vault</h1>
        <p
          className="text-base mt-2 font-semibold"
          style={{ color: "oklch(0.65 0.28 300)" }}
        >
          Admin Panel
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 22,
          delay: 0.15,
        }}
        className={`w-full max-w-sm rounded-3xl border bg-card overflow-hidden rgb-glow-sm rgb-border ${shake ? "animate-shake" : ""}`}
        style={{
          boxShadow:
            "0 4px 24px -4px oklch(0.08 0.015 260 / 0.8), 0 0 32px 4px oklch(0.55 0.22 300 / 0.1)",
          border: "1.5px solid oklch(0.55 0.22 300 / 0.3)",
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between border-b border-border"
          style={{ background: "oklch(0.55 0.22 300 / 0.05)" }}
        >
          <div className="flex items-center gap-2">
            <Shield
              className="w-4 h-4"
              style={{ color: "oklch(0.65 0.28 300)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.65 0.28 300)" }}
            >
              Restricted Access
            </span>
          </div>
          <div
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: "oklch(0.55 0.22 300 / 0.15)",
              color: "oklch(0.65 0.28 300)",
              border: "1px solid oklch(0.55 0.22 300 / 0.3)",
            }}
          >
            ADMIN
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Admin Login
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the admin password to access the dashboard
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl px-3 py-2.5 text-sm font-medium"
                data-ocid="admin.error_state"
                style={{
                  background: "oklch(0.577 0.245 27.325 / 0.12)",
                  border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
                  color: "oklch(0.577 0.245 27.325)",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <Label
              htmlFor="admin-password"
              className="text-sm font-medium text-foreground/80"
            >
              Admin Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPw ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                data-ocid="admin.password_input"
                className="pl-10 pr-10 h-11 rounded-xl"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            data-ocid="admin.login_button"
            className="w-full h-11 text-base font-semibold rounded-xl btn-auto-glow"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.08 280), oklch(0.5 0.22 300))",
              color: "oklch(0.97 0.005 240)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Access Admin Panel
              </>
            )}
          </Button>
        </form>
      </motion.div>

      <motion.button
        type="button"
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        data-ocid="admin.back_button"
        className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to App
      </motion.button>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────

function AdminDashboard({
  onLogout,
  onBack,
}: { onLogout: () => void; onBack: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setUsers(loadUsers());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 400));
    refresh();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const handleDelete = (username: string) => {
    setDeleteTarget(username);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    adminDeleteAccount(deleteTarget);
    setDeleteTarget(null);
    refresh();
    toast.success(`Account @${deleteTarget} deleted`);
  };

  const handleBanToggle = (username: string) => {
    const isBanned = adminToggleBan(username);
    refresh();
    toast.success(
      isBanned
        ? `@${username} has been banned`
        : `@${username} has been unbanned`,
    );
  };

  const handleResetPassword = async (username: string, newPassword: string) => {
    await adminResetPassword(username, newPassword);
    refresh();
  };

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.username.includes(search.toLowerCase()) ||
          u.name.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const totalIDs = users.reduce((acc, u) => acc + u.idCount, 0);
  const bannedCount = users.filter((u) => u.isBanned).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "transparent" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-border rgb-glow-sm"
        style={{ background: "oklch(0.07 0.015 260 / 0.95)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            data-ocid="admin.back_button"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Back to app"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center rgb-glow-sm flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.14 0.08 280), oklch(0.5 0.22 300))",
                boxShadow: "0 0 10px 2px oklch(0.55 0.22 300 / 0.3)",
              }}
            >
              <Shield
                className="w-4 h-4"
                style={{ color: "oklch(0.97 0.005 240)" }}
              />
            </div>
            <h1 className="text-3d-sm text-sm truncate">Admin Dashboard</h1>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            data-ocid="admin.refresh_button"
            disabled={isRefreshing}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors btn-auto-glow-delay-1"
            style={{ background: "oklch(0.14 0.02 260)" }}
            aria-label="Refresh data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={onLogout}
            data-ocid="admin.logout_button"
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold transition-all btn-auto-glow-delay-2"
            style={{
              background: "oklch(0.577 0.245 27.325 / 0.1)",
              color: "oklch(0.72 0.2 25)",
              border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main
        className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
        }}
      >
        {/* Stats */}
        <motion.div
          data-ocid="admin.stats.panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="flex gap-3"
        >
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Total Users"
            value={users.length}
            accent="oklch(0.72 0.22 195)"
          />
          <StatCard
            icon={<CreditCard className="w-4 h-4" />}
            label="Total IDs"
            value={totalIDs}
            accent="oklch(0.65 0.28 300)"
          />
          <StatCard
            icon={<Ban className="w-4 h-4" />}
            label="Banned"
            value={bannedCount}
            accent="oklch(0.577 0.245 27.325)"
          />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            type: "spring",
            stiffness: 260,
            damping: 24,
          }}
          className="relative"
        >
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or @username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="admin.search_input"
            className="pl-10 h-11 rounded-xl"
            style={{
              background: "oklch(0.09 0.015 260 / 0.95)",
              border: "1.5px solid oklch(0.22 0.03 260 / 0.8)",
            }}
          />
        </motion.div>

        {/* Users list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="admin.users.empty_state"
            className="text-center py-16 space-y-3"
          >
            <Users
              className="w-12 h-12 mx-auto"
              style={{ color: "oklch(0.35 0.04 260)" }}
            />
            <p className="text-base font-semibold text-muted-foreground">
              {search ? "No users match your search" : "No users yet"}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {search
                ? "Try a different name or username"
                : "Users will appear here once they sign up"}
            </p>
          </motion.div>
        ) : (
          <ScrollArea className="w-full">
            <div className="space-y-3 pb-4">
              {filtered.map((user, i) => (
                <UserRowCard
                  key={user.username}
                  user={user}
                  index={i}
                  onDelete={handleDelete}
                  onBanToggle={handleBanToggle}
                  onResetPassword={handleResetPassword}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-5 px-4 text-xs text-muted-foreground border-t border-border rgb-glow-sm space-y-1">
        <p className="font-medium text-foreground/70">
          Made with <span className="text-red-500">♥️</span> by Ankush Singh |
          Caffeine For Students
        </p>
        <p>© 2026 All Rights Reserved</p>
      </footer>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="rounded-2xl border rgb-glow-sm"
          style={{
            background: "oklch(0.09 0.015 260 / 0.98)",
            border: "1.5px solid oklch(0.577 0.245 27.325 / 0.4)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2
                className="w-5 h-5"
                style={{ color: "oklch(0.577 0.245 27.325)" }}
              />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                @{deleteTarget}
              </span>
              ? This will remove their account and all stored IDs. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-ocid="admin.confirm_button"
              className="rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 27), oklch(0.577 0.245 27.325))",
                color: "oklch(0.97 0.005 240)",
              }}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────

export default function AdminPage({ onExit }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    adminHasSession(),
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    adminClearSession();
    setIsAuthenticated(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="admin-login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.28 }}
        >
          <AdminLoginScreen onLogin={handleLogin} onBack={onExit} />
        </motion.div>
      ) : (
        <motion.div
          key="admin-dashboard"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          <AdminDashboard onLogout={handleLogout} onBack={onExit} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
