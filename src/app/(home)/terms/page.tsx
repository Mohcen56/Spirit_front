export const metadata = {
  title: "Legal Policy | TriviaSpirit",
  description:
    "Terms of Service, Privacy Policy, and Refund Policy for TriviaSpirit — an online trivia game.",
};

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">TriviaSpirit — Legal Policy</h1>
      <p className="text-sm text-gray-500 mb-10 text-center">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      {/* TERMS OF SERVICE */}
      <h2 className="text-2xl font-semibold mt-8 mb-3">1. Terms of Service</h2>
      <p className="mb-4">
        Welcome to TriviaSpirit, an online trivia game available at triviaspirit.com. By accessing
        or using the service, you agree to the following terms.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">1.1 Use of the Service</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>Do not attempt to cheat, exploit, or manipulate gameplay.</li>
        <li>Do not hack, reverse-engineer, or damage the service.</li>
        <li>Do not upload malicious or harmful content.</li>
        <li>Do not create multiple accounts to abuse features.</li>
      </ul>

      <h3 className="text-xl font-medium mt-4 mb-2">1.2 Accounts</h3>
      <p className="mb-4">
        You are responsible for maintaining the security of your account. We may suspend accounts
        involved in abuse or fraudulent activity.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">1.3 Premium Access</h3>
      <p className="mb-4">
        TriviaSpirit Premium is a one-time purchase that unlocks additional features and content.
        Access is delivered instantly upon successful payment and remains valid as long as the
        service is available.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">1.4 Definition of “Lifetime Access”</h3>
      <p className="mb-4">
        “Lifetime Access” refers to the operational lifespan of the TriviaSpirit service or any
        underlying technical platform it depends on — whichever ends first. It does not refer to the
        lifetime of the purchaser. Access is available only while TriviaSpirit remains supported and
        technically functional.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">
        1.5 Third-Party Dependency & Termination
      </h3>
      <p className="mb-4">
        TriviaSpirit relies on third-party technologies, hosting providers, and APIs. If any such
        provider discontinues service, updates their systems, or becomes incompatible in a way that
        prevents TriviaSpirit from functioning, the “Lifetime Access” period will be considered
        ended. These events do not qualify users for refunds or compensation.
      </p>

      {/* PRIVACY POLICY */}
      <h2 className="text-2xl font-semibold mt-10 mb-3">2. Privacy Policy</h2>

      <h3 className="text-xl font-medium mt-4 mb-2">2.1 Information We Collect</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>Email (if you sign up)</li>
        <li>Username</li>
        <li>Game progress and category history</li>
        <li>Premium status</li>
        <li>Device/browser information (IP region, non-precise)</li>
        <li>Payment confirmation data from Lemon Squeezy (no card information)</li>
      </ul>

      <h3 className="text-xl font-medium mt-4 mb-2">2.2 How We Use Your Data</h3>
      <ul className="list-disc ml-6 mb-4">
        <li>Manage your account</li>
        <li>Track premium access</li>
        <li>Save game progress</li>
        <li>Improve gameplay and content</li>
        <li>Detect abuse or cheating</li>
        <li>Security and analytics</li>
      </ul>

      <h3 className="text-xl font-medium mt-4 mb-2">2.3 Third-Party Services</h3>
      <p className="mb-4">
        TriviaSpirit uses services such as Lemon Squeezy, Vercel, Cloudflare, and Google Analytics.
        These providers may process limited technical data to support game functionality.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">2.4 Cookies</h3>
      <p className="mb-4">
        Cookies are used for authentication, saving preferences, analytics, and overall gameplay
        functionality. Disabling cookies may break essential features.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">2.5 Data Security</h3>
      <p className="mb-4">
        We use secure hosting, encryption, and access control to protect your data to the best
        reasonable extent.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">2.6 Data Deletion / GDPR Rights</h3>
      <p className="mb-4">
        You may request deletion, correction, or export of your data by emailing
        {" "}
        <strong>support@triviaspirit.com</strong>. We respond within 30 days.
      </p>

      {/* REFUND POLICY */}
      <h2 className="text-2xl font-semibold mt-10 mb-3">3. Refund Policy</h2>
      <p className="mb-4">
        TriviaSpirit Premium is a digital product delivered instantly. Refunds are only issued in
        cases where:
      </p>

      <ul className="list-disc ml-6 mb-4">
        <li>A technical issue prevents access after payment</li>
        <li>An incorrect or duplicate charge occurred</li>
        <li>A verified error was made during processing</li>
      </ul>

      <p className="mb-4">
        Refunds are <strong>not provided</strong> for reasons such as:
      </p>

      <ul className="list-disc ml-6 mb-4">
        <li>Changing your mind</li>
        <li>No longer wanting the game</li>
        <li>Expecting different content</li>
        <li>General dissatisfaction unrelated to functionality</li>
      </ul>

      <h3 className="text-xl font-medium mt-4 mb-2">
        3.3 Third-Party Service Shutdown / Technical Limitations
      </h3>
      <p className="mb-4">
        Refunds are not provided if TriviaSpirit becomes unavailable due to external factors such as
        API shutdowns, hosting failures, platform restrictions, or any third-party changes outside
        our control. These events represent the end of the product’s operational lifetime.
      </p>

      <h3 className="text-xl font-medium mt-4 mb-2">3.4 How to Request a Refund</h3>
      <p className="mb-4">
        If you believe your payment was processed incorrectly, email
        {" "}
        <strong>support@triviaspirit.com</strong> with your Order ID and issue details. We respond
        within 7 days.
      </p>

      {/* CONTACT */}
      <h2 className="text-2xl font-semibold mt-10 mb-3">4. Contact Information</h2>
      <p className="mb-4">
        For any legal, privacy, or refund matters, contact:
        {" "}
        <strong>support@triviaspirit.com</strong>
      </p>

      {/* CHANGES */}
      <h2 className="text-2xl font-semibold mt-10 mb-3">5. Changes to This Policy</h2>
      <p className="mb-10">
        We may update this legal policy periodically. Continued use of TriviaSpirit signifies
        acceptance of any revised terms.
      </p>
    </div>
  );
}
