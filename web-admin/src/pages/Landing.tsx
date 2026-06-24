import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  LineChart,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { LandingStats } from "@/lib/trpc-types";

// ── Animated counter hook ───────────────────────────────────────────
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

// ── Intersection observer hook ─────────────────────────────────────
function useInView(threshold: number = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Default stats (fallback when backend isn't reachable) ──────────
const defaultStats: LandingStats = {
  totalJobs: 128,
  totalCompanies: 47,
  totalApplicants: 2340,
  byType: { fullTime: 68, partTime: 24, contract: 19, remote: 17 },
  featuredJobs: [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: "TechCorp Africa",
      location: "Lagos, Nigeria",
      type: "Full-time",
      salary: "$60,000 - $90,000",
      applicants: 45,
      postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "2",
      title: "Product Designer",
      company: "DesignHub",
      location: "Accra, Ghana",
      type: "Remote",
      salary: "$40,000 - $60,000",
      applicants: 28,
      postedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
  industryCategories: [
    { name: "Technology", count: "42+ jobs" },
    { name: "Finance", count: "28+ jobs" },
    { name: "Healthcare", count: "15+ jobs" },
    { name: "Engineering", count: "11+ jobs" },
    { name: "Marketing", count: "9+ jobs" },
    { name: "Design", count: "7+ jobs" },
    { name: "Sales", count: "6+ jobs" },
    { name: "Education", count: "5+ jobs" },
    { name: "Consulting", count: "3+ jobs" },
    { name: "Logistics", count: "2+ jobs" },
  ],
};

// ── Stat card with animated counter ─────────────────────────────────
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
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">
        {count.toLocaleString()}
        <span style={{ color }} className="ml-0.5">
          {suffix}
        </span>
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// ── Feature card (How It Works) ─────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  steps,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm text-gray-600"
          >
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

// ── Job card for featured jobs section ──────────────────────────────
function JobCard({
  title,
  company,
  location,
  type,
  salary,
  applicants,
  postedAt,
  color,
  onClick,
}: {
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  applicants: number;
  postedAt: string;
  color: string;
  onClick: () => void;
}) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(postedAt).getTime()) / 86400000,
  );

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-left w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          {company.charAt(0)}
        </div>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          {daysAgo <= 0 ? "Today" : `${daysAgo}d ago`}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-[#0A66C2] transition-colors">
        {title}
      </h4>
      <p className="text-sm text-gray-500 mb-3">
        {company} &middot; {location}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-blue-50 text-[#0A66C2] px-2 py-0.5 rounded-md font-medium">
          {type}
        </span>
        {salary && (
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-medium">
            {salary}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{applicants} applicants</span>
        <span className="text-[#0A66C2] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View &rarr;
        </span>
      </div>
    </button>
  );
}

// ── Testimonial card ────────────────────────────────────────────────
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
            fill="#F59E0B"
            color="#F59E0B"
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

// ── Platform capability card ────────────────────────────────────────
function CapabilityCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="group flex gap-4 p-5 rounded-xl hover:bg-gray-50 transition-colors">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: `${color}12` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Brand colors for company avatars ────────────────────────────────
const brandColors = [
  "#0A66C2", "#059669", "#D97706", "#7C3AED", "#DC2626",
  "#0891B2", "#4F46E5", "#EA580C", "#9333EA", "#059669",
];

// ═══════════════════════════════════════════════════════════════════
// LANDING PAGE — dynamic with graceful fallback to static defaults
// ═══════════════════════════════════════════════════════════════════
export default function Landing() {
  const navigate = useNavigate();

  // Fetch live stats from the backend — gracefully fall back to defaults
  const { data: stats } = useQuery<LandingStats>({
    queryKey: ["landingStats"],
    queryFn: async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (trpc as any).jobs.landingStats.query();
      } catch {
        return defaultStats;
      }
    },
    staleTime: 60000,
    retry: 1,
    placeholderData: defaultStats,
  });

  const liveStats = stats ?? defaultStats;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════
          NAV
          ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#0A66C2] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-base leading-none">
                in
              </span>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Talent<span className="text-[#0A66C2]">Bridge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#how-it-works"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Features
            </a>
            <a
              href="#explore"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Industries
            </a>
            <a
              href="#why-us"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Why Us
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
              title="Admin access"
            >
              <Shield className="w-3 h-3 inline mr-0.5" />
              Admin
            </Link>
            <Button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-sm font-semibold px-5 shadow-sm"
            >
              Join Now
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Comprehensive value proposition
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F0F7FF] to-white">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0A66C2 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#0A66C2]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column */}
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 bg-[#0A66C2]/5 text-[#0A66C2] rounded-full px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Africa's Leading Professional Network</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-light text-gray-900 leading-[1.08] tracking-tight">
                  Where Africa's
                  <br />
                  <span className="font-semibold text-[#0A66C2] relative">
                    talent meets
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
                  <br />
                  <span className="font-semibold">opportunity</span>
                </h1>

                <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
                  TalentBridge is more than a job board. It's a complete
                  professional networking platform where you can build your
                  profile, connect with peers, message recruiters directly,
                  schedule video interviews, and land your next role — all in
                  one place.
                </p>

                {/* Quick feature highlights */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Briefcase, label: "Live Jobs" },
                    { icon: MessageCircle, label: "Direct Messaging" },
                    { icon: Video, label: "Video Interviews" },
                    { icon: Users, label: "Networking" },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600"
                    >
                      <item.icon className="w-3.5 h-3.5 text-[#0A66C2]" />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/signup")}
                  size="lg"
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] font-semibold px-8 h-12 text-base shadow-lg shadow-[#0A66C2]/20 hover:shadow-xl hover:shadow-[#0A66C2]/25 transition-all"
                >
                  Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/jobs")}
                  className="rounded-full font-semibold px-8 h-12 text-base border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Browse Jobs
                </Button>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Free to join &middot; No credit card required</span>
              </div>
            </div>

            {/* Right column: Visual illustration */}
            <div className="hidden lg:block relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#0A66C2]/5 via-[#0A66C2]/3 to-transparent" />

              <div className="relative h-[420px]">
                {/* Profile card */}
                <div className="absolute top-0 left-4 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 w-64 animate-float-slow z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                      KO
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        Kwame Okonkwo
                      </p>
                      <p className="text-xs text-gray-500">Senior Developer</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
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
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Lagos, Nigeria
                  </div>
                  {/* Connection badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5 text-[#0A66C2]" />
                    <span>500+ connections</span>
                  </div>
                </div>

                {/* Job card */}
                <div className="absolute top-28 right-0 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 w-60 animate-float z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-gray-900 mb-1">
                    Product Designer
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Flutterwave &middot; Nairobi
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-900">
                      $45K - $65K
                    </span>
                    <span className="text-xs text-[#0A66C2] font-medium">
                      Apply &rarr;
                    </span>
                  </div>
                </div>

                {/* Stats card */}
                <div className="absolute bottom-0 left-16 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 w-56 animate-float-slow z-20">
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
                    {["#0A66C2", "#059669", "#D97706", "#7C3AED"].map(
                      (c, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: c }}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ),
                    )}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-500">
                      +2k
                    </div>
                  </div>
                </div>

                {/* Decorative dots */}
                <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-[#0A66C2]/20 animate-pulse" />
                <div
                  className="absolute bottom-16 left-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping"
                  style={{ animationDuration: "3s" }}
                />
                <div
                  className="absolute top-36 left-0 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"
                  style={{ animationDuration: "2.5s" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LIVE STATS BAR — fetched from backend
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#F3F2EF] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Live platform stats
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              value={liveStats.totalJobs}
              suffix="+"
              label="Active Jobs"
              icon={Briefcase}
              color="#0A66C2"
            />
            <StatCard
              value={liveStats.totalCompanies}
              suffix="+"
              label="Hiring Companies"
              icon={Building2}
              color="#059669"
            />
            <StatCard
              value={liveStats.totalApplicants}
              suffix="+"
              label="Applications Submitted"
              icon={FileText}
              color="#D97706"
            />
            <StatCard
              value={liveStats.byType.remote}
              suffix="+"
              label="Remote Opportunities"
              icon={Globe}
              color="#7C3AED"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Data refreshes every minute — these numbers are live from our platform.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Designed for every stage of your career journey
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Whether you're job hunting, scouting talent, or building a team —
              we've built the tools you need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={Target}
              title="For Professionals"
              desc="Showcase your skills, connect with recruiters, and land your dream role at a top company across Africa."
              color="#0A66C2"
              steps={[
                "Create a rich profile with your skills and experience",
                "Browse live job listings with smart matching",
                "Apply with one click and track every application",
                "Message recruiters and schedule video interviews",
              ]}
            />
            <FeatureCard
              icon={Megaphone}
              title="For Recruiters"
              desc="Find qualified candidates faster with AI-powered search and an all-in-one hiring dashboard."
              color="#059669"
              steps={[
                "Post jobs that reach thousands of professionals",
                "AI-powered matching ranks the best candidates",
                "Message, screen, and schedule interviews in-app",
                "Track your entire talent pipeline in one dashboard",
              ]}
            />
            <FeatureCard
              icon={BarChart3}
              title="For Companies"
              desc="Build your employer brand, attract top talent, and scale your team with enterprise-grade tools."
              color="#7C3AED"
              steps={[
                "Create a branded company page that attracts talent",
                "Post unlimited job openings across all roles",
                "Collaborate with your team on candidate reviews",
                "Access real-time analytics on your hiring funnel",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PLATFORM CAPABILITIES — What the app actually does
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 lg:py-28 bg-[#F3F2EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Everything you need, all in one platform
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              TalentBridge isn't just a job board. It's a full professional
              ecosystem with tools for networking, communication, and career
              growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CapabilityCard
              icon={MessageSquare}
              title="Professional Feed"
              desc="Share updates, articles, and achievements. Engage with posts from peers and companies across your network."
              color="#0A66C2"
            />
            <CapabilityCard
              icon={MessageCircle}
              title="Direct Messaging"
              desc="Chat one-on-one with recruiters, hiring managers, and fellow professionals. No middlemen, no delays."
              color="#059669"
            />
            <CapabilityCard
              icon={Video}
              title="Video Interviews"
              desc="Schedule and conduct video calls directly on the platform. Integrated scheduling with calendar sync."
              color="#D97706"
            />
            <CapabilityCard
              icon={Search}
              title="Smart Job Matching"
              desc="Our algorithm learns your preferences and surfaces the most relevant opportunities tailored to your profile."
              color="#7C3AED"
            />
            <CapabilityCard
              icon={FileText}
              title="Application Tracker"
              desc="Keep tabs on every application — see when your resume is viewed, shortlisted, or when an offer is coming."
              color="#DC2626"
            />
            <CapabilityCard
              icon={Users}
              title="Professional Network"
              desc="Build meaningful connections. Follow companies, connect with peers, and grow your professional circle."
              color="#0891B2"
            />
            <CapabilityCard
              icon={Calendar}
              title="Interview Scheduling"
              desc="Pick available slots, sync with your calendar, and get automatic reminders — all without leaving the app."
              color="#4F46E5"
            />
            <CapabilityCard
              icon={BookOpen}
              title="Career Resources"
              desc="Access salary insights, industry trends, skill assessments, and learning resources to accelerate your growth."
              color="#9333EA"
            />
            <CapabilityCard
              icon={LineChart}
              title="Hiring Analytics"
              desc="For recruiters: track source quality, time-to-hire, pipeline health, and diversity metrics in real time."
              color="#EA580C"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED JOBS — Live from the backend
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
                Featured opportunities
              </h2>
              <p className="text-gray-500">
                Hand-picked roles from top companies hiring right now.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/jobs")}
              className="rounded-full font-semibold px-5 hidden sm:flex items-center gap-1 group"
            >
              View all jobs
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStats.featuredJobs.map((job, i) => (
              <JobCard
                key={job.id}
                {...job}
                color={brandColors[i % brandColors.length]}
                onClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
          </div>

          {liveStats.featuredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active jobs right now. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Button
              variant="outline"
              onClick={() => navigate("/jobs")}
              className="rounded-full font-semibold px-6 group"
            >
              View all jobs
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INDUSTRIES — Live categories from backend
          ═══════════════════════════════════════════════════════════ */}
      <section id="explore" className="py-20 lg:py-28 bg-[#F3F2EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
              Explore by industry
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Discover opportunities across Africa's fastest-growing sectors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(liveStats.industryCategories.length > 0
              ? liveStats.industryCategories
              : defaultStats.industryCategories
            ).map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => navigate("/jobs")}
                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div
                  className="w-2 h-2 rounded-full mb-3"
                  style={{
                    backgroundColor: brandColors[i % brandColors.length],
                  }}
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
              Browse all industries
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY TALENTBRIDGE + TESTIMONIALS
          ═══════════════════════════════════════════════════════════ */}
      <section id="why-us" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
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
                    title: "AI-Powered Matching",
                    desc: "Our smart algorithm learns from your profile and preferences to surface roles that truly fit your skills, experience, and career goals.",
                    color: "#0A66C2",
                  },
                  {
                    icon: MessageCircle,
                    title: "Direct Recruiter Access",
                    desc: "Skip the middlemen — message recruiters directly, ask questions about roles, and build relationships that lead to offers.",
                    color: "#059669",
                  },
                  {
                    icon: Clock,
                    title: "Fast Application Process",
                    desc: "Apply to most jobs in under two minutes. Your profile auto-fills applications so you can focus on landing the role.",
                    color: "#D97706",
                  },
                  {
                    icon: GraduationCap,
                    title: "Career Growth Tools",
                    desc: "Benchmark your salary, identify skill gaps, and access curated learning resources to stay competitive in your field.",
                    color: "#7C3AED",
                  },
                  {
                    icon: Shield,
                    title: "Verified Employers",
                    desc: "Every company and recruiter on TalentBridge goes through a verification process — so you know opportunities are legitimate.",
                    color: "#059669",
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
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: testimonials */}
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-gray-900">
                Trusted by professionals across Africa
              </h3>
              <Testimonial
                quote="TalentBridge helped me land a Senior Product Manager role at a top fintech in Nairobi. The whole process — from application to offer — took less than two weeks. The direct messaging feature made all the difference."
                name="Amina Diallo"
                role="Senior Product Manager"
                company="Cellulant"
                color="#0A66C2"
              />
              <Testimonial
                quote="We filled 12 engineering positions in 3 months using TalentBridge. The quality of candidates was outstanding compared to other platforms we've used. The smart matching saves us hours every week."
                name="David Osei"
                role="Head of Talent"
                company="Andela"
                color="#059669"
              />
              <Testimonial
                quote="As a recruiter, I love that I can search, message, and schedule interviews with candidates without switching between five different tools. It's all integrated, and the analytics dashboard is a game changer."
                name="Grace Mwangi"
                role="Senior Recruiter"
                company="Safaricom"
                color="#7C3AED"
              />
              <Testimonial
                quote="The video interview feature is incredible. I conducted 30+ screening calls last month without needing Zoom or Google Meet. Candidates love the seamless experience."
                name="Kwesi Adu"
                role="Talent Acquisition Lead"
                company="MTN Ghana"
                color="#D97706"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ACTIVE JOBS BY TYPE — Quick filter section
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-[#0A66C2] to-[#004182] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
              Find the right fit for your lifestyle
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Browse opportunities by work type — we have roles for every preference.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              {
                label: "Full-time",
                count: liveStats.byType.fullTime,
                icon: Briefcase,
              },
              {
                label: "Part-time",
                count: liveStats.byType.partTime,
                icon: Clock,
              },
              {
                label: "Contract",
                count: liveStats.byType.contract,
                icon: FileText,
              },
              {
                label: "Remote",
                count: liveStats.byType.remote,
                icon: Globe,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate("/jobs")}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <item.icon className="w-6 h-6 text-white/80 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {item.count}
                </p>
                <p className="text-sm text-white/70">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of professionals already using TalentBridge to find
            opportunities, build connections, and grow their careers across Africa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold px-8 h-12 shadow-lg w-full sm:w-auto"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="rounded-full font-semibold px-8 h-12 border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
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
                Africa's professional network — connecting talent with
                opportunity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">
                For Candidates
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Browse Jobs",
                  "Create Profile",
                  "Career Resources",
                  "Salary Insights",
                  "Skill Assessments",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      to="/jobs"
                      className="text-sm text-gray-500 hover:text-[#0A66C2] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">
                For Employers
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Post a Job",
                  "Talent Search",
                  "Company Page",
                  "Hiring Analytics",
                  "Enterprise Solutions",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      to="/post-job"
                      className="text-sm text-gray-500 hover:text-[#0A66C2] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                {[
                  "About Us",
                  "Contact",
                  "Privacy Policy",
                  "Terms of Service",
                  "Help Center",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      to={
                        item === "Privacy Policy"
                          ? "/privacy"
                          : item === "Terms of Service"
                            ? "/terms"
                            : "/jobs"
                      }
                      className="text-sm text-gray-500 hover:text-[#0A66C2] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} TalentBridge. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link
                to="/terms"
                className="hover:text-gray-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="hover:text-gray-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/admin-login"
                className="hover:text-gray-600 transition-colors"
              >
                <Shield className="w-3 h-3 inline mr-0.5" /> Admin
              </Link>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" />{" "}
                in Africa
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Animations ── */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
