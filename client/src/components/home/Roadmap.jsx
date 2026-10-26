import { useState } from "react";
import "./Roadmap.css";

const scoreCards = [
  {
    name: "AARYA SARAF",
    school: "La Martiniere School, Kolkata",
    score: "AP Calculus 5/5 | SAT 1540",
    tone: "dark",
  },
  {
    name: "ANIRUDH KRISHNA",
    school: "The Shri Ram School, Aravali",
    score: "ACT 35/36 | AP Physics 5/5",
    tone: "gold",
  },
  {
    name: "YASHVI MITTAL",
    school: "SAT Scholar Program",
    score: "SAT Math 800/800",
    tone: "gold",
  },
  {
    name: "REYANSH MEHTA",
    school: "Delhi Public School",
    score: "PSAT 1480 | AP CS 5/5",
    tone: "dark",
  },
  {
    name: "ADVIKA ROY",
    school: "Modern High School",
    score: "SAT 1520 | AP Biology 5/5",
    tone: "dark",
  },
  {
    name: "VIHAAN GUPTA",
    school: "Pathways School, Noida",
    score: "ACT 34/36 | AP Chemistry 5/5",
    tone: "gold",
  },
];

const classTabs = ["9th", "10th", "11th", "12th"];

const monthColors = {
  May: "#f59e0b",
  Jun: "#1e3a8a",
  Jul: "#0ea5e9",
  Aug: "#8b5cf6",
  Sep: "#10b981",
  Oct: "#ef4444",
  Nov: "#f97316",
  Dec: "#14b8a6",
  Jan: "#6366f1",
  Feb: "#ec4899",
  Mar: "#0f766e",
  Apr: "#475569",
};

const timelineByClass = {
  "9th": [
    { month: "May", events: [{ text: "Vacation, Research work, Projects", tone: "gold", side: "left" }] },
    { month: "Jun", events: [{ text: "School Academics", tone: "dark", side: "right" }] },
    { month: "Jul", events: [{ text: "PSAT Preparation", tone: "gold", side: "left" }] },
    { month: "Aug", events: [{ text: "PSAT Preparation", tone: "dark", side: "right" }] },
    { month: "Sep", events: [] },
    { month: "Oct", events: [{ text: "Take PSAT", tone: "dark", side: "left" }] },
    { month: "Nov", events: [] },
    { month: "Dec", events: [{ text: "School Academics", tone: "gold", side: "right" }] },
    { month: "Jan", events: [] },
    { month: "Feb", events: [{ text: "Projects & Review", tone: "gold", side: "left" }] },
    { month: "Mar", events: [{ text: "School Exams", tone: "dark", side: "right" }] },
    { month: "Apr", events: [] },
    { month: "May", events: [{ text: "Next Session Planning", tone: "gold", side: "left" }] },
  ],
  "10th": [
    { month: "May", events: [{ text: "Vacation, Research work, Projects", tone: "gold", side: "left" }] },
    { month: "Jun", events: [{ text: "Board Academics Start", tone: "dark", side: "right" }] },
    { month: "Jul", events: [{ text: "PSAT Preparation", tone: "gold", side: "left" }] },
    { month: "Aug", events: [{ text: "School Academics", tone: "dark", side: "right" }] },
    { month: "Sep", events: [] },
    { month: "Oct", events: [{ text: "Take PSAT", tone: "dark", side: "left" }] },
    { month: "Nov", events: [{ text: "Pre-Board Practice", tone: "gold", side: "right" }] },
    { month: "Dec", events: [] },
    { month: "Jan", events: [{ text: "Revision Sprint", tone: "gold", side: "left" }] },
    { month: "Feb", events: [{ text: "School Academics", tone: "dark", side: "right" }] },
    { month: "Mar", events: [{ text: "Board Exam Focus", tone: "dark", side: "left" }] },
    { month: "Apr", events: [] },
    { month: "May", events: [{ text: "Result Analysis", tone: "gold", side: "right" }] },
  ],
  "11th": [
    { month: "May", events: [{ text: "Vacation, Research work, Projects", tone: "gold", side: "left" }] },
    { month: "Jun", events: [{ text: "School Academics", tone: "dark", side: "right" }] },
    { month: "Jul", events: [{ text: "PSAT Preparation", tone: "gold", side: "left" }] },
    { month: "Aug", events: [{ text: "Subject Deep Dive", tone: "dark", side: "right" }] },
    { month: "Sep", events: [] },
    { month: "Oct", events: [{ text: "Take PSAT", tone: "dark", side: "left" }] },
    { month: "Nov", events: [{ text: "Olympiad / AP Planning", tone: "gold", side: "right" }] },
    { month: "Dec", events: [] },
    { month: "Jan", events: [{ text: "School Academics", tone: "dark", side: "left" }] },
    { month: "Feb", events: [{ text: "Mock Tests", tone: "gold", side: "right" }] },
    { month: "Mar", events: [{ text: "Final Exam Strategy", tone: "dark", side: "left" }] },
    { month: "Apr", events: [] },
    { month: "May", events: [{ text: "Summer Prep for 12th", tone: "gold", side: "right" }] },
  ],
  "12th": [
    { month: "May", events: [{ text: "Vacation, Research work, Projects", tone: "gold", side: "left" }] },
    { month: "Jun", events: [{ text: "School Academics", tone: "dark", side: "right" }] },
    { month: "Jul", events: [{ text: "College Essay Start", tone: "gold", side: "left" }] },
    { month: "Aug", events: [{ text: "Application Strategy", tone: "dark", side: "right" }] },
    { month: "Sep", events: [{ text: "SAT/ACT Final Prep", tone: "gold", side: "left" }] },
    { month: "Oct", events: [{ text: "Take PSAT / SAT", tone: "dark", side: "right" }] },
    { month: "Nov", events: [{ text: "Early Applications", tone: "gold", side: "left" }] },
    { month: "Dec", events: [{ text: "School Academics", tone: "dark", side: "right" }] },
    { month: "Jan", events: [{ text: "Regular Deadlines", tone: "gold", side: "left" }] },
    { month: "Feb", events: [] },
    { month: "Mar", events: [{ text: "Board Exam Focus", tone: "dark", side: "right" }] },
    { month: "Apr", events: [] },
    { month: "May", events: [{ text: "Result and Transition", tone: "gold", side: "left" }] },
  ],
};

const Roadmap = () => {
  const [activeTab, setActiveTab] = useState(classTabs[0]);

  const visibleCards = scoreCards;

  const activeTimeline = timelineByClass[activeTab] || timelineByClass["9th"];

  return (
    <section className="roadmap-section">
      <div className="roadmap-shell">
        <aside className="scores-panel">
          <div className="section-head">
            <h2>Our Scores</h2>
          </div>

          <div className="scores-grid">
            {visibleCards.map((card) => (
              <article key={card.name} className={`score-card ${card.tone === "dark" ? "score-dark" : "score-gold"}`}>
                <h3>{card.name}</h3>
                <p className="score-school">{card.school}</p>
                <p className="score-result">{card.score}</p>
              </article>
            ))}
          </div>
        </aside>

        <section className="timeline-panel">
          <div className="section-head">
            <h2>Timeline</h2>
          </div>

          <div className="timeline-tabs" role="tablist" aria-label="Class timeline tabs">
            {classTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="timeline-body" key={activeTab}>
            {activeTimeline.map((item, index) => {
              const leftEvents = item.events.filter((evt) => evt.side === "left"); 
              const rightEvents = item.events.filter((evt) => evt.side !== "left");

              return (
                <article className="timeline-row" key={`${item.month}-${index}`}>
                  <div className="timeline-side timeline-side-left">
                    {leftEvents.map((evt) => (
                      <span key={evt.text} className={`timeline-label ${evt.tone === "dark" ? "label-dark" : "label-gold"}`}>
                        {evt.text}
                      </span>
                    ))}
                  </div>

                  <div className="timeline-center" aria-hidden="true">
                    {index !== 0 && <span className="timeline-line timeline-line-top" />}
                    <span className="timeline-node" style={{ backgroundColor: monthColors[item.month] || "#1e3a8a" }}>
                      {item.month}
                    </span>
                    {index !== activeTimeline.length - 1 && <span className="timeline-line timeline-line-bottom" />}
                  </div>

                  <div className="timeline-side timeline-side-right">
                    {rightEvents.map((evt) => (
                      <span key={evt.text} className={`timeline-label ${evt.tone === "dark" ? "label-dark" : "label-gold"}`}>
                        {evt.text}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Roadmap;
