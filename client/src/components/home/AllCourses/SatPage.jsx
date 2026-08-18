import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthModal from "../../common/AuthModal";
import mentorImageOne from "../../../assets/teachers/teach1.jpg";
import mentorImageTwo from "../../../assets/teachers/teach2.jpg";
import { PROGRAM_CATALOG } from "../../../constants/programCatalog";
import { buildProgramPaymentState } from "../../../utils/programEnrollment";
import "./courses.css";

const SatPage = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const [activeMathTopic, setActiveMathTopic] = useState("algebra");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingProgram, setPendingProgram] = useState(null);
  const satPrograms = PROGRAM_CATALOG.SAT;

  const programFeePlans = satPrograms.map((program) => ({
    title: program.name,
    description: program.description,
    fee: `Rs ${Number(program.fee || 0).toLocaleString('en-IN')}`
  }));

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

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === "math" && !activeMathTopic) {
      setActiveMathTopic("algebra");
    }
  };

  const getSatProgram = (id, name, features) => {
    const matchedProgram = satPrograms.find((program) => program.id === id) || {};
    return {
      id,
      name,
      features,
      fee: Number(matchedProgram.fee || 0),
      description: matchedProgram.description || "Structured SAT program with mentoring and testing support.",
      duration: matchedProgram.duration || ""
    };
  };

  const handleEnroll = (program) => {
    if (!user) {
      setPendingProgram(program);
      setIsAuthModalOpen(true);
      return;
    }

    navigate("/payment", {
      state: buildProgramPaymentState("SAT", program)
    });
  };

  useEffect(() => {
    if (!user || !pendingProgram) return;
    navigate("/payment", {
      state: buildProgramPaymentState("SAT", pendingProgram)
    });

    const timer = window.setTimeout(() => {
      setPendingProgram(null);
      setIsAuthModalOpen(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user, pendingProgram, navigate]);

  return (
    <div className="course-wrapper">
      <div className="course-header">
        <h1>SAT</h1>
        <p>Choose a section on the left and explore focused SAT preparation guidance.</p>
      </div>

      <div className="course-layout">
        <aside className="course-sidebar">
          <button
            className={`course-menu-btn ${activeSection === "intro" ? "active" : ""}`}
            onClick={() => handleSectionChange("intro")}
            type="button"
          >
            Intro SAT Preparation
          </button>
          <button
            className={`course-menu-btn ${activeSection === "math" ? "active" : ""}`}
            onClick={() => handleSectionChange("math")}
            type="button"
          >
            SAT Math
          </button>
          {activeSection === "math" ? (
            <div className="course-submenu">
              <button
                className={`course-submenu-btn ${activeMathTopic === "algebra" ? "active" : ""}`}
                onClick={() => setActiveMathTopic("algebra")}
                type="button"
              >
                Algebra
              </button>
              <button
                className={`course-submenu-btn ${activeMathTopic === "advanced" ? "active" : ""}`}
                onClick={() => setActiveMathTopic("advanced")}
                type="button"
              >
                Advanced Math
              </button>
              <button
                className={`course-submenu-btn ${activeMathTopic === "problemSolving" ? "active" : ""}`}
                onClick={() => setActiveMathTopic("problemSolving")}
                type="button"
              >
                Problem-Solving and Data Analysis
              </button>
              <button
                className={`course-submenu-btn ${activeMathTopic === "geometry" ? "active" : ""}`}
                onClick={() => setActiveMathTopic("geometry")}
                type="button"
              >
                Geometry and Trigonometry
              </button>
            </div>
          ) : null}
          <button
            className={`course-menu-btn ${activeSection === "verbal" ? "active" : ""}`}
            onClick={() => handleSectionChange("verbal")}
            type="button"
          >
            SAT Verbal
          </button>
          <button
            className={`course-menu-btn ${activeSection === "programs" ? "active" : ""}`}
            onClick={() => handleSectionChange("programs")}
            type="button"
          >
            SAT Programs
          </button>
        </aside>

        <main className="course-content">
          {activeSection === "programs" ? (
            <section className="course-content-panel course-programs-panel">
              <h2>SAT Programs</h2>
              <p>Choose the SAT plan that fits your preparation timeline and target score.</p>

              <h4>Objective</h4>
              <p>
                This program is designed for those students who want to do their UG from world&apos;s best universities in
                USA as well as in other countries. There are more than 30+ countries accepting SAT for admission in
                their UG programs.
              </p>
              <h4>Goals</h4>
              <p>
                Prepare student for the SAT exam. Our goal is to provide the best tutoring and testing support to all
                students enrolling in our programs.
              </p>
              <h4>Program Outlines</h4>
              <ul>
                <li>Personalized mentors</li>
                <li>1-on-1 tutoring sessions</li>
                <li>Expert doubt clarification</li>
                <li>Tailored study program according to student needs</li>
                <li>Full study material and official workbooks</li>
                <li>Online support and WhatsApp-based updates</li>
                <li>Sectional testing after chapter completion</li>
                <li>Separate HLTs for Verbal and Math sections</li>
                <li>10-15 real mock tests</li>
              </ul>

              <div className="course-programs-grid">
                <article className="course-program-card">
                  <h3>e-Rapid SAT</h3>
                  <p>Fast-track SAT prep with intensive live classes, focused mock analysis, and personal mentoring.</p>
                  <ul>
                    <li>Validity of this program is 90 days</li>
                    <li>Intensive live online class</li>
                    <li>Effective SAT Verbal and Quant Prep</li>
                    <li>Preparation at comfort of your own home</li>
                    <li>Personal mentoring and feedback</li>
                    <li>15 verbal and 15 quant classes with personalized mentor</li>
                    <li>5 buffer classes either for verbal or quant</li>
                    <li>90 hours of personalized tutoring and testing</li>
                    <li>Official study material and workbooks for practice</li>
                    <li>10 SAT real mock tests</li>
                    <li>Doubt sessions after every real mock test</li>
                  </ul>
                  <p className="course-program-fee">Program Fee: Rs 49,999</p>
                  <button
                    type="button"
                    className="sat-enroll-btn"
                    onClick={() =>
                      handleEnroll(
                        getSatProgram("e-Rapid", "e-Rapid SAT", [
                          "Validity of this program is 90 days",
                          "Intensive live online class",
                          "Effective SAT Verbal and Quant Prep",
                          "Preparation at comfort of your own home",
                          "Personal mentoring and feedback",
                          "15 verbal and 15 quant classes with personalized mentor",
                          "5 buffer classes either for verbal or quant",
                          "90 hours of personalized tutoring and testing",
                          "Official study material and workbooks for practice",
                          "10 SAT real mock tests",
                          "Doubt sessions after every real mock test"
                        ])
                      )
                    }
                  >
                    Enroll Now
                  </button>
                </article>

                <article className="course-program-card">
                  <h3>e-Compact SAT</h3>
                  <p>Balanced SAT schedule for steady concept build-up, regular testing, and performance feedback.</p>
                  <ul>
                    <li>Validity of this program is 120 days</li>
                    <li>Intensive live 1-on-1 online classes</li>
                    <li>Conduction of classes at moderate pace</li>
                    <li>Personalized mentoring and feedback system</li>
                    <li>Preparation at comfort of your own home</li>
                    <li>20 verbal and 20 quant classes under personalized mentors</li>
                    <li>10 buffer classes of verbal or quant</li>
                    <li>120 hours of tutoring and testing sessions</li>
                    <li>15 real mock tests</li>
                    <li>Official study material and workbooks for practice</li>
                    <li>Doubt classes after every real mock test</li>
                  </ul>
                  <p className="course-program-fee">Program Fee: Rs 64,999</p>
                  <button
                    type="button"
                    className="course-enroll-btn"
                    onClick={() =>
                      handleEnroll(
                        getSatProgram("e-Compact", "e-Compact SAT", [
                          "Validity of this program is 120 days",
                          "Intensive live 1-on-1 online classes",
                          "Conduction of classes at moderate pace",
                          "Personalized mentoring and feedback system",
                          "Preparation at comfort of your own home",
                          "20 verbal and 20 quant classes under personalized mentors",
                          "10 buffer classes of verbal or quant",
                          "120 hours of tutoring and testing sessions",
                          "15 real mock tests",
                          "Official study material and workbooks for practice",
                          "Doubt classes after every real mock test"
                        ])
                      )
                    }
                  >
                    Enroll Now
                  </button>
                </article>

                <article className="course-program-card">
                  <h3>e-Comprehensive SAT</h3>
                  <p>In-depth SAT plan with slow-paced reinforcement, extensive practice volume, and long-term mentoring.</p>
                  <ul>
                    <li>Validity of this program is 180 days</li>
                    <li>Intensive live 1-on-1 classes</li>
                    <li>Conduction of classes at very slow pace as needed</li>
                    <li>Special attention on each topic</li>
                    <li>Useful for students who dropped math in class XI</li>
                    <li>30 verbal and 30 math classes at student pace</li>
                    <li>Practice sheets with easy, moderate, and hard questions</li>
                    <li>Sectional tests after each chapter</li>
                    <li>Official study material and workbooks</li>
                    <li>At least 3000 practice questions of quant</li>
                    <li>15 real mock tests</li>
                  </ul>
                  <p className="course-program-fee">Program Fee: Rs 84,999</p>
                  <button
                    type="button"
                    className="course-enroll-btn"
                    onClick={() =>
                      handleEnroll(
                        getSatProgram("e-Comprehensive", "e-Comprehensive SAT", [
                          "Validity of this program is 180 days",
                          "Intensive live 1-on-1 classes",
                          "Conduction of classes at very slow pace as needed",
                          "Special attention on each topic",
                          "Useful for students who dropped math in class XI",
                          "30 verbal and 30 math classes at student pace",
                          "Practice sheets with easy, moderate, and hard questions",
                          "Sectional tests after each chapter",
                          "Official study material and workbooks",
                          "At least 3000 practice questions of quant",
                          "15 real mock tests"
                        ])
                      )
                    }
                  >
                    Enroll Now
                  </button>
                </article>

                <article className="course-program-card">
                  <h3>Weekend e-SAT</h3>
                  <p>Weekend-focused SAT coaching for students needing flexible timing without losing rigorous prep.</p>
                  <ul>
                    <li>Validity of this program is 120 days</li>
                    <li>Every Saturday and Sunday 1-on-1 online classes</li>
                    <li>Official study material and practice workbooks</li>
                    <li>Sprints worksheets to build speed and accuracy</li>
                    <li>All HLTs and FLTs conducted on weekends only</li>
                    <li>Personal mentoring and feedback</li>
                    <li>Recorded verbal and quant lectures for weekday revision</li>
                    <li>15 verbal and 15 quant classes with personalized mentor</li>
                    <li>3 buffer classes for verbal or quant</li>
                    <li>Worksheet after each topic covered</li>
                    <li>10 SAT real mock tests (online and offline)</li>
                    <li>Doubt sessions after every real mock test</li>
                    <li>Doubt support available on all weekdays</li>
                  </ul>
                  <p className="course-program-fee">Program Fee: Rs 59,999</p>
                  <button
                    type="button"
                    className="course-enroll-btn"
                    onClick={() =>
                      handleEnroll(
                        getSatProgram("Weekend", "Weekend e-SAT", [
                          "Validity of this program is 120 days",
                          "Every Saturday and Sunday 1-on-1 online classes",
                          "Official study material and practice workbooks",
                          "Sprints worksheets to build speed and accuracy",
                          "All HLTs and FLTs conducted on weekends only",
                          "Personal mentoring and feedback",
                          "Recorded verbal and quant lectures for weekday revision",
                          "15 verbal and 15 quant classes with personalized mentor",
                          "3 buffer classes for verbal or quant",
                          "Worksheet after each topic covered",
                          "10 SAT real mock tests (online and offline)",
                          "Doubt sessions after every real mock test",
                          "Doubt support available on all weekdays"
                        ])
                      )
                    }
                  >
                    Enroll Now
                  </button>
                </article>
              </div>
            </section>
          ) : activeSection === "intro" ? (
            <section className="course-content-panel">
              <h2>Intro SAT Preparation</h2>
              <h3>Comprehensive SAT Course:</h3>
              <p>
                A 3 months comprehensive course in 3 modules specially designed for students of class XI and XII. The
                program has about 30+ hours of teaching and more than 60+ hours of real SAT mock testing and
                discussion. It is a one-to-one online program where teachers and students interact in live class.
              </p>
              <ul>
                <li>
                  Teaching of all the topics related to the SAT syllabus. Different faculty members teach verbal and
                  math sections. Faculty provides worksheets containing notes and tune-up exercises.
                </li>
                <li>
                  Topic practice tests and real mock tests are regularly conducted during and after syllabus
                  completion.
                </li>
                <li>Doubt clearing and mock discussions are included with detailed explanations.</li>
              </ul>

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
            </section>
          ) : activeSection === "math" ? (
            <section className="course-content-panel">
              <h2>SAT Math</h2>
              <p>
                SAT Math tests a wide range of concepts including algebra, advanced math, problem-solving with data
                analysis, and geometry with trigonometry. Success depends on strong concept mastery, quick and accurate
                calculations, and the ability to apply the right strategy to different question types under time
                pressure.
              </p>

              {activeMathTopic === "algebra" ? (
                <div className="course-topic-content">
                  <h3>Algebra</h3>

                  <p>
                    Algebra measures the ability to analyze, fluently solve, and create linear equations and
                    inequalities, as well as analyze and fluently solve equations and systems of equations using
                    multiple techniques.
                  </p>

                  <h4>Algebra includes the following types of questions:</h4>

                  <ul>
                    <li>Linear equations in 1 variable</li>
                    <li>Linear equations in 2 variables</li>
                    <li>Linear functions</li>
                    <li>Systems of 2 linear equations in 2 variables</li>
                    <li>Linear inequalities in 1 or 2 variables</li>
                  </ul>
                </div>
              ) : null}

              {activeMathTopic === "advanced" ? (
                <div className="course-topic-content">
                  <h3>Advanced Math</h3>

                  <p>
                    Advanced Math focuses on the math you&apos;ll need to pursue further study in disciplines such as
                    science or economics and for career opportunities in STEM fields including science, technology,
                    engineering, and mathematics.
                  </p>

                  <p>
                    The Advanced Math area measures skills and knowledge required for progression to more advanced math
                    courses, including understanding absolute value, quadratic, exponential, polynomial, rational,
                    radical, and other nonlinear equations.
                  </p>

                  <h4>Advanced Math includes the following types of questions:</h4>

                  <ul>
                    <li>Equivalent expressions</li>
                    <li>Nonlinear equations in 1 variable</li>
                    <li>Systems of equations in 2 variables</li>
                    <li>Nonlinear functions</li>
                  </ul>
                </div>
              ) : null}

              {activeMathTopic === "problemSolving" ? (
                <div className="course-topic-content">
                  <h3>Problem-Solving and Data Analysis</h3>

                  <p>
                    Problem-Solving and Data Analysis measures the ability to apply quantitative reasoning about ratios,
                    rates, and proportional relationships; understand and apply unit rate; and analyze and interpret
                    one- and two-variable data.
                  </p>

                  <p>
                    This group of skills focuses on quantitative literacy and demonstrates a strong command of math used
                    in college courses, career training programs, and everyday life.
                  </p>

                  <h4>Problem-Solving and Data Analysis includes the following skills and knowledge testing points:</h4>

                  <ul>
                    <li>Ratios, rates, proportional relationships, and units</li>
                    <li>Percentages</li>
                    <li>One-variable data: distributions and measures of center and spread</li>
                    <li>Two-variable data: models and scatterplots</li>
                    <li>Probability and conditional probability</li>
                    <li>Inference from sample statistics and margin of error</li>
                    <li>Evaluating statistical claims: observational studies and experiments</li>
                  </ul>
                </div>
              ) : null}

              {activeMathTopic === "geometry" ? (
                <div className="course-topic-content">
                  <h3>Geometry and Trigonometry</h3>

                  <p>
                    Geometry and Trigonometry measure the ability to solve problems involving key concepts related to
                    shapes, measurements, and spatial relationships.
                  </p>

                  <h4>Geometry and Trigonometry focus on the following:</h4>

                  <ul>
                    <li>Area and volume formulas</li>
                    <li>Lines, angles, and triangles</li>
                    <li>Right triangles and trigonometry</li>
                    <li>Circles</li>
                  </ul>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="course-content-panel">
              <h2>SAT Verbal</h2>

              <p>
                The Reading and Writing section presents short passages (or passage pairs) followed by a single
                multiple-choice question. Questions are divided into four content domains-Craft and Structure,
                Information and Ideas, Standard English Conventions, and Expression of Ideas. Questions testing similar
                skills are grouped together and arranged from easiest to hardest to help manage time effectively.
              </p>

              <p>
                This section is divided into two modules, each containing questions from all four domains, ensuring a
                balanced assessment of reading comprehension, grammar, and writing skills.
              </p>

              <h4>What the Reading and Writing Passages Are Like</h4>
              <p>
                Passages range from 25 to 150 words and cover a variety of subjects, including literature,
                history/social studies, humanities, and science.
              </p>

              <h4>What the Reading and Writing Questions Are Like</h4>

              <h5>Information and Ideas</h5>
              <p>
                Measures comprehension, analysis, and reasoning skills, including the ability to locate, interpret,
                evaluate, and integrate information from texts and informational graphics such as tables and graphs.
              </p>

              <h5>Craft and Structure</h5>
              <p>
                Measures vocabulary in context, analysis, synthesis, and reasoning skills needed to understand
                high-utility words and phrases, evaluate texts rhetorically, and connect related ideas.
              </p>

              <h5>Expression of Ideas</h5>
              <p>
                Measures the ability to revise and improve texts for clarity, effectiveness, and alignment with
                specific rhetorical goals.
              </p>

              <h5>Standard English Conventions</h5>
              <p>
                Measures the ability to edit text according to standard rules of grammar, sentence structure, usage,
                and punctuation.
              </p>
            </section>
          )}
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView="signup" />
    </div>
  );
};

export default SatPage;
