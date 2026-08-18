import React from "react";
import "./LegalInfo.css";

const PrivacyPolicyPage = () => {
  return (
    <div className="data-page">
      <section className="data-hero">
        <div className="data-hero-inner">
          <h1>Privacy Policy</h1>
          <p>
            We respect your privacy and are committed to protecting your personal
            information.
          </p>
        </div>
      </section>

      <section className="data-content">
        <p className="data-meta">Last updated: March 19, 2026</p>

        <article className="data-section">
          <h2>Introduction</h2>
          <p>
            This Privacy Policy explains how myTutee collects, uses, stores, and protects
            personal information when you access our educational services. We are
            committed to handling data responsibly and transparently, and to supporting a
            safe learning environment for students, parents, teachers, and support teams.
          </p>
          <p>
            By using our website, mobile experiences, dashboards, and learning tools, you
            acknowledge that your information may be processed according to this policy.
            We encourage you to review each section carefully to understand what data is
            collected, why it is collected, and what choices are available to you.
          </p>
        </article>

        <article className="data-section">
          <h2>Information We Collect</h2>
          <p>
            We collect information that helps us provide educational services, manage user
            accounts, improve product performance, and maintain account security.
            Depending on your role and usage, collected data may include personal,
            academic, and technical information.
          </p>
          <h3>Typical categories include:</h3>
          <ul>
            <li>Profile data such as name, email address, phone number, and role.</li>
            <li>Academic activity including attendance, assignments, and test records.</li>
            <li>Communication data from support tickets, messages, or feedback forms.</li>
            <li>Device and usage data, such as browser type and session analytics.</li>
          </ul>
        </article>

        <article className="data-section">
          <h2>How We Use Information</h2>
          <p>
            We use collected information to deliver core platform functionality,
            personalize learning experiences, and provide responsive support. Data is used
            only where there is a valid service, legal, or operational purpose.
          </p>
          <ol>
            <li>Create and maintain user accounts securely.</li>
            <li>Deliver classes, assignments, and assessments.</li>
            <li>Track progress and provide performance insights.</li>
            <li>Send service notifications and important account updates.</li>
            <li>Improve product quality through aggregated usage analysis.</li>
          </ol>
          <p>
            We do not sell personal information to third parties. Where communication
            messages are sent, they are limited to educational operations, support, and
            important policy or service updates.
          </p>
        </article>

        <article className="data-section">
          <h2>Data Protection</h2>
          <p>
            We apply administrative, technical, and organizational safeguards to protect
            user information from unauthorized access, alteration, loss, or misuse.
            Security measures are reviewed periodically and adjusted to evolving threats.
          </p>
          <h3>Protection controls include:</h3>
          <ul>
            <li>Role-based access to sensitive systems and internal tools.</li>
            <li>Secure authentication and password management practices.</li>
            <li>Monitoring for suspicious activity and potential abuse.</li>
            <li>Data handling processes aligned with least-privilege principles.</li>
          </ul>
          <p>
            While we use reasonable safeguards, no digital system can guarantee absolute
            security. Users should also protect account credentials and notify us quickly
            if they suspect unauthorized account access.
          </p>
        </article>

        <article className="data-section">
          <h2>Cookies Policy</h2>
          <p>
            We use cookies and related technologies to support login sessions, maintain
            user preferences, and analyze platform performance. Some cookies are necessary
            for core functionality, while others help us improve user experience.
          </p>
          <p>
            You can manage browser cookie settings at any time. Disabling certain cookies
            may affect site performance or limit access to specific features.
          </p>
        </article>

        <article className="data-section">
          <h2>Third-Party Services</h2>
          <p>
            We may use trusted third-party service providers for hosting, analytics,
            communication, and payment workflows. These providers process data only as
            required to support authorized services and are expected to maintain
            appropriate security and confidentiality standards.
          </p>
          <p>
            Where third-party links or integrations are provided, their own privacy
            policies apply. We recommend reviewing those policies before sharing personal
            information on external platforms.
          </p>
        </article>

        <article className="data-section">
          <h2>User Rights</h2>
          <p>
            Depending on applicable laws, users may request access to personal data,
            correction of inaccurate records, deletion of specific information, or
            restriction of certain processing activities.
          </p>
          <h3>You may request to:</h3>
          <ul>
            <li>Review what personal data is stored in your account.</li>
            <li>Update incorrect or outdated profile information.</li>
            <li>Delete eligible data where retention is not legally required.</li>
            <li>Raise concerns related to privacy handling practices.</li>
          </ul>
          <p>
            To exercise these rights, contact support with sufficient account details so
            we can verify identity and process requests securely.
          </p>
        </article>

        <article className="data-section">
          <h2>Changes to Policy</h2>
          <p>
            We may update this Privacy Policy to reflect product changes, legal
            requirements, or improved compliance practices. Updated versions will be
            posted on this page with a revised effective date.
          </p>
          <p>
            Continued use of the platform after policy updates indicates acceptance of the
            revised terms. If you have questions about this policy, please contact support
            for clarification before continuing to use the service.
          </p>
        </article>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
