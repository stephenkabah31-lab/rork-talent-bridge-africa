import {
  ArrowRight,
  Briefcase,
  Building2,
  Heart,
  MessageCircle,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#D97706] flex items-center justify-center">
              <span className="text-white font-bold text-sm">tb</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              Talent<span className="text-[#D97706]">Bridge</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline"
            >
              {t("landing.signIn")}
            </Link>
            <Link
              to="/admin-login"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors hidden sm:inline"
            >
              <Shield className="w-3 h-3 inline mr-0.5" />
              Admin
            </Link>
            <Button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[#D97706] hover:bg-[#9A3412] text-sm font-semibold px-5"
            >
              Join Now
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-b from-[#FFF7ED] via-white to-white overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 opacity-50">
          <img
            src="https://rork.app/pa/ln0w2dnjwy17g62tuteow/african_professionals_office"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 lg:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight tracking-tight">
            Africa's professional
            <br />
            network for{" "}
            <span className="text-[#D97706]">finding work</span>
            {" "}and{" "}
            <span className="text-[#D97706]">hiring talent</span>
          </h1>

          <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Connect with professionals, browse live job listings, message recruiters
            directly, and land your next role — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full bg-[#D97706] hover:bg-[#9A3412] font-semibold px-8 h-12 text-base w-full sm:w-auto"
            >
              Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/jobs")}
              className="rounded-full font-semibold px-8 h-12 text-base border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
            >
              Browse Jobs
            </Button>
          </div>

        </div>
      </section>

      {/* ── AFRICA NETWORK VISUALS ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8">
          <img
            src="https://rork.app/pa/ln0w2dnjwy17g62tuteow/africa_talent_flow"
            alt="TalentBridge connects professionals across Africa"
            className="w-full rounded-2xl shadow-lg h-full object-cover"
          />
          <img
            src="https://rork.app/pa/ln0w2dnjwy17g62tuteow/african_talent_network"
            alt="African talent network connectivity"
            className="w-full rounded-2xl shadow-lg h-full object-cover"
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 lg:py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center mb-4">
            {t("landing.howItWorks")}
          </h2>
          <p className="text-lg text-gray-500 text-center max-w-xl mx-auto mb-14">
            {t("landing.heroSubtitle")}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "For Professionals",
                desc: "Create a profile, browse jobs matched to your skills, apply in one click, message recruiters, and schedule video interviews.",
                color: "#D97706",
                image: "a_young_african",
              },
              {
                icon: Users,
                title: "For Recruiters",
                desc: "Post jobs that reach thousands of professionals, get smart candidate matches, message and screen applicants, all from one dashboard.",
                color: "#059669",
                image: "recruiter_tablet_desk",
              },
              {
                icon: Building2,
                title: "For Companies",
                desc: "Build your employer brand, attract top talent, post unlimited roles, and track your hiring pipeline with real-time analytics.",
                color: "#7C3AED",
                image: "glass_tower_african_city",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={`https://rork.app/pa/ln0w2dnjwy17g62tuteow/${item.image}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${item.color}12` }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS VISUAL ── */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <img
            src="https://rork.app/pa/ln0w2dnjwy17g62tuteow/hiring_journey_cards"
            alt="How TalentBridge works for professionals, recruiters, and companies"
            className="w-full rounded-2xl"
          />
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center mb-14">
            Everything in one place
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Dashboard preview */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://rork.app/pa/ln0w2dnjwy17g62tuteow/recruitment_dashboard"
                alt="Platform dashboard"
                className="w-full h-auto"
              />
            </div>
            {/* Video interview preview */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://rork.app/pa/ln0w2dnjwy17g62tuteow/video_interview_call"
                alt="Video interviews"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Briefcase,
                title: "Live job listings",
                desc: "Browse hundreds of roles across Africa's top companies.",
                color: "#D97706",
              },
              {
                icon: MessageCircle,
                title: "Direct messaging",
                desc: "Chat with recruiters and peers — no middlemen, no delays.",
                color: "#059669",
              },
              {
                icon: Users,
                title: "Professional network",
                desc: "Build connections that open doors to new opportunities.",
                color: "#7C3AED",
              },
              {
                icon: Target,
                title: "Smart matching",
                desc: "Our algorithm surfaces roles that fit your skills and goals.",
                color: "#DC2626",
              },
              {
                icon: MessageCircle,
                title: "Video interviews",
                desc: "Schedule and conduct calls right on the platform.",
                color: "#0891B2",
              },
              {
                icon: Shield,
                title: "Verified employers",
                desc: "Every company goes through a verification process.",
                color: "#059669",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
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
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#D97706] to-[#9A3412]">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Join thousands of professionals already using TalentBridge to find
            opportunities and grow their careers across Africa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full bg-white text-[#D97706] hover:bg-gray-100 font-semibold px-8 h-12 w-full sm:w-auto"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="rounded-full font-semibold px-8 h-12 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center">
                <span className="text-white font-bold text-xs">tb</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Talent<span className="text-[#D97706]">Bridge</span>
              </span>
            </Link>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-gray-700 transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy
              </Link>
              <Link to="/admin-login" className="hover:text-gray-700 transition-colors">
                Admin
              </Link>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1">
              &copy; {new Date().getFullYear()} TalentBridge. Made with{" "}
              <Heart className="w-3 h-3 text-red-400 fill-red-400" /> in Africa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
