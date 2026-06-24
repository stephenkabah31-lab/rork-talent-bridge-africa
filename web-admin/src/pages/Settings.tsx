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
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LANGUAGES } from "@/lib/i18n";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangPicker(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">{t("settings.title")}</h1>

        {/* Account */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("settings.account")}</h2>
          <p className="text-sm text-gray-500 mb-4">{t("settings.updatePersonalDetails")}</p>
          <div className="space-y-3">
            {[
              { icon: User, label: t("profile.editProfile"), action: () => navigate("/profile") },
              { icon: Lock, label: t("settings.emailPassword"), action: undefined },
              { icon: Smartphone, label: t("settings.phoneNumberSetting"), action: undefined },
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("settings.notifications")}</h2>
          <p className="text-sm text-gray-500 mb-4">{t("settings.pushNotificationsDesc")}</p>
          <div className="space-y-3">
            {[
              { icon: Bell, label: t("settings.pushNotifications"), desc: "Receive alerts on new messages and job updates" },
              { icon: Bell, label: t("settings.emailNotifications"), desc: "Get weekly digest and job recommendations" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div className="w-10 h-6 rounded-full bg-[#D97706] relative cursor-pointer shrink-0">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("settings.privacySecurity")}</h2>
          <p className="text-sm text-gray-500 mb-4">Manage your privacy and security settings</p>
          <div className="space-y-3">
            {[
              { icon: Shield, label: t("settings.privacySetting"), action: () => navigate("/privacy") },
              { icon: Globe, label: t("settings.profileVisibility"), desc: "Your profile is visible to all members" },
              { icon: Lock, label: t("settings.dataAnalytics"), desc: "Control how your data is used" },
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

        {/* App Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("settings.appSettings")}</h2>
          <p className="text-sm text-gray-500 mb-4">General app preferences</p>
          <div className="space-y-3">
            {/* Language Picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <p className="font-medium text-sm text-gray-700">{t("settings.languageSetting")}</p>
                </div>
                <span className="text-xs text-gray-400">{currentLanguage.native}</span>
              </button>

              {showLangPicker && (
                <div className="absolute right-0 left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        i18n.language === lang.code ? "bg-orange-50" : ""
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-700">{lang.native}</p>
                        <p className="text-xs text-gray-400">{lang.label}</p>
                      </div>
                      {i18n.language === lang.code && (
                        <Check className="w-4 h-4 text-[#D97706]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              { icon: HelpCircle, label: t("nav.help") },
              { icon: Moon, label: t("settings.darkMode"), value: "Off" },
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
            {t("settings.termsOfService")}
          </button>
          <button
            onClick={() => navigate("/privacy")}
            className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t("settings.privacyPolicy")}
          </button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" /> {t("auth.logout")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
