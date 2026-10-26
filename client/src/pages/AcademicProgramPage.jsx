import React from "react";
import "./ProgramPage.css";

const AcademicProgramPage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>Academic Program</h1>
          <p>
            Academic support for school curricula with personalized mentoring, homework support, and concept-driven
            revision for stronger classroom performance.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              Designed for continuous academic growth through structured classes, regular assessments, and progress
              tracking in core subjects.
            </p>
            <span className="program-badge">Duration: Ongoing monthly plans</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Board-aligned subject mentoring</li>
              <li>Weekly worksheets and chapter tests</li>
              <li>Doubt-solving and concept reinforcement</li>
              <li>Monthly progress reporting</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Improved grades and conceptual strength</li>
              <li>Better consistency in school assessments</li>
              <li>Reduced exam stress through planned revision</li>
              <li>Long-term confidence across subjects</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default AcademicProgramPage;
