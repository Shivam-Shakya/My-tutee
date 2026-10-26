import React from "react";
import "./ProgramPage.css";

const ResumeMakingPage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>Resume Making Program</h1>
          <p>
            Build a professional, results-focused resume for internships, scholarships, and early career opportunities
            with expert profile positioning.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              This program helps students and fresh applicants create ATS-friendly resumes with clear impact statements
              and role-specific formatting.
            </p>
            <span className="program-badge">Duration: 1 to 2 weeks</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Profile audit and role mapping</li>
              <li>Resume structure and content optimization</li>
              <li>Achievement bullet-point enhancement</li>
              <li>Final polish with recruiter-ready format</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Stronger first impression for applications</li>
              <li>Better shortlisting probability</li>
              <li>Clear communication of strengths and impact</li>
              <li>Reusable resume base for multiple roles</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default ResumeMakingPage;
