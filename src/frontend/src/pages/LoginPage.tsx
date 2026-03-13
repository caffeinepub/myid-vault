import { Loader2, Shield } from "lucide-react";
import NeonText3D from "../components/NeonText3D";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const loading = isLoggingIn || isInitializing;

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
      {/* Logo / Icon */}
      <div
        className="slide-up-fade"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, rgba(0,255,255,0.15), rgba(123,0,255,0.15))",
            border: "1.5px solid rgba(0,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 0 30px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,255,255,0.05)",
          }}
        >
          <Shield size={36} style={{ color: "#00ffff" }} />
        </div>
      </div>

      {/* Main card */}
      <div
        className="glass-card slide-up-fade"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          animationDelay: "0.1s",
        }}
      >
        <NeonText3D text="MyID Vault" size="2.2rem" />
        <p
          style={{
            fontFamily: "'Exo 2', sans-serif",
            color: "rgba(0,255,255,0.6)",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
            marginBottom: "2rem",
            letterSpacing: "0.05em",
          }}
        >
          Your Secure ID Vault
        </p>

        <p
          style={{
            fontFamily: "'Exo 2', sans-serif",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.82rem",
            marginBottom: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          Store all your ID cards securely on the blockchain. Access from any
          device with Internet Identity.
        </p>

        <button
          type="button"
          data-ocid="login.primary_button"
          onClick={() => login()}
          disabled={loading}
          className="neon-btn"
          style={{
            width: "100%",
            padding: "0.85rem 1.5rem",
            borderRadius: "10px",
            border: "1.5px solid rgba(0,255,255,0.5)",
            background:
              "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(123,0,255,0.1))",
            color: "#00ffff",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <Loader2
              size={18}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Shield size={18} />
          )}
          {loading ? "Authenticating…" : "Login with Internet Identity"}
        </button>

        <p
          style={{
            fontFamily: "'Exo 2', sans-serif",
            color: "rgba(255,255,255,0.25)",
            fontSize: "0.72rem",
            marginTop: "1.25rem",
          }}
        >
          Powered by Internet Computer · No passwords required
        </p>
      </div>

      {BRANDING_FOOTER}
    </div>
  );
}
