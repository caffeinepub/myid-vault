import { useCallback, useEffect, useState } from "react";

const ACCOUNTS_KEY = "myid-vault-accounts";
const SESSION_KEY = "myid-vault-session";

export interface AuthUser {
  username: string;
  name: string;
}

interface StoredAccount {
  username: string;
  passwordHash: string;
  name: string;
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
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
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

  const signUp = useCallback(
    async (name: string, username: string, password: string): Promise<void> => {
      const accounts = loadAccounts();
      const key = username.toLowerCase();
      if (accounts[key]) {
        throw new Error("Username already taken. Please choose another.");
      }
      const passwordHash = await hashPassword(password);
      const account: StoredAccount = { username: key, passwordHash, name };
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
      const passwordHash = await hashPassword(password);
      if (passwordHash !== account.passwordHash) {
        throw new Error("Incorrect password. Please try again.");
      }
      const sessionUser: AuthUser = { username: key, name: account.name };
      saveSession(sessionUser);
      setUser(sessionUser);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    clearSession();
    setUser(null);
  }, []);

  return {
    user,
    isInitializing: appInitializing,
    signUp,
    loginWithPassword,
    logout,
  };
}
