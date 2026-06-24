import { Crown, CheckCircle, Star, Users, Briefcase, MessageCircle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const FEATURES = [
  "Direct messaging with recruiters",
  "Advanced job search filters",
  "See who viewed your profile",
  "Priority application review",
  "Featured profile badge",
  "Unlimited connection requests",
  "Interview scheduling tools",
  "Analytics dashboard",
];

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "NGN", symbol: "₦", rate: 1550 },
  { code: "KES", symbol: "KSh", rate: 129 },
  { code: "GHS", symbol: "GH₵", rate: 12.5 },
  { code: "ZAR", symbol: "R", rate: 18.5 },
  { code: "EGP", symbol: "E£", rate: 48 },
];

export default function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const price = Math.round(9.99 * currency.rate);
  const yearlyPrice = Math.round(99.99 * currency.rate);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // Simulate payment
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);
    alert("Subscription successful! Welcome to Premium.");
    navigate("/feed");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Currency selector */}
        <div className="flex items-center justify-end mb-8 gap-2">
          <span className="text-sm text-gray-500">Currency:</span>
          <select
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value) || CURRENCIES[0])}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-2xl p-8 text-white text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-white" /> Premium
          </div>
          <h1 className="text-3xl font-bold mb-2">Unlock Your Full Potential</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Get the tools you need to stand out, connect directly, and accelerate your career.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-gray-900">
                {currency.symbol}{price}
              </span>
              <span className="text-gray-500">/month</span>
            </div>
            <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-sm font-medium inline-block mb-4">
              Save 17% with annual billing ({currency.symbol}{yearlyPrice}/year)
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full rounded-full bg-amber-500 hover:bg-amber-600 h-12 text-base font-bold mb-4"
            >
              <Crown className="w-5 h-5 mr-2" />
              {isProcessing ? "Processing..." : "Subscribe Now"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Cancel anytime. No long-term commitment.
            </p>
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 p-8 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Everything in Premium:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Why Go Premium?</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Premium members get 3x more profile views and 2x more job interviews on average.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "3x More Views", desc: "Your profile gets priority placement" },
            { icon: Briefcase, label: "2x More Interviews", desc: "Stand out to recruiters" },
            { icon: TrendingUp, label: "Faster Growth", desc: "Unlock advanced networking tools" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-bold text-lg text-gray-900">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
