import {
  Briefcase,
  Clock,
  MapPin,
  DollarSign,
  Building2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/trpc-types";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  const { data: job = null, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => trpc.jobs.getById.query({ jobId: id! }),
    enabled: !!id,
  });

  if (!job) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Job not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 max-w-[750px]">
            {/* Back */}
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to jobs
            </Link>

            {/* Job header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      <Briefcase className="w-4 h-4" /> {job.type}
                    </span>
                    {job.salary && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <DollarSign className="w-4 h-4" /> {job.salary}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      Posted{" "}
                      {typeof job.postedAt === "string"
                        ? new Date(job.postedAt).toLocaleDateString()
                        : job.postedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                {applied ? (
                  <Button
                    disabled
                    className="rounded-full bg-emerald-500 h-10 gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Applied
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(`/jobs/${job.id}/apply`)}
                    className="rounded-full bg-[#D97706] hover:bg-[#9A3412] h-10 text-sm font-semibold"
                  >
                    Apply Now
                  </Button>
                )}
                <Button variant="outline" className="rounded-full h-10 text-sm">
                  Save
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Role</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#D97706] mt-1 shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-[68px] space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Company Info</h3>
                <p className="text-sm font-medium text-gray-700">{job.company}</p>
                <p className="text-xs text-gray-500 mt-1">{job.location}</p>
                <Button variant="outline" size="sm" className="w-full mt-4 rounded-full text-sm">
                  View Company Profile
                </Button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                  {job.applicants} applicants
                </h3>
                <p className="text-xs text-gray-500">Apply before the position is filled</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
