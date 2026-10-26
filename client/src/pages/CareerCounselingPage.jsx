import React from "react";
import "./ProgramPage.css";

const CareerCounselingPage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>Career Counseling Program</h1>
          <p>
            Get expert guidance to choose the right academic and career pathway based on strengths, interests,
            long-term goals, and market opportunities.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              The program combines aptitude-interest mapping, profile review, and mentor consultations to create a
              practical and realistic growth roadmap.
            </p>
            <span className="program-badge">Duration: 4 to 8 weeks</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Goal and profile discovery sessions</li>
              <li>Course and university pathway planning</li>
              <li>Application timeline and strategy planning</li>
              <li>Parent-student joint counseling support</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Clear decision-making with less confusion</li>
              <li>Aligned choices across academics and career</li>
              <li>Reduced risk of wrong course selection</li>
              <li>Actionable next steps for applications</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default CareerCounselingPage;
