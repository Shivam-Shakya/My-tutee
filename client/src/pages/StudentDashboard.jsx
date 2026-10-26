import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { BASE_URL, ORIGIN_URL } from "../config";
import {
  FiHome, FiBook, FiVideo, FiFileText, FiPlay, FiFolder,
  FiTrendingUp, FiBell, FiUser, FiMenu, FiX, FiSettings, FiCalendar, FiArrowRight,
  FiClock, FiCheckCircle, FiAlertCircle, FiMessageSquare, FiDownload, FiSearch, FiLogOut
} from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StudentCoursesSection from '../components/dashboard/student/StudentCoursesSection';
import StudentLiveClassesSection from '../components/dashboard/student/StudentLiveClassesSection';
import StudentAssignmentsSection from '../components/dashboard/student/StudentAssignmentsSection';
import StudentTestsSection from '../components/dashboard/student/StudentTestsSection';
import StudentDoubtsSection from '../components/dashboard/student/StudentDoubtsSection';
import StudentProfileSection from '../components/dashboard/student/StudentProfileSection';
import './StudentDashboard.css';



const COURSES_API_URL = `${BASE_URL}/courses`;
const ASSIGNMENTS_API_URL = `${BASE_URL}/assignments`;
const SCHEDULED_CLASSES_API_URL = `${BASE_URL}/scheduled-classes`;
const PAYMENTS_API_URL = `${BASE_URL}/payments`;
const TEACHER_ASSIGNMENTS_API_URL = `${BASE_URL}/teacher-assignments`;
const LECTURES_API_URL = `${BASE_URL}/lectures`;
const DOUBTS_API_URL = `${BASE_URL}/doubts`;
const TESTS_API_URL = `${BASE_URL}/tests`;
const API_ORIGIN = ORIGIN_URL;
const NOTIFICATIONS_API_URL = `${BASE_URL}/notifications`;

// All available subjects with their applicable class levels
const allSubjects = [
  { id: 1, name: 'Mathematics', classLevels: ['9', '10', '11', '12', 'Graduation'], description: 'Master algebra, geometry, calculus and more with expert guidance.', icon: '📐' },
  { id: 2, name: 'Physics', classLevels: ['9', '10', '11', '12', 'Graduation'], description: 'Understand the laws of nature through interactive physics lessons.', icon: '⚛️' },
  { id: 3, name: 'Chemistry', classLevels: ['9', '10', '11', '12', 'Graduation'], description: 'Explore organic, inorganic and physical chemistry concepts.', icon: '🧪' },
  { id: 4, name: 'Biology', classLevels: ['9', '10', '11', '12', 'Graduation'], description: 'Dive deep into life sciences and biological systems.', icon: '🧬' },
  { id: 5, name: 'English', classLevels: ['9', '10', '11', '12', 'Graduation', 'Post Graduation'], description: 'Improve grammar, vocabulary, and communication skills.', icon: '📚' },
  { id: 6, name: 'Computer Science', classLevels: ['9', '10', '11', '12', 'Graduation', 'Post Graduation'], description: 'Learn programming, algorithms, and software development.', icon: '💻' },
  { id: 7, name: 'Economics', classLevels: ['11', '12', 'Graduation', 'Post Graduation'], description: 'Understand micro and macroeconomics concepts.', icon: '📊' },
  { id: 8, name: 'History', classLevels: ['9', '10', '11', '12'], description: 'Explore world history and civilizations.', icon: '🏛️' },
  { id: 9, name: 'Geography', classLevels: ['9', '10', '11', '12'], description: 'Study physical and human geography.', icon: '🌍' },
  { id: 10, name: 'Political Science', classLevels: ['11', '12', 'Graduation', 'Post Graduation'], description: 'Learn about political systems and governance.', icon: '⚖️' },
  { id: 11, name: 'Accountancy', classLevels: ['11', '12', 'Graduation'], description: 'Master financial accounting and business studies.', icon: '📒' },
  { id: 12, name: 'Business Studies', classLevels: ['11', '12', 'Graduation'], description: 'Understand business principles and management.', icon: '💼' },
];

const progressData = [
  { week: 'Week 1', progress: 20 },
  { week: 'Week 2', progress: 35 },
  { week: 'Week 3', progress: 45 },
  { week: 'Week 4', progress: 60 },
  { week: 'Week 5', progress: 72 },
  { week: 'Week 6', progress: 85 },
];

const buildAssetUrl = (fileUrl) => {
  if (!fileUrl) return '';
  return fileUrl.startsWith('http') ? fileUrl : `${API_ORIGIN}${fileUrl}`;
};

const getSubjectIcon = (subjectName) => {
  return allSubjects.find((subject) => subject.name === subjectName)?.icon || '🎥';
};

const formatFileSize = (size = 0) => {
  if (!size) return '0 KB';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
};

const formatMessageDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const formatClassLevelLabel = (classLevel) => {
  if (!classLevel) return '';
  return classLevel === 'Graduation' || classLevel === 'Post Graduation'
    ? classLevel
    : `Class ${classLevel}`;
};

const testOptionLabels = ['A', 'B', 'C', 'D'];

const createEmptyTestDraft = () => ({
  answers: {},
  startedAt: null,
  durationSeconds: 0,
  submitting: false,
  error: ''
});

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/embed/')) {
        return url;
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const videoId = parsedUrl.pathname.split('/')[2];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      }

      const videoId = parsedUrl.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }
  } catch (error) {
    console.error('Invalid video link:', error);
  }

  return '';
};

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [messageThreads, setMessageThreads] = useState([]);
  const [messageThreadsLoading, setMessageThreadsLoading] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedMessageThread, setSelectedMessageThread] = useState(null);
  const [messagesError, setMessagesError] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [studentTests, setStudentTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [assignmentSubmittingId, setAssignmentSubmittingId] = useState('');
  const [testAnswerDrafts, setTestAnswerDrafts] = useState({});
  const [activeTestId, setActiveTestId] = useState('');
  const [activeTestRemainingSeconds, setActiveTestRemainingSeconds] = useState(0);
  const [doubtForm, setDoubtForm] = useState({
    subject: '',
    title: '',
    description: '',
    attachment: null
  });

  const token = localStorage.getItem('token');
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    selectedSubjects: [],
    assignedTeachers: [],
    upcomingClasses: [],
    paidSubjects: [],
    learningProgress: {},
    notifications: [],
    pendingAssignments: [],
    recordedLectures: [],
    studentClassLevel: '',
  });

  // Get student's class level from user profile
  const studentClassLevel = user?.classLevel || user?.profile?.currentClass?.replace(/th|st|nd|rd|Class /gi, '').trim() || '';

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/+$/, '');

    if (normalizedPath.endsWith('/tests')) {
      setActiveMenu('tests');
      return;
    }

    if (normalizedPath.endsWith('/doubts')) {
      setActiveMenu('doubts');
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchDashboardData = async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const teachersRes = await fetch(`${ASSIGNMENTS_API_URL}/my-teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const teachersData = await teachersRes.json();

        const statsRes = await fetch(`${ASSIGNMENTS_API_URL}/student-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        // Fetch scheduled classes for paid subjects (filtered by class level on backend)
        const classesRes = await fetch(`${SCHEDULED_CLASSES_API_URL}/student-classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const classesData = await classesRes.json();

        // Fetch active payments
        const paymentsRes = await fetch(`${PAYMENTS_API_URL}/active-subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const paymentsData = await paymentsRes.json();

        // Fetch teacher assignments (homework) for student's class level
        const assignmentsRes = await fetch(`${TEACHER_ASSIGNMENTS_API_URL}/student-assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const assignmentsData = await assignmentsRes.json();

        const lecturesRes = await fetch(`${LECTURES_API_URL}/student-lectures`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const lecturesData = await lecturesRes.json();

        const notificationsRes = await fetch(`${NOTIFICATIONS_API_URL}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const notificationsData = await notificationsRes.json();
        if (notificationsRes.ok && notificationsData.notifications) {
          setStudentNotifications(notificationsData.notifications.slice(0, 10));
        }
        const transformedTeachers = (teachersData.teachers || []).map(teacher => ({
          ...teacher,
          assignedTimetable: teacher.timetable || [],
          assignedPrice: teacher.pricePerHour || teacher.pricePerMonth || '',
          assignedPricePerHour: teacher.pricePerHour || '',
          assignedPricePerMonth: teacher.pricePerMonth || '',
        }));

        const selectedSubjectName = user?.profile?.selectedSubSubject?.name;
        const selectedCourseName = user?.profile?.selectedCourse?.name || '';
        const enrolledProgramName = user?.profile?.enrolledProgram?.name || '';
        const enrolledCourseName = user?.profile?.enrolledProgram?.courseName || '';
        const courseTargets = [
          selectedSubjectName,
          selectedCourseName,
          enrolledProgramName,
          enrolledCourseName,
          user?.profile?.assignedTeacher?.assignedSubject
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());
        const matchesCourseTarget = (value = '') => {
          const normalizedValue = String(value || '').toLowerCase();
          if (!courseTargets.length || !normalizedValue) return true;
          return courseTargets.some((target) => normalizedValue.includes(target) || target.includes(normalizedValue));
        };
        // Assignments are already scoped to the authenticated student by the API.
        // Do not use cached profile selections to hide persisted teacher mappings.
        const filteredTeachers = transformedTeachers;

        const learningProgress = {};
        filteredTeachers.forEach(teacher => {
          learningProgress[teacher.assignedSubject] = teacher.progress || 0;
        });

        const notifications = filteredTeachers.slice(0, 5).map((teacher, idx) => ({
          id: idx + 1,
          type: 'assignment',
          message: `Teacher ${teacher.name} has been assigned to you for ${teacher.assignedSubject}`,
          time: new Date(teacher.assignedAt).toLocaleDateString(),
          unread: true
        }));

        // Transform teacher assignments (homework) for display
        const pendingAssignments = (assignmentsData.assignments || []).map(assignment => ({
          id: assignment._id,
          title: assignment.title,
          subject: assignment.subject,
          classLevel: assignment.classLevel,
          teacher: assignment.teacher?.name || 'Unknown',
          dueDate: new Date(assignment.dueDate).toLocaleDateString(),
          status: assignment.submissionStatus || 'pending',
          description: assignment.description,
          totalMarks: assignment.totalMarks,
          marks: assignment.marks,
          feedback: assignment.feedback
        })).filter((assignment) => matchesCourseTarget(assignment.subject));

        const recordedLectures = (lecturesData.lectures || []).map((lecture) => ({
          id: lecture._id,
          title: lecture.title,
          subject: lecture.subject,
          classLevel: lecture.classLevel,
          description: lecture.description,
          teacher: lecture.teacher?.name || 'Unknown',
          teacherId: lecture.teacher?._id || '',
          videoType: lecture.videoType,
          videoLink: lecture.videoLink || '',
          embedUrl: getYouTubeEmbedUrl(lecture.videoLink || ''),
          videoUrl: buildAssetUrl(lecture.videoFile?.fileUrl),
          videoFileName: lecture.videoFile?.originalName || '',
          thumbnail: getSubjectIcon(lecture.subject),
          createdAt: new Date(lecture.createdAt).toLocaleDateString(),
          materials: (lecture.materials || []).map((material) => ({
            id: `${lecture._id}-${material.fileName}`,
            fileName: material.originalName,
            fileUrl: buildAssetUrl(material.fileUrl),
            size: material.size || 0,
            mimeType: material.mimeType || ''
          }))
        })).filter((lecture) => matchesCourseTarget(lecture.subject));

        // Transform scheduled classes for display
        const upcomingClasses = (classesData.classes || []).map(cls => ({
          id: cls._id,
          title: cls.title,
          subject: cls.subject,
          classLevel: cls.classLevel,
          teacher: cls.teacher?.name || 'Unknown',
          teacherId: cls.teacher?._id,
          date: new Date(cls.date).toLocaleDateString(),
          time: cls.time,
          duration: cls.duration,
          platform: cls.platform,
          meetingLink: cls.meetingLink,
          description: cls.description
        })).filter((cls) => matchesCourseTarget(cls.subject));

        setDashboardData({
          selectedSubjects: courseTargets.length > 0 ? courseTargets : (statsData.subjects || []),
          assignedTeachers: filteredTeachers,
          upcomingClasses: upcomingClasses,
          paidSubjects: classesData.paidSubjects || paymentsData.activeSubjects?.map(s => s.subject).filter((subject) => matchesCourseTarget(subject)) || [],
          studentClassLevel: studentClassLevel,
          learningProgress,
          notifications,
          pendingAssignments,
          recordedLectures,
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchDashboardData(true);

      const intervalId = setInterval(() => {
        fetchDashboardData(false);
      }, 30000);

      return () => clearInterval(intervalId);
    } else {
      setLoading(false);
    }
    }, [token]);

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setActiveMenu('teachers');
    setTeacherLoading(true);

    try {
      const res = await fetch(`${COURSES_API_URL}/teachers?subject=${encodeURIComponent(subject.name)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAvailableTeachers(data.teachers || []);
      } else {
        setAvailableTeachers([]);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setAvailableTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleAssignTeacher = async (teacher) => {
    if (!token || !teacher?._id || !selectedSubject?.name) {
      alert('Unable to assign this teacher. Please try again.');
      return;
    }

    const teacherWithAssignedSubject = {
      ...teacher,
      assignedSubject: selectedSubject?.name,
      assignedSubjectIcon: selectedSubject?.icon,
      assignedTimetable: teacher.profile?.subjectDetails?.[selectedSubject?.name]?.timetable || [],
      assignedPrice: teacher.profile?.subjectDetails?.[selectedSubject?.name]?.pricePerHour || teacher.profile?.feeStructure || '500',
    };

    try {
      const res = await fetch(`${ASSIGNMENTS_API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: teacher._id,
          subject: selectedSubject.name,
          classLevel: studentClassLevel,
          amountPaid: 0,
          paymentMethod: 'card',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to assign teacher');
        return;
      }

      const persistedTeacher = data.assignment?.teacher
        ? {
          ...teacherWithAssignedSubject,
          _id: data.assignment.teacher._id,
          name: data.assignment.teacher.name,
          email: data.assignment.teacher.email,
        }
        : teacherWithAssignedSubject;

      setDashboardData((prev) => ({
        ...prev,
        assignedTeachers: [
          ...prev.assignedTeachers.filter((item) => !(
            String(item._id) === String(teacher._id)
            && item.assignedSubject === selectedSubject.name
          )),
          persistedTeacher,
        ],
        selectedSubjects: [...new Set([...prev.selectedSubjects, selectedSubject.name])],
        notifications: [
          { id: Date.now(), type: 'assignment', message: `Teacher ${teacher.name} has been assigned to you for ${selectedSubject.name}`, time: 'Just now', unread: true },
          ...prev.notifications,
        ],
      }));
      setShowTeacherModal(false);
      setActiveMenu('assigned');
    } catch (error) {
      console.error('Failed to assign teacher:', error);
      alert('Failed to assign teacher. Please try again.');
    }
  };

  const handleStartLearning = (teacher) => {
    navigate('/payment', { state: { course: selectedSubject, teacher } });
  };

  const handleOpenDoubts = () => {
    setActiveMenu('doubts');
    if (location.pathname !== '/dashboard/studentdeshboard/doubts') {
      navigate('/dashboard/studentdeshboard/doubts');
    }
  };

  const handleOpenTests = () => {
    setActiveMenu('tests');
    if (location.pathname !== '/dashboard/studentdeshboard/tests') {
      navigate('/dashboard/studentdeshboard/tests');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleOpenStudentMessage = async (teacher) => {
    handleOpenDoubts();
    setMessageSearch('');
    setMessagesError('');

    if (!teacher) return;

    setDoubtForm((prev) => ({
      ...prev,
      subject: teacher.assignedSubject || prev.subject
    }));

    const existingMatch = messageThreads.find((thread) => (
      thread.teacher?._id === teacher._id && thread.subject === teacher.assignedSubject
    ));

    if (existingMatch) {
      setSelectedMessageThread(existingMatch);
      return;
    }

    const fetchedThreads = await fetchStudentMessageThreads({ withLoading: true });
    const fetchedMatch = (fetchedThreads || []).find((thread) => (
      thread.teacher?._id === teacher._id && thread.subject === teacher.assignedSubject
    ));

    if (fetchedMatch) {
      setSelectedMessageThread(fetchedMatch);
    }
  };

  const handleJoinClass = async (teacher, slot) => {
    try {
      const res = await fetch(`${BASE_URL}/notifications/join-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: teacher._id,
          subjectName: teacher.assignedSubject,
          slot,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Joined class! Teacher has been notified.`);
      } else {
        alert(data.message || 'Failed to join class');
      }
    } catch (error) {
      console.error('Error joining class:', error);
      alert('Failed to join class');
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!assignmentId || !token) return;

    const content = window.prompt('Enter assignment submission notes (optional):', '') || '';

    try {
      setAssignmentSubmittingId(assignmentId);
      const res = await fetch(`${TEACHER_ASSIGNMENTS_API_URL}/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, attachments: [] })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to submit assignment');
        return;
      }

      setDashboardData((prev) => ({
        ...prev,
        pendingAssignments: prev.pendingAssignments.map((assignment) => (
          assignment.id === assignmentId
            ? {
              ...assignment,
              status: data?.submission?.status || 'submitted'
            }
            : assignment
        ))
      }));
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert('Failed to submit assignment');
    } finally {
      setAssignmentSubmittingId('');
    }
  };

  const fetchStudentMessageThreads = async ({ withLoading = false } = {}) => {
    if (!token) return;

    try {
      if (withLoading) {
        setMessageThreadsLoading(true);
      }

      const res = await fetch(`${DOUBTS_API_URL}/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setMessagesError(data.message || 'Failed to load doubts');
        return;
      }

      setMessagesError('');
      const doubts = Array.isArray(data.doubts) ? data.doubts : [];
      setMessageThreads(doubts);

      if (doubts.length > 0 && !selectedMessageThread) {
        setSelectedMessageThread(doubts[0]);
      }

      if (selectedMessageThread) {
        const refreshedSelected = doubts.find((thread) => (
          thread._id === selectedMessageThread._id
        ));

        if (refreshedSelected) {
          setSelectedMessageThread(refreshedSelected);
        }
      }

      return doubts;
    } catch (error) {
      console.error('Failed to load doubts:', error);
      setMessagesError('Failed to load doubts');
      return [];
    } finally {
      if (withLoading) {
        setMessageThreadsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || activeMenu !== 'doubts') return;

    fetchStudentMessageThreads({ withLoading: true });

    const threadInterval = setInterval(() => {
      fetchStudentMessageThreads({ withLoading: false });
    }, 8000);

    return () => clearInterval(threadInterval);
  }, [token, activeMenu]);

  const handleSendStudentMessage = async () => {
    if (!doubtForm.subject || !doubtForm.title.trim() || !doubtForm.description.trim()) {
      setMessagesError('Subject, doubt title, and doubt description are required');
      return { success: false };
    }

    try {
      setMessageSending(true);
      setMessagesError('');

      const formData = new FormData();
      formData.append('subject', doubtForm.subject);
      formData.append('title', doubtForm.title.trim());
      formData.append('description', doubtForm.description.trim());
      if (doubtForm.attachment) {
        formData.append('attachment', doubtForm.attachment);
      }

      const res = await fetch(`${DOUBTS_API_URL}/student`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setMessagesError(data.message || 'Failed to submit doubt');
        return { success: false };
      }

      setDoubtForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        attachment: null
      }));
      setMessagesError('');
      fetchStudentMessageThreads({ withLoading: false });
      if (data.doubt) {
        setSelectedMessageThread(data.doubt);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to submit doubt:', error);
      setMessagesError('Failed to submit doubt');
      return { success: false };
    } finally {
      setMessageSending(false);
    }
  };

  const fetchStudentTests = async ({ withLoading = false } = {}) => {
    if (!token) return;

    try {
      if (withLoading) {
        setTestsLoading(true);
      }

      const res = await fetch(`${TESTS_API_URL}/student-tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setTestsError(data.message || 'Failed to load tests');
        return;
      }

      setTestsError('');
      const tests = Array.isArray(data.tests) ? data.tests : [];
      setStudentTests(tests);
      setTestAnswerDrafts((prev) => {
        const nextDrafts = {};

        tests.forEach((test) => {
          if (!test?._id) return;

          const existingDraft = prev[test._id] || createEmptyTestDraft();
          const submittedAnswers = Array.isArray(test.submission?.answers)
            ? test.submission.answers.reduce((accumulator, answer) => {
              accumulator[answer.questionIndex] = answer.selectedOption;
              return accumulator;
            }, {})
            : existingDraft.answers;

          nextDrafts[test._id] = {
            ...createEmptyTestDraft(),
            ...existingDraft,
            answers: submittedAnswers,
            startedAt: test.submission ? null : existingDraft.startedAt,
            durationSeconds: test.submission
              ? 0
              : existingDraft.durationSeconds || Math.max(1, Number(test.durationMinutes || 60)) * 60,
            submitting: false,
            error: ''
          };
        });

        return nextDrafts;
      });
    } catch (error) {
      console.error('Failed to load student tests:', error);
      setTestsError('Failed to load tests');
    } finally {
      if (withLoading) {
        setTestsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || activeMenu !== 'tests') return;

    fetchStudentTests({ withLoading: true });

    const intervalId = setInterval(() => {
      fetchStudentTests({ withLoading: false });
    }, 12000);

    return () => clearInterval(intervalId);
  }, [token, activeMenu]);

  useEffect(() => {
    if (!activeTestId) {
      setActiveTestRemainingSeconds(0);
      return;
    }

    const activeTest = studentTests.find((test) => test._id === activeTestId);
    if (!activeTest || activeTest.submission) {
      setActiveTestRemainingSeconds(0);
      return;
    }

    const activeDraft = testAnswerDrafts[activeTestId] || createEmptyTestDraft();
    const durationSeconds = activeDraft.durationSeconds || Math.max(1, Number(activeTest.durationMinutes || 60)) * 60;
    const startedAt = activeDraft.startedAt || Date.now();
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    setActiveTestRemainingSeconds(Math.max(0, durationSeconds - elapsedSeconds));
  }, [activeTestId, studentTests, testAnswerDrafts]);

  useEffect(() => {
    if (!activeTestId) return;

    const activeTest = studentTests.find((test) => test._id === activeTestId);
    if (!activeTest || activeTest.submission) return;

    const timerId = setInterval(() => {
      setActiveTestRemainingSeconds((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          clearInterval(timerId);
          handleSubmitTestAnswer(activeTestId, { autoSubmit: true });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [activeTestId, studentTests]);

  const updateTestDraft = (testId, updates) => {
    setTestAnswerDrafts((prev) => ({
      ...prev,
      [testId]: {
        ...createEmptyTestDraft(),
        ...(prev[testId] || {}),
        ...updates
      }
    }));
  };

  const handleSelectTestOption = (testId, questionIndex, selectedOption, totalQuestions) => {
    updateTestDraft(testId, {
      answers: {
        ...((testAnswerDrafts[testId] || createEmptyTestDraft()).answers || {}),
        [questionIndex]: selectedOption
      },
      error: ''
    });
  };

  const handleOpenStudentTest = (test) => {
    if (!test?._id) return;

    setActiveTestId(test._id);
    if (test.submission) {
      setActiveTestRemainingSeconds(0);
      return;
    }

    const existingDraft = testAnswerDrafts[test._id] || createEmptyTestDraft();
    const durationSeconds = Math.max(1, Number(test.durationMinutes || 60)) * 60;
    const startedAt = existingDraft.startedAt || Date.now();
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

    updateTestDraft(test._id, {
      startedAt,
      durationSeconds,
      error: ''
    });
    setActiveTestRemainingSeconds(remainingSeconds);
  };

  const handleToggleStudentTest = (test) => {
    if (!test?._id) return;

    if (activeTestId === test._id) {
      setActiveTestId('');
      setActiveTestRemainingSeconds(0);
      return;
    }

    handleOpenStudentTest(test);
  };

  const handleSubmitTestAnswer = async (testId, { autoSubmit = false } = {}) => {
    const test = studentTests.find((item) => item._id === testId);
    const totalQuestions = Array.isArray(test?.questions) ? test.questions.length : 0;
    const draft = testAnswerDrafts[testId] || createEmptyTestDraft();

    if (!test || totalQuestions === 0) {
      updateTestDraft(testId, { error: 'This test has no questions available' });
      return;
    }

    const answers = Array.from({ length: totalQuestions }, (_, questionIndex) => ({
      questionIndex,
      selectedOption: draft.answers?.[questionIndex] || ''
    }));

    if (!autoSubmit && answers.some((answer) => !answer.selectedOption)) {
      updateTestDraft(testId, { error: 'Answer all questions before submitting the test' });
      return;
    }

    try {
      updateTestDraft(testId, { submitting: true, error: '' });

      const res = await fetch(`${TESTS_API_URL}/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers, autoSubmit })
      });

      const data = await res.json();
      if (!res.ok) {
        updateTestDraft(testId, { submitting: false, error: data.message || 'Failed to submit test' });
        return;
      }

      if (data.test) {
        setStudentTests((prev) => prev.map((item) => (item._id === testId ? data.test : item)));
      }

      updateTestDraft(testId, {
        answers: answers.reduce((accumulator, answer) => {
          accumulator[answer.questionIndex] = answer.selectedOption;
          return accumulator;
        }, {}),
        startedAt: null,
        durationSeconds: 0,
        submitting: false,
        error: ''
      });
      if (activeTestId === testId) {
        setActiveTestRemainingSeconds(0);
      }
    } catch (error) {
      console.error('Failed to submit test answer:', error);
      updateTestDraft(testId, { submitting: false, error: 'Failed to submit test' });
    }
  };

  const renderLectureMedia = (lecture) => {
    if (lecture.videoType === 'file' && lecture.videoUrl) {
      return (
        <video className="lecture-video-player" controls preload="metadata" src={lecture.videoUrl}>
          Your browser does not support the video tag.
        </video>
      );
    }

    if (lecture.embedUrl) {
      return (
        <iframe
          className="lecture-video-frame"
          src={lecture.embedUrl}
          title={lecture.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <div className="lecture-external-link-box">
        <span className="lecture-thumbnail large">{lecture.thumbnail}</span>
        <p>This lecture opens in an external player.</p>
        <button className="open-recording-btn" onClick={() => window.open(lecture.videoLink, '_blank', 'noopener,noreferrer')}>
          Open Recording <FiArrowRight />
        </button>
      </div>
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'courses', label: 'My Courses', icon: FiBook },
    { id: 'live-classes', label: 'Live Classes', icon: FiVideo },
    { id: 'assignments', label: 'Assignments', icon: FiFileText },
    { id: 'tests', label: 'Tests', icon: FiFileText },
    { id: 'recorded', label: 'Recorded Lectures', icon: FiPlay },
    { id: 'materials', label: 'Study Materials', icon: FiFolder },
    { id: 'progress', label: 'Progress', icon: FiTrendingUp },
    { id: 'doubts', label: 'Doubts', icon: FiMessageSquare },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'profile', label: 'Profile', icon: FiUser },
  ];

  const enrolledProgram = user?.profile?.enrolledProgram || null;
  const selectedCourse = user?.profile?.selectedCourse || (enrolledProgram
    ? { id: `${enrolledProgram.courseName}-program`, name: enrolledProgram.courseName, icon: '🎯' }
    : null);
  const selectedSubSubject = user?.profile?.selectedSubSubject || (enrolledProgram
    ? { name: enrolledProgram.name, selectionType: 'program' }
    : null);
  const assignedTeacher = dashboardData.assignedTeachers[0] || user?.profile?.assignedTeacher || null;
  const paidCourses = selectedCourse && selectedSubSubject
    ? [{
      id: selectedCourse.id,
      name: selectedCourse.name,
      icon: selectedCourse.icon || '📘',
      grade: selectedSubSubject.name,
      description: assignedTeacher?.name ? `Assigned: ${assignedTeacher.name}` : 'Subject selected'
    }]
    : [];
  const enrolledCoursesCount = selectedCourse && selectedSubSubject ? 1 : 0;

  if (loading) {
    return (
      <div className="student-dashboard-modern student-dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const avgProgress = Object.keys(dashboardData.learningProgress).length > 0
    ? Math.round(Object.values(dashboardData.learningProgress).reduce((a, b) => a + b, 0) / Object.keys(dashboardData.learningProgress).length)
    : 65;

  const studyMaterials = dashboardData.recordedLectures.flatMap((lecture) =>
    lecture.materials.map((material) => ({
      ...material,
      lectureId: lecture.id,
      lectureTitle: lecture.title,
      subject: lecture.subject,
      teacher: lecture.teacher
    }))
  );
  const filteredMessageThreads = (Array.isArray(messageThreads) ? messageThreads : []).filter((thread) => {
    if (!thread || typeof thread !== 'object') return false;

    const normalizedSearch = messageSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    return thread.teacher?.name?.toLowerCase().includes(normalizedSearch)
      || thread.teacher?.email?.toLowerCase().includes(normalizedSearch)
      || thread.subject?.toLowerCase().includes(normalizedSearch)
      || thread.title?.toLowerCase().includes(normalizedSearch)
      || thread.description?.toLowerCase().includes(normalizedSearch)
      || thread.status?.toLowerCase().includes(normalizedSearch)
      || thread.classLevel?.toLowerCase().includes(normalizedSearch)
      || thread.solution?.toLowerCase().includes(normalizedSearch);
  });
  const filteredStudentTests = (Array.isArray(studentTests) ? studentTests : []).filter((test) => {
    if (!test || typeof test !== 'object') return false;

    const normalizedSearch = testSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    return test.title?.toLowerCase().includes(normalizedSearch)
      || test.subject?.toLowerCase().includes(normalizedSearch)
      || test.teacher?.name?.toLowerCase().includes(normalizedSearch)
      || test.classLevel?.toLowerCase().includes(normalizedSearch)
      || test.description?.toLowerCase().includes(normalizedSearch);
  });

  return (
    <div className="student-dashboard-modern student-dashboard-page">

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'tests') {
                  handleOpenTests();
                  setSidebarOpen(false);
                  return;
                }

                if (item.id === 'doubts') {
                  handleOpenDoubts();
                  setSidebarOpen(false);
                  return;
                }

                setActiveMenu(item.id);
                if (location.pathname !== '/dashboard/studentdeshboard') {
                  navigate('/dashboard/studentdeshboard');
                }

                setSidebarOpen(false);
              }}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.id === 'notifications' && dashboardData.notifications.filter(n => n.unread).length > 0 && (
                <span className="nav-badge">{dashboardData.notifications.filter(n => n.unread).length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-topbar student-topbar">
          <button
            className={`dashboard-menu-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="dashboard-topbar-right">
            <span className="dashboard-user-name">{user?.name || 'Student'}</span>
            <button type="button" className="topbar-logout-btn" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Dashboard Overview */}
          {activeMenu === 'dashboard' && (
            <>
              {/* Class Level Warning */}
              {!studentClassLevel && (
                <div className="class-level-warning">
                  <FiAlertCircle className="warning-icon" />
                  <div className="warning-content">
                    <h4>Set Your Class Level</h4>
                    <p>Please set your class level in your profile to see courses and classes relevant to you.</p>
                  </div>
                  <button className="warning-btn" onClick={() => setActiveMenu('profile')}>
                    Go to Profile
                  </button>
                </div>
              )}

              <div className="welcome-card">
                <div className="welcome-content">
                  <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                  <p>Continue your learning journey. You have {dashboardData.pendingAssignments.filter(a => a.status === 'pending').length} pending assignments.</p>
                  {studentClassLevel && (
                    <span className="class-level-badge">
                      {studentClassLevel === 'Graduation' || studentClassLevel === 'Post Graduation'
                        ? studentClassLevel
                        : `Class ${studentClassLevel}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="dashboard-two-column">
                <section className="dashboard-column-card">
                  <div className="card-header">
                    <h3><FiCalendar className="header-icon" /> Class Schedule</h3>
                    <button className="view-all-btn" onClick={() => setActiveMenu('live-classes')}>View All</button>
                  </div>

                  <div className="classes-list">
                    {dashboardData.upcomingClasses.length > 0 ? (
                      dashboardData.upcomingClasses.slice(0, 4).map((cls) => (
                        <div key={cls.id} className="class-item">
                          <div className="class-time">
                            <span className="day">{cls.date}</span>
                            <span className="time">{cls.time}</span>
                          </div>
                          <div className="class-info">
                            <h4>{cls.title}</h4>
                            <p>{cls.subject} with {cls.teacher}</p>
                          </div>
                          <button
                            className="join-btn"
                            onClick={() => cls.meetingLink ? window.open(cls.meetingLink, '_blank') : alert('Meeting link not available yet')}
                          >
                            Join Class
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state compact">
                        <FiCalendar className="empty-icon" />
                        <p>No class schedule available yet.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="dashboard-column-card">
                  <div className="card-header">
                    <h3><FiBook className="header-icon" /> Enrollment</h3>
                    <button className="view-all-btn" onClick={() => setActiveMenu('courses')}>View All</button>
                  </div>

                  {(selectedCourse || selectedSubSubject) ? (
                    <div className="enrollment-summary">
                      <div className="enrollment-row">
                        <span>Enrolled Course</span>
                        <strong>{selectedCourse?.name || 'Not available'}</strong>
                      </div>
                      <div className="enrollment-row">
                        <span>Enrolled Program</span>
                        <strong>{enrolledProgram?.name || selectedSubSubject?.name || 'Not available'}</strong>
                      </div>
                      {enrolledProgram?.description && (
                        <p className="enrollment-description">{enrolledProgram.description}</p>
                      )}

                      <div className="teacher-interaction-actions">
                        <button type="button" className="interaction-btn primary" onClick={() => setActiveMenu('doubts')}>
                          Message Teacher
                        </button>
                        <button type="button" className="interaction-btn" onClick={() => setActiveMenu('live-classes')}>
                          Class Schedule
                        </button>
                        <button type="button" className="interaction-btn" onClick={() => setActiveMenu('assignments')}>
                          Assignments
                        </button>
                        <button type="button" className="interaction-btn" onClick={() => setActiveMenu('tests')}>
                          Tests
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      <FiBook className="empty-icon" />
                      <p>No enrolled course or program yet.</p>
                      <button className="action-btn" onClick={() => navigate('/student/course-selection')}>Open Course Selection</button>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {/* My Courses - Only Paid Courses */}
          {activeMenu === 'courses' && (
            <StudentCoursesSection
              selectedCourse={selectedCourse}
              selectedSubSubject={selectedSubSubject}
              assignedTeacher={assignedTeacher}
              enrolledProgram={enrolledProgram}
              onOpenCourseSelection={() => navigate('/student/course-selection')}
            />
          )}

          {/* Live Classes */}
          {activeMenu === 'live-classes' && (
            <StudentLiveClassesSection
              dashboardData={dashboardData}
              onJoinClass={handleJoinClass}
              onOpenCourses={() => setActiveMenu('courses')}
              onOpenDoubts={() => setActiveMenu('doubts')}
            />
          )}

          {/* Assignments */}
          {activeMenu === 'assignments' && (
            <StudentAssignmentsSection
              assignments={dashboardData.pendingAssignments}
              onOpenDoubts={() => setActiveMenu('doubts')}
              onSubmitAssignment={handleSubmitAssignment}
              assignmentSubmittingId={assignmentSubmittingId}
            />
          )}

          {/* Tests */}
          {activeMenu === 'tests' && (
            <StudentTestsSection
              testSearch={testSearch}
              setTestSearch={setTestSearch}
              fetchStudentTests={fetchStudentTests}
              testsError={testsError}
              testsLoading={testsLoading}
              filteredStudentTests={filteredStudentTests}
              testAnswerDrafts={testAnswerDrafts}
              createEmptyTestDraft={createEmptyTestDraft}
              formatClassLevelLabel={formatClassLevelLabel}
              formatMessageDateTime={formatMessageDateTime}
              testOptionLabels={testOptionLabels}
              handleSelectTestOption={handleSelectTestOption}
              handleSubmitTestAnswer={handleSubmitTestAnswer}
              activeTestId={activeTestId}
              activeTestRemainingSeconds={activeTestRemainingSeconds}
              handleToggleStudentTest={handleToggleStudentTest}
              onOpenDoubts={() => setActiveMenu('doubts')}
            />
          )}

          {/* Recorded Lectures */}
          {activeMenu === 'recorded' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Recorded Lectures</h2>
                <p>Watch recorded lessons at your own pace</p>
              </div>
              <div className="recorded-grid">
                {dashboardData.recordedLectures.length > 0 ? dashboardData.recordedLectures.map((lecture) => (
                  <div key={lecture.id} className="recorded-card detailed">
                    <div className="recorded-media">
                      {renderLectureMedia(lecture)}
                    </div>
                    <div className="recorded-info">
                      <div className="recorded-header-row">
                        <div>
                          <h4>{lecture.title}</h4>
                          <p>{lecture.subject} • {lecture.teacher}</p>
                        </div>
                        <span className="recorded-meta-tag">
                          {lecture.classLevel === 'Graduation' || lecture.classLevel === 'Post Graduation' ? lecture.classLevel : `Class ${lecture.classLevel}`}
                        </span>
                      </div>
                      {lecture.description && <p className="recorded-description">{lecture.description}</p>}
                      <div className="recorded-actions">
                        {lecture.videoType === 'link' && !lecture.embedUrl && (
                          <button className="open-recording-btn" onClick={() => window.open(lecture.videoLink, '_blank', 'noopener,noreferrer')}>
                            Open Recording <FiArrowRight />
                          </button>
                        )}
                        {lecture.videoType === 'file' && lecture.videoUrl && (
                          <a className="download-btn subtle" href={lecture.videoUrl} target="_blank" rel="noreferrer">
                            Open Video
                          </a>
                        )}
                      </div>
                      {lecture.materials.length > 0 ? (
                        <div className="material-links">
                          {lecture.materials.map((material) => (
                            <a key={material.id} className="material-link" href={material.fileUrl} target="_blank" rel="noreferrer" download>
                              <FiDownload />
                              <span>{material.fileName}</span>
                              <small>{formatFileSize(material.size)}</small>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="no-materials-text">No supporting materials attached.</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="empty-full-state full-span">
                    <FiPlay className="empty-icon" />
                    <h3>No Recorded Lectures Yet</h3>
                    <p>Your teachers have not uploaded any lecture recordings for your subscribed subjects yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Study Materials */}
          {activeMenu === 'materials' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Study Materials</h2>
                <p>Access notes, PDFs, and resources</p>
              </div>
              <div className="materials-grid">
                {studyMaterials.length > 0 ? studyMaterials.map((material) => (
                  <div key={material.id} className="material-card">
                    <FiFolder className="material-icon" />
                    <h4>{material.fileName}</h4>
                    <p>{material.subject} • {material.lectureTitle}</p>
                    <p>{formatFileSize(material.size)} • {material.teacher}</p>
                    <a className="download-btn" href={material.fileUrl} target="_blank" rel="noreferrer" download>
                      Download
                    </a>
                  </div>
                )) : (
                  <div className="empty-full-state full-span">
                    <FiFolder className="empty-icon" />
                    <h3>No Study Materials Available</h3>
                    <p>Materials shared by your teachers will appear here once lectures are uploaded.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {activeMenu === 'progress' && (
            <div className="page-section">
              <div className="page-header">
                <h2>My Progress</h2>
                <p>Track your learning journey</p>
              </div>
              <div className="progress-section">
                <div className="progress-overview">
                  <div className="progress-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray={`${avgProgress * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="progress-text">
                      <span className="progress-value">{avgProgress}%</span>
                      <span className="progress-label">Overall</span>
                    </div>
                  </div>
                </div>
                <div className="progress-chart-full">
                  <h3>Weekly Progress</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Line type="monotone" dataKey="progress" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Doubts */}
          {activeMenu === 'doubts' && (
            <StudentDoubtsSection
              messagesError={messagesError}
              doubtForm={doubtForm}
              setDoubtForm={setDoubtForm}
              dashboardData={dashboardData}
              activeTeacher={assignedTeacher}
              handleSendStudentMessage={handleSendStudentMessage}
              messageSending={messageSending}
              messageSearch={messageSearch}
              setMessageSearch={setMessageSearch}
              messageThreadsLoading={messageThreadsLoading}
              filteredMessageThreads={filteredMessageThreads}
              selectedMessageThread={selectedMessageThread}
              setSelectedMessageThread={setSelectedMessageThread}
              formatMessageDateTime={formatMessageDateTime}
              formatClassLevelLabel={formatClassLevelLabel}
              buildAssetUrl={buildAssetUrl}
            />
          )}

          {/* Notifications */}
          {activeMenu === 'notifications' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Notifications</h2>
                <button className="mark-all-btn">Mark All as Read</button>
              </div>
              <div className="notifications-full-list">
                {dashboardData.notifications.map((notif) => (
                  <div key={notif.id} className={`notification-card ${notif.unread ? 'unread' : ''}`}>
                    <div className={`notif-icon ${notif.type}`}>
                      {notif.type === 'assignment' && <FiUser />}
                      {notif.type === 'class' && <FiVideo />}
                      {notif.type === 'message' && <FiMessageSquare />}
                    </div>
                    <div className="notif-details">
                      <p>{notif.message}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    {notif.unread && <span className="unread-indicator"></span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile */}
          {activeMenu === 'profile' && (
            <StudentProfileSection onSaveComplete={() => setActiveMenu('dashboard')} />
          )}

          {/* Teachers */}
          {activeMenu === 'teachers' && selectedSubject && (
            <div className="page-section">
              <div className="page-header">
                <h2>Teachers for {selectedSubject.name}</h2>
                <button className="back-btn" onClick={() => setActiveMenu('courses')}>← Back to Courses</button>
              </div>
              {teacherLoading ? (
                <div className="loading-state"><div className="loading-spinner"></div><p>Finding teachers...</p></div>
              ) : (
                <div className="teachers-grid">
                  {availableTeachers.map((teacher) => (
                    <div key={teacher._id} className="teacher-card">
                      <div className="teacher-header">
                        <div className="teacher-avatar">{teacher.name?.charAt(0)}</div>
                        <div className="teacher-basic">
                          <h4>{teacher.name}</h4>
                          <span className="subject-tag">{selectedSubject.name}</span>
                        </div>
                      </div>
                      <div className="teacher-details">
                        <div className="detail-row"><span className="label">Experience</span><span className="value">{teacher.profile?.experience || '2+ years'}</span></div>
                        <div className="detail-row"><span className="label">Mode</span><span className="value">{teacher.profile?.teachingMode || 'Online'}</span></div>
                        <div className="detail-row"><span className="label">Rating</span><span className="value">⭐ {teacher.profile?.rating || '4.8'}</span></div>
                        <div className="detail-row"><span className="label">Fee</span><span className="value fee">₹{teacher.profile?.subjectDetails?.[selectedSubject?.name]?.pricePerHour || teacher.profile?.feeStructure || '500'}/hr</span></div>
                      </div>
                      <div className="teacher-actions">
                        <button className="view-btn" onClick={() => handleViewTeacher(teacher)}>View Profile</button>
                        <button className="assign-btn" onClick={() => handleAssignTeacher(teacher)}>Assign Teacher</button>
                      </div>
                    </div>
                  ))}
                  {availableTeachers.length === 0 && (
                    <div className="empty-full-state"><FiUser className="empty-icon" /><h3>No Teachers Available</h3><p>No teachers are currently teaching {selectedSubject.name}</p></div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assigned Teachers */}
          {activeMenu === 'assigned' && (
            <div className="page-section">
              <div className="page-header">
                <h2>My Assigned Teachers</h2>
              </div>
              <div className="assigned-teachers-grid">
                {dashboardData.assignedTeachers.map((teacher, index) => (
                  <div key={`${teacher._id}-${index}`} className="assigned-teacher-card">
                    <div className="teacher-header">
                      <div className="teacher-avatar">{teacher.name?.charAt(0)}</div>
                      <div className="teacher-basic">
                        <h4>{teacher.name}</h4>
                        <span className="subject-tag">{teacher.assignedSubject}</span>
                      </div>
                    </div>
                    <div className="schedule-info">
                      {teacher.assignedTimetable?.map((slot, idx) => (
                        <div key={idx} className="slot-info"><FiCalendar /> {slot.day} at {slot.time}</div>
                      ))}
                    </div>
                    <div className="teacher-actions">
                      <button className="message-btn" onClick={() => handleOpenStudentMessage(teacher)}><FiMessageSquare /> Doubt</button>
                      <button className="start-btn" onClick={() => handleStartLearning(teacher)}>Start Learning</button>
                    </div>
                  </div>
                ))}
                {dashboardData.assignedTeachers.length === 0 && (
                  <div className="empty-full-state"><FiUser className="empty-icon" /><h3>No Teachers Assigned</h3><p>Choose a subject and find teachers to get started</p><button className="action-btn" onClick={() => setActiveMenu('courses')}>Browse Courses</button></div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Teacher Profile Modal */}
      {showTeacherModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowTeacherModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTeacherModal(false)}><FiX /></button>
            <div className="modal-header">
              <div className="teacher-avatar-xl">{selectedTeacher.name?.charAt(0)}</div>
              <h2>{selectedTeacher.name}</h2>
              <span className="subject-badge-lg">{selectedSubject?.name}</span>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item"><span className="label">🎓 Qualifications</span><span className="value">{selectedTeacher.profile?.qualifications || 'M.Sc., B.Ed'}</span></div>
                <div className="info-item"><span className="label">🏅 Experience</span><span className="value">{selectedTeacher.profile?.experience || '5+ years'}</span></div>
                <div className="info-item"><span className="label">💻 Teaching Mode</span><span className="value">{selectedTeacher.profile?.teachingMode || 'Online'}</span></div>
                <div className="info-item"><span className="label">🎬 Free Demo</span><span className="value">{selectedTeacher.profile?.demoClassAvailable ? 'Yes' : 'No'}</span></div>
              </div>
              <div className="modal-section">
                <h4>🗓️ Schedule for {selectedSubject?.name}</h4>
                <div className="timetable-list">
                  {selectedTeacher.profile?.subjectDetails?.[selectedSubject?.name]?.timetable?.length > 0 ? (
                    selectedTeacher.profile.subjectDetails[selectedSubject.name].timetable.map((slot, idx) => (
                      <div key={idx} className="timetable-item"><span className="day">{slot.day}</span><span className="time">{slot.time}</span><span className="duration">{slot.duration ? `${slot.duration} min` : '60 min'}</span></div>
                    ))
                  ) : (
                    <p className="no-schedule">Schedule not set by teacher</p>
                  )}
                </div>
              </div>
              <div className="modal-section">
                <h4>💰 Fee for {selectedSubject?.name}</h4>
                <div className="pricing-info"><span className="price">₹{selectedTeacher.profile?.subjectDetails?.[selectedSubject?.name]?.pricePerHour || selectedTeacher.profile?.feeStructure || '500'}/hr</span></div>
              </div>
              {selectedTeacher.profile?.bio && (
                <div className="modal-section"><h4>About</h4><p className="bio">{selectedTeacher.profile.bio}</p></div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowTeacherModal(false)}>Close</button>
              <button className="btn-primary" onClick={() => handleAssignTeacher(selectedTeacher)}>Assign Teacher</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default StudentDashboard;
