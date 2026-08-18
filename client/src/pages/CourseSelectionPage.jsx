import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { COURSE_CATALOG } from '../constants/courseCatalog';
import { BASE_URL } from '../config';
import './CourseSelectionPage.css';

const API_URL = `${BASE_URL}/courses`;

const formatPrice = (teacher) => {
  const numericPrice = Number(teacher?.resolvedFee || 0);
  return {
    value: numericPrice,
    label: numericPrice > 0 ? `Rs ${numericPrice.toLocaleString('en-IN')}` : 'Price not set'
  };
};

const CourseSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courseCatalog, setCourseCatalog] = useState(COURSE_CATALOG);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubSubject, setSelectedSubSubject] = useState('');
  const [selectionType, setSelectionType] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch(`${API_URL}/catalog`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.message || 'Failed to fetch course catalog');
        }

        if (Array.isArray(payload?.courses) && payload.courses.length > 0) {
          setCourseCatalog(payload.courses);
        }
      } catch (error) {
        console.error('Failed to fetch course catalog from API, using fallback:', error);
        setCourseCatalog(COURSE_CATALOG);
      }
    };

    fetchCatalog();
  }, []);

  const selectedCourse = useMemo(
    () => courseCatalog.find((course) => course.id === selectedCourseId) || null,
    [selectedCourseId, courseCatalog]
  );
  const selectedTeacherPricing = selectedTeacher
    ? formatPrice(selectedTeacher)
    : { value: 0, label: 'Price not set' };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSubSubject('');
    setSelectionType('');
    setTeachers([]);
    setSelectedTeacher(null);
    setTeacherError('');
  };

  const fetchTeachers = async ({ courseId, subSubjectName = '', type }) => {
    setSelectedSubSubject(subSubjectName);
    setSelectionType(type);
    setSelectedTeacher(null);
    setTeacherError('');
    setLoadingTeachers(true);

    try {
      const query = new URLSearchParams();
      query.set('courseId', courseId);
      if (type === 'full-course') {
        query.set('fullCourse', 'true');
      }
      if (type === 'sub-subject' && subSubjectName) {
        query.set('subject', subSubjectName);
      }

      const response = await fetch(`${API_URL}/teachers?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to fetch teachers');
      }

      setTeachers(payload.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      setTeachers([]);
      setTeacherError(error.message || 'Unable to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSelectFullCourse = () => {
    if (!selectedCourse) return;
    fetchTeachers({ courseId: selectedCourse.id, type: 'full-course' });
  };

  const handleSelectSubSubject = async (subSubjectName) => {
    if (!selectedCourse) return;
    fetchTeachers({ courseId: selectedCourse.id, subSubjectName, type: 'sub-subject' });
  };

  const handleHireTeacher = () => {
    if (!selectedTeacher || !selectedCourse || !selectionType) return;

    const price = selectedTeacherPricing.value;
    if (price <= 0) {
      setTeacherError('This teacher has not set a valid price yet. Please select another teacher.');
      return;
    }

    const payableSubject = selectionType === 'full-course' ? selectedCourse.name : selectedSubSubject;

    navigate('/payment', {
      state: {
        course: {
          name: payableSubject,
          subject: selectedCourse.name,
          price
        },
        teacher: {
          ...selectedTeacher,
          assignedSubject: payableSubject,
          selectedCourseName: selectedCourse.name
        },
        selectedCourse: {
          id: selectedCourse.id,
          name: selectedCourse.name,
          icon: selectedCourse.icon
        },
        selectedSubSubject: {
          name: payableSubject,
          selectionType
        }
      }
    });
  };

  return (
    <div className="course-selection-page">
      <div className="course-selection-container">
        <div className="selection-header">
          <button type="button" className="back-btn" onClick={() => navigate('/dashboard/studentdeshboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1>Select Course and Hire Teacher</h1>
          <p>{user?.name ? `${user.name}, choose your course, sub-subject, and teacher.` : 'Choose your course, sub-subject, and teacher.'}</p>
        </div>

        <div className="selection-layout">
          <section className="courses-column">
            <h2>Main Courses</h2>
            <div className="course-list">
              {courseCatalog.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className={`course-card ${selectedCourseId === course.id ? 'active' : ''}`}
                  onClick={() => handleSelectCourse(course.id)}
                >
                  <span className="course-icon">{course.icon}</span>
                  <div>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedCourse && (
              <div className="subsubject-block">
                <h2>Sub-Subjects</h2>
                <div className="subsubject-list">
                  <button
                    type="button"
                    className={`subsubject-btn ${selectionType === 'full-course' ? 'active' : ''}`}
                    onClick={handleSelectFullCourse}
                  >
                    Full Course ({selectedCourse.name})
                  </button>
                  {selectedCourse.subCourses.map((subSubject) => (
                    <button
                      key={subSubject.id}
                      type="button"
                      className={`subsubject-btn ${selectionType === 'sub-subject' && selectedSubSubject === subSubject.name ? 'active' : ''}`}
                      onClick={() => handleSelectSubSubject(subSubject.name)}
                    >
                      {subSubject.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="teachers-column">
            <h2>Teachers</h2>
            {!selectionType && <p className="placeholder-text">Select full course or a sub-subject to view teachers.</p>}
            {loadingTeachers && <p className="placeholder-text">Loading teachers...</p>}
            {teacherError && <p className="error-text">{teacherError}</p>}

            {!loadingTeachers && selectionType && teachers.length > 0 && (
              <div className="teachers-grid">
                {teachers.map((teacher) => {
                  const pricing = formatPrice(teacher);
                  return (
                    <button
                      key={teacher._id}
                      type="button"
                      className={`teacher-card ${selectedTeacher?._id === teacher._id ? 'active' : ''}`}
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      <div className="teacher-header">
                        <span className="teacher-avatar"><FiUser /></span>
                        <div>
                          <h3>{teacher.name}</h3>
                          <p>{selectionType === 'full-course' ? `${selectedCourse?.name} (Full Course)` : selectedSubSubject}</p>
                        </div>
                      </div>
                      <div className="teacher-meta">
                        <span>Course: {teacher.matchedCourse?.name || selectedCourse?.name}</span>
                        <span>{selectionType === 'full-course' ? 'Track: Full Course' : `Sub-Subject: ${teacher.matchedSubSubject?.name || selectedSubSubject}`}</span>
                        <span>Experience: {teacher.profile?.experience || 'Not specified'}</span>
                        <span className="teacher-price">Price: {pricing.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loadingTeachers && selectionType && teachers.length === 0 && !teacherError && (
              <p className="placeholder-text">No teachers found for this selection.</p>
            )}

            {selectedTeacher && (
              <div className="teacher-profile-panel">
                <button type="button" className="hire-btn" onClick={handleHireTeacher} disabled={selectedTeacherPricing.value <= 0}>
                  <FiCreditCard /> Pay Now / Hire Teacher
                </button>
                <h3>{selectedTeacher.name}</h3>
                <p className="profile-highlight">Course: {selectedTeacher.matchedCourse?.name || selectedCourse?.name}</p>
                <p className="profile-highlight">Subject: {selectionType === 'full-course' ? `${selectedCourse?.name} (Full Course)` : selectedSubSubject}</p>
                <p className="profile-highlight">Price: {selectedTeacherPricing.label}</p>
                <p>Experience: {selectedTeacher.profile?.experience || 'Not specified'}</p>
                <p>Qualifications: {selectedTeacher.profile?.qualifications || 'Not specified'}</p>
                <p>Teaching Mode: {selectedTeacher.profile?.teachingMode || 'Online'}</p>
                {selectedTeacher.profile?.bio && <p className="profile-bio">{selectedTeacher.profile.bio}</p>}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionPage;
