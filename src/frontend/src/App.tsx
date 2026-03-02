import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "./hooks/useQueries";
import AddCardPage from "./pages/AddCardPage";
import CardViewerPage from "./pages/CardViewerPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

export type AppPage =
  | { type: "home" }
  | { type: "view"; cardId: string }
  | { type: "add" }
  | { type: "edit"; cardId: string };

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
        stiffness: 320,
        damping: 28,
        opacity: { duration: 0.22 },
      }}
    >
      {children}
    </motion.div>
  );
}

function AuthenticatedApp() {
  const [page, setPage] = useState<AppPage>({ type: "home" });
  const navigate = (p: AppPage) => setPage(p);

  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const saveProfile = useSaveCallerUserProfile();

  const handleLogout = async () => {
    clear();
    queryClient.clear();
    setPage({ type: "home" });
  };

  const handleSaveProfile = async (name: string) => {
    await saveProfile.mutateAsync({ name });
  };

  // Show full-screen loader while determining auth/profile state
  if (isInitializing || (!!identity && profileLoading && !isFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  // Show profile setup on first login
  const showProfileSetup =
    !!identity && !profileLoading && isFetched && userProfile === null;

  const userName = userProfile?.name ?? "";

  // Derive page key for transitions
  const pageKey =
    page.type === "view"
      ? `view-${page.cardId}`
      : page.type === "edit"
        ? `edit-${page.cardId}`
        : page.type;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      {showProfileSetup && <ProfileSetupModal onSave={handleSaveProfile} />}

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
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  // Show loading while restoring session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login page
  if (!identity) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <LoginPage />
      </>
    );
  }

  return <AuthenticatedApp />;
}
