import React from "react";
import "./ProgramPage.css";

const EnglishSpeakingPage = () => {
  return (
    <div className="program-page">
      <div className="program-page-shell">
        <header className="program-page-header">
          <h1>English Speaking Program</h1>
          <p>
            Build fluent, confident English communication for academics, interviews, and daily conversations through
            guided speaking labs and mentor feedback.
          </p>
        </header>

        <section className="program-page-grid">
          <article className="program-card">
            <h2>Program Overview</h2>
            <p>
              This program focuses on pronunciation, clarity, confidence, and real conversation flow. Learners practice
              in live sessions with structured speaking tasks.
            </p>
            <span className="program-badge">Duration: 8 to 12 weeks</span>
          </article>

          <article className="program-card">
            <h2>Key Features</h2>
            <ul>
              <li>Live 1-on-1 and small-group speaking sessions</li>
              <li>Accent and pronunciation correction drills</li>
              <li>Vocabulary expansion for practical speaking</li>
              <li>Weekly recorded speaking feedback</li>
            </ul>
          </article>

          <article className="program-card">
            <h2>Benefits</h2>
            <ul>
              <li>Speak with better confidence and natural flow</li>
              <li>Improve interview and presentation communication</li>
              <li>Reduce hesitation in real conversations</li>
              <li>Develop stronger listening-response ability</li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
};

export default EnglishSpeakingPage;
