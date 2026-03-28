import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useRegisterUser } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import GamePage from "./pages/GamePage";
import WalletPage from "./pages/WalletPage";

export type Page = "game" | "wallet" | "admin";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("game");
  const { data: isAdmin } = useIsAdmin();
  const registerUser = useRegisterUser();
  const mutate = registerUser.mutate;

  useEffect(() => {
    if (identity) {
      mutate();
    }
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
        {currentPage === "game" && <GamePage />}
        {currentPage === "wallet" && <WalletPage />}
        {currentPage === "admin" && isAdmin && <AdminPage />}
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
