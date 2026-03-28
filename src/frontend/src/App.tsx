import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import BottomNav from "./components/BottomNav";
import { usePhoneAuth } from "./hooks/usePhoneAuth";
import { useIsAdmin, useRegisterUser } from "./hooks/useQueries";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import GamePage from "./pages/GamePage";
import HomePage from "./pages/HomePage";
import WalletPage from "./pages/WalletPage";

export type Page = "home" | "game" | "wallet" | "admin" | "account";

export default function App() {
  const { identity, isInitializing } = usePhoneAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { data: isAdmin } = useIsAdmin();
  const registerUser = useRegisterUser();
  const mutate = registerUser.mutate;
  const prevIdentityRef = useRef<typeof identity>(undefined);

  useEffect(() => {
    if (identity && !prevIdentityRef.current) {
      setCurrentPage("home");
      mutate();
    }
    prevIdentityRef.current = identity;
  }, [identity, mutate]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <AuthPage />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        {currentPage === "home" && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === "game" && (
          <GamePage onBack={() => setCurrentPage("home")} />
        )}
        {currentPage === "wallet" && <WalletPage />}
        {currentPage === "admin" && isAdmin && <AdminPage />}
        {currentPage === "account" && <AccountPage />}
      </main>
      <BottomNav
        current={currentPage}
        onChange={setCurrentPage}
        isAdmin={!!isAdmin}
      />
      <Toaster />
    </div>
  );
}
