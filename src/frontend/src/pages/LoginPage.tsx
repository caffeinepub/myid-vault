import { Eye, EyeOff, KeyRound, Loader2, Shield, User } from "lucide-react";
import { useState } from "react";
import NeonText3D from "../components/NeonText3D";
import { SECURITY_QUESTIONS } from "../lib/storage";

const BRANDING_FOOTER = (
  <footer
    style={{
      position: "fixed",
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: "'Exo 2', sans-serif",
      fontSize: "0.72rem",
      color: "rgba(0,255,255,0.35)",
      zIndex: 10,
      pointerEvents: "none",
    }}
  >
    <div>Made with ❤️ by Ankush Singh | Caffeine For Students</div>
    <div style={{ color: "rgba(255,255,255,0.2)", marginTop: "0.1rem" }}>
      &copy; 2026 All Rights Reserved
    </div>
  </footer>
);

type Tab = "login" | "signup";
type ForgotStep = "username" | "question" | "newpass";

function ShowHideToggle({
  show,
  onToggle,
}: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute",
        right: "0.75rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "rgba(0,255,255,0.5)",
        padding: "0.25rem",
        display: "flex",
        alignItems: "center",
      }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "9px",
  border: "1.5px solid rgba(0,255,255,0.2)",
  background: "rgba(0,20,40,0.6)",
  color: "rgba(255,255,255,0.9)",
  fontFamily: "'Exo 2', sans-serif",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Exo 2', sans-serif",
  fontSize: "0.72rem",
  color: "rgba(0,255,255,0.6)",
  marginBottom: "0.35rem",
  letterSpacing: "0.07em",
};

const fieldStyle: React.CSSProperties = {
  marginBottom: "0.85rem",
  position: "relative" as const,
  textAlign: "left" as const,
};

function Field({
  id,
  label,
  children,
}: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LoginPage({
  onGuestLogin,
  onLogin,
  onSignUp,
}: {
  onGuestLogin?: () => void;
  onLogin?: (username: string, password: string) => Promise<void>;
  onSignUp?: (
    name: string,
    username: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
  ) => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>("login");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Sign Up
  const [signupName, setSignupName] = useState("");
  const [signupUser, setSignupUser] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [secQuestion, setSecQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [secAnswer, setSecAnswer] = useState("");

  // Forgot password
  const [forgotStep, setForgotStep] = useState<ForgotStep>("username");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);

  const clearError = () => setError("");

  const handleLogin = async () => {
    clearError();
    if (!loginUser.trim() || !loginPass) {
      setError("Please fill in all fields.");
      return;
    }
    if (!onLogin) return;
    setLoading(true);
    try {
      await onLogin(loginUser.trim(), loginPass);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    clearError();
    if (
      !signupName.trim() ||
      !signupUser.trim() ||
      !signupPass ||
      !signupConfirm ||
      !secAnswer.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }
    if (signupPass !== signupConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (signupPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!onSignUp) return;
    setLoading(true);
    try {
      await onSignUp(
        signupName.trim(),
        signupUser.trim(),
        signupPass,
        secQuestion,
        secAnswer.trim(),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep1 = async () => {
    clearError();
    if (!forgotUsername.trim()) {
      setError("Please enter your username.");
      return;
    }
    setLoading(true);
    try {
      const accounts = (() => {
        try {
          const raw = localStorage.getItem("myid-vault-accounts");
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      })();
      const key = forgotUsername.toLowerCase().trim();
      const account = accounts[key];
      if (!account) throw new Error("No account found with this username.");
      if (!account.securityQuestion)
        throw new Error("This account has no security question set up.");
      setForgotQuestion(account.securityQuestion);
      setForgotStep("question");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "User not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep2 = () => {
    clearError();
    if (!forgotAnswer.trim()) {
      setError("Please enter your answer.");
      return;
    }
    setForgotStep("newpass");
  };

  const handleForgotStep3 = async () => {
    clearError();
    if (!forgotNewPass || !forgotConfirmPass) {
      setError("Please fill in both password fields.");
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setError("Passwords do not match.");
      return;
    }
    if (forgotNewPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const accounts = (() => {
        try {
          const raw = localStorage.getItem("myid-vault-accounts");
          return raw
            ? (JSON.parse(raw) as Record<
                string,
                {
                  passwordHash: string;
                  securityAnswerHash: string;
                  [k: string]: unknown;
                }
              >)
            : {};
        } catch {
          return {} as Record<
            string,
            {
              passwordHash: string;
              securityAnswerHash: string;
              [k: string]: unknown;
            }
          >;
        }
      })();
      const key = forgotUsername.toLowerCase().trim();
      const account = accounts[key];
      if (!account) throw new Error("Account not found.");
      const enc = new TextEncoder();
      const answerBuf = await crypto.subtle.digest(
        "SHA-256",
        enc.encode(forgotAnswer.toLowerCase().trim()),
      );
      const answerHash = Array.from(new Uint8Array(answerBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (answerHash !== account.securityAnswerHash)
        throw new Error("Incorrect answer to security question.");
      const passBuf = await crypto.subtle.digest(
        "SHA-256",
        enc.encode(forgotNewPass),
      );
      const passHash = Array.from(new Uint8Array(passBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      accounts[key] = { ...account, passwordHash: passHash };
      localStorage.setItem("myid-vault-accounts", JSON.stringify(accounts));
      if (onLogin) await onLogin(key, forgotNewPass);
      setForgotOpen(false);
      setForgotStep("username");
      setForgotUsername("");
      setForgotAnswer("");
      setForgotNewPass("");
      setForgotConfirmPass("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const neonBtn = (overrides?: React.CSSProperties): React.CSSProperties => ({
    width: "100%",
    padding: "0.85rem",
    borderRadius: "10px",
    border: "1.5px solid rgba(0,255,255,0.5)",
    background:
      "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(123,0,255,0.1))",
    color: "#00ffff",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.85rem",
    letterSpacing: "0.07em",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    opacity: loading ? 0.7 : 1,
    ...overrides,
  });

  if (forgotOpen) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
        }}
      >
        <div
          className="glass-card slide-up-fade"
          style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <button
              type="button"
              data-ocid="forgot.cancel_button"
              onClick={() => {
                setForgotOpen(false);
                setForgotStep("username");
                clearError();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(0,255,255,0.6)",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                fontSize: "1.1rem",
              }}
            >
              ←
            </button>
            <h3
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.95rem",
                color: "rgba(0,255,255,0.85)",
                margin: 0,
              }}
            >
              Reset Password
            </h3>
          </div>

          <div
            style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem" }}
          >
            {(["username", "question", "newpass"] as ForgotStep[]).map(
              (s, i) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: "3px",
                    borderRadius: "2px",
                    background:
                      (
                        ["username", "question", "newpass"] as ForgotStep[]
                      ).indexOf(forgotStep) >= i
                        ? "rgba(0,255,255,0.7)"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              ),
            )}
          </div>

          {forgotStep === "username" && (
            <>
              <Field id="forgot-username" label="Username">
                <input
                  id="forgot-username"
                  data-ocid="forgot.input"
                  type="text"
                  placeholder="Enter your username"
                  value={forgotUsername}
                  onChange={(e) => {
                    setForgotUsername(e.target.value);
                    clearError();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleForgotStep1()}
                  style={inputStyle}
                />
              </Field>
              {error && (
                <p
                  style={{
                    color: "#ff6666",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.78rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                data-ocid="forgot.primary_button"
                onClick={handleForgotStep1}
                disabled={loading}
                className="neon-btn"
                style={neonBtn({
                  padding: "0.8rem",
                  border: "1.5px solid rgba(0,255,255,0.4)",
                  background: "rgba(0,255,255,0.08)",
                  fontSize: "0.82rem",
                })}
              >
                {loading ? (
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <KeyRound size={16} />
                )}
                Continue
              </button>
            </>
          )}

          {forgotStep === "question" && (
            <>
              <p
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "0.4rem",
                }}
              >
                Security Question:
              </p>
              <p
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.9rem",
                  color: "rgba(0,255,255,0.85)",
                  marginBottom: "1rem",
                  fontStyle: "italic",
                }}
              >
                {forgotQuestion}
              </p>
              <Field id="forgot-answer" label="Your Answer">
                <input
                  id="forgot-answer"
                  data-ocid="forgot.input"
                  type="text"
                  placeholder="Enter your answer"
                  value={forgotAnswer}
                  onChange={(e) => {
                    setForgotAnswer(e.target.value);
                    clearError();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleForgotStep2()}
                  style={inputStyle}
                />
              </Field>
              {error && (
                <p
                  style={{
                    color: "#ff6666",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.78rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                data-ocid="forgot.primary_button"
                onClick={handleForgotStep2}
                className="neon-btn"
                style={neonBtn({
                  padding: "0.8rem",
                  border: "1.5px solid rgba(0,255,255,0.4)",
                  background: "rgba(0,255,255,0.08)",
                  fontSize: "0.82rem",
                })}
              >
                Verify Answer
              </button>
            </>
          )}

          {forgotStep === "newpass" && (
            <>
              <Field id="forgot-newpass" label="New Password">
                <div style={{ position: "relative" }}>
                  <input
                    id="forgot-newpass"
                    data-ocid="forgot.input"
                    type={showForgotPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={forgotNewPass}
                    onChange={(e) => {
                      setForgotNewPass(e.target.value);
                      clearError();
                    }}
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                  />
                  <ShowHideToggle
                    show={showForgotPass}
                    onToggle={() => setShowForgotPass((v) => !v)}
                  />
                </div>
              </Field>
              <Field id="forgot-confirmpass" label="Confirm New Password">
                <div style={{ position: "relative" }}>
                  <input
                    id="forgot-confirmpass"
                    data-ocid="forgot.input"
                    type={showForgotPass ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={forgotConfirmPass}
                    onChange={(e) => {
                      setForgotConfirmPass(e.target.value);
                      clearError();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleForgotStep3()}
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                  />
                </div>
              </Field>
              {error && (
                <p
                  style={{
                    color: "#ff6666",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.78rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                data-ocid="forgot.submit_button"
                onClick={handleForgotStep3}
                disabled={loading}
                className="neon-btn"
                style={neonBtn({
                  padding: "0.8rem",
                  border: "1.5px solid rgba(0,255,255,0.4)",
                  background: "rgba(0,255,255,0.08)",
                  fontSize: "0.82rem",
                })}
              >
                {loading ? (
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : null}
                Reset Password
              </button>
            </>
          )}
        </div>
        {BRANDING_FOOTER}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
        paddingLeft: "1.25rem",
        paddingRight: "1.25rem",
      }}
    >
      {/* Logo */}
      <div
        className="slide-up-fade"
        style={{
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, rgba(0,255,255,0.15), rgba(123,0,255,0.15))",
            border: "1.5px solid rgba(0,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 0 28px rgba(0,255,255,0.2), inset 0 0 18px rgba(0,255,255,0.05)",
          }}
        >
          <Shield size={34} style={{ color: "#00ffff" }} />
        </div>
        <NeonText3D text="MyID Vault" size="2rem" />
        <p
          style={{
            fontFamily: "'Exo 2', sans-serif",
            color: "rgba(0,255,255,0.55)",
            fontSize: "0.82rem",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          Your Secure ID Vault
        </p>
      </div>

      {/* Card */}
      <div
        className="glass-card slide-up-fade"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "0",
          overflow: "hidden",
          animationDelay: "0.1s",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(0,255,255,0.12)",
          }}
        >
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              data-ocid={`login.${t}.tab`}
              onClick={() => {
                setTab(t);
                clearError();
              }}
              style={{
                flex: 1,
                padding: "0.85rem",
                background: tab === t ? "rgba(0,255,255,0.07)" : "transparent",
                border: "none",
                borderBottom:
                  tab === t
                    ? "2px solid rgba(0,255,255,0.7)"
                    : "2px solid transparent",
                color: tab === t ? "#00ffff" : "rgba(255,255,255,0.35)",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.8rem",
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "uppercase",
              }}
            >
              {t === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ padding: "1.75rem 1.75rem 1.5rem" }}>
          {tab === "login" && (
            <>
              <Field id="login-username" label="Username">
                <div style={{ position: "relative" }}>
                  <User
                    size={15}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(0,255,255,0.4)",
                    }}
                  />
                  <input
                    id="login-username"
                    data-ocid="login.input"
                    type="text"
                    placeholder="Your username"
                    value={loginUser}
                    onChange={(e) => {
                      setLoginUser(e.target.value);
                      clearError();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    style={{ ...inputStyle, paddingLeft: "2.2rem" }}
                    autoComplete="username"
                  />
                </div>
              </Field>
              <Field id="login-password" label="Password">
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    data-ocid="login.input"
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Your password"
                    value={loginPass}
                    onChange={(e) => {
                      setLoginPass(e.target.value);
                      clearError();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    autoComplete="current-password"
                  />
                  <ShowHideToggle
                    show={showLoginPass}
                    onToggle={() => setShowLoginPass((v) => !v)}
                  />
                </div>
              </Field>

              {error && (
                <p
                  data-ocid="login.error_state"
                  style={{
                    color: "#ff6666",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.78rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                data-ocid="login.primary_button"
                onClick={handleLogin}
                disabled={loading}
                className="neon-btn"
                style={neonBtn({ marginBottom: "0.85rem" })}
              >
                {loading ? (
                  <Loader2
                    size={17}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Shield size={17} />
                )}
                {loading ? "Logging in…" : "Login"}
              </button>

              <button
                type="button"
                data-ocid="login.link"
                onClick={() => {
                  setForgotOpen(true);
                  clearError();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(0,255,255,0.5)",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "block",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Forgot Password?
              </button>
            </>
          )}

          {tab === "signup" && (
            <>
              <Field id="signup-name" label="Full Name">
                <input
                  id="signup-name"
                  data-ocid="signup.input"
                  type="text"
                  placeholder="Your name"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    clearError();
                  }}
                  style={inputStyle}
                  autoComplete="name"
                />
              </Field>
              <Field id="signup-username" label="Username">
                <div style={{ position: "relative" }}>
                  <User
                    size={15}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(0,255,255,0.4)",
                    }}
                  />
                  <input
                    id="signup-username"
                    data-ocid="signup.input"
                    type="text"
                    placeholder="Choose a username"
                    value={signupUser}
                    onChange={(e) => {
                      setSignupUser(e.target.value);
                      clearError();
                    }}
                    style={{ ...inputStyle, paddingLeft: "2.2rem" }}
                    autoComplete="username"
                  />
                </div>
              </Field>
              <Field id="signup-password" label="Password">
                <div style={{ position: "relative" }}>
                  <input
                    id="signup-password"
                    data-ocid="signup.input"
                    type={showSignupPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={signupPass}
                    onChange={(e) => {
                      setSignupPass(e.target.value);
                      clearError();
                    }}
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    autoComplete="new-password"
                  />
                  <ShowHideToggle
                    show={showSignupPass}
                    onToggle={() => setShowSignupPass((v) => !v)}
                  />
                </div>
              </Field>
              <Field id="signup-confirm" label="Confirm Password">
                <div style={{ position: "relative" }}>
                  <input
                    id="signup-confirm"
                    data-ocid="signup.input"
                    type={showSignupConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    value={signupConfirm}
                    onChange={(e) => {
                      setSignupConfirm(e.target.value);
                      clearError();
                    }}
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    autoComplete="new-password"
                  />
                  <ShowHideToggle
                    show={showSignupConfirm}
                    onToggle={() => setShowSignupConfirm((v) => !v)}
                  />
                </div>
              </Field>
              <Field id="signup-question" label="Security Question">
                <select
                  id="signup-question"
                  data-ocid="signup.select"
                  value={secQuestion}
                  onChange={(e) => setSecQuestion(e.target.value)}
                  style={
                    { ...inputStyle, appearance: "none" } as React.CSSProperties
                  }
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q} style={{ background: "#030308" }}>
                      {q}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="signup-answer" label="Your Answer">
                <input
                  id="signup-answer"
                  data-ocid="signup.input"
                  type="text"
                  placeholder="Answer (case-insensitive)"
                  value={secAnswer}
                  onChange={(e) => {
                    setSecAnswer(e.target.value);
                    clearError();
                  }}
                  style={inputStyle}
                />
              </Field>

              {error && (
                <p
                  data-ocid="signup.error_state"
                  style={{
                    color: "#ff6666",
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.78rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                data-ocid="signup.primary_button"
                onClick={handleSignUp}
                disabled={loading}
                className="neon-btn"
                style={neonBtn()}
              >
                {loading ? (
                  <Loader2
                    size={17}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : null}
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </>
          )}

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1.2rem 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(0,255,255,0.1)",
              }}
            />
            <span
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(0,255,255,0.1)",
              }}
            />
          </div>

          <button
            type="button"
            data-ocid="login.secondary_button"
            onClick={onGuestLogin}
            className="neon-btn"
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "10px",
              border: "1.5px solid rgba(255,180,0,0.4)",
              background:
                "linear-gradient(135deg, rgba(255,180,0,0.08), rgba(255,100,0,0.06))",
              color: "#ffb400",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 0 14px rgba(255,180,0,0.08)",
            }}
          >
            <User size={16} />
            Continue as Guest
          </button>
          <p
            style={{
              fontFamily: "'Exo 2', sans-serif",
              color: "rgba(255,180,0,0.4)",
              fontSize: "0.68rem",
              marginTop: "0.5rem",
              textAlign: "center",
            }}
          >
            Guest data is saved on this device only
          </p>
        </div>
      </div>
      {BRANDING_FOOTER}
    </div>
  );
}
