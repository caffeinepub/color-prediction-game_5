import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownCircle, ArrowUpCircle, Coins, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateDeposit,
  useCreateWithdrawal,
  useMyDeposits,
  useMyWithdrawals,
  useUserBalance,
} from "../hooks/useQueries";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "pending"
      ? "badge-pending"
      : status === "approved" || status === "paid"
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

export default function WalletPage() {
  const { data: balance } = useUserBalance();
  const { data: deposits } = useMyDeposits();
  const { data: withdrawals } = useMyWithdrawals();
  const createDeposit = useCreateDeposit();
  const createWithdrawal = useCreateWithdrawal();

  const [depAmount, setDepAmount] = useState("");
  const [depUtr, setDepUtr] = useState("");
  const [depNote, setDepNote] = useState("");

  const [withAmount, setWithAmount] = useState("");
  const [withUpi, setWithUpi] = useState("");

  async function handleDeposit() {
    const amt = Number.parseInt(depAmount);
    if (Number.isNaN(amt) || amt < 10) {
      toast.error("Minimum deposit ₹10");
      return;
    }
    if (!depUtr.trim()) {
      toast.error("Enter UTR/Transaction ID");
      return;
    }
    try {
      await createDeposit.mutateAsync({
        amount: BigInt(amt),
        utr: depUtr.trim(),
        note: depNote.trim(),
      });
      toast.success("Deposit request submitted! Awaiting approval.");
      setDepAmount("");
      setDepUtr("");
      setDepNote("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit deposit");
    }
  }

  async function handleWithdrawal() {
    const amt = Number.parseInt(withAmount);
    if (Number.isNaN(amt) || amt < 100) {
      toast.error("Minimum withdrawal ₹100");
      return;
    }
    if (!withUpi.trim()) {
      toast.error("Enter UPI ID");
      return;
    }
    try {
      await createWithdrawal.mutateAsync({
        amount: BigInt(amt),
        upi: withUpi.trim(),
      });
      toast.success("Withdrawal request submitted!");
      setWithAmount("");
      setWithUpi("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit withdrawal");
    }
  }

  return (
    <div className="max-w-[430px] mx-auto w-full px-4 py-4 flex flex-col gap-4">
      {/* Balance Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-card p-5 text-center bg-gradient-to-br from-game-violet/20 to-game-red/20"
      >
        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
          Your Balance
        </p>
        <div className="flex items-center justify-center gap-2">
          <Coins size={24} className="text-yellow-400" />
          <span className="font-display font-bold text-4xl text-yellow-400">
            ₹{balance?.toString() ?? "0"}
          </span>
        </div>
      </motion.div>

      <Tabs defaultValue="deposit">
        <TabsList className="w-full bg-secondary">
          <TabsTrigger
            data-ocid="wallet.deposit.tab"
            value="deposit"
            className="flex-1 flex items-center gap-1"
          >
            <ArrowDownCircle size={14} /> Deposit
          </TabsTrigger>
          <TabsTrigger
            data-ocid="wallet.withdraw.tab"
            value="withdraw"
            className="flex-1 flex items-center gap-1"
          >
            <ArrowUpCircle size={14} /> Withdraw
          </TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit" className="flex flex-col gap-4 mt-4">
          {/* QR Code */}
          <div className="game-card p-4 flex flex-col items-center gap-3">
            <p className="font-display font-bold text-sm uppercase tracking-widest text-primary">
              Scan to Pay
            </p>
            <div className="rounded-xl overflow-hidden border-2 border-primary/40 shadow-lg glow-violet">
              <img
                src="/assets/uploads/img_20260328_115011-019d3414-49d1-7371-929a-403c3d0cb033-1.jpg"
                alt="UPI QR Code"
                className="w-56 h-56 object-contain bg-white"
              />
            </div>
            <p className="text-muted-foreground text-xs text-center">
              Scan QR, pay the amount, then fill the form below with your UTR.
            </p>
          </div>

          {/* Deposit Form */}
          <div className="game-card p-4 flex flex-col gap-3">
            <div>
              <Label
                htmlFor="dep-amount"
                className="text-sm text-muted-foreground"
              >
                Amount (₹)
              </Label>
              <Input
                id="dep-amount"
                data-ocid="wallet.deposit_amount.input"
                type="number"
                min={10}
                value={depAmount}
                onChange={(e) => setDepAmount(e.target.value)}
                className="mt-1 bg-secondary border-border"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <Label
                htmlFor="dep-utr"
                className="text-sm text-muted-foreground"
              >
                UTR / Transaction ID
              </Label>
              <Input
                id="dep-utr"
                data-ocid="wallet.deposit_utr.input"
                value={depUtr}
                onChange={(e) => setDepUtr(e.target.value)}
                className="mt-1 bg-secondary border-border"
                placeholder="12-digit UTR number"
              />
            </div>
            <div>
              <Label
                htmlFor="dep-note"
                className="text-sm text-muted-foreground"
              >
                Screenshot / Note
              </Label>
              <Textarea
                id="dep-note"
                data-ocid="wallet.deposit_note.textarea"
                value={depNote}
                onChange={(e) => setDepNote(e.target.value)}
                className="mt-1 bg-secondary border-border resize-none"
                placeholder="Optional note or screenshot description"
                rows={2}
              />
            </div>
            <Button
              data-ocid="wallet.deposit.submit_button"
              onClick={handleDeposit}
              disabled={createDeposit.isPending}
              className="w-full h-11 font-bold bg-game-green hover:bg-game-green/80"
            >
              {createDeposit.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Deposit"
              )}
            </Button>
          </div>

          {/* Deposit History */}
          <div className="game-card p-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-3">
              Deposit History
            </h3>
            {!deposits || deposits.length === 0 ? (
              <p
                data-ocid="deposits.empty_state"
                className="text-muted-foreground text-sm text-center py-3"
              >
                No deposits yet
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {deposits.map((d, i) => (
                  <div
                    key={d.id.toString()}
                    data-ocid={`deposits.item.${i + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        ₹{d.amount.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.utr}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="flex flex-col gap-4 mt-4">
          <div className="game-card p-4 flex flex-col gap-3">
            <div>
              <Label
                htmlFor="with-amount"
                className="text-sm text-muted-foreground"
              >
                Amount (₹)
              </Label>
              <Input
                id="with-amount"
                data-ocid="wallet.withdraw_amount.input"
                type="number"
                min={100}
                value={withAmount}
                onChange={(e) => setWithAmount(e.target.value)}
                className="mt-1 bg-secondary border-border"
                placeholder="Minimum ₹100"
              />
            </div>
            <div>
              <Label
                htmlFor="with-upi"
                className="text-sm text-muted-foreground"
              >
                UPI ID
              </Label>
              <Input
                id="with-upi"
                data-ocid="wallet.withdraw_upi.input"
                value={withUpi}
                onChange={(e) => setWithUpi(e.target.value)}
                className="mt-1 bg-secondary border-border"
                placeholder="yourname@upi"
              />
            </div>
            <Button
              data-ocid="wallet.withdraw.submit_button"
              onClick={handleWithdrawal}
              disabled={createWithdrawal.isPending}
              className="w-full h-11 font-bold bg-game-red hover:bg-game-red/80"
            >
              {createWithdrawal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Request Withdrawal"
              )}
            </Button>
          </div>

          {/* Withdrawal History */}
          <div className="game-card p-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-3">
              Withdrawal History
            </h3>
            {!withdrawals || withdrawals.length === 0 ? (
              <p
                data-ocid="withdrawals.empty_state"
                className="text-muted-foreground text-sm text-center py-3"
              >
                No withdrawals yet
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {withdrawals.map((w, i) => (
                  <div
                    key={w.id.toString()}
                    data-ocid={`withdrawals.item.${i + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        ₹{w.amount.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{w.upi}</p>
                    </div>
                    <StatusBadge status={w.status} />
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
