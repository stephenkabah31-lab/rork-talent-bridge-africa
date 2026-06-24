import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/lib/auth-context";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignupType from "./pages/SignupType";
import SignupProfessional from "./pages/SignupProfessional";
import SignupRecruiter from "./pages/SignupRecruiter";
import SignupCompany from "./pages/SignupCompany";
import Feed from "./pages/Feed";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import ApplyJob from "./pages/ApplyJob";
import PostJob from "./pages/PostJob";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import Network from "./pages/Network";
import PeopleSearch from "./pages/PeopleSearch";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import ManageApplications from "./pages/ManageApplications";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// ── Route guards ──────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F2EF]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A66C2] border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A66C2] border-t-transparent" />
      </div>
    );
  }
  if (user) {
    if (user.isAdmin) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/feed" replace />;
  }
  return <>{children}</>;
}

// ── App ────────────────────────────────────────────────────────────

const AppRoutes = () => (
  <Routes>
    {/* Landing */}
    <Route
      path="/"
      element={
        <GuestRoute>
          <Landing />
        </GuestRoute>
      }
    />

    {/* Auth */}
    <Route
      path="/login"
      element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <GuestRoute>
          <SignupType />
        </GuestRoute>
      }
    />
    <Route
      path="/signup/professional"
      element={
        <GuestRoute>
          <SignupProfessional />
        </GuestRoute>
      }
    />
    <Route
      path="/signup/recruiter"
      element={
        <GuestRoute>
          <SignupRecruiter />
        </GuestRoute>
      }
    />
    <Route
      path="/signup/company"
      element={
        <GuestRoute>
          <SignupCompany />
        </GuestRoute>
      }
    />

    {/* Admin */}
    <Route
      path="/admin-login"
      element={
        <GuestRoute>
          <AdminLogin />
        </GuestRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      }
    />

    {/* Protected pages */}
    <Route
      path="/feed"
      element={
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs"
      element={
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs/:id"
      element={
        <ProtectedRoute>
          <JobDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs/:id/apply"
      element={
        <ProtectedRoute>
          <ApplyJob />
        </ProtectedRoute>
      }
    />
    <Route
      path="/post-job"
      element={
        <ProtectedRoute>
          <PostJob />
        </ProtectedRoute>
      }
    />
    <Route
      path="/create-post"
      element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/network"
      element={
        <ProtectedRoute>
          <Network />
        </ProtectedRoute>
      }
    />
    <Route
      path="/network/search"
      element={
        <ProtectedRoute>
          <PeopleSearch />
        </ProtectedRoute>
      }
    />
    <Route
      path="/messages"
      element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/subscription"
      element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      }
    />
    <Route
      path="/manage-applications"
      element={
        <ProtectedRoute>
          <ManageApplications />
        </ProtectedRoute>
      }
    />

    {/* Legal */}
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
