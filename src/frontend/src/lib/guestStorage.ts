import { ExternalBlob } from "../backend";
import type { IDCard, IDType } from "../backend";

const GUEST_KEY = "myid_guest_cards";

// Serialized form stored in localStorage (photos as data URLs)
interface StoredOtherID {
  issueDate: string;
  dateOfBirth: string;
  expiryDate: string;
  fullName: string;
  idNumber: string;
  issuedBy: string;
  photoUrl: string;
  idType: string;
}

interface StoredCollegeStudentID {
  branch: string;
  enrollmentNo: string;
  dateOfBirth: string;
  collegeName: string;
  fullName: string;
  academicYear: string;
  photoUrl: string;
  course: string;
  validUntil: string;
}

type StoredIDType =
  | { __kind__: "other"; other: StoredOtherID }
  | { __kind__: "collegeStudent"; collegeStudent: StoredCollegeStudentID };

interface StoredCard {
  id: string;
  cardType: StoredIDType;
  timestamp: string; // bigint serialised as string
}

function storedToIDCard(s: StoredCard): IDCard {
  let cardType: IDType;
  if (s.cardType.__kind__ === "collegeStudent") {
    const c = s.cardType.collegeStudent;
    cardType = {
      __kind__: "collegeStudent",
      collegeStudent: {
        branch: c.branch,
        enrollmentNo: c.enrollmentNo,
        dateOfBirth: c.dateOfBirth,
        collegeName: c.collegeName,
        fullName: c.fullName,
        academicYear: c.academicYear,
        photo: ExternalBlob.fromURL(c.photoUrl),
        course: c.course,
        validUntil: c.validUntil,
      },
    };
  } else {
    const o = s.cardType.other;
    cardType = {
      __kind__: "other",
      other: {
        issueDate: o.issueDate,
        dateOfBirth: o.dateOfBirth,
        expiryDate: o.expiryDate,
        fullName: o.fullName,
        idNumber: o.idNumber,
        issuedBy: o.issuedBy,
        photo: ExternalBlob.fromURL(o.photoUrl),
        idType: o.idType,
      },
    };
  }
  return { id: s.id, cardType, timestamp: BigInt(s.timestamp) };
}

function idCardToStored(card: IDCard): StoredCard {
  let cardType: StoredIDType;
  if (card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    cardType = {
      __kind__: "collegeStudent",
      collegeStudent: {
        branch: c.branch,
        enrollmentNo: c.enrollmentNo,
        dateOfBirth: c.dateOfBirth,
        collegeName: c.collegeName,
        fullName: c.fullName,
        academicYear: c.academicYear,
        photoUrl: c.photo.getDirectURL(),
        course: c.course,
        validUntil: c.validUntil,
      },
    };
  } else {
    const o = card.cardType.other;
    cardType = {
      __kind__: "other",
      other: {
        issueDate: o.issueDate,
        dateOfBirth: o.dateOfBirth,
        expiryDate: o.expiryDate,
        fullName: o.fullName,
        idNumber: o.idNumber,
        issuedBy: o.issuedBy,
        photoUrl: o.photo.getDirectURL(),
        idType: o.idType,
      },
    };
  }
  return { id: card.id, cardType, timestamp: String(card.timestamp) };
}

export function getGuestCards(): IDCard[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const stored: StoredCard[] = JSON.parse(raw);
    return stored.map(storedToIDCard);
  } catch {
    return [];
  }
}

export function getGuestCard(id: string): IDCard | null {
  return getGuestCards().find((c) => c.id === id) ?? null;
}

export function saveGuestCard(card: IDCard): void {
  const cards = getGuestCards();
  const existing = cards.findIndex((c) => c.id === card.id);
  const stored = idCardToStored(card);
  let all: StoredCard[];
  if (existing >= 0) {
    all = getStoredRaw();
    all[existing] = stored;
  } else {
    all = getStoredRaw();
    all.push(stored);
  }
  localStorage.setItem(GUEST_KEY, JSON.stringify(all));
}

export function deleteGuestCard(id: string): void {
  const all = getStoredRaw().filter((c) => c.id !== id);
  localStorage.setItem(GUEST_KEY, JSON.stringify(all));
}

export function clearGuestCards(): void {
  localStorage.removeItem(GUEST_KEY);
}

function getStoredRaw(): StoredCard[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
