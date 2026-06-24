import {
  Bell,
  Briefcase,
  Building2,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.isAdmin === true;
  const isRecruiterOrCompany =
    user?.type === "recruiter" || user?.type === "company";
  const displayName =
    user?.fullName || user?.companyName || user?.name || "User";
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Admin nav items
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-bold text-gray-900">TalentBridge</span>
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded">
                  Admin
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {initials}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.name ?? "Admin"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Shield className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  // Regular user nav (LinkedIn-style)
  const navItems = [
    {
      to: "/feed",
      icon: Home,
      label: "Home",
      active: location.pathname === "/feed",
    },
    {
      to: "/network",
      icon: Users,
      label: "Network",
      active: location.pathname.startsWith("/network"),
    },
    {
      to: "/jobs",
      icon: Briefcase,
      label: "Jobs",
      active: location.pathname.startsWith("/jobs"),
    },
    {
      to: "/messages",
      icon: MessageSquare,
      label: "Messages",
      active: location.pathname.startsWith("/messages"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-[52px] flex items-center justify-between">
          {/* Logo + Search */}
          <div className="flex items-center gap-2 flex-1">
            <Link
              to="/feed"
              className="flex items-center gap-1.5 shrink-0 mr-4"
            >
              <div className="w-[34px] h-[34px] rounded-lg bg-[#0A66C2] flex items-center justify-center">
                <span className="text-white font-bold text-sm leading-none">
                  in
                </span>
              </div>
            </Link>
            <div className="hidden sm:flex items-center bg-[#EDF3F8] rounded-md px-3 h-[34px] flex-1 max-w-[280px]">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center px-4 py-1 h-[52px] text-xs font-medium border-b-2 transition-colors ${
                  item.active
                    ? "text-[#0A66C2] border-[#0A66C2]"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                <item.icon className="w-[22px] h-[22px]" />
                <span className="mt-0.5">{item.label}</span>
              </Link>
            ))}

            {/* Notifications */}
            <button className="flex flex-col items-center justify-center px-4 py-1 h-[52px] text-xs font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">
              <Bell className="w-[22px] h-[22px]" />
              <span className="mt-0.5">Notifications</span>
            </button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center px-4 py-1 h-[52px] text-xs font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-[10px] font-bold">
                    {initials}
                  </div>
                  <span className="mt-0.5 flex items-center gap-0.5">
                    Me
                    <svg
                      className="w-2 h-2"
                      viewBox="0 0 8 8"
                      fill="currentColor"
                    >
                      <path d="M4 5L1 2h6z" />
                    </svg>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm">{displayName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user?.type === "professional"
                      ? "Professional"
                      : user?.type === "recruiter"
                        ? "Recruiter"
                        : "Company"}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  View Profile
                </DropdownMenuItem>
                {isRecruiterOrCompany && (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate("/manage-applications")}
                    >
                      <Briefcase className="w-4 h-4 mr-2" /> Manage Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/post-job")}>
                      <Building2 className="w-4 h-4 mr-2" /> Post a Job
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate("/subscription")}>
                  Premium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings & Privacy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile search toggle */}
          <button
            className="sm:hidden p-2 text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile bottom nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                item.active ? "text-[#0A66C2]" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
              location.pathname === "/profile"
                ? "text-[#0A66C2]"
                : "text-gray-500"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-[8px] font-bold">
              {initials}
            </div>
            <span>Profile</span>
          </Link>
        </nav>
      </header>

      {/* Page content */}
      <main className="pb-20 sm:pb-0">{children}</main>
    </div>
  );
}
