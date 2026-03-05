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
            "0 12px 32px -4px oklch(0.08 0.015 260 / 0.8), 0 0 0 1px oklch(0.72 0.22 195 / 0.35), 0 0 24px 4px oklch(0.72 0.22 195 / 0.2)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 240, damping: 22, mass: 0.85 }}
        className="w-full text-left rounded-2xl overflow-hidden card-shine noise-overlay relative btn-auto-glow"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.04 255) 0%, oklch(0.14 0.06 240) 50%, oklch(0.11 0.05 258) 100%)",
          boxShadow:
            "0 4px 8px -2px oklch(0.08 0.015 260 / 0.8), 0 12px 28px -8px oklch(0.08 0.015 260 / 0.6), 0 0 0 1px oklch(0.22 0.03 260 / 0.8)",
        }}
      >
        {/* Neon cyan top accent bar — shimmer sweep on hover */}
        <div
          className="h-1 w-full relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.55 0.22 195), oklch(0.72 0.22 195), oklch(0.65 0.28 300))",
          }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.5) 50%, transparent 100%)",
            }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "oklch(0.72 0.22 195 / 0.15)" }}
              >
                <GraduationCap
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.72 0.22 195)" }}
                />
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "oklch(0.72 0.22 195)" }}
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
              style={{ borderColor: "oklch(0.72 0.22 195 / 0.3)" }}
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
                  style={{ background: "oklch(0.72 0.22 195 / 0.08)" }}
                >
                  <span
                    className="text-xl font-bold"
                    style={{ color: "oklch(0.72 0.22 195 / 0.7)" }}
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
                style={{ color: "oklch(0.65 0.02 250)" }}
              >
                {c.collegeName}
              </p>
              <p
                className="text-xs mt-0.5 truncate font-medium"
                style={{ color: "oklch(0.72 0.22 195 / 0.8)" }}
              >
                {c.course} · {c.branch}
              </p>
              <p
                className="text-xs mt-1.5 font-mono"
                style={{ color: "oklch(0.55 0.02 250)" }}
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
          "0 12px 32px -4px oklch(0.08 0.015 260 / 0.8), 0 0 0 1px oklch(0.65 0.28 300 / 0.35), 0 0 24px 4px oklch(0.65 0.28 300 / 0.2)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 240, damping: 22, mass: 0.85 }}
      className="w-full text-left rounded-2xl overflow-hidden card-shine noise-overlay relative btn-auto-glow-delay-1"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.10 0.04 285) 0%, oklch(0.14 0.05 300) 50%, oklch(0.10 0.04 280) 100%)",
        boxShadow:
          "0 4px 8px -2px oklch(0.08 0.015 260 / 0.8), 0 12px 28px -8px oklch(0.08 0.015 260 / 0.6), 0 0 0 1px oklch(0.22 0.03 260 / 0.8)",
      }}
    >
      {/* Neon violet top accent bar — shimmer sweep on hover */}
      <div
        className="h-1 w-full relative overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.5 0.25 300), oklch(0.65 0.28 300), oklch(0.72 0.22 195))",
        }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.5) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "oklch(0.65 0.28 300 / 0.15)" }}
            >
              <CreditCard
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.65 0.28 300)" }}
              />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest truncate max-w-[120px]"
              style={{ color: "oklch(0.65 0.28 300)" }}
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
            style={{ borderColor: "oklch(0.65 0.28 300 / 0.3)" }}
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
                style={{ background: "oklch(0.65 0.28 300 / 0.08)" }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.65 0.28 300 / 0.7)" }}
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
              style={{ color: "oklch(0.65 0.02 250)" }}
            >
              Issued by {o.issuedBy}
            </p>
            <p
              className="text-xs mt-0.5 font-mono"
              style={{ color: "oklch(0.65 0.28 300 / 0.8)" }}
            >
              #{o.idNumber}
            </p>
            <p
              className="text-xs mt-1.5"
              style={{ color: "oklch(0.55 0.02 250)" }}
            >
              Expires: {o.expiryDate}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
