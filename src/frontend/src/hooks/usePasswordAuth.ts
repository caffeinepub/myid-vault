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
  createdAt: number;
  banned: boolean;
}

export interface BackgroundSetting {
  type: "neon" | "preset" | "custom" | "animated";
  value?: string;
}

export interface UserSettings {
  theme: string;
  autoLock: boolean;
  background: BackgroundSetting;
}

type AccountsStore = Record<string, StoredAccount>;

async function hashPassword(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
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

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session);
    }
    setAppInitializing(false);
  }, []);

  const hasSecurityQuestion = (() => {
    if (!user) return false;
    const accounts = loadAccounts();
    const account = accounts[user.username];
    return !!(
      account?.securityQuestion && account.securityQuestion.trim() !== ""
    );
  })();

  const users: Array<{
    username: string;
    name: string;
    securityQuestion: string;
    banned: boolean;
    createdAt: number;
  }> = Object.values(loadAccounts()).map((a) => ({
    username: a.username,
    name: a.name,
    securityQuestion: a.securityQuestion ?? "",
    banned: a.banned ?? false,
    createdAt: a.createdAt ?? 0,
  }));

  const signUp = useCallback(
    async (
      name: string,
      username: string,
      password: string,
      securityQuestion: string,
      securityAnswer: string,
    ): Promise<void> => {
      const accounts = loadAccounts();
      const key = username.toLowerCase().trim();
      if (accounts[key]) {
        throw new Error("An account with this username already exists.");
      }
      const passwordHash = await hashPassword(password);
      const securityAnswerHash = await hashPassword(
        securityAnswer.toLowerCase().trim(),
      );
      const account: StoredAccount = {
        username: key,
        passwordHash,
        name: name.trim(),
        securityQuestion,
        securityAnswerHash,
        createdAt: Date.now(),
        banned: false,
      };
      accounts[key] = account;
      saveAccounts(accounts);

      const newUser: AuthUser = { username: key, name: name.trim() };
      saveSession(newUser);
      setUser(newUser);
    },
    [],
  );

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      const accounts = loadAccounts();
      const key = username.toLowerCase().trim();
      const account = accounts[key];
      if (!account) {
        throw new Error("No account found with this username.");
      }
      if (account.banned) {
        throw new Error(
          "Your account has been suspended. Please contact the administrator.",
        );
      }
      const passwordHash = await hashPassword(password);
      if (passwordHash !== account.passwordHash) {
        throw new Error("Incorrect password. Please try again.");
      }
      const sessionUser: AuthUser = { username: key, name: account.name };
      const settings = loadSettings(key);
      saveSession(sessionUser, settings.autoLock);
      setUser(sessionUser);
    },
    [],
  );

  const logout = useCallback((): void => {
    clearSession();
    setUser(null);
  }, []);

  const getSecurityQuestion = useCallback((username: string): string => {
    const accounts = loadAccounts();
    const key = username.toLowerCase().trim();
    const account = accounts[key];
    if (!account) {
      throw new Error("No account found with this username.");
    }
    if (!account.securityQuestion) {
      throw new Error("This account does not have a security question set up.");
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
      const key = username.toLowerCase().trim();
      const account = accounts[key];
      if (!account) {
        throw new Error("No account found with this username.");
      }
      const answerHash = await hashPassword(
        securityAnswer.toLowerCase().trim(),
      );
      if (answerHash !== account.securityAnswerHash) {
        throw new Error("Incorrect answer to security question.");
      }
      const newPasswordHash = await hashPassword(newPassword);
      accounts[key] = { ...account, passwordHash: newPasswordHash };
      saveAccounts(accounts);
      const sessionUser: AuthUser = { username: key, name: account.name };
      saveSession(sessionUser);
      setUser(sessionUser);
    },
    [],
  );

  const changeSecurityQuestion = useCallback(
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
      setUser((prev) => (prev ? { ...prev } : null));
    },
    [user],
  );

  const updateDisplayName = useCallback(
    (newName: string): void => {
      if (!user) return;
      const accounts = loadAccounts();
      const account = accounts[user.username];
      if (!account) return;
      accounts[user.username] = { ...account, name: newName.trim() };
      saveAccounts(accounts);
      const updatedUser: AuthUser = { ...user, name: newName.trim() };
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        saveSession(updatedUser);
      } else {
        saveSession(updatedUser, true);
      }
      setUser(updatedUser);
    },
    [user],
  );

  const getSettings = useCallback((): UserSettings => {
    if (!user)
      return {
        theme: "system",
        autoLock: false,
        background: { type: "preset", value: "aurora" },
      };
    return loadSettings(user.username);
  }, [user]);

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
    isLoggedIn: !!user,
    hasSecurityQuestion,
    users,
    signUp,
    login,
    logout,
    getSecurityQuestion,
    resetPassword,
    changeSecurityQuestion,
    updateDisplayName,
    getSettings,
    updateSettings,
    loginWithPassword: login,
    updateSecurityQuestion: changeSecurityQuestion,
    currentUser: user ? { name: user.name, username: user.username } : null,
  };
}

// ─────────────────────────────────────────────────────────
// Admin helper functions
// ─────────────────────────────────────────────────────────

export function adminLoadAccounts(): Record<
  string,
  {
    username: string;
    name: string;
    securityQuestion: string;
    banned: boolean;
    createdAt: number;
  }
> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw) as Record<string, StoredAccount>;
    const result: Record<
      string,
      {
        username: string;
        name: string;
        securityQuestion: string;
        banned: boolean;
        createdAt: number;
      }
    > = {};
    for (const [k, v] of Object.entries(all)) {
      result[k] = {
        username: v.username ?? k,
        name: v.name,
        securityQuestion: v.securityQuestion || "",
        banned: v.banned ?? false,
        createdAt: v.createdAt ?? 0,
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

export function adminToggleBan(username: string): void {
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
  if (!accounts[username]) return;
  accounts[username] = {
    ...accounts[username],
    banned: !accounts[username].banned,
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
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
