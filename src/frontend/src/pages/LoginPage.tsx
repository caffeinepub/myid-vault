import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type TabType = "login" | "signup" | "forgot";

interface FormErrors {
  name?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  general?: string;
}

interface LoginPageProps {
  loginWithPassword: (username: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    username: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
  ) => Promise<void>;
  resetPassword: (
    username: string,
    securityAnswer: string,
    newPassword: string,
  ) => Promise<void>;
  getSecurityQuestion: (username: string) => string;
}

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What was the name of your primary school?",
  "What is your favourite movie?",
  "What city were you born in?",
  "What is your oldest sibling's middle name?",
];

// Reusable error box
function ErrorBox({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl px-3 py-2.5 text-sm font-medium"
      style={{
        background: "oklch(0.577 0.245 27.325 / 0.12)",
        border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
        color: "oklch(0.577 0.245 27.325)",
      }}
    >
      {message}
    </motion.div>
  );
}

// Step progress indicator
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {Array.from({ length: total }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length step array
        <div key={i} className="flex items-center gap-2">
          <motion.div
            animate={{
              background:
                i + 1 <= current
                  ? "oklch(0.38 0.1 265)"
                  : "oklch(0.85 0.015 250)",
              scale: i + 1 === current ? 1.15 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              color:
                i + 1 <= current
                  ? "oklch(0.97 0.005 240)"
                  : "oklch(0.55 0.03 250)",
            }}
          >
            {i + 1}
          </motion.div>
          {i < total - 1 && (
            <motion.div
              animate={{
                background:
                  i + 1 < current
                    ? "oklch(0.38 0.1 265)"
                    : "oklch(0.85 0.015 250)",
              }}
              className="h-0.5 w-6 rounded-full"
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      ))}
      <span className="ml-auto text-xs text-muted-foreground font-medium">
        Step {current} of {total}
      </span>
    </div>
  );
}

export default function LoginPage({
  loginWithPassword,
  signUp,
  resetPassword,
  getSecurityQuestion,
}: LoginPageProps) {
  const [tab, setTab] = useState<TabType>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign-up form state
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupSecurityQuestion, setSignupSecurityQuestion] = useState("");
  const [signupSecurityAnswer, setSignupSecurityAnswer] = useState("");

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!loginUsername.trim()) newErrors.username = "Username is required";
    if (!loginPassword) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await loginWithPassword(loginUsername.trim(), loginPassword);
      toast.success("Welcome back!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setErrors({ general: msg });
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!signupName.trim()) newErrors.name = "Full name is required";
    if (!signupUsername.trim()) newErrors.username = "Username is required";
    else if (signupUsername.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(signupUsername.trim()))
      newErrors.username = "Only letters, numbers, and underscores";
    if (!signupPassword) newErrors.password = "Password is required";
    else if (signupPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!signupConfirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (signupPassword !== signupConfirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!signupSecurityQuestion)
      newErrors.securityQuestion = "Please select a security question";
    if (!signupSecurityAnswer.trim())
      newErrors.securityAnswer = "Security answer is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await signUp(
        signupName.trim(),
        signupUsername.trim(),
        signupPassword,
        signupSecurityQuestion,
        signupSecurityAnswer.trim(),
      );
      toast.success(`Welcome, ${signupName.trim()}! Your vault is ready.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      setErrors({ general: msg });
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot password: Step 1 — find username
  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!forgotUsername.trim()) newErrors.username = "Username is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }
    setErrors({});
    try {
      const question = getSecurityQuestion(forgotUsername.trim());
      setForgotQuestion(question);
      setForgotStep(2);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not find account";
      setErrors({ general: msg });
      triggerShake();
    }
  };

  // Forgot password: Step 2 — verify answer
  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!forgotAnswer.trim()) newErrors.securityAnswer = "Answer is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }
    setErrors({});
    setForgotStep(3);
  };

  // Forgot password: Step 3 — reset password
  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!forgotNewPassword) newErrors.password = "New password is required";
    else if (forgotNewPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!forgotConfirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (forgotNewPassword !== forgotConfirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await resetPassword(
        forgotUsername.trim(),
        forgotAnswer.trim(),
        forgotNewPassword,
      );
      toast.success("Password reset successfully!");
      goBackToLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Password reset failed";
      setErrors({ general: msg });
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToLogin = () => {
    setTab("login");
    setForgotStep(1);
    setForgotUsername("");
    setForgotQuestion("");
    setForgotAnswer("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setShowForgotPassword(false);
    setErrors({});
  };

  const switchTab = (newTab: "login" | "signup") => {
    if (isSubmitting) return;
    setTab(newTab);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openForgot = () => {
    setTab("forgot");
    setForgotStep(1);
    setErrors({});
    setForgotUsername("");
    setForgotQuestion("");
    setForgotAnswer("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
  };

  // Slide direction for forgot steps
  const forgotSlideDir = (step: 1 | 2 | 3) =>
    step === forgotStep ? 0 : step < forgotStep ? -30 : 30;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.55 0.18 255) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.72 0.14 65) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.22 0.055 255) 1px, transparent 1px), linear-gradient(90deg, oklch(0.22 0.055 255) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="relative z-10 w-full max-w-sm mx-auto px-6 flex flex-col items-center text-center">
        {/* Logo + branding */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
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
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg rgb-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.38 0.1 265) 100%)",
              }}
            >
              <Wallet className="w-9 h-9 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            MyID Vault
          </h1>
          <p className="text-muted-foreground text-base mt-2 leading-relaxed">
            Store and access your IDs anywhere
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 22,
            delay: 0.15,
          }}
          className={`w-full rounded-3xl border border-border bg-card overflow-hidden rgb-glow-sm rgb-border ${
            shakeError ? "animate-shake" : ""
          }`}
          style={{
            boxShadow:
              "0 4px 6px -1px oklch(0.18 0.025 250 / 0.06), 0 16px 48px -12px oklch(0.18 0.025 250 / 0.12)",
          }}
        >
          {/* Tab switcher — hidden during forgot flow */}
          <AnimatePresence>
            {tab !== "forgot" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="relative flex border-b border-border"
                style={{ background: "oklch(0.96 0.008 240 / 0.5)" }}
              >
                {/* Sliding indicator */}
                <motion.div
                  className="absolute bottom-0 h-0.5 w-1/2 rgb-glow-sm"
                  style={{ background: "oklch(0.38 0.1 265)" }}
                  animate={{ x: tab === "login" ? "0%" : "100%" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                    tab === "login"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("signup")}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                    tab === "signup"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  }`}
                >
                  Sign Up
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form area */}
          <div className="p-6">
            {/* Security badge */}
            <div className="flex items-center justify-center mb-5">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "oklch(0.22 0.055 255 / 0.08)",
                  color: "oklch(0.35 0.08 255)",
                  border: "1px solid oklch(0.22 0.055 255 / 0.15)",
                }}
              >
                <Shield className="w-3 h-3" />
                Private &amp; Secure
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ─────────────── LOGIN ─────────────── */}
              {tab === "login" && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      Welcome back
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Sign in to access your ID vault
                    </p>
                  </div>

                  <AnimatePresence>
                    {errors.general && <ErrorBox message={errors.general} />}
                  </AnimatePresence>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="login-username"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        type="text"
                        autoComplete="username"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className={`pl-10 h-11 rounded-xl ${errors.username ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-destructive">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="login-password"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 rounded-xl ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password}
                      </p>
                    )}
                    {/* Forgot password link */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={openForgot}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-base font-semibold rounded-xl rgb-glow mt-2"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                      color: "oklch(0.97 0.005 240)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  {isSubmitting && (
                    <p className="text-xs text-center text-muted-foreground">
                      Establishing secure identity...
                    </p>
                  )}

                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("signup")}
                      className="underline underline-offset-2 hover:text-foreground transition-colors font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ─────────────── SIGN UP ─────────────── */}
              {tab === "signup" && (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      Create your vault
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Set up your account to get started
                    </p>
                  </div>

                  <AnimatePresence>
                    {errors.general && <ErrorBox message={errors.general} />}
                  </AnimatePresence>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-name"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className={`pl-10 h-11 rounded-xl ${errors.name ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-username"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Username
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        @
                      </span>
                      <Input
                        id="signup-username"
                        type="text"
                        autoComplete="username"
                        placeholder="choose_a_username"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className={`pl-8 h-11 rounded-xl ${errors.username ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-destructive">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-password"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min. 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 rounded-xl ${errors.password ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-confirm"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={signupConfirmPassword}
                        onChange={(e) =>
                          setSignupConfirmPassword(e.target.value)
                        }
                        className={`pl-10 pr-10 h-11 rounded-xl ${errors.confirmPassword ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Security Question */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-security-question"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Security Question
                    </Label>
                    <div className="relative">
                      <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                      <select
                        id="signup-security-question"
                        value={signupSecurityQuestion}
                        onChange={(e) =>
                          setSignupSecurityQuestion(e.target.value)
                        }
                        className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm appearance-none border bg-background text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 ${
                          errors.securityQuestion
                            ? "border-destructive"
                            : "border-input"
                        }`}
                        style={{ backgroundImage: "none" }}
                      >
                        <option value="" disabled>
                          Select a question...
                        </option>
                        {SECURITY_QUESTIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          role="img"
                          aria-label="dropdown chevron"
                        >
                          <title>dropdown chevron</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.securityQuestion && (
                      <p className="text-xs text-destructive">
                        {errors.securityQuestion}
                      </p>
                    )}
                  </div>

                  {/* Security Answer */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-security-answer"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Security Answer
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-security-answer"
                        type="text"
                        placeholder="Your answer (remember this!)"
                        value={signupSecurityAnswer}
                        onChange={(e) =>
                          setSignupSecurityAnswer(e.target.value)
                        }
                        className={`pl-10 h-11 rounded-xl ${errors.securityAnswer ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.securityAnswer && (
                      <p className="text-xs text-destructive">
                        {errors.securityAnswer}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This is used to recover your account if you forget your
                      password.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-base font-semibold rounded-xl rgb-glow mt-2"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                      color: "oklch(0.97 0.005 240)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating vault...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {isSubmitting && (
                    <p className="text-xs text-center text-muted-foreground">
                      Establishing secure identity...
                    </p>
                  )}

                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("login")}
                      className="underline underline-offset-2 hover:text-foreground transition-colors font-medium"
                    >
                      Login
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ─────────────── FORGOT PASSWORD ─────────────── */}
              {tab === "forgot" && (
                <motion.div
                  key="forgot-flow"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: "oklch(0.38 0.1 265 / 0.12)",
                        }}
                      >
                        <KeyRound
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(0.38 0.1 265)" }}
                        />
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Reset Password
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Answer your security question to reset your password.
                    </p>
                  </div>

                  {/* Step indicator */}
                  <StepIndicator current={forgotStep} total={3} />

                  {/* Step forms */}
                  <AnimatePresence mode="wait">
                    {/* Step 1 — Enter username */}
                    {forgotStep === 1 && (
                      <motion.form
                        key="forgot-step-1"
                        initial={{ opacity: 0, x: forgotSlideDir(1) }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        onSubmit={handleForgotStep1}
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {errors.general && (
                            <ErrorBox message={errors.general} />
                          )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="forgot-username"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Username
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="forgot-username"
                              type="text"
                              autoComplete="username"
                              placeholder="Enter your username"
                              value={forgotUsername}
                              onChange={(e) =>
                                setForgotUsername(e.target.value)
                              }
                              className={`pl-10 h-11 rounded-xl ${errors.username ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.username && (
                            <p className="text-xs text-destructive">
                              {errors.username}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-semibold rounded-xl rgb-glow"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                            color: "oklch(0.97 0.005 240)",
                          }}
                        >
                          Continue
                        </Button>
                      </motion.form>
                    )}

                    {/* Step 2 — Answer security question */}
                    {forgotStep === 2 && (
                      <motion.form
                        key="forgot-step-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        onSubmit={handleForgotStep2}
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {errors.general && (
                            <ErrorBox message={errors.general} />
                          )}
                        </AnimatePresence>

                        {/* Security question display */}
                        <div
                          className="rounded-xl px-4 py-3 text-sm font-medium text-left"
                          style={{
                            background: "oklch(0.38 0.1 265 / 0.08)",
                            border: "1px solid oklch(0.38 0.1 265 / 0.2)",
                            color: "oklch(0.28 0.07 265)",
                          }}
                        >
                          <p className="text-xs uppercase tracking-wide font-semibold mb-1 opacity-70">
                            Your security question
                          </p>
                          <p>{forgotQuestion}</p>
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="forgot-answer"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Your Answer
                          </Label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="forgot-answer"
                              type="text"
                              placeholder="Type your answer"
                              value={forgotAnswer}
                              onChange={(e) => setForgotAnswer(e.target.value)}
                              className={`pl-10 h-11 rounded-xl ${errors.securityAnswer ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.securityAnswer && (
                            <p className="text-xs text-destructive">
                              {errors.securityAnswer}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-semibold rounded-xl rgb-glow"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                            color: "oklch(0.97 0.005 240)",
                          }}
                        >
                          Verify Answer
                        </Button>
                      </motion.form>
                    )}

                    {/* Step 3 — Set new password */}
                    {forgotStep === 3 && (
                      <motion.form
                        key="forgot-step-3"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        onSubmit={handleForgotStep3}
                        className="space-y-4"
                      >
                        <AnimatePresence>
                          {errors.general && (
                            <ErrorBox message={errors.general} />
                          )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="forgot-new-password"
                            className="text-sm font-medium text-foreground/80"
                          >
                            New Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="forgot-new-password"
                              type={showForgotPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Min. 6 characters"
                              value={forgotNewPassword}
                              onChange={(e) =>
                                setForgotNewPassword(e.target.value)
                              }
                              className={`pl-10 pr-10 h-11 rounded-xl ${errors.password ? "border-destructive" : ""}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={
                                showForgotPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showForgotPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-xs text-destructive">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="forgot-confirm-password"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="forgot-confirm-password"
                              type={showForgotPassword ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Re-enter new password"
                              value={forgotConfirmPassword}
                              onChange={(e) =>
                                setForgotConfirmPassword(e.target.value)
                              }
                              className={`pl-10 h-11 rounded-xl ${errors.confirmPassword ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-xs text-destructive">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-11 text-base font-semibold rounded-xl rgb-glow"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                            color: "oklch(0.97 0.005 240)",
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Resetting...
                            </>
                          ) : (
                            "Reset Password"
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Back to Login link */}
                  <button
                    type="button"
                    onClick={goBackToLogin}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Feature hints */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 grid grid-cols-3 gap-4 w-full"
        >
          {[
            { label: "Offline Ready", desc: "Access IDs anytime" },
            { label: "Private", desc: "Only you can see it" },
            { label: "Secure", desc: "Encrypted storage" },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.07 }}
              className="text-center"
            >
              <p className="text-xs font-semibold text-foreground">{f.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-6 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground/70">
          Made with <span className="text-red-500">♥️</span> by Ankush Singh |
          Caffeine For Students
        </p>
        <p>© 2026 All Rights Reserved</p>
      </footer>

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
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
