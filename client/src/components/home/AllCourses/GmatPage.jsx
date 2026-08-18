import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthModal from "../../common/AuthModal";
import mentorImageOne from "../../../assets/teachers/teach1.jpg";
import mentorImageTwo from "../../../assets/teachers/teach2.jpg";
import { PROGRAM_CATALOG } from "../../../constants/programCatalog";
import { buildProgramPaymentState } from "../../../utils/programEnrollment";
import "./courses.css";

const GMAT_DATA = {
  title: "GMAT",
  subtitle: "Choose a section on the left and explore focused GMAT preparation guidance.",
  sections: [
    {
      id: "intro",
      label: "Intro GMAT Preparation",
      title: "Intro GMAT Preparation",
      paragraphs: [
        "GMAT preparation is built for business-school aspirants who need structured readiness across Quantitative, Verbal, and Data Insights.",
        "Our one-to-one mentoring model strengthens concept clarity, decision speed, and score stability through targeted test simulation."
      ],
      list: ["Section-wise concept mastery", "Adaptive timed drills", "Mentor-led performance correction"]
    },
    {
      id: "overview",
      label: "GMAT Exam Overview",
      title: "GMAT Exam Overview",
      paragraphs: [
        "The GMAT Focus Edition evaluates readiness for management education through three sections: Quantitative Reasoning, Verbal Reasoning, and Data Insights.",
        "Students are evaluated for analytical rigor, interpretation quality, and time-bound reasoning consistency across computer-adaptive sections."
      ],
      list: ["3 section adaptive structure", "Question-level strategy and pacing", "Accuracy tracking across mocks"]
    },
    {
      id: "quant",
      label: "GMAT Quantitative",
      title: "GMAT Quantitative Reasoning",
      paragraphs: [
        "Quantitative preparation focuses on arithmetic, algebra, number properties, and data sufficiency-style reasoning for high precision under pressure."
      ],
      list: ["Arithmetic and algebra mastery", "Data sufficiency logic", "Timed precision and error elimination"]
    },
    {
      id: "verbal",
      label: "GMAT Verbal",
      title: "GMAT Verbal Reasoning",
      paragraphs: [
        "Verbal preparation trains critical reasoning and reading comprehension with a focus on inference quality and argument evaluation."
      ],
      list: ["Critical reasoning frameworks", "Reading comprehension depth", "Elimination-based answer selection"]
    },
    {
      id: "dataInsights",
      label: "GMAT Data Insights",
      title: "GMAT Data Insights",
      paragraphs: [
        "Data Insights measures your ability to synthesize information from multiple sources including charts, tables, and text-based business scenarios."
      ],
      list: ["Data interpretation", "Multi-source reasoning", "Table and graph-driven decisions"]
    },
    {
      id: "strategy",
      label: "GMAT Strategy",
      title: "GMAT Preparation Strategy",
      paragraphs: [
        "A strong GMAT outcome requires a clear weekly system: concept revision, timed practice, mock diagnostics, and targeted weak-area correction."
      ],
      list: ["Week-by-week study plans", "Mock analytics and review cycles", "Score-focused adaptation"]
    },
    {
      id: "programs",
      label: "GMAT Programs",
      type: "programs",
      title: "GMAT Programs",
      intro: "Choose the GMAT plan that matches your current readiness and target score.",
      cards: PROGRAM_CATALOG.GMAT.map((program) => ({
        id: program.id,
        name: program.name,
        description: program.description,
        fee: program.fee,
        features: [program.duration, "Personalized mentoring", "Progressive mock testing"]
      }))
    }
  ]
};

const GmatPage = () => {
  const [activeSection, setActiveSection] = useState(GMAT_DATA.sections[0]?.id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const programFeePlans = [
    {
      title: "GMAT Comprehensive Course",
      description:
        "A complete one-to-one online tutoring and testing track with guided concept coverage, mock analysis, and structured practice support.",
      fee: "49,999 + 18% GST (on Tuition Fee)"
    },
    {
      title: "GMAT Minor Program",
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
      state: buildProgramPaymentState("GMAT", program)
    });
  };

  const activeSectionData = GMAT_DATA.sections.find((s) => s.id === activeSection) || GMAT_DATA.sections[0];

  return (
    <div className="course-wrapper">
      <div className="course-header">
        <h1>{GMAT_DATA.title}</h1>
        <p>{GMAT_DATA.subtitle}</p>
      </div>

      <div className="course-layout">
        <aside className="course-sidebar">
          {GMAT_DATA.sections.map((section) => (
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

export default GmatPage;
