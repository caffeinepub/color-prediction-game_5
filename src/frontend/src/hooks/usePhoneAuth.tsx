import type { Identity } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const ACCOUNTS_KEY = "cw_accounts";
const SESSION_KEY = "cw_session";

async function deriveIdentity(
  phone: string,
  password: string,
): Promise<Ed25519KeyIdentity> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`colorwin:${phone}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const seed = new Uint8Array(hashBuffer);
  return Ed25519KeyIdentity.generate(seed);
}

async function hashPassword(phone: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`cw_pwd:${phone}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getAccounts(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, string>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

interface PhoneAuthContextType {
  identity: Identity | undefined;
  isInitializing: boolean;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  registerWithPhone: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const PhoneAuthContext = createContext<PhoneAuthContextType>({
  identity: undefined,
  isInitializing: true,
  loginWithPhone: async () => {},
  registerWithPhone: async () => {},
  logout: () => {},
});

export function PhoneAuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        if (session?.phone && session?.passwordHash) {
          const accounts = getAccounts();
          if (accounts[session.phone] === session.passwordHash) {
            const id = await deriveIdentity(
              session.phone,
              session.passwordHash,
            );
            setIdentity(id);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, []);

  async function loginWithPhone(phone: string, password: string) {
    const accounts = getAccounts();
    const pwdHash = await hashPassword(phone, password);
    if (!accounts[phone]) {
      throw new Error("Account not found. Please register first.");
    }
    if (accounts[phone] !== pwdHash) {
      throw new Error("Incorrect password.");
    }
    const id = await deriveIdentity(phone, pwdHash);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ phone, passwordHash: pwdHash }),
    );
    setIdentity(id);
  }

  async function registerWithPhone(phone: string, password: string) {
    const accounts = getAccounts();
    if (accounts[phone]) {
      throw new Error("Account already exists. Please log in.");
    }
    const pwdHash = await hashPassword(phone, password);
    accounts[phone] = pwdHash;
    saveAccounts(accounts);
    const id = await deriveIdentity(phone, pwdHash);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ phone, passwordHash: pwdHash }),
    );
    setIdentity(id);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setIdentity(undefined);
  }

  return (
    <PhoneAuthContext.Provider
      value={{
        identity,
        isInitializing,
        loginWithPhone,
        registerWithPhone,
        logout,
      }}
    >
      {children}
    </PhoneAuthContext.Provider>
  );
}

export function usePhoneAuth() {
  return useContext(PhoneAuthContext);
}
