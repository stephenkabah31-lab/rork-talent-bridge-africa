import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Flag,
  Headphones,
  Landmark,
  LogOut,
  Megaphone,
  Plus,
  Receipt,
  Save,
  Search,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpcClient } from "@/lib/trpc";
import type {
  CompanyApplication,
  Job,
  ProfessionalApplication,
  RecruiterApplication,
} from "@/lib/trpc-types";

type Department =
  | "overview"
  | "professionals"
  | "recruiters"
  | "companies"
  | "jobs"
  | "marketing"
  | "financials"
  | "support"
  | "analytics"
  | "system";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface DepartmentCard {
  id: Department;
  label: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  bgColor: string;
}

const AFRICAN_CURRENCIES_FIN = [
  { code: "GHS", symbol: "₵", rate: 15.5, label: "Ghana (GHS)" },
  { code: "NGN", symbol: "₦", rate: 1550, label: "Nigeria (NGN)" },
  { code: "KES", symbol: "KSh", rate: 130, label: "Kenya (KES)" },
  { code: "ZAR", symbol: "R", rate: 18.5, label: "South Africa (ZAR)" },
  { code: "UGX", symbol: "USh", rate: 3700, label: "Uganda (UGX)" },
  { code: "TZS", symbol: "TSh", rate: 2600, label: "Tanzania (TZS)" },
  { code: "RWF", symbol: "RF", rate: 1350, label: "Rwanda (RWF)" },
  { code: "USD", symbol: "$", rate: 1, label: "US Dollar (USD)" },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dept, setDept] = useState<Department>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const queryClient = useQueryClient();

  const [finCurrency, setFinCurrency] = useState<{ code: string; symbol: string; rate: number; label: string }>({
    code: "GHS", symbol: "₵", rate: 15.5, label: "Ghana (GHS)",
  });

  const [paymentConfig, setPaymentConfig] = useState({
    operationalAccount: { bankName: "", accountNumber: "", accountHolder: "", branchCode: "", swiftCode: "" },
    profitAccount: { bankName: "", accountNumber: "", accountHolder: "", branchCode: "", swiftCode: "" },
    mobileMoneyAccounts: [] as { provider: string; number: string; accountName: string }[],
  });
  const [configDirty, setConfigDirty] = useState(false);

  const { data: professionals = [] } = useQuery<ProfessionalApplication[]>({
    queryKey: ["admin", "professionals"],
    queryFn: () => trpcClient.admin.getProfessionals.query(),
    staleTime: 30000,
  });

  const { data: recruiters = [] } = useQuery<RecruiterApplication[]>({
    queryKey: ["admin", "recruiters"],
    queryFn: () => trpcClient.admin.getRecruiters.query(),
    staleTime: 30000,
  });

  const { data: companies = [] } = useQuery<CompanyApplication[]>({
    queryKey: ["admin", "companies"],
    queryFn: () => trpcClient.admin.getCompanies.query(),
    staleTime: 30000,
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["admin", "jobs"],
    queryFn: () => trpcClient.admin.getJobs.query(),
    staleTime: 30000,
  });

  const { data: paymentConfigData } = useQuery({
    queryKey: ["admin", "payment-config"],
    queryFn: async () => {
      const cfg = await (trpcClient as any).payments.getConfig.query();
      setPaymentConfig({
        operationalAccount: cfg.operationalAccount ?? { bankName: "", accountNumber: "", accountHolder: "", branchCode: "", swiftCode: "" },
        profitAccount: cfg.profitAccount ?? { bankName: "", accountNumber: "", accountHolder: "", branchCode: "", swiftCode: "" },
        mobileMoneyAccounts: cfg.mobileMoneyAccounts ?? [],
      });
      return cfg;
    },
    staleTime: 60000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: () => (trpcClient as any).payments.getTransactions.query({ limit: 50 }),
    staleTime: 30000,
  });

  const saveConfigMutation = useMutation({
    mutationFn: (config: typeof paymentConfig) =>
      (trpcClient as any).payments.saveConfig.mutate(config),
    onSuccess: () => {
      setConfigDirty(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-config"] });
    },
  });

  const updateTxMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      (trpcClient as any).payments.updateStatus.mutate({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
    },
  });

  const pendingCount =
    professionals.filter((p) => p.status === "pending").length +
    recruiters.filter((r) => r.status === "pending").length +
    companies.filter((c) => c.status === "pending").length;

  const totalUsers =
    professionals.length + recruiters.length + companies.length;

  const approvedCount =
    professionals.filter((p) => p.status === "approved").length +
    recruiters.filter((r) => r.status === "approved").length +
    companies.filter((c) => c.status === "approved").length;

  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const flaggedJobs = jobs.filter((j) => j.status === "flagged").length;

  // Derived financial estimates
  const premiumEstimate = companies.filter((c) => c.status === "approved").length * 49;
  const totalApplicants = jobs.reduce((s, j) => s + j.applicants, 0);

  const deptCards: DepartmentCard[] = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        icon: <BarChart3 className="w-5 h-5" />,
        count: totalUsers,
        color: "text-[#D97706]",
        bgColor: "bg-orange-50",
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
        label: "Job Listings",
        icon: <Briefcase className="w-5 h-5" />,
        count: jobs.length,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
      },
      {
        id: "marketing",
        label: "Marketing",
        icon: <Megaphone className="w-5 h-5" />,
        count: 0,
        color: "text-sky-600",
        bgColor: "bg-sky-50",
      },
      {
        id: "financials",
        label: "Financials",
        icon: <DollarSign className="w-5 h-5" />,
        count: 0,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
      },
      {
        id: "support",
        label: "Support",
        icon: <Headphones className="w-5 h-5" />,
        count: flaggedJobs,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: <TrendingUp className="w-5 h-5" />,
        count: 0,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
      {
        id: "system",
        label: "System",
        icon: <Settings className="w-5 h-5" />,
        count: 0,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
    ],
    [totalUsers, professionals.length, recruiters.length, companies.length, jobs.length, flaggedJobs],
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
    await trpcClient.admin.updateStatus.mutate({ type: appType, id, status });
  };

  const handleJobStatusUpdate = async (
    id: string,
    status: "active" | "flagged",
  ) => {
    await trpcClient.admin.updateJobStatus.mutate({ id, status });
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
        icon: <Flag className="w-3 h-3" />,
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

  // ── Section headers ──────────────────────────────────────────────

  const sectionLabel = (label: string, count?: number) => (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{label}</h2>
      {count !== undefined && (
        <span className="text-sm text-gray-400 font-medium">
          {count} total
        </span>
      )}
    </div>
  );

  // ── Stat card helper ─────────────────────────────────────────────

  const StatCard = ({
    label,
    value,
    icon,
    color,
    bg,
  }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <div className={color}>{icon}</div>
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-white shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
              <Shield className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm">TalentBridge</h2>
              <p className="text-xs text-gray-400">Admin Console</p>
            </div>
          </div>

          {/* ── User Management Section ── */}
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-3">
            Management
          </p>
          <nav className="space-y-1 mb-4">
            {deptCards
              .filter((d) =>
                ["professionals", "recruiters", "companies", "jobs"].includes(d.id),
              )
              .map((card) => (
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
                  {card.count > 0 && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {card.count}
                    </span>
                  )}
                </button>
              ))}
          </nav>

          {/* ── Operations Section ── */}
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-3">
            Operations
          </p>
          <nav className="space-y-1 mb-4">
            {deptCards
              .filter((d) =>
                ["marketing", "financials", "support"].includes(d.id),
              )
              .map((card) => (
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
                  {card.id === "support" && flaggedJobs > 0 && (
                    <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full">
                      {flaggedJobs}
                    </span>
                  )}
                </button>
              ))}
          </nav>

          {/* ── Insights Section ── */}
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 px-3">
            Insights
          </p>
          <nav className="space-y-1 mb-4">
            {deptCards
              .filter((d) =>
                ["analytics", "system"].includes(d.id),
              )
              .map((card) => (
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
                </button>
              ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#D97706] flex items-center justify-center text-white font-semibold text-sm">
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
          {[
            "professionals",
            "recruiters",
            "companies",
            "jobs",
          ].includes(dept) && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent w-64"
              />
            </div>
          )}
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
          {/* ── OVERVIEW ────────────────────────────────────────── */}
          {dept === "overview" && (
            <div className="space-y-6">
              {sectionLabel("Dashboard Overview")}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Users"
                  value={totalUsers}
                  icon={<Users className="w-5 h-5" />}
                  color="text-[#D97706]"
                  bg="bg-orange-50"
                />
                <StatCard
                  label="Pending Approvals"
                  value={pendingCount}
                  icon={<Clock className="w-5 h-5" />}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <StatCard
                  label="Active Jobs"
                  value={activeJobs}
                  icon={<Briefcase className="w-5 h-5" />}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <StatCard
                  label="Approved Users"
                  value={approvedCount}
                  icon={<CheckCircle className="w-5 h-5" />}
                  color="text-violet-600"
                  bg="bg-violet-50"
                />
              </div>

              {/* Quick-access department grid */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Departments
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                        <p className="mt-3 font-semibold text-sm text-gray-900">
                          {card.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {["marketing", "financials", "support", "analytics", "system"].includes(card.id)
                            ? "Manage"
                            : `${card.count} items`}
                        </p>
                      </button>
                    ))}
                </div>
              </div>

              {/* Recent activity placeholder */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setDept("professionals")}
                    className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-left hover:shadow-md transition-all"
                  >
                    <Users className="w-5 h-5 text-[#D97706] mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Review Professionals</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {professionals.filter((p) => p.status === "pending").length} pending
                    </p>
                  </button>
                  <button
                    onClick={() => setDept("recruiters")}
                    className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-left hover:shadow-md transition-all"
                  >
                    <UserCheck className="w-5 h-5 text-violet-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Review Recruiters</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {recruiters.filter((r) => r.status === "pending").length} pending
                    </p>
                  </button>
                  <button
                    onClick={() => setDept("companies")}
                    className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-left hover:shadow-md transition-all"
                  >
                    <Building2 className="w-5 h-5 text-amber-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Review Companies</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {companies.filter((c) => c.status === "pending").length} pending
                    </p>
                  </button>
                  <button
                    onClick={() => setDept("jobs")}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-left hover:shadow-md transition-all"
                  >
                    <Briefcase className="w-5 h-5 text-rose-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Manage Jobs</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {flaggedJobs} flagged
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Department drill-down (shared table views) ──────── */}
          {["professionals", "recruiters", "companies", "jobs"].includes(dept) && (
            <div className="space-y-4">
              {sectionLabel(
                deptCards.find((d) => d.id === dept)?.label ?? "",
                dept === "professionals"
                  ? professionals.length
                  : dept === "recruiters"
                    ? recruiters.length
                    : dept === "companies"
                      ? companies.length
                      : jobs.length,
              )}

              {/* Status filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {dept === "jobs" ? (
                  <>
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

              {/* Professionals table */}
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

              {/* Recruiters table */}
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

              {/* Companies table */}
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

              {/* Jobs table */}
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
                                    title="Flag job"
                                  >
                                    <Flag className="w-4 h-4" />
                                  </button>
                                )}
                                {j.status === "flagged" && (
                                  <button
                                    onClick={() =>
                                      handleJobStatusUpdate(j.id, "active")
                                    }
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Unflag job"
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

          {/* ── MARKETING ───────────────────────────────────────── */}
          {dept === "marketing" && (
            <div className="space-y-6">
              {sectionLabel("Marketing")}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Active Campaigns"
                  value={0}
                  icon={<Megaphone className="w-5 h-5" />}
                  color="text-sky-600"
                  bg="bg-sky-50"
                />
                <StatCard
                  label="Email Subscribers"
                  value={approvedCount}
                  icon={<Users className="w-5 h-5" />}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <StatCard
                  label="New Signups (30d)"
                  value={totalUsers}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="text-[#D97706]"
                  bg="bg-orange-50"
                />
                <StatCard
                  label="Job Post Views"
                  value={totalApplicants}
                  icon={<Briefcase className="w-5 h-5" />}
                  color="text-violet-600"
                  bg="bg-violet-50"
                />
              </div>

              {/* Campaigns */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Active Campaigns
                </h3>
                <div className="text-center py-12 text-gray-400">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium text-gray-500">No active campaigns</p>
                  <p className="text-sm mt-1">
                    Create email campaigns, promotions, and job alerts for your users
                  </p>
                  <button className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
                    + New Campaign
                  </button>
                </div>
              </div>

              {/* Promotions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Email Marketing
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subscriber list</span>
                      <span className="text-sm font-bold text-gray-900">
                        {approvedCount} users
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: "100%" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Open rate (est.)</span>
                      <span className="text-sm font-bold text-gray-900">--</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "0%" }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Job Board Promotions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Featured jobs</span>
                      <span className="text-sm font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sponsored listings</span>
                      <span className="text-sm font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Social shares</span>
                      <span className="text-sm font-bold text-gray-900">--</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FINANCIALS ──────────────────────────────────────── */}
          {dept === "financials" && (
            <div className="space-y-6">
              {/* Currency selector */}
              <div className="flex items-center justify-between">
                {sectionLabel("Financials")}
                <select
                  value={finCurrency.code}
                  onChange={(e) => {
                    const cur = AFRICAN_CURRENCIES_FIN.find((c) => c.code === e.target.value);
                    if (cur) setFinCurrency(cur);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  {AFRICAN_CURRENCIES_FIN.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Revenue stats in local currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Est. Monthly Revenue"
                  value={`${finCurrency.symbol}${Math.round((premiumEstimate + activeJobs * 15) * finCurrency.rate).toLocaleString()}`}
                  icon={<DollarSign className="w-5 h-5" />}
                  color="text-teal-600"
                  bg="bg-teal-50"
                />
                <StatCard
                  label="Subscriptions"
                  value={`${finCurrency.symbol}${Math.round(premiumEstimate * finCurrency.rate).toLocaleString()}`}
                  icon={<Building2 className="w-5 h-5" />}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <StatCard
                  label="Job Fees (est.)"
                  value={`${finCurrency.symbol}${Math.round(activeJobs * 15 * finCurrency.rate).toLocaleString()}`}
                  icon={<Briefcase className="w-5 h-5" />}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <StatCard
                  label="Completed Txns"
                  value={(Array.isArray(transactions) ? transactions.filter((t: any) => t.status === "completed").length : 0)}
                  icon={<Receipt className="w-5 h-5" />}
                  color="text-violet-600"
                  bg="bg-violet-50"
                />
              </div>

              {/* Payment Accounts — Operational & Profit */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Accounts</h3>
                <p className="text-sm text-gray-500 mb-6">Configure bank accounts for receiving payments</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Operational Account */}
                  <div className="p-5 rounded-xl bg-teal-50/50 border border-teal-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Operational Account</h4>
                        <p className="text-xs text-gray-500">Day-to-day operations</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: "bankName", label: "Bank Name", placeholder: "e.g. GCB Bank" },
                        { key: "accountNumber", label: "Account Number", placeholder: "Account number" },
                        { key: "accountHolder", label: "Account Holder", placeholder: "Account holder name" },
                        { key: "branchCode", label: "Branch Code (optional)", placeholder: "Branch/sort code" },
                        { key: "swiftCode", label: "SWIFT Code (optional)", placeholder: "SWIFT/BIC" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                          <input
                            type="text"
                            placeholder={f.placeholder}
                            value={(paymentConfig.operationalAccount as any)[f.key] ?? ""}
                            onChange={(e) => {
                              setPaymentConfig((prev) => ({
                                ...prev,
                                operationalAccount: { ...prev.operationalAccount, [f.key]: e.target.value },
                              }));
                              setConfigDirty(true);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profit Account */}
                  <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Profit Account</h4>
                        <p className="text-xs text-gray-500">Revenue & savings</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: "bankName", label: "Bank Name", placeholder: "e.g. Ecobank" },
                        { key: "accountNumber", label: "Account Number", placeholder: "Account number" },
                        { key: "accountHolder", label: "Account Holder", placeholder: "Account holder name" },
                        { key: "branchCode", label: "Branch Code (optional)", placeholder: "Branch/sort code" },
                        { key: "swiftCode", label: "SWIFT Code (optional)", placeholder: "SWIFT/BIC" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                          <input
                            type="text"
                            placeholder={f.placeholder}
                            value={(paymentConfig.profitAccount as any)[f.key] ?? ""}
                            onChange={(e) => {
                              setPaymentConfig((prev) => ({
                                ...prev,
                                profitAccount: { ...prev.profitAccount, [f.key]: e.target.value },
                              }));
                              setConfigDirty(true);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Money Accounts */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Mobile Money Accounts</h4>
                      <p className="text-xs text-gray-500">For MTN, Vodafone, AirtelTigo payments</p>
                    </div>
                    <button
                      onClick={() => {
                        setPaymentConfig((prev) => ({
                          ...prev,
                          mobileMoneyAccounts: [...prev.mobileMoneyAccounts, { provider: "", number: "", accountName: "" }],
                        }));
                        setConfigDirty(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-medium hover:bg-[#B45309] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {paymentConfig.mobileMoneyAccounts.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No mobile money accounts configured</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentConfig.mobileMoneyAccounts.map((mm, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Smartphone className="w-4 h-4 text-[#D97706]" />
                          </div>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
                              <select
                                value={mm.provider}
                                onChange={(e) => {
                                  setPaymentConfig((prev) => {
                                    const updated = [...prev.mobileMoneyAccounts];
                                    updated[idx] = { ...updated[idx], provider: e.target.value };
                                    return { ...prev, mobileMoneyAccounts: updated };
                                  });
                                  setConfigDirty(true);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                              >
                                <option value="">Select...</option>
                                <option value="MTN">MTN Mobile Money</option>
                                <option value="Vodafone">Vodafone Cash</option>
                                <option value="AirtelTigo">AirtelTigo Money</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
                              <input
                                type="text"
                                placeholder="024 XXX XXXX"
                                value={mm.number}
                                onChange={(e) => {
                                  setPaymentConfig((prev) => {
                                    const updated = [...prev.mobileMoneyAccounts];
                                    updated[idx] = { ...updated[idx], number: e.target.value };
                                    return { ...prev, mobileMoneyAccounts: updated };
                                  });
                                  setConfigDirty(true);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
                                <input
                                  type="text"
                                  placeholder="Name"
                                  value={mm.accountName}
                                  onChange={(e) => {
                                    setPaymentConfig((prev) => {
                                      const updated = [...prev.mobileMoneyAccounts];
                                      updated[idx] = { ...updated[idx], accountName: e.target.value };
                                      return { ...prev, mobileMoneyAccounts: updated };
                                    });
                                    setConfigDirty(true);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  setPaymentConfig((prev) => ({
                                    ...prev,
                                    mobileMoneyAccounts: prev.mobileMoneyAccounts.filter((_, i) => i !== idx),
                                  }));
                                  setConfigDirty(true);
                                }}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save button */}
                {configDirty && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => saveConfigMutation.mutate(paymentConfig)}
                      disabled={saveConfigMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saveConfigMutation.isPending ? "Saving..." : "Save Payment Accounts"}
                    </button>
                  </div>
                )}
                {saveConfigMutation.isSuccess && !configDirty && (
                  <p className="mt-2 text-sm text-emerald-600 text-right">Accounts saved successfully</p>
                )}
              </div>

              {/* Transaction Log */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Transaction Log</h3>
                    <p className="text-sm text-gray-500 mt-1">All payment transactions across the platform</p>
                  </div>
                </div>
                {(Array.isArray(transactions) ? transactions : []).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-500">No transactions yet</p>
                    <p className="text-sm mt-1">Transactions will appear once users subscribe</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(transactions) ? transactions : []).map((tx: any) => (
                          <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 text-sm">{tx.userName || tx.userEmail}</p>
                              <p className="text-xs text-gray-500">{tx.userEmail}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{tx.planName}</td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{tx.amountLocal}</p>
                              <p className="text-xs text-gray-400">${tx.amountUSD} USD</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {tx.paymentMethod === "mobile_money" ? <Smartphone className="w-3 h-3" /> : tx.paymentMethod === "bank_transfer" ? <Landmark className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                                {tx.paymentMethod === "mobile_money" ? "Mobile Money" : tx.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Debit Card"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {tx.status === "pending" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />Pending
                                </span>
                              )}
                              {tx.status === "completed" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" />Completed
                                </span>
                              )}
                              {tx.status === "failed" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                  <XCircle className="w-3 h-3" />Failed
                                </span>
                              )}
                              {tx.status === "refunded" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                  Refunded
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {tx.status === "pending" && (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => updateTxMutation.mutate({ id: tx.id, status: "completed" })}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Mark completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateTxMutation.mutate({ id: tx.id, status: "failed" })}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    title="Mark failed"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Subscription Plans reference */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {finCurrency.symbol}0<span className="text-sm font-normal text-gray-400">/mo</span>
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <li>• 1 job posting</li>
                      <li>• Basic profile</li>
                      <li>• Standard support</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-[#D97706] bg-orange-50/30">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#D97706] uppercase tracking-wide">Pro</p>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D97706] text-white rounded-full">POPULAR</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {finCurrency.symbol}{Math.round(49 * finCurrency.rate).toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span>
                    </p>
                    <p className="text-xs text-gray-400">≈ $49/mo</p>
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <li>• 10 job postings</li>
                      <li>• Featured company profile</li>
                      <li>• Priority support</li>
                      <li>• Advanced analytics</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Enterprise</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {finCurrency.symbol}{Math.round(149 * finCurrency.rate).toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span>
                    </p>
                    <p className="text-xs text-gray-400">≈ $149/mo</p>
                    <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <li>• Unlimited job postings</li>
                      <li>• Dedicated account manager</li>
                      <li>• API access</li>
                      <li>• Custom branding</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUPPORT ─────────────────────────────────────────── */}
          {dept === "support" && (
            <div className="space-y-6">
              {sectionLabel("Support")}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Open Tickets"
                  value={0}
                  icon={<Headphones className="w-5 h-5" />}
                  color="text-sky-600"
                  bg="bg-sky-50"
                />
                <StatCard
                  label="Flagged Jobs"
                  value={flaggedJobs}
                  icon={<Flag className="w-5 h-5" />}
                  color="text-red-600"
                  bg="bg-red-50"
                />
                <StatCard
                  label="Pending Reviews"
                  value={pendingCount}
                  icon={<Clock className="w-5 h-5" />}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <StatCard
                  label="Resolved Today"
                  value={0}
                  icon={<CheckCircle className="w-5 h-5" />}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
              </div>

              {/* Flagged content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    Flagged Content
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Jobs and content that need moderator review
                  </p>
                </div>
                {jobs.filter((j) => j.status === "flagged").length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Job
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Company
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
                        {jobs
                          .filter((j) => j.status === "flagged")
                          .map((j) => (
                            <tr
                              key={j.id}
                              className="border-b border-gray-50 hover:bg-gray-50/50"
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">
                                  {j.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {j.location}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {j.company}
                              </td>
                              <td className="px-4 py-3">
                                {statusBadge("flagged")}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() =>
                                    handleJobStatusUpdate(j.id, "active")
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
                                >
                                  Unflag
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-300" />
                    <p className="font-medium text-gray-500">No flagged content</p>
                    <p className="text-sm mt-1">Everything looks clean</p>
                  </div>
                )}
              </div>

              {/* Help resources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Common Issues
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Account verification delays",
                      "Job posting errors",
                      "Payment issues",
                      "Profile updates",
                    ].map((issue) => (
                      <div
                        key={issue}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm text-gray-700">{issue}</span>
                        <span className="text-xs text-gray-400">0 cases</span>
                      </div>
                  ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Support Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. response time</span>
                      <span className="text-sm font-bold text-gray-900">--</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Satisfaction rate</span>
                      <span className="text-sm font-bold text-gray-900">--</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Escalation rate</span>
                      <span className="text-sm font-bold text-gray-900">--</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ───────────────────────────────────────── */}
          {dept === "analytics" && (
            <div className="space-y-6">
              {sectionLabel("Analytics & Reports")}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    User Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Professionals</span>
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
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
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
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
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
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Jobs by Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {activeJobs}
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
                        {flaggedJobs}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Approval Queue
                  </h3>
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
                        {professionals.filter((p) => p.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Recruiters</span>
                      <span className="font-medium">
                        {recruiters.filter((r) => r.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Companies</span>
                      <span className="font-medium">
                        {companies.filter((c) => c.status === "pending").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform health */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Platform Activity
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Users</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Jobs</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-gray-900">{totalApplicants}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Applicants</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
                    <p className="text-sm text-gray-500 mt-1">Approved Users</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SYSTEM ──────────────────────────────────────────── */}
          {dept === "system" && (
            <div className="space-y-6">
              {sectionLabel("System & Settings")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Platform Configuration
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Site Name", value: "TalentBridge" },
                      { label: "Admin Email", value: user?.email ?? "admin@talentbridge.com" },
                      { label: "Default Language", value: "English" },
                      { label: "Time Zone", value: "UTC" },
                      { label: "Maintenance Mode", value: "Off" },
                    ].map((setting) => (
                      <div
                        key={setting.label}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm text-gray-600">{setting.label}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {setting.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Security
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "2FA Required", value: "No", color: "text-red-600" },
                      { label: "Session Timeout", value: "24 hours" },
                      { label: "Password Min Length", value: "8 characters" },
                      { label: "Rate Limiting", value: "Enabled" },
                      { label: "Audit Logging", value: "Off", color: "text-amber-600" },
                    ].map((setting) => (
                      <div
                        key={setting.label}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm text-gray-600">{setting.label}</span>
                        <span
                          className={`text-sm font-medium ${setting.color ?? "text-gray-900"}`}
                        >
                          {setting.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin accounts */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Admin Accounts
                </h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#D97706] flex items-center justify-center text-white font-semibold">
                    {(user?.name ?? "A").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user?.name ?? "Admin"}</p>
                    <p className="text-sm text-gray-500">{user?.email ?? ""}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
