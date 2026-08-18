import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

const StudentAssignmentsSection = ({ assignments, onOpenDoubts, onSubmitAssignment, assignmentSubmittingId }) => (
  <div className="page-section">
    <div className="page-header">
      <h2>Assignments</h2>
      <p>Track and submit your assignments</p>
    </div>
    <div className="assignments-full-list">
      {assignments.length > 0 ? assignments.map((assignment) => (
        <div key={assignment.id} className={`assignment-card ${assignment.status}`}>
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
            <div className="due-date"><FiClock /><span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span></div>
            <span className={`status-badge ${assignment.status}`}>{assignment.status === 'pending' ? 'Pending' : 'Submitted'}</span>
            {assignment.status === 'pending' && (
              <button
                className="submit-btn"
                onClick={() => onSubmitAssignment && onSubmitAssignment(assignment.id)}
                disabled={assignmentSubmittingId === assignment.id}
              >
                {assignmentSubmittingId === assignment.id ? 'Submitting...' : 'Submit'}
              </button>
            )}
            {onOpenDoubts && <button className="message-btn" onClick={onOpenDoubts}>Discuss</button>}
          </div>
        </div>
      )) : (
        <div className="empty-full-state">
          <h3>No assignments assigned</h3>
          <p>No assignments assigned</p>
        </div>
      )}
    </div>
  </div>
);

export default StudentAssignmentsSection;
