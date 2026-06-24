import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

type Step = "credentials" | "verification";

export default function AdminLogin() {
  const { verifyLogin, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentials = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      if (!username || !password) {
        setError("Please enter username and password");
        return;
      }
      setIsLoading(true);
      const ok = await verifyLogin(username, password);
      setIsLoading(false);
      if (ok) {
        setStep("verification");
      } else {
        setError("Invalid credentials");
      }
    },
    [username, password, verifyLogin],
  );

  const handleVerify = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      const fullCode = code.join("");
      if (fullCode.length !== 6) {
        setError("Please enter the complete 6-digit code");
        return;
      }
      setIsLoading(true);
      try {
        await login(username, password, fullCode);
        navigate("/dashboard", { replace: true });
      } catch {
        setError("Invalid verification code");
      } finally {
        setIsLoading(false);
      }
    },
    [code, username, password, login, navigate],
  );

  const handleCodeInput = (val: string, idx: number) => {
    if (val.length > 1) val = val.charAt(0);
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) {
      document.getElementById(`code-${idx + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (
    e: React.KeyboardEvent,
    idx: number,
  ) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      document.getElementById(`code-${idx - 1}`)?.focus();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,119,6,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur border border-white/20 mb-8">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            TalentBridge
          </h1>
          <p className="text-xl text-blue-200/80 font-light">
            Admin Portal
          </p>
          <div className="mt-12 flex items-center justify-center gap-2 text-white/50 text-sm">
            <Lock className="w-4 h-4" />
            <span>Encrypted & secure connection</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-gray-900">TalentBridge</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "credentials" ? "Admin Sign In" : "Verify Identity"}
          </h2>
          <p className="text-gray-500 mb-10">
            {step === "credentials"
              ? "Secure login for administrators"
              : "Enter the 6-digit code sent to your device"}
          </p>

          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isLoading ? "Authenticating..." : "Continue"}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                <span>Two-factor authentication enabled</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-sm text-gray-500 bg-blue-50 rounded-xl p-4 border border-blue-100">
                We&apos;ve sent a 6-digit code to your registered device.
              </p>

              <div className="flex justify-center gap-3">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`code-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(e.target.value, idx)}
                    onKeyDown={(e) => handleCodeKeyDown(e, idx)}
                    autoFocus={idx === 0}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.some((d) => !d)}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCode(["", "", "", "", "", ""]);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Resend code
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
