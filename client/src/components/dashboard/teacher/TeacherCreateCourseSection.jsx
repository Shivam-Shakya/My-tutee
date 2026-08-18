import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

const TeacherCreateCourseSection = ({ onBack }) => {
  const [isCourseFormVisible, setIsCourseFormVisible] = useState(false);

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="page-title">Create New Course</h2>
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="section-form-toggle-row">
        <button
          type="button"
          className={`section-form-toggle-btn ${isCourseFormVisible ? 'active' : ''}`}
          onClick={() => setIsCourseFormVisible((prev) => !prev)}
        >
          <FiPlus /> {isCourseFormVisible ? 'Hide Course Form' : 'Create Course'}
        </button>
      </div>

      {isCourseFormVisible && (
        <div className="form-card">
          <div className="form-group">
            <label>Course Title</label>
            <input type="text" placeholder="Enter course title" />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select>
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english">English</option>
            </select>
          </div>
          <div className="form-group">
            <label>Grade/Class</label>
            <select>
              <option value="">Select Grade</option>
              <option value="9">9th Grade</option>
              <option value="10">10th Grade</option>
              <option value="11">11th Grade</option>
              <option value="12">12th Grade</option>
            </select>
          </div>
          <div className="form-group">
            <label>Course Description</label>
            <textarea rows="4" placeholder="Describe what students will learn..."></textarea>
          </div>
          <div className="form-group">
            <label>Course Duration (weeks)</label>
            <input type="number" placeholder="e.g., 12" />
          </div>
          <div className="form-group">
            <label>Course Fee (₹)</label>
            <input type="number" placeholder="Enter course fee" />
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setIsCourseFormVisible(false)}>Close</button>
            <button className="btn-primary">Create Course</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCreateCourseSection;
