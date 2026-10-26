import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const TeacherAssignmentsSection = ({
  onBack,
  teacherAssignments,
  handleDeleteAssignment,
  assignmentError,
  assignmentSuccess,
  handleAssignmentSubmit,
  assignmentForm,
  handleAssignmentChange,
  teacherSubjects,
  DEFAULT_SUBJECT_OPTIONS,
  classLevelOptions,
  assignmentLoading
}) => {
  const [isAssignmentFormVisible, setIsAssignmentFormVisible] = useState(false);

  const handleToggleAssignmentForm = () => {
    setIsAssignmentFormVisible((prev) => !prev);
  };

  const handleSubmitAssignment = async (event) => {
    const result = await handleAssignmentSubmit(event);
    if (result?.success) {
      setIsAssignmentFormVisible(false);
    }
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="page-title">Assignments</h2>
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="section-form-toggle-row">
        <button
          type="button"
          className={`section-form-toggle-btn ${isAssignmentFormVisible ? 'active' : ''}`}
          onClick={handleToggleAssignmentForm}
        >
          <FiPlus /> {isAssignmentFormVisible ? 'Hide Assignment Form' : 'Create Assignment'}
        </button>
      </div>

      {isAssignmentFormVisible && (
        <div className="form-card section-top-form-card">
          <h3 className="form-subtitle">Create New Assignment</h3>
          {assignmentError && <div className="error-message">{assignmentError}</div>}
          {assignmentSuccess && <div className="success-message">{assignmentSuccess}</div>}

          <form onSubmit={handleSubmitAssignment}>
            <div className="form-group">
              <label>Select Subject</label>
              <select name="subject" value={assignmentForm.subject} onChange={handleAssignmentChange} required>
                <option value="">Choose a subject</option>
                {teacherSubjects.length > 0
                  ? teacherSubjects.map((subj, idx) => <option key={idx} value={subj}>{subj}</option>)
                  : DEFAULT_SUBJECT_OPTIONS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Class Level</label>
              <select name="classLevel" value={assignmentForm.classLevel} onChange={handleAssignmentChange} required>
                <option value="">Choose class level</option>
                {classLevelOptions.map((level, idx) => (
                  <option key={idx} value={level}>{level === 'Graduation' || level === 'Post Graduation' ? level : `Class ${level}`}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Assignment Title</label>
              <input type="text" name="title" value={assignmentForm.title} onChange={handleAssignmentChange} placeholder="Enter assignment title" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="2" name="description" value={assignmentForm.description} onChange={handleAssignmentChange} placeholder="Brief description of the assignment"></textarea>
            </div>
            <div className="form-group">
              <label>Instructions</label>
              <textarea rows="4" name="instructions" value={assignmentForm.instructions} onChange={handleAssignmentChange} placeholder="Provide detailed instructions for the assignment"></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" name="dueDate" value={assignmentForm.dueDate} onChange={handleAssignmentChange} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label>Total Marks</label>
                <input type="number" name="totalMarks" value={assignmentForm.totalMarks} onChange={handleAssignmentChange} placeholder="e.g., 100" />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleToggleAssignmentForm}>Close</button>
              <button type="submit" className="btn-primary" disabled={assignmentLoading}>{assignmentLoading ? 'Creating...' : 'Create Assignment'}</button>
            </div>
          </form>
        </div>
      )}

      {teacherAssignments.length > 0 && (
        <div className="existing-assignments">
          <h3 className="section-subtitle">Your Assignments</h3>
          <div className="assignments-list">
            {teacherAssignments.map((assignment) => (
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
                  <span>Submissions: {assignment.submissions?.filter((s) => s.status !== 'pending').length || 0}</span>
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
    </div>
  );
};

export default TeacherAssignmentsSection;
