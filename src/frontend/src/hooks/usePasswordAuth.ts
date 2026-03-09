import { useCallback, useEffect, useState } from "react";

const ACCOUNTS_KEY = "myid-vault-accounts";
const SESSION_KEY = "myid-vault-session";
const SETTINGS_KEY_PREFIX = "myid-vault-settings-";

export interface AuthUser {
  username: string;
  name: string;
}

interface StoredAccount {
  username: string;
  passwordHash: string;
  name: string;
  securityQuestion: string;
  securityAnswerHash: string;
}

export interface BackgroundSetting {
  type: "neon" | "preset" | "custom" | "video";
  value?: string; // preset key, base64 data URL for custom, or video key for video
}

export interface UserSettings {
  theme: string;
  autoLock: boolean;
  background: BackgroundSetting;
}

type AccountsStore = Record<string, StoredAccount>;

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadAccounts(): AccountsStore {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AccountsStore;
  } catch {
    return {};
  }
}

function saveAccounts(accounts: AccountsStore): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSession(): AuthUser | null {
  try {
    // Try localStorage first, then sessionStorage (for auto-lock sessions)
    const rawLocal = localStorage.getItem(SESSION_KEY);
    if (rawLocal) return JSON.parse(rawLocal) as AuthUser;
    const rawSession = sessionStorage.getItem(SESSION_KEY);
    if (rawSession) return JSON.parse(rawSession) as AuthUser;
    return null;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser, useSessionStorage = false): void {
  if (useSessionStorage) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function loadSettings(username: string): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY_PREFIX + username);
    if (!raw)
      return {
        theme: "system",
        autoLock: false,
        background: { type: "preset", value: "aurora" },
      };
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      theme: parsed.theme ?? "system",
      autoLock: parsed.autoLock ?? false,
      background: parsed.background ?? { type: "preset", value: "aurora" },
    };
  } catch {
    return {
      theme: "system",
      autoLock: false,
      background: { type: "preset", value: "aurora" },
    };
  }
}

function saveSettings(username: string, settings: UserSettings): void {
  localStorage.setItem(
    SETTINGS_KEY_PREFIX + username,
    JSON.stringify(settings),
  );
}

export function usePasswordAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [appInitializing, setAppInitializing] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session);
    }
    setAppInitializing(false);
  }, []);

  // Derived: does the current user have a security question?
  const hasSecurityQuestion = (() => {
    if (!user) return false;
    const accounts = loadAccounts();
    const account = accounts[user.username];
    return !!(
      account?.securityQuestion && account.securityQuestion.trim() !== ""
    );
  })();

  const signUp = useCallback(
    async (
      name: string,
      username: string,
      password: string,
      securityQuestion: string,
      securityAnswer: string,
    ): Promise<void> => {
      const accounts = loadAccounts();
      const key = username.toLowerCase();
      if (accounts[key]) {
        throw new Error("Username already taken. Please choose another.");
      }
      const passwordHash = await hashPassword(password);
      const securityAnswerHash = await hashPassword(
        securityAnswer.toLowerCase(),
      );
      const account: StoredAccount = {
        username: key,
        passwordHash,
        name,
        securityQuestion,
        securityAnswerHash,
      };
      accounts[key] = account;
      saveAccounts(accounts);

      const newUser: AuthUser = { username: key, name };
      saveSession(newUser);
      setUser(newUser);
    },
    [],
  );

  const loginWithPassword = useCallback(
    async (username: string, password: string): Promise<void> => {
      const accounts = loadAccounts();
      const key = username.toLowerCase();
      const account = accounts[key];
      if (!account) {
        throw new Error("No account found for this username.");
      }
      // Check if user is banned
      const banned = adminGetBanned();
      if (banned.includes(key)) {
        throw new Error(
          "Your account has been suspended. Please contact the administrator.",
        );
      }
      const passwordHash = await hashPassword(password);
      if (passwordHash !== account.passwordHash) {
        throw new Error("Incorrect password. Please try again.");
      }
      const sessionUser: AuthUser = { username: key, name: account.name };
      // Check autoLock setting for this account
      const settings = loadSettings(key);
      saveSession(sessionUser, settings.autoLock);
      setUser(sessionUser);
    },
    [],
  );

  const getSecurityQuestion = useCallback((username: string): string => {
    const accounts = loadAccounts();
    const key = username.toLowerCase();
    const account = accounts[key];
    if (!account) {
      throw new Error("No account found for this username.");
    }
    // Handle legacy accounts that don't have a security question
    if (!account.securityQuestion) {
      throw new Error(
        "This account does not have a security question set up. Please contact support.",
      );
    }
    return account.securityQuestion;
  }, []);

  const resetPassword = useCallback(
    async (
      username: string,
      securityAnswer: string,
      newPassword: string,
    ): Promise<void> => {
      const accounts = loadAccounts();
      const key = username.toLowerCase();
      const account = accounts[key];
      if (!account) {
        throw new Error("No account found for this username.");
      }
      const answerHash = await hashPassword(securityAnswer.toLowerCase());
      if (answerHash !== account.securityAnswerHash) {
        throw new Error("Incorrect answer to security question.");
      }
      const newPasswordHash = await hashPassword(newPassword);
      accounts[key] = { ...account, passwordHash: newPasswordHash };
      saveAccounts(accounts);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    clearSession();
    setUser(null);
  }, []);

  // Update security question for logged-in user
  const updateSecurityQuestion = useCallback(
    async (
      currentPassword: string,
      newQuestion: string,
      newAnswer: string,
    ): Promise<void> => {
      if (!user) throw new Error("Not logged in.");
      const accounts = loadAccounts();
      const account = accounts[user.username];
      if (!account) throw new Error("Account not found.");
      const passwordHash = await hashPassword(currentPassword);
      if (passwordHash !== account.passwordHash) {
        throw new Error("Incorrect current password.");
      }
      const newAnswerHash = await hashPassword(newAnswer.toLowerCase().trim());
      accounts[user.username] = {
        ...account,
        securityQuestion: newQuestion,
        securityAnswerHash: newAnswerHash,
      };
      saveAccounts(accounts);
      // Force re-render by updating user state (same user, triggers re-derive)
      setUser((prev) => (prev ? { ...prev } : null));
    },
    [user],
  );

  // Get settings for current user
  const getSettings = useCallback((): UserSettings => {
    if (!user)
      return {
        theme: "system",
        autoLock: false,
        background: { type: "preset", value: "aurora" },
      };
    return loadSettings(user.username);
  }, [user]);

  // Update settings for current user
  const updateSettings = useCallback(
    (settings: Partial<UserSettings>): void => {
      if (!user) return;
      const current = loadSettings(user.username);
      const merged: UserSettings = { ...current, ...settings };
      saveSettings(user.username, merged);
    },
    [user],
  );

  return {
    user,
    isInitializing: appInitializing,
    hasSecurityQuestion,
    signUp,
    loginWithPassword,
    logout,
    getSecurityQuestion,
    resetPassword,
    updateSecurityQuestion,
    getSettings,
    updateSettings,
  };
}

// ─────────────────────────────────────────────────────────
// Admin helper functions (standalone, not inside the hook)
// ─────────────────────────────────────────────────────────

const ADMIN_SESSION_KEY = "myid-vault-admin-session";
const BANNED_KEY = "myid-vault-banned";
// Suppress unused-variable warnings — these constants are used by the functions below
void ADMIN_SESSION_KEY;
void BANNED_KEY;

export function adminLoadAccounts(): Record<
  string,
  { username: string; name: string; securityQuestion: string }
> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw) as Record<
      string,
      {
        username: string;
        passwordHash: string;
        name: string;
        securityQuestion: string;
        securityAnswerHash: string;
      }
    >;
    const result: Record<
      string,
      { username: string; name: string; securityQuestion: string }
    > = {};
    for (const [k, v] of Object.entries(all)) {
      result[k] = {
        username: v.username,
        name: v.name,
        securityQuestion: v.securityQuestion || "",
      };
    }
    return result;
  } catch {
    return {};
  }
}

export function adminGetUserIDCount(username: string): number {
  try {
    const raw = localStorage.getItem(`myid-vault-ids-${username}`);
    if (!raw) return 0;
    const cards = JSON.parse(raw) as unknown[];
    return Array.isArray(cards) ? cards.length : 0;
  } catch {
    return 0;
  }
}

export function adminGetUserIDs(
  username: string,
): import("./useLocalIDStore").LocalIDCard[] {
  try {
    const raw = localStorage.getItem(`myid-vault-ids-${username}`);
    if (!raw) return [];
    return JSON.parse(raw) as import("./useLocalIDStore").LocalIDCard[];
  } catch {
    return [];
  }
}

export function adminDeleteAccount(username: string): void {
  const accounts = (() => {
    try {
      const r = localStorage.getItem(ACCOUNTS_KEY);
      return r ? (JSON.parse(r) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  })();
  delete accounts[username];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  localStorage.removeItem(`myid-vault-ids-${username}`);
  localStorage.removeItem(`myid-vault-settings-${username}`);
}

export function adminResetPassword(
  username: string,
  newPassword: string,
): Promise<void> {
  return (async () => {
    const accounts = (() => {
      try {
        const r = localStorage.getItem(ACCOUNTS_KEY);
        return r
          ? (JSON.parse(r) as Record<string, StoredAccount>)
          : ({} as Record<string, StoredAccount>);
      } catch {
        return {} as Record<string, StoredAccount>;
      }
    })();
    if (!accounts[username]) throw new Error("User not found");
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(newPassword));
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    accounts[username] = { ...accounts[username], passwordHash: hash };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  })();
}

export function adminGetBanned(): string[] {
  try {
    const r = localStorage.getItem("myid-vault-banned");
    return r ? (JSON.parse(r) as string[]) : [];
  } catch {
    return [];
  }
}

export function adminToggleBan(username: string): boolean {
  const banned = adminGetBanned();
  const idx = banned.indexOf(username);
  if (idx >= 0) {
    banned.splice(idx, 1);
  } else {
    banned.push(username);
  }
  localStorage.setItem("myid-vault-banned", JSON.stringify(banned));
  return banned.includes(username);
}

export function adminSaveSession(): void {
  sessionStorage.setItem("myid-vault-admin-session", "1");
}

export function adminClearSession(): void {
  sessionStorage.removeItem("myid-vault-admin-session");
}

export function adminHasSession(): boolean {
  return sessionStorage.getItem("myid-vault-admin-session") === "1";
}
