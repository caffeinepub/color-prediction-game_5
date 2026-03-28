import { Button } from "@/components/ui/button";
import { LogOut, Phone, Shield, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePhoneAuth } from "../hooks/usePhoneAuth";
import { useUserBalance } from "../hooks/useQueries";

const ADMIN_PASSWORD = "colorwin@9999";

export default function AccountPage() {
  const { logout, identity } = usePhoneAuth();
  const { data: balance } = useUserBalance();
  const [token, setToken] = useState("");
  const [expanded, setExpanded] = useState(false);

  const isAdmin = localStorage.getItem("cw_is_admin") === "1";

  const balanceDisplay =
    balance !== undefined ? (Number(balance) / 100).toFixed(2) : "0.00";

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortId = principalStr ? `${principalStr.slice(0, 12)}...` : "Unknown";

  const handleClaimAdmin = () => {
    if (!token.trim()) return;
    if (token.trim() === ADMIN_PASSWORD) {
      localStorage.setItem("cw_is_admin", "1");
      toast.success("Admin access granted!");
      window.location.reload();
    } else {
      toast.error("Incorrect password.");
    }
  };

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

        {/* Admin Setup Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            data-ocid="account.admin_setup.toggle"
            className="w-full flex items-center justify-between p-5 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "hsl(8 86% 95%)" }}
              >
                <Shield
                  className="w-5 h-5"
                  style={{ color: "hsl(8 86% 61%)" }}
                />
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                {isAdmin ? "Admin Access (Active ✓)" : "Admin Access"}
              </span>
            </div>
            {!isAdmin && (
              <span className="text-gray-400 text-xs">
                {expanded ? "▲" : "▼"}
              </span>
            )}
          </button>

          {expanded && !isAdmin && (
            <div className="px-5 pb-5 space-y-3">
              <input
                data-ocid="account.admin_token.input"
                type="password"
                placeholder="Enter admin password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 bg-gray-50"
              />
              <button
                type="button"
                data-ocid="account.claim_admin.button"
                disabled={!token.trim()}
                onClick={handleClaimAdmin}
                className="w-full h-11 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(8 86% 61%) 0%, hsl(8 86% 45%) 100%)",
                }}
              >
                Claim Admin
              </button>
            </div>
          )}
        </div>

        <Button
          data-ocid="account.logout.button"
          variant="outline"
          className="w-full h-12 rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-semibold"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
