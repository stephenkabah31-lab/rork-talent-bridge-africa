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

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Africa",
    location: "Lagos, Nigeria",
    type: "Full-time",
    salary: "$60,000 - $90,000",
    description: "We are seeking a talented Senior Software Engineer to join our growing team. You will work on cutting-edge products used by millions across Africa.",
    requirements: ["5+ years experience", "React Native", "Node.js", "AWS"],
    postedBy: "company1",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 45,
    status: "active",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignHub Africa",
    location: "Accra, Ghana",
    type: "Remote",
    salary: "$40,000 - $60,000",
    description: "Looking for a creative Product Designer to help shape our products. You'll work closely with engineering and product teams.",
    requirements: ["3+ years experience", "Figma", "User Research", "Prototyping"],
    postedBy: "company2",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 28,
    status: "active",
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "AfriBank Financial",
    location: "Nairobi, Kenya",
    type: "Full-time",
    salary: "$50,000 - $75,000",
    description: "Join our data team to build predictive models for financial inclusion across East Africa.",
    requirements: ["Python", "Machine Learning", "SQL", "Statistics"],
    postedBy: "company3",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 32,
    status: "active",
  },
  {
    id: "4",
    title: "Marketing Manager",
    company: "Innovate Kenya",
    location: "Nairobi, Kenya",
    type: "Contract",
    description: "Lead our marketing efforts across Kenya and East Africa. Drive growth and brand awareness.",
    requirements: ["5+ years marketing", "Digital Marketing", "Team Leadership", "B2B"],
    postedBy: "company4",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 15,
    status: "active",
  },
];

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: tRPCJobs = [] } = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: () => trpc.jobs.getAll.query({}),
    staleTime: 30000,
  });

  const jobs: Job[] = tRPCJobs.length > 0 ? tRPCJobs : MOCK_JOBS;

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
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182]"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["all", "full-time", "part-time", "contract", "remote"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === t
                        ? "bg-[#0A66C2] text-white"
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
                        <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-[#0A66C2] hover:underline">
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
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-xs font-medium text-[#0A66C2]">
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
                        className="rounded-full bg-[#0A66C2] hover:bg-[#004182] h-9 text-sm"
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
                <Button className="w-full rounded-full bg-[#0A66C2] hover:bg-[#004182] h-9 text-sm">
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
