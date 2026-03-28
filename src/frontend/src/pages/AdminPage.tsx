import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Loader2, Play, Square, XCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { Color, RoundStatus } from "../backend.d";
import {
  useActiveRound,
  useAllBets,
  useAllDeposits,
  useAllWithdrawals,
  useApproveDeposit,
  useCloseRound,
  useMarkWithdrawalPaid,
  useRejectDeposit,
  useRejectWithdrawal,
  useSetRoundResult,
  useStartNewRound,
} from "../hooks/useQueries";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "pending"
      ? "badge-pending"
      : status === "approved" || status === "paid"
        ? "badge-approved"
        : status === "open"
          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          : status === "won"
            ? "badge-approved"
            : "badge-rejected";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export default function AdminPage() {
  const { data: activeRound } = useActiveRound();
  const { data: allDeposits } = useAllDeposits();
  const { data: allWithdrawals } = useAllWithdrawals();
  const { data: allBets } = useAllBets();

  const startRound = useStartNewRound();
  const setResult = useSetRoundResult();
  const closeRound = useCloseRound();
  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();
  const markPaid = useMarkWithdrawalPaid();
  const rejectWithdrawal = useRejectWithdrawal();

  async function handleStartRound() {
    try {
      await startRound.mutateAsync();
      toast.success("New round started!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to start round");
    }
  }

  async function handleSetResult(color: Color) {
    if (!activeRound) return;
    try {
      await setResult.mutateAsync({ roundId: activeRound.id, result: color });
      toast.success(`Result set to ${color.toUpperCase()}!`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to set result");
    }
  }

  async function handleCloseRound() {
    if (!activeRound) return;
    try {
      await closeRound.mutateAsync(activeRound.id);
      toast.success("Round closed!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to close round");
    }
  }

  return (
    <div className="max-w-[430px] mx-auto w-full px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 py-1">
        <Zap size={18} className="text-primary" />
        <h1 className="font-display font-bold text-xl">Admin Panel</h1>
      </div>

      <Tabs defaultValue="game">
        <TabsList className="w-full bg-secondary grid grid-cols-4">
          <TabsTrigger
            data-ocid="admin.game.tab"
            value="game"
            className="text-xs"
          >
            Game
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.deposits.tab"
            value="deposits"
            className="text-xs"
          >
            Deposits
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.withdrawals.tab"
            value="withdrawals"
            className="text-xs"
          >
            Withdrawals
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.bets.tab"
            value="bets"
            className="text-xs"
          >
            Bets
          </TabsTrigger>
        </TabsList>

        {/* Game Control */}
        <TabsContent value="game" className="flex flex-col gap-3 mt-4">
          <div className="game-card p-4 flex flex-col gap-3">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
              Active Round
            </h3>
            {activeRound ? (
              <div className="bg-secondary rounded-xl p-3">
                <p className="font-bold">Round #{activeRound.id.toString()}</p>
                <p className="text-muted-foreground text-sm">
                  Status:{" "}
                  <span className="text-foreground capitalize">
                    {activeRound.status}
                  </span>
                </p>
                {activeRound.result && (
                  <p className="text-sm">
                    Result:{" "}
                    <span className="font-bold">
                      {activeRound.result.toUpperCase()}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p
                data-ocid="admin.round.empty_state"
                className="text-muted-foreground text-sm"
              >
                No active round
              </p>
            )}

            <Button
              data-ocid="admin.start_round.primary_button"
              onClick={handleStartRound}
              disabled={
                startRound.isPending ||
                !!(activeRound && activeRound.status === RoundStatus.betting)
              }
              className="w-full bg-game-green hover:bg-game-green/80 font-bold"
            >
              {startRound.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" /> Start New Round
                </>
              )}
            </Button>

            {activeRound && activeRound.status !== RoundStatus.closed && (
              <Button
                data-ocid="admin.close_round.button"
                onClick={handleCloseRound}
                disabled={closeRound.isPending}
                variant="outline"
                className="w-full font-bold"
              >
                {closeRound.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Closing...
                  </>
                ) : (
                  <>
                    <Square size={16} className="mr-2" /> Close Round
                  </>
                )}
              </Button>
            )}
          </div>

          {activeRound && activeRound.status === RoundStatus.closed && (
            <div className="game-card p-4 flex flex-col gap-3">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                Set Result
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  data-ocid="admin.result_red.button"
                  onClick={() => handleSetResult(Color.red)}
                  disabled={setResult.isPending}
                  className="bet-btn h-12 bg-game-red text-white disabled:opacity-50"
                >
                  RED
                </button>
                <button
                  type="button"
                  data-ocid="admin.result_green.button"
                  onClick={() => handleSetResult(Color.green)}
                  disabled={setResult.isPending}
                  className="bet-btn h-12 bg-game-green text-white disabled:opacity-50"
                >
                  GREEN
                </button>
                <button
                  type="button"
                  data-ocid="admin.result_violet.button"
                  onClick={() => handleSetResult(Color.violet)}
                  disabled={setResult.isPending}
                  className="bet-btn h-12 bg-game-violet text-white disabled:opacity-50"
                >
                  VIOLET
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Deposits */}
        <TabsContent value="deposits" className="mt-4">
          <div className="game-card p-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
              All Deposits
            </h3>
            {!allDeposits || allDeposits.length === 0 ? (
              <p
                data-ocid="admin.deposits.empty_state"
                className="text-muted-foreground text-sm text-center py-4"
              >
                No deposits
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {allDeposits.map((d, i) => (
                  <div
                    key={d.id.toString()}
                    data-ocid={`admin.deposits.item.${i + 1}`}
                    className="bg-secondary rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">₹{d.amount.toString()}</p>
                        <p className="text-xs text-muted-foreground">
                          UTR: {d.utr}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {d.user.toString().slice(0, 16)}...
                        </p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    {d.screenshot && (
                      <p className="text-xs text-muted-foreground italic">
                        {d.screenshot}
                      </p>
                    )}
                    {d.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`admin.deposits.approve_button.${i + 1}`}
                          size="sm"
                          onClick={async () => {
                            try {
                              await approveDeposit.mutateAsync(d.id);
                              toast.success("Deposit approved!");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-green hover:bg-game-green/80 text-xs font-bold h-8"
                        >
                          <CheckCircle size={12} className="mr-1" /> Approve
                        </Button>
                        <Button
                          data-ocid={`admin.deposits.reject_button.${i + 1}`}
                          size="sm"
                          onClick={async () => {
                            try {
                              await rejectDeposit.mutateAsync(d.id);
                              toast.success("Deposit rejected.");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-red hover:bg-game-red/80 text-xs font-bold h-8"
                        >
                          <XCircle size={12} className="mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Withdrawals */}
        <TabsContent value="withdrawals" className="mt-4">
          <div className="game-card p-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
              All Withdrawals
            </h3>
            {!allWithdrawals || allWithdrawals.length === 0 ? (
              <p
                data-ocid="admin.withdrawals.empty_state"
                className="text-muted-foreground text-sm text-center py-4"
              >
                No withdrawals
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {allWithdrawals.map((w, i) => (
                  <div
                    key={w.id.toString()}
                    data-ocid={`admin.withdrawals.item.${i + 1}`}
                    className="bg-secondary rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">₹{w.amount.toString()}</p>
                        <p className="text-xs text-muted-foreground">
                          UPI: {w.upi}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {w.user.toString().slice(0, 16)}...
                        </p>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                    {w.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`admin.withdrawals.paid_button.${i + 1}`}
                          size="sm"
                          onClick={async () => {
                            try {
                              await markPaid.mutateAsync(w.id);
                              toast.success("Marked as paid!");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-green hover:bg-game-green/80 text-xs font-bold h-8"
                        >
                          <CheckCircle size={12} className="mr-1" /> Mark Paid
                        </Button>
                        <Button
                          data-ocid={`admin.withdrawals.reject_button.${i + 1}`}
                          size="sm"
                          onClick={async () => {
                            try {
                              await rejectWithdrawal.mutateAsync(w.id);
                              toast.success("Withdrawal rejected.");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-red hover:bg-game-red/80 text-xs font-bold h-8"
                        >
                          <XCircle size={12} className="mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* All Bets */}
        <TabsContent value="bets" className="mt-4">
          <div className="game-card p-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
              All Bets
            </h3>
            {!allBets || allBets.length === 0 ? (
              <p
                data-ocid="admin.bets.empty_state"
                className="text-muted-foreground text-sm text-center py-4"
              >
                No bets yet
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {allBets.map((b, i) => (
                  <div
                    key={b.id.toString()}
                    data-ocid={`admin.bets.item.${i + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            b.color === Color.red
                              ? "bg-game-red"
                              : b.color === Color.green
                                ? "bg-game-green"
                                : "bg-game-violet"
                          }`}
                        />
                        <span className="text-sm font-bold">
                          ₹{b.amount.toString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Round #{b.roundId.toString()}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
