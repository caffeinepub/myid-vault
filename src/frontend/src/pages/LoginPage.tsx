import { Button } from "@/components/ui/button";
import { Loader2, Shield, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

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
        {/* Decorative grid pattern */}
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
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.38 0.1 265) 100%)",
                boxShadow:
                  "0 8px 32px oklch(0.22 0.055 255 / 0.35), 0 2px 8px oklch(0.22 0.055 255 / 0.2)",
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

        {/* Login card — bounce entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 22,
            delay: 0.15,
          }}
          className="w-full rounded-3xl border border-border bg-card p-8"
          style={{
            boxShadow:
              "0 4px 6px -1px oklch(0.18 0.025 250 / 0.06), 0 16px 48px -12px oklch(0.18 0.025 250 / 0.12)",
          }}
        >
          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold"
            style={{
              background: "oklch(0.22 0.055 255 / 0.08)",
              color: "oklch(0.35 0.08 255)",
              border: "1px solid oklch(0.22 0.055 255 / 0.15)",
            }}
          >
            <Shield className="w-3 h-3" />
            Passwordless &amp; Secure
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.35 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sign in to your vault
            </h2>
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              Internet Identity keeps your data secure without passwords — use
              your device's fingerprint or face ID.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
          >
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                color: "oklch(0.97 0.005 240)",
                boxShadow: "0 4px 16px oklch(0.22 0.055 255 / 0.3)",
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="text-xs text-muted-foreground mt-4 leading-relaxed"
          >
            Your IDs are private and only visible to you — secured by ICP's
            decentralized authentication.
          </motion.p>
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
            { label: "Secure", desc: "No passwords needed" },
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
    </div>
  );
}
