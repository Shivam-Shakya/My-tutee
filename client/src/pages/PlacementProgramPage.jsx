import React from "react";
import "./ProgramPage.css";

const PlacementProgramPage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>Placement Program</h1>
          <p>
            Placement-focused mentoring to improve interview performance, communication, and role readiness for campus
            and off-campus opportunities.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              A practical placement track with mock interviews, domain-specific question practice, and personal branding
              support for stronger job outcomes.
            </p>
            <span className="program-badge">Duration: 4 to 10 weeks</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Role-specific interview preparation</li>
              <li>HR and technical mock interview rounds</li>
              <li>Communication and confidence coaching</li>
              <li>Offer-readiness strategy sessions</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Improved conversion from interview to offer</li>
              <li>Better response quality under pressure</li>
              <li>Clear preparation strategy for target roles</li>
              <li>Higher placement confidence and readiness</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default PlacementProgramPage;
