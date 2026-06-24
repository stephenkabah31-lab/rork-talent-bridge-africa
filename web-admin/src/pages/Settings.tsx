import {
  Bell,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings & Privacy</h1>

        {/* Account */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Account</h2>
          <p className="text-sm text-gray-500 mb-4">Manage your account information</p>
          <div className="space-y-3">
            {[
              { icon: User, label: "Edit Profile", action: () => navigate("/profile") },
              { icon: Lock, label: "Change Password", action: undefined },
              { icon: Smartphone, label: "Phone Number", action: undefined },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Notifications</h2>
          <p className="text-sm text-gray-500 mb-4">Control how you receive notifications</p>
          <div className="space-y-3">
            {[
              { icon: Bell, label: "Push Notifications", desc: "Receive alerts on new messages and job updates" },
              { icon: Bell, label: "Email Notifications", desc: "Get weekly digest and job recommendations" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div className="w-10 h-6 rounded-full bg-[#0A66C2] relative cursor-pointer shrink-0">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Privacy & Security</h2>
          <p className="text-sm text-gray-500 mb-4">Manage your privacy and security settings</p>
          <div className="space-y-3">
            {[
              { icon: Shield, label: "Privacy Settings", action: () => navigate("/privacy") },
              { icon: Globe, label: "Profile Visibility", desc: "Your profile is visible to all members" },
              { icon: Lock, label: "Data & Security", desc: "Control how your data is used" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">{item.label}</p>
                    {"desc" in item && <p className="text-xs text-gray-400">{item.desc}</p>}
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* App */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">App Settings</h2>
          <p className="text-sm text-gray-500 mb-4">General app preferences</p>
          <div className="space-y-3">
            {[
              { icon: Globe, label: "Language", value: "English" },
              { icon: HelpCircle, label: "Help Center", action: undefined },
              { icon: Moon, label: "Dark Mode", value: "Off" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <p className="font-medium text-sm text-gray-700">{item.label}</p>
                </div>
                {"value" in item ? (
                  <span className="text-xs text-gray-400">{item.value}</span>
                ) : (
                  <span className="text-gray-400">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/terms")}
            className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Terms of Service
          </button>
          <button
            onClick={() => navigate("/privacy")}
            className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
