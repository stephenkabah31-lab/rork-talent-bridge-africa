import { Shield, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      if (!username || !password) {
        setError("Please enter username and password");
        return;
      }
      setIsLoading(true);
      try {
        await adminLogin(username, password);
        navigate("/dashboard", { replace: true });
      } catch {
        setError("Invalid credentials. Try admin / admin123");
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, adminLogin, navigate],
  );

  return (
    <div className="flex min-h-screen">
      {/* Left — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-8">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            TalentBridge
          </h1>
          <p className="text-lg text-blue-200/80 font-light">Admin Portal</p>
          <div className="mt-10 flex items-center justify-center gap-2 text-white/50 text-sm">
            <Lock className="w-4 h-4" />
            <span>Encrypted & secure connection</span>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-gray-900">TalentBridge</span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 mb-1">Admin Sign In</h2>
          <p className="text-gray-500 mb-8">Secure login for administrators</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Default credentials: <code className="bg-gray-100 px-1.5 py-0.5 rounded">admin</code> / <code className="bg-gray-100 px-1.5 py-0.5 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
