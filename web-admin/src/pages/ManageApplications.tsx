import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Clock,
  CheckCircle,
  FileText,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import type { Application } from "@/lib/trpc-types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: <Clock className="w-3.5 h-3.5" /> },
  reviewing: { bg: "bg-amber-50 border-amber-200", text: "text-[#D97706]", icon: <FileText className="w-3.5 h-3.5" /> },
  shortlisted: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  accepted: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function ManageApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  if (!user || (user.type !== "recruiter" && user.type !== "company")) {
    navigate("/feed", { replace: true });
    return null;
  }

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => trpc.jobs.getApplications.query({}),
  });
  const filteredApps = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Manage Applications</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "pending", "reviewing", "shortlisted", "accepted", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No applications found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900">Applicant #{app.userId.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{app.coverLetter.slice(0, 80)}...</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">Job #{app.jobId.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status]?.bg || ""} ${STATUS_COLORS[app.status]?.text || ""}`}>
                        {STATUS_COLORS[app.status]?.icon}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-xs rounded-lg h-7 text-emerald-600 hover:bg-emerald-50">
                          Accept
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs rounded-lg h-7 text-red-600 hover:bg-red-50">
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
