import { CreditCard, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import type { LocalIDCard } from "../hooks/useLocalIDStore";

interface IDCardThumbnailProps {
  card: LocalIDCard;
  onClick: () => void;
}

export default function IDCardThumbnail({
  card,
  onClick,
}: IDCardThumbnailProps) {
  const isCollege = card.cardType.__kind__ === "collegeStudent";

  if (isCollege && card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    const photoUrl = c.photo;

    return (
      <motion.button
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          y: -5,
          scale: 1.03,
          boxShadow:
            "0 12px 32px -4px oklch(0.22 0.06 255 / 0.45), 0 4px 12px -2px oklch(0.22 0.06 255 / 0.25)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="w-full text-left rounded-2xl overflow-hidden card-shine noise-overlay relative rgb-glow"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.05 255) 0%, oklch(0.22 0.07 255) 50%, oklch(0.18 0.06 265) 100%)",
          boxShadow:
            "0 4px 6px -1px oklch(0.18 0.025 250 / 0.15), 0 12px 28px -8px oklch(0.18 0.025 250 / 0.25)",
        }}
      >
        {/* Top accent bar — shimmer sweep on hover */}
        <div
          className="h-1 w-full relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.78 0.14 65), oklch(0.85 0.18 75))",
          }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.4) 50%, transparent 100%)",
            }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "oklch(0.78 0.14 65 / 0.2)" }}
              >
                <GraduationCap
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.85 0.18 75)" }}
                />
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "oklch(0.78 0.14 65)" }}
              >
                College ID
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3">
            {/* Photo */}
            <div
              className="w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 border"
              style={{ borderColor: "oklch(1 0 0 / 0.15)" }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={c.fullName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "oklch(1 0 0 / 0.1)" }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: "oklch(1 0 0 / 0.6)" }}
                  >
                    {c.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-base leading-tight truncate"
                style={{ color: "oklch(0.97 0.005 240)" }}
              >
                {c.fullName}
              </p>
              <p
                className="text-xs mt-1 truncate"
                style={{ color: "oklch(0.75 0.02 240)" }}
              >
                {c.collegeName}
              </p>
              <p
                className="text-xs mt-0.5 truncate font-medium"
                style={{ color: "oklch(0.78 0.14 65)" }}
              >
                {c.course} · {c.branch}
              </p>
              <p
                className="text-xs mt-1.5 font-mono"
                style={{ color: "oklch(0.65 0.02 240)" }}
              >
                #{c.enrollmentNo}
              </p>
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  // Other ID
  if (card.cardType.__kind__ !== "other") return null;
  const o = card.cardType.other;
  const photoUrl = o.photo;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        y: -5,
        scale: 1.03,
        boxShadow:
          "0 12px 32px -4px oklch(0.22 0.07 50 / 0.45), 0 4px 12px -2px oklch(0.22 0.07 50 / 0.28)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="w-full text-left rounded-2xl overflow-hidden card-shine noise-overlay relative rgb-glow"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.25 0.08 50) 0%, oklch(0.3 0.09 55) 50%, oklch(0.22 0.07 45) 100%)",
        boxShadow:
          "0 4px 6px -1px oklch(0.2 0.04 50 / 0.2), 0 12px 28px -8px oklch(0.2 0.04 50 / 0.3)",
      }}
    >
      {/* Top accent bar — shimmer sweep on hover */}
      <div
        className="h-1 w-full relative overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.72 0.14 65), oklch(0.82 0.18 70))",
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.4) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "oklch(0.72 0.14 65 / 0.2)" }}
            >
              <CreditCard
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.82 0.18 70)" }}
              />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest truncate max-w-[120px]"
              style={{ color: "oklch(0.82 0.18 70)" }}
            >
              {o.idType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3">
          {/* Photo */}
          <div
            className="w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 border"
            style={{ borderColor: "oklch(1 0 0 / 0.15)" }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={o.fullName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "oklch(1 0 0 / 0.1)" }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: "oklch(1 0 0 / 0.6)" }}
                >
                  {o.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-base leading-tight truncate"
              style={{ color: "oklch(0.97 0.005 240)" }}
            >
              {o.fullName}
            </p>
            <p
              className="text-xs mt-1 truncate"
              style={{ color: "oklch(0.75 0.02 240)" }}
            >
              Issued by {o.issuedBy}
            </p>
            <p
              className="text-xs mt-0.5 font-mono"
              style={{ color: "oklch(0.82 0.18 70)" }}
            >
              #{o.idNumber}
            </p>
            <p
              className="text-xs mt-1.5"
              style={{ color: "oklch(0.65 0.02 240)" }}
            >
              Expires: {o.expiryDate}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
