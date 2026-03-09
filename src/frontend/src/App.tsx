import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import AppBackground from "./components/AppBackground";
import { type AuthUser, usePasswordAuth } from "./hooks/usePasswordAuth";
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

// Page transition wrapper
function PageTransition({
  children,
  pageKey,
}: { children: React.ReactNode; pageKey: string }) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, x: 40, y: 30, scale: 0.93 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, y: -30, scale: 0.93 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        mass: 0.9,
        opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}

function AuthenticatedApp({
  userName,
  onLogout,
}: {
  userName: string;
  onLogout: () => void;
}) {
  const [page, setPage] = useState<AppPage>({ type: "home" });
  const navigate = (p: AppPage) => setPage(p);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    onLogout();
    queryClient.clear();
    setPage({ type: "home" });
  };

  // Derive page key for transitions
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
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 5rem)",
        position: "relative",
        background: "transparent",
      }}
    >
      <AppBackground username={userName} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Toaster position="top-center" richColors />

        <AnimatePresence mode="wait">
          {page.type === "home" && (
            <PageTransition pageKey={pageKey}>
              <HomePage
                navigate={navigate}
                userName={userName}
                onLogout={handleLogout}
              />
            </PageTransition>
          )}
          {page.type === "view" && (
            <PageTransition pageKey={pageKey}>
              <CardViewerPage cardId={page.cardId} navigate={navigate} />
            </PageTransition>
          )}
          {page.type === "add" && (
            <PageTransition pageKey={pageKey}>
              <AddCardPage navigate={navigate} />
            </PageTransition>
          )}
          {page.type === "edit" && (
            <PageTransition pageKey={pageKey}>
              <AddCardPage navigate={navigate} editCardId={page.cardId} />
            </PageTransition>
          )}
          {page.type === "settings" && (
            <PageTransition pageKey={pageKey}>
              <SettingsPage navigate={navigate} />
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const {
    user,
    isInitializing,
    signUp,
    loginWithPassword,
    logout,
    getSecurityQuestion,
    resetPassword,
  } = usePasswordAuth();

  // Admin route detection via hash
  const [isAdminRoute, setIsAdminRoute] = useState(
    () => window.location.hash === "#admin",
  );

  useEffect(() => {
    const handler = () => setIsAdminRoute(window.location.hash === "#admin");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Admin route rendering
  if (isAdminRoute) {
    return (
      <div style={{ position: "relative", minHeight: "100dvh" }}>
        <AppBackground username={undefined} />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 0px)",
          }}
        >
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

  // Show loading while restoring session
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 5rem)",
          position: "relative",
          background: "transparent",
        }}
      >
        <AppBackground username={undefined} />
        <div
          className="flex flex-col items-center gap-3"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login page
  if (!user) {
    return (
      <div style={{ position: "relative", minHeight: "100dvh" }}>
        <AppBackground username={undefined} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Toaster position="top-center" richColors />
          <div
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 5rem)" }}
          >
            <LoginPage
              loginWithPassword={loginWithPassword}
              signUp={signUp}
              getSecurityQuestion={getSecurityQuestion}
              resetPassword={resetPassword}
              onLoginSuccess={(authUser: AuthUser) => {
                // user state is set inside the hook — App re-renders automatically
                void authUser;
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <AuthenticatedApp userName={user.name} onLogout={logout} />;
}
