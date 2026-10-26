import React from 'react';
import { FiBook } from 'react-icons/fi';

const StudentCoursesSection = ({
  selectedCourse,
  selectedSubSubject,
  assignedTeacher,
  enrolledProgram,
  onOpenCourseSelection
}) => {
  return (
    <div className="page-section">
      <div className="page-header">
        <h2>My Courses</h2>
        <p>Only your selected subject and assigned teacher appear here</p>
      </div>

      {selectedCourse && selectedSubSubject ? (
        <div className="subjects-grid">
          <div className="subject-card enrolled">
            <div className="subject-icon">{selectedCourse.icon || '📘'}</div>
            <h3>{selectedCourse.name}</h3>
            <p className="subject-desc">Enrolled Program: {enrolledProgram?.name || selectedSubSubject.name}</p>
            <div className="sub-courses-mini-list">
              <div className="sub-courses-mini-item">
                <span>Program</span>
                <strong>{enrolledProgram?.name || selectedSubSubject.name}</strong>
              </div>
              <div className="sub-courses-mini-item">
                <span>Assigned Teacher</span>
                <strong>{assignedTeacher?.name || 'Not assigned'}</strong>
              </div>
            </div>
            <div className="course-interaction-links">
              <button type="button" className="course-interaction-btn primary" onClick={onOpenCourseSelection}>Switch Course</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-full-state">
          <FiBook className="empty-icon" />
          <h3>No Assigned Teacher Yet</h3>
          <p>Open course selection and hire a teacher to get started.</p>
          <button className="action-btn" onClick={onOpenCourseSelection}>Open Course Selection</button>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesSection;
