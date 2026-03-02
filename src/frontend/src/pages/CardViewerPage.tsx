import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Edit2,
  GitBranch,
  GraduationCap,
  Hash,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { useDeleteCard, useGetCard } from "../hooks/useQueries";

interface CardViewerPageProps {
  cardId: string;
  navigate: (page: AppPage) => void;
}

export default function CardViewerPage({
  cardId,
  navigate,
}: CardViewerPageProps) {
  const { data: card, isLoading } = useGetCard(cardId);
  const deleteCard = useDeleteCard();

  const handleDelete = async () => {
    try {
      await deleteCard.mutateAsync(cardId);
      toast.success("ID card deleted");
      navigate({ type: "home" });
    } catch {
      toast.error("Failed to delete card");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate({ type: "home" })}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">ID Details</h1>
          <div className="flex items-center gap-2">
            {card && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => navigate({ type: "edit", cardId })}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this ID card?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The ID card will be
                        permanently removed from your vault.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteCard.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {isLoading && <CardViewerSkeleton />}

        {card && card.cardType.__kind__ === "collegeStudent" && (
          <CollegeIDViewer data={card.cardType.collegeStudent} />
        )}

        {card && card.cardType.__kind__ === "other" && (
          <OtherIDViewer data={card.cardType.other} />
        )}
      </main>
    </div>
  );
}

function CollegeIDViewer({
  data,
}: {
  data: {
    fullName: string;
    enrollmentNo: string;
    dateOfBirth: string;
    collegeName: string;
    course: string;
    branch: string;
    academicYear: string;
    validUntil: string;
    photo: { getDirectURL: () => string };
  };
}) {
  const photoUrl = data.photo.getDirectURL();

  const detailFields = [
    {
      icon: <Hash className="w-3.5 h-3.5" />,
      label: "Enrollment No.",
      value: data.enrollmentNo,
    },
    {
      icon: <Calendar className="w-3.5 h-3.5" />,
      label: "Date of Birth",
      value: data.dateOfBirth,
    },
    {
      icon: <BookOpen className="w-3.5 h-3.5" />,
      label: "Course",
      value: data.course,
    },
    {
      icon: <GitBranch className="w-3.5 h-3.5" />,
      label: "Branch",
      value: data.branch,
    },
    {
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      label: "Academic Year",
      value: data.academicYear,
    },
    {
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      label: "Valid Until",
      value: data.validUntil,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 8, scale: 0.96 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: "1000px" }}
    >
      {/* Physical-style ID card */}
      <motion.div
        whileHover={{ scale: 1.01, y: -3 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="rounded-3xl overflow-hidden card-shine noise-overlay relative mx-auto"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.15 0.055 258) 0%, oklch(0.22 0.07 255) 45%, oklch(0.17 0.06 265) 100%)",
          boxShadow:
            "0 8px 20px -4px oklch(0.18 0.025 250 / 0.2), 0 24px 60px -12px oklch(0.18 0.025 250 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1)",
          maxWidth: "420px",
        }}
      >
        {/* Amber top stripe — continuous shimmer */}
        <div
          className="h-1.5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.72 0.14 65), oklch(0.85 0.18 75), oklch(0.78 0.16 68))",
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              repeatDelay: 1.5,
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.5) 50%, transparent 100%)",
              width: "60%",
            }}
          />
        </div>

        {/* College header */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="px-6 pt-5 pb-4 flex items-center gap-3 border-b"
          style={{ borderColor: "oklch(1 0 0 / 0.1)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.78 0.14 65 / 0.2)" }}
          >
            <GraduationCap
              className="w-5 h-5"
              style={{ color: "oklch(0.85 0.18 75)" }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="font-bold text-sm leading-tight truncate"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {data.collegeName}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.78 0.14 65)" }}
            >
              Student Identity Card
            </p>
          </div>
        </motion.div>

        {/* Photo + Name section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="px-6 py-5 flex items-start gap-5"
        >
          <div
            className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border-2"
            style={{ borderColor: "oklch(0.78 0.14 65 / 0.5)" }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={data.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "oklch(1 0 0 / 0.08)" }}
              >
                <User
                  className="w-10 h-10"
                  style={{ color: "oklch(1 0 0 / 0.3)" }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p
              className="font-display font-bold text-xl leading-tight"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {data.fullName}
            </p>
            <p
              className="text-sm font-medium mt-1"
              style={{ color: "oklch(0.78 0.14 65)" }}
            >
              {data.course}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.7 0.02 250)" }}
            >
              {data.branch}
            </p>
            <div
              className="mt-3 px-2.5 py-1 rounded-lg inline-block"
              style={{ background: "oklch(0.78 0.14 65 / 0.15)" }}
            >
              <p
                className="text-xs font-mono font-semibold"
                style={{ color: "oklch(0.85 0.18 75)" }}
              >
                {data.enrollmentNo}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Details grid — staggered */}
        <div
          className="px-6 pb-6 grid grid-cols-2 gap-3"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {detailFields.map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
            >
              <DetailField
                icon={field.icon}
                label={field.label}
                value={field.value}
                dark
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom decorative strip */}
        <div className="h-1" style={{ background: "oklch(1 0 0 / 0.06)" }} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        Show this card as your official college student ID
      </motion.p>
    </motion.div>
  );
}

function OtherIDViewer({
  data,
}: {
  data: {
    fullName: string;
    idType: string;
    idNumber: string;
    dateOfBirth: string;
    issueDate: string;
    expiryDate: string;
    issuedBy: string;
    photo: { getDirectURL: () => string };
  };
}) {
  const photoUrl = data.photo.getDirectURL();

  const detailFields = [
    {
      icon: <Hash className="w-3.5 h-3.5" />,
      label: "ID Number",
      value: data.idNumber,
      span: false,
    },
    {
      icon: <Calendar className="w-3.5 h-3.5" />,
      label: "Date of Birth",
      value: data.dateOfBirth,
      span: false,
    },
    {
      icon: <Building2 className="w-3.5 h-3.5" />,
      label: "Issued By",
      value: data.issuedBy,
      span: false,
    },
    {
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      label: "Issue Date",
      value: data.issueDate,
      span: false,
    },
    {
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      label: "Expiry Date",
      value: data.expiryDate,
      span: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 8, scale: 0.96 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        whileHover={{ scale: 1.01, y: -3 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="rounded-3xl overflow-hidden card-shine noise-overlay relative mx-auto"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.22 0.08 50) 0%, oklch(0.3 0.09 55) 45%, oklch(0.22 0.07 45) 100%)",
          boxShadow:
            "0 8px 20px -4px oklch(0.2 0.04 50 / 0.25), 0 24px 60px -12px oklch(0.2 0.04 50 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.1)",
          maxWidth: "420px",
        }}
      >
        {/* Amber top stripe — continuous shimmer */}
        <div
          className="h-1.5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.65 0.14 65), oklch(0.78 0.18 70), oklch(0.72 0.16 66))",
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              repeatDelay: 1.5,
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.5) 50%, transparent 100%)",
              width: "60%",
            }}
          />
        </div>

        {/* ID type header */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="px-6 pt-5 pb-4 flex items-center gap-3 border-b"
          style={{ borderColor: "oklch(1 0 0 / 0.1)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.72 0.14 65 / 0.2)" }}
          >
            <CreditCard
              className="w-5 h-5"
              style={{ color: "oklch(0.82 0.18 70)" }}
            />
          </div>
          <div>
            <p
              className="font-bold text-sm"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {data.idType}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.72 0.14 65)" }}
            >
              Issued by {data.issuedBy}
            </p>
          </div>
        </motion.div>

        {/* Photo + Name section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="px-6 py-5 flex items-start gap-5"
        >
          <div
            className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border-2"
            style={{ borderColor: "oklch(0.72 0.14 65 / 0.5)" }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={data.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "oklch(1 0 0 / 0.08)" }}
              >
                <User
                  className="w-10 h-10"
                  style={{ color: "oklch(1 0 0 / 0.3)" }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p
              className="font-display font-bold text-xl leading-tight"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {data.fullName}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.7 0.02 250)" }}
            >
              {data.idType}
            </p>
            <div
              className="mt-3 px-2.5 py-1 rounded-lg inline-block"
              style={{ background: "oklch(0.72 0.14 65 / 0.15)" }}
            >
              <p
                className="text-xs font-mono font-semibold"
                style={{ color: "oklch(0.82 0.18 70)" }}
              >
                {data.idNumber}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Details grid — staggered */}
        <div
          className="px-6 pb-6 grid grid-cols-2 gap-3"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {detailFields.map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
              className={field.span ? "col-span-2" : ""}
            >
              <DetailField
                icon={field.icon}
                label={field.label}
                value={field.value}
                dark
              />
            </motion.div>
          ))}
        </div>

        <div className="h-1" style={{ background: "oklch(1 0 0 / 0.06)" }} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        Present this card as a valid identification document
      </motion.p>
    </motion.div>
  );
}

function DetailField({
  icon,
  label,
  value,
  dark = false,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`pt-3 ${className}`}>
      <div
        className="flex items-center gap-1.5 mb-1"
        style={{ color: dark ? "oklch(0.6 0.02 250)" : undefined }}
      >
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">
          {label}
        </span>
      </div>
      <p
        className="text-sm font-semibold"
        style={{ color: dark ? "oklch(0.95 0.005 240)" : undefined }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function CardViewerSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden max-w-[420px] mx-auto">
      <Skeleton className="h-1.5 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-5">
          <Skeleton className="w-24 h-28 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-28 mt-3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-1.5" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
