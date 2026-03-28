import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowLeft, Clock, HelpCircle } from "lucide-react";
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

const DURATION_TABS = [
  { label: "WinGo 30s", value: 30 },
  { label: "WinGo 1Min", value: 60 },
  { label: "WinGo 3Min", value: 180 },
  { label: "WinGo 5Min", value: 300 },
];

const MULTIPLIERS = [1, 5, 10, 20, 50, 100];
const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100, 200, 500];

// WinGo color rules
type BallColor = "red" | "green" | "rv" | "gv";
function getBallColor(n: number): BallColor {
  if (n === 0) return "rv";
  if (n === 5) return "gv";
  if ([1, 3, 7, 9].includes(n)) return "green";
  return "red";
}

function mapNumberToColor(n: number): Color {
  if (n === 0 || n === 5) return Color.violet;
  if ([1, 3, 7, 9].includes(n)) return Color.green;
  return Color.red;
}

type BetTarget =
  | { type: "color"; color: Color; label: string }
  | { type: "number"; number: number }
  | { type: "size"; size: "big" | "small" };

function getBetColor(target: BetTarget): Color {
  if (target.type === "color") return target.color;
  if (target.type === "number") return mapNumberToColor(target.number);
  return target.size === "big" ? Color.red : Color.green;
}

function getBetLabel(target: BetTarget): string {
  if (target.type === "color") return target.label;
  if (target.type === "number") return `Number ${target.number}`;
  return target.size === "big" ? "Big" : "Small";
}

function getBetBgClass(target: BetTarget): string {
  if (target.type === "color") {
    if (target.color === Color.green) return "bg-game-green";
    if (target.color === Color.violet) return "bg-game-violet";
    return "bg-game-red";
  }
  if (target.type === "number") {
    const c = getBallColor(target.number);
    if (c === "rv") return "bg-game-red";
    if (c === "gv") return "bg-game-green";
    if (c === "green") return "bg-game-green";
    return "bg-game-red";
  }
  return target.size === "big" ? "bg-orange-500" : "bg-blue-500";
}

function useCountdown(endTimeNs: bigint | undefined) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!endTimeNs) return;
    const update = () => {
      const nowMs = Date.now();
      const endMs = Number(endTimeNs / 1_000_000n);
      setSeconds(Math.max(0, Math.floor((endMs - nowMs) / 1000)));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTimeNs]);
  return seconds;
}

function NumberBall({
  n,
  onClick,
  disabled,
}: { n: number; onClick: () => void; disabled: boolean }) {
  const c = getBallColor(n);
  let cls = "number-ball ";
  if (c === "rv") cls += "number-ball-rv";
  else if (c === "gv") cls += "number-ball-gv";
  else if (c === "green") cls += "bg-game-green";
  else cls += "bg-game-red";

  return (
    <button
      type="button"
      className={`${cls} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {n}
    </button>
  );
}

function ColorDot({ color }: { color: Color }) {
  const cls =
    color === Color.red
      ? "bg-game-red"
      : color === Color.green
        ? "bg-game-green"
        : "bg-game-violet";
  return <span className={`inline-block w-3 h-3 rounded-full ${cls}`} />;
}

interface GamePageProps {
  onBack: () => void;
}

export default function GamePage({ onBack }: GamePageProps) {
  const { data: balance } = useUserBalance();
  const { data: activeRound } = useActiveRound();
  const { data: history } = useGameHistory();
  const placeBet = usePlaceBet();
  const seconds = useCountdown(activeRound?.endTime);

  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);
  const [betTarget, setBetTarget] = useState<BetTarget | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState("game");

  const canBet = activeRound && activeRound.status === RoundStatus.betting;

  function openBet(target: BetTarget) {
    if (!canBet) {
      toast.error("No active betting round");
      return;
    }
    setBetTarget(target);
    setSheetOpen(true);
  }

  async function handleConfirmBet() {
    if (!betTarget || !activeRound) return;
    const totalAmt = betAmount * selectedMultiplier;
    if (totalAmt < 1) {
      toast.error("Minimum bet is ₹1");
      return;
    }
    const color = getBetColor(betTarget);
    try {
      await placeBet.mutateAsync({
        roundId: activeRound.id,
        color,
        amount: BigInt(totalAmt),
      });
      toast.success(`Bet placed: ${getBetLabel(betTarget)} — ₹${totalAmt}`);
      setSheetOpen(false);
      setBetTarget(null);
      setBetAmount(10);
    } catch (e: any) {
      toast.error(e?.message || "Failed to place bet");
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col bg-background min-h-dvh">
      {/* Duration Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[430px] mx-auto">
          {/* Back button row */}
          <div className="flex items-center px-2 pt-2">
            <button
              type="button"
              data-ocid="game.back.button"
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
              <span>Home</span>
            </button>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide">
            {DURATION_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                data-ocid={`game.duration_${tab.value}.tab`}
                onClick={() => setSelectedDuration(tab.value)}
                className={`flex items-center gap-1 px-3 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  selectedDuration === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <Clock size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto w-full px-3 py-3 flex flex-col gap-3">
        {/* Game Info Bar */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-red-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid="game.how_to_play.button"
                  className="bg-white/20 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                >
                  <HelpCircle size={10} /> How to play
                </button>
              </div>
              <p className="text-sm font-bold opacity-90">
                {DURATION_TABS.find((t) => t.value === selectedDuration)?.label}
              </p>
              {/* Last results - color dots */}
              <div className="flex gap-1">
                {(history || []).slice(0, 5).map((r, _i) => (
                  <div
                    key={r.id.toString()}
                    className={`w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center text-[9px] font-bold ${
                      r.result === Color.red
                        ? "bg-game-red"
                        : r.result === Color.green
                          ? "bg-game-green"
                          : "bg-game-violet"
                    }`}
                  >
                    {r.result ? r.result[0].toUpperCase() : "?"}
                  </div>
                ))}
                {(!history || history.length === 0) && (
                  <span className="text-xs opacity-70">No history yet</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs opacity-80 mb-1">Time Remaining</p>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={seconds}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`font-display font-black text-4xl tabular-nums ${
                    seconds <= 10 ? "text-yellow-300" : "text-white"
                  }`}
                >
                  {mm}:{ss}
                </motion.div>
              </AnimatePresence>
              {activeRound && (
                <p className="text-[9px] opacity-60 mt-1 font-mono">
                  {activeRound.id.toString().slice(-12)}
                </p>
              )}
              {!activeRound && <p className="text-xs opacity-70">Waiting...</p>}
            </div>
          </div>
        </div>

        {/* Color Bet Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            data-ocid="game.green.button"
            onClick={() =>
              openBet({ type: "color", color: Color.green, label: "Green" })
            }
            disabled={!canBet}
            className="bet-btn h-14 bg-game-green text-white text-base disabled:opacity-40"
          >
            Green
          </button>
          <button
            type="button"
            data-ocid="game.violet.button"
            onClick={() =>
              openBet({ type: "color", color: Color.violet, label: "Violet" })
            }
            disabled={!canBet}
            className="bet-btn h-14 bg-game-violet text-white text-base disabled:opacity-40"
          >
            Violet
          </button>
          <button
            type="button"
            data-ocid="game.red.button"
            onClick={() =>
              openBet({ type: "color", color: Color.red, label: "Red" })
            }
            disabled={!canBet}
            className="bet-btn h-14 bg-game-red text-white text-base disabled:opacity-40"
          >
            Red
          </button>
        </div>

        {/* Number Balls */}
        <div className="game-card p-4">
          <div className="grid grid-cols-5 gap-2 justify-items-center">
            {[0, 1, 2, 3, 4].map((n) => (
              <NumberBall
                key={n}
                n={n}
                onClick={() => openBet({ type: "number", number: n })}
                disabled={!canBet}
              />
            ))}
            {[5, 6, 7, 8, 9].map((n) => (
              <NumberBall
                key={n}
                n={n}
                onClick={() => openBet({ type: "number", number: n })}
                disabled={!canBet}
              />
            ))}
          </div>
        </div>

        {/* Multiplier Row */}
        <div className="game-card p-3">
          <p className="text-xs text-muted-foreground mb-2">Multiplier</p>
          <div className="flex gap-1.5 flex-wrap">
            {MULTIPLIERS.map((m) => (
              <button
                key={m}
                type="button"
                data-ocid={`game.multiplier_${m}.toggle`}
                onClick={() => setSelectedMultiplier(m)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  selectedMultiplier === m
                    ? "bg-game-green text-white border-game-green"
                    : "bg-white text-gray-600 border-gray-300 hover:border-game-green"
                }`}
              >
                {m === 1 ? "X1" : `X${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* Big / Small Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            data-ocid="game.big.button"
            onClick={() => openBet({ type: "size", size: "big" })}
            disabled={!canBet}
            className="bet-btn h-14 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-base disabled:opacity-40"
          >
            Big
          </button>
          <button
            type="button"
            data-ocid="game.small.button"
            onClick={() => openBet({ type: "size", size: "small" })}
            disabled={!canBet}
            className="bet-btn h-14 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-base disabled:opacity-40"
          >
            Small
          </button>
        </div>

        {/* History Tabs */}
        <div className="game-card overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["game", "chart", "my"].map((t) => (
              <button
                key={t}
                type="button"
                data-ocid={`game.history_${t}.tab`}
                onClick={() => setHistoryTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                  historyTab === t
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400"
                }`}
              >
                {t === "game"
                  ? "Game History"
                  : t === "chart"
                    ? "Chart"
                    : "My History"}
              </button>
            ))}
          </div>
          <div className="p-3">
            {historyTab === "game" &&
              (!history || history.length === 0 ? (
                <p
                  data-ocid="history.empty_state"
                  className="text-center text-muted-foreground text-sm py-6"
                >
                  No rounds yet
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Period</th>
                      <th className="text-center pb-2 font-medium">Number</th>
                      <th className="text-center pb-2 font-medium">
                        Big/Small
                      </th>
                      <th className="text-center pb-2 font-medium">Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 10).map((round, i) => {
                      const resultNum =
                        round.result === Color.green
                          ? 1
                          : round.result === Color.red
                            ? 2
                            : 0;
                      const isBig = resultNum >= 5;
                      return (
                        <tr
                          key={round.id.toString()}
                          data-ocid={`history.item.${i + 1}`}
                          className="border-b border-gray-50"
                        >
                          <td className="py-2 text-gray-500 font-mono">
                            {round.id.toString().slice(-8)}
                          </td>
                          <td className="py-2 text-center">
                            {round.result ? (
                              <span
                                className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-white font-bold ${
                                  round.result === Color.red
                                    ? "bg-game-red"
                                    : round.result === Color.green
                                      ? "bg-game-green"
                                      : "bg-game-violet"
                                }`}
                              >
                                {resultNum}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {round.result ? (
                              <span
                                className={`text-xs font-bold ${isBig ? "text-orange-500" : "text-blue-500"}`}
                              >
                                {isBig ? "Big" : "Small"}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {round.result ? (
                              <ColorDot color={round.result} />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            {historyTab === "chart" && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Chart view coming soon
              </div>
            )}
            {historyTab === "my" && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Login to see your bet history
              </div>
            )}
          </div>
        </div>

        <footer className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
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

      {/* Bet Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-w-[430px] mx-auto"
          data-ocid="game.bet.sheet"
        >
          <SheetHeader>
            <SheetTitle className="text-left">
              {betTarget && (
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-bold ${betTarget ? getBetBgClass(betTarget) : ""}`}
                  >
                    {betTarget ? getBetLabel(betTarget) : ""}
                  </span>
                </span>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            {/* Balance */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance</span>
              <span className="font-bold text-game-green">
                ₹{balance?.toString() ?? "0"}
              </span>
            </div>

            {/* Quick amount chips */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Select Amount
              </p>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    data-ocid={`game.bet_amount_${amt}.button`}
                    onClick={() => setBetAmount(amt)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                      betAmount === amt
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier in sheet */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Multiplier</span>
              <span className="font-bold">X{selectedMultiplier}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <span className="font-medium">Total Bet</span>
              <span className="font-black text-lg text-game-green">
                ₹{betAmount * selectedMultiplier}
              </span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-ocid="game.bet.cancel_button"
                onClick={() => setSheetOpen(false)}
                className="py-3 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="game.bet.confirm_button"
                onClick={handleConfirmBet}
                disabled={placeBet.isPending}
                className="py-3 rounded-xl bg-game-green text-white font-bold text-sm disabled:opacity-50"
              >
                {placeBet.isPending ? "Placing..." : "Confirm Bet"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
