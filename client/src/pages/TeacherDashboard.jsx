import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiBook,
  FiUpload,
  FiCalendar,
  FiClipboard,
  FiUsers,
  FiBarChart2,
  FiMessageSquare,
  FiUser,
  FiBell,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiPlus,
  FiVideo,
  FiFileText,
  FiCheck,
  FiClock,
  FiDownload,
  FiLogOut,
  FiSettings,
  FiSearch,
  FiTrash2,
  FiEdit,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import TeacherProfile from './TeacherProfile';
import TeacherCreateCourseSection from '../components/dashboard/teacher/TeacherCreateCourseSection';
import TeacherScheduleClassSection from '../components/dashboard/teacher/TeacherScheduleClassSection';
import TeacherProfileSection from '../components/dashboard/teacher/TeacherProfileSection';
import TeacherTestsSection from '../components/dashboard/teacher/TeacherTestsSection';
import TeacherAssignmentsSection from '../components/dashboard/teacher/TeacherAssignmentsSection';
import TeacherStudentsSection from '../components/dashboard/teacher/TeacherStudentsSection';
import TeacherDoubtsSection from '../components/dashboard/teacher/TeacherDoubtsSection';
import TeacherUploadLectureSection from '../components/dashboard/teacher/TeacherUploadLectureSection';
import './TeacherDashboard.css';

import { BASE_URL, ORIGIN_URL } from "../config";

const API_URL = `${BASE_URL}/courses`;
const LECTURES_API_URL = `${BASE_URL}/lectures`;
const DOUBTS_API_URL = `${BASE_URL}/doubts`;
const TESTS_API_URL = `${BASE_URL}/tests`;
const DEFAULT_SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

const buildAssetUrl = (fileUrl) => {
  if (!fileUrl) return '';
 

return fileUrl.startsWith('http') ? fileUrl : `${ORIGIN_URL}${fileUrl}`;
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

const createEmptyTestQuestion = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  solution: ''
});

const optionLabels = ['A', 'B', 'C', 'D'];

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    subject: '',
    classLevel: '',
    title: '',
    date: '',
    time: '',
    duration: '60',
    description: '',
    platform: 'internal',
    meetingLink: ''
  });

  // Class level options
  const classLevelOptions = ['9', '10', '11', '12', 'Graduation', 'Post Graduation'];

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    subject: '',
    classLevel: '',
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    totalMarks: '100'
  });
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSubjectFilter, setStudentSubjectFilter] = useState('');
  const [studentsLastUpdated, setStudentsLastUpdated] = useState(null);
  const [teacherLectures, setTeacherLectures] = useState([]);
  const [lectureLoading, setLectureLoading] = useState(false);
  const [lectureSubmitting, setLectureSubmitting] = useState(false);
  const [lectureError, setLectureError] = useState('');
  const [lectureSuccess, setLectureSuccess] = useState('');
  const [teacherTests, setTeacherTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testsError, setTestsError] = useState('');
  const [testsSuccess, setTestsSuccess] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [selectedTestSubmissions, setSelectedTestSubmissions] = useState([]);
  const [selectedTestSubmissionsId, setSelectedTestSubmissionsId] = useState('');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentSubmissionsLoading, setRecentSubmissionsLoading] = useState(false);
  const [recentSubmissionsError, setRecentSubmissionsError] = useState('');
  const [studentPerformanceData, setStudentPerformanceData] = useState([]);
  const [studentPerformanceLoading, setStudentPerformanceLoading] = useState(false);
  const [courseEnrollmentData, setCourseEnrollmentData] = useState([]);
  const [courseEnrollmentLoading, setCourseEnrollmentLoading] = useState(false);
  const [assignmentStatusData, setAssignmentStatusData] = useState([]);
  const [assignmentStatusLoading, setAssignmentStatusLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [messageThreads, setMessageThreads] = useState([]);
  const [messageThreadsLoading, setMessageThreadsLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedMessageThread, setSelectedMessageThread] = useState(null);
  const [messageSending, setMessageSending] = useState(false);
  const [solutionInput, setSolutionInput] = useState('');
  const [lectureForm, setLectureForm] = useState({
    editingId: '',
    subject: '',
    classLevel: '',
    title: '',
    description: '',
    videoType: 'file',
    videoLink: '',
    videoFile: null,
    materialFiles: [],
    existingVideoName: '',
    existingVideoUrl: '',
    existingMaterials: [],
    removeMaterials: false
  });
  const [testForm, setTestForm] = useState({
    editingId: '',
    subject: '',
    classLevel: '',
    title: '',
    description: '',
    durationMinutes: '60',
    questions: [],
    currentQuestion: createEmptyTestQuestion(),
    editingQuestionIndex: -1,
    status: 'published'
  });

  const videoFileInputRef = useRef(null);
  const materialFileInputRef = useRef(null);
  const token = localStorage.getItem('token');

  const resetLectureForm = () => {
    setLectureForm({
      editingId: '',
      subject: '',
      classLevel: '',
      title: '',
      description: '',
      videoType: 'file',
      videoLink: '',
      videoFile: null,
      materialFiles: [],
      existingVideoName: '',
      existingVideoUrl: '',
      existingMaterials: [],
      removeMaterials: false
    });

    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }

    if (materialFileInputRef.current) {
      materialFileInputRef.current.value = '';
    }
  };

  const resetTestForm = () => {
    setTestForm({
      editingId: '',
      subject: '',
      classLevel: '',
      title: '',
      description: '',
      durationMinutes: '60',
      questions: [],
      currentQuestion: createEmptyTestQuestion(),
      editingQuestionIndex: -1,
      status: 'published'
    });
  };

  const fetchTeacherTests = async ({ withLoading = false } = {}) => {
    if (!token) return;

    try {
      if (withLoading) {
        setTestsLoading(true);
      }

      const res = await fetch(`${TESTS_API_URL}/teacher-tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setTestsError(data.message || 'Failed to load tests');
        return;
      }

      setTestsError('');
      setTeacherTests(data.tests || []);
    } catch (error) {
      console.error('Failed to fetch teacher tests:', error);
      setTestsError('Failed to load tests');
    } finally {
      if (withLoading) {
        setTestsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || activeMenu !== 'tests') return;
    fetchTeacherTests({ withLoading: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeMenu]);

  const handleTestFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTestForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTestQuestionChange = (event) => {
    const { name, value } = event.target;
    setTestForm((prev) => ({
      ...prev,
      currentQuestion: {
        ...prev.currentQuestion,
        [name]: value
      }
    }));
  };

  const handleAddQuestionToTest = () => {
    const normalizedQuestion = {
      questionText: testForm.currentQuestion.questionText.trim(),
      optionA: testForm.currentQuestion.optionA.trim(),
      optionB: testForm.currentQuestion.optionB.trim(),
      optionC: testForm.currentQuestion.optionC.trim(),
      optionD: testForm.currentQuestion.optionD.trim(),
      correctAnswer: testForm.currentQuestion.correctAnswer,
      solution: testForm.currentQuestion.solution.trim()
    };

    if (!normalizedQuestion.questionText || !normalizedQuestion.optionA || !normalizedQuestion.optionB || !normalizedQuestion.optionC || !normalizedQuestion.optionD || !normalizedQuestion.solution) {
      setTestsError('Each question must include text, all four options, a correct answer, and a solution');
      return;
    }

    setTestForm((prev) => {
      const nextQuestions = [...prev.questions];

      if (prev.editingQuestionIndex >= 0) {
        nextQuestions[prev.editingQuestionIndex] = normalizedQuestion;
      } else {
        nextQuestions.push(normalizedQuestion);
      }

      return {
        ...prev,
        questions: nextQuestions,
        currentQuestion: createEmptyTestQuestion(),
        editingQuestionIndex: -1
      };
    });
    setTestsError('');
  };

  const handleEditTestQuestion = (questionIndex) => {
    const question = testForm.questions[questionIndex];
    if (!question) return;

    setTestForm((prev) => ({
      ...prev,
      currentQuestion: { ...question },
      editingQuestionIndex: questionIndex
    }));
  };

  const handleRemoveTestQuestion = (questionIndex) => {
    setTestForm((prev) => {
      const nextQuestions = prev.questions.filter((_, index) => index !== questionIndex);
      const shouldResetEditor = prev.editingQuestionIndex === questionIndex;

      return {
        ...prev,
        questions: nextQuestions,
        currentQuestion: shouldResetEditor ? createEmptyTestQuestion() : prev.currentQuestion,
        editingQuestionIndex: shouldResetEditor ? -1 : prev.editingQuestionIndex > questionIndex ? prev.editingQuestionIndex - 1 : prev.editingQuestionIndex
      };
    });
  };

  const handleCancelQuestionEdit = () => {
    setTestForm((prev) => ({
      ...prev,
      currentQuestion: createEmptyTestQuestion(),
      editingQuestionIndex: -1
    }));
  };

  const handleSaveTest = async (event) => {
    event.preventDefault();
    const normalizedDuration = Number(testForm.durationMinutes);

    if (!testForm.subject || !testForm.classLevel || !testForm.title.trim()) {
      setTestsError('Subject, class level, and title are required');
      return { success: false, isEditing: Boolean(testForm.editingId) };
    }

    if (!Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
      setTestsError('Test duration must be greater than 0 minutes');
      return { success: false, isEditing: Boolean(testForm.editingId) };
    }

    if (testForm.questions.length === 0) {
      setTestsError('Add at least one question before saving the test');
      return { success: false, isEditing: Boolean(testForm.editingId) };
    }

    try {
      setTestSubmitting(true);
      setTestsError('');
      setTestsSuccess('');

      const payload = {
        subject: testForm.subject,
        classLevel: testForm.classLevel,
        title: testForm.title.trim(),
        description: testForm.description.trim(),
        durationMinutes: normalizedDuration,
        questions: testForm.questions,
        status: testForm.status
      };

      const isEditing = Boolean(testForm.editingId);
      const endpoint = isEditing ? `${TESTS_API_URL}/${testForm.editingId}` : TESTS_API_URL;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setTestsError(data.message || 'Failed to save test');
        return { success: false, isEditing };
      }

      setTestsSuccess(isEditing ? 'Test updated successfully!' : 'Test created successfully!');
      resetTestForm();
      fetchTeacherTests({ withLoading: false });
      return { success: true, isEditing };
    } catch (error) {
      console.error('Failed to save test:', error);
      setTestsError('Failed to save test');
      return { success: false, isEditing: Boolean(testForm.editingId) };
    } finally {
      setTestSubmitting(false);
    }
  };

  const handleEditTest = (test) => {
    setTestForm({
      editingId: test._id,
      subject: test.subject || '',
      classLevel: test.classLevel || '',
      title: test.title || '',
      description: test.description || '',
      durationMinutes: String(test.durationMinutes || 60),
      questions: (test.questions || []).map((question) => ({
        questionText: question.questionText || '',
        optionA: question.options?.[0] || '',
        optionB: question.options?.[1] || '',
        optionC: question.options?.[2] || '',
        optionD: question.options?.[3] || '',
        correctAnswer: question.correctAnswer || 'A',
        solution: question.solution || ''
      })),
      currentQuestion: createEmptyTestQuestion(),
      editingQuestionIndex: -1,
      status: test.status || 'published'
    });

    setTestsError('');
    setTestsSuccess('Editing selected test. Update fields and save.');
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const res = await fetch(`${TESTS_API_URL}/${testId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        setTestsError(data.message || 'Failed to delete test');
        return;
      }

      if (selectedTestSubmissionsId === testId) {
        setSelectedTestSubmissions([]);
        setSelectedTestSubmissionsId('');
      }

      if (testForm.editingId === testId) {
        resetTestForm();
      }

      setTestsSuccess('Test deleted successfully!');
      fetchTeacherTests({ withLoading: false });
    } catch (error) {
      console.error('Failed to delete test:', error);
      setTestsError('Failed to delete test');
    }
  };

  const handleToggleTestVisibility = async (testId, currentVisibility) => {
    try {
      setTestsError('');
      setTestsSuccess('');

      const res = await fetch(`${TESTS_API_URL}/${testId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });

      const data = await res.json();
      if (!res.ok) {
        setTestsError(data.message || 'Failed to update test visibility');
        return;
      }

      setTeacherTests((prev) => prev.map((test) => (
        test._id === testId ? { ...test, isVisible: !currentVisibility } : test
      )));
      setTestsSuccess(!currentVisibility ? 'Test is now visible to students' : 'Test is now hidden from students');
    } catch (error) {
      console.error('Failed to toggle test visibility:', error);
      setTestsError('Failed to update test visibility');
    }
  };

  const handleAssignTestToStudent = async (testId, studentId) => {
    if (!testId || !studentId) {
      return { success: false, message: 'Test and student are required' };
    }

    try {
      setTestsError('');
      setTestsSuccess('');

      const res = await fetch(`${TESTS_API_URL}/${testId}/assign-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.message || 'Failed to share test with student';
        setTestsError(message);
        return { success: false, message };
      }

      setTeacherTests((prev) => prev.map((test) => {
        if (test._id !== testId) return test;

        const existingAssignedStudents = Array.isArray(test.assignedStudents) ? test.assignedStudents : [];
        const alreadyAssigned = existingAssignedStudents.some((id) => String(id) === String(studentId));

        return {
          ...test,
          isVisible: true,
          assignedStudents: alreadyAssigned
            ? existingAssignedStudents
            : [...existingAssignedStudents, studentId]
        };
      }));

      const message = data.message || 'Test shared with student successfully';
      setTestsSuccess(message);
      return { success: true, message };
    } catch (error) {
      console.error('Failed to share test with student:', error);
      const message = 'Failed to share test with student';
      setTestsError(message);
      return { success: false, message };
    }
  };

  const handleViewTestSubmissions = async (testId) => {
    if (!testId) return;

    if (selectedTestSubmissionsId === testId) {
      setSelectedTestSubmissionsId('');
      setSelectedTestSubmissions([]);
      return;
    }

    try {
      setLoadingSubmissions(true);
      const res = await fetch(`${TESTS_API_URL}/${testId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setTestsError(data.message || 'Failed to load submissions');
        return;
      }

      setTestsError('');
      setSelectedTestSubmissionsId(testId);
      setSelectedTestSubmissions((data.submissions || []).map((submission) => ({
        ...submission,
        test: data.test || null
      })));
    } catch (error) {
      console.error('Failed to fetch test submissions:', error);
      setTestsError('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Fetch scheduled classes
  useEffect(() => {
    const fetchScheduledClasses = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/scheduled-classes/teacher-classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setScheduledClasses(data.classes || []);
        }
      } catch (error) {
        console.error('Failed to fetch scheduled classes:', error);
      }
    };

    fetchScheduledClasses();
  }, [token]);

  // Handle schedule form change
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle schedule form submit
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleLoading(true);
    setScheduleError('');
    setScheduleSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/scheduled-classes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: scheduleForm.subject,
          classLevel: scheduleForm.classLevel,
          title: scheduleForm.title,
          date: scheduleForm.date,
          time: scheduleForm.time,
          duration: parseInt(scheduleForm.duration),
          description: scheduleForm.description,
          platform: scheduleForm.platform,
          meetingLink: scheduleForm.meetingLink
        })
      });

      const data = await res.json();

      if (res.ok) {
        setScheduleSuccess('Class scheduled successfully!');
        setScheduledClasses(prev => [...prev, data.scheduledClass]);
        // Reset form
        setScheduleForm({
          subject: '',
          classLevel: '',
          title: '',
          date: '',
          time: '',
          duration: '60',
          description: '',
          platform: 'internal',
          meetingLink: ''
        });
        return { success: true };
      } else {
        setScheduleError(data.message || 'Failed to schedule class');
        return { success: false };
      }
    } catch (error) {
      console.error('Schedule class error:', error);
      setScheduleError('Server error. Please try again.');
      return { success: false };
    } finally {
      setScheduleLoading(false);
    }
  };

  // Handle cancel/delete scheduled class
  const handleCancelClass = async (classId) => {
    if (!window.confirm('Are you sure you want to cancel this class?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/scheduled-classes/${classId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setScheduledClasses(prev => prev.filter(c => c._id !== classId));
      }
    } catch (error) {
      console.error('Cancel class error:', error);
    }
  };

  // Fetch teacher's assignments
  useEffect(() => {
    const fetchTeacherAssignments = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/teacher-assignments/teacher-assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setTeacherAssignments(data.assignments || []);
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      }
    };

    fetchTeacherAssignments();
  }, [token]);

  const fetchTeacherStudents = async ({ withLoading = false } = {}) => {
    if (!token) return;

    try {
      if (withLoading) {
        setStudentsLoading(true);
      }
      setStudentsError('');

      const res = await fetch(`${API_BASE_URL}/assignments/my-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setTeacherStudents(data.students || []);
        setStudentsLastUpdated(new Date());
      } else {
        setStudentsError(data.message || 'Failed to load student list');
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudentsError('Failed to load student list');
    } finally {
      if (withLoading) {
        setStudentsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || activeMenu !== 'students') return;

    fetchTeacherStudents({ withLoading: true });

    const intervalId = setInterval(() => {
      fetchTeacherStudents({ withLoading: false });
    }, 30000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeMenu]);

  const fetchTeacherMessageThreads = async ({ withLoading = false } = {}) => {
    if (!token) return;

    try {
      if (withLoading) {
        setMessageThreadsLoading(true);
      }

      const res = await fetch(`${DOUBTS_API_URL}/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setMessagesError(data.message || 'Failed to load doubts');
        return;
      }

      setMessagesError('');
      setMessageThreads(data.doubts || []);

      if (data.doubts?.length > 0 && !selectedMessageThread) {
        setSelectedMessageThread(data.doubts[0]);
      }

      if (selectedMessageThread) {
        const refreshedSelected = (data.doubts || []).find((thread) => (
          thread._id === selectedMessageThread._id
        ));

        if (refreshedSelected) {
          setSelectedMessageThread(refreshedSelected);
        }
      }
    } catch (error) {
      console.error('Failed to fetch teacher doubts:', error);
      setMessagesError('Failed to load doubts');
    } finally {
      if (withLoading) {
        setMessageThreadsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || activeMenu !== 'doubts') return;

    fetchTeacherMessageThreads({ withLoading: true });

    const threadInterval = setInterval(() => {
      fetchTeacherMessageThreads({ withLoading: false });
    }, 8000);

    return () => clearInterval(threadInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeMenu]);

  useEffect(() => {
    // Keep the teacher's draft stable during polling refreshes for the same thread.
    // Only reset/prefill when the selected thread actually changes.
    if (!selectedMessageThread) {
      setSolutionInput('');
      return;
    }

    setSolutionInput(
      selectedMessageThread.status === 'solved'
        ? (selectedMessageThread.solution || '')
        : ''
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMessageThread?._id]);

  const handleSendTeacherMessage = async () => {
    const trimmedSolution = solutionInput.trim();
    if (!trimmedSolution || !selectedMessageThread) return { success: false };

    try {
      setMessageSending(true);
      const res = await fetch(`${DOUBTS_API_URL}/teacher/${selectedMessageThread._id}/solve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          solution: trimmedSolution
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessagesError(data.message || 'Failed to solve doubt');
        return { success: false };
      }

      setSolutionInput('');
      setMessagesError('');
      fetchTeacherMessageThreads({ withLoading: false });
      if (data.doubt) {
        setSelectedMessageThread(data.doubt);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to solve doubt:', error);
      setMessagesError('Failed to solve doubt');
      return { success: false };
    } finally {
      setMessageSending(false);
    }
  };

  useEffect(() => {
    const fetchTeacherLectures = async () => {
      if (!token) return;

      try {
        setLectureLoading(true);
        const res = await fetch(`${LECTURES_API_URL}/teacher-lectures`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setTeacherLectures(data.lectures || []);
        } else {
          setLectureError(data.message || 'Failed to load lectures');
        }
      } catch (error) {
        console.error('Failed to fetch lectures:', error);
        setLectureError('Failed to load lectures');
      } finally {
        setLectureLoading(false);
      }
    };

    fetchTeacherLectures();
  }, [token]);

  // Handle assignment form change
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle assignment form submit
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setAssignmentLoading(true);
    setAssignmentError('');
    setAssignmentSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/teacher-assignments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: assignmentForm.subject,
          classLevel: assignmentForm.classLevel,
          title: assignmentForm.title,
          description: assignmentForm.description,
          instructions: assignmentForm.instructions,
          dueDate: assignmentForm.dueDate,
          totalMarks: parseInt(assignmentForm.totalMarks)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setAssignmentSuccess('Assignment created successfully!');
        setTeacherAssignments(prev => [data.assignment, ...prev]);
        // Reset form
        setAssignmentForm({
          subject: '',
          classLevel: '',
          title: '',
          description: '',
          instructions: '',
          dueDate: '',
          totalMarks: '100'
        });
        return { success: true };
      } else {
        setAssignmentError(data.message || 'Failed to create assignment');
        return { success: false };
      }
    } catch (error) {
      console.error('Create assignment error:', error);
      setAssignmentError('Server error. Please try again.');
      return { success: false };
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/teacher-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setTeacherAssignments(prev => prev.filter(a => a._id !== assignmentId));
      }
    } catch (error) {
      console.error('Delete assignment error:', error);
    }
  };

  const handleLectureChange = (e) => {
    const { name, value, type, checked } = e.target;

    setLectureForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'videoType' && value === 'link' ? { videoFile: null } : {})
    }));

    if (name === 'videoType' && value === 'link' && videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
  };

  const handleLectureFileChange = (e) => {
    const { name, files } = e.target;
    const selectedFiles = Array.from(files || []);

    setLectureForm((prev) => ({
      ...prev,
      [name]: name === 'materialFiles' ? selectedFiles : (selectedFiles[0] || null)
    }));
  };

  const handleLectureSubmit = async (e) => {
    e.preventDefault();
    setLectureSubmitting(true);
    setLectureError('');
    setLectureSuccess('');

    try {
      const formData = new FormData();
      formData.append('subject', lectureForm.subject);
      formData.append('classLevel', lectureForm.classLevel);
      formData.append('title', lectureForm.title);
      formData.append('description', lectureForm.description);
      formData.append('videoType', lectureForm.videoType);
      formData.append('videoLink', lectureForm.videoLink);
      formData.append('removeMaterials', String(lectureForm.removeMaterials));

      if (lectureForm.videoFile) {
        formData.append('videoFile', lectureForm.videoFile);
      }

      lectureForm.materialFiles.forEach((file) => {
        formData.append('materials', file);
      });

      const isEditing = Boolean(lectureForm.editingId);
      const res = await fetch(
        isEditing ? `${LECTURES_API_URL}/${lectureForm.editingId}` : LECTURES_API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setLectureError(data.message || 'Failed to save lecture');
        return { success: false, isEditing };
      }

      setTeacherLectures((prev) => {
        if (isEditing) {
          return prev.map((lecture) => lecture._id === data.lecture._id ? data.lecture : lecture);
        }

        return [data.lecture, ...prev];
      });

      resetLectureForm();
      setLectureSuccess(isEditing ? 'Lecture updated successfully!' : 'Lecture uploaded successfully!');
      return { success: true, isEditing };
    } catch (error) {
      console.error('Lecture submit error:', error);
      setLectureError('Server error. Please try again.');
      return { success: false, isEditing: Boolean(lectureForm.editingId) };
    } finally {
      setLectureSubmitting(false);
    }
  };

  const handleEditLecture = (lecture) => {
    setLectureError('');
    setLectureSuccess('');
    setLectureForm({
      editingId: lecture._id,
      subject: lecture.subject || '',
      classLevel: lecture.classLevel || '',
      title: lecture.title || '',
      description: lecture.description || '',
      videoType: lecture.videoType || 'file',
      videoLink: lecture.videoLink || '',
      videoFile: null,
      materialFiles: [],
      existingVideoName: lecture.videoFile?.originalName || '',
      existingVideoUrl: lecture.videoFile?.fileUrl || '',
      existingMaterials: lecture.materials || [],
      removeMaterials: false
    });

    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }

    if (materialFileInputRef.current) {
      materialFileInputRef.current.value = '';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const res = await fetch(`${LECTURES_API_URL}/${lectureId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setLectureError(data.message || 'Failed to delete lecture');
        return;
      }

      setTeacherLectures((prev) => prev.filter((lecture) => lecture._id !== lectureId));
      setLectureSuccess('Lecture deleted successfully!');

      if (lectureForm.editingId === lectureId) {
        resetLectureForm();
      }
    } catch (error) {
      console.error('Delete lecture error:', error);
      setLectureError('Failed to delete lecture');
    }
  };

  const fetchRecentSubmissions = async ({ withLoading = false } = {}) => {
    if (!token) return;

    try {
      if (withLoading) {
        setRecentSubmissionsLoading(true);
      }

      setRecentSubmissionsError('');
      const res = await fetch(`${API_BASE_URL}/assignments/teacher-recent-submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setRecentSubmissionsError(data.message || 'Failed to load recent submissions');
        return;
      }

      setRecentSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch recent submissions:', error);
      setRecentSubmissionsError('Failed to load recent submissions');
    } finally {
      if (withLoading) {
        setRecentSubmissionsLoading(false);
      }
    }
  };

  const fetchStudentPerformance = async () => {
    if (!token) return;

    try {
      setStudentPerformanceLoading(true);
      setAnalyticsError('');

      const res = await fetch(`${API_BASE_URL}/assignments/analytics/student-performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setAnalyticsError(data.message || 'Failed to load performance data');
        return;
      }

      setStudentPerformanceData(data.performance || []);
    } catch (error) {
      console.error('Failed to fetch student performance:', error);
      setAnalyticsError('Failed to load performance data');
    } finally {
      setStudentPerformanceLoading(false);
    }
  };

  const fetchCourseEnrollment = async () => {
    if (!token) return;

    try {
      setCourseEnrollmentLoading(true);
      setAnalyticsError('');

      const res = await fetch(`${API_BASE_URL}/assignments/analytics/course-enrollment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setAnalyticsError(data.message || 'Failed to load enrollment data');
        return;
      }

      setCourseEnrollmentData(data.enrollment || []);
    } catch (error) {
      console.error('Failed to fetch course enrollment:', error);
      setAnalyticsError('Failed to load enrollment data');
    } finally {
      setCourseEnrollmentLoading(false);
    }
  };

  const fetchAssignmentStatus = async () => {
    if (!token) return;

    try {
      setAssignmentStatusLoading(true);
      setAnalyticsError('');

      const res = await fetch(`${API_BASE_URL}/assignments/analytics/assignment-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setAnalyticsError(data.message || 'Failed to load assignment status');
        return;
      }

      const statusData = [
        { name: 'Submitted', value: data.submittedPercentage || 0, color: '#10B981' },
        { name: 'Pending', value: data.pendingPercentage || 0, color: '#F97316' }
      ];

      setAssignmentStatusData(statusData);
    } catch (error) {
      console.error('Failed to fetch assignment status:', error);
      setAnalyticsError('Failed to load assignment status');
    } finally {
      setAssignmentStatusLoading(false);
    }
  };

  useEffect(() => {
    if (!token || activeMenu !== 'dashboard') return;
    fetchRecentSubmissions({ withLoading: true });
    fetchStudentPerformance();
    fetchCourseEnrollment();
    fetchAssignmentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeMenu]);

  // Get teacher's subjects from profile
  const teacherSubjects = user?.subjects || [];
  const subjectOptions = teacherSubjects.length > 0 ? teacherSubjects : DEFAULT_SUBJECT_OPTIONS;
  const studentSubjectOptions = [...new Set(teacherStudents.map((student) => student.subject))];
  const filteredStudents = teacherStudents.filter((student) => {
    const normalizedSearch = studentSearch.trim().toLowerCase();
    const matchesSearch = !normalizedSearch
      || student.name?.toLowerCase().includes(normalizedSearch)
      || student.email?.toLowerCase().includes(normalizedSearch)
      || student.classLevel?.toLowerCase().includes(normalizedSearch)
      || student.subject?.toLowerCase().includes(normalizedSearch);

    const matchesSubject = !studentSubjectFilter || student.subject === studentSubjectFilter;

    return matchesSearch && matchesSubject;
  });
  const filteredMessageThreads = messageThreads.filter((thread) => {
    const normalizedSearch = messageSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    return thread.student?.name?.toLowerCase().includes(normalizedSearch)
      || thread.student?.email?.toLowerCase().includes(normalizedSearch)
      || thread.subject?.toLowerCase().includes(normalizedSearch)
      || thread.title?.toLowerCase().includes(normalizedSearch)
      || thread.description?.toLowerCase().includes(normalizedSearch)
      || thread.status?.toLowerCase().includes(normalizedSearch)
      || thread.classLevel?.toLowerCase().includes(normalizedSearch)
      || thread.solution?.toLowerCase().includes(normalizedSearch);
  });
  const dashboardMessagesPreview = messageThreads.slice(0, 3);
  const filteredTeacherTests = teacherTests.filter((test) => {
    const normalizedSearch = testSearch.trim().toLowerCase();
    if (!normalizedSearch) return true;

    return test.title?.toLowerCase().includes(normalizedSearch)
      || test.subject?.toLowerCase().includes(normalizedSearch)
      || test.classLevel?.toLowerCase().includes(normalizedSearch)
      || test.description?.toLowerCase().includes(normalizedSearch)
      || test.status?.toLowerCase().includes(normalizedSearch)
      || (test.isVisible ? 'visible' : 'hidden').includes(normalizedSearch);
  });

  const pendingSubmissionsCount = recentSubmissions.filter((submission) => {
    const status = String(submission.status || '').toLowerCase();
    return status === 'pending' || status === 'submitted';
  }).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'create-course', label: 'Create Course', icon: FiBook },
    { id: 'upload-lecture', label: 'Upload Lecture', icon: FiUpload },
    { id: 'schedule-class', label: 'Schedule Live Class', icon: FiCalendar },
    { id: 'tests', label: 'Test', icon: FiClipboard },
    { id: 'assignments', label: 'Assignments', icon: FiClipboard },
    { id: 'students', label: 'Student List', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'doubts', label: 'Doubts', icon: FiMessageSquare },
    { id: 'profile', label: 'Profile', icon: FiUser }
  ];


  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setSidebarOpen(false);
  };

  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <aside className={`teacher-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`teacher-main ${sidebarOpen ? '' : 'expanded'}`}>

        <div className="teacher-topbar dashboard-topbar">
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
            <span className="dashboard-user-name">{user?.name || 'Teacher'}</span>
            <button type="button" className="topbar-logout-btn" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>


        {/* Dashboard Content */}
        <div className="teacher-content">
          {activeMenu === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <section className="welcome-section">
                <div className="welcome-card">
                  <div className="welcome-text">
                    <h1>Welcome back, {user?.name || 'Teacher'}! 👋</h1>
                    <p>You have {pendingSubmissionsCount} new submissions and {scheduledClasses.length} classes scheduled.</p>
                  </div>
                </div>
              </section>

              {/* Main Dashboard Grid */}
              <div className="dashboard-grid">
                {/* Student Submissions Table */}
                <section className="submissions-section">
                  <div className="section-header">
                    <h2 className="section-title">Recent Submissions</h2>
                    <button
                      className="view-all-btn"
                      type="button"
                      onClick={() => fetchRecentSubmissions({ withLoading: true })}
                    >
                      Refresh
                    </button>
                  </div>
                  {recentSubmissionsError && <div className="info-message">{recentSubmissionsError}</div>}
                  <div className="submissions-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Course/Subject</th>
                          <th>Assignment/Test</th>
                          <th>Submitted Date & Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissionsLoading ? (
                          <tr>
                            <td colSpan="5" className="submissions-empty">Loading submissions...</td>
                          </tr>
                        ) : recentSubmissions.length > 0 ? (
                          recentSubmissions.map((submission) => {
                            const status = String(submission.status || 'submitted').toLowerCase();
                            const statusClass = status === 'graded'
                              ? 'graded'
                              : status === 'late'
                                ? 'late'
                                : 'pending';

                            return (
                              <tr key={submission.id}>
                                <td className="student-cell">
                                  <div className="student-avatar">{(submission.studentName || 'S').charAt(0)}</div>
                                  <span>{submission.studentName || 'Student'}</span>
                                </td>
                                <td>{submission.course || submission.subject || 'N/A'}</td>
                                <td>{submission.itemName || 'N/A'}</td>
                                <td>{formatMessageDateTime(submission.submittedAt)}</td>
                                <td>
                                  <span className={`status-badge ${statusClass}`}>
                                    {statusClass === 'graded' ? <FiCheck /> : <FiClock />}
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" className="submissions-empty">No recent submissions available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Upcoming Classes */}
                <section className="upcoming-classes-section">
                  <div className="section-header">
                    <h2 className="section-title">Upcoming Classes</h2>
                    <button className="add-class-btn" onClick={() => setActiveMenu('schedule-class')}>
                      <FiPlus /> Add Class
                    </button>
                  </div>
                  <div className="classes-list">
                    {scheduledClasses.length > 0 ? (
                      scheduledClasses.slice(0, 3).map((cls) => (
                        <div key={cls._id} className="class-card">
                          <div className="class-time">
                            <span className="time">{cls.time}</span>
                            <span className="date">{new Date(cls.date).toLocaleDateString()}</span>
                          </div>
                          <div className="class-info">
                            <h3>{cls.title}</h3>
                            <p><FiUsers /> {cls.enrolledStudents?.length || 0} students enrolled</p>
                            <span className="class-subject-tag">{cls.subject}</span>
                          </div>
                          <button
                            className="start-class-btn"
                            onClick={() => cls.meetingLink ? window.open(cls.meetingLink, '_blank') : alert('No meeting link provided for this class')}
                          >
                            Start Class
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="no-classes-message">
                        <p>No upcoming classes scheduled</p>
                        <button className="add-class-btn" onClick={() => setActiveMenu('schedule-class')}>
                          <FiPlus /> Schedule a Class
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Analytics Section */}
                <section className="analytics-section">
                  <div className="section-header">
                    <h2 className="section-title">Student Performance</h2>
                  </div>
                  {studentPerformanceLoading ? (
                    <div className="info-message">Loading performance data...</div>
                  ) : studentPerformanceData.length > 0 && studentPerformanceData[0].name !== 'No data' ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={studentPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="avgScore"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={{ fill: '#2563EB', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="info-message">No data available</div>
                  )}
                </section>

                {/* Course Engagement */}
                <section className="engagement-section">
                  <div className="section-header">
                    <h2 className="section-title">Course Enrollment</h2>
                  </div>
                  {courseEnrollmentLoading ? (
                    <div className="info-message">Loading enrollment data...</div>
                  ) : courseEnrollmentData.length > 0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={courseEnrollmentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="students" fill="#F97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="info-message">No data available</div>
                  )}
                </section>

                {/* Assignment Status */}
                <section className="assignment-status-section">
                  <div className="section-header">
                    <h2 className="section-title">Assignment Status</h2>
                  </div>
                  {assignmentStatusLoading ? (
                    <div className="info-message">Loading assignment data...</div>
                  ) : assignmentStatusData.length > 0 ? (
                    <div className="pie-chart-container">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={assignmentStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {assignmentStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pie-legend">
                        {assignmentStatusData.map((item, index) => (
                          <div key={index} className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                            <span className="legend-label">{item.name}</span>
                            <span className="legend-value">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="info-message">No data available</div>
                  )}
                </section>

                {/* Doubts Panel */}
                <section className="messages-section">
                  <div className="section-header">
                    <h2 className="section-title">Doubts</h2>
                    <button className="view-all-btn" onClick={() => setActiveMenu('doubts')}>View All</button>
                  </div>
                  <div className="messages-list">
                    {dashboardMessagesPreview.length > 0 ? dashboardMessagesPreview.map((msg) => (
                      <div key={msg._id} className="message-card">
                        <div className="message-avatar">{msg.student?.name?.charAt(0) || 'S'}</div>
                        <div className="message-content">
                          <div className="message-header">
                            <h4>{msg.title}</h4>
                            <span className="message-time">{formatMessageDateTime(msg.updatedAt)}</span>
                          </div>
                          <p>{msg.subject} • {msg.status === 'solved' ? 'Solved' : 'Pending'}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="message-card">
                        <div className="message-content">
                          <p>No student doubts yet.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="message-input-wrapper">
                    <input type="text" placeholder="Open Doubts to review and resolve" disabled />
                    <button className="send-btn" onClick={() => setActiveMenu('doubts')}>Open</button>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* Create Course Section */}
          {activeMenu === 'create-course' && (
            <TeacherCreateCourseSection onBack={() => setActiveMenu('dashboard')} />
          )}

          {/* Upload Lecture Section */}
          {activeMenu === 'upload-lecture' && (
            <TeacherUploadLectureSection
              onBack={() => setActiveMenu('dashboard')}
              teacherLectures={teacherLectures}
              handleEditLecture={handleEditLecture}
              handleDeleteLecture={handleDeleteLecture}
              lectureForm={lectureForm}
              lectureError={lectureError}
              lectureSuccess={lectureSuccess}
              lectureLoading={lectureLoading}
              lectureSubmitting={lectureSubmitting}
              handleLectureSubmit={handleLectureSubmit}
              handleLectureChange={handleLectureChange}
              handleLectureFileChange={handleLectureFileChange}
              subjectOptions={subjectOptions}
              classLevelOptions={classLevelOptions}
              videoFileInputRef={videoFileInputRef}
              materialFileInputRef={materialFileInputRef}
              resetLectureForm={resetLectureForm}
              buildAssetUrl={buildAssetUrl}
              formatFileSize={formatFileSize}
            />
          )}

          {/* Upload Lecture Section (legacy, disabled) */}
          {activeMenu === '__legacy_upload-lecture' && (
            <div className="page-section">
              <div className="section-header">
                <h2 className="page-title">Upload Lecture</h2>
                <button className="back-btn" onClick={() => setActiveMenu('dashboard')}>← Back to Dashboard</button>
              </div>

              {teacherLectures.length > 0 && (
                <div className="existing-lectures">
                  <div className="section-header compact">
                    <h3 className="section-subtitle">Uploaded Lectures</h3>
                    <span className="lecture-count-tag">{teacherLectures.length} total</span>
                  </div>
                  <div className="lectures-management-grid">
                    {teacherLectures.map((lecture) => (
                      <div key={lecture._id} className="lecture-management-card">
                        <div className="lecture-management-header">
                          <div>
                            <h4>{lecture.title}</h4>
                            <p>{lecture.subject} • {lecture.classLevel === 'Graduation' || lecture.classLevel === 'Post Graduation' ? lecture.classLevel : `Class ${lecture.classLevel}`}</p>
                          </div>
                          <span className={`lecture-source-badge ${lecture.videoType}`}>
                            {lecture.videoType === 'file' ? 'Video File' : 'Video Link'}
                          </span>
                        </div>
                        {lecture.description && (
                          <p className="lecture-management-description">{lecture.description}</p>
                        )}
                        <div className="lecture-management-meta">
                          <span><FiVideo /> {lecture.videoType === 'file' ? (lecture.videoFile?.originalName || 'Uploaded video') : 'External recording link'}</span>
                          <span><FiFileText /> {lecture.materials?.length || 0} material{lecture.materials?.length === 1 ? '' : 's'}</span>
                          <span><FiClock /> {new Date(lecture.createdAt).toLocaleDateString()}</span>
                        </div>
                        {(lecture.videoType === 'link' || lecture.videoFile?.fileUrl || lecture.materials?.length > 0) && (
                          <div className="lecture-resource-links">
                            {(lecture.videoType === 'link' || lecture.videoFile?.fileUrl) && (
                              <button
                                type="button"
                                className="resource-link-btn"
                                onClick={() => window.open(lecture.videoType === 'link' ? lecture.videoLink : buildAssetUrl(lecture.videoFile?.fileUrl), '_blank', 'noopener,noreferrer')}
                              >
                                Open Video
                              </button>
                            )}
                            {lecture.materials?.map((material) => (
                              <a
                                key={material.fileName}
                                className="resource-link-btn secondary"
                                href={buildAssetUrl(material.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                download
                              >
                                {material.originalName}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="lecture-actions-row">
                          <button type="button" className="btn-small btn-edit" onClick={() => handleEditLecture(lecture)}>
                            <FiEdit /> Edit
                          </button>
                          <button type="button" className="btn-small btn-danger" onClick={() => handleDeleteLecture(lecture._id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-card">
                <h3 className="form-subtitle">{lectureForm.editingId ? 'Edit Lecture' : 'Upload New Lecture'}</h3>
                {lectureError && <div className="error-message">{lectureError}</div>}
                {lectureSuccess && <div className="success-message">{lectureSuccess}</div>}
                {lectureLoading && <div className="info-message">Loading lectures...</div>}

                <form onSubmit={handleLectureSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Subject</label>
                      <select name="subject" value={lectureForm.subject} onChange={handleLectureChange} required>
                        <option value="">Choose a subject</option>
                        {subjectOptions.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Class Level</label>
                      <select name="classLevel" value={lectureForm.classLevel} onChange={handleLectureChange} required>
                        <option value="">Choose class level</option>
                        {classLevelOptions.map((level) => (
                          <option key={level} value={level}>
                            {level === 'Graduation' || level === 'Post Graduation' ? level : `Class ${level}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Lecture Title</label>
                    <input
                      type="text"
                      name="title"
                      value={lectureForm.title}
                      onChange={handleLectureChange}
                      placeholder="Enter lecture title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Lecture Description</label>
                    <textarea
                      rows="4"
                      name="description"
                      value={lectureForm.description}
                      onChange={handleLectureChange}
                      placeholder="Brief description of the lecture"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Video Source</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="videoType" value="file" checked={lectureForm.videoType === 'file'} onChange={handleLectureChange} /> Video File
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="videoType" value="link" checked={lectureForm.videoType === 'link'} onChange={handleLectureChange} /> YouTube / Meeting Recording Link
                      </label>
                    </div>
                  </div>

                  {lectureForm.videoType === 'file' ? (
                    <div className="form-group">
                      <label>{lectureForm.editingId ? 'Replace Video File (optional)' : 'Upload Video File'}</label>
                      <div className="file-upload-area compact">
                        <FiUpload className="upload-icon" />
                        <p>{lectureForm.videoFile ? lectureForm.videoFile.name : 'Select MP4, WebM, MOV, AVI, or MKV file'}</p>
                        {lectureForm.existingVideoName && !lectureForm.videoFile && (
                          <span className="selected-file-note">Current file: {lectureForm.existingVideoName}</span>
                        )}
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          name="videoFile"
                          className="file-input"
                          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                          onChange={handleLectureFileChange}
                          required={lectureForm.videoType === 'file' && !lectureForm.editingId && !lectureForm.existingVideoName}
                        />
                      </div>
                      {lectureForm.existingVideoUrl && !lectureForm.videoFile && (
                        <button
                          type="button"
                          className="resource-link-btn inline"
                          onClick={() => window.open(buildAssetUrl(lectureForm.existingVideoUrl), '_blank', 'noopener,noreferrer')}
                        >
                          Preview Current Video
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Video Link</label>
                      <input
                        type="url"
                        name="videoLink"
                        value={lectureForm.videoLink}
                        onChange={handleLectureChange}
                        placeholder="https://youtube.com/watch?v=..."
                        required={lectureForm.videoType === 'link'}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>{lectureForm.editingId ? 'Replace Supporting Materials (optional)' : 'Supporting Materials'}</label>
                    <div className="file-upload-area compact materials">
                      <FiFileText className="upload-icon" />
                      <p>
                        {lectureForm.materialFiles.length > 0
                          ? `${lectureForm.materialFiles.length} file${lectureForm.materialFiles.length === 1 ? '' : 's'} selected`
                          : 'Upload PDFs, notes, documents, or presentations'}
                      </p>
                      <input
                        ref={materialFileInputRef}
                        type="file"
                        name="materialFiles"
                        className="file-input"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        multiple
                        onChange={handleLectureFileChange}
                      />
                    </div>

                    {lectureForm.existingMaterials.length > 0 && (
                      <div className="existing-materials-block">
                        <div className="existing-materials-header">
                          <span>Current materials</span>
                          <label className="checkbox-label">
                            <input type="checkbox" name="removeMaterials" checked={lectureForm.removeMaterials} onChange={handleLectureChange} /> Remove current materials
                          </label>
                        </div>
                        <div className="materials-chip-list">
                          {lectureForm.existingMaterials.map((material) => (
                            <a
                              key={material.fileName}
                              className="material-chip"
                              href={buildAssetUrl(material.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              download
                            >
                              {material.originalName} ({formatFileSize(material.size)})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={lectureForm.editingId ? resetLectureForm : () => setActiveMenu('dashboard')}
                    >
                      {lectureForm.editingId ? 'Cancel Edit' : 'Cancel'}
                    </button>
                    <button type="submit" className="btn-primary" disabled={lectureSubmitting}>
                      {lectureSubmitting ? (lectureForm.editingId ? 'Saving...' : 'Uploading...') : (lectureForm.editingId ? 'Save Lecture' : 'Upload Lecture')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Schedule Live Class Section */}
          {activeMenu === 'schedule-class' && (
            <TeacherScheduleClassSection
              onBack={() => setActiveMenu('dashboard')}
              scheduledClasses={scheduledClasses}
              handleCancelClass={handleCancelClass}
              scheduleError={scheduleError}
              scheduleSuccess={scheduleSuccess}
              handleScheduleSubmit={handleScheduleSubmit}
              scheduleForm={scheduleForm}
              handleScheduleChange={handleScheduleChange}
              teacherSubjects={teacherSubjects}
              DEFAULT_SUBJECT_OPTIONS={DEFAULT_SUBJECT_OPTIONS}
              classLevelOptions={classLevelOptions}
              scheduleLoading={scheduleLoading}
            />
          )}

          {activeMenu === 'tests' && (
            <TeacherTestsSection
              onBack={() => setActiveMenu('dashboard')}
              testSearch={testSearch}
              setTestSearch={setTestSearch}
              fetchTeacherTests={fetchTeacherTests}
              testsError={testsError}
              testsSuccess={testsSuccess}
              testForm={testForm}
              handleSaveTest={handleSaveTest}
              handleTestFormChange={handleTestFormChange}
              teacherSubjects={teacherSubjects}
              DEFAULT_SUBJECT_OPTIONS={DEFAULT_SUBJECT_OPTIONS}
              classLevelOptions={classLevelOptions}
              formatClassLevelLabel={formatClassLevelLabel}
              handleTestQuestionChange={handleTestQuestionChange}
              optionLabels={optionLabels}
              handleAddQuestionToTest={handleAddQuestionToTest}
              handleCancelQuestionEdit={handleCancelQuestionEdit}
              handleEditTestQuestion={handleEditTestQuestion}
              handleRemoveTestQuestion={handleRemoveTestQuestion}
              resetTestForm={resetTestForm}
              testSubmitting={testSubmitting}
              testsLoading={testsLoading}
              filteredTeacherTests={filteredTeacherTests}
              formatMessageDateTime={formatMessageDateTime}
              teacherStudents={teacherStudents}
              studentsLoading={studentsLoading}
              studentsError={studentsError}
              fetchTeacherStudents={fetchTeacherStudents}
              handleAssignTestToStudent={handleAssignTestToStudent}
              handleEditTest={handleEditTest}
              handleViewTestSubmissions={handleViewTestSubmissions}
              selectedTestSubmissionsId={selectedTestSubmissionsId}
              handleDeleteTest={handleDeleteTest}
              loadingSubmissions={loadingSubmissions}
              selectedTestSubmissions={selectedTestSubmissions}
            />
          )}

          {activeMenu === 'assignments' && (
            <TeacherAssignmentsSection
              onBack={() => setActiveMenu('dashboard')}
              teacherAssignments={teacherAssignments}
              handleDeleteAssignment={handleDeleteAssignment}
              assignmentError={assignmentError}
              assignmentSuccess={assignmentSuccess}
              handleAssignmentSubmit={handleAssignmentSubmit}
              assignmentForm={assignmentForm}
              handleAssignmentChange={handleAssignmentChange}
              teacherSubjects={teacherSubjects}
              DEFAULT_SUBJECT_OPTIONS={DEFAULT_SUBJECT_OPTIONS}
              classLevelOptions={classLevelOptions}
              assignmentLoading={assignmentLoading}
            />
          )}

          {activeMenu === 'students' && (
            <TeacherStudentsSection
              onBack={() => setActiveMenu('dashboard')}
              studentSearch={studentSearch}
              setStudentSearch={setStudentSearch}
              studentSubjectFilter={studentSubjectFilter}
              setStudentSubjectFilter={setStudentSubjectFilter}
              studentSubjectOptions={studentSubjectOptions}
              fetchTeacherStudents={fetchTeacherStudents}
              studentsLastUpdated={studentsLastUpdated}
              studentsError={studentsError}
              studentsLoading={studentsLoading}
              filteredStudents={filteredStudents}
            />
          )}

          {activeMenu === 'doubts' && (
            <TeacherDoubtsSection
              onBack={() => setActiveMenu('dashboard')}
              messagesError={messagesError}
              messageSearch={messageSearch}
              setMessageSearch={setMessageSearch}
              messageThreadsLoading={messageThreadsLoading}
              filteredMessageThreads={filteredMessageThreads}
              selectedMessageThread={selectedMessageThread}
              setSelectedMessageThread={setSelectedMessageThread}
              formatMessageDateTime={formatMessageDateTime}
              formatClassLevelLabel={formatClassLevelLabel}
              buildAssetUrl={buildAssetUrl}
              solutionInput={solutionInput}
              setSolutionInput={setSolutionInput}
              handleSendTeacherMessage={handleSendTeacherMessage}
              messageSending={messageSending}
            />
          )}

          {/* Tests Section */}
          {activeMenu === '__legacy_tests' && (
            <div className="page-section">
              <div className="section-header">
                <h2 className="page-title">Test</h2>
                <button className="back-btn" onClick={() => setActiveMenu('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="students-filters">
                <div className="search-filter">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search by title, subject, class level"
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                  />
                </div>
                <button className="view-btn" onClick={() => fetchTeacherTests({ withLoading: true })}>Refresh</button>
              </div>

              {testsError && <div className="error-message">{testsError}</div>}
              {testsSuccess && <div className="success-message">{testsSuccess}</div>}

              <div className="form-card">
                <h3 className="form-subtitle">{testForm.editingId ? 'Edit Test' : 'Create New Test'}</h3>
                <form onSubmit={handleSaveTest}>
                  <div className="form-group">
                    <label>Subject</label>
                    <select
                      name="subject"
                      value={testForm.subject}
                      onChange={handleTestFormChange}
                      required
                    >
                      <option value="">Choose a subject</option>
                      {teacherSubjects.length > 0
                        ? teacherSubjects.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))
                        : DEFAULT_SUBJECT_OPTIONS.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Class Level</label>
                    <select
                      name="classLevel"
                      value={testForm.classLevel}
                      onChange={handleTestFormChange}
                      required
                    >
                      <option value="">Choose class level</option>
                      {classLevelOptions.map((level) => (
                        <option key={level} value={level}>{formatClassLevelLabel(level)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Test Title</label>
                    <input
                      type="text"
                      name="title"
                      value={testForm.title}
                      onChange={handleTestFormChange}
                      placeholder="Enter test title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Test Description / Instructions</label>
                    <textarea
                      rows="4"
                      name="description"
                      value={testForm.description}
                      onChange={handleTestFormChange}
                      placeholder="Add test instructions"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Duration (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      name="durationMinutes"
                      value={testForm.durationMinutes}
                      onChange={handleTestFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Question Text</label>
                    <textarea
                      rows="3"
                      name="questionText"
                      value={testForm.currentQuestion.questionText}
                      onChange={handleTestQuestionChange}
                      placeholder="Enter the full question"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Option A</label>
                      <input type="text" name="optionA" value={testForm.currentQuestion.optionA} onChange={handleTestQuestionChange} placeholder="Option A" />
                    </div>
                    <div className="form-group">
                      <label>Option B</label>
                      <input type="text" name="optionB" value={testForm.currentQuestion.optionB} onChange={handleTestQuestionChange} placeholder="Option B" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Option C</label>
                      <input type="text" name="optionC" value={testForm.currentQuestion.optionC} onChange={handleTestQuestionChange} placeholder="Option C" />
                    </div>
                    <div className="form-group">
                      <label>Option D</label>
                      <input type="text" name="optionD" value={testForm.currentQuestion.optionD} onChange={handleTestQuestionChange} placeholder="Option D" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Solution / Explanation</label>
                    <textarea
                      rows="4"
                      name="solution"
                      value={testForm.currentQuestion.solution}
                      onChange={handleTestQuestionChange}
                      placeholder="Write the full explanation for this question. Example: Answer: B because ..."
                    ></textarea>
                  </div>

                  <div className="form-actions" style={{ marginTop: '-4px', marginBottom: '20px' }}>
                    <button type="button" className="btn-secondary" onClick={handleAddQuestionToTest}>
                      {testForm.editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}
                    </button>
                    {testForm.editingQuestionIndex >= 0 && (
                      <button type="button" className="btn-secondary" onClick={handleCancelQuestionEdit}>Cancel Edit</button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Questions Added</label>
                    {testForm.questions.length > 0 ? (
                      <div className="test-question-builder">
                        {testForm.questions.map((question, index) => (
                          <div key={`${question.questionText}-${index}`} className="test-question-item">
                            <div>
                              <strong>Q{index + 1}.</strong> {question.questionText}
                              <div className="test-question-options">
                                {optionLabels.map((label) => (
                                  <span key={`${label}-${index}`} className="test-option-chip">
                                    {label}: {question[`option${label}`]}
                                  </span>
                                ))}
                              </div>
                              <div className="test-question-solution-block">
                                <span className="test-question-solution-label">Solution</span>
                                <p className="test-question-solution-text">{question.solution}</p>
                              </div>
                            </div>
                            <div className="assignment-actions">
                              <button type="button" className="btn-small" onClick={() => handleEditTestQuestion(index)}>
                                <FiEdit /> Edit
                              </button>
                              <button type="button" className="btn-small btn-danger" onClick={() => handleRemoveTestQuestion(index)}>
                                <FiTrash2 /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="info-message">No questions added yet.</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={testForm.status} onChange={handleTestFormChange}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={resetTestForm}>Reset</button>
                    <button type="submit" className="btn-primary" disabled={testSubmitting}>
                      {testSubmitting ? 'Saving...' : testForm.editingId ? 'Update Test' : 'Create Test'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="existing-assignments">
                <h3 className="section-subtitle">All Created Tests</h3>
                {testsLoading ? (
                  <div className="info-message">Loading tests...</div>
                ) : filteredTeacherTests.length > 0 ? (
                  <div className="assignments-list">
                    {filteredTeacherTests.map((test) => (
                      <div key={test._id} className="assignment-card">
                        <div className="assignment-header">
                          <h4>{test.title}</h4>
                          <span className="class-level-tag">{formatClassLevelLabel(test.classLevel)}</span>
                        </div>
                        <p className="assignment-subject">{test.subject} • {test.status === 'draft' ? 'Draft' : 'Published'}</p>
                        <div className={`test-visibility-badge ${test.isVisible ? 'visible' : 'hidden'}`}>
                          {test.isVisible ? 'Visible to Students' : 'Hidden from Students'}
                        </div>
                        <p className="assignment-due">Created: {formatMessageDateTime(test.createdAt || test.testDateTime)}</p>
                        <p>{test.description || 'No instructions provided.'}</p>
                        <div className="assignment-stats">
                          <span>Questions: {test.questions?.length || 0}</span>
                          <span>Submissions: {test.submissionCount || 0}</span>
                        </div>

                        {Array.isArray(test.questions) && test.questions.length > 0 && (
                          <div className="teacher-test-preview">
                            <h5>Student View Preview</h5>
                            {test.questions.slice(0, 2).map((question, index) => (
                              <div key={`${test._id}-preview-${index}`} className="teacher-preview-question">
                                <p><strong>Q{index + 1}.</strong> {question.questionText}</p>
                                <div className="teacher-preview-options-row">
                                  {optionLabels.map((label, optionIndex) => (
                                    <span key={`${test._id}-preview-${index}-${label}`} className="teacher-preview-option-chip">
                                      {label}. {question.options?.[optionIndex] || ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {test.questions.length > 2 && (
                              <p className="teacher-preview-more">+{test.questions.length - 2} more question(s)</p>
                            )}
                          </div>
                        )}

                        <div className="assignment-actions">
                          <button
                            className={`btn-small ${test.isVisible ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleTestVisibility(test._id, Boolean(test.isVisible))}
                          >
                            {test.isVisible ? <FiEyeOff /> : <FiEye />}
                            {test.isVisible ? 'Hide Test' : 'Show Test'}
                          </button>
                          <button className="btn-small" onClick={() => handleEditTest(test)}>
                            <FiEdit /> Edit
                          </button>
                          <button className="btn-small" onClick={() => handleViewTestSubmissions(test._id)}>
                            {selectedTestSubmissionsId === test._id ? 'Hide Submissions' : 'View Submissions'}
                          </button>
                          <button className="btn-small btn-danger" onClick={() => handleDeleteTest(test._id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>

                        {selectedTestSubmissionsId === test._id && (
                          <div className="students-table-container" style={{ marginTop: '12px' }}>
                            {loadingSubmissions ? (
                              <div className="info-message">Loading submissions...</div>
                            ) : selectedTestSubmissions.length > 0 ? (
                              <table className="students-table">
                                <thead>
                                  <tr>
                                    <th>Student</th>
                                    <th>Submitted At</th>
                                    <th>Result</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedTestSubmissions.map((submission) => (
                                    <tr key={submission._id}>
                                      <td>{submission.student?.name || 'Student'}</td>
                                      <td>{formatMessageDateTime(submission.submittedAt)}</td>
                                      <td>
                                        {submission.correctAnswers || 0}/{submission.totalQuestions || submission.test?.questions?.length || 0} correct
                                        <div style={{ marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                                          Incorrect: {submission.incorrectAnswers || 0}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="info-message">No submissions for this test yet.</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="info-message">No tests created yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Assignments Section */}
          {activeMenu === '__legacy_assignments' && (
            <div className="page-section">
              <div className="section-header">
                <h2 className="page-title">Assignments</h2>
                <button className="back-btn" onClick={() => setActiveMenu('dashboard')}>← Back to Dashboard</button>
              </div>

              {/* Existing Assignments List */}
              {teacherAssignments.length > 0 && (
                <div className="existing-assignments">
                  <h3 className="section-subtitle">Your Assignments</h3>
                  <div className="assignments-list">
                    {teacherAssignments.map(assignment => (
                      <div key={assignment._id} className="assignment-card">
                        <div className="assignment-header">
                          <h4>{assignment.title}</h4>
                          <span className="class-level-tag">
                            {assignment.classLevel === 'Graduation' || assignment.classLevel === 'Post Graduation'
                              ? assignment.classLevel
                              : `Class ${assignment.classLevel}`}
                          </span>
                        </div>
                        <p className="assignment-subject">{assignment.subject}</p>
                        <p className="assignment-due">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <div className="assignment-stats">
                          <span>Submissions: {assignment.submissions?.filter(s => s.status !== 'pending').length || 0}</span>
                          <span>Total Marks: {assignment.totalMarks}</span>
                        </div>
                        <div className="assignment-actions">
                          <button className="btn-small btn-danger" onClick={() => handleDeleteAssignment(assignment._id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-card">
                <h3 className="form-subtitle">Create New Assignment</h3>
                {assignmentError && <div className="error-message">{assignmentError}</div>}
                {assignmentSuccess && <div className="success-message">{assignmentSuccess}</div>}

                <form onSubmit={handleAssignmentSubmit}>
                  <div className="form-group">
                    <label>Select Subject</label>
                    <select
                      name="subject"
                      value={assignmentForm.subject}
                      onChange={handleAssignmentChange}
                      required
                    >
                      <option value="">Choose a subject</option>
                      {teacherSubjects.length > 0 ? (
                        teacherSubjects.map((subj, idx) => (
                          <option key={idx} value={subj}>{subj}</option>
                        ))
                      ) : (
                        <>
                          {DEFAULT_SUBJECT_OPTIONS.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Class Level</label>
                    <select
                      name="classLevel"
                      value={assignmentForm.classLevel}
                      onChange={handleAssignmentChange}
                      required
                    >
                      <option value="">Choose class level</option>
                      {classLevelOptions.map((level, idx) => (
                        <option key={idx} value={level}>
                          {level === 'Graduation' || level === 'Post Graduation' ? level : `Class ${level}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assignment Title</label>
                    <input
                      type="text"
                      name="title"
                      value={assignmentForm.title}
                      onChange={handleAssignmentChange}
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows="2"
                      name="description"
                      value={assignmentForm.description}
                      onChange={handleAssignmentChange}
                      placeholder="Brief description of the assignment"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Instructions</label>
                    <textarea
                      rows="4"
                      name="instructions"
                      value={assignmentForm.instructions}
                      onChange={handleAssignmentChange}
                      placeholder="Provide detailed instructions for the assignment"
                    ></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={assignmentForm.dueDate}
                        onChange={handleAssignmentChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Marks</label>
                      <input
                        type="number"
                        name="totalMarks"
                        value={assignmentForm.totalMarks}
                        onChange={handleAssignmentChange}
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setActiveMenu('dashboard')}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={assignmentLoading}>
                      {assignmentLoading ? 'Creating...' : 'Create Assignment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Students Section */}
          {activeMenu === '__legacy_students' && (
            <div className="page-section">
              <div className="section-header">
                <h2 className="page-title">Student List</h2>
                <button className="back-btn" onClick={() => setActiveMenu('dashboard')}>← Back to Dashboard</button>
              </div>
              <div className="students-filters">
                <div className="search-filter">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search by name, email, class, subject..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                <select
                  className="course-filter"
                  value={studentSubjectFilter}
                  onChange={(e) => setStudentSubjectFilter(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {studentSubjectOptions.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <button className="view-btn" onClick={() => fetchTeacherStudents({ withLoading: true })}>Refresh</button>
              </div>

              {studentsLastUpdated && (
                <p className="students-last-updated">Updated: {studentsLastUpdated.toLocaleTimeString()}</p>
              )}

              {studentsError && <div className="error-message">{studentsError}</div>}

              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Class Level</th>
                      <th>Subject</th>
                      <th>Joining Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsLoading ? (
                      <tr>
                        <td colSpan="5" className="students-empty-row">Loading students...</td>
                      </tr>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="student-cell">
                            <div className="student-avatar">{student.name?.charAt(0) || 'S'}</div>
                            <span>{student.name}</span>
                          </td>
                          <td>{student.email}</td>
                          <td>
                            {student.classLevel === 'Graduation' || student.classLevel === 'Post Graduation'
                              ? student.classLevel
                              : `Class ${student.classLevel}`}
                          </td>
                          <td>{student.subject}</td>
                          <td>{new Date(student.enrolledAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="students-empty-row">
                          No active paid students assigned to you yet for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeMenu === 'analytics' && (
            <div className="page-section">
              <div className="section-header">
                <h2 className="page-title">Analytics</h2>
                <button className="back-btn" onClick={() => setActiveMenu('dashboard')}>← Back to Dashboard</button>
              </div>
              {analyticsError && <div className="info-message">{analyticsError}</div>}
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Student Performance</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={studentPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgScore" stroke="#2563EB" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Course Enrollment</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={courseEnrollmentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip />
                        <Bar dataKey="students" fill="#F97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Assignment Completion</h3>
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={assignmentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                          {assignmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                      {assignmentStatusData.map((item, index) => (
                        <div key={index} className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                          <span>{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doubts Section */}
          {activeMenu === '__legacy_doubts' && (
            <div className="page-section">
              <div className="section-header">
                <h2 className="page-title">Doubts</h2>
                <button className="back-btn" onClick={() => setActiveMenu('dashboard')}>← Back to Dashboard</button>
              </div>
              {messagesError && <div className="error-message">{messagesError}</div>}
              <div className="messages-container">
                <div className="messages-sidebar">
                  <div className="messages-search">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Search by student, subject, title, status"
                      value={messageSearch}
                      onChange={(e) => setMessageSearch(e.target.value)}
                    />
                  </div>
                  <div className="message-list">
                    {messageThreadsLoading ? (
                      <div className="message-item">
                        <div className="message-preview">
                          <h4>Loading doubts...</h4>
                        </div>
                      </div>
                    ) : filteredMessageThreads.length > 0 ? filteredMessageThreads.map((thread) => (
                      <div
                        key={thread._id}
                        className={`message-item ${selectedMessageThread?._id === thread._id ? 'active' : ''}`}
                        onClick={() => setSelectedMessageThread(thread)}
                      >
                        <div className="message-avatar">{thread.student?.name?.charAt(0) || 'S'}</div>
                        <div className="message-preview">
                          <h4>{thread.title}</h4>
                          <p>{thread.subject} • {thread.status === 'solved' ? 'Solved' : 'Pending'}</p>
                          <span className="message-time">{formatMessageDateTime(thread.updatedAt)}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="message-item">
                        <div className="message-preview">
                          <h4>No doubts found</h4>
                          <p>Doubts from assigned and paid students will appear here.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="message-detail">
                  {selectedMessageThread ? (
                    <>
                      <div className="message-detail-header">
                        <div className="message-avatar">{selectedMessageThread.student?.name?.charAt(0) || 'S'}</div>
                        <div>
                          <h3>{selectedMessageThread.title}</h3>
                          <span>{selectedMessageThread.subject} • {formatClassLevelLabel(selectedMessageThread.classLevel)} • {selectedMessageThread.status === 'solved' ? 'Solved' : 'Pending'}</span>
                        </div>
                      </div>
                      <div className="message-detail-body">
                        <div className="message-bubble received">
                          <p><strong>Student:</strong> {selectedMessageThread.student?.name || 'Student'}</p>
                          <p><strong>Description:</strong> {selectedMessageThread.description}</p>
                          {selectedMessageThread.attachment?.fileUrl && (
                            <p>
                              <a
                                href={buildAssetUrl(selectedMessageThread.attachment.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Attachment ({selectedMessageThread.attachment.originalName})
                              </a>
                            </p>
                          )}
                          <span>Submitted on {formatMessageDateTime(selectedMessageThread.createdAt)}</span>
                        </div>
                        <div className={`message-bubble ${selectedMessageThread.status === 'solved' ? 'sent' : 'received'}`}>
                          <p><strong>Solution:</strong></p>
                          <p>{selectedMessageThread.solution?.trim() ? selectedMessageThread.solution : 'No solution submitted yet.'}</p>
                          {selectedMessageThread.solvedAt && <span>Solved on {formatMessageDateTime(selectedMessageThread.solvedAt)}</span>}
                        </div>
                      </div>
                      {selectedMessageThread.status !== 'solved' && (
                        <div className="message-input-area">
                          <textarea
                            rows="4"
                            placeholder="Write your solution for this doubt..."
                            value={solutionInput}
                            onChange={(e) => setSolutionInput(e.target.value)}
                          ></textarea>
                          <button className="send-btn" onClick={handleSendTeacherMessage} disabled={messageSending || !solutionInput.trim()}>
                            {messageSending ? 'Submitting...' : 'Mark as Solved'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="message-detail-body">
                      <div className="message-bubble received">
                        <p>Select a doubt from the left panel to view details and resolve it.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeMenu === 'profile' && (
            <TeacherProfileSection onSaveComplete={() => setActiveMenu('dashboard')} />
          )}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default TeacherDashboard;
