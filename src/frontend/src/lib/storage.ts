export interface AccountRecord {
  name: string;
  createdAt: number;
  banned: boolean;
  hasSecurityQuestion: boolean;
  securityQuestion?: string;
  idCount: number;
}

export type AccountsStore = Record<string, AccountRecord>;

export function getAccounts(): AccountsStore {
  try {
    return JSON.parse(localStorage.getItem("myid_accounts") || "{}");
  } catch {
    return {};
  }
}

export function saveAccounts(accounts: AccountsStore): void {
  localStorage.setItem("myid_accounts", JSON.stringify(accounts));
}

export function registerAccount(
  principal: string,
  name: string,
): AccountRecord {
  const accounts = getAccounts();
  if (!accounts[principal]) {
    accounts[principal] = {
      name,
      createdAt: Date.now(),
      banned: false,
      hasSecurityQuestion: false,
      idCount: 0,
    };
    saveAccounts(accounts);
  }
  return accounts[principal];
}

export function updateAccountName(principal: string, name: string): void {
  const accounts = getAccounts();
  if (accounts[principal]) {
    accounts[principal].name = name;
    saveAccounts(accounts);
  }
}

export function isAccountBanned(principal: string): boolean {
  const accounts = getAccounts();
  return accounts[principal]?.banned ?? false;
}

export function setAccountBanned(principal: string, banned: boolean): void {
  const accounts = getAccounts();
  if (accounts[principal]) {
    accounts[principal].banned = banned;
    saveAccounts(accounts);
  }
}

export function deleteAccount(principal: string): void {
  const accounts = getAccounts();
  delete accounts[principal];
  saveAccounts(accounts);
  // also clear their security question
  localStorage.removeItem(`myid_secq_${principal}`);
  localStorage.removeItem(`myid_autolock_${principal}`);
}

export function incrementIdCount(principal: string, delta: number): void {
  const accounts = getAccounts();
  if (accounts[principal]) {
    accounts[principal].idCount = Math.max(
      0,
      (accounts[principal].idCount || 0) + delta,
    );
    saveAccounts(accounts);
  }
}

// ── Background ──
export function getBackgroundPreference(): string {
  return localStorage.getItem("myid_bg") || "neon-aurora";
}

export function setBackgroundPreference(style: string): void {
  localStorage.setItem("myid_bg", style);
  window.dispatchEvent(new CustomEvent("myid-bg-change", { detail: style }));
}

// ── Auto-lock ──
export function getAutoLock(principal: string): boolean {
  return localStorage.getItem(`myid_autolock_${principal}`) === "true";
}

export function setAutoLock(principal: string, val: boolean): void {
  localStorage.setItem(`myid_autolock_${principal}`, val ? "true" : "false");
}

// ── Security question ──
interface SecQRecord {
  question: string;
  answerHash: string;
}

export function getSecurityQuestion(principal: string): SecQRecord | null {
  try {
    const raw = localStorage.getItem(`myid_secq_${principal}`);
    if (!raw) return null;
    return JSON.parse(raw) as SecQRecord;
  } catch {
    return null;
  }
}

export function setSecurityQuestion(
  principal: string,
  question: string,
  answerHash: string,
): void {
  localStorage.setItem(
    `myid_secq_${principal}`,
    JSON.stringify({ question, answerHash }),
  );
  const accounts = getAccounts();
  if (accounts[principal]) {
    accounts[principal].hasSecurityQuestion = true;
    accounts[principal].securityQuestion = question;
    saveAccounts(accounts);
  }
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was your first pet's name?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is the name of your first school?",
];
