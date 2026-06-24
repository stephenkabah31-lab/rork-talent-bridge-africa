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

const MOCK_JOB: Job = {
  id: "1",
  title: "Senior Software Engineer",
  company: "TechCorp Africa",
  companyLogo: "",
  location: "Lagos, Nigeria",
  type: "Full-time",
  salary: "$60,000 - $90,000",
  description:
    "We are seeking a talented Senior Software Engineer to join our growing team in Lagos. You will be working on cutting-edge products that serve millions of users across Africa. Our engineering team is passionate about building scalable, reliable, and user-friendly solutions.\n\nAs a Senior Software Engineer, you will lead technical initiatives, mentor junior developers, and collaborate with cross-functional teams including Product, Design, and Data Science.\n\nWe value innovation, collaboration, and a growth mindset. If you're excited about using technology to solve real problems in Africa, we'd love to hear from you.",
  requirements: [
    "5+ years of professional software development experience",
    "Strong proficiency in React Native and TypeScript",
    "Experience with Node.js and RESTful APIs",
    "Familiarity with AWS services (ECS, Lambda, S3)",
    "Excellent problem-solving and communication skills",
    "Experience leading technical projects",
    "Knowledge of CI/CD pipelines",
  ],
  postedBy: "company1",
  postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  applicants: 45,
  status: "active",
};

const RESPONSIBILITIES = [
  "Design and implement scalable front-end and back-end solutions",
  "Lead code reviews and mentor junior developers",
  "Collaborate with product managers to define technical requirements",
  "Optimize application performance and reliability",
  "Contribute to architecture decisions and technical roadmap",
];

const BENEFITS = [
  "Competitive salary and equity package",
  "Health insurance for you and your family",
  "Flexible working hours and remote options",
  "Professional development budget",
  "Annual company retreats",
  "Modern equipment and tools",
];

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  const { data: tRPCJob } = useQuery({
    queryKey: ["job", id],
    queryFn: () => trpc.jobs.getById.query({ jobId: id! }),
    enabled: !!id,
  });

  const job: Job | null = tRPCJob || (id === "1" ? MOCK_JOB : null);

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
                    className="rounded-full bg-[#0A66C2] hover:bg-[#004182] h-10 text-sm font-semibold"
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

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {RESPONSIBILITIES.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 mt-1 shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#0A66C2] mt-1 shrink-0">•</span>
                    {r}
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3">Benefits</h3>
              <ul className="space-y-2">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 mt-1 shrink-0">•</span>
                    {b}
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
