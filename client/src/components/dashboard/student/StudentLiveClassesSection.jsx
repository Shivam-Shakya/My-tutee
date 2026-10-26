import React from 'react';
import { FiCalendar, FiClock, FiUser, FiVideo } from 'react-icons/fi';

const StudentLiveClassesSection = ({ dashboardData, onJoinClass, onOpenCourses, onOpenDoubts }) => (
  <div className="page-section">
    <div className="page-header">
      <h2>Live Classes</h2>
      <p>Your scheduled live classes (for paid subjects only)</p>
    </div>

    {dashboardData.paidSubjects?.length > 0 && (
      <div className="paid-subjects-info">
        <p>Active subscriptions: <strong>{dashboardData.paidSubjects.join(', ')}</strong></p>
      </div>
    )}

    <div className="live-classes-grid">
      {dashboardData.upcomingClasses.length > 0 ? (
        dashboardData.upcomingClasses.map((cls) => (
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
              <button
                className="join-btn full-width"
                onClick={() => cls.meetingLink ? window.open(cls.meetingLink, '_blank') : alert('Meeting link will be available before class starts')}
              >
                <FiVideo /> Join Class
              </button>
              {onOpenDoubts && (
                <button className="message-btn full-width" onClick={onOpenDoubts}>
                  <FiUser /> Discuss with Teacher
                </button>
              )}
            </div>
          </div>
        ))
      ) : dashboardData.assignedTeachers.filter((t) => t.assignedTimetable?.length > 0).map((teacher, index) => (
        <div key={`${teacher._id}-${index}`} className="live-class-card">
          <div className="teacher-info">
            <div className="teacher-avatar">{teacher.name?.charAt(0)}</div>
            <div>
              <h4>{teacher.name}</h4>
              <span className="subject-badge">{teacher.assignedSubject}</span>
            </div>
          </div>
          <div className="schedule-slots">
            {teacher.assignedTimetable.map((slot, idx) => (
              <div key={idx} className="schedule-slot">
                <div className="slot-time"><FiCalendar /><span>{slot.day} • {slot.time}</span></div>
                <button className="join-btn" onClick={() => onJoinClass(teacher, slot)}>Join Class</button>
              </div>
            ))}
            {onOpenDoubts && (
              <button className="message-btn full-width" onClick={onOpenDoubts}>
                <FiUser /> Message Teacher
              </button>
            )}
          </div>
        </div>
      ))}

      {dashboardData.upcomingClasses.length === 0 && !dashboardData.assignedTeachers.some((t) => t.assignedTimetable?.length > 0) && (
        <div className="empty-full-state">
          <FiVideo className="empty-icon" />
          <h3>No schedule available</h3>
          <p>
            {dashboardData.paidSubjects?.length > 0
              ? 'No schedule available'
              : 'Complete a payment to access live classes from your teachers'}
          </p>
          <button className="action-btn" onClick={onOpenCourses}>Browse Courses</button>
        </div>
      )}
    </div>
  </div>
);

export default StudentLiveClassesSection;
