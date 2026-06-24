import {
  ArrowRight,
  Briefcase,
  Building2,
  Globe,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    if (user.isAdmin) navigate("/dashboard", { replace: true });
    else navigate("/feed", { replace: true });
    return null;
  }

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await (await import("@/lib/auth-context")).useAuth().login(
        email || "demo@talentbridge.com",
        password || "Demo1234",
        "professional",
      );
      navigate("/feed", { replace: true });
    } catch {
      setError("Invalid credentials. Try demo@talentbridge.com / Demo1234");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#0A66C2] flex items-center justify-center">
            <span className="text-white font-bold text-sm">in</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            TalentBridge
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Button
            onClick={() => navigate("/login")}
            className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-sm font-semibold px-5"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 leading-tight tracking-tight">
                Welcome to your
                <br />
                <span className="font-semibold text-[#0A66C2]">
                  professional community
                </span>
              </h1>
              <p className="mt-5 text-lg text-gray-500 max-w-lg leading-relaxed">
                TalentBridge connects Africa's top professionals, recruiters,
                and companies. Discover opportunities, build your network, and
                grow your career.
              </p>
            </div>

            {/* Quick sign-in */}
            <form
              onSubmit={handleQuickLogin}
              className="bg-white rounded-xl border border-gray-200 p-6 max-w-md shadow-sm space-y-4"
            >
              <h3 className="font-semibold text-gray-900">
                Try it now — free demo account
              </h3>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Password (6+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                By clicking Sign In, you agree to our Terms and Privacy Policy.
              </p>
            </form>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A66C2] hover:underline"
              >
                Sign in with existing account <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:block relative">
            <div className="bg-[#F3F2EF] rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Users,
                    label: "Professionals",
                    value: "10,000+",
                    color: "text-[#0A66C2]",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: Building2,
                    label: "Companies",
                    value: "500+",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    icon: Briefcase,
                    label: "Jobs Posted",
                    value: "2,500+",
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                  {
                    icon: Globe,
                    label: "Countries",
                    value: "54",
                    color: "text-violet-600",
                    bg: "bg-violet-50",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F3F2EF] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Everything you need to grow
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Build Your Network",
                desc: "Connect with professionals across Africa. Expand your reach and discover new opportunities.",
                color: "text-[#0A66C2]",
                bg: "bg-blue-50",
              },
              {
                icon: Briefcase,
                title: "Find Opportunities",
                desc: "Browse thousands of jobs from top companies. Apply with one click and track your applications.",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                icon: TrendingUp,
                title: "Grow Your Career",
                desc: "Access premium tools, interview scheduling, and direct messaging to recruiters.",
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Ready to advance your career?
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Join thousands of professionals already using TalentBridge to
            connect, learn, and grow.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] font-semibold px-8 h-12"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="rounded-full font-semibold px-8 h-12"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link to="/terms" className="hover:text-gray-700 transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
          <span>© 2025 TalentBridge. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
