import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Plus,
  Settings,
  Crown,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>(
    user?.skills || ["React", "TypeScript", "Node.js", "Product Design"],
  );
  const [newSkill, setNewSkill] = useState("");

  const { data: connections = [] } = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: () => (user ? trpc.users.getConnections.query({ userId: user.id }) : Promise.resolve([])),
    enabled: !!user,
  });

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const displayName = user.fullName || user.companyName || user.name;
  const userType = user.type === "professional" ? "Professional" : user.type === "recruiter" ? "Recruiter" : "Company";

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 max-w-[800px]">
            {/* Cover + Avatar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-[#0A66C2] via-[#004182] to-[#09223B]" />
              <div className="px-6 pb-6 -mt-12">
                <div className="flex items-end justify-between">
                  <div className="flex items-end gap-4">
                    <div className="w-[104px] h-[104px] rounded-full border-4 border-white bg-[#0A66C2] flex items-center justify-center text-white text-3xl font-bold shrink-0">
                      {displayName.charAt(0)}
                    </div>
                    <div className="mb-2">
                      <h1 className="text-2xl font-semibold text-gray-900">{displayName}</h1>
                      <p className="text-gray-500">{userType}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {user.country || "Location"} · {connections.length > 0 ? `${connections.length} connections` : "342 connections"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate("/settings")}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Settings className="w-4 h-4 mr-1.5" /> Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {user.bio || "Passionate professional dedicated to making an impact across Africa. Always open to new opportunities and meaningful connections."}
              </p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                <Button variant="ghost" size="sm" className="rounded-full text-[#0A66C2]">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-4">
                {[
                  { role: "Senior Developer", company: "TechCorp Africa", period: "2022 - Present", desc: "Leading development of core platform features serving millions of users." },
                  { role: "Software Engineer", company: "Innovate Kenya", period: "2019 - 2022", desc: "Built and maintained web and mobile applications for East African clients." },
                ].map((exp) => (
                  <div key={exp.role} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{exp.role}</p>
                      <p className="text-sm text-gray-500">{exp.company}</p>
                      <p className="text-xs text-gray-400">{exp.period}</p>
                      <p className="text-xs text-gray-600 mt-1">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                <Button variant="ghost" size="sm" className="rounded-full text-[#0A66C2]">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">University of Lagos</p>
                    <p className="text-sm text-gray-500">B.Sc. Computer Science</p>
                    <p className="text-xs text-gray-400">2015 - 2019</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-[#EDF3F8] text-[#0A66C2] rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => setSkills((p) => p.filter((s) => s !== skill))}
                      className="ml-1.5 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
                <Button onClick={addSkill} variant="outline" size="sm" className="rounded-lg">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-[68px] space-y-4">
              {user.isPremium && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-sm text-amber-800">Premium Member</span>
                  </div>
                  <p className="text-xs text-amber-700">You have access to premium features including direct messaging and advanced search.</p>
                </div>
              )}

              {!user.isPremium && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">Go Premium</h3>
                  <p className="text-xs text-gray-500 mb-3">Unlock premium features to boost your career</p>
                  <Button onClick={() => navigate("/subscription")} className="w-full rounded-full bg-amber-500 hover:bg-amber-600 h-9 text-sm">
                    <Crown className="w-3.5 h-3.5 mr-1.5" /> Upgrade
                  </Button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Contact Info</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="w-3.5 h-3.5" /> {user.email || "email@example.com"}
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-3.5 h-3.5" /> {user.phoneNumber}
                    </div>
                  )}
                  {user.country && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" /> {user.country}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
