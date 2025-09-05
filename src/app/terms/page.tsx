export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using SocialFlow, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              SocialFlow is an AI-powered social media management platform that helps users create, manage, and analyze social media content across multiple platforms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to use the service in compliance with all applicable laws and regulations</li>
              <li>You will not use the service for any illegal or unauthorized purpose</li>
              <li>You are responsible for all content you create and share through the platform</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. AI Content Generation</h2>
            <p className="text-gray-700 mb-4">
              Our AI content generation feature is provided as-is. While we strive for accuracy and quality, you are responsible for reviewing and approving all AI-generated content before publishing.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Privacy and Data</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              SocialFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to terminate or suspend your account at any time for violation of these terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Users will be notified of significant changes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms of Service, please contact us at support@socialflow.com
            </p>
          </div>

          <div className="mt-8 pt-8 border-t">
            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}