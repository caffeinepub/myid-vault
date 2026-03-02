const SESSION_KEY = "myid-vault-session";

export interface CollegeStudentCard {
  photo: string; // base64 data URL or empty string
  fullName: string;
  dateOfBirth: string;
  enrollmentNo: string;
  course: string;
  branch: string;
  collegeName: string;
  academicYear: string;
  validUntil: string;
}

export interface OtherIDCard {
  photo: string; // base64 data URL or empty string
  fullName: string;
  idType: string;
  idNumber: string;
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
}

export interface LocalIDCard {
  id: string;
  timestamp: number;
  cardType:
    | { __kind__: "collegeStudent"; collegeStudent: CollegeStudentCard }
    | { __kind__: "other"; other: OtherIDCard };
}

function getStorageKey(username: string): string {
  return `myid-vault-ids-${username}`;
}

function getCurrentUsername(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { username?: string };
    return session.username ?? null;
  } catch {
    return null;
  }
}

function loadCards(username: string): LocalIDCard[] {
  try {
    const key = getStorageKey(username);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as LocalIDCard[];
  } catch {
    return [];
  }
}

function saveCards(username: string, cards: LocalIDCard[]): void {
  const key = getStorageKey(username);
  localStorage.setItem(key, JSON.stringify(cards));
}

export function useLocalIDStore() {
  const username = getCurrentUsername();

  function getAllCards(): LocalIDCard[] {
    if (!username) return [];
    return loadCards(username).sort((a, b) => b.timestamp - a.timestamp);
  }

  function getCard(id: string): LocalIDCard | undefined {
    if (!username) return undefined;
    return loadCards(username).find((c) => c.id === id);
  }

  function saveCard(card: LocalIDCard): void {
    if (!username) throw new Error("Not logged in");
    const cards = loadCards(username);
    const existing = cards.findIndex((c) => c.id === card.id);
    if (existing >= 0) {
      cards[existing] = card;
    } else {
      cards.push(card);
    }
    saveCards(username, cards);
  }

  function updateCard(id: string, card: LocalIDCard): void {
    if (!username) throw new Error("Not logged in");
    const cards = loadCards(username);
    const idx = cards.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Card not found");
    cards[idx] = card;
    saveCards(username, cards);
  }

  function deleteCard(id: string): void {
    if (!username) throw new Error("Not logged in");
    const cards = loadCards(username).filter((c) => c.id !== id);
    saveCards(username, cards);
  }

  return { getAllCards, getCard, saveCard, updateCard, deleteCard, username };
}
