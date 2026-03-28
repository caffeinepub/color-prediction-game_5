import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { usePhoneAuth } from "../hooks/usePhoneAuth";

type Mode = "login" | "register";

export default function AuthPage() {
  const { loginWithPhone, registerWithPhone } = usePhoneAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode] = useState("1745415380860");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPhone(phone, password);
    } catch (e: any) {
      setError(e?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister() {
    setError("");
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Privacy Agreement.");
      return;
    }
    setIsLoading(true);
    try {
      await registerWithPhone(phone, password);
    } catch (e: any) {
      setError(e?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
  }

  if (mode === "register") {
    return (
      <div className="min-h-dvh flex flex-col bg-[#f0f1f5]">
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
              onClick={() => switchMode("login")}
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
          <h1 className="text-white font-bold text-3xl mb-1">Register</h1>
          <p className="text-white/80 text-sm">
            Please register by phone number or email
          </p>
        </div>

        {/* Tab */}
        <div className="bg-white flex justify-center">
          <button
            type="button"
            className="flex flex-col items-center gap-1 py-3 px-8 text-sm font-semibold text-red-500 border-b-2 border-red-500"
          >
            <Smartphone className="w-5 h-5" />
            Register your phone
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 p-5 flex-1">
          {/* Phone number */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-red-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-red-400" />
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
                data-ocid="auth.phone.input"
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

          {/* Set password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-red-100 flex items-center justify-center">
                <span className="text-red-400 text-base">🔒</span>
              </div>
              <span className="font-semibold text-gray-800 text-base">
                Set password
              </span>
            </div>
            <div className="relative">
              <Input
                data-ocid="auth.password.input"
                type={showPassword ? "text" : "password"}
                placeholder="Set password (min 6 characters)"
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

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-red-100 flex items-center justify-center">
                <span className="text-red-400 text-base">🔒</span>
              </div>
              <span className="font-semibold text-gray-800 text-base">
                Confirm password
              </span>
            </div>
            <div className="relative">
              <Input
                data-ocid="auth.confirm_password.input"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl h-12 text-base placeholder:text-gray-400 pr-12 focus-visible:ring-red-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Invite code */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-red-100 flex items-center justify-center">
                <span className="text-red-400 text-base">👤</span>
              </div>
              <span className="font-semibold text-gray-800 text-base">
                Invite code
              </span>
            </div>
            <Input
              type="text"
              value={inviteCode}
              readOnly
              className="bg-white border border-gray-200 rounded-xl h-12 text-base text-gray-700 focus-visible:ring-red-400"
            />
          </div>

          {/* Privacy agreement */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                agreed ? "bg-red-500 border-red-500" : "border-gray-300"
              }`}
              aria-pressed={agreed}
            >
              {agreed && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span className="text-gray-500 text-sm">
              I have read and agree{" "}
              <span className="text-red-500 font-medium">
                【Privacy Agreement】
              </span>
            </span>
          </div>

          {/* Error message */}
          {error && (
            <p
              data-ocid="auth.error_state"
              className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-3 py-2"
            >
              {error}
            </p>
          )}

          {/* Register button */}
          <Button
            data-ocid="auth.register.submit_button"
            type="button"
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full rounded-full text-white font-bold text-lg py-3 h-auto"
            style={{ background: "linear-gradient(90deg, #f87171, #dc2626)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>

          {/* Login link */}
          <Button
            data-ocid="auth.login.link"
            type="button"
            variant="outline"
            onClick={() => switchMode("login")}
            className="w-full rounded-full border border-gray-200 text-gray-600 font-medium text-base py-3 h-auto bg-white"
          >
            I have an account{" "}
            <span className="text-red-500 font-bold ml-1">Login</span>
          </Button>
        </div>
      </div>
    );
  }

  // Login mode
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
          className="flex-1 flex flex-col items-center gap-1 py-3 text-sm font-semibold text-red-500 border-b-2 border-red-500"
        >
          <Phone className="w-5 h-5" />
          phone number
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
              data-ocid="auth.phone.input"
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
              data-ocid="auth.password.input"
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
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              remember ? "bg-red-500 border-red-500" : "border-gray-300"
            }`}
            aria-pressed={remember}
          >
            {remember && <div className="w-2 h-2 rounded-full bg-white" />}
          </button>
          <span className="text-gray-500 text-sm">Remember password</span>
        </div>

        {/* Error message */}
        {error && (
          <p
            data-ocid="auth.error_state"
            className="text-red-500 text-sm text-center bg-red-50 rounded-xl px-3 py-2"
          >
            {error}
          </p>
        )}

        {/* Login button */}
        <Button
          data-ocid="auth.login.submit_button"
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full rounded-full text-white font-bold text-lg py-3 h-auto"
          style={{ background: "linear-gradient(90deg, #f87171, #dc2626)" }}
        >
          {isLoading ? (
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
          data-ocid="auth.register.link"
          type="button"
          variant="outline"
          className="w-full rounded-full border-2 border-red-400 text-red-500 font-bold text-lg py-3 h-auto bg-white hover:bg-red-50"
          onClick={() => switchMode("register")}
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
