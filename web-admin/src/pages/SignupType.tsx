import { Building2, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const accountTypes = [
  {
    id: "professional",
    title: "Professional",
    icon: User,
    desc: "Find jobs, connect with recruiters, and grow your career across Africa.",
    color: "bg-blue-50 text-[#0A66C2]",
    borderColor: "hover:border-[#0A66C2]",
  },
  {
    id: "recruiter",
    title: "Recruiter",
    icon: Search,
    desc: "Post jobs, find top talent, schedule interviews, and manage applications.",
    color: "bg-emerald-50 text-emerald-600",
    borderColor: "hover:border-emerald-500",
  },
  {
    id: "company",
    title: "Company",
    icon: Building2,
    desc: "Build your employer brand, post opportunities, and connect with professionals.",
    color: "bg-amber-50 text-amber-600",
    borderColor: "hover:border-amber-500",
  },
] as const;

export default function SignupType() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#0A66C2] mb-5">
              <span className="text-white font-bold text-lg">in</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Join TalentBridge
            </h1>
            <p className="text-gray-500">
              Choose the account type that fits you best
            </p>
          </div>

          <div className="space-y-4">
            {accountTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => navigate(`/signup/${type.id}`)}
                className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 border-gray-200 bg-white text-left transition-all hover:shadow-md ${type.borderColor}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${type.color}`}
                >
                  <type.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {type.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#0A66C2] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
