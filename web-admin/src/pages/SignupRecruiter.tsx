import { ArrowLeft, Mail, Lock, User, MapPin, Briefcase, Phone } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function SignupRecruiter() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      if (!form.fullName || !form.companyName || !form.email || !form.password) {
        setError("Please fill in all required fields");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setIsLoading(true);
      try {
        await signup({
          email: form.email,
          password: form.password,
          userType: "recruiter",
          fullName: form.fullName,
          companyName: form.companyName,
          phoneNumber: form.phoneNumber || undefined,
          country: form.country || undefined,
        });
        navigate("/feed", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed.");
      } finally {
        setIsLoading(false);
      }
    },
    [form, signup, navigate],
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-md mx-auto w-full px-4 py-12 flex-1">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-3xl font-semibold text-gray-900 mb-1">
          Create recruiter account
        </h1>
        <p className="text-gray-500 mb-8">Post jobs and find top talent across Africa</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Your full name"
                value={form.fullName}
                onChange={update("fullName")}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Agency / Company *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Where do you recruit for?"
                value={form.companyName}
                onChange={update("companyName")}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+234..."
                  value={form.phoneNumber}
                  onChange={update("phoneNumber")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nigeria"
                  value={form.country}
                  onChange={update("country")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={update("password")}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password *
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#D97706] hover:bg-[#9A3412] h-11 font-semibold"
          >
            {isLoading ? "Creating account..." : "Agree & Join"}
          </Button>
        </form>
      </div>
    </div>
  );
}
