import React, { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BLOG_POSTS } from "./blogData";
import "./BlogPage.css";

const MIN_WORDS = 800;
const TARGET_WORDS = 900;
const MAX_WORDS = 1000;

const ARTICLE_PLAN = [
  {
    heading: "Learning Foundations",
    subHeadings: ["Clarifying the objective", "Building a stable routine"],
  },
  {
    heading: "Planning With Precision",
    subHeadings: ["Turning goals into milestones", "Reviewing progress honestly"],
  },
  {
    heading: "Execution Methods",
    subHeadings: ["Active practice techniques", "Focused revision cycles"],
  },
  {
    heading: "Long-Term Growth",
    subHeadings: ["Reflection practices", "Sustaining momentum"],
  },
];

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const buildParagraph = ({
  title,
  excerpt,
  sectionHeading,
  subHeading,
  sectionIndex,
  subHeadingIndex,
  paragraphIndex,
}) => {
  const rhythm = [
    "daily rhythm",
    "weekly checkpoint",
    "revision cycle",
    "reflection window",
  ][paragraphIndex % 4];

  const practice = [
    "focused note-making",
    "timed recall",
    "error analysis",
    "concept explanation",
  ][(sectionIndex + paragraphIndex) % 4];

  const support = [
    "teachers",
    "parents",
    "mentors",
    "peers",
  ][(subHeadingIndex + paragraphIndex) % 4];

  return `In ${title.toLowerCase()}, ${subHeading.toLowerCase()} works best when students follow a clear ${rhythm} and track results with simple weekly notes. ${excerpt} Start with one measurable target, use ${practice} as the core method, and review outcomes with ${support}. This steady cycle improves understanding, confidence, and performance over time.`;
};

const buildLongArticle = (post) => {
  const introParagraphs = [
    `${post.title} is a practical guide for students who want better outcomes through consistent daily action. Instead of relying on last-minute effort, this approach focuses on clear planning, focused execution, and regular reflection. When these habits are repeated each week, progress becomes easier to measure and improve.`,
    `In this article, you will find a structured path that moves from foundation to long-term growth. Each section explains what to do, why it matters, and how to keep the process sustainable across school demands, assignments, and exam preparation. The goal is to make improvement simple, realistic, and repeatable.`,
  ];

  const sections = ARTICLE_PLAN.map((section, sectionIndex) => {
    const subSections = section.subHeadings.map((subHeading, subHeadingIndex) => {
      const paragraphs = [0].map((paragraphIndex) =>
        buildParagraph({
          title: post.title,
          excerpt: post.excerpt,
          sectionHeading: section.heading,
          subHeading,
          sectionIndex,
          subHeadingIndex,
          paragraphIndex,
        })
      );

      return {
        title: subHeading,
        paragraphs,
      };
    });

    return {
      heading: section.heading,
      subSections,
    };
  });

  const conclusionParagraphs = [
    `The key takeaway from ${post.title.toLowerCase()} is simple: consistent structure beats occasional intensity. A focused plan, regular review, and small corrections each week can deliver strong and lasting academic growth.`,
    `Use this framework as a personal system. Keep what works, improve what does not, and continue building confidence through disciplined practice, clear priorities, and healthy study habits.`,
  ];

  const allParagraphText = [
    ...introParagraphs,
    ...sections.flatMap((section) =>
      section.subSections.flatMap((subSection) => subSection.paragraphs)
    ),
    ...conclusionParagraphs,
  ].join(" ");

  let totalWords = countWords(allParagraphText);

  while (totalWords < MIN_WORDS) {
    const filler = `For stronger results, run a weekly review: compare planned tasks with completed tasks, identify one obstacle, and define one change for the next week. This simple loop keeps effort aligned with outcomes and turns ${post.title.toLowerCase()} into a practical routine you can sustain.`;
    const remainingToTarget = Math.max(TARGET_WORDS - totalWords, 0);
    const fillerWords = filler.trim().split(/\s+/);
    const wordsToAdd = Math.min(
      fillerWords.length,
      remainingToTarget > 0 ? remainingToTarget : MAX_WORDS - totalWords
    );

    if (wordsToAdd <= 0) {
      break;
    }

    const clippedFiller = fillerWords.slice(0, wordsToAdd).join(" ");
    conclusionParagraphs.push(clippedFiller);
    totalWords += wordsToAdd;
  }

  return {
    introParagraphs,
    sections,
    conclusionParagraphs,
    totalWords,
  };
};

const BlogDetailPage = () => {
  const { blogId } = useParams();
  const post = BLOG_POSTS.find((item) => item.id === blogId);
  const article = useMemo(() => (post ? buildLongArticle(post) : null), [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="blog-page">
      <section className="blog-detail-section">
        <Link to="/blog" className="blog-card-button blog-back-link-top">
          Back to Blog
        </Link>

        <div className="blog-detail-header">
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
        </div>

        <img src={post.image} alt={post.title} className="blog-detail-image" />

        <article className="blog-detail-content">
          <h2>Introduction</h2>
          {article.introParagraphs.map((paragraph, index) => (
            <p key={`intro-${index}`}>{paragraph}</p>
          ))}

          {article.sections.map((section) => (
            <section key={section.heading} className="blog-detail-topic">
              <h2>{section.heading}</h2>
              {section.subSections.map((subSection) => (
                <div key={subSection.title} className="blog-detail-subtopic">
                  <h3>{subSection.title}</h3>
                  {subSection.paragraphs.map((paragraph, index) => (
                    <p key={`${subSection.title}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </section>
          ))}

          <section className="blog-detail-topic">
            <h2>Conclusion</h2>
            {article.conclusionParagraphs.map((paragraph, index) => (
              <p key={`conclusion-${index}`}>{paragraph}</p>
            ))}
          </section>
        </article>
      </section>
    </div>
  );
};

export default BlogDetailPage;
