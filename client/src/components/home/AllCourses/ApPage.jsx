import React, { useMemo, useState } from "react";
import mentorImageOne from "../../../assets/teachers/teach1.jpg";
import mentorImageTwo from "../../../assets/teachers/teach2.jpg";
import "./courses.css";

// Inline data for AP Course
const AP_COURSE_DATA = {
  title: "AP",
  subtitle: "Choose a section on the left and explore focused AP preparation guidance.",
  sections: [
    {
      id: "intro",
      label: "Intro AP Preparation",
      title: "Intro AP Preparation",
      paragraphs: [
        "It is a college level course which helps students to gain credits before they enter to their Freshman Year of US Universities. US schools have AP mentors to train students but in India we students can only write this examination in the month of May. It is conducted by College board once in a year in the month of May. ",
        "We at mytutee preparing students for different college level courses known as Advanced Placement. Each AP's preparation is through an online one to one live session tutoring and testing mode. Each AP preparation will be having full tutoring sessions for the completion of syllabus and then testing with Real AP mocks. An official study material would be provided to the student and chapter hand outs of each topics will also be provided to students via email. Discussion of problems and all mocks will also be taken care by respective subject faculty member.",
        "The total duration of AP depends upon the length of syllabus and it varies from tutoring sessions of 25 hours to 40 hours with 5 Real mocks of actual duration and discussion of each mock. Total duration of AP program per course will be about 45 hours to 70 hours. "
      ],
      list: [
        "Structured guidance for selecting the right AP subjects",
        "Weekly concept classes with targeted worksheet practice",
        "Regular testing support to improve score consistency"
      ]
    },
    {
      id: "subjects",
      label: "AP Subject Groups",
      title: "AP Subject Groups",
      paragraphs: [
        "AP preparation becomes highly effective when each subject is approached with a structured plan and clearly defined milestones. Students should begin by understanding the syllabus and breaking it down into manageable weekly or monthly targets. Setting achievable goals helps in maintaining consistency and tracking progress over time. Along with this, allocating dedicated time slots for each subject ensures balanced preparation and prevents last-minute stress."
      ],
      subtopics: [
        {
          id: "cs-math",
          label: "Computer Science and Mathematics",
          title: "Computer Science and Mathematics",
          children: [
            {
              id: "ap-calculus-ab",
              label: "AP Calculus AB",
              title: "AP Calculus AB",
              topics: ["Limits and continuity", "Differentiation techniques and applications", "Definite and indefinite integration", "Fundamental Theorem of Calculus", "Area, volume, and accumulation models"],
              tips: ["Practice free-response setup before solving to avoid algebra errors.", "Memorize derivative and integral forms, then apply them in mixed practice.", "Use graph interpretation drills for conceptual questions."]
            },
            {
              id: "ap-calculus-bc",
              label: "AP Calculus BC",
              title: "AP Calculus BC",
              topics: ["Series convergence and Taylor/Maclaurin series", "Parametric, polar, and vector-valued functions", "Advanced integration methods", "Differential equations and slope fields", "Error estimation and approximation"],
              tips: ["Solve one mixed BC set daily to retain all advanced chapters.", "Write complete justifications in FRQs, not only final answers.", "Track frequent mistakes in convergence and series tests."]
            },
            {
              id: "ap-computer-science-a",
              label: "AP Computer Science A",
              title: "AP Computer Science A",
              topics: ["Classes, objects, and constructors in Java", "Control flow and iterative logic", "Arrays, ArrayList, and searching/sorting basics", "Inheritance, polymorphism, and interfaces", "Algorithm design and code tracing"],
              tips: ["Practice writing complete methods under timed conditions.", "Improve tracing accuracy using dry-run tables.", "Review College Board FRQ patterns every week."]
            },
            {
              id: "ap-statistics",
              label: "AP Statistics",
              title: "AP Statistics",
              topics: ["Exploring one-variable and two-variable data", "Probability, random variables, and distributions", "Sampling methods and experimental design", "Confidence intervals and significance testing", "Regression and model interpretation"],
              tips: ["Use correct statistical vocabulary in written responses.", "Practice identifying assumptions before tests and intervals.", "Maintain a formula and condition checklist for timed sets."]
            }
          ]
        },
        {
          id: "sciences",
          label: "Sciences",
          title: "Sciences",
          children: [
            {
              id: "ap-chemistry",
              label: "AP Chemistry",
              title: "AP Chemistry",
              topics: ["Atomic structure and periodic trends", "Chemical bonding and molecular geometry", "Kinetics and equilibrium", "Acids, bases, and titration analysis", "Thermodynamics and electrochemistry"],
              tips: ["Balance conceptual notes with stoichiometry drill sets.", "Practice lab-style data interpretation questions regularly.", "Use unit tracking in every numerical calculation."]
            },
            {
              id: "ap-biology",
              label: "AP Biology",
              title: "AP Biology",
              topics: ["Cell structure, transport, and communication", "Genetics and inheritance patterns", "Evolution and natural selection", "Ecology and population dynamics", "Energy pathways and metabolism"],
              tips: ["Use flowcharts to connect systems-based biology chapters.", "Practice data and graph interpretation from lab contexts.", "Revise vocabulary and processes with active recall cards."]
            },
            {
              id: "ap-environmental-science",
              label: "AP Environmental Science",
              title: "AP Environmental Science",
              topics: ["Ecosystems and biodiversity", "Earth systems and natural resources", "Population and land-use change", "Energy resources and consumption", "Pollution, climate, and global policy"],
              tips: ["Link each unit to real-world examples for better retention.", "Practice interpreting environmental data sets and case studies.", "Build concise cause-and-effect summaries for FRQs."]
            }
          ]
        },
        {
          id: "english",
          label: "English",
          title: "English",
          children: [
            {
              id: "ap-english-language",
              label: "AP English Language and Composition",
              title: "AP English Language and Composition",
              topics: ["Rhetorical situation and audience analysis", "Argument writing and claim development", "Synthesis essay structure", "Evidence integration and commentary", "Style, tone, and clarity control"],
              tips: ["Practice timed thesis writing for all essay types.", "Annotate rhetorical strategies before drafting.", "Use evidence-commentary balance in every body paragraph."]
            },
            {
              id: "ap-english-literature",
              label: "AP English Literature and Composition",
              title: "AP English Literature and Composition",
              topics: ["Poetry analysis and literary devices", "Prose fiction interpretation", "Character, theme, and narrative structure", "Literary argument writing", "Textual evidence and analytical commentary"],
              tips: ["Build a device-to-effect notebook for fast analysis.", "Write one timed literary paragraph daily.", "Prioritize interpretation depth over summary."]
            }
          ]
        },
        {
          id: "social-science",
          label: "Social Science",
          title: "Social Science",
          children: [
            {
              id: "ap-human-geography",
              label: "AP Human Geography",
              title: "AP Human Geography",
              topics: ["Population and migration models", "Culture and language landscapes", "Political geography and boundaries", "Agriculture and rural land use", "Urbanization and economic development"],
              tips: ["Use maps and spatial visuals during revision.", "Practice FRQs using model-specific vocabulary.", "Link each unit to case studies for better recall."]
            },
            {
              id: "ap-macro-economics",
              label: "AP Macro Economics",
              title: "AP Macro Economics",
              topics: ["National income and price determination", "Unemployment, inflation, and growth", "Fiscal and monetary policy", "Open economy and exchange rates", "Financial sector and loanable funds"],
              tips: ["Memorize graph shifts and policy outcomes.", "Practice explanation chains: policy to impact.", "Use mixed MCQ-FRQ drills for retention."]
            },
            {
              id: "ap-micro-economics",
              label: "AP Micro Economics",
              title: "AP Micro Economics",
              topics: ["Supply-demand and market equilibrium", "Consumer and producer surplus", "Elasticity and taxation effects", "Production costs and market structures", "Factor markets and externalities"],
              tips: ["Solve graph-based questions before reading options.", "Write concise cause-effect justifications in FRQs.", "Revise market-structure comparisons weekly."]
            },
            {
              id: "ap-us-history",
              label: "AP US History",
              title: "AP US History",
              topics: ["Colonial foundations and revolution", "Civil War and reconstruction", "Industrialization and reform movements", "US foreign policy and world wars", "Modern social, political, and economic shifts"],
              tips: ["Use timeline anchors for every period.", "Practice DBQ document sourcing consistently.", "Build thematic links across eras for LEQ quality."]
            },
            {
              id: "ap-world-history",
              label: "AP World History",
              title: "AP World History",
              topics: ["Early civilizations and state formation", "Trade networks and cultural exchange", "Empires and belief systems", "Industrialization and imperialism", "Contemporary global transformations"],
              tips: ["Compare regions using common themes.", "Practice continuity and change-over-time framing.", "Use evidence clusters instead of isolated facts."]
            },
            {
              id: "ap-european-history",
              label: "AP European History",
              title: "AP European History",
              topics: ["Renaissance and reformation", "Absolutism and constitutionalism", "Enlightenment and revolutions", "Industrial and nationalist movements", "Twentieth-century conflicts and integration"],
              tips: ["Track continuity and turning points by century.", "Use theme-based notes: politics, society, economy, culture.", "Practice thesis-first writing for DBQ/LEQ speed."]
            }
          ]
        }
      ]
    },
    {
      id: "exam",
      label: "AP Exam Strategy",
      title: "AP Exam Strategy",
      paragraphs: ["Success in AP requires consistent practice, efficient revision planning, and quality feedback across MCQ and FRQ formats."],
      blocks: [
        {
          heading: "Scoring Focus",
          paragraphs: ["Students are trained to target score bands 4 and 5 through topic-level diagnostics and repeated timed assessments."]
        },
        {
          heading: "Timeline Planning",
          paragraphs: ["A realistic schedule is built backward from exam dates to ensure syllabus completion, revision, and full-length practice."]
        }
      ]
    },
  ]
};

const ApPage = () => {
  const [activeSection, setActiveSection] = useState(AP_COURSE_DATA.sections[0]?.id || "intro");
  const [activeSubtopics, setActiveSubtopics] = useState({});
  const [activeNestedSubtopics, setActiveNestedSubtopics] = useState({});

  const programFeePlans = [
    {
      title: "AP Comprehensive Course",
      description:
        "A complete one-to-one online tutoring and testing track with guided concept coverage, mock analysis, and structured practice support.",
      fee: "49,999 + 18% GST (on Tuition Fee)"
    },
    {
      title: "AP Minor Program",
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

  const firstSubtopicBySection = useMemo(() => {
    const map = {};
    AP_COURSE_DATA.sections.forEach((section) => {
      if (section.subtopics && section.subtopics.length > 0) {
        map[section.id] = section.subtopics[0].id;
      }
    });
    return map;
  }, []);

  const firstNestedSubtopicByKey = useMemo(() => {
    const map = {};
    AP_COURSE_DATA.sections.forEach((section) => {
      (section.subtopics || []).forEach((subtopic) => {
        if (subtopic.children && subtopic.children.length > 0) {
          map[`${section.id}:${subtopic.id}`] = subtopic.children[0].id;
        }
      });
    });
    return map;
  }, []);

  React.useEffect(() => {
    if (Object.keys(activeSubtopics).length === 0) {
      setActiveSubtopics(firstSubtopicBySection);
    }
    if (Object.keys(activeNestedSubtopics).length === 0) {
      setActiveNestedSubtopics(firstNestedSubtopicByKey);
    }
  }, []);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    if (!activeSubtopics[sectionId] && firstSubtopicBySection[sectionId]) {
      setActiveSubtopics((prev) => ({ ...prev, [sectionId]: firstSubtopicBySection[sectionId] }));
    }
  };

  const handleSubtopicChange = (sectionId, subtopic) => {
    setActiveSubtopics((prev) => ({
      ...prev,
      [sectionId]: subtopic.id
    }));

    if (subtopic.children && subtopic.children.length > 0) {
      const nestedKey = `${sectionId}:${subtopic.id}`;
      if (!activeNestedSubtopics[nestedKey]) {
        setActiveNestedSubtopics((prev) => ({
          ...prev,
          [nestedKey]: subtopic.children[0].id
        }));
      }
    }
  };

  const activeSectionData = AP_COURSE_DATA.sections.find((section) => section.id === activeSection) || AP_COURSE_DATA.sections[0];

  const renderBlocks = (blocks = []) =>
    blocks.map((block) => (
      <React.Fragment key={block.heading}>
        <h4>{block.heading}</h4>
        {(block.paragraphs || []).map((paragraph) => (
          <p key={`${block.heading}-${paragraph}`}>{paragraph}</p>
        ))}
        {block.list && block.list.length > 0 ? (
          <ul>
            {block.list.map((item) => (
              <li key={`${block.heading}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : null}
      </React.Fragment>
    ));

  return (
    <div className="course-wrapper">
      <div className="course-header">
        <h1>{AP_COURSE_DATA.title}</h1>
        <p>{AP_COURSE_DATA.subtitle}</p>
      </div>

      <div className="course-layout">
        <aside className="course-sidebar">
          {AP_COURSE_DATA.sections.map((section) => (
            <React.Fragment key={section.id}>
              <button
                className={`course-menu-btn ${activeSection === section.id ? "active" : ""}`}
                onClick={() => handleSectionChange(section.id)}
                type="button"
              >
                {section.label}
              </button>

              {activeSection === section.id && section.subtopics && section.subtopics.length > 0 ? (
                <div className="course-submenu">
                  {section.subtopics.map((subtopic) => (
                    <React.Fragment key={subtopic.id}>
                      <button
                        className={`course-submenu-btn ${activeSubtopics[section.id] === subtopic.id ? "active" : ""}`}
                        onClick={() => handleSubtopicChange(section.id, subtopic)}
                        type="button"
                      >
                        {subtopic.label}
                      </button>

                      {activeSubtopics[section.id] === subtopic.id && subtopic.children && subtopic.children.length > 0 ? (
                        <div className="course-submenu course-submenu-nested">
                          {subtopic.children.map((child) => {
                            const nestedKey = `${section.id}:${subtopic.id}`;
                            const isChildActive =
                              activeNestedSubtopics[nestedKey] === child.id ||
                              (!activeNestedSubtopics[nestedKey] && subtopic.children[0].id === child.id);

                            return (
                              <button
                                key={child.id}
                                className={`course-submenu-btn course-submenu-btn--child ${isChildActive ? "active" : ""}`}
                                onClick={() =>
                                  setActiveNestedSubtopics((prev) => ({
                                    ...prev,
                                    [nestedKey]: child.id
                                  }))
                                }
                                type="button"
                              >
                                {child.label || child.title}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </aside>

        <main className="course-content">
          <section className="course-content-panel">
            {(() => {
              if (activeSectionData.id === "subjects" && activeSubtopics[activeSection]) {
                const currentSubtopic = activeSectionData.subtopics.find(
                  (s) => s.id === activeSubtopics[activeSection]
                );

                if (currentSubtopic && activeNestedSubtopics[`${activeSection}:${currentSubtopic.id}`]) {
                  const currentNestedSubtopic = currentSubtopic.children.find(
                    (c) => c.id === activeNestedSubtopics[`${activeSection}:${currentSubtopic.id}`]
                  );

                  const nestedTopics = currentNestedSubtopic?.topics || [];

                  return (
                    <div className="course-topic-content">
                      <h3>{currentNestedSubtopic?.title}</h3>
                      {nestedTopics.length > 0 ? (
                        <ul>
                          {nestedTopics.map((item) => (
                            <li key={`${currentNestedSubtopic?.id}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                      {currentNestedSubtopic?.tips && currentNestedSubtopic?.tips.length > 0 ? (
                        <>
                          <h4>Preparation Tips</h4>
                          <ul>
                            {currentNestedSubtopic?.tips.map((tip) => (
                              <li key={`${currentNestedSubtopic?.id}-${tip}`}>{tip}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <div className="course-topic-content">
                    <h3>{currentSubtopic?.title}</h3>
                    {currentSubtopic?.list && currentSubtopic?.list.length > 0 ? (
                      <ul>
                        {currentSubtopic?.list.map((item) => (
                          <li key={`${currentSubtopic?.id}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              }

              return (
                <>
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
                  {renderBlocks(activeSectionData.blocks)}
                </>
              );
            })()}
          </section>
        </main>
      </div>

    </div>
  );
};

export default ApPage;