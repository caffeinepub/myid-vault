import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Car,
  CreditCard,
  Edit2,
  Fingerprint,
  GraduationCap,
  Loader2,
  School,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import type { IDCard } from "../backend";
import { useDeleteCard, useGetCard } from "../hooks/useQueries";

function getCardDetails(card: IDCard) {
  if (card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    const isSchool = c.collegeName.toLowerCase().includes("school");
    return {
      title: isSchool ? "School ID" : "College ID",
      icon: isSchool ? <School size={22} /> : <GraduationCap size={22} />,
      photoUrl: c.photo.getDirectURL(),
      fields: [
        { label: "Full Name", value: c.fullName },
        {
          label: isSchool ? "School Name" : "College Name",
          value: c.collegeName,
        },
        {
          label: isSchool ? "Roll No." : "Enrollment No.",
          value: c.enrollmentNo,
        },
        {
          label: isSchool ? "Class" : "Course",
          value: c.course,
        },
        {
          label: isSchool ? "Section" : "Branch / Dept.",
          value: c.branch,
        },
        {
          label: isSchool ? "Roll No." : "Academic Year",
          value: c.academicYear,
        },
        { label: "Date of Birth", value: c.dateOfBirth },
        { label: "Valid Until", value: c.validUntil },
      ].filter((f) => f.value),
    };
  }

  const o = card.cardType.other;
  const icons: Record<string, React.ReactNode> = {
    Aadhaar: <Fingerprint size={22} />,
    PAN: <CreditCard size={22} />,
    Passport: <BookOpen size={22} />,
    "Driving Licence": <Car size={22} />,
    "Voter ID": <BadgeCheck size={22} />,
  };

  const fieldLabels: Record<
    string,
    { idNumber: string; issueDate?: string; issuedBy?: string }
  > = {
    Aadhaar: {
      idNumber: "Aadhaar No.",
      issueDate: "Gender",
      issuedBy: "Address",
    },
    PAN: { idNumber: "PAN No.", issuedBy: "Father's Name" },
    Passport: {
      idNumber: "Passport No.",
      issueDate: "Nationality",
      issuedBy: "Place of Issue",
    },
    "Driving Licence": {
      idNumber: "Licence No.",
      issueDate: "Vehicle Class",
      issuedBy: "Address",
    },
    "Voter ID": {
      idNumber: "Voter ID No.",
      issueDate: "Part No.",
      issuedBy: "Address",
    },
  };
  const labels = fieldLabels[o.idType] || { idNumber: "ID Number" };

  return {
    title: o.idType,
    icon: icons[o.idType] || <CreditCard size={22} />,
    photoUrl: o.photo.getDirectURL(),
    fields: [
      { label: "Full Name", value: o.fullName },
      { label: labels.idNumber, value: o.idNumber },
      { label: "Date of Birth", value: o.dateOfBirth },
      labels.issuedBy && o.issuedBy
        ? { label: labels.issuedBy, value: o.issuedBy }
        : null,
      labels.issueDate && o.issueDate
        ? { label: labels.issueDate, value: o.issueDate }
        : null,
      o.expiryDate ? { label: "Expiry Date", value: o.expiryDate } : null,
    ].filter(Boolean) as { label: string; value: string }[],
  };
}

export default function CardViewerPage({
  cardId,
  navigate,
}: {
  cardId: string;
  navigate: (p: AppPage) => void;
}) {
  const { data: card, isLoading } = useGetCard(cardId);
  const deleteCard = useDeleteCard();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteCard.mutateAsync(cardId);
      toast.success("ID deleted");
      navigate({ type: "home" });
    } catch {
      toast.error("Failed to delete");
    }
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          size={32}
          style={{ color: "#00ffff", animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  if (!card) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <p
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: "rgba(255,100,100,0.7)",
          }}
        >
          Card not found.
        </p>
        <button
          type="button"
          data-ocid="viewer.close_button"
          onClick={() => navigate({ type: "home" })}
          className="neon-btn"
          style={{
            background: "transparent",
            border: "1px solid rgba(0,255,255,0.3)",
            borderRadius: "8px",
            padding: "0.5rem 1.5rem",
            color: "#00ffff",
            cursor: "pointer",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.82rem",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const details = getCardDetails(card);
  const hasPhoto =
    details.photoUrl &&
    !details.photoUrl.includes("iVBORw0KGgo") &&
    !details.photoUrl.includes("data:image/png;base64,iVBOR");

  return (
    <div
      style={{
        minHeight: "100dvh",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem 1rem",
        }}
      >
        <button
          type="button"
          data-ocid="viewer.close_button"
          onClick={() => navigate({ type: "home" })}
          className="neon-btn"
          style={{
            background: "transparent",
            border: "1px solid rgba(0,255,255,0.2)",
            borderRadius: "8px",
            padding: "0.45rem",
            color: "rgba(0,255,255,0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "rgba(0,255,255,0.8)",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ color: "rgba(0,255,255,0.6)" }}>{details.icon}</span>
          {details.title}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            data-ocid="viewer.edit_button"
            onClick={() => navigate({ type: "edit", cardId })}
            className="neon-btn"
            style={{
              background: "transparent",
              border: "1px solid rgba(0,255,255,0.25)",
              borderRadius: "8px",
              padding: "0.45rem",
              color: "rgba(0,255,255,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Edit2 size={18} />
          </button>
          <button
            type="button"
            data-ocid="viewer.delete_button"
            onClick={() => setShowDeleteConfirm(true)}
            className="neon-btn"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,60,60,0.3)",
              borderRadius: "8px",
              padding: "0.45rem",
              color: "rgba(255,80,80,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Card body */}
      <div style={{ padding: "0 1.25rem" }}>
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            animation: "slideUpFade 0.3s ease-out both",
          }}
        >
          {/* Photo */}
          {hasPhoto && (
            <div style={{ marginBottom: "1.25rem", textAlign: "center" }}>
              <img
                src={details.photoUrl}
                alt="Document"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,255,255,0.2)",
                }}
              />
            </div>
          )}

          {/* Fields */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}
          >
            {details.fields.map((field) => (
              <div
                key={field.label}
                style={{
                  borderBottom: "1px solid rgba(0,255,255,0.08)",
                  paddingBottom: "0.7rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.65rem",
                    color: "rgba(0,255,255,0.5)",
                    letterSpacing: "0.1em",
                    marginBottom: "0.2rem",
                  }}
                >
                  {field.label.toUpperCase()}
                </p>
                <p
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.92rem",
                    color: "rgba(255,255,255,0.88)",
                    fontWeight: 500,
                  }}
                >
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            data-ocid="viewer.dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1.25rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: "100%", maxWidth: "340px", padding: "1.75rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "1rem",
                    color: "rgba(255,80,80,0.9)",
                    margin: 0,
                  }}
                >
                  Delete ID?
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <p
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "1.5rem",
                }}
              >
                This action cannot be undone. The ID card will be permanently
                removed from your vault.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  data-ocid="viewer.cancel_button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="neon-btn"
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,255,255,0.25)",
                    background: "transparent",
                    color: "rgba(0,255,255,0.7)",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-ocid="viewer.confirm_button"
                  onClick={handleDelete}
                  disabled={deleteCard.isPending}
                  className="neon-btn"
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,60,60,0.5)",
                    background: "rgba(255,40,40,0.12)",
                    color: "rgba(255,80,80,0.9)",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  {deleteCard.isPending ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
