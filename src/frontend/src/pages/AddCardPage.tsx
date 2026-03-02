import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileImage,
  GraduationCap,
  Loader2,
  ScanLine,
  School,
  Upload,
  User,
} from "lucide-react";
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

type CardTypeChoice = "collegeStudent" | "other";

// ID category types for the "Other" category
type IDCategory =
  | "aadhaar"
  | "pan"
  | "passport"
  | "drivingLicence"
  | "voterId"
  | "collegeId"
  | "schoolId";

interface AddCardPageProps {
  navigate: (page: AppPage) => void;
  editCardId?: string;
}

// ─── College ID Form ──────────────────────────────────────────────
interface CollegeFormData {
  fullName: string;
  dateOfBirth: string;
  enrollmentNo: string;
  course: string;
  branch: string;
  collegeName: string;
  academicYear: string;
  validUntil: string;
  photoFile: File | null;
  photoPreview: string | null;
  docPhotoFile: File | null;
  docPhotoPreview: string | null;
}

// ─── Other ID Form ────────────────────────────────────────────────
interface OtherFormData {
  fullName: string;
  idCategory: IDCategory;
  idType: string;
  // Aadhaar
  aadharNo: string;
  address: string;
  // PAN
  panNo: string;
  fathersName: string;
  // Passport
  passportNo: string;
  nationality: string;
  // Driving Licence
  licenceNo: string;
  vehicleClass: string;
  // Voter ID
  voterIdNo: string;
  spouseName: string;
  // College ID (via "Other")
  enrollmentNo: string;
  course: string;
  branch: string;
  collegeName: string;
  academicYear: string;
  validUntil: string;
  // School ID
  rollNo: string;
  classGrade: string;
  schoolName: string;
  // Shared
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
  // Photo
  photoFile: File | null;
  photoPreview: string | null;
  docPhotoFile: File | null;
  docPhotoPreview: string | null;
}

const ID_CATEGORIES: {
  value: IDCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "aadhaar",
    label: "Aadhaar Card",
    icon: <CreditCard className="w-4 h-4" />,
  },
  { value: "pan", label: "PAN Card", icon: <CreditCard className="w-4 h-4" /> },
  {
    value: "passport",
    label: "Passport",
    icon: <FileImage className="w-4 h-4" />,
  },
  {
    value: "drivingLicence",
    label: "Driving Licence",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    value: "voterId",
    label: "Voter ID",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    value: "collegeId",
    label: "College ID",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    value: "schoolId",
    label: "School ID",
    icon: <School className="w-4 h-4" />,
  },
];

function getCategoryLabel(cat: IDCategory): string {
  return ID_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

// Build backend idType & idNumber strings from category-specific fields
function buildIdTypeAndNumber(data: OtherFormData): {
  idType: string;
  idNumber: string;
  issuedBy: string;
} {
  switch (data.idCategory) {
    case "aadhaar":
      return {
        idType: "Aadhaar Card",
        idNumber: data.aadharNo,
        issuedBy: "UIDAI",
      };
    case "pan":
      return {
        idType: "PAN Card",
        idNumber: data.panNo,
        issuedBy: "Income Tax Department",
      };
    case "passport":
      return {
        idType: "Passport",
        idNumber: data.passportNo,
        issuedBy: data.issuedBy,
      };
    case "drivingLicence":
      return {
        idType: "Driving Licence",
        idNumber: data.licenceNo,
        issuedBy: data.issuedBy,
      };
    case "voterId":
      return {
        idType: "Voter ID",
        idNumber: data.voterIdNo,
        issuedBy: "Election Commission of India",
      };
    case "collegeId":
      return {
        idType: "College ID",
        idNumber: data.enrollmentNo,
        issuedBy: data.collegeName,
      };
    case "schoolId":
      return {
        idType: "School ID",
        idNumber: data.rollNo,
        issuedBy: data.schoolName,
      };
    default:
      return { idType: "Other", idNumber: "", issuedBy: "" };
  }
}

function validateOtherForm(data: OtherFormData): string | null {
  if (!data.fullName) return "Full name is required";
  if (!data.dateOfBirth) return "Date of birth is required";
  switch (data.idCategory) {
    case "aadhaar":
      if (!data.aadharNo) return "Aadhar No. is required";
      break;
    case "pan":
      if (!data.panNo) return "PAN No. is required";
      break;
    case "passport":
      if (!data.passportNo) return "Passport No. is required";
      break;
    case "drivingLicence":
      if (!data.licenceNo) return "Licence No. is required";
      break;
    case "voterId":
      if (!data.voterIdNo) return "Voter ID No. is required";
      break;
    case "collegeId":
      if (!data.enrollmentNo) return "Enrollment No. is required";
      if (!data.course) return "Course is required";
      break;
    case "schoolId":
      if (!data.rollNo) return "Roll No. is required";
      if (!data.classGrade) return "Class/Grade is required";
      break;
  }
  return null;
}

const defaultOtherForm: OtherFormData = {
  fullName: "",
  idCategory: "aadhaar",
  idType: "",
  aadharNo: "",
  address: "",
  panNo: "",
  fathersName: "",
  passportNo: "",
  nationality: "",
  licenceNo: "",
  vehicleClass: "",
  voterIdNo: "",
  spouseName: "",
  enrollmentNo: "",
  course: "",
  branch: "",
  collegeName: "",
  academicYear: "",
  validUntil: "",
  rollNo: "",
  classGrade: "",
  schoolName: "",
  dateOfBirth: "",
  issueDate: "",
  expiryDate: "",
  issuedBy: "",
  photoFile: null,
  photoPreview: null,
  docPhotoFile: null,
  docPhotoPreview: null,
};

export default function AddCardPage({
  navigate,
  editCardId,
}: AddCardPageProps) {
  const isEdit = !!editCardId;
  const { data: existingCard } = useGetCard(editCardId ?? "");

  const [step, setStep] = useState<"choose" | "form">(
    isEdit ? "form" : "choose",
  );
  const [cardType, setCardType] = useState<CardTypeChoice>("collegeStudent");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [collegeForm, setCollegeForm] = useState<CollegeFormData>({
    fullName: "",
    dateOfBirth: "",
    enrollmentNo: "",
    course: "",
    branch: "",
    collegeName: "",
    academicYear: "",
    validUntil: "",
    photoFile: null,
    photoPreview: null,
    docPhotoFile: null,
    docPhotoPreview: null,
  });

  const [otherForm, setOtherForm] = useState<OtherFormData>(defaultOtherForm);

  const createCollege = useCreateCollegeID();
  const createOther = useCreateOtherID();
  const updateCard = useUpdateCard();

  // Pre-fill edit form
  useEffect(() => {
    if (existingCard && isEdit) {
      if (existingCard.cardType.__kind__ === "collegeStudent") {
        const c = existingCard.cardType.collegeStudent;
        setCardType("collegeStudent");
        const photoUrl = c.photo.getDirectURL();
        setCollegeForm({
          fullName: c.fullName,
          dateOfBirth: c.dateOfBirth,
          enrollmentNo: c.enrollmentNo,
          course: c.course,
          branch: c.branch,
          collegeName: c.collegeName,
          academicYear: c.academicYear,
          validUntil: c.validUntil,
          photoFile: null,
          photoPreview: photoUrl || null,
          docPhotoFile: null,
          docPhotoPreview: null,
        });
      } else if (existingCard.cardType.__kind__ === "other") {
        const o = existingCard.cardType.other;
        setCardType("other");
        const photoUrl = o.photo.getDirectURL();
        // Map idType back to category
        let cat: IDCategory = "aadhaar";
        if (o.idType === "PAN Card") cat = "pan";
        else if (o.idType === "Passport") cat = "passport";
        else if (o.idType === "Driving Licence") cat = "drivingLicence";
        else if (o.idType === "Voter ID") cat = "voterId";
        else if (o.idType === "College ID") cat = "collegeId";
        else if (o.idType === "School ID") cat = "schoolId";

        setOtherForm({
          ...defaultOtherForm,
          fullName: o.fullName,
          idCategory: cat,
          idType: o.idType,
          aadharNo: cat === "aadhaar" ? o.idNumber : "",
          panNo: cat === "pan" ? o.idNumber : "",
          passportNo: cat === "passport" ? o.idNumber : "",
          licenceNo: cat === "drivingLicence" ? o.idNumber : "",
          voterIdNo: cat === "voterId" ? o.idNumber : "",
          enrollmentNo: cat === "collegeId" ? o.idNumber : "",
          rollNo: cat === "schoolId" ? o.idNumber : "",
          dateOfBirth: o.dateOfBirth,
          issueDate: o.issueDate,
          expiryDate: o.expiryDate,
          issuedBy: o.issuedBy,
          photoFile: null,
          photoPreview: photoUrl || null,
          docPhotoFile: null,
          docPhotoPreview: null,
        });
      }
    }
  }, [existingCard, isEdit]);

  const handleChooseType = (type: CardTypeChoice) => {
    setCardType(type);
    setStep("form");
  };

  const handleSubmitCollege = async () => {
    const f = collegeForm;
    if (
      !f.fullName ||
      !f.dateOfBirth ||
      !f.enrollmentNo ||
      !f.course ||
      !f.branch ||
      !f.collegeName ||
      !f.academicYear ||
      !f.validUntil
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoBlob: ExternalBlob;
      if (f.photoFile) {
        const bytes = new Uint8Array(await f.photoFile.arrayBuffer());
        photoBlob = ExternalBlob.fromBytes(bytes);
      } else if (
        isEdit &&
        existingCard?.cardType.__kind__ === "collegeStudent"
      ) {
        photoBlob = existingCard.cardType.collegeStudent.photo;
      } else {
        photoBlob = ExternalBlob.fromBytes(new Uint8Array(0));
      }

      const id = editCardId ?? crypto.randomUUID();
      if (isEdit && existingCard) {
        await updateCard.mutateAsync({
          id,
          card: {
            id,
            timestamp: existingCard.timestamp,
            cardType: {
              __kind__: "collegeStudent",
              collegeStudent: {
                fullName: f.fullName,
                dateOfBirth: f.dateOfBirth,
                enrollmentNo: f.enrollmentNo,
                course: f.course,
                branch: f.branch,
                collegeName: f.collegeName,
                academicYear: f.academicYear,
                validUntil: f.validUntil,
                photo: photoBlob,
              },
            },
          },
        });
        toast.success("College ID updated!");
      } else {
        await createCollege.mutateAsync({
          id,
          photo: photoBlob,
          fullName: f.fullName,
          dateOfBirth: f.dateOfBirth,
          enrollmentNo: f.enrollmentNo,
          course: f.course,
          branch: f.branch,
          collegeName: f.collegeName,
          academicYear: f.academicYear,
          validUntil: f.validUntil,
        });
        toast.success("College ID added!");
      }
      navigate({ type: "home" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save ID card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOther = async () => {
    const f = otherForm;
    const validationError = validateOtherForm(f);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      let photoBlob: ExternalBlob;
      if (f.photoFile) {
        const bytes = new Uint8Array(await f.photoFile.arrayBuffer());
        photoBlob = ExternalBlob.fromBytes(bytes);
      } else if (isEdit && existingCard?.cardType.__kind__ === "other") {
        photoBlob = existingCard.cardType.other.photo;
      } else {
        photoBlob = ExternalBlob.fromBytes(new Uint8Array(0));
      }

      const { idType, idNumber, issuedBy } = buildIdTypeAndNumber(f);

      const id = editCardId ?? crypto.randomUUID();
      if (isEdit && existingCard) {
        await updateCard.mutateAsync({
          id,
          card: {
            id,
            timestamp: existingCard.timestamp,
            cardType: {
              __kind__: "other",
              other: {
                fullName: f.fullName,
                idType,
                idNumber,
                dateOfBirth: f.dateOfBirth,
                issueDate: f.issueDate,
                expiryDate: f.expiryDate,
                issuedBy,
                photo: photoBlob,
              },
            },
          },
        });
        toast.success("ID updated!");
      } else {
        await createOther.mutateAsync({
          id,
          photo: photoBlob,
          fullName: f.fullName,
          idType,
          idNumber,
          dateOfBirth: f.dateOfBirth,
          issueDate: f.issueDate,
          expiryDate: f.expiryDate,
          issuedBy,
        });
        toast.success("ID card added!");
      }
      navigate({ type: "home" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save ID card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === "form" && !isEdit) {
                setStep("choose");
              } else {
                navigate({ type: "home" });
              }
            }}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === "form" && !isEdit ? "Back" : "Cancel"}
          </button>
          <span className="text-sm font-semibold text-foreground">
            {isEdit
              ? "Edit ID Card"
              : step === "choose"
                ? "Add New ID"
                : `Add ${cardType === "collegeStudent" ? "College" : "Other"} ID`}
          </span>
        </div>
      </motion.header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {step === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-muted-foreground text-sm mb-6">
                Choose the type of ID you want to add to your vault.
              </p>
              <motion.div
                className="space-y-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.96 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                >
                  <TypeCard
                    icon={<GraduationCap className="w-6 h-6" />}
                    title="College Student ID"
                    description="Enrollment number, course, branch, college name, academic year"
                    color="oklch(0.22 0.055 255)"
                    accentColor="oklch(0.78 0.14 65)"
                    onClick={() => handleChooseType("collegeStudent")}
                  />
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.96 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                >
                  <TypeCard
                    icon={<CreditCard className="w-6 h-6" />}
                    title="Other ID"
                    description="Aadhaar, PAN, Passport, Driving Licence, Voter ID, College & School IDs"
                    color="oklch(0.28 0.08 52)"
                    accentColor="oklch(0.72 0.14 65)"
                    onClick={() => handleChooseType("other")}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === "form" && cardType === "collegeStudent" && (
            <motion.div
              key="college-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CollegeIDForm
                data={collegeForm}
                onChange={setCollegeForm}
                onSubmit={handleSubmitCollege}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {step === "form" && cardType === "other" && (
            <motion.div
              key="other-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <OtherIDForm
                data={otherForm}
                onChange={setOtherForm}
                onSubmit={handleSubmitOther}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Type Selection Card ──────────────────────────────────────────
function TypeCard({
  icon,
  title,
  description,
  color,
  accentColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.015,
        y: -3,
        boxShadow: "0 8px 24px oklch(0.18 0.04 255 / 0.18)",
      }}
      whileTap={{ scale: 0.985 }}
      className="w-full text-left rounded-2xl p-5 border border-border bg-card hover:border-primary/30 transition-colors"
      style={{
        boxShadow: "0 2px 8px oklch(0.18 0.025 250 / 0.06)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: color }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-base">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        </div>
        <ChevronRight
          className="w-5 h-5 flex-shrink-0"
          style={{ color: accentColor }}
        />
      </div>
    </motion.button>
  );
}

// ─── Photo Upload (Profile) ───────────────────────────────────────
function PhotoUpload({
  preview,
  onFile,
  label = "Profile Photo",
}: {
  preview: string | null;
  onFile: (file: File, preview: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onFile(file, url);
  };

  return (
    <div>
      <Label className="text-sm font-semibold text-foreground mb-2 block">
        {label}
      </Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-28 h-32 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors flex-shrink-0 block"
        style={{ background: "oklch(0.95 0.008 240)" }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <User className="w-8 h-8 text-muted-foreground" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Upload className="w-3 h-3" />
              Upload
            </div>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground mt-1.5">
        JPG, PNG, WEBP · Optional
      </p>
    </div>
  );
}

// ─── Document Photo Upload (Landscape Card Scan) ──────────────────
function DocPhotoUpload({
  preview,
  onFile,
}: {
  preview: string | null;
  onFile: (file: File, preview: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onFile(file, url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Label className="text-sm font-semibold text-foreground mb-2 block">
        Document Photo{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-full rounded-xl overflow-hidden border-2 border-dashed hover:border-primary/50 transition-colors block"
        style={{
          background: "oklch(0.14 0.02 255 / 0.5)",
          borderColor: "oklch(0.35 0.06 255 / 0.4)",
          aspectRatio: "1.585 / 1",
          maxHeight: "220px",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Document scan"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.22 0.055 255 / 0.15)" }}
            >
              <ScanLine
                className="w-7 h-7"
                style={{ color: "oklch(0.65 0.12 255)" }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Upload Document Scan
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Photo of the physical card / document
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Upload className="w-3.5 h-3.5" />
              Click to browse
            </div>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Upload className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium">Change</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
        <FileImage className="w-3 h-3" />
        Scan or photo of your physical document for reference
      </p>
    </motion.div>
  );
}

// ─── ID Category Dropdown ─────────────────────────────────────────
function CategoryDropdown({
  value,
  onChange,
}: {
  value: IDCategory;
  onChange: (v: IDCategory) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-semibold text-foreground mb-1.5 block">
        ID Category <span className="text-destructive ml-1">*</span>
      </Label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as IDCategory)}
          className="w-full appearance-none rounded-lg px-3 py-2.5 pr-10 text-sm font-medium border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all cursor-pointer"
          style={{ background: "var(--card)" }}
        >
          {ID_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Animated Field Group ─────────────────────────────────────────
function FieldGroup({
  children,
  layoutKey,
}: { children: React.ReactNode; layoutKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layoutKey}
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.99 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Category-specific Fields ─────────────────────────────────────
function AadhaarFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="aadhaar">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Aadhar No."
            required
            placeholder="XXXX XXXX XXXX"
            value={data.aadharNo}
            onChange={set("aadharNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Address"
            placeholder="Residential address"
            value={data.address}
            onChange={set("address")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

function PANFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="pan">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="PAN No."
            required
            placeholder="ABCDE1234F"
            value={data.panNo}
            onChange={set("panNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Father's Name"
            placeholder="Father's name as per PAN"
            value={data.fathersName}
            onChange={set("fathersName")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

function PassportFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="passport">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Passport No."
            required
            placeholder="A1234567"
            value={data.passportNo}
            onChange={set("passportNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Nationality"
            placeholder="Indian"
            value={data.nationality}
            onChange={set("nationality")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          <FormField
            label="Issue Date"
            type="date"
            value={data.issueDate}
            onChange={set("issueDate")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            label="Expiry Date"
            type="date"
            value={data.expiryDate}
            onChange={set("expiryDate")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Issued By"
            placeholder="Ministry of External Affairs"
            value={data.issuedBy}
            onChange={set("issuedBy")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

function DrivingLicenceFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="drivingLicence">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Licence No."
            required
            placeholder="DL-1234567890123"
            value={data.licenceNo}
            onChange={set("licenceNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Vehicle Class"
            placeholder="LMV, HMV, Motorcycle"
            value={data.vehicleClass}
            onChange={set("vehicleClass")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          <FormField
            label="Issue Date"
            type="date"
            value={data.issueDate}
            onChange={set("issueDate")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            label="Expiry Date"
            type="date"
            value={data.expiryDate}
            onChange={set("expiryDate")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Issued By (RTO)"
            placeholder="RTO, Mumbai"
            value={data.issuedBy}
            onChange={set("issuedBy")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

function VoterIDFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="voterId">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Voter ID No."
            required
            placeholder="ABC1234567"
            value={data.voterIdNo}
            onChange={set("voterIdNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Father's / Husband's Name"
            placeholder="Relation's name"
            value={data.spouseName}
            onChange={set("spouseName")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Address"
            placeholder="Residential address"
            value={data.address}
            onChange={set("address")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

function CollegeIDOtherFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="collegeId">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Enrollment No. / Roll No."
            required
            placeholder="e.g. 22CS1001"
            value={data.enrollmentNo}
            onChange={set("enrollmentNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Course"
            required
            placeholder="B.Tech, MBA, BCA"
            value={data.course}
            onChange={set("course")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          <FormField
            label="Branch"
            placeholder="Computer Science"
            value={data.branch}
            onChange={set("branch")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            label="Academic Year"
            placeholder="2022–2026"
            value={data.academicYear}
            onChange={set("academicYear")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="sm:col-span-2"
        >
          <FormField
            label="College Name"
            placeholder="IIT Bombay"
            value={data.collegeName}
            onChange={set("collegeName")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.14 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Valid Until"
            type="date"
            value={data.validUntil}
            onChange={set("validUntil")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

function SchoolIDFields({
  data,
  set,
}: {
  data: OtherFormData;
  set: (k: keyof OtherFormData) => (v: string) => void;
}) {
  return (
    <FieldGroup layoutKey="schoolId">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="sm:col-span-2"
        >
          <FormField
            label="Roll No."
            required
            placeholder="e.g. 2024-A-42"
            value={data.rollNo}
            onChange={set("rollNo")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
        >
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
        >
          <FormField
            label="Class / Grade"
            required
            placeholder="e.g. Class 10, Grade 12"
            value={data.classGrade}
            onChange={set("classGrade")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          <FormField
            label="Academic Year"
            placeholder="2024–2025"
            value={data.academicYear}
            onChange={set("academicYear")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            label="Valid Until"
            type="date"
            value={data.validUntil}
            onChange={set("validUntil")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="sm:col-span-2"
        >
          <FormField
            label="School Name"
            placeholder="e.g. Delhi Public School"
            value={data.schoolName}
            onChange={set("schoolName")}
          />
        </motion.div>
      </div>
    </FieldGroup>
  );
}

// ─── College ID Form ──────────────────────────────────────────────
function CollegeIDForm({
  data,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  data: CollegeFormData;
  onChange: (d: CollegeFormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const set = (key: keyof CollegeFormData) => (value: string | File | null) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.055 255 / 0.08), oklch(0.32 0.08 260 / 0.05))",
          border: "1px solid oklch(0.22 0.055 255 / 0.15)",
        }}
      >
        <GraduationCap className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          College Student ID
        </span>
      </motion.div>

      {/* Photo upload + name row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="flex gap-4 items-start"
      >
        <PhotoUpload
          preview={data.photoPreview}
          onFile={(file, preview) => {
            onChange({ ...data, photoFile: file, photoPreview: preview });
          }}
        />
        <div className="flex-1 space-y-3">
          <FormField
            label="Full Name (as per document)"
            required
            placeholder="e.g. Arjun Kumar Singh"
            value={data.fullName}
            onChange={set("fullName")}
          />
          <FormField
            label="Date of Birth"
            required
            type="date"
            value={data.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <FormField
          label="Enrollment No. / Roll No."
          required
          placeholder="e.g. 22CS1001"
          value={data.enrollmentNo}
          onChange={set("enrollmentNo")}
        />
        <FormField
          label="Course"
          required
          placeholder="e.g. B.Tech, MBA, BCA"
          value={data.course}
          onChange={set("course")}
        />
        <FormField
          label="Branch"
          required
          placeholder="e.g. Computer Science"
          value={data.branch}
          onChange={set("branch")}
        />
        <FormField
          label="Academic Year"
          required
          placeholder="e.g. 2022–2026"
          value={data.academicYear}
          onChange={set("academicYear")}
        />
        <FormField
          label="College Name"
          required
          placeholder="e.g. IIT Bombay"
          value={data.collegeName}
          onChange={set("collegeName")}
          className="sm:col-span-2"
        />
        <FormField
          label="Valid Until"
          required
          type="date"
          value={data.validUntil}
          onChange={set("validUntil")}
          className="sm:col-span-2"
        />
      </motion.div>

      {/* Document photo upload */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <DocPhotoUpload
          preview={data.docPhotoPreview}
          onFile={(file, preview) => {
            onChange({ ...data, docPhotoFile: file, docPhotoPreview: preview });
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-12 font-semibold text-base"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.055 255), oklch(0.32 0.08 260))",
            color: "oklch(0.97 0.005 240)",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save College ID
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Other ID Form ────────────────────────────────────────────────
function OtherIDForm({
  data,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  data: OtherFormData;
  onChange: (d: OtherFormData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const set = (key: keyof OtherFormData) => (value: string) => {
    onChange({ ...data, [key]: value });
  };

  const handleCategoryChange = (cat: IDCategory) => {
    onChange({ ...data, idCategory: cat });
  };

  const renderCategoryFields = () => {
    switch (data.idCategory) {
      case "aadhaar":
        return <AadhaarFields data={data} set={set} />;
      case "pan":
        return <PANFields data={data} set={set} />;
      case "passport":
        return <PassportFields data={data} set={set} />;
      case "drivingLicence":
        return <DrivingLicenceFields data={data} set={set} />;
      case "voterId":
        return <VoterIDFields data={data} set={set} />;
      case "collegeId":
        return <CollegeIDOtherFields data={data} set={set} />;
      case "schoolId":
        return <SchoolIDFields data={data} set={set} />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.08 52 / 0.08), oklch(0.35 0.09 55 / 0.05))",
          border: "1px solid oklch(0.65 0.14 65 / 0.2)",
        }}
      >
        <CreditCard
          className="w-5 h-5"
          style={{ color: "oklch(0.65 0.14 65)" }}
        />
        <span className="text-sm font-semibold text-foreground">
          {getCategoryLabel(data.idCategory)}
        </span>
      </motion.div>

      {/* Category dropdown + Full Name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.3 }}
        className="space-y-3"
      >
        <CategoryDropdown
          value={data.idCategory}
          onChange={handleCategoryChange}
        />
      </motion.div>

      {/* Photo + name row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        className="flex gap-4 items-start"
      >
        <PhotoUpload
          preview={data.photoPreview}
          onFile={(file, preview) => {
            onChange({ ...data, photoFile: file, photoPreview: preview });
          }}
        />
        <div className="flex-1 space-y-3">
          <FormField
            label="Full Name (as per document)"
            required
            placeholder="e.g. Priya Sharma"
            value={data.fullName}
            onChange={set("fullName")}
          />
        </div>
      </motion.div>

      {/* Category-specific fields */}
      <div>{renderCategoryFields()}</div>

      {/* Document photo upload */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <DocPhotoUpload
          preview={data.docPhotoPreview}
          onFile={(file, preview) => {
            onChange({ ...data, docPhotoFile: file, docPhotoPreview: preview });
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-12 font-semibold text-base"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.08 52), oklch(0.38 0.1 55))",
            color: "oklch(0.97 0.005 240)",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save ID Card
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────
function FormField({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card border-border focus-visible:ring-primary/30"
      />
    </div>
  );
}
