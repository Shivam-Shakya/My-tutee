import React from "react";
import "./ProgramPage.css";

const VisaAssistancePage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>Visa Assistance Program</h1>
          <p>
            End-to-end guidance for student visa documentation, application preparation, and interview readiness for
            international study pathways.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              Students receive document checklists, statement guidance, and interview support to reduce delays and
              improve confidence in the visa process.
            </p>
            <span className="program-badge">Duration: 2 to 6 weeks</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Visa documentation planning support</li>
              <li>SOP and financial document guidance</li>
              <li>Interview preparation sessions</li>
              <li>Application timeline monitoring</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Improved process clarity and confidence</li>
              <li>Reduced documentation errors</li>
              <li>Better preparedness for visa interviews</li>
              <li>Smoother transition to destination country</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default VisaAssistancePage;
