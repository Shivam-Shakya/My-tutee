import React from "react";
import "./ProgramPage.css";

const TestPrepPage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>Test Prep Program</h1>
          <p>
            Structured test-preparation support for international and competitive exams with concept mastery, strategy,
            and targeted score improvement.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              Students receive guided section-wise preparation, timed drills, and mock analysis to improve consistency,
              speed, and exam execution.
            </p>
            <span className="program-badge">Duration: 10 to 20 weeks</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Diagnostic test and personalized study plan</li>
              <li>Topic-wise classes and sectional practice</li>
              <li>Mock-test ecosystem with deep analysis</li>
              <li>Mentor-led weak-area correction cycles</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Higher score predictability and confidence</li>
              <li>Better time management under pressure</li>
              <li>Improved accuracy through error mapping</li>
              <li>Clear roadmap from baseline to target score</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default TestPrepPage;
