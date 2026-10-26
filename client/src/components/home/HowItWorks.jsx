import React from "react";
import "./HowItWorks.css";

const steps = [
  {
    step: "01",
    title: "Sign Up",
    description: "Create your account and tell us your class, goals, and preferred schedule.",
  },
  {
    step: "02",
    title: "Choose Course",
    description: "Pick the right class-wise or exam-focused track guided by our counselors.",
  },
  {
    step: "03",
    title: "Start Learning",
    description: "Attend live classes, practice regularly, and clear doubts with mentors.",
  },
  {
    step: "04",
    title: "Track Progress",
    description: "Review performance reports and improve with targeted feedback and planning.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="how-it-works-wrap">
        <header className="how-it-works-head">
          <h2>How It Works</h2>
          <p>A clear step-by-step process that keeps students focused and parents informed.</p>
        </header>

        <div className="how-it-works-grid">
          {steps.map((item, index) => (
            <article key={item.step} className="how-it-works-card">
              <span className="how-step-number">{item.step}</span>
              <span className="how-step-label">Step {index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="how-step-progress" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
