import React from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";
import AboutMyTutee from "../components/home/AboutMyTutee";
import missionImage from "../assets/teachers/teach5.jpg";
import visionImage from "../assets/teachers/teach6.jpg";
import teacherOneImage from "../assets/teachers/teach1.jpg";
import teacherTwoImage from "../assets/teachers/teach2.jpg";
import teacherThreeImage from "../assets/teachers/teach3.jpg";


const keyPoints = [
  {
    icon: "👨‍🏫",
    title: "Expert Teachers",
    desc: "Certified, experienced educators specializing in international curricula.",
  },
  {
    icon: "🎥",
    title: "Live & Recorded Classes",
    desc: "Learn at your pace with interactive live sessions and on-demand lectures.",
  },
  {
    icon: "💬",
    title: "Personal Support",
    desc: "Get guidance, resolve doubts, and stay motivated throughout your journey.",
  },
];

const teacherHighlights = [
  {
    name: "Dr. Riya Malhotra",
    qualification: "M.Sc. Mathematics, B.Ed.",
    experience: "10+ years teaching SAT, AP, and IGCSE with a strong record of score improvement.",
    image: teacherOneImage,
  },
  {
    name: "Aman Khanna",
    qualification: "B.Tech. Computer Science",
    experience: "8+ years mentoring coding and data science through project-based learning.",
    image: teacherTwoImage,
  },
  {
    name: "Niharika Rao",
    qualification: "M.A. English Literature",
    experience: "9+ years coaching communication and test prep with personalized study plans.",
    image: teacherThreeImage,
  },
];


const missionPoints = [
  "Quality education for all students",
  "Experienced and certified teachers",
  "Flexible and personalized learning plans",
  "Focus on student growth and performance",
  "Technology-driven teaching methods",
];

const visionPoints = [
  "Build a future-ready global learning community",
  "Make premium education accessible across locations",
  "Use innovation to improve learning outcomes",
  "Create confident, independent learners",
  "Set new standards in online academic mentoring",
];


const AboutPage = () => {
  return (
    <div className="about-page">
      {/* ── HERO ── */}
      <section className="about-hero-simple">
        <div className="about-hero-inner">
          <h1>About Us</h1>
          <p className="about-tagline">Your Path to Academic Excellence</p>
          <p className="about-intro">
            We provide comprehensive online learning support across multiple international courses and curricula. Our mission is to help students achieve their academic goals through expert teaching, structured learning programs, and personalized guidance.
          </p>
          <Link to="/" className="about-btn-primary">
            Explore Courses
          </Link>
        </div>
      </section>
      <AboutMyTutee />

      {/* ── MISSION & VISION ── */}
      <section className="about-mission-vision">
        <div className="about-container">
          <div className="about-section-head">
            <h2>Our Mission</h2>
          </div>
          <div className="mission-vision-row mission-row">
            <article className="mission-vision-copy">
              <p>
                We are committed to delivering quality education through expert guidance, personalized support, and consistent student progress.
              </p>
              <ul className="mission-vision-points">
                {missionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <div className="mission-vision-media">
              <img src={missionImage} alt="Teacher guiding students in an online class" loading="lazy" />
            </div>
          </div>

          <div className="about-section-head about-section-head-vision">
            <h2>Our Vision</h2>
          </div>
          <div className="mission-vision-row vision-row">
            <div className="mission-vision-media">
              <img src={visionImage} alt="Students learning together in a virtual classroom" loading="lazy" />
            </div>
            <article className="mission-vision-copy">
              <p>
                Our goal is to build a future-ready learning ecosystem that creates confident learners and long-term academic impact.
              </p>
              <ul className="mission-vision-points">
                {visionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ── TEACHERS ── */}
      <section className="about-teachers">
        <div className="about-container">
          <div className="about-section-head">
            <h2>Our Teachers</h2>
            <p className="about-section-subtitle">
              Learn from expert teachers with strong academic qualifications and years of hands-on teaching experience.
            </p>
          </div>
          <div className="teachers-grid">
            {teacherHighlights.map((teacher) => (
              <article className="teacher-card" key={teacher.name}>
                <img src={teacher.image} alt={`${teacher.name} profile`} className="teacher-image" loading="lazy" />
                <div className="teacher-details">
                  <h3>{teacher.name}</h3>
                  <p className="teacher-qualification">{teacher.qualification}</p>
                  <p className="teacher-experience">{teacher.experience}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="about-why-choose">
        <div className="about-container">
          <div className="about-section-head">
            <h2>Why Choose Us</h2>
            <p>
              Discover the key reasons families trust MyTutee for high-quality teaching, flexible schedules, and learner-focused outcomes.
            </p>
          </div>
          <div className="key-points-grid">
            {keyPoints.map((point) => (
              <div className="key-point-card" key={point.title}>
                <span className="key-point-icon">{point.icon}</span>
                <h3>{point.title}</h3>
                <p>{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-simple">
        <div className="about-container">
          <div className="about-section-head about-section-head-light">
            <h2>Ready to Get Started?</h2>
            <p>Join hundreds of students achieving their academic goals.</p>
          </div>
          <Link to="/contact" className="about-btn-primary">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
