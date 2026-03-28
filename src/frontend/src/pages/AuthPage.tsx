import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AuthPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-game-violet/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-game-red/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-game-green/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-game-violet to-game-red flex items-center justify-center shadow-2xl glow-violet">
            <span className="text-4xl">🎯</span>
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-4xl text-foreground tracking-tight">
              Color
            </h1>
            <h1 className="font-display font-bold text-4xl bg-gradient-to-r from-game-red via-game-violet to-game-green bg-clip-text text-transparent">
              Prediction
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Win big, play smart
            </p>
          </div>
        </div>

        {/* Color dots decoration */}
        <div className="flex gap-3">
          <div className="w-3 h-3 rounded-full bg-game-red animate-pulse" />
          <div
            className="w-3 h-3 rounded-full bg-game-violet animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-game-green animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </div>

        {/* Login Card */}
        <div className="game-card w-full p-6 flex flex-col gap-4">
          <p className="text-center text-muted-foreground text-sm">
            Login to play and win. Your funds are safe and secure.
          </p>
          <Button
            data-ocid="auth.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-12 font-display font-bold text-lg bg-gradient-to-r from-game-violet to-game-red hover:opacity-90 transition-opacity"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...
              </>
            ) : (
              "Login to Play"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By logging in, you agree to play responsibly.
        </p>
      </motion.div>
    </div>
  );
}
