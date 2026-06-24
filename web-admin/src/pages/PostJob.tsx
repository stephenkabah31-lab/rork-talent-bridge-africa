import { Briefcase, DollarSign, MapPin, FileText, Plus, X } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    company: user?.companyName || user?.fullName || "",
    location: "",
    type: "Full-time" as "Full-time" | "Part-time" | "Contract" | "Remote",
    salary: "",
    description: "",
    requirements: [] as string[],
    newRequirement: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const addRequirement = () => {
    if (form.newRequirement.trim() && !form.requirements.includes(form.newRequirement.trim())) {
      setForm((p) => ({
        ...p,
        requirements: [...p.requirements, p.newRequirement.trim()],
        newRequirement: "",
      }));
    }
  };

  const removeRequirement = (r: string) => {
    setForm((p) => ({ ...p, requirements: p.requirements.filter((x) => x !== r) }));
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.title || !form.location || !form.description) {
        setError("Title, location, and description are required");
        return;
      }
      if (form.description.length < 100) {
        setError("Description must be at least 100 characters");
        return;
      }

      setIsLoading(true);
      try {
        await trpc.jobs.create.mutate({
          title: form.title,
          company: form.company || "My Company",
          location: form.location,
          type: form.type,
          salary: form.salary || undefined,
          description: form.description,
          requirements: form.requirements,
          postedBy: user.id,
        });
        navigate("/feed", { replace: true });
      } catch {
        setError("Failed to post job. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [form, user, navigate],
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Post a Job</h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Lagos, Nigeria"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as typeof form.type }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. $50,000 - $70,000"
                    value={form.salary}
                    onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description * <span className="text-gray-400 font-normal">(min 100 characters)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length} characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Requirements</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.requirements.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                    {r}
                    <button type="button" onClick={() => removeRequirement(r)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a requirement"
                  value={form.newRequirement}
                  onChange={(e) => setForm((p) => ({ ...p, newRequirement: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                />
                <Button type="button" onClick={addRequirement} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#D97706] hover:bg-[#9A3412] h-11 font-semibold"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isLoading ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
