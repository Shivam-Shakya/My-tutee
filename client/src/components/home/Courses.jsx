import React from "react";
import "./Courses.css";
import { NavLink } from "react-router-dom";

const courses = [
  {
    title: "SAT",
    description: "Master verbal and math strategy with timed practice and weekly mocks.",
    link: "/SatPage",
    theme: "gold",
  },
  {
    title: "ACT",
    description: "Build speed and accuracy across English, Math, Reading, and Science.",
    link: "/ActPage",
    theme: "dark",
  },
  {
    title: "AP Courses",
    description: "Score 5/5 with concept clarity, question banks, and exam simulations.",
    link: "/ApPage",
    theme: "gold",
  },
  {
    title: "IB-DP",
    description: "Structured guidance for HL/SL subjects with internal assessment support.",
    link: "/Ib-dpPage",
    theme: "dark",
  },
  {
    title: "IB-MYP",
    description: "Foundation-first learning to strengthen problem solving and writing skills.",
    link: "/Ib-mypPage",
    theme: "gold",
  },
  {
    title: "IGCSE",
    description: "Topic-focused classes with chapter tests and revision boosters.",
    link: "/IgcsePage",
    theme: "dark",
  },
  {
    title: "PSAT",
    description: "Prepare early with adaptive drills and score-improvement analytics.",
    link: "/PsatPage",
    theme: "gold",
  },
  {
    title: "TMUA",
    description: "Advanced mathematics admissions prep with reasoning-intensive training.",
    link: "/TmuaPage",
    theme: "dark",
  },
  {
    title: "ESAT",
    description: "Science and engineering aptitude prep with timed problem-solving practice.",
    link: "/EsatPage",
    theme: "gold",
  },
  {
    title: "GRE",
    description: "Graduate admissions prep with verbal, quant, and writing strategy support.",
    link: "/GrePage",
    theme: "gold",
  },
  {
    title: "GMAT",
    description: "Management admissions prep focused on quant, verbal, and test-day execution.",
    link: "/GmatPage",
    theme: "dark",
  },
];

const Courses = () => {
  return (
    <section className="Acourses-section" id="courses">
      <div className="Acourses-head">
        <h2 className="Acourses-title">Courses</h2>
        <p className="Acourses-subtitle">Class-wise and subject-wise programs designed for measurable progress.</p>
      </div>

      <div className="Acourses-grids">
        {courses.map((course, index) => (
          <div key={index} className={`Acourse-card ${course.theme}`}>
            <div className="Acourse-card-top">
              <h3>{course.title}</h3>
            </div>

            <p>{course.description}</p>

            <div className="Acourse-card-foot">
              <NavLink to={course.link} className="read-btn">
                View Details
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Courses;
