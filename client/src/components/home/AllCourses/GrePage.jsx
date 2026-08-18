import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthModal from "../../common/AuthModal";
import mentorImageOne from "../../../assets/teachers/teach1.jpg";
import mentorImageTwo from "../../../assets/teachers/teach2.jpg";
import { PROGRAM_CATALOG } from "../../../constants/programCatalog";
import { buildProgramPaymentState } from "../../../utils/programEnrollment";
import "./courses.css";

const GRE_DATA = {
  title: "GRE",
  subtitle: "Choose a section on the left and explore focused GRE preparation guidance.",
  sections: [
    {
      id: "intro",
      label: "Intro GRE Preparation",
      title: "Intro GRE Preparation",
      paragraphs: [
        "GRE preparation requires strategic planning across Verbal Reasoning, Quantitative Reasoning, and Analytical Writing.",
        "Our framework builds concept mastery, pacing discipline, and score improvement through targeted practice."
      ],
      list: ["Personalized study planning", "Adaptive timed drills", "Score-focused mentoring"]
    },
    {
      id: "verbal",
      label: "GRE Verbal",
      title: "GRE Verbal",
      paragraphs: [
        "Students strengthen vocabulary application, reading comprehension, and text completion strategy with structured practice sets."
      ],
      list: ["Text Completion and Sentence Equivalence", "Reading Comprehension reasoning", "Context-based vocabulary training"]
    },
    {
      id: "quant",
      label: "GRE Quant",
      title: "GRE Quant",
      paragraphs: [
        "The quant track emphasizes problem-solving speed, accuracy, and data interpretation under exam pressure."
      ],
      list: ["Arithmetic, algebra, and geometry", "Quant comparison strategy", "Data analysis and interpretation"]
    },
    {
      id: "programs",
      label: "GRE Programs",
      type: "programs",
      title: "GRE Programs",
      intro: "Choose the GRE plan that fits your target score and application timeline.",
      cards: PROGRAM_CATALOG.GRE.map((program) => ({
        id: program.id,
        name: program.name,
        description: program.description,
        fee: program.fee,
        features: [program.duration, "Section-wise strategy labs", "Mentor feedback loops"]
      }))
    }
  ]
};

const GrePage = () => {
  const [activeSection, setActiveSection] = useState(GRE_DATA.sections[0]?.id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const programFeePlans = [
    {
      title: "GRE Comprehensive Course",
      description:
        "A complete one-to-one online tutoring and testing track with guided concept coverage, mock analysis, and structured practice support.",
      fee: "49,999 + 18% GST (on Tuition Fee)"
    },
    {
      title: "GRE Minor Program",
      description:
        "A focused section-wise prep track that builds exam confidence with targeted classes, sectional testing, and full-length mock discussion.",
      fee: "34,999 + 18% GST (on Tuition Fee)"
    }
  ];

  const programMentors = [
    {
      name: "Mr Priya Varat Singh",
      experience: "23+ years of teaching experience",
      description:
        "B.Sc, B.Ed, and MBA with broad board-level expertise across CBSE, ICSE, IGCSE, and IB. Former FIITJEE and Career Launcher faculty, teaching SAT, GRE, and GMAT since 2006.",
      image: mentorImageOne
    },
    {
      name: "Ms Divya Chandwani",
      experience: "10+ years of SAT verbal mentoring",
      description:
        "MA English mentor with extensive experience in SAT, TOEFL, and IELTS preparation. Former FIITJEE NTSE and SAT Verbal trainer focused on high-impact language strategy.",
      image: mentorImageTwo
    }
  ];

  const handleEnroll = (program) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    navigate("/payment", {
      state: buildProgramPaymentState("GRE", program)
    });
  };

  const activeSectionData = GRE_DATA.sections.find((s) => s.id === activeSection) || GRE_DATA.sections[0];

  return (
    <div className="course-wrapper">
      <div className="course-header">
        <h1>{GRE_DATA.title}</h1>
        <p>{GRE_DATA.subtitle}</p>
      </div>

      <div className="course-layout">
        <aside className="course-sidebar">
          {GRE_DATA.sections.map((section) => (
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
                    <p>{card.description}</p>
                    <ul>
                      {card.features.map((feature) => (
                        <li key={`${card.name}-${feature}`}>{feature}</li>
                      ))}
                    </ul>
                    <p className="course-program-fee">Program Fee: Rs {Number(card.fee || 0).toLocaleString('en-IN')}</p>
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
              {activeSectionData.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {activeSectionData.list?.length > 0 ? (
                <ul>
                  {activeSectionData.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {activeSectionData.id === "intro" ? (
                <>
                  <h2>Program Fees</h2>
                  <div className="course-fees-grid">
                    {programFeePlans.map((plan) => (
                      <article className="course-fee-card" key={plan.title}>
                        <h3>{plan.title}</h3>
                        <p>{plan.description}</p>
                        <h4>Program Fee: {plan.fee}</h4>
                      </article>
                    ))}
                  </div>

                  <h2>Program Mentor</h2>
                  <div className="course-mentor-grid">
                    {programMentors.map((mentor) => (
                      <article className="course-mentor-card" key={mentor.name}>
                        <img src={mentor.image} alt={mentor.name} className="course-mentor-image" loading="lazy" />
                        <div className="course-mentor-details">
                          <h3>{mentor.name}</h3>
                          <p className="course-mentor-experience">{mentor.experience}</p>
                          <p>{mentor.description}</p>
                        </div>
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

export default GrePage;
