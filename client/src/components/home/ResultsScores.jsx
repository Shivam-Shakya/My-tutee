import React from "react";
import "./ResultsScores.css";

const metrics = [
  { value: "98%", label: "Improvement in test consistency" },
  { value: "5000+", label: "Students and parents trained" },
  { value: "12000+", label: "Classes completed successfully" },
  { value: "1540", label: "Top SAT score achieved" },
];

const achievements = [
  "Top ranks in SAT, ACT, and AP programs",
  "Board exam score jumps within one academic cycle",
  "Personalized progress reviews with monthly reports",
];

const ResultsScores = () => {
  return (
    <section className="results-section" id="results">
      <div className="results-wrap">
        <header className="results-head">
          <h2>Results / Scores</h2>
          <p>Student achievements, exam outcomes, and success statistics that reflect consistent effort and smart guidance.</p>
        </header>

        <div className="results-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="result-metric-card">
              <h3>{metric.value}</h3>
              <p>{metric.label}</p>
            </article>
          ))}
        </div>

        <ul className="results-list" aria-label="Student achievements">
          {achievements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ResultsScores;
