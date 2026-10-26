import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherProfile from "./pages/TeacherProfile";
import StudentProfile from "./pages/StudentProfile";
import PaymentPage from "./pages/PaymentPage";
import CourseSelectionPage from "./pages/CourseSelectionPage";
import "./App.css";
import SAT from "./components/home/AllCourses/SatPage";
import AP from "./components/home/AllCourses/ApPage";
import IBDP from "./components/home/AllCourses/IbdpPage";
import IBMYP from "./components/home/AllCourses/IbmypPage";
import IGCSE from "./components/home/AllCourses/IgcsePage";
import ACT from "./components/home/AllCourses/ActPage";
import PSAT from "./components/home/AllCourses/PsatPage";
import ESAT from "./components/home/AllCourses/EsatPage";
import TMUA from "./components/home/AllCourses/TmuaPage";
import GRE from "./components/home/AllCourses/GrePage";
import GMAT from "./components/home/AllCourses/GmatPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import FindTutorsPage from "./pages/FindTutorsPage";
import TeacherDetailsPage from "./pages/TeacherDetailsPage";
import EnglishSpeakingPage from "./pages/EnglishSpeakingPage";
import TestPrepPage from "./pages/TestPrepPage";
import CareerCounselingPage from "./pages/CareerCounselingPage";
import AcademicProgramPage from "./pages/AcademicProgramPage";
import ResumeMakingPage from "./pages/ResumeMakingPage";
import VisaAssistancePage from "./pages/VisaAssistancePage";
import PlacementProgramPage from "./pages/PlacementProgramPage";
import PopupOfferPage from "./pages/PopupOfferPage";
import Login from "./auth/Login";
import SignUp from "./auth/SignUp";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Check if current route is a dashboard route (hide navbar and footer)
  const isDashboardRoute = () => {
    const path = location.pathname;
    return (
      path.startsWith('/dashboard/studentdeshboard') ||
      path.startsWith('/dashboard/parentdashboard') ||
      path.startsWith('/dashboard/teacherdeshboard') ||
      path.startsWith('/student/course-selection') ||
      path.startsWith('/profile/student') ||
      path.startsWith('/profile/teacher')
    );
  };

  const showNavbarFooter = !isDashboardRoute();

  return (
    <>
      <ScrollToTop />
      {showNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* 🔐 Student Dashboard (also for parents) */}
        <Route
          path="/dashboard/studentdeshboard"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "student" ? (
              <StudentDashboard />
            ) : user.role === "parent" ? (
              <Navigate to="/dashboard/parentdashboard" />
            ) : user.role === "teacher" ? (
              <Navigate to="/dashboard/teacherdeshboard" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/dashboard/studentdeshboard/tests"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "student" ? (
              <StudentDashboard />
            ) : user.role === "parent" ? (
              <Navigate to="/dashboard/parentdashboard" />
            ) : user.role === "teacher" ? (
              <Navigate to="/dashboard/teacherdeshboard" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/dashboard/studentdeshboard/doubts"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "student" ? (
              <StudentDashboard />
            ) : user.role === "parent" ? (
              <Navigate to="/dashboard/parentdashboard" />
            ) : user.role === "teacher" ? (
              <Navigate to="/dashboard/teacherdeshboard" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 🔐 Parent Dashboard */}
        <Route
          path="/dashboard/parentdashboard"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "parent" ? (
              <ParentDashboard />
            ) : user.role === "student" ? (
              <Navigate to="/dashboard/studentdeshboard" />
            ) : user.role === "teacher" ? (
              <Navigate to="/dashboard/teacherdeshboard" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/dashboard/parentdeshboard"
          element={<Navigate to="/dashboard/parentdashboard" replace />}
        />

        <Route
          path="/dashboard/parent-dashboard"
          element={<Navigate to="/dashboard/parentdashboard" replace />}
        />

        {/* 🔐 Teacher Dashboard */}
        <Route
          path="/dashboard/teacherdeshboard"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "teacher" ? (
              <TeacherDashboard />
            ) : user.role === "parent" ? (
              <Navigate to="/dashboard/parentdashboard" />
            ) : user.role === "student" ? (
              <Navigate to="/dashboard/studentdeshboard" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 💳 Payment Page */}
        <Route
          path="/payment"
          element={
            user ? (
              <PaymentPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="/login" element={user ? <Navigate to="/dashboard/studentdeshboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard/studentdeshboard" replace /> : <SignUp />} />

        {/* 👤 Teacher Profile */}
        <Route
          path="/profile/teacher"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "teacher" ? (
              <TeacherProfile />
            ) : (
              <Navigate to="/profile/student" />
            )
          }
        />

        {/* 👤 Student Profile */}
        <Route
          path="/profile/student"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "student" || user.role === "parent" ? (
              <StudentProfile />
            ) : (
              <Navigate to="/profile/teacher" />
            )
          }
        />

        <Route
          path="/student/course-selection"
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === "student" ? (
              <CourseSelectionPage />
            ) : (
              <Navigate to="/dashboard/studentdeshboard" replace />
            )
          }
        />

        <Route path="/SatPage" element={<SAT />} />
        <Route path="/ApPage" element={<AP />} />
        <Route path="/Ib-dpPage" element={<IBDP />} />
        <Route path="/Ib-mypPage" element={<IBMYP />} />
        <Route path="/IgcsePage" element={<IGCSE />} />
        <Route path="/ActPage" element={<ACT />} />
        <Route path="/PsatPage" element={<PSAT />} />
        <Route path="/EsatPage" element={<ESAT />} />
        <Route path="/TmuaPage" element={<TMUA />} />
        <Route path="/GrePage" element={<GRE />} />
        <Route path="/GmatPage" element={<GMAT />} />
        <Route path="/GemtPage" element={<Navigate to="/GmatPage" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:blogId" element={<BlogDetailPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/find-tutors" element={<FindTutorsPage />} />
        <Route path="/find-tutors/:tutorId" element={<TeacherDetailsPage />} />
        <Route path="/english-speaking" element={<EnglishSpeakingPage />} />
        <Route path="/test-prep" element={<TestPrepPage />} />
        <Route path="/career-counseling" element={<CareerCounselingPage />} />
        <Route path="/academic" element={<AcademicProgramPage />} />
        <Route path="/resume-making" element={<ResumeMakingPage />} />
        <Route path="/visa-assistance" element={<VisaAssistancePage />} />
        <Route path="/placement" element={<PlacementProgramPage />} />
        <Route path="/popup-offer" element={<PopupOfferPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNavbarFooter && <Footer />}
    </>
  );
}

export default App;
