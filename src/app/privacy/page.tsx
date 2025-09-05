export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and email address</li>
              <li>Organization information</li>
              <li>Profile information and preferences</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Usage Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Content you create and manage through our platform</li>
              <li>Social media account connections (with your permission)</li>
              <li>Analytics and performance data</li>
              <li>Platform usage patterns</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>To provide and maintain our services</li>
              <li>To improve and personalize your experience</li>
              <li>To generate AI-powered content recommendations</li>
              <li>To analyze platform performance and usage</li>
              <li>To communicate with you about updates and features</li>
              <li>To provide customer support</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Service Providers</h3>
            <p className="text-gray-700 mb-4">
              We may share information with trusted service providers who assist us in operating our platform, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Cloud hosting and storage providers</li>
              <li>AI and machine learning services</li>
              <li>Analytics and monitoring services</li>
              <li>Customer support tools</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Monitoring for unauthorized access</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. AI and Machine Learning</h2>
            <p className="text-gray-700 mb-4">
              Our AI content generation features may process your content and preferences to provide personalized recommendations. This processing helps improve the relevance and quality of generated content.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Social Media Integration</h2>
            <p className="text-gray-700 mb-4">
              When you connect your social media accounts, we only access the information necessary to provide our services. We respect the privacy settings and permissions of your connected accounts.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights and Choices</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Manage social media account connections</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and data at any time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy, please contact us at privacy@socialflow.com
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