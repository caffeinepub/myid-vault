import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface ProfileSetupModalProps {
  onSave: (name: string) => Promise<void>;
}

export default function ProfileSetupModal({ onSave }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <div
            className="rounded-3xl bg-card border border-border p-8"
            style={{
              boxShadow:
                "0 8px 32px oklch(0.18 0.025 250 / 0.15), 0 2px 8px oklch(0.18 0.025 250 / 0.08)",
            }}
          >
            {/* Avatar illustration */}
            <div className="flex justify-center mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.22 0.055 255 / 0.1), oklch(0.32 0.08 260 / 0.06))",
                  border: "1.5px dashed oklch(0.22 0.055 255 / 0.25)",
                }}
              >
                <User className="w-7 h-7 text-primary/70" />
              </div>
            </div>

            <h2 className="text-xl font-display font-bold text-foreground text-center mb-1">
              Welcome to MyID Vault
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              What should we call you? This name will appear in your vault
              header.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">
                  Your Name
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Arjun Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="bg-background border-border focus-visible:ring-primary/30"
                  maxLength={60}
                />
              </div>

              <Button
                type="submit"
                disabled={!name.trim() || isSaving}
                className="w-full h-11 font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.38 0.1 265))",
                  color: "oklch(0.97 0.005 240)",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Let's Go
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
