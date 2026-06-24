import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-sm text-[#D97706] hover:underline mb-8 inline-block">
          ← Back to TalentBridge
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TalentBridge, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Account Registration</h2>
            <p>
              You must provide accurate information when creating an account. You are responsible
              for maintaining the confidentiality of your account credentials and for all activities
              under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. User Conduct</h2>
            <p>
              Users must not post false, misleading, or inappropriate content. Harassment,
              discrimination, and spam are strictly prohibited. TalentBridge reserves the right
              to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Job Listings & Applications</h2>
            <p>
              Employers are responsible for the accuracy of their job listings. TalentBridge
              does not guarantee employment or the quality of applications received.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Premium Services</h2>
            <p>
              Premium subscriptions are billed on a recurring basis. You may cancel at any time,
              and your access will continue until the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Privacy</h2>
            <p>
              Your use of TalentBridge is also governed by our Privacy Policy, which explains
              how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Limitation of Liability</h2>
            <p>
              TalentBridge is provided "as is" without warranties of any kind. We are not liable
              for any damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
            <p>
              For questions about these terms, contact us at legal@talentbridge.com.
            </p>
          </section>

          <p className="text-xs text-gray-400 pt-4">Last updated: June 2025</p>
        </div>
      </div>
    </div>
  );
}
