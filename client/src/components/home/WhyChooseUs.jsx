import React from "react";
import "./WhyChooseUs.css";
import AboutMyTutee from "./AboutMyTutee";

const features = [
  {
    title: "Expert Teachers",
    description: "Learn from highly qualified mentors with strong academic and exam coaching experience.",
  },
  {
    title: "Flexible Learning",
    description: "Choose weekday or weekend slots with live and revision-friendly class scheduling.",
  },
  {
    title: "Affordable Pricing",
    description: "Access high-quality programs with transparent plans designed for long-term progress.",
  },
  {
    title: "Personalized Attention",
    description: "Get tailored study plans, regular feedback, and targeted doubt-solving support.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-section" id="why-choose-us">
      <AboutMyTutee />
      <div className="why-choose-wrap">
        <header className="why-choose-head">
          <h2>Why Choose Us</h2>
          <p>Built for students who want structured learning, measurable growth, and confidence in every exam season.</p>
        </header>

        <div className="why-choose-grid">
          {features.map((feature) => (
            <article className="why-choose-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
