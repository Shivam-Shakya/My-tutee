import { useEffect, useRef, useState } from "react";
import "./AboutMyTutee.css";
import aboutImage from "../../assets/Homeimg1.png";
import chechbox from "../../assets/check-text.png";

const stats = [
  { label: "Happy Parents/Students", value: 5000, suffix: "+" },
  { label: "Classes Completed", value: 12000, suffix: "+" },
  { label: "Satisfaction Rate", value: 100, suffix: "%" },
  { label: "Certified Tutors", value: 300, suffix: "+" },
];

const AboutMyTutee = () => {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 1800;
    let animationFrameId;
    let startTime;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCounts(stats.map((item) => Math.floor(item.value * easedProgress)));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [hasAnimated]);

  return (
    <section className="about-mytutee" ref={sectionRef}>
      <div className="about-mytutee-container">
        <div className="about-mytutee-image-wrap">
          <img
            src={aboutImage}
            alt="Teacher guiding students in an interactive learning environment"
            className="about-mytutee-image"
            loading="lazy"
          />
        </div>

        <div className="about-mytutee-content">
          <h2 className="about-mytutee-eyebrow">About MyTutee</h2>
          <h1 className="about-mytutee-title">India's trusted <span> online tution </span> platform for quality education</h1>
          <p className="about-mytutee-description">
            MyTutee makes learning simple, flexible, and student-focused with expert teachers, interactive live classes, and personalized academic support for every learner.
          </p>
          <div className="about-mytutee-highlights">
          <p className="about-mytutee-highlight-item">
            <img src={chechbox} alt="Checkmark" className="about-mytutee-checkmark" />
            Expert Trainers
          </p>
          <p className="about-mytutee-highlight-item">
            <img src={chechbox} alt="Checkmark" className="about-mytutee-checkmark" />
            1-on-1 Live Tution
          </p>
          <p className="about-mytutee-highlight-item">
            <img src={chechbox} alt="Checkmark" className="about-mytutee-checkmark" />
            Flexible Timings
          </p>
          </div>
        </div>
      </div>
      <div className="about-mytutee-stats" aria-label="MyTutee achievements">
            {stats.map((stat, index) => (
              <div key={stat.label} className="about-mytutee-stat-box">
                <h3>
                  {counts[index]}
                  {stat.suffix}
                </h3>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
    </section>
  );
};

export default AboutMyTutee;
