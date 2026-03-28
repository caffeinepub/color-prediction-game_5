import { Button } from "@/components/ui/button";
import { LogOut, Phone, Wallet } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserBalance } from "../hooks/useQueries";

export default function AccountPage() {
  const { clear, identity } = useInternetIdentity();
  const { data: balance } = useUserBalance();
  const balanceDisplay =
    balance !== undefined ? (Number(balance) / 100).toFixed(2) : "0.00";

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortId = principalStr ? `${principalStr.slice(0, 12)}...` : "Unknown";

  return (
    <div className="min-h-dvh bg-gray-50">
      <div
        className="p-6 pb-10 text-white"
        style={{
          background:
            "linear-gradient(160deg, hsl(8 86% 61%) 0%, hsl(8 86% 45%) 100%)",
        }}
      >
        <h1 className="text-xl font-bold mb-1">My Account</h1>
        <p className="text-white/80 text-sm">Manage your profile</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ background: "hsl(8 86% 61%)" }}
            >
              U
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">User</p>
              <p
                className="text-gray-400 font-mono"
                style={{ fontSize: "10px" }}
              >
                {shortId}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "hsl(142 71% 93%)" }}
          >
            <Wallet className="w-5 h-5" style={{ color: "hsl(142 71% 40%)" }} />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Current Balance</p>
            <p className="font-bold text-gray-800 text-xl">₹{balanceDisplay}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "hsl(8 86% 95%)" }}
          >
            <Phone className="w-5 h-5" style={{ color: "hsl(8 86% 61%)" }} />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Principal ID</p>
            <p className="font-bold text-gray-800 text-sm">{shortId}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-semibold"
          onClick={clear}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
