import { ArrowLeft, Camera, ChevronDown, Loader2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { ExternalBlob } from "../backend";
import {
  useCreateCollegeID,
  useCreateOtherID,
  useGetCard,
  useUpdateCard,
} from "../hooks/useQueries";
import {
  deleteGuestCard,
  getGuestCard,
  saveGuestCard,
} from "../lib/guestStorage";

type IDCategory =
  | "aadhaar"
  | "pan"
  | "passport"
  | "driving"
  | "voter"
  | "college"
  | "school";

interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "date" | "select";
  options?: string[];
  required?: boolean;
}

const CATEGORY_LABELS: Record<IDCategory, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  passport: "Passport",
  driving: "Driving Licence",
  voter: "Voter ID",
  college: "College ID",
  school: "School ID",
};

const CATEGORY_FIELDS: Record<IDCategory, FieldConfig[]> = {
  aadhaar: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "aadharNo", label: "Aadhaar No.", required: true },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "address", label: "Address" },
  ],
  pan: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "panNo", label: "PAN No.", required: true },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "fathersName", label: "Father's Name" },
  ],
  passport: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "passportNo", label: "Passport No.", required: true },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "nationality", label: "Nationality" },
    { name: "placeOfIssue", label: "Place of Issue" },
    { name: "expiryDate", label: "Expiry Date", type: "date" },
  ],
  driving: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "licenceNo", label: "Licence No.", required: true },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "vehicleClass", label: "Vehicle Class" },
    { name: "address", label: "Address" },
    { name: "validUntil", label: "Valid Until", type: "date" },
  ],
  voter: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "voterIdNo", label: "Voter ID No.", required: true },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "partNo", label: "Part No." },
    { name: "address", label: "Address" },
  ],
  college: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "studentId", label: "Student ID", required: true },
    { name: "collegeName", label: "College Name", required: true },
    { name: "course", label: "Course" },
    { name: "department", label: "Department / Branch" },
    { name: "year", label: "Academic Year" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "validUntil", label: "Valid Until", type: "date" },
  ],
  school: [
    { name: "fullName", label: "Full Name", required: true },
    { name: "studentId", label: "Roll No. / Student ID", required: true },
    { name: "schoolName", label: "School Name", required: true },
    { name: "className", label: "Class" },
    { name: "section", label: "Section" },
    { name: "rollNo", label: "Roll No." },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "validUntil", label: "Valid Until", type: "date" },
  ],
};

const EMPTY_PHOTO_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export default function AddCardPage({
  navigate,
  editCardId,
  isGuest,
}: {
  navigate: (p: AppPage) => void;
  editCardId?: string;
  isGuest?: boolean;
}) {
  const isEditing = !!editCardId;

  // Backend card data (only when not in guest mode)
  const { data: backendEditCard, isLoading: backendCardLoading } = useGetCard(
    !isGuest && editCardId ? editCardId : "",
  );

  const [category, setCategory] = useState<IDCategory>("aadhaar");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoBlob, setPhotoBlob] = useState<ExternalBlob | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isSavingGuest, setIsSavingGuest] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const createCollege = useCreateCollegeID();
  const createOther = useCreateOtherID();
  const updateCard = useUpdateCard();

  const isSaving = isGuest
    ? isSavingGuest
    : createCollege.isPending || createOther.isPending || updateCard.isPending;

  // Determine which card to edit
  const editCard = isGuest
    ? editCardId
      ? getGuestCard(editCardId)
      : null
    : backendEditCard;
  const cardLoading = !isGuest && backendCardLoading;

  // Populate form when editing
  useEffect(() => {
    if (!editCard) return;
    if (editCard.cardType.__kind__ === "collegeStudent") {
      const c = editCard.cardType.collegeStudent;
      const isSchool = c.collegeName.toLowerCase().includes("school");
      setCategory(isSchool ? "school" : "college");
      setFields({
        fullName: c.fullName,
        studentId: c.enrollmentNo,
        collegeName: c.collegeName,
        schoolName: c.collegeName,
        course: c.course,
        className: c.course,
        department: c.branch,
        section: c.branch,
        year: c.academicYear,
        rollNo: c.academicYear,
        dateOfBirth: c.dateOfBirth,
        validUntil: c.validUntil,
      });
      setPhotoBlob(c.photo);
      setPhotoPreview(c.photo.getDirectURL());
    } else {
      const o = editCard.cardType.other;
      const catMap: Record<string, IDCategory> = {
        Aadhaar: "aadhaar",
        PAN: "pan",
        Passport: "passport",
        "Driving Licence": "driving",
        "Voter ID": "voter",
      };
      setCategory(catMap[o.idType] || "aadhaar");
      setFields({
        fullName: o.fullName,
        aadharNo: o.idNumber,
        panNo: o.idNumber,
        passportNo: o.idNumber,
        licenceNo: o.idNumber,
        voterIdNo: o.idNumber,
        dateOfBirth: o.dateOfBirth,
        gender: o.issueDate,
        nationality: o.issueDate,
        vehicleClass: o.issueDate,
        partNo: o.issueDate,
        expiryDate: o.expiryDate,
        validUntil: o.expiryDate,
        address: o.issuedBy,
        fathersName: o.issuedBy,
        placeOfIssue: o.issuedBy,
      });
      setPhotoBlob(o.photo);
      setPhotoPreview(o.photo.getDirectURL());
    }
  }, [editCard]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    file.arrayBuffer().then((buf) => {
      setPhotoBlob(ExternalBlob.fromBytes(new Uint8Array(buf)));
    });
  };

  const updateField = (name: string, value: string) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const handleCategoryChange = (cat: IDCategory) => {
    setCategory(cat);
    setShowCategoryMenu(false);
    if (!isEditing) {
      setFields({});
      setPhotoPreview("");
      setPhotoBlob(null);
    }
  };

  const getPhoto = (): ExternalBlob =>
    photoBlob ?? ExternalBlob.fromURL(EMPTY_PHOTO_URL);

  const getIdNumber = () =>
    fields.aadharNo ||
    fields.panNo ||
    fields.passportNo ||
    fields.licenceNo ||
    fields.voterIdNo ||
    "";

  const handleSubmit = async () => {
    const f = fields;
    if (!f.fullName?.trim()) {
      toast.error("Full name is required");
      return;
    }

    try {
      const id = editCardId || crypto.randomUUID();
      const photo = getPhoto();

      if (isGuest) {
        // Save to localStorage
        setIsSavingGuest(true);
        const timestamp = BigInt(Date.now());
        if (category === "college" || category === "school") {
          saveGuestCard({
            id,
            timestamp,
            cardType: {
              __kind__: "collegeStudent",
              collegeStudent: {
                branch: f.department || f.section || "",
                enrollmentNo: f.studentId || "",
                dateOfBirth: f.dateOfBirth || "",
                collegeName: f.collegeName || f.schoolName || "",
                fullName: f.fullName || "",
                academicYear: f.year || f.rollNo || "",
                photo,
                course: f.course || f.className || "",
                validUntil: f.validUntil || "",
              },
            },
          });
        } else {
          const idTypeMap: Record<string, string> = {
            aadhaar: "Aadhaar",
            pan: "PAN",
            passport: "Passport",
            driving: "Driving Licence",
            voter: "Voter ID",
          };
          saveGuestCard({
            id,
            timestamp,
            cardType: {
              __kind__: "other",
              other: {
                fullName: f.fullName || "",
                idType: idTypeMap[category] || category,
                idNumber: getIdNumber(),
                dateOfBirth: f.dateOfBirth || "",
                issueDate:
                  f.gender || f.nationality || f.vehicleClass || f.partNo || "",
                expiryDate: f.expiryDate || f.validUntil || "",
                issuedBy: f.address || f.fathersName || f.placeOfIssue || "",
                photo,
              },
            },
          });
        }
        setIsSavingGuest(false);
        toast.success(isEditing ? "ID updated!" : "ID saved locally!");
        navigate({ type: "home" });
        return;
      }

      // Backend save
      if (category === "college" || category === "school") {
        const params = {
          id,
          photo,
          fullName: f.fullName || "",
          dateOfBirth: f.dateOfBirth || "",
          enrollmentNo: f.studentId || "",
          course: f.course || f.className || "",
          branch: f.department || f.section || "",
          collegeName: f.collegeName || f.schoolName || "",
          academicYear: f.year || f.rollNo || "",
          validUntil: f.validUntil || "",
        };
        if (isEditing && editCard) {
          await updateCard.mutateAsync({
            id,
            card: {
              id,
              timestamp: editCard.timestamp,
              cardType: {
                __kind__: "collegeStudent",
                collegeStudent: { ...params, photo },
              },
            },
          });
        } else {
          await createCollege.mutateAsync(params);
        }
      } else {
        const idTypeMap: Record<string, string> = {
          aadhaar: "Aadhaar",
          pan: "PAN",
          passport: "Passport",
          driving: "Driving Licence",
          voter: "Voter ID",
        };
        const params = {
          id,
          photo,
          fullName: f.fullName || "",
          idType: idTypeMap[category] || category,
          idNumber: getIdNumber(),
          dateOfBirth: f.dateOfBirth || "",
          issueDate:
            f.gender || f.nationality || f.vehicleClass || f.partNo || "",
          expiryDate: f.expiryDate || f.validUntil || "",
          issuedBy: f.address || f.fathersName || f.placeOfIssue || "",
        };
        if (isEditing && editCard) {
          await updateCard.mutateAsync({
            id,
            card: {
              id,
              timestamp: editCard.timestamp,
              cardType: { __kind__: "other", other: { ...params, photo } },
            },
          });
        } else {
          await createOther.mutateAsync(params);
        }
      }

      toast.success(isEditing ? "ID updated!" : "ID saved!");
      navigate({ type: "home" });
    } catch (err) {
      console.error(err);
      setIsSavingGuest(false);
      toast.error("Failed to save ID. Please try again.");
    }
  };

  const currentFields = CATEGORY_FIELDS[category];

  if (isEditing && cardLoading) {
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
          gap: "0.75rem",
          padding: "0 1.25rem 1rem",
        }}
      >
        <button
          type="button"
          data-ocid="addid.cancel_button"
          onClick={() => navigate({ type: "home" })}
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
          className="neon-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <h2
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1rem",
            color: isGuest ? "rgba(255,180,0,0.9)" : "rgba(0,255,255,0.9)",
            margin: 0,
          }}
        >
          {isEditing ? "Edit ID Card" : "Add New ID"}
          {isGuest && (
            <span
              style={{
                fontSize: "0.65rem",
                color: "rgba(255,180,0,0.6)",
                marginLeft: "0.5rem",
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              (Guest)
            </span>
          )}
        </h2>
      </header>

      <div style={{ padding: "0 1.25rem" }}>
        {/* Category selector */}
        <div style={{ marginBottom: "1.25rem", position: "relative" }}>
          <p
            style={{
              display: "block",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.7rem",
              color: isGuest ? "rgba(255,180,0,0.6)" : "rgba(0,255,255,0.6)",
              marginBottom: "0.4rem",
              letterSpacing: "0.08em",
            }}
          >
            ID CATEGORY
          </p>
          <button
            type="button"
            data-ocid="addid.select"
            onClick={() => setShowCategoryMenu((v) => !v)}
            style={{
              width: "100%",
              background: "rgba(0,255,255,0.05)",
              border: isGuest
                ? "1px solid rgba(255,180,0,0.3)"
                : "1px solid rgba(0,255,255,0.3)",
              borderRadius: "10px",
              padding: "0.7rem 1rem",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Exo 2', sans-serif",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{CATEGORY_LABELS[category]}</span>
            <ChevronDown
              size={16}
              style={{
                color: isGuest ? "rgba(255,180,0,0.5)" : "rgba(0,255,255,0.5)",
              }}
            />
          </button>
          <AnimatePresence>
            {showCategoryMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "rgba(6,8,20,0.97)",
                  border: "1px solid rgba(0,255,255,0.25)",
                  borderRadius: "10px",
                  marginTop: "4px",
                  zIndex: 50,
                  overflow: "hidden",
                  transformOrigin: "top",
                }}
              >
                {(
                  Object.entries(CATEGORY_LABELS) as [IDCategory, string][]
                ).map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    style={{
                      width: "100%",
                      background:
                        category === key
                          ? "rgba(0,255,255,0.12)"
                          : "transparent",
                      border: "none",
                      padding: "0.7rem 1rem",
                      color:
                        category === key ? "#00ffff" : "rgba(255,255,255,0.8)",
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(0,255,255,0.06)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Photo upload */}
        <div style={{ marginBottom: "1.25rem" }}>
          <p
            style={{
              display: "block",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.7rem",
              color: isGuest ? "rgba(255,180,0,0.6)" : "rgba(0,255,255,0.6)",
              marginBottom: "0.4rem",
              letterSpacing: "0.08em",
            }}
          >
            DOCUMENT PHOTO
          </p>
          <button
            type="button"
            style={{
              border: isGuest
                ? "1.5px dashed rgba(255,180,0,0.3)"
                : "1.5px dashed rgba(0,255,255,0.3)",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
              minHeight: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,255,255,0.03)",
              width: "100%",
            }}
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview &&
            photoPreview !== EMPTY_PHOTO_URL &&
            !photoPreview.includes("iVBORw0KGgo") ? (
              <img
                src={photoPreview}
                alt="Document"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1.5rem",
                }}
              >
                <Camera
                  size={28}
                  style={{
                    color: isGuest
                      ? "rgba(255,180,0,0.4)"
                      : "rgba(0,255,255,0.4)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: "0.8rem",
                    color: isGuest
                      ? "rgba(255,180,0,0.5)"
                      : "rgba(0,255,255,0.5)",
                  }}
                >
                  Tap to upload document photo
                </span>
              </div>
            )}
          </button>
          <input
            ref={photoInputRef}
            data-ocid="addid.upload_button"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="neon-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "transparent",
              border: isGuest
                ? "1px solid rgba(255,180,0,0.2)"
                : "1px solid rgba(0,255,255,0.2)",
              borderRadius: "8px",
              padding: "0.4rem 0.9rem",
              color: isGuest ? "rgba(255,180,0,0.6)" : "rgba(0,255,255,0.6)",
              fontSize: "0.78rem",
              fontFamily: "'Exo 2', sans-serif",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            <Upload size={14} /> Upload from Gallery
          </button>
        </div>

        {/* Dynamic fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            {currentFields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  style={{
                    display: "block",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.68rem",
                    color: isGuest
                      ? "rgba(255,180,0,0.55)"
                      : "rgba(0,255,255,0.55)",
                    marginBottom: "0.35rem",
                    letterSpacing: "0.07em",
                  }}
                >
                  {field.label.toUpperCase()}
                  {field.required && (
                    <span style={{ color: "#ff4444", marginLeft: "0.2rem" }}>
                      *
                    </span>
                  )}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    value={fields[field.name] || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(0,255,255,0.05)",
                      border: "1px solid rgba(0,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "0.65rem 0.9rem",
                      color: "rgba(255,255,255,0.9)",
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type={field.type || "text"}
                    value={fields[field.name] || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    placeholder={field.label}
                    style={{
                      width: "100%",
                      background: "rgba(0,255,255,0.05)",
                      border: "1px solid rgba(0,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "0.65rem 0.9rem",
                      color: "rgba(255,255,255,0.9)",
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            data-ocid="addid.cancel_button"
            onClick={() => navigate({ type: "home" })}
            disabled={isSaving}
            className="neon-btn neon-btn-violet"
            style={{
              flex: 1,
              padding: "0.85rem",
              borderRadius: "10px",
              border: "1px solid rgba(123,0,255,0.4)",
              background: "transparent",
              color: "rgba(123,0,255,0.8)",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.82rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="addid.save_button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="neon-btn"
            style={{
              flex: 2,
              padding: "0.85rem",
              borderRadius: "10px",
              border: isGuest
                ? "1.5px solid rgba(255,180,0,0.5)"
                : "1.5px solid rgba(0,255,255,0.5)",
              background: isGuest
                ? "linear-gradient(135deg, rgba(255,180,0,0.12), rgba(255,100,0,0.08))"
                : "linear-gradient(135deg, rgba(0,255,255,0.12), rgba(0,100,180,0.12))",
              color: isGuest ? "#ffb400" : "#00ffff",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.85rem",
              cursor: isSaving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              letterSpacing: "0.05em",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving && (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            {isSaving ? "Saving…" : isEditing ? "Update ID" : "Save ID"}
          </button>
        </div>
      </div>
    </div>
  );
}
