import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  loginWithPassword: (username: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    username: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
  ) => Promise<void>;
  getSecurityQuestion: (username: string) => string;
  resetPassword: (
    username: string,
    securityAnswer: string,
    newPassword: string,
  ) => Promise<void>;
  onLoginSuccess: (user: { username: string; name: string }) => void;
}

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your oldest sibling's middle name?",
];

type View =
  | "auth"
  | "forgot-step1"
  | "forgot-step2"
  | "forgot-step3"
  | "forgot-success";
type Tab = "login" | "signup";

// ─── Success Animation Overlay ────────────────────────────────────────────────
function SuccessAnimation({ userName }: { userName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.12 0.06 160 / 0.98) 0%, oklch(0.06 0.015 260 / 0.99) 70%)",
      }}
    >
      {/* Radial wipe sweep */}
      <motion.div
        initial={{ scale: 0, opacity: 0.7 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, oklch(0.75 0.2 160 / 0.5) 0%, transparent 70%)",
        }}
      />

      {/* Particle burst */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          // biome-ignore lint/suspicious/noArrayIndexKey: static particle burst, order is stable
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            background:
              i % 3 === 0
                ? "oklch(0.72 0.22 195)"
                : i % 3 === 1
                  ? "oklch(0.65 0.28 300)"
                  : "oklch(0.75 0.2 160)",
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 12) * (80 + Math.random() * 60),
            y: Math.sin((i * Math.PI * 2) / 12) * (80 + Math.random() * 60),
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        />
      ))}

      {/* Green checkmark badge */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 18,
          delay: 0.15,
        }}
        className="relative z-10 rounded-full p-5 mb-5"
        style={{
          background: "oklch(0.15 0.06 160 / 0.8)",
          border: "2px solid oklch(0.75 0.2 160 / 0.6)",
          boxShadow: "0 0 40px 12px oklch(0.75 0.2 160 / 0.35)",
        }}
      >
        <CheckCircle2
          className="w-14 h-14"
          style={{ color: "oklch(0.75 0.2 160)" }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="text-3d-cyan text-2xl relative z-10"
      >
        Welcome, {userName}!
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm mt-1 relative z-10 font-exo tracking-widest uppercase"
        style={{ color: "oklch(0.55 0.02 250)", letterSpacing: "0.15em" }}
      >
        Opening your vault…
      </motion.p>
    </motion.div>
  );
}

export default function LoginPage({
  loginWithPassword,
  signUp,
  getSecurityQuestion,
  resetPassword,
  onLoginSuccess,
}: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [view, setView] = useState<View>("auth");

  // Success animation
  const [showSuccess, setShowSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<{
    username: string;
    name: string;
  } | null>(null);

  // ── Login form state ──────────────────────────────────────────────
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPw, setLoginShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Sign-up form state ────────────────────────────────────────────
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupShowPw, setSignupShowPw] = useState(false);
  const [signupShowConfirm, setSignupShowConfirm] = useState(false);
  const [signupQuestion, setSignupQuestion] = useState("");
  const [signupAnswer, setSignupAnswer] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // ── Forgot password state ─────────────────────────────────────────
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotNewPw, setForgotNewPw] = useState("");
  const [forgotConfirmPw, setForgotConfirmPw] = useState("");
  const [forgotShowNew, setForgotShowNew] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────
  function triggerSuccess(authUser: { username: string; name: string }) {
    setSuccessUser(authUser);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onLoginSuccess(authUser);
    }, 1600);
  }

  // ── Login submit ──────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError("Please enter your username and password.");
      return;
    }
    setLoginLoading(true);
    try {
      await loginWithPassword(loginUsername.trim(), loginPassword);
      triggerSuccess({
        username: loginUsername.trim().toLowerCase(),
        name: loginUsername.trim(),
      });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  // ── Sign-up submit ────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    if (!signupName.trim()) {
      setSignupError("Please enter your full name.");
      return;
    }
    if (!signupUsername.trim()) {
      setSignupError("Please choose a username.");
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (!signupQuestion) {
      setSignupError("Please select a security question.");
      return;
    }
    if (!signupAnswer.trim()) {
      setSignupError("Please provide an answer to your security question.");
      return;
    }
    setSignupLoading(true);
    try {
      await signUp(
        signupName.trim(),
        signupUsername.trim(),
        signupPassword,
        signupQuestion,
        signupAnswer.trim(),
      );
      triggerSuccess({
        username: signupUsername.trim().toLowerCase(),
        name: signupName.trim(),
      });
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSignupLoading(false);
    }
  }

  // ── Forgot — step 1: get question ────────────────────────────────
  function handleForgotStep1(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    if (!forgotUsername.trim()) {
      setForgotError("Please enter your username.");
      return;
    }
    try {
      const q = getSecurityQuestion(forgotUsername.trim());
      setForgotQuestion(q);
      setView("forgot-step2");
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "User not found.");
    }
  }

  // ── Forgot — step 2: verify answer ──────────────────────────────
  function handleForgotStep2(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    if (!forgotAnswer.trim()) {
      setForgotError("Please enter your answer.");
      return;
    }
    // We move to step 3; verification happens when resetting password
    setView("forgot-step3");
  }

  // ── Forgot — step 3: reset password ─────────────────────────────
  async function handleForgotStep3(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    if (forgotNewPw.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (forgotNewPw !== forgotConfirmPw) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(
        forgotUsername.trim(),
        forgotAnswer.trim(),
        forgotNewPw,
      );
      setView("forgot-success");
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setForgotLoading(false);
    }
  }

  function resetForgotFlow() {
    setForgotUsername("");
    setForgotQuestion("");
    setForgotAnswer("");
    setForgotNewPw("");
    setForgotConfirmPw("");
    setForgotError("");
    setView("forgot-step1");
  }

  // ── Shared input style ────────────────────────────────────────────
  const inputStyle = {
    background: "oklch(0.10 0.015 260 / 0.8)",
    border: "1px solid oklch(0.25 0.03 260 / 0.8)",
    color: "oklch(0.92 0.01 250)",
    fontSize: "1rem",
  };

  // ── Error block ───────────────────────────────────────────────────
  function ErrorBlock({ msg, id }: { msg: string; id: string }) {
    return (
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            data-ocid={id}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
            style={{
              background: "oklch(0.577 0.245 27.325 / 0.12)",
              border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
              color: "oklch(0.577 0.245 27.325)",
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && successUser && (
          <SuccessAnimation userName={successUser.name} />
        )}
      </AnimatePresence>

      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "transparent" }}
      >
        <main className="relative z-10 w-full max-w-sm mx-auto px-5 flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 3.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg rgb-glow"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.15 0.08 220) 0%, oklch(0.55 0.2 195 / 0.8) 100%)",
                  boxShadow: "0 0 32px 8px oklch(0.72 0.22 195 / 0.4)",
                }}
              >
                <Wallet
                  className="w-9 h-9"
                  style={{ color: "oklch(0.97 0.005 240)" }}
                />
              </div>
            </motion.div>
            <h1 className="text-3d-animated text-4xl">MyID Vault</h1>
            <p
              className="mt-2 text-sm font-exo tracking-widest uppercase"
              style={{ color: "oklch(0.60 0.08 220)", letterSpacing: "0.18em" }}
            >
              Store &amp; access your IDs anywhere
            </p>
          </motion.div>

          {/* Card container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 22,
              delay: 0.15,
            }}
            className="w-full rounded-3xl border overflow-hidden rgb-glow-sm rgb-border"
            style={{
              background: "oklch(0.09 0.015 260 / 0.92)",
              boxShadow:
                "0 4px 24px -4px oklch(0.08 0.015 260 / 0.9), 0 0 0 1px oklch(0.22 0.03 260 / 0.8), 0 0 32px 4px oklch(0.72 0.22 195 / 0.08)",
            }}
          >
            <AnimatePresence mode="wait">
              {/* ── AUTH VIEW (Login / Sign Up tabs) ───────────────────── */}
              {view === "auth" && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Tab switcher */}
                  <div
                    className="flex relative border-b"
                    style={{ borderColor: "oklch(0.22 0.03 260 / 0.6)" }}
                  >
                    {(["login", "signup"] as Tab[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        data-ocid={`auth.${t}.tab`}
                        onClick={() => setActiveTab(t)}
                        className="flex-1 py-3.5 text-sm font-semibold tracking-wide capitalize relative transition-colors"
                        style={{
                          color:
                            activeTab === t
                              ? "oklch(0.72 0.22 195)"
                              : "oklch(0.50 0.02 250)",
                        }}
                      >
                        {t === "login" ? "Login" : "Sign Up"}
                        {activeTab === t && (
                          <motion.div
                            layoutId="tab-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                            style={{
                              background: "oklch(0.72 0.22 195)",
                              boxShadow:
                                "0 0 8px 2px oklch(0.72 0.22 195 / 0.5)",
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    <AnimatePresence mode="wait">
                      {/* ── LOGIN TAB ─────────────────────────────────── */}
                      {activeTab === "login" && (
                        <motion.form
                          key="login-form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={handleLogin}
                          className="space-y-4"
                        >
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="login-username"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Username
                            </Label>
                            <div className="relative">
                              <User
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: "oklch(0.45 0.03 250)" }}
                              />
                              <Input
                                id="login-username"
                                data-ocid="login.input"
                                type="text"
                                autoComplete="username"
                                placeholder="your_username"
                                value={loginUsername}
                                onChange={(e) =>
                                  setLoginUsername(e.target.value)
                                }
                                className="pl-9"
                                style={inputStyle}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="login-password"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Password
                            </Label>
                            <div className="relative">
                              <KeyRound
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: "oklch(0.45 0.03 250)" }}
                              />
                              <Input
                                id="login-password"
                                data-ocid="login.password.input"
                                type={loginShowPw ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) =>
                                  setLoginPassword(e.target.value)
                                }
                                className="pl-9 pr-10"
                                style={inputStyle}
                              />
                              <button
                                type="button"
                                onClick={() => setLoginShowPw((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                                style={{ color: "oklch(0.45 0.03 250)" }}
                                aria-label={
                                  loginShowPw
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {loginShowPw ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <ErrorBlock msg={loginError} id="login.error_state" />

                          <motion.button
                            type="submit"
                            data-ocid="login.primary_button"
                            disabled={loginLoading}
                            className="w-full py-3 rounded-xl text-sm font-bold btn-auto-glow flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                              color: "oklch(0.97 0.005 240)",
                            }}
                            whileTap={loginLoading ? {} : { scale: 0.97 }}
                            whileHover={loginLoading ? {} : { scale: 1.01 }}
                          >
                            {loginLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Logging in…</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Login</span>
                              </>
                            )}
                          </motion.button>

                          <button
                            type="button"
                            data-ocid="login.forgot.button"
                            onClick={() => {
                              setForgotUsername("");
                              setForgotError("");
                              setView("forgot-step1");
                            }}
                            className="w-full text-center text-xs pt-1 transition-colors"
                            style={{ color: "oklch(0.60 0.12 195)" }}
                          >
                            Forgot password?
                          </button>
                        </motion.form>
                      )}

                      {/* ── SIGN UP TAB ───────────────────────────────── */}
                      {activeTab === "signup" && (
                        <motion.form
                          key="signup-form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={handleSignup}
                          className="space-y-3.5"
                        >
                          <div className="space-y-1.5">
                            <Label
                              htmlFor="signup-name"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Full Name
                            </Label>
                            <Input
                              id="signup-name"
                              data-ocid="signup.name.input"
                              type="text"
                              autoComplete="name"
                              placeholder="Ankush Singh"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              style={inputStyle}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="signup-username"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Username
                            </Label>
                            <Input
                              id="signup-username"
                              data-ocid="signup.username.input"
                              type="text"
                              autoComplete="username"
                              placeholder="your_username"
                              value={signupUsername}
                              onChange={(e) =>
                                setSignupUsername(e.target.value)
                              }
                              style={inputStyle}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="signup-password"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-password"
                                data-ocid="signup.password.input"
                                type={signupShowPw ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Min 6 characters"
                                value={signupPassword}
                                onChange={(e) =>
                                  setSignupPassword(e.target.value)
                                }
                                className="pr-10"
                                style={inputStyle}
                              />
                              <button
                                type="button"
                                onClick={() => setSignupShowPw((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                                style={{ color: "oklch(0.45 0.03 250)" }}
                                aria-label={
                                  signupShowPw
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {signupShowPw ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="signup-confirm"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-confirm"
                                data-ocid="signup.confirm.input"
                                type={signupShowConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Re-enter password"
                                value={signupConfirm}
                                onChange={(e) =>
                                  setSignupConfirm(e.target.value)
                                }
                                className="pr-10"
                                style={inputStyle}
                              />
                              <button
                                type="button"
                                onClick={() => setSignupShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                                style={{ color: "oklch(0.45 0.03 250)" }}
                                aria-label={
                                  signupShowConfirm
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {signupShowConfirm ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Security Question
                            </Label>
                            <Select
                              value={signupQuestion}
                              onValueChange={setSignupQuestion}
                            >
                              <SelectTrigger
                                data-ocid="signup.question.select"
                                className="text-sm"
                                style={{
                                  ...inputStyle,
                                  height: "auto",
                                  minHeight: "2.5rem",
                                }}
                              >
                                <SelectValue placeholder="Choose a question…" />
                              </SelectTrigger>
                              <SelectContent
                                style={{
                                  background: "oklch(0.10 0.015 260)",
                                  border: "1px solid oklch(0.25 0.03 260)",
                                }}
                              >
                                {SECURITY_QUESTIONS.map((q) => (
                                  <SelectItem
                                    key={q}
                                    value={q}
                                    className="text-xs"
                                    style={{ color: "oklch(0.85 0.01 250)" }}
                                  >
                                    {q}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="signup-answer"
                              className="text-xs font-semibold"
                              style={{ color: "oklch(0.65 0.05 250)" }}
                            >
                              Answer
                            </Label>
                            <Input
                              id="signup-answer"
                              data-ocid="signup.answer.input"
                              type="text"
                              autoComplete="off"
                              placeholder="Your answer"
                              value={signupAnswer}
                              onChange={(e) => setSignupAnswer(e.target.value)}
                              style={inputStyle}
                            />
                          </div>

                          <ErrorBlock
                            msg={signupError}
                            id="signup.error_state"
                          />

                          <motion.button
                            type="submit"
                            data-ocid="signup.primary_button"
                            disabled={signupLoading}
                            className="w-full py-3 rounded-xl text-sm font-bold btn-auto-glow-delay-1 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.15 0.08 260), oklch(0.50 0.25 300))",
                              color: "oklch(0.97 0.005 240)",
                            }}
                            whileTap={signupLoading ? {} : { scale: 0.97 }}
                            whileHover={signupLoading ? {} : { scale: 1.01 }}
                          >
                            {signupLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating account…</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>Create Account</span>
                              </>
                            )}
                          </motion.button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ── FORGOT — STEP 1: Enter username ───────────────────── */}
              {view === "forgot-step1" && (
                <motion.div
                  key="forgot-step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="p-5"
                >
                  <button
                    type="button"
                    data-ocid="forgot.back.button"
                    onClick={() => setView("auth")}
                    className="flex items-center gap-1.5 text-xs mb-4 transition-colors"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to login
                  </button>

                  <h2
                    className="text-lg font-bold mb-1"
                    style={{ color: "oklch(0.92 0.01 250)" }}
                  >
                    Forgot Password
                  </h2>
                  <p
                    className="text-xs mb-5"
                    style={{ color: "oklch(0.52 0.02 250)" }}
                  >
                    Step 1 of 3 — Enter your username
                  </p>

                  <form onSubmit={handleForgotStep1} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="forgot-username"
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.65 0.05 250)" }}
                      >
                        Username
                      </Label>
                      <Input
                        id="forgot-username"
                        data-ocid="forgot.username.input"
                        type="text"
                        autoComplete="username"
                        placeholder="your_username"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <ErrorBlock msg={forgotError} id="forgot.error_state" />
                    <Button
                      type="submit"
                      data-ocid="forgot.step1.submit_button"
                      className="w-full btn-auto-glow-delay-2"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                        color: "oklch(0.97 0.005 240)",
                      }}
                    >
                      Continue
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── FORGOT — STEP 2: Answer security question ─────────── */}
              {view === "forgot-step2" && (
                <motion.div
                  key="forgot-step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="p-5"
                >
                  <button
                    type="button"
                    data-ocid="forgot.back2.button"
                    onClick={() => {
                      setForgotError("");
                      setView("forgot-step1");
                    }}
                    className="flex items-center gap-1.5 text-xs mb-4 transition-colors"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <h2
                    className="text-lg font-bold mb-1"
                    style={{ color: "oklch(0.92 0.01 250)" }}
                  >
                    Security Question
                  </h2>
                  <p
                    className="text-xs mb-5"
                    style={{ color: "oklch(0.52 0.02 250)" }}
                  >
                    Step 2 of 3 — Answer your security question
                  </p>

                  <form onSubmit={handleForgotStep2} className="space-y-4">
                    <div
                      className="rounded-xl px-3 py-2.5 text-sm"
                      style={{
                        background: "oklch(0.72 0.22 195 / 0.08)",
                        border: "1px solid oklch(0.72 0.22 195 / 0.2)",
                        color: "oklch(0.72 0.22 195)",
                      }}
                    >
                      {forgotQuestion}
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="forgot-answer"
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.65 0.05 250)" }}
                      >
                        Your Answer
                      </Label>
                      <Input
                        id="forgot-answer"
                        data-ocid="forgot.answer.input"
                        type="text"
                        autoComplete="off"
                        placeholder="Enter your answer"
                        value={forgotAnswer}
                        onChange={(e) => setForgotAnswer(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <ErrorBlock
                      msg={forgotError}
                      id="forgot.step2.error_state"
                    />
                    <Button
                      type="submit"
                      data-ocid="forgot.step2.submit_button"
                      className="w-full"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                        color: "oklch(0.97 0.005 240)",
                      }}
                    >
                      Verify Answer
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── FORGOT — STEP 3: New password ─────────────────────── */}
              {view === "forgot-step3" && (
                <motion.div
                  key="forgot-step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="p-5"
                >
                  <button
                    type="button"
                    data-ocid="forgot.back3.button"
                    onClick={() => {
                      setForgotError("");
                      setView("forgot-step2");
                    }}
                    className="flex items-center gap-1.5 text-xs mb-4 transition-colors"
                    style={{ color: "oklch(0.55 0.02 250)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <h2
                    className="text-lg font-bold mb-1"
                    style={{ color: "oklch(0.92 0.01 250)" }}
                  >
                    New Password
                  </h2>
                  <p
                    className="text-xs mb-5"
                    style={{ color: "oklch(0.52 0.02 250)" }}
                  >
                    Step 3 of 3 — Choose a new password
                  </p>

                  <form onSubmit={handleForgotStep3} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="forgot-newpw"
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.65 0.05 250)" }}
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="forgot-newpw"
                          data-ocid="forgot.newpw.input"
                          type={forgotShowNew ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Min 6 characters"
                          value={forgotNewPw}
                          onChange={(e) => setForgotNewPw(e.target.value)}
                          className="pr-10"
                          style={inputStyle}
                        />
                        <button
                          type="button"
                          onClick={() => setForgotShowNew((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                          style={{ color: "oklch(0.45 0.03 250)" }}
                          aria-label={
                            forgotShowNew ? "Hide password" : "Show password"
                          }
                        >
                          {forgotShowNew ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="forgot-confirmpw"
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.65 0.05 250)" }}
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="forgot-confirmpw"
                        data-ocid="forgot.confirmpw.input"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter new password"
                        value={forgotConfirmPw}
                        onChange={(e) => setForgotConfirmPw(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <ErrorBlock
                      msg={forgotError}
                      id="forgot.step3.error_state"
                    />

                    <Button
                      type="submit"
                      data-ocid="forgot.step3.submit_button"
                      disabled={forgotLoading}
                      className="w-full"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                        color: "oklch(0.97 0.005 240)",
                      }}
                    >
                      {forgotLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Reset Password
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── FORGOT — SUCCESS ──────────────────────────────────── */}
              {view === "forgot-success" && (
                <motion.div
                  key="forgot-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="p-8 flex flex-col items-center text-center gap-4"
                  data-ocid="forgot.success_state"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.75 0.2 160 / 0.15)",
                      border: "2px solid oklch(0.75 0.2 160 / 0.4)",
                    }}
                  >
                    <CheckCircle2
                      className="w-8 h-8"
                      style={{ color: "oklch(0.75 0.2 160)" }}
                    />
                  </motion.div>
                  <div>
                    <p
                      className="text-base font-bold"
                      style={{ color: "oklch(0.92 0.01 250)" }}
                    >
                      Password Reset!
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.52 0.02 250)" }}
                    >
                      Your password has been updated successfully.
                    </p>
                  </div>
                  <Button
                    data-ocid="forgot.goto_login.button"
                    onClick={() => {
                      resetForgotFlow();
                      setView("auth");
                      setActiveTab("login");
                    }}
                    className="btn-auto-glow"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                      color: "oklch(0.97 0.005 240)",
                    }}
                  >
                    Go to Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Feature pills */}
          {view === "auth" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-6 grid grid-cols-3 gap-3 w-full"
            >
              {[
                {
                  label: "Offline Ready",
                  desc: "Access IDs anytime",
                  color: "oklch(0.72 0.22 195)",
                },
                {
                  label: "Private",
                  desc: "Only you can see it",
                  color: "oklch(0.65 0.28 300)",
                },
                {
                  label: "Secure",
                  desc: "Password protected",
                  color: "oklch(0.75 0.2 160)",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + i * 0.07 }}
                  className="text-center"
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: f.color }}
                  >
                    {f.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-auto py-6 text-center text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground/70">
            Made with <span className="text-red-500">♥️</span> by Ankush Singh |
            Caffeine For Students
          </p>
          <p>© 2026 All Rights Reserved</p>
        </footer>
      </div>
    </>
  );
}
