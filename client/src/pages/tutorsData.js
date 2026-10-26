import teacherOneImage from "../assets/teachers/teach1.jpg";
import teacherTwoImage from "../assets/teachers/teach2.jpg";
import teacherThreeImage from "../assets/teachers/teach3.jpg";
import teacherFourImage from "../assets/teachers/teach4.jpg";
import teacherFiveImage from "../assets/teachers/teach5.jpg";
import teacherSixImage from "../assets/teachers/teach6.jpg";

export const tutors = [
  {
    id: "riya-malhotra",
    name: "Dr. Riya Malhotra",
    subjects: ["SAT", "AP Calculus", "IGCSE Mathematics"],
    primarySubject: "Mathematics & SAT",
    location: "Delhi, India",
    experience: "10+ years",
    qualification: "M.Sc. Mathematics, B.Ed.",
    rating: 4.9,
    shortDescription: "Specialized in score improvement strategies for SAT and AP math learners.",
    about:
      "I help students build strong problem-solving foundations and test-taking confidence through structured practice and concept clarity.",
    phone: "+91 99103 44403",
    image: teacherOneImage,
    reviews: [
      { id: 1, reviewer: "Aarav (Parent)", rating: 5, feedback: "My son improved from 1280 to 1490 in SAT with her guidance." },
      { id: 2, reviewer: "Meera (Student)", rating: 5, feedback: "Very clear explanations and amazing weekly revision plans." }
    ]
  },
  {
    id: "aman-khanna",
    name: "Aman Khanna",
    subjects: ["Computer Science", "Python", "Data Science Basics"],
    primarySubject: "Coding & Computer Science",
    location: "Noida, India",
    experience: "8+ years",
    qualification: "B.Tech. Computer Science",
    rating: 4.8,
    shortDescription: "Project-based coding mentor for school and college learners.",
    about:
      "I focus on practical coding skills, algorithmic thinking, and portfolio projects to help students gain real confidence.",
    phone: "+91 99588 12210",
    image: teacherTwoImage,
    reviews: [
      { id: 1, reviewer: "Sana (Student)", rating: 5, feedback: "Built my first Python app in 3 weeks with his support." },
      { id: 2, reviewer: "Rohit (Parent)", rating: 4.5, feedback: "Great communication and structured coding assignments." }
    ]
  },
  {
    id: "niharika-rao",
    name: "Niharika Rao",
    subjects: ["English", "IELTS", "Communication Skills"],
    primarySubject: "English & Communication",
    location: "Bengaluru, India",
    experience: "9+ years",
    qualification: "M.A. English Literature",
    rating: 4.8,
    shortDescription: "Improves writing, speaking, and exam communication performance.",
    about:
      "My sessions are personalized to each learner's level, with focus on vocabulary, grammar accuracy, and fluent speaking confidence.",
    phone: "+91 98107 23019",
    image: teacherThreeImage,
    reviews: [
      { id: 1, reviewer: "Ishita (Student)", rating: 5, feedback: "Helped me score 7.5 in IELTS speaking and writing." },
      { id: 2, reviewer: "Karan (Parent)", rating: 4.5, feedback: "Excellent progress tracking and feedback quality." }
    ]
  },
  {
    id: "sachin-verma",
    name: "Sachin Verma",
    subjects: ["Physics", "NEET Physics", "CBSE Class 11-12"],
    primarySubject: "Physics",
    location: "Pune, India",
    experience: "11+ years",
    qualification: "M.Sc. Physics",
    rating: 4.7,
    shortDescription: "Concept-driven physics tutoring with test-level question practice.",
    about:
      "I simplify difficult physics topics with visuals and problem ladders that gradually build speed and accuracy.",
    phone: "+91 98730 28814",
    image: teacherFourImage,
    reviews: [
      { id: 1, reviewer: "Raghav (Student)", rating: 4.5, feedback: "Mechanics became much easier after his sessions." },
      { id: 2, reviewer: "Priya (Parent)", rating: 5, feedback: "Very disciplined teaching method and strong test practice." }
    ]
  },
  {
    id: "ananya-joshi",
    name: "Ananya Joshi",
    subjects: ["Chemistry", "IB DP Chemistry", "Organic Chemistry"],
    primarySubject: "Chemistry",
    location: "Mumbai, India",
    experience: "7+ years",
    qualification: "M.Sc. Chemistry",
    rating: 4.7,
    shortDescription: "Known for simplifying organic and physical chemistry modules.",
    about:
      "I use concept maps and quick recall frameworks so students can retain and apply chemistry in exams effectively.",
    phone: "+91 97020 31105",
    image: teacherFiveImage,
    reviews: [
      { id: 1, reviewer: "Dev (Student)", rating: 4.5, feedback: "Her revision sheets are extremely helpful before exams." },
      { id: 2, reviewer: "Neha (Parent)", rating: 5, feedback: "My daughter gained confidence and better grades quickly." }
    ]
  },
  {
    id: "harshita-mehta",
    name: "Harshita Mehta",
    subjects: ["Biology", "NEET Biology", "IGCSE Biology"],
    primarySubject: "Biology",
    location: "Hyderabad, India",
    experience: "6+ years",
    qualification: "M.Sc. Biotechnology",
    rating: 4.6,
    shortDescription: "Interactive biology sessions with diagrams and memory techniques.",
    about:
      "I support learners with visual learning methods, chapter-wise quizzes, and exam strategy for board and entrance preparation.",
    phone: "+91 91214 70621",
    image: teacherSixImage,
    reviews: [
      { id: 1, reviewer: "Tanvi (Student)", rating: 4.5, feedback: "Her mnemonics made NEET biology revision easier." },
      { id: 2, reviewer: "Aditya (Parent)", rating: 4.5, feedback: "Very patient and consistent mentorship." }
    ]
  }
];
