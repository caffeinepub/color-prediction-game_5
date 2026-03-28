import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Coins, Loader2, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Color, RoundStatus } from "../backend.d";
import {
  useActiveRound,
  useGameHistory,
  usePlaceBet,
  useUserBalance,
} from "../hooks/useQueries";

const COLOR_CONFIG = {
  [Color.red]: {
    label: "RED",
    bg: "bg-game-red",
    glow: "glow-red",
    text: "text-white",
    border: "border-game-red",
  },
  [Color.green]: {
    label: "GREEN",
    bg: "bg-game-green",
    glow: "glow-green",
    text: "text-white",
    border: "border-game-green",
  },
  [Color.violet]: {
    label: "VIOLET",
    bg: "bg-game-violet",
    glow: "glow-violet",
    text: "text-white",
    border: "border-game-violet",
  },
};

function useCountdown(endTimeNs: bigint | undefined) {
  const [seconds, setSeconds] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!endTimeNs) return;
    const update = () => {
      const nowMs = Date.now();
      const endMs = Number(endTimeNs / 1_000_000n);
      const remaining = Math.max(0, Math.floor((endMs - nowMs) / 1000));
      setSeconds((prev) => {
        if (prev !== remaining) setKey((k) => k + 1);
        return remaining;
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTimeNs]);

  return { seconds, key };
}

export default function GamePage() {
  const { data: balance } = useUserBalance();
  const { data: activeRound } = useActiveRound();
  const { data: history } = useGameHistory();
  const placeBet = usePlaceBet();
  const { seconds, key } = useCountdown(activeRound?.endTime);

  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [betAmount, setBetAmount] = useState("100");

  const canBet = activeRound && activeRound.status === RoundStatus.betting;

  async function handlePlaceBet() {
    if (!selectedColor) {
      toast.error("Select a color first!");
      return;
    }
    const amt = Number.parseInt(betAmount);
    if (Number.isNaN(amt) || amt < 10) {
      toast.error("Minimum bet is ₹10");
      return;
    }
    if (!activeRound) {
      toast.error("No active round");
      return;
    }
    try {
      await placeBet.mutateAsync({
        roundId: activeRound.id,
        color: selectedColor,
        amount: BigInt(amt),
      });
      toast.success(`Bet placed on ${selectedColor.toUpperCase()}!`);
      setSelectedColor(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to place bet");
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-display font-bold text-lg">
              Color Prediction
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
            <Coins size={14} className="text-yellow-400" />
            <span className="font-bold text-sm text-yellow-400">
              ₹{balance ? balance.toString() : "0"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Round Timer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-4 text-center"
        >
          {activeRound ? (
            <>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
                Round #{activeRound.id.toString()}
              </p>
              {canBet ? (
                <>
                  <p className="text-muted-foreground text-sm mb-1 flex items-center justify-center gap-1">
                    <Clock size={14} /> Time Remaining
                  </p>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={key}
                      initial={{ scale: 1.2, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`font-display font-bold text-5xl tabular-nums ${
                        seconds <= 10
                          ? "text-game-red"
                          : seconds <= 30
                            ? "text-yellow-400"
                            : "text-foreground"
                      }`}
                    >
                      {seconds}s
                    </motion.div>
                  </AnimatePresence>
                </>
              ) : (
                <div className="py-2">
                  <span className="text-muted-foreground">
                    Round{" "}
                    {activeRound.status === RoundStatus.closed
                      ? "Closed"
                      : "Resulted"}
                    {activeRound.result && (
                      <span
                        className={`ml-2 font-bold ${
                          activeRound.result === Color.red
                            ? "text-game-red"
                            : activeRound.result === Color.green
                              ? "text-game-green"
                              : "text-game-violet"
                        }`}
                      >
                        — {activeRound.result.toUpperCase()}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground py-2">
              Waiting for next round...
            </p>
          )}
        </motion.div>

        {/* Bet Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {([Color.red, Color.green, Color.violet] as Color[]).map((color) => {
            const cfg = COLOR_CONFIG[color];
            const isSelected = selectedColor === color;
            return (
              <button
                type="button"
                key={color}
                data-ocid={`game.${color}.button`}
                onClick={() => setSelectedColor(color)}
                disabled={!canBet}
                className={`bet-btn h-16 ${cfg.bg} ${cfg.text} ${
                  isSelected ? `${cfg.glow} scale-105` : "opacity-80"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {cfg.label}
                {isSelected && (
                  <motion.div
                    layoutId="selected-ring"
                    className={`absolute inset-0 rounded-xl border-2 ${cfg.border}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bet Amount */}
        <div className="game-card p-4 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground font-medium">
            Bet Amount (₹)
          </p>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map((amt) => (
              <button
                type="button"
                key={amt}
                data-ocid={`game.amount_${amt}.button`}
                onClick={() => setBetAmount(amt.toString())}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                  betAmount === amt.toString()
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
          <Input
            data-ocid="game.bet.input"
            type="number"
            min={10}
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="bg-secondary border-border text-center font-bold text-lg h-12"
            placeholder="Enter amount"
          />
          <Button
            data-ocid="game.place_bet.primary_button"
            onClick={handlePlaceBet}
            disabled={!canBet || placeBet.isPending || !selectedColor}
            className="w-full h-12 font-display font-bold text-lg bg-gradient-to-r from-game-violet to-game-red hover:opacity-90 disabled:opacity-30"
          >
            {placeBet.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing...
              </>
            ) : selectedColor ? (
              `Bet on ${COLOR_CONFIG[selectedColor].label} — ₹${betAmount}`
            ) : (
              "Select a Color"
            )}
          </Button>
        </div>

        {/* Game History */}
        <div className="game-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="font-display font-bold text-sm uppercase tracking-widest">
              Game History
            </h2>
          </div>
          {!history || history.length === 0 ? (
            <p
              data-ocid="history.empty_state"
              className="text-muted-foreground text-sm text-center py-4"
            >
              No rounds yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.slice(0, 10).map((round, i) => (
                <div
                  key={round.id.toString()}
                  data-ocid={`history.item.${i + 1}`}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-muted-foreground text-sm">
                    Round #{round.id.toString()}
                  </span>
                  {round.result ? (
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        round.result === Color.red
                          ? "bg-game-red/20 text-game-red"
                          : round.result === Color.green
                            ? "bg-game-green/20 text-game-green"
                            : "bg-game-violet/20 text-game-violet"
                      }`}
                    >
                      {round.result.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {round.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
