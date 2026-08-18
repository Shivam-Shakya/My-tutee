import React from "react";
import "./LegalInfo.css";

const TermsPage = () => {
  return (
    <div className="data-page">
      <section className="data-hero">
        <div className="data-hero-inner">
          <h1>Terms & Conditions</h1>
          <p>
            Please review these terms before using the myTutee platform and its
            services.
          </p>
        </div>
      </section>

      <section className="data-content">
        <p className="data-meta">Last updated: March 19, 2026</p>

        <article className="data-section">
          <h2>Introduction</h2>
          <p>
            These Terms and Conditions govern your access to and use of the myTutee
            platform, including classes, assignments, communication tools, and related
            educational services. By creating an account, accessing a course, or using
            any feature of the platform, you agree to follow these terms and all
            applicable laws. If you do not agree with these terms, you should discontinue
            use of the platform.
          </p>
          <p>
            Our services are designed to support learning outcomes for students and to
            provide transparent collaboration between students, parents, teachers, and
            support staff. These terms are intended to protect users, maintain service
            quality, and ensure fair use of shared resources. We recommend reading this
            page carefully before using your account for any academic activity.
          </p>
        </article>

        <article className="data-section">
          <h2>User Responsibilities</h2>
          <p>
            Users are expected to engage with the platform respectfully and honestly.
            This includes accurate profile information, appropriate communication, and
            authentic academic participation. You are responsible for all activity that
            occurs through your account.
          </p>
          <h3>Core responsibilities include:</h3>
          <ul>
            <li>Providing truthful registration and contact details.</li>
            <li>Keeping login credentials private and secure.</li>
            <li>Participating in classes, chats, and forums respectfully.</li>
            <li>Submitting original work unless collaboration is clearly allowed.</li>
            <li>Reporting unauthorized account access immediately.</li>
          </ul>
        </article>

        <article className="data-section">
          <h2>Account Usage</h2>
          <p>
            Your account is personal and may not be transferred, sold, rented, or shared
            with unauthorized users. Access permissions are based on role, such as
            student, parent, or teacher, and each role has specific feature access.
            Misuse of access rights may result in temporary suspension while we review
            account activity.
          </p>
          <h3>To maintain proper account usage:</h3>
          <ol>
            <li>Use only one verified account unless told otherwise by support.</li>
            <li>Use the account for lawful educational purposes only.</li>
            <li>Do not attempt to bypass role restrictions or paid feature controls.</li>
            <li>Keep device security updated to reduce risk of unauthorized access.</li>
          </ol>
        </article>

        <article className="data-section">
          <h2>Prohibited Activities</h2>
          <p>
            To ensure a safe and reliable environment, certain activities are not allowed
            on the platform. Any behavior that harms users, interrupts learning, or
            violates legal or ethical standards may lead to enforcement action.
          </p>
          <ul>
            <li>Posting abusive, hateful, threatening, or misleading content.</li>
            <li>Cheating, plagiarism, or manipulating tests and assignments.</li>
            <li>Uploading malware, harmful scripts, or unauthorized files.</li>
            <li>Attempting to access private data without authorization.</li>
            <li>Using automation to scrape, copy, or overload platform resources.</li>
          </ul>
        </article>

        <article className="data-section">
          <h2>Intellectual Property</h2>
          <p>
            Platform content, including course materials, lesson recordings, branding,
            and educational tools, is protected by intellectual property laws and remains
            the property of myTutee or its licensors. Users receive limited access for
            personal educational use and may not reuse protected content for commercial
            distribution or unauthorized publication.
          </p>
          <p>
            If you submit content, such as assignments or feedback, you retain ownership
            of your original work. However, you grant us a limited right to process,
            store, and display that content as needed to deliver services, conduct
            assessments, and improve product experience.
          </p>
        </article>

        <article className="data-section">
          <h2>Limitation of Liability</h2>
          <p>
            We aim to provide continuous and high-quality educational services, but we
            cannot guarantee uninterrupted access in all situations. Temporary downtime,
            maintenance windows, network failures, or third-party service disruptions may
            occur. We are not liable for indirect or consequential losses resulting from
            such interruptions where permitted by law.
          </p>
          <p>
            Users should maintain personal backups of important academic materials and
            avoid relying on a single storage location. Nothing in these terms excludes
            legal rights that cannot be waived under applicable consumer protection laws.
          </p>
        </article>

        <article className="data-section">
          <h2>Termination Policy</h2>
          <p>
            We may suspend or terminate access if there is a serious breach of these
            terms, repeated misuse, fraudulent behavior, or legal risk. In many cases we
            will provide notice and a chance to correct non-critical violations.
          </p>
          <h3>Access may be restricted when:</h3>
          <ul>
            <li>Security incidents indicate compromised account activity.</li>
            <li>Repeated policy violations continue after warning.</li>
            <li>Payments remain unresolved for paid features where applicable.</li>
            <li>Required legal compliance obligations are not met.</li>
          </ul>
        </article>

        <article className="data-section">
          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms and Conditions to reflect service improvements,
            legal requirements, or policy clarifications. When material changes are made,
            we will update the effective date and publish the revised version on this
            page. Continued use of the platform after updates means you accept the new
            terms.
          </p>
          <p>
            If you have questions about these terms, please contact support so we can
            clarify the relevant policy sections before you continue using the service.
          </p>
        </article>
      </section>
    </div>
  );
};

export default TermsPage;
