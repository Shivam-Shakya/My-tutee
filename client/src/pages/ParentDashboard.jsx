import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiBook,
  FiVideo,
  FiFileText,
  FiPlay,
  FiFolder,
  FiTrendingUp,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiMessageSquare,
  FiDownload,
  FiEye,
  FiLogOut,
  FiMail
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import './ParentDashboard.css';

import { BASE_URL, ORIGIN_URL } from "../config";

const API_PARENT = `${BASE_URL}/parents`;
const API_ORIGIN = ORIGIN_URL;
const DASHBOARD_LOAD_ERROR = 'Unable to load dashboard. Please try again.';

const defaultProgressData = [
  { week: 'Week 1', progress: 20 },
  { week: 'Week 2', progress: 32 },
  { week: 'Week 3', progress: 44 },
  { week: 'Week 4', progress: 56 },
  { week: 'Week 5', progress: 68 },
  { week: 'Week 6', progress: 78 }
];

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

const buildAssetUrl = (fileUrl) => {
  if (!fileUrl) return '';
  return fileUrl.startsWith('http') ? fileUrl : `${API_ORIGIN}${fileUrl}`;
};

const getSubjectIcon = (subject) => {
  const normalized = String(subject || '').trim().toLowerCase();
  if (normalized.includes('math')) return '📐';
  if (normalized.includes('phy')) return '⚛️';
  if (normalized.includes('chem')) return '🧪';
  if (normalized.includes('bio')) return '🧬';
  if (normalized.includes('eng')) return '📚';
  if (normalized.includes('comp')) return '💻';
  return '📘';
};

const readOnlyButtonStyle = {
  cursor: 'not-allowed',
  opacity: 0.65
};

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [expandedTestId, setExpandedTestId] = useState('');

  const [studentData, setStudentData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    selectedSubjects: [],
    paidSubjects: [],
    assignedTeachers: [],
    upcomingClasses: [],
    pendingAssignments: [],
    recordedLectures: [],
    tests: [],
    doubts: [],
    notifications: [],
    testSubmissions: [],
    learningProgress: {},
    studentClassLevel: ''
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'courses', label: 'My Courses', icon: FiBook },
    { id: 'all-courses', label: 'All Courses', icon: FiFolder },
    { id: 'live-classes', label: 'Live Classes', icon: FiVideo },
    { id: 'assignments', label: 'Assignments', icon: FiFileText },
    { id: 'tests', label: 'Tests', icon: FiFileText },
    { id: 'recorded', label: 'Recorded Lectures', icon: FiPlay },
    { id: 'materials', label: 'Study Materials', icon: FiFolder },
    { id: 'progress', label: 'Progress', icon: FiTrendingUp },
    { id: 'doubts', label: 'Doubts', icon: FiMessageSquare },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  const normalizeSubject = (value) => {
    const normalized = String(value || '').trim();
    return normalized || 'No Subject Available';
  };

  const uniqueSubjects = (items) => [...new Set((items || []).map(normalizeSubject))];

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const linkedStudentEmail = (user?.studentEmail || storedUser?.studentEmail || '').trim();

  const loadLinkedStudentData = async ({ silent = false } = {}) => {
    if (!user || user.role !== 'parent') {
      setLoadError('Only parent accounts can access this dashboard.');
      setLoading(false);
      return;
    }

    if (!linkedStudentEmail) {
      setLoadError(DASHBOARD_LOAD_ERROR);
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `${API_PARENT}/student-data-by-email/${encodeURIComponent(linkedStudentEmail)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || DASHBOARD_LOAD_ERROR);
      }

      const courses = uniqueSubjects(data.courses || []);
      const scheduledClassesRaw = Array.isArray(data.scheduledClasses) ? data.scheduledClasses : [];
      const assignmentsRaw = Array.isArray(data.assignments) ? data.assignments : [];
      const testsRaw = Array.isArray(data.tests) ? data.tests : [];
      const doubtsRaw = Array.isArray(data.doubts) ? data.doubts : [];
      const lecturesRaw = Array.isArray(data.lectures) ? data.lectures : [];
      const submissionsRaw = Array.isArray(data.testSubmissions) ? data.testSubmissions : [];

      const submissionsByTestId = new Map(
        submissionsRaw
          .filter((submission) => submission?.test?._id)
          .map((submission) => [submission.test._id.toString(), submission])
      );

      const upcomingClasses = scheduledClassesRaw.map((cls) => ({
        id: cls._id,
        title: cls.title || `${normalizeSubject(cls.subject)} Live Class`,
        subject: normalizeSubject(cls.subject),
        teacher: cls.teacher?.name || 'Teacher',
        date: formatDate(cls.date),
        time: cls.time || 'TBD',
        duration: cls.duration || 60,
        meetingLink: cls.meetingLink || '',
        description: cls.description || '',
        status: cls.status || 'scheduled'
      }));

      const pendingAssignments = assignmentsRaw.map((assignment) => {
        const status = assignment.status === 'completed' ? 'submitted' : 'pending';
        return {
          id: assignment._id,
          title: assignment.title || `${normalizeSubject(assignment.subject)} Assignment`,
          subject: normalizeSubject(assignment.subject),
          classLevel: assignment.classLevel || data.student?.classLevel || '',
          teacher: assignment.teacher?.name || 'Teacher',
          dueDate: assignment.updatedAt || assignment.createdAt,
          status,
          progress: Number(assignment.progress || 0),
          description: assignment.description || ''
        };
      });

      const tests = testsRaw.map((test) => {
        const submission = submissionsByTestId.get(test._id?.toString()) || null;
        return {
          id: test._id,
          title: test.title || test.name || 'Test',
          subject: normalizeSubject(test.subject),
          classLevel: test.classLevel || data.student?.classLevel || '',
          teacher: test.teacher?.name || 'Teacher',
          createdAt: test.createdAt || test.updatedAt,
          durationMinutes: Number(test.durationMinutes || 60),
          totalQuestions: Array.isArray(test.questions) ? test.questions.length : 0,
          submission
        };
      });

      const doubts = doubtsRaw.map((doubt) => ({
        id: doubt._id,
        title: doubt.title || 'Doubt',
        description: doubt.description || '',
        subject: normalizeSubject(doubt.subject),
        status: doubt.status === 'solved' ? 'solved' : 'pending',
        teacher: doubt.teacher?.name || 'Teacher',
        createdAt: doubt.createdAt,
        solvedAt: doubt.solvedAt,
        solution: doubt.solution || '',
        attachment: doubt.attachment || null
      }));

      const recordedLectures = lecturesRaw.map((lecture) => ({
        id: lecture._id,
        title: lecture.title || 'Lecture',
        subject: normalizeSubject(lecture.subject),
        classLevel: lecture.classLevel || data.student?.classLevel || '',
        description: lecture.description || '',
        teacher: lecture.teacher?.name || 'Teacher',
        videoType: lecture.videoType || 'link',
        videoLink: lecture.videoLink || '',
        videoUrl: buildAssetUrl(lecture.videoFile?.fileUrl),
        thumbnail: getSubjectIcon(lecture.subject),
        createdAt: formatDate(lecture.createdAt),
        materials: (lecture.materials || []).map((material) => ({
          id: `${lecture._id}-${material.fileName}`,
          fileName: material.originalName || material.fileName,
          fileUrl: buildAssetUrl(material.fileUrl),
          size: Number(material.size || 0),
          mimeType: material.mimeType || ''
        }))
      }));

      const teacherMap = new Map();
      [...upcomingClasses, ...pendingAssignments, ...recordedLectures].forEach((item) => {
        const key = `${item.teacher}-${item.subject}`;
        if (!teacherMap.has(key)) {
          teacherMap.set(key, {
            _id: key,
            name: item.teacher,
            assignedSubject: item.subject,
            assignedTimetable: [],
            progress: 0
          });
        }
      });

      upcomingClasses.forEach((cls) => {
        const key = `${cls.teacher}-${cls.subject}`;
        const existing = teacherMap.get(key);
        if (existing) {
          existing.assignedTimetable.push({ day: cls.date, time: cls.time, duration: cls.duration });
        }
      });

      const learningProgress = {};
      pendingAssignments.forEach((assignment) => {
        const subject = assignment.subject;
        const existing = learningProgress[subject] || { total: 0, count: 0 };
        existing.total += Number(assignment.progress || 0);
        existing.count += 1;
        learningProgress[subject] = existing;
      });

      Object.keys(learningProgress).forEach((subject) => {
        const subjectData = learningProgress[subject];
        learningProgress[subject] = subjectData.count > 0
          ? Math.round(subjectData.total / subjectData.count)
          : 0;
      });

      const notifications = [
        ...upcomingClasses.slice(0, 3).map((cls, index) => ({
          id: `class-${index}`,
          type: 'class',
          message: `${cls.subject} live class scheduled with ${cls.teacher}`,
          time: `${cls.date} ${cls.time}`,
          unread: index === 0
        })),
        ...pendingAssignments.slice(0, 3).map((assignment, index) => ({
          id: `assignment-${index}`,
          type: 'assignment',
          message: `${assignment.title} is ${assignment.status}`,
          time: formatDate(assignment.dueDate),
          unread: assignment.status === 'pending'
        })),
        ...doubts.slice(0, 2).map((doubt, index) => ({
          id: `doubt-${index}`,
          type: 'message',
          message: `Doubt: ${doubt.title} (${doubt.status})`,
          time: formatDate(doubt.createdAt),
          unread: doubt.status === 'pending'
        }))
      ].slice(0, 10);

      setStudentData(data.student || null);
      setDashboardData({
        selectedSubjects: courses,
        paidSubjects: courses,
        assignedTeachers: Array.from(teacherMap.values()),
        upcomingClasses,
        pendingAssignments,
        recordedLectures,
        tests,
        doubts,
        notifications,
        testSubmissions: submissionsRaw,
        learningProgress,
        studentClassLevel: data.student?.classLevel || ''
      });

      setLastUpdated(new Date().toLocaleTimeString());
      setLoadError('');
    } catch (error) {
      console.error('Parent dashboard load error:', error);
      setLoadError(DASHBOARD_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    loadLinkedStudentData();
    const intervalId = setInterval(() => {
      loadLinkedStudentData({ silent: true });
    }, 20000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.studentEmail]);

  const avgProgress = useMemo(() => {
    const values = Object.values(dashboardData.learningProgress || {});
    if (!values.length) return 0;
    const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
    return Math.round(total / values.length);
  }, [dashboardData.learningProgress]);

  const progressData = useMemo(() => {
    if (!avgProgress) return defaultProgressData;
    return defaultProgressData.map((row, index) => ({
      ...row,
      progress: Math.min(100, Math.max(10, avgProgress - 20 + (index * 6)))
    }));
  }, [avgProgress]);

  const studyMaterials = useMemo(() => {
    return dashboardData.recordedLectures.flatMap((lecture) =>
      (lecture.materials || []).map((material) => ({
        ...material,
        lectureTitle: lecture.title,
        subject: lecture.subject,
        teacher: lecture.teacher
      }))
    );
  }, [dashboardData.recordedLectures]);

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setSidebarOpen(false);
  };

  const openSection = (sectionId) => {
    setExpandedTestId('');
    handleMenuClick(sectionId);
  };

  if (loading) {
    return (
      <div className="student-dashboard-modern parent-dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading linked student dashboard...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="student-dashboard-modern parent-dashboard-page">
        <main className="main-content">
          <div className="dashboard-content">
            <div className="class-level-warning">
              <FiAlertCircle className="warning-icon" />
              <div className="warning-content">
                <h4>Dashboard Error</h4>
                <p>{DASHBOARD_LOAD_ERROR}</p>
              </div>
              <button className="warning-btn" onClick={() => loadLinkedStudentData()}>Retry</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="student-dashboard-modern parent-dashboard-page">

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.id === 'notifications' && dashboardData.notifications.filter((n) => n.unread).length > 0 && (
                <span className="nav-badge">{dashboardData.notifications.filter((n) => n.unread).length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="parent-topbar dashboard-topbar">
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
            <span className="dashboard-user-name">{user?.name || 'Parent'}</span>
            <button type="button" className="topbar-logout-btn" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="class-level-warning" style={{ marginBottom: '16px' }}>
            <FiEye className="warning-icon" />
            <div className="warning-content">
              <h4>Viewing Student Dashboard</h4>
              <p>
                <strong>{studentData?.name || user?.studentName || 'Student'}</strong>
                {' '}<FiMail style={{ marginLeft: 8, verticalAlign: 'middle' }} />
                {' '}{studentData?.email || linkedStudentEmail || 'N/A'}
              </p>
              <p style={{ marginTop: 4 }}>Read-only mode. Last updated: {lastUpdated || 'just now'}</p>
            </div>
          </div>

          {activeMenu === 'dashboard' && (
            <>
              <div className="welcome-card">
                <div className="welcome-content">
                  <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
                  <p>You are monitoring {studentData?.name || 'your student'}'s complete learning dashboard.</p>
                  {dashboardData.studentClassLevel && (
                    <span className="class-level-badge">
                      {dashboardData.studentClassLevel === 'Graduation' || dashboardData.studentClassLevel === 'Post Graduation'
                        ? dashboardData.studentClassLevel
                        : `Class ${dashboardData.studentClassLevel}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card stat-blue" onClick={() => openSection('courses')} role="button" tabIndex={0}>
                  <div className="stat-icon"><FiBook /></div>
                  <div className="stat-info">
                    <span className="stat-value">{dashboardData.selectedSubjects.length}</span>
                    <span className="stat-label">Enrolled Courses</span>
                  </div>
                </div>
                <div className="stat-card stat-orange" onClick={() => openSection('live-classes')} role="button" tabIndex={0}>
                  <div className="stat-icon"><FiVideo /></div>
                  <div className="stat-info">
                    <span className="stat-value">{dashboardData.upcomingClasses.length}</span>
                    <span className="stat-label">Live Classes</span>
                  </div>
                </div>
                <div className="stat-card stat-green" onClick={() => openSection('progress')} role="button" tabIndex={0}>
                  <div className="stat-icon"><FiCheckCircle /></div>
                  <div className="stat-info">
                    <span className="stat-value">{avgProgress}%</span>
                    <span className="stat-label">Avg Progress</span>
                  </div>
                </div>
                <div className="stat-card stat-purple" onClick={() => openSection('assignments')} role="button" tabIndex={0}>
                  <div className="stat-icon"><FiFileText /></div>
                  <div className="stat-info">
                    <span className="stat-value">{dashboardData.pendingAssignments.filter((a) => a.status === 'pending').length}</span>
                    <span className="stat-label">Pending Tasks</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="card continue-learning">
                  <div className="card-header">
                    <h3><FiPlay className="header-icon" /> Continue Learning</h3>
                    <button className="view-all-btn" onClick={() => openSection('courses')}>View All</button>
                  </div>
                  <div className="courses-list">
                    {dashboardData.selectedSubjects.length > 0 ? (
                      dashboardData.selectedSubjects.slice(0, 3).map((subject) => (
                        <div key={subject} className="course-item" onClick={() => openSection('courses')} role="button" tabIndex={0}>
                          <div className="course-icon">{getSubjectIcon(subject)}</div>
                          <div className="course-info">
                            <h4>{subject}</h4>
                            <p>{dashboardData.studentClassLevel ? `Class ${dashboardData.studentClassLevel}` : 'Course'}</p>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${dashboardData.learningProgress[subject] || 0}%` }}></div>
                            </div>
                          </div>
                          <button className="continue-btn" style={readOnlyButtonStyle} disabled>
                            Read Only
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-courses-message">
                        <p>No courses linked yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card upcoming-classes">
                  <div className="card-header">
                    <h3><FiVideo className="header-icon" /> Upcoming Live Classes</h3>
                    <button className="view-all-btn" onClick={() => openSection('live-classes')}>View All</button>
                  </div>
                  <div className="classes-list">
                    {dashboardData.upcomingClasses.length > 0 ? (
                      dashboardData.upcomingClasses.slice(0, 3).map((cls) => (
                        <div key={cls.id} className="class-item" onClick={() => openSection('live-classes')} role="button" tabIndex={0}>
                          <div className="class-time">
                            <span className="day">{cls.date}</span>
                            <span className="time">{cls.time}</span>
                          </div>
                          <div className="class-info">
                            <h4>{cls.title}</h4>
                            <p>{cls.subject} with {cls.teacher}</p>
                          </div>
                          <button className="join-btn" style={readOnlyButtonStyle} disabled>
                            View Only
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <FiCalendar className="empty-icon" />
                        <p>No upcoming classes</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card pending-assignments">
                  <div className="card-header">
                    <h3><FiFileText className="header-icon" /> Pending Assignments</h3>
                    <button className="view-all-btn" onClick={() => openSection('assignments')}>View All</button>
                  </div>
                  <div className="assignments-list">
                    {dashboardData.pendingAssignments.filter((a) => a.status === 'pending').slice(0, 4).map((assignment) => (
                      <div key={assignment.id} className="assignment-item" onClick={() => openSection('assignments')} role="button" tabIndex={0}>
                        <div className="assignment-status"><FiAlertCircle className="pending-icon" /></div>
                        <div className="assignment-info">
                          <h4>{assignment.title}</h4>
                          <p>{assignment.subject}</p>
                        </div>
                        <div className="assignment-due">
                          <FiClock />
                          <span>Updated: {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                    {dashboardData.pendingAssignments.filter((a) => a.status === 'pending').length === 0 && (
                      <div className="empty-state compact">
                        <p>No pending assignments</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card progress-chart">
                  <div className="card-header">
                    <h3><FiTrendingUp className="header-icon" /> Learning Progress</h3>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={progressData}>
                        <defs>
                          <linearGradient id="parentProgressGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="progress" stroke="#2563EB" strokeWidth={2} fill="url(#parentProgressGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card recorded-lectures">
                  <div className="card-header">
                    <h3><FiPlay className="header-icon" /> Recorded Lectures</h3>
                    <button className="view-all-btn" onClick={() => openSection('recorded')}>View All</button>
                  </div>
                  <div className="lectures-grid">
                    {dashboardData.recordedLectures.length > 0 ? dashboardData.recordedLectures.slice(0, 3).map((lecture) => (
                      <div key={lecture.id} className="lecture-card" onClick={() => openSection('recorded')} role="button" tabIndex={0}>
                        <div className="lecture-thumbnail">{lecture.thumbnail}</div>
                        <div className="lecture-info">
                          <h4>{lecture.title}</h4>
                          <p>{lecture.subject} • {lecture.teacher}</p>
                        </div>
                        <button className="play-btn" style={readOnlyButtonStyle} disabled><FiPlay /></button>
                      </div>
                    )) : (
                      <div className="empty-state compact">
                        <FiPlay className="empty-icon" />
                        <p>No recorded lectures yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card notifications-panel">
                  <div className="card-header">
                    <h3><FiBell className="header-icon" /> Notifications</h3>
                    <button className="view-all-btn" onClick={() => openSection('notifications')}>View All</button>
                  </div>
                  <div className="notifications-list">
                    {dashboardData.notifications.slice(0, 4).map((notif) => (
                      <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                        <div className={`notif-icon ${notif.type}`}>
                          {notif.type === 'assignment' && <FiUser />}
                          {notif.type === 'class' && <FiVideo />}
                          {notif.type === 'message' && <FiMessageSquare />}
                        </div>
                        <div className="notif-content">
                          <p>{notif.message}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                    {dashboardData.notifications.length === 0 && (
                      <div className="empty-state compact">
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'courses' && (
            <div className="page-section">
              <div className="page-header">
                <h2>My Courses</h2>
                <p>Linked student enrolled courses</p>
                <button className="show-more-courses-btn" onClick={() => openSection('all-courses')}>
                  <FiFolder /> Show More Courses
                </button>
              </div>
              {dashboardData.selectedSubjects.length > 0 ? (
                <div className="subjects-grid">
                  {dashboardData.selectedSubjects.map((subject, index) => (
                    <div key={`${subject}-${index}`} className="subject-card enrolled" role="button" tabIndex={0}>
                      <div className="subject-icon">{getSubjectIcon(subject)}</div>
                      <h3>{subject}</h3>
                      <span className="subject-grade">{dashboardData.studentClassLevel ? `Class ${dashboardData.studentClassLevel}` : 'Course'}</span>
                      <p className="subject-desc">Read-only access for parent monitoring</p>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${dashboardData.learningProgress[subject] || 0}%` }}></div>
                        </div>
                        <span className="progress-text">{dashboardData.learningProgress[subject] || 0}% Complete</span>
                      </div>
                      <button className="enroll-btn enrolled" style={readOnlyButtonStyle} disabled>
                        View Only
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-full-state">
                  <FiBook className="empty-icon" />
                  <h3>No Courses</h3>
                  <p>No enrolled courses found for linked student.</p>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'all-courses' && (
            <div className="page-section">
              <div className="page-header">
                <h2>All Available Courses</h2>
                <p>Subjects mapped to linked student enrollment</p>
              </div>
              <div className="subjects-grid">
                {(dashboardData.selectedSubjects.length > 0 ? dashboardData.selectedSubjects : ['No Subject Available']).map((subject, index) => (
                  <div key={`${subject}-${index}`} className="subject-card enrolled purchased" role="button" tabIndex={0}>
                    <span className="purchased-badge">Linked</span>
                    <div className="subject-icon">{getSubjectIcon(subject)}</div>
                    <h3>{subject}</h3>
                    <span className="subject-grade">Read Only</span>
                    <p className="subject-desc">Parent can monitor this subject activity and progress.</p>
                    <button className="enroll-btn enrolled" style={readOnlyButtonStyle} disabled>
                      View Only
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'live-classes' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Live Classes</h2>
                <p>Scheduled classes for linked student</p>
              </div>
              <div className="live-classes-grid">
                {dashboardData.upcomingClasses.length > 0 ? dashboardData.upcomingClasses.map((cls) => (
                  <div key={cls.id} className="live-class-card">
                    <div className="teacher-info">
                      <div className="teacher-avatar">{cls.teacher?.charAt(0) || 'T'}</div>
                      <div>
                        <h4>{cls.title}</h4>
                        <span className="subject-badge">{cls.subject}</span>
                      </div>
                    </div>
                    <div className="class-meta">
                      <p><FiCalendar /> {cls.date}</p>
                      <p><FiClock /> {cls.time} ({cls.duration} mins)</p>
                      <p><FiUser /> {cls.teacher}</p>
                    </div>
                    {cls.description && <p className="class-description">{cls.description}</p>}
                    <div className="class-actions">
                      <button className="join-btn full-width" style={readOnlyButtonStyle} disabled>
                        <FiVideo /> View Only
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="empty-full-state">
                    <FiVideo className="empty-icon" />
                    <h3>No Live Classes Scheduled</h3>
                    <p>No live classes available for linked student right now.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'assignments' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Assignments</h2>
                <p>Track assignment status in read-only mode</p>
              </div>
              <div className="assignments-full-list">
                {dashboardData.pendingAssignments.length > 0 ? dashboardData.pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className={`assignment-card ${assignment.status}`} role="button" tabIndex={0}>
                    <div className="assignment-left">
                      <div className={`status-icon ${assignment.status}`}>
                        {assignment.status === 'pending' ? <FiAlertCircle /> : <FiCheckCircle />}
                      </div>
                      <div className="assignment-details">
                        <h4>{assignment.title}</h4>
                        <p>{assignment.subject}</p>
                      </div>
                    </div>
                    <div className="assignment-right">
                      <div className="due-date">
                        <FiClock />
                        <span>Updated: {formatDate(assignment.dueDate)}</span>
                      </div>
                      <span className={`status-badge ${assignment.status}`}>
                        {assignment.status === 'pending' ? 'Pending' : 'Submitted'}
                      </span>
                      <button className="submit-btn" style={readOnlyButtonStyle} disabled>
                        Read Only
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="empty-full-state">
                    <FiFileText className="empty-icon" />
                    <h3>No Assignments</h3>
                    <p>No assignment records found for linked student.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'tests' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Tests & Results</h2>
                <p>Complete test history and outcomes</p>
              </div>
              <div className="student-tests-list">
                {dashboardData.tests.length > 0 ? dashboardData.tests.map((test) => {
                  const submission = test.submission;
                  const scoreLabel = submission
                    ? `${submission.correctAnswers || 0}/${submission.totalQuestions || test.totalQuestions || 0}`
                    : 'Not Attempted';
                  const isExpanded = expandedTestId === test.id;

                  return (
                    <div key={test.id} className="student-test-card">
                      <div className="student-test-card-header">
                        <h4>{test.title}</h4>
                        <span className="class-level-tag">
                          {test.classLevel === 'Graduation' || test.classLevel === 'Post Graduation'
                            ? test.classLevel
                            : `Class ${test.classLevel || 'N/A'}`}
                        </span>
                      </div>
                      <p className="student-test-meta">{test.subject} • {test.teacher}</p>
                      <p className="student-test-meta">Created: {formatDateTime(test.createdAt)}</p>
                      <div className="test-result-summary">
                        <div className="test-result-pill total">Questions: {test.totalQuestions}</div>
                        <div className="test-result-pill correct">Result: {scoreLabel}</div>
                        <div className="test-result-pill incorrect">Status: {submission ? 'Submitted' : 'Pending'}</div>
                      </div>
                      <div className="student-test-actions-row">
                        <button
                          className="student-test-start-btn"
                          onClick={() => setExpandedTestId(isExpanded ? '' : test.id)}
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="student-test-questions">
                          <div className="student-test-question-card">
                            <h5 className="student-test-question-title">Detailed Information</h5>
                            <p className="student-test-question-text">Teacher: {test.teacher}</p>
                            <p className="student-test-question-text">Subject: {test.subject}</p>
                            <p className="student-test-question-text">Duration: {test.durationMinutes} minutes</p>
                            <p className="student-test-question-text">Questions: {test.totalQuestions}</p>
                            <p className="student-test-question-text">Attempt Status: {submission ? 'Submitted' : 'Not Attempted'}</p>
                            {submission && (
                              <>
                                <p className="student-test-question-text">Correct Answers: {submission.correctAnswers || 0}</p>
                                <p className="student-test-question-text">Incorrect Answers: {submission.incorrectAnswers || 0}</p>
                                <p className="student-test-question-text">Submitted At: {formatDateTime(submission.submittedAt || submission.createdAt)}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="empty-full-state full-span">
                    <FiFileText className="empty-icon" />
                    <h3>No Tests Available</h3>
                    <p>Tests assigned to linked student will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'recorded' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Recorded Lectures</h2>
                <p>Watch recorded lessons and lecture resources</p>
              </div>
              <div className="recorded-grid">
                {dashboardData.recordedLectures.length > 0 ? dashboardData.recordedLectures.map((lecture) => (
                  <div key={lecture.id} className="recorded-card detailed">
                    <div className="recorded-media">
                      <div className="lecture-external-link-box">
                        <span className="lecture-thumbnail large">{lecture.thumbnail}</span>
                        <p>{lecture.videoType === 'file' ? 'Lecture video uploaded' : 'Lecture link available'}</p>
                        <button className="open-recording-btn" style={readOnlyButtonStyle} disabled>
                          View Only
                        </button>
                      </div>
                    </div>
                    <div className="recorded-info">
                      <div className="recorded-header-row">
                        <div>
                          <h4>{lecture.title}</h4>
                          <p>{lecture.subject} • {lecture.teacher}</p>
                        </div>
                        <span className="recorded-meta-tag">{lecture.classLevel || 'Class N/A'}</span>
                      </div>
                      {lecture.description && <p className="recorded-description">{lecture.description}</p>}
                      {lecture.materials.length > 0 ? (
                        <div className="material-links">
                          {lecture.materials.map((material) => (
                            <a key={material.id} className="material-link" href={material.fileUrl} target="_blank" rel="noreferrer">
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
                    <p>No lecture recordings found for linked student.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'materials' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Study Materials</h2>
                <p>Files and resources from lectures</p>
              </div>
              <div className="materials-grid">
                {studyMaterials.length > 0 ? studyMaterials.map((material) => (
                  <div key={material.id} className="material-card">
                    <FiFolder className="material-icon" />
                    <h4>{material.fileName}</h4>
                    <p>{material.subject} • {material.lectureTitle}</p>
                    <p>{formatFileSize(material.size)} • {material.teacher}</p>
                    <a className="download-btn" href={material.fileUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </div>
                )) : (
                  <div className="empty-full-state full-span">
                    <FiFolder className="empty-icon" />
                    <h3>No Study Materials Available</h3>
                    <p>Materials uploaded by teachers will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'progress' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Learning Progress</h2>
                <p>Track academic growth and activity trend</p>
              </div>
              <div className="progress-section">
                <div className="progress-overview">
                  <div className="progress-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="8"
                        strokeDasharray={`${avgProgress * 2.83} 283`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
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

          {activeMenu === 'doubts' && (
            <div className="page-section">
              <div className="page-header">
                <div>
                  <h2>Doubts</h2>
                  <p>Read-only view of student doubts and teacher responses</p>
                </div>
                <button className="create-doubt-toggle-btn" style={readOnlyButtonStyle} disabled>
                  Create Doubt (Disabled)
                </button>
              </div>

              <div className="student-messages-container">
                <div className="student-messages-sidebar">
                  <div className="student-thread-list">
                    {dashboardData.doubts.length > 0 ? dashboardData.doubts.map((thread) => (
                      <div key={thread.id} className="student-thread-item">
                        <div className="student-thread-avatar">{thread.teacher?.charAt(0) || 'T'}</div>
                        <div className="student-thread-meta">
                          <h4>{thread.title}</h4>
                          <p>{thread.subject} • {thread.status === 'solved' ? 'Solved' : 'Pending'}</p>
                          <span>{formatDateTime(thread.createdAt)}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="student-thread-item">
                        <div className="student-thread-meta">
                          <h4>No doubts submitted yet</h4>
                          <p>Student doubts will appear here when available.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="student-message-panel">
                  {dashboardData.doubts.length > 0 ? (
                    <div className="student-message-body">
                      {dashboardData.doubts.map((thread) => (
                        <div key={`body-${thread.id}`} className="student-message-bubble received" style={{ marginBottom: '10px' }}>
                          <p><strong>Subject:</strong> {thread.subject}</p>
                          <p><strong>Doubt:</strong> {thread.title}</p>
                          <p>{thread.description || 'No description provided.'}</p>
                          {thread.attachment?.fileUrl && (
                            <p>
                              <a href={buildAssetUrl(thread.attachment.fileUrl)} target="_blank" rel="noreferrer">
                                View Attachment ({thread.attachment.originalName || 'file'})
                              </a>
                            </p>
                          )}
                          <p><strong>Teacher Response:</strong> {thread.solution || 'Awaiting response...'}</p>
                          <span>
                            {thread.solvedAt ? `Solved on ${formatDateTime(thread.solvedAt)}` : `Submitted on ${formatDateTime(thread.createdAt)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="student-message-body">
                      <div className="student-message-bubble received">
                        <p>No doubt records to display.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'notifications' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Notifications</h2>
                <button className="mark-all-btn" style={readOnlyButtonStyle} disabled>Read Only</button>
              </div>
              <div className="notifications-full-list">
                {dashboardData.notifications.length > 0 ? dashboardData.notifications.map((notif) => (
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
                )) : (
                  <div className="empty-full-state">
                    <FiBell className="empty-icon" />
                    <h3>No Notifications</h3>
                    <p>No notifications available right now.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default ParentDashboard;
