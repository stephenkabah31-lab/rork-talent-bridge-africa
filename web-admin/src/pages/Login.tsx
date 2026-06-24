import {
  Building2,
  Lock,
  Mail,
  Search,
  User,
} from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type UserType } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("professional");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      if (!email || !password) {
        setError("Please enter email and password");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setIsLoading(true);
      try {
        await login(email.toLowerCase().trim(), password, userType);
        navigate("/feed", { replace: true });
      } catch {
        setError("Invalid credentials. Please check your email and password.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, userType, login, navigate],
  );

  const types: { id: UserType; label: string; icon: React.ReactNode }[] = [
    { id: "professional", label: "Professional", icon: <User className="w-5 h-5" /> },
    { id: "recruiter", label: "Recruiter", icon: <Search className="w-5 h-5" /> },
    { id: "company", label: "Company", icon: <Building2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A66C2] via-[#004182] to-[#09223B] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-8">
            <span className="text-white font-bold text-3xl">in</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            TalentBridge
          </h1>
          <p className="text-lg text-blue-100/80 font-light">
            Connecting Africa's Talent
          </p>
          <div className="mt-10 flex items-center justify-center gap-2 text-white/40 text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure & encrypted connection</span>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TalentBridge</span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 mb-8">Stay updated on your professional world</p>

          {/* User type selector */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setUserType(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  userType === t.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] h-11 font-semibold"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              New to TalentBridge?{" "}
              <Link
                to="/signup"
                className="text-[#0A66C2] font-semibold hover:underline"
              >
                Join now
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/admin-login"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Lock className="w-3 h-3 inline mr-1" />
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
