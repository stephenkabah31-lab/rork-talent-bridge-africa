import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  MapPin,
  Search,
  Clock,
  Building2,
  DollarSign,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import type { Job } from "@/lib/trpc-types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: () => trpc.jobs.getAll.query({}),
    staleTime: 30000,
  });

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (typeFilter !== "all") {
      list = list.filter((j) => j.type.toLowerCase() === typeFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          j.company.toLowerCase().includes(s) ||
          j.location.toLowerCase().includes(s),
      );
    }
    return list;
  }, [jobs, search, typeFilter]);

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 max-w-[750px]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
              {(user?.type === "recruiter" || user?.type === "company") && (
                <Button
                  onClick={() => navigate("/post-job")}
                  className="rounded-full bg-[#D97706] hover:bg-[#9A3412]"
                >
                  Post a Job
                </Button>
              )}
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["all", "full-time", "part-time", "contract", "remote"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === t
                        ? "bg-[#D97706] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t === "all" ? "All Types" : t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Job cards */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No jobs found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-[#D97706] hover:underline">
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-xs font-medium text-[#D97706]">
                            <Briefcase className="w-3 h-3" /> {job.type}
                          </span>
                          {job.salary && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-xs font-medium text-emerald-700">
                              <DollarSign className="w-3 h-3" /> {job.salary}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {typeof job.postedAt === "string"
                              ? new Date(job.postedAt).toLocaleDateString()
                              : job.postedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.requirements.slice(0, 4).map((req) => (
                            <span key={req} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => navigate(`/jobs/${job.id}/apply`)}
                        className="rounded-full bg-[#D97706] hover:bg-[#9A3412] h-9 text-sm"
                      >
                        Apply Now
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full h-9 text-sm">
                        Save
                      </Button>
                      <span className="text-xs text-gray-400 ml-auto">{job.applicants} applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-[68px] space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Job Alerts</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Get notified when new jobs match your preferences
                </p>
                <Button className="w-full rounded-full bg-[#D97706] hover:bg-[#9A3412] h-9 text-sm">
                  Create Alert
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
