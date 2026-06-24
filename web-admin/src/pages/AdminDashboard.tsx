import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  LogOut,
  MessageSquare,
  Search,
  Shield,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import type {
  CompanyApplication,
  Job,
  ProfessionalApplication,
  RecruiterApplication,
} from "@/lib/trpc-types";

const API_BASE = import.meta.env.EXPO_PUBLIC_RORK_API_BASE_URL as string;

// ── Mock data (used when backend is unreachable during dev) ────

const MOCK_PROFESSIONALS: ProfessionalApplication[] = [
  {
    id: "1", name: "Amara Okonkwo", email: "amara.okonkwo@email.com",
    phone: "+234 80 123 4567", location: "Lagos, Nigeria",
    title: "Senior Software Engineer", experience: "8 years",
    skills: ["React Native", "TypeScript", "Node.js", "AWS"],
    status: "pending", createdAt: "2025-01-12T10:30:00Z",
  },
  {
    id: "2", name: "Kwame Mensah", email: "kwame.mensah@email.com",
    phone: "+233 24 555 1234", location: "Accra, Ghana",
    title: "Product Designer", experience: "5 years",
    skills: ["UI/UX", "Figma", "Prototyping", "Design Systems"],
    status: "pending", createdAt: "2025-01-11T14:20:00Z",
  },
  {
    id: "3", name: "Sarah Kimani", email: "sarah.kimani@email.com",
    phone: "+254 70 555 9012", location: "Nairobi, Kenya",
    title: "Data Scientist", experience: "6 years",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    status: "approved", createdAt: "2025-01-10T09:15:00Z",
  },
];

const MOCK_RECRUITERS: RecruiterApplication[] = [
  {
    id: "1", name: "John Osei", email: "john.osei@techcorp.com",
    phone: "+233 24 777 8888", company: "TechCorp Africa",
    location: "Accra, Ghana", status: "pending",
    createdAt: "2025-01-11T11:30:00Z",
  },
  {
    id: "2", name: "Grace Mwangi", email: "grace.m@innovate.co.ke",
    phone: "+254 70 888 9999", company: "Innovate Kenya",
    location: "Nairobi, Kenya", status: "pending",
    createdAt: "2025-01-10T15:45:00Z",
  },
];

const MOCK_COMPANIES: CompanyApplication[] = [
  {
    id: "1", companyName: "Tech Africa Solutions",
    contactPerson: "Kwame Mensah", email: "hr@techafricasolutions.com",
    phone: "+233 24 555 1234", location: "Accra, Ghana",
    industry: "Technology", website: "www.techafricasolutions.com",
    registrationNumber: "BN20231234", status: "pending",
    createdAt: "2025-01-10T10:30:00Z",
  },
  {
    id: "2", companyName: "AfriBank Financial",
    contactPerson: "Amara Okafor", email: "recruitment@afribank.com",
    phone: "+234 80 555 5678", location: "Lagos, Nigeria",
    industry: "Finance", website: "www.afribank.com",
    registrationNumber: "RC45678", status: "pending",
    createdAt: "2025-01-11T14:20:00Z",
  },
];

const MOCK_JOBS: Job[] = [
  {
    id: "1", title: "Senior Software Engineer", company: "TechCorp Africa",
    location: "Lagos, Nigeria", type: "Full-time",
    salary: "$60,000 - $90,000",
    description: "We are seeking a talented Senior Software Engineer.",
    requirements: ["5+ years experience", "React Native", "Node.js"],
    postedBy: "recruiter1",
    postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    applicants: 45, status: "active",
  },
  {
    id: "2", title: "Product Designer", company: "DesignHub",
    location: "Accra, Ghana", type: "Remote",
    salary: "$40,000 - $60,000",
    description: "Looking for a creative Product Designer.",
    requirements: ["3+ years experience", "Figma", "User Research"],
    postedBy: "company1",
    postedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    applicants: 28, status: "active",
  },
];

type Department =
  | "overview"
  | "professionals"
  | "recruiters"
  | "companies"
  | "jobs"
  | "analytics";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface DepartmentCard {
  id: Department;
  label: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  bgColor: string;
}

async function tRPCFetch(path: string, body: Record<string, unknown> = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/trpc/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json?.result?.data ?? null;
  } catch {
    // Backend unreachable — caller should provide fallback via placeholderData
    throw new Error("Backend unreachable");
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dept, setDept] = useState<Department>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: professionals = MOCK_PROFESSIONALS } = useQuery<ProfessionalApplication[]>({
    queryKey: ["admin", "professionals"],
    queryFn: () => tRPCFetch("admin.getProfessionals"),
    placeholderData: MOCK_PROFESSIONALS,
    staleTime: 30000,
  });

  const { data: recruiters = MOCK_RECRUITERS } = useQuery<RecruiterApplication[]>({
    queryKey: ["admin", "recruiters"],
    queryFn: () => tRPCFetch("admin.getRecruiters"),
    placeholderData: MOCK_RECRUITERS,
    staleTime: 30000,
  });

  const { data: companies = MOCK_COMPANIES } = useQuery<CompanyApplication[]>({
    queryKey: ["admin", "companies"],
    queryFn: () => tRPCFetch("admin.getCompanies"),
    placeholderData: MOCK_COMPANIES,
    staleTime: 30000,
  });

  const { data: jobs = MOCK_JOBS } = useQuery<Job[]>({
    queryKey: ["admin", "jobs"],
    queryFn: () => tRPCFetch("admin.getJobs"),
    placeholderData: MOCK_JOBS,
    staleTime: 30000,
  });

  const pendingCount =
    professionals.filter((p) => p.status === "pending").length +
    recruiters.filter((r) => r.status === "pending").length +
    companies.filter((c) => c.status === "pending").length;

  const totalUsers =
    professionals.length + recruiters.length + companies.length;

  const deptCards: DepartmentCard[] = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        icon: <BarChart3 className="w-5 h-5" />,
        count: totalUsers,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        id: "professionals",
        label: "Professionals",
        icon: <Users className="w-5 h-5" />,
        count: professionals.length,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        id: "recruiters",
        label: "Recruiters",
        icon: <UserCheck className="w-5 h-5" />,
        count: recruiters.length,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
      },
      {
        id: "companies",
        label: "Companies",
        icon: <Building2 className="w-5 h-5" />,
        count: companies.length,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      {
        id: "jobs",
        label: "Jobs",
        icon: <Briefcase className="w-5 h-5" />,
        count: jobs.length,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: <BarChart3 className="w-5 h-5" />,
        count: 0,
        color: "text-sky-600",
        bgColor: "bg-sky-50",
      },
    ],
    [totalUsers, professionals.length, recruiters.length, companies.length, jobs.length],
  );

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleStatusUpdate = async (
    appType: "professional" | "recruiter" | "company",
    id: string,
    status: "approved" | "rejected",
  ) => {
    await tRPCFetch("admin.updateStatus", { type: appType, id, status });
  };

  const handleJobStatusUpdate = async (id: string, status: "active" | "flagged") => {
    await tRPCFetch("admin.updateJobStatus", { id, status });
  };

  const filteredProfessionals = useMemo(() => {
    let list = professionals;
    if (statusFilter !== "all")
      list = list.filter((p) => p.status === statusFilter);
    if (search)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [professionals, statusFilter, search]);

  const filteredRecruiters = useMemo(() => {
    let list = recruiters;
    if (statusFilter !== "all")
      list = list.filter((r) => r.status === statusFilter);
    if (search)
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.company.toLowerCase().includes(search.toLowerCase()) ||
          r.location.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [recruiters, statusFilter, search]);

  const filteredCompanies = useMemo(() => {
    let list = companies;
    if (statusFilter !== "all")
      list = list.filter((c) => c.status === statusFilter);
    if (search)
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.industry.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [companies, statusFilter, search]);

  // Jobs use "active"|"closed"|"flagged" — map our filters
  const jobFilter = useMemo(
    () =>
      statusFilter === "approved"
        ? ("active" as const)
        : statusFilter === "rejected"
          ? ("flagged" as const)
          : statusFilter === "pending"
            ? ("closed" as const)
            : ("all" as const),
    [statusFilter],
  );

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (jobFilter !== "all")
      list = list.filter((j) => j.status === jobFilter);
    if (search)
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase()) ||
          j.location.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [jobs, jobFilter, search]);

  const statusBadge = (status: string) => {
    const config: Record<
      string,
      { cls: string; icon: React.ReactNode; label: string }
    > = {
      pending: {
        cls: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Pending",
      },
      approved: {
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Approved",
      },
      rejected: {
        cls: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Rejected",
      },
      active: {
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Active",
      },
      closed: {
        cls: "bg-gray-50 text-gray-600 border-gray-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Closed",
      },
      flagged: {
        cls: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Flagged",
      },
    };
    const c = config[status] ?? config.pending;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}
      >
        {c.icon}
        {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-white shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">TalentBridge</h2>
              <p className="text-xs text-gray-400">Admin Console</p>
            </div>
          </div>

          <nav className="space-y-1">
            {deptCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setDept(card.id);
                  setSearch("");
                  setStatusFilter("all");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  dept === card.id
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={dept === card.id ? card.color : ""}>
                  {card.icon}
                </span>
                <span className="flex-1 text-left">{card.label}</span>
                {card.count > 0 &&
                  card.id !== "overview" &&
                  card.id !== "analytics" && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {card.count}
                    </span>
                  )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name ?? "Admin"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <h1 className="text-xl font-bold text-gray-900 flex-1">
            {deptCards.find((d) => d.id === dept)?.label ?? "Dashboard"}
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          {/* Mobile nav */}
          <div className="md:hidden flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {deptCards
              .filter((d) => d.id !== "overview" && d.id !== "analytics")
              .map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDept(d.id);
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className={`p-2 rounded-md text-sm ${
                    dept === d.id
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {d.icon}
                </button>
              ))}
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Overview */}
          {dept === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Total Users</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalUsers}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-500">Pending Approvals</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingCount}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-500">Active Jobs</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {jobs.filter((j) => j.status === "active").length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-violet-600" />
                    </div>
                    <p className="text-sm text-gray-500">Total Posts</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Departments
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {deptCards
                    .filter((d) => d.id !== "overview")
                    .map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setDept(card.id);
                          setSearch("");
                          setStatusFilter("all");
                        }}
                        className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${card.bgColor} border-transparent hover:border-gray-200`}
                      >
                        <div className={card.color}>{card.icon}</div>
                        <p className="mt-3 font-semibold text-gray-900">
                          {card.label}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {card.id === "analytics" ? "View" : card.count}{" "}
                          {card.id === "analytics" ? "reports" : "items"}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Department drill-down */}
          {dept !== "overview" && dept !== "analytics" && (
            <div className="space-y-4">
              {/* Status filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {dept === "jobs" ? (
                  <>
                    {/* Jobs use a specialized filter */}
                    {(["all", "active", "closed", "flagged"] as const).map(
                      (f) => {
                        const mapped =
                          f === "active"
                            ? ("approved" as const)
                            : f === "flagged"
                              ? ("rejected" as const)
                              : f === "closed"
                                ? ("pending" as const)
                                : ("all" as const);
                        return (
                          <button
                            key={f}
                            onClick={() => setStatusFilter(mapped)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              (f === "all" && statusFilter === "all") ||
                              (f === "active" && statusFilter === "approved") ||
                              (f === "flagged" &&
                                statusFilter === "rejected") ||
                              (f === "closed" && statusFilter === "pending")
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        );
                      },
                    )}
                  </>
                ) : (
                  <>
                    {(
                      ["all", "pending", "approved", "rejected"] as StatusFilter[]
                    ).map((f) => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          statusFilter === f
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {f === "all"
                          ? "All"
                          : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Professionals list */}
              {dept === "professionals" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Location
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Skills
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProfessionals.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {p.name}
                              </p>
                              <p className="text-sm text-gray-500">{p.email}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {p.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                              {p.location}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {p.skills.slice(0, 3).map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge(p.status)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {p.status === "pending" && (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        "professional",
                                        p.id,
                                        "approved",
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        "professional",
                                        p.id,
                                        "rejected",
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredProfessionals.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-12 text-center text-gray-400"
                            >
                              No professionals found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recruiters list */}
              {dept === "recruiters" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Location
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecruiters.map((r) => (
                          <tr
                            key={r.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {r.name}
                              </p>
                              <p className="text-sm text-gray-500">{r.email}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {r.company}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                              {r.location}
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge(r.status)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {r.status === "pending" && (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        "recruiter",
                                        r.id,
                                        "approved",
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        "recruiter",
                                        r.id,
                                        "rejected",
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredRecruiters.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-12 text-center text-gray-400"
                            >
                              No recruiters found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Companies list */}
              {dept === "companies" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Industry
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompanies.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {c.companyName}
                              </p>
                              <p className="text-sm text-gray-500">{c.email}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {c.contactPerson}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                              {c.industry}
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge(c.status)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {c.status === "pending" && (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        "company",
                                        c.id,
                                        "approved",
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        "company",
                                        c.id,
                                        "rejected",
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredCompanies.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-12 text-center text-gray-400"
                            >
                              No companies found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Jobs list */}
              {dept === "jobs" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Job Title
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Location
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Applicants
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map((j) => (
                          <tr
                            key={j.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {j.title}
                              </p>
                              <p className="text-xs text-gray-500">{j.type}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {j.company}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                              {j.location}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">
                              {j.applicants}
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge(j.status)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {j.status === "active" && (
                                  <button
                                    onClick={() =>
                                      handleJobStatusUpdate(j.id, "flagged")
                                    }
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {j.status === "flagged" && (
                                  <button
                                    onClick={() =>
                                      handleJobStatusUpdate(j.id, "active")
                                    }
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredJobs.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-12 text-center text-gray-400"
                            >
                              No jobs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {dept === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    User Distribution
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Professionals
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {professionals.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{
                          width: `${totalUsers > 0 ? (professionals.length / totalUsers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recruiters</span>
                      <span className="text-sm font-bold text-gray-900">
                        {recruiters.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-violet-500 h-2 rounded-full"
                        style={{
                          width: `${totalUsers > 0 ? (recruiters.length / totalUsers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Companies</span>
                      <span className="text-sm font-bold text-gray-900">
                        {companies.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{
                          width: `${totalUsers > 0 ? (companies.length / totalUsers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Jobs by Status
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {jobs.filter((j) => j.status === "active").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Closed</span>
                      <span className="text-sm font-bold text-gray-600">
                        {jobs.filter((j) => j.status === "closed").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Flagged</span>
                      <span className="text-sm font-bold text-red-600">
                        {jobs.filter((j) => j.status === "flagged").length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Approval Queue
                  </h3>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-amber-600">
                      {pendingCount}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      items pending review
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Professionals</span>
                        <span className="font-medium">
                          {
                            professionals.filter((p) => p.status === "pending")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Recruiters</span>
                        <span className="font-medium">
                          {
                            recruiters.filter((r) => r.status === "pending")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Companies</span>
                        <span className="font-medium">
                          {
                            companies.filter((c) => c.status === "pending")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
