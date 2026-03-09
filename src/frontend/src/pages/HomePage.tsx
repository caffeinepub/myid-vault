import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Plus, Search, Settings, User, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AppPage } from "../App";
import IDCardThumbnail from "../components/IDCardThumbnail";
import type { LocalIDCard } from "../hooks/useLocalIDStore";
import { useGetAllCards } from "../hooks/useQueries";

interface HomePageProps {
  navigate: (page: AppPage) => void;
  userName: string;
  onLogout: () => void;
}

export default function HomePage({
  navigate,
  userName,
  onLogout,
}: HomePageProps) {
  const { data: cards, isLoading } = useGetAllCards();
  const [search, setSearch] = useState("");

  const filteredCards = (cards ?? []).filter((card) => {
    const q = search.toLowerCase();
    if (card.cardType.__kind__ === "collegeStudent") {
      const c = card.cardType.collegeStudent;
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.collegeName.toLowerCase().includes(q) ||
        c.course.toLowerCase().includes(q)
      );
    }
    const o = card.cardType.other;
    return (
      o.fullName.toLowerCase().includes(q) || o.idType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border rgb-glow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo — animated slide-down on mount */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center rgb-glow-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.12 0.06 220), oklch(0.55 0.2 195 / 0.8))",
                boxShadow: "0 0 12px 2px oklch(0.72 0.22 195 / 0.3)",
              }}
            >
              <Wallet
                className="w-5 h-5"
                style={{ color: "oklch(0.97 0.005 240)" }}
              />
            </div>
            <h1 className="text-3d-sm text-sm leading-none">MyID Vault</h1>
          </motion.div>

          {/* Right side: user info + actions */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center gap-2 min-w-0"
          >
            {/* User name chip */}
            {userName && (
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "oklch(0.72 0.22 195 / 0.1)",
                  color: "oklch(0.72 0.22 195)",
                  border: "1px solid oklch(0.72 0.22 195 / 0.2)",
                }}
              >
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[100px]">{userName}</span>
              </div>
            )}

            <Button
              onClick={() => navigate({ type: "add" })}
              size="sm"
              data-ocid="home.add_id.primary_button"
              className="gap-1.5 font-semibold text-sm flex-shrink-0 btn-auto-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                color: "oklch(0.97 0.005 240)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add ID</span>
              <span className="xs:hidden">Add</span>
            </Button>

            {/* Settings button */}
            <button
              type="button"
              onClick={() => navigate({ type: "settings" })}
              title="Settings"
              data-ocid="home.settings.button"
              className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 btn-auto-glow-delay-1"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              data-ocid="home.logout.button"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors flex-shrink-0 btn-auto-glow-delay-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Mobile: show user name below on small screens */}
        {userName && (
          <div className="sm:hidden px-4 pb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate">{userName}</span>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Search — spring entrance */}
        {(cards ?? []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 22,
              mass: 0.85,
              delay: 0.12,
            }}
            className="relative mb-6"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, type, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </motion.div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-44 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (cards ?? []).length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
            data-ocid="home.cards.empty_state"
          >
            {/* Floating vault icon */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="mb-6"
            >
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center rgb-glow"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.22 195 / 0.08), oklch(0.65 0.28 300 / 0.06))",
                  border: "1.5px dashed oklch(0.72 0.22 195 / 0.4)",
                }}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Wallet className="w-10 h-10 text-primary/60" />
                </motion.div>
              </div>
            </motion.div>
            <h2 className="text-3d-violet text-2xl mb-2">
              Your vault is empty
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mb-8">
              Add your student ID, college ID, and other important documents to
              access them anytime, offline.
            </p>
            <Button
              onClick={() => navigate({ type: "add" })}
              size="lg"
              data-ocid="home.add_first_id.primary_button"
              className="gap-2 font-semibold px-8 btn-auto-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.15 0.08 220), oklch(0.55 0.2 195))",
                color: "oklch(0.97 0.005 240)",
              }}
            >
              <Plus className="w-5 h-5" />
              Add Your First ID
            </Button>
          </motion.div>
        )}

        {/* Cards grid — bounce spring stagger */}
        {!isLoading && filteredCards.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <AnimatePresence>
              {filteredCards.map((card: LocalIDCard) => (
                <motion.div
                  key={card.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.93 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 22,
                    mass: 0.85,
                  }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  layout
                >
                  <IDCardThumbnail
                    card={card}
                    onClick={() => navigate({ type: "view", cardId: card.id })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No search results */}
        {!isLoading &&
          (cards ?? []).length > 0 &&
          filteredCards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                No IDs match &ldquo;{search}&rdquo;
              </p>
            </motion.div>
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
    </div>
  );
}
