import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock, Shield, User, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type TabType = "login" | "signup";

interface FormErrors {
  name?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface LoginPageProps {
  loginWithPassword: (username: string, password: string) => Promise<void>;
  signUp: (name: string, username: string, password: string) => Promise<void>;
}

export default function LoginPage({
  loginWithPassword,
  signUp,
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
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await signUp(signupName.trim(), signupUsername.trim(), signupPassword);
      toast.success(`Welcome, ${signupName.trim()}! Your vault is ready.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      setErrors({ general: msg });
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (newTab: TabType) => {
    if (isSubmitting) return;
    setTab(newTab);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

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
          {/* Tab switcher */}
          <div
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
          </div>

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
              {tab === "login" ? (
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

                  {/* General error */}
                  <AnimatePresence>
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl px-3 py-2.5 text-sm text-destructive-foreground font-medium"
                        style={{
                          background: "oklch(0.577 0.245 27.325 / 0.12)",
                          border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
                          color: "oklch(0.577 0.245 27.325)",
                        }}
                      >
                        {errors.general}
                      </motion.div>
                    )}
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
              ) : (
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

                  {/* General error */}
                  <AnimatePresence>
                    {errors.general && (
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
                        {errors.general}
                      </motion.div>
                    )}
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
      <footer className="relative z-10 mt-auto py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-accent">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
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
