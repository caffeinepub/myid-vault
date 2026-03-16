import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AppBackground from "./components/AppBackground";
import { usePasswordAuth } from "./hooks/usePasswordAuth";
import { isAccountBanned } from "./lib/storage";
import AddCardPage from "./pages/AddCardPage";
import AdminPage from "./pages/AdminPage";
import CardViewerPage from "./pages/CardViewerPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";

export type AppPage =
  | { type: "home" }
  | { type: "view"; cardId: string }
  | { type: "add" }
  | { type: "edit"; cardId: string }
  | { type: "settings" };

function LoginSplash({
  name,
  onDone,
}: {
  name: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(3,3,12,0.97)" }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 18,
          delay: 0.1,
        }}
        style={{ fontSize: "4rem", marginBottom: "1.5rem" }}
      >
        ✅
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="neon-text-3d"
        style={{ fontSize: "1.6rem" }}
      >
        Welcome, {name}!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          color: "rgba(0,255,255,0.5)",
          marginTop: "0.5rem",
          fontFamily: "'Exo 2', sans-serif",
        }}
      >
        Loading your vault…
      </motion.p>
    </motion.div>
  );
}

function PageTransition({
  children,
  pageKey,
}: {
  children: React.ReactNode;
  pageKey: string;
}) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -22, scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 28,
        opacity: { duration: 0.22 },
      }}
    >
      {children}
    </motion.div>
  );
}

function AuthenticatedApp({
  principalText,
  onLogout,
  isGuest,
}: {
  principalText: string;
  onLogout: () => void;
  isGuest?: boolean;
}) {
  const [page, setPage] = useState<AppPage>({ type: "home" });
  const queryClient = useQueryClient();

  const navigate = (p: AppPage) => setPage(p);

  const handleLogout = () => {
    queryClient.clear();
    onLogout();
  };

  const pageKey =
    page.type === "view"
      ? `view-${page.cardId}`
      : page.type === "edit"
        ? `edit-${page.cardId}`
        : page.type;

  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
        position: "relative",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {page.type === "home" && (
            <PageTransition pageKey={pageKey}>
              <HomePage
                navigate={navigate}
                principalText={principalText}
                onLogout={handleLogout}
                isGuest={isGuest}
              />
            </PageTransition>
          )}
          {page.type === "view" && (
            <PageTransition pageKey={pageKey}>
              <CardViewerPage
                cardId={page.cardId}
                navigate={navigate}
                isGuest={isGuest}
              />
            </PageTransition>
          )}
          {page.type === "add" && (
            <PageTransition pageKey={pageKey}>
              <AddCardPage navigate={navigate} isGuest={isGuest} />
            </PageTransition>
          )}
          {page.type === "edit" && (
            <PageTransition pageKey={pageKey}>
              <AddCardPage
                navigate={navigate}
                editCardId={page.cardId}
                isGuest={isGuest}
              />
            </PageTransition>
          )}
          {page.type === "settings" && (
            <PageTransition pageKey={pageKey}>
              <SettingsPage navigate={navigate} principalText={principalText} />
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const { user, login, signUp, logout, isInitializing } = usePasswordAuth();
  const [isAdminRoute, setIsAdminRoute] = useState(
    () => window.location.hash === "#admin",
  );
  const [showSplash, setShowSplash] = useState(false);
  const [splashName, setSplashName] = useState("User");
  const [guestMode, setGuestMode] = useState(false);
  const prevLoggedIn = useRef(false);

  const isLoggedIn = !!user;
  const principalText = user?.username ?? "";
  const isBanned = isLoggedIn && isAccountBanned(principalText);

  useEffect(() => {
    const handler = () => setIsAdminRoute(window.location.hash === "#admin");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    if (isLoggedIn && !prevLoggedIn.current && user) {
      setSplashName(user.name || user.username);
      setShowSplash(true);
      setGuestMode(false);
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, user]);

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
  };

  const handleSignUp = async (
    name: string,
    username: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
  ) => {
    await signUp(name, username, password, securityQuestion, securityAnswer);
  };

  if (isAdminRoute) {
    return (
      <div style={{ position: "relative", minHeight: "100dvh" }}>
        <AppBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Toaster position="top-center" richColors />
          <AdminPage
            onExit={() => {
              window.location.hash = "";
              setIsAdminRoute(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div style={{ position: "relative", minHeight: "100dvh" }}>
        <AppBackground />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100dvh",
          }}
        >
          <span
            className="neon-text-3d"
            style={{ fontSize: "1.2rem", letterSpacing: "0.2em" }}
          >
            LOADING…
          </span>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          background: "#030308",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h2
            style={{
              fontFamily: "Orbitron, sans-serif",
              color: "#ff4444",
              marginBottom: "0.5rem",
            }}
          >
            Account Suspended
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            Contact the administrator for assistance.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.5rem",
              border: "1px solid #ff4444",
              color: "#ff4444",
              background: "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "'Exo 2', sans-serif",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !guestMode) {
    return (
      <div style={{ position: "relative", minHeight: "100dvh" }}>
        <AppBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Toaster position="top-center" richColors />
          <LoginPage
            onGuestLogin={() => setGuestMode(true)}
            onLogin={handleLogin}
            onSignUp={handleSignUp}
          />
        </div>
      </div>
    );
  }

  if (guestMode) {
    return (
      <div style={{ position: "relative", minHeight: "100dvh" }}>
        <AppBackground />
        <Toaster position="top-center" richColors />
        <AuthenticatedApp
          principalText="guest"
          onLogout={() => setGuestMode(false)}
          isGuest={true}
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100dvh" }}>
      <AppBackground />
      <Toaster position="top-center" richColors />
      <AnimatePresence>
        {showSplash && (
          <LoginSplash name={splashName} onDone={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      {!showSplash && (
        <AuthenticatedApp
          principalText={principalText}
          onLogout={() => logout()}
        />
      )}
    </div>
  );
}
