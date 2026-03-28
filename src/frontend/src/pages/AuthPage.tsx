import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Eye, EyeOff, Loader2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Tab = "phone" | "email";

export default function AuthPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [tab, setTab] = useState<Tab>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <div
        className="relative flex flex-col pb-8 pt-4 px-4"
        style={{
          background:
            "linear-gradient(160deg, #f87171 0%, #ef4444 60%, #dc2626 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-xs">OK</span>
            </div>
            <span className="text-white font-bold text-lg">ColorWin</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
            <span className="text-lg">🇮🇳</span>
            <span className="text-white text-xs font-semibold">EN</span>
          </div>
        </div>
        <h1 className="text-white font-bold text-3xl mb-1">Log in</h1>
        <p className="text-white/80 text-sm leading-snug">
          Please log in with your phone number
          <br />
          If you forget your password, please contact customer service
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-sm font-semibold transition-colors ${
            tab === "phone"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400"
          }`}
        >
          <Phone className="w-5 h-5" />
          phone number
        </button>
        <button
          type="button"
          onClick={() => setTab("email")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-sm font-semibold transition-colors ${
            tab === "email"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400"
          }`}
        >
          <Mail className="w-5 h-5" />
          Email Login
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5 p-5 bg-[#f5f5f5] flex-1">
        {/* Phone number */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
              <Phone className="w-4 h-4 text-red-500" />
            </div>
            <span className="font-semibold text-gray-800 text-base">
              Phone number
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-3 text-gray-600 font-medium text-sm">
              +91
              <ChevronLeft className="w-4 h-4 rotate-[-90deg] text-gray-400" />
            </div>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Please enter the phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="flex-1 bg-white border border-gray-200 rounded-xl h-12 text-base placeholder:text-gray-400 focus-visible:ring-red-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-lg">🔒</span>
            </div>
            <span className="font-semibold text-gray-800 text-base">
              Password
            </span>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl h-12 text-base placeholder:text-gray-400 pr-12 focus-visible:ring-red-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember password */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRemember(!remember)}
            onKeyDown={(e) => e.key === "Enter" && setRemember(!remember)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              remember ? "bg-red-500 border-red-500" : "border-gray-300"
            }`}
            aria-pressed={remember}
          >
            {remember && <div className="w-2 h-2 rounded-full bg-white" />}
          </button>
          <span className="text-gray-500 text-sm">Remember password</span>
        </div>

        {/* Login button */}
        <Button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full rounded-full text-white font-bold text-lg py-3 h-auto"
          style={{ background: "linear-gradient(90deg, #f87171, #dc2626)" }}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>

        {/* Register button */}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-2 border-red-400 text-red-500 font-bold text-lg py-3 h-auto bg-white hover:bg-red-50"
          onClick={login}
          disabled={isLoggingIn}
        >
          Register
        </Button>

        {/* Bottom links */}
        <div className="flex justify-center gap-12 mt-4">
          <button type="button" className="flex flex-col items-center gap-1">
            <span className="text-3xl">🔒</span>
            <span className="text-gray-500 text-xs">Forgot password</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <span className="text-3xl">💬</span>
            <span className="text-gray-500 text-xs">Customer Serv.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
