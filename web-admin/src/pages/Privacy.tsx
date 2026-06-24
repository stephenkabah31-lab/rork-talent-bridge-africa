import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-sm text-[#0A66C2] hover:underline mb-8 inline-block">
          ← Back to TalentBridge
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
            <p>
              We collect information you provide when creating an account, including your name,
              email address, phone number, location, professional background, and any documents
              you upload (resumes, cover letters).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our services, connect you with
              relevant job opportunities and professionals, and communicate with you about
              your account and our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with employers
              when you apply for jobs, and with service providers who help us operate the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You
              can manage your privacy settings from your account settings page at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Cookies</h2>
            <p>
              We use cookies to improve your experience, remember your preferences, and analyze
              how our platform is used. You can control cookie settings in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at privacy@talentbridge.com.
            </p>
          </section>

          <p className="text-xs text-gray-400 pt-4">Last updated: June 2025</p>
        </div>
      </div>
    </div>
  );
}
