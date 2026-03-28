import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  useAllDeposits,
  useAllWithdrawals,
  useApproveDeposit,
  useMarkWithdrawalPaid,
  useRejectDeposit,
  useRejectWithdrawal,
} from "../hooks/useQueries";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "pending"
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : status === "approved" || status === "paid"
        ? "bg-green-100 text-green-700 border-green-300"
        : "bg-red-100 text-red-700 border-red-300";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export default function AdminPage() {
  const { data: allDeposits } = useAllDeposits();
  const { data: allWithdrawals } = useAllWithdrawals();

  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();
  const markPaid = useMarkWithdrawalPaid();
  const rejectWithdrawal = useRejectWithdrawal();

  return (
    <div className="max-w-[430px] mx-auto w-full px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 py-1">
        <Zap size={18} className="text-primary" />
        <h1 className="font-display font-bold text-xl">Admin Panel</h1>
      </div>

      <Tabs defaultValue="deposits">
        <TabsList className="w-full bg-white border border-gray-200 grid grid-cols-2">
          <TabsTrigger value="deposits" className="text-sm font-bold">
            Deposits
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-sm font-bold">
            Withdrawals
          </TabsTrigger>
        </TabsList>

        {/* Deposits */}
        <TabsContent value="deposits" className="mt-4">
          <div className="game-card p-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
              All Deposits
            </h3>
            {!allDeposits || allDeposits.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No deposits yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {[...allDeposits].reverse().map((d, _i) => (
                  <div
                    key={d.id.toString()}
                    className="bg-secondary rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-base">
                          ₹{d.amount.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          UTR: {d.utr}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {d.user.toString().slice(0, 16)}...
                        </p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    {d.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await approveDeposit.mutateAsync(d.id);
                              toast.success("Deposit approved!");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-green hover:bg-game-green/80 text-white text-xs font-bold h-9"
                        >
                          <CheckCircle size={13} className="mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await rejectDeposit.mutateAsync(d.id);
                              toast.success("Deposit rejected.");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-red hover:bg-game-red/80 text-white text-xs font-bold h-9"
                        >
                          <XCircle size={13} className="mr-1" /> Reject
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
              <p className="text-muted-foreground text-sm text-center py-6">
                No withdrawals yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {[...allWithdrawals].reverse().map((w, _i) => (
                  <div
                    key={w.id.toString()}
                    className="bg-secondary rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-base">
                          ₹{w.amount.toString()}
                        </p>
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
                          size="sm"
                          onClick={async () => {
                            try {
                              await markPaid.mutateAsync(w.id);
                              toast.success("Marked as paid!");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-green hover:bg-game-green/80 text-white text-xs font-bold h-9"
                        >
                          <CheckCircle size={13} className="mr-1" /> Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await rejectWithdrawal.mutateAsync(w.id);
                              toast.success("Withdrawal rejected.");
                            } catch (e: any) {
                              toast.error(e?.message || "Error");
                            }
                          }}
                          className="flex-1 bg-game-red hover:bg-game-red/80 text-white text-xs font-bold h-9"
                        >
                          <XCircle size={13} className="mr-1" /> Reject
                        </Button>
                      </div>
                    )}
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
