import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthModal from "../../common/AuthModal";
import mentorImageOne from "../../../assets/teachers/teach1.jpg";
import mentorImageTwo from "../../../assets/teachers/teach2.jpg";
import "./courses.css";

const IBMYP_DATA = {
  title: "IB-MYP",
  subtitle: "Choose a section on the left and explore focused IB-MYP preparation guidance.",
  sections: [
    {
      id: "intro",
      label: "Intro IB-MYP Preparation",
      title: "Intro IB-MYP Preparation",
      paragraphs: ["IB-MYP builds conceptual understanding through inquiry-based learning and criterion-based assessment.", "Our program helps students strengthen subject fundamentals while developing confident academic habits."],
      list: ["Criterion-focused academic support", "Project and assignment guidance", "Progressive skill-building plans"]
    },
    { id: "subjects", label: "IB-MYP Subjects", title: "IB-MYP Subjects", paragraphs: ["Preparation is structured to support both concept learning and assessment execution across MYP groups."] },
  ]
};

const IbmypPage = () => {
  const [activeSection, setActiveSection] = useState(IBMYP_DATA.sections[0]?.id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const programFeePlans = [
    { title: "IB-MYP Comprehensive Course", description: "A complete one-to-one online tutoring and testing track with guided concept coverage, mock analysis, and structured practice support.", fee: "49,999 + 18% GST (on Tuition Fee)" },
    { title: "IB-MYP Minor Program", description: "A focused section-wise prep track that builds exam confidence with targeted classes, sectional testing, and full-length mock discussion.", fee: "34,999 + 18% GST (on Tuition Fee)" }
  ];
  const programMentors = [
    { name: "Mr Priya Varat Singh", experience: "23+ years of teaching experience", description: "B.Sc, B.Ed, and MBA with broad board-level expertise across CBSE, ICSE, IGCSE, and IB. Former FIITJEE and Career Launcher faculty, teaching SAT, GRE, and GMAT since 2006.", image: mentorImageOne },
    { name: "Ms Divya Chandwani", experience: "10+ years of SAT verbal mentoring", description: "MA English mentor with extensive experience in SAT, TOEFL, and IELTS preparation. Former FIITJEE NTSE and SAT Verbal trainer focused on high-impact language strategy.", image: mentorImageTwo }
  ];

  const handleEnroll = (program) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate("/payment", { state: { courseProgram: { id: program.name, name: program.name, features: program.features } } });
  };

  const activeSectionData = IBMYP_DATA.sections.find((s) => s.id === activeSection) || IBMYP_DATA.sections[0];

  return (
    <div className="course-wrapper">
      <div className="course-header">
        <h1>{IBMYP_DATA.title}</h1>
        <p>{IBMYP_DATA.subtitle}</p>
      </div>

      <div className="course-layout">
        <aside className="course-sidebar">
          {IBMYP_DATA.sections.map((section) => (
            <button
              key={section.id}
              className={`course-menu-btn ${activeSection === section.id ? "active" : ""}`}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </aside>

        <main className="course-content">
          {activeSectionData.type === "programs" ? (
            <section className="course-content-panel course-programs-panel">
              <h2>{activeSectionData.title}</h2>
              <p>{activeSectionData.intro}</p>
              <div className="course-programs-grid">
                {activeSectionData.cards.map((card) => (
                  <article className="course-program-card" key={card.name}>
                    <h3>{card.name}</h3>
                    <ul>
                      {card.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    <button type="button" className="course-enroll-btn" onClick={() => handleEnroll(card)}>
                      Enroll Now
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="course-content-panel">
              <h2>{activeSectionData.title}</h2>
              {activeSectionData.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {activeSectionData.list?.length > 0 && <ul>{activeSectionData.list.map((item) => <li key={item}>{item}</li>)}</ul>}
              {activeSectionData.id === "intro" ? (
                <>
                  <h2>Program Fees</h2>
                  <div className="course-fees-grid">
                    {programFeePlans.map((plan) => (
                      <article className="course-fee-card" key={plan.title}><h3>{plan.title}</h3><p>{plan.description}</p><h4>Program Fee: {plan.fee}</h4></article>
                    ))}
                  </div>
                  <h2>Program Mentor</h2>
                  <div className="course-mentor-grid">
                    {programMentors.map((mentor) => (
                      <article className="course-mentor-card" key={mentor.name}>
                        <img src={mentor.image} alt={mentor.name} className="course-mentor-image" loading="lazy" />
                        <div className="course-mentor-details"><h3>{mentor.name}</h3><p className="course-mentor-experience">{mentor.experience}</p><p>{mentor.description}</p></div>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          )}
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView="signup" />
    </div>
  );
};

export default IbmypPage;
