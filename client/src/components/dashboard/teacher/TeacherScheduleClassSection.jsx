import React, { useState } from 'react';
import { FiCalendar, FiClock, FiPlus, FiTrash2, FiUsers, FiVideo } from 'react-icons/fi';

const TeacherScheduleClassSection = ({
  onBack,
  scheduledClasses,
  handleCancelClass,
  scheduleError,
  scheduleSuccess,
  handleScheduleSubmit,
  scheduleForm,
  handleScheduleChange,
  teacherSubjects,
  DEFAULT_SUBJECT_OPTIONS,
  classLevelOptions,
  scheduleLoading
}) => {
  const [isScheduleFormVisible, setIsScheduleFormVisible] = useState(false);

  const handleToggleScheduleForm = () => {
    setIsScheduleFormVisible((prev) => !prev);
  };

  const handleSubmitSchedule = async (event) => {
    const result = await handleScheduleSubmit(event);
    if (result?.success) {
      setIsScheduleFormVisible(false);
    }
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="page-title">Schedule Live Class</h2>
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="section-form-toggle-row">
        <button
          type="button"
          className={`section-form-toggle-btn ${isScheduleFormVisible ? 'active' : ''}`}
          onClick={handleToggleScheduleForm}
        >
          <FiPlus /> {isScheduleFormVisible ? 'Hide Class Form' : 'Schedule New Class'}
        </button>
      </div>

      {isScheduleFormVisible && (
        <div className="form-card section-top-form-card">
          <h3 className="form-subtitle">Schedule New Class</h3>
          {scheduleError && <div className="error-message">{scheduleError}</div>}
          {scheduleSuccess && <div className="success-message">{scheduleSuccess}</div>}

          <form onSubmit={handleSubmitSchedule}>
            <div className="form-group">
              <label>Select Subject</label>
              <select name="subject" value={scheduleForm.subject} onChange={handleScheduleChange} required>
                <option value="">Choose a subject</option>
                {teacherSubjects.length > 0 ? (
                  teacherSubjects.map((subj, idx) => <option key={idx} value={subj}>{subj}</option>)
                ) : (
                  DEFAULT_SUBJECT_OPTIONS.map((subject) => <option key={subject} value={subject}>{subject}</option>)
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Class Level</label>
              <select name="classLevel" value={scheduleForm.classLevel} onChange={handleScheduleChange} required>
                <option value="">Choose class level</option>
                {classLevelOptions.map((level, idx) => (
                  <option key={idx} value={level}>{level === 'Graduation' || level === 'Post Graduation' ? level : `Class ${level}`}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Class Title</label>
              <input type="text" name="title" value={scheduleForm.title} onChange={handleScheduleChange} placeholder="e.g., Introduction to Derivatives" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={scheduleForm.date} onChange={handleScheduleChange} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="time" value={scheduleForm.time} onChange={handleScheduleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <select name="duration" value={scheduleForm.duration} onChange={handleScheduleChange}>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Class Description</label>
              <textarea rows="3" name="description" value={scheduleForm.description} onChange={handleScheduleChange} placeholder="What will be covered in this class?"></textarea>
            </div>
            <div className="form-group">
              <label>Meeting Platform</label>
              <select name="platform" value={scheduleForm.platform} onChange={handleScheduleChange}>
                <option value="zoom">Zoom</option>
                <option value="meet">Google Meet</option>
                <option value="teams">Microsoft Teams</option>
                <option value="internal">Platform Built-in</option>
              </select>
            </div>
            <div className="form-group">
              <label>Meeting Link (optional)</label>
              <input type="url" name="meetingLink" value={scheduleForm.meetingLink} onChange={handleScheduleChange} placeholder="https://zoom.us/j/..." />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleToggleScheduleForm}>Close</button>
              <button type="submit" className="btn-primary" disabled={scheduleLoading}>{scheduleLoading ? 'Scheduling...' : 'Schedule Class'}</button>
            </div>
          </form>
        </div>
      )}

      {scheduledClasses.length > 0 && (
        <div className="scheduled-classes-list">
          <h3 className="form-subtitle">Your Scheduled Classes</h3>
          <div className="classes-grid">
            {scheduledClasses.map((classItem) => (
              <div key={classItem._id} className="scheduled-class-card">
                <div className="class-card-header">
                  <span className="class-subject-badge">{classItem.subject}</span>
                  <button className="cancel-class-btn" onClick={() => handleCancelClass(classItem._id)} title="Cancel Class">
                    <FiTrash2 />
                  </button>
                </div>
                <h4>{classItem.title}</h4>
                <div className="class-details">
                  <p><FiCalendar /> {new Date(classItem.date).toLocaleDateString()}</p>
                  <p><FiClock /> {classItem.time} ({classItem.duration} mins)</p>
                  <p><FiVideo /> {classItem.platform}</p>
                  <p><FiUsers /> {classItem.enrolledStudents?.length || 0} enrolled</p>
                </div>
                {classItem.description && <p className="class-description">{classItem.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherScheduleClassSection;
