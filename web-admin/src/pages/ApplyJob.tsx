import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Upload,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const STEPS = [
  "Contact Info",
  "Resume",
  "Cover Letter",
  "Additional",
  "Review",
];

export default function ApplyJob() {
  const { id: jobId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    location: user?.country || "",
    resume: null as File | null,
    coverLetter: "",
    whyYou: "",
    availability: "",
    salaryExpectation: "",
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const canNext = useCallback(() => {
    if (step === 0) return !!form.fullName && !!form.email;
    if (step === 2) return form.coverLetter.length >= 50;
    return true;
  }, [step, form]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user || !jobId) return;
      setIsSubmitting(true);
      try {
        await trpc.jobs.submitApplication.mutate({
          jobId,
          userId: user.id,
          coverLetter: form.coverLetter,
        });
        navigate(`/jobs/${jobId}`, { replace: true });
      } catch {
        alert("Failed to submit application. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [jobId, user, form.coverLetter, navigate],
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          to={`/jobs/${jobId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to job
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`flex items-center gap-2 text-sm font-medium ${
                  i <= step ? "text-[#0A66C2]" : "text-gray-300"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < step
                      ? "bg-[#0A66C2] text-white"
                      : i === step
                        ? "bg-[#0A66C2] text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-[#0A66C2] rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={step === STEPS.length - 1 ? handleSubmit : undefined}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{STEPS[step]}</h2>

            {/* Step 0: Contact */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.fullName} onChange={update("fullName")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={update("email")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="tel" value={form.phoneNumber} onChange={update("phoneNumber")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={form.location} onChange={update("location")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Resume */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0A66C2] transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">Upload your resume</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (max 5MB)</p>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                  <Button type="button" variant="outline" size="sm" className="mt-4 rounded-full">
                    Choose File
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Cover Letter */}
            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover Letter * <span className="text-gray-400 font-normal">(min 50 characters)</span>
                </label>
                <textarea
                  value={form.coverLetter}
                  onChange={update("coverLetter")}
                  rows={8}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.coverLetter.length} characters</p>
              </div>
            )}

            {/* Step 3: Additional */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Why should we hire you?</label>
                  <textarea value={form.whyYou} onChange={update("whyYou")} rows={3}
                    placeholder="What makes you the ideal candidate?"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> Availability
                    </label>
                    <input type="text" value={form.availability} onChange={update("availability")}
                      placeholder="Immediate / 2 weeks..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <DollarSign className="w-3.5 h-3.5 inline mr-1" /> Salary Expectation
                    </label>
                    <input type="text" value={form.salaryExpectation} onChange={update("salaryExpectation")}
                      placeholder="e.g. $50,000"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Application Summary</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {form.fullName}</p>
                    <p><span className="text-gray-500">Email:</span> {form.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {form.phoneNumber || "—"}</p>
                    <p><span className="text-gray-500">Location:</span> {form.location || "—"}</p>
                    <div>
                      <span className="text-gray-500">Cover Letter:</span>
                      <p className="mt-1 text-gray-700 whitespace-pre-wrap">{form.coverLetter.slice(0, 200)}{form.coverLetter.length > 200 ? "..." : ""}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  By submitting, you confirm this information is accurate and you agree to TalentBridge's Terms.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canNext()}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182]"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#0A66C2] hover:bg-[#004182] gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}
