import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  GraduationCap,
  Heart,
  LineChart,
  Megaphone,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

// ── Animated counter hook ─────────────────────────────────────
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration, start]);

  return count;
}

// ── Intersection observer hook ────────────────────────────────
function useInView(threshold: number = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Stat card component ───────────────────────────────────────
function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
  color,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; color?: string }>;
  color: string;
}) {
  const { ref, inView } = useInView(0.3);
  const count = useCountUp(value, 2200, inView);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4`}
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" color={color} />
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">
        {count.toLocaleString()}
        <span style={{ color }} className="ml-0.5">{suffix}</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  steps,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; color?: string }>;
  title: string;
  desc: string;
  color: string;
  steps: string[];
}) {
  return (
    <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: `${color}12` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-6">{desc}</p>
      <ul className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <CheckCircle2
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color }}
            />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Category chip ─────────────────────────────────────────────
const categories = [
  { name: "Technology", count: "2,100+ jobs", color: "#0A66C2" },
  { name: "Finance", count: "890+ jobs", color: "#059669" },
  { name: "Healthcare", count: "1,400+ jobs", color: "#D97706" },
  { name: "Marketing", count: "760+ jobs", color: "#7C3AED" },
  { name: "Engineering", count: "1,800+ jobs", color: "#DC2626" },
  { name: "Design", count: "540+ jobs", color: "#0891B2" },
  { name: "Sales", count: "920+ jobs", color: "#4F46E5" },
  { name: "Education", count: "630+ jobs", color: "#059669" },
  { name: "Consulting", count: "410+ jobs", color: "#9333EA" },
  { name: "Logistics", count: "380+ jobs", color: "#EA580C" },
];

// ── Testimonial ───────────────────────────────────────────────
function Testimonial({
  quote,
  name,
  role,
  company,
  color,
}: {
  quote: string;
  name: string;
  role: string;
  company: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4"
            fill={i < 5 ? "#F59E0B" : "#E5E7EB"}
            color={i < 5 ? "#F59E0B" : "#E5E7EB"}
          />
        ))}
      </div>
      <p className="text-gray-600 leading-relaxed text-sm mb-5 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">
            {role} at {company}
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Landing page
// ──────────────────────────────────────────────────────────────
export default function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"professional" | "recruiter" | "company">("professional");

  if (user) {
    if (user.isAdmin) navigate("/dashboard", { replace: true });
    else navigate("/feed", { replace: true });
    return null;
  }

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(
        email || "demo@talentbridge.com",
        password || "Demo1234",
        activeTab as "professional" | "recruiter" | "company",
      );
      navigate("/feed", { replace: true });
    } catch {
      setError("Invalid credentials. Try demo@talentbridge.com / Demo1234");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════
          NAV
          ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#0A66C2] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-base leading-none">in</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Talent<span className="text-[#0A66C2]">Bridge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <a href="#how-it-works" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              How It Works
            </a>
            <a href="#explore" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Explore
            </a>
            <a href="#why-us" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Why TalentBridge
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline"
            >
              Sign In
            </Link>
            <Link
              to="/admin-login"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors hidden sm:inline mr-1"
            >
              Admin
            </Link>
            <Button
              onClick={() => {
                const el = document.getElementById("hero-join");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-sm font-semibold px-5 shadow-sm"
            >
              Join Now
            </Button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0A66C2 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── Left column ── */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#0A66C2]/5 text-[#0A66C2] rounded-full px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Africa's #1 Professional Network</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-light text-gray-900 leading-[1.08] tracking-tight">
                  Find your next
                  <br />
                  <span className="font-semibold text-[#0A66C2] relative">
                    career opportunity
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-2 text-[#0A66C2]/20"
                      viewBox="0 0 200 8"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 4 Q50 0 100 4 Q150 8 200 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
                  TalentBridge connects ambitious professionals with top employers
                  across Africa. Network, apply, and get hired — all in one place.
                </p>
              </div>

              {/* Quick join form */}
              <div id="hero-join" className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md shadow-lg shadow-gray-100">
                {/* User type tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
                  {[
                    { id: "professional" as const, label: "Job Seeker" },
                    { id: "recruiter" as const, label: "Recruiter" },
                    { id: "company" as const, label: "Company" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleQuickJoin} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent transition-all"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent transition-all"
                  />
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-2">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-[#0A66C2] hover:bg-[#004182] font-semibold h-12 text-base shadow-md shadow-[#0A66C2]/20 hover:shadow-lg hover:shadow-[#0A66C2]/25 transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Start for free <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
                <p className="text-xs text-gray-400 text-center mt-4">
                  By continuing, you agree to our{" "}
                  <Link to="/terms" className="text-[#0A66C2] hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-[#0A66C2] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Free to join &middot; No credit card required</span>
              </div>
            </div>

            {/* ── Right column: Visual illustration ── */}
            <div className="hidden lg:block relative">
              {/* Background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#0A66C2]/5 via-[#0A66C2]/3 to-transparent" />

              {/* Main illustration area */}
              <div className="relative">
                {/* Floating profile card */}
                <div className="absolute top-0 left-8 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 w-64 animate-float-slow z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                      KO
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Kwame Okonkwo</p>
                      <p className="text-xs text-gray-500">Senior Developer</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-blue-50 text-[#0A66C2] px-2 py-1 rounded-md font-medium">
                      React
                    </span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-medium">
                      TypeScript
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-md font-medium">
                      Node.js
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <MapPinSmall />
                    Lagos, Nigeria
                  </div>
                </div>

                {/* Floating job card */}
                <div className="absolute top-32 right-0 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 w-60 animate-float z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-gray-900 mb-1">Product Designer</p>
                  <p className="text-xs text-gray-500 mb-3">Flutterwave &middot; Nairobi</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-900">$45K - $65K</span>
                    <span className="text-xs text-[#0A66C2] font-medium">Apply →</span>
                  </div>
                </div>

                {/* Bottom stats card */}
                <div className="absolute bottom-0 left-20 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 w-56 animate-float-slow z-20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">4.9</p>
                      <p className="text-xs text-gray-500">User Rating</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {["#0A66C2", "#059669", "#D97706", "#7C3AED"].map((c, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: c }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-500">
                      +2k
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 right-12 w-3 h-3 rounded-full bg-[#0A66C2]/20 animate-pulse" />
                <div className="absolute bottom-20 left-4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute top-40 left-0 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDuration: "2.5s" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SOCIAL PROOF / STATS
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[#F3F2EF] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-10">
            Trusted by professionals across Africa
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              value={35000}
              suffix="+"
              label="Active Professionals"
              icon={Users}
              color="#0A66C2"
            />
            <StatCard
              value={1200}
              suffix="+"
              label="Verified Companies"
              icon={Building2}
              color="#059669"
            />
            <StatCard
              value={8500}
              suffix="+"
              label="Open Positions"
              icon={Briefcase}
              color="#D97706"
            />
            <StatCard
              value={54}
              suffix=""
              label="African Countries"
              icon={Globe}
              color="#7C3AED"
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Built for every stage of your career
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Whether you're looking for your next role, scouting talent, or
              building a team — we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={Target}
              title="For Professionals"
              desc="Showcase your skills, connect with recruiters, and land your dream role at a top company."
              color="#0A66C2"
              steps={[
                "Create a standout profile in minutes",
                "Browse thousands of curated job listings",
                "Apply with one click & track progress",
                "Message recruiters directly",
              ]}
            />
            <FeatureCard
              icon={Megaphone}
              title="For Recruiters"
              desc="Find qualified candidates faster with powerful search tools and smart matching."
              color="#059669"
              steps={[
                "Post jobs to reach 35K+ professionals",
                "Smart matching surfaces top candidates",
                "Schedule interviews with built-in tools",
                "Manage your talent pipeline in one place",
              ]}
            />
            <FeatureCard
              icon={BarChart3}
              title="For Companies"
              desc="Build your employer brand and attract Africa's best talent to grow your team."
              color="#7C3AED"
              steps={[
                "Create a company page that attracts talent",
                "Post unlimited job openings",
                "Review applications collaboratively",
                "Access analytics on your hiring funnel",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          EXPLORE CATEGORIES
          ════════════════════════════════════════════════════════ */}
      <section id="explore" className="py-20 lg:py-28 bg-[#F3F2EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Explore popular industries
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Discover opportunities across Africa's fastest-growing sectors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate("/jobs")}
                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div
                  className="w-2 h-2 rounded-full mb-3"
                  style={{ backgroundColor: cat.color }}
                />
                <p className="font-semibold text-sm text-gray-900 group-hover:text-[#0A66C2] transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{cat.count}</p>
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              onClick={() => navigate("/jobs")}
              className="rounded-full font-semibold px-6 h-11 group"
            >
              Browse all categories
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY TALENTBRIDGE
          ════════════════════════════════════════════════════════ */}
      <section id="why-us" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: value props */}
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
                Why professionals choose{" "}
                <span className="text-[#0A66C2]">TalentBridge</span>
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: Zap,
                    title: "Smart Matching",
                    desc: "Our AI-powered matching connects you with roles that fit your skills and experience.",
                    color: "#0A66C2",
                  },
                  {
                    icon: MessageCircle,
                    title: "Direct Messaging",
                    desc: "Chat directly with recruiters and hiring managers — no middlemen, no delays.",
                    color: "#059669",
                  },
                  {
                    icon: LineChart,
                    title: "Career Insights",
                    desc: "Get salary benchmarks, industry trends, and personalized career recommendations.",
                    color: "#D97706",
                  },
                  {
                    icon: GraduationCap,
                    title: "Skill Development",
                    desc: "Access resources, courses, and mentorship opportunities to accelerate your growth.",
                    color: "#7C3AED",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.color}12` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: testimonials */}
            <div className="space-y-5">
              <Testimonial
                quote="TalentBridge helped me land a Senior Product Manager role at a top fintech in Nairobi. The whole process took less than two weeks."
                name="Amina Diallo"
                role="Senior Product Manager"
                company="Cellulant"
                color="#0A66C2"
              />
              <Testimonial
                quote="We filled 12 engineering positions in 3 months using TalentBridge. The quality of candidates was outstanding compared to other platforms."
                name="David Osei"
                role="Head of Talent"
                company="Andela"
                color="#059669"
              />
              <Testimonial
                quote="As a recruiter, the smart matching feature saves me hours every week. I can find qualified candidates in minutes instead of days."
                name="Grace Mwangi"
                role="Senior Recruiter"
                company="Safaricom"
                color="#7C3AED"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA BANNER
          ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A66C2] to-[#004182] py-20 lg:py-24">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to take the next step in your career?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
            Join over 35,000 professionals already using TalentBridge to find
            opportunities, build connections, and grow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => {
                const el = document.getElementById("hero-join");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              size="lg"
              className="rounded-full bg-white text-[#0A66C2] hover:bg-gray-100 font-semibold px-8 h-12 shadow-lg w-full sm:w-auto"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-[#0A66C2] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">in</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Talent<span className="text-[#0A66C2]">Bridge</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Africa's professional network — connecting talent with opportunity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">For Candidates</h4>
              <ul className="space-y-2.5">
                {["Browse Jobs", "Create Profile", "Career Resources", "Salary Insights", "Skill Assessments"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to="/jobs"
                        className="text-sm text-gray-500 hover:text-[#0A66C2] transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">For Employers</h4>
              <ul className="space-y-2.5">
                {["Post a Job", "Talent Search", "Company Page", "Recruitment Analytics", "Enterprise Solutions"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to="/post-job"
                        className="text-sm text-gray-500 hover:text-[#0A66C2] transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["About Us", "Contact", "Privacy Policy", "Terms of Service", "Help Center"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to={item === "Privacy Policy" ? "/privacy" : item === "Terms of Service" ? "/terms" : "/jobs"}
                        className="text-sm text-gray-500 hover:text-[#0A66C2] transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} TalentBridge. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link to="/terms" className="hover:text-gray-600 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-gray-600 transition-colors">
                Privacy
              </Link>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> in Africa
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Custom keyframe animations injected via style tag ── */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-in {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// ── Inline mini icon component for the floating card ──────────
function MapPinSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
