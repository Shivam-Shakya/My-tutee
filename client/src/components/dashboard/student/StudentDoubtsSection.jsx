import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const StudentDoubtsSection = ({
  messagesError,
  doubtForm,
  setDoubtForm,
  dashboardData,
  activeTeacher,
  handleSendStudentMessage,
  messageSending,
  messageSearch,
  setMessageSearch,
  messageThreadsLoading,
  filteredMessageThreads,
  selectedMessageThread,
  setSelectedMessageThread,
  formatMessageDateTime,
  formatClassLevelLabel,
  buildAssetUrl
}) => {
  const [isCreateDoubtOpen, setIsCreateDoubtOpen] = useState(false);

  const handleSubmitDoubt = async () => {
    const result = await handleSendStudentMessage();
    if (result?.success) {
      setIsCreateDoubtOpen(false);
    }
  };

  const visibleTeachers = activeTeacher
    ? dashboardData.assignedTeachers.filter((teacher) => String(teacher._id) === String(activeTeacher._id))
    : dashboardData.assignedTeachers;

  const visibleTeacherIds = new Set(visibleTeachers.map((teacher) => String(teacher._id)));
  const visibleSubjectNames = new Set([
    activeTeacher?.assignedSubject,
    activeTeacher?.subject,
  ].filter(Boolean).map((value) => String(value).toLowerCase()));

  const courseScopedThreads = activeTeacher
    ? filteredMessageThreads.filter((thread) => {
      const threadTeacherId = String(thread.teacher?._id || '');
      const threadSubject = String(thread.subject || '').toLowerCase();
      return visibleTeacherIds.has(threadTeacherId)
        || [...visibleSubjectNames].some((subject) => threadSubject.includes(subject) || subject.includes(threadSubject));
    })
    : filteredMessageThreads;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h2>Doubts</h2>
          <p>Submit subject doubts to your assigned teacher and track resolution status</p>
        </div>
        <button
          type="button"
          className={`create-doubt-toggle-btn ${isCreateDoubtOpen ? 'active' : ''}`}
          onClick={() => setIsCreateDoubtOpen((prev) => !prev)}
          aria-expanded={isCreateDoubtOpen}
          aria-controls="student-create-doubt-form"
        >
          Create Doubt
        </button>
      </div>
      {messagesError && <div className="error-message">{messagesError}</div>}
      {isCreateDoubtOpen && (
        <div className="form-card student-doubt-form-card" id="student-create-doubt-form">
          <h3>Submit New Doubt</h3>
          <div className="form-group">
            <label>Subject</label>
            <select
              value={doubtForm.subject}
              onChange={(e) => setDoubtForm((prev) => ({ ...prev, subject: e.target.value }))}
              disabled={Boolean(activeTeacher)}
            >
              <option value="">Select subject</option>
              {visibleTeachers.map((teacher) => (
                <option key={`${teacher._id}-${teacher.assignedSubject}`} value={teacher.assignedSubject}>
                  {teacher.assignedSubject}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Doubt Title</label>
            <input
              type="text"
              placeholder="Enter a short title"
              value={doubtForm.title}
              onChange={(e) => setDoubtForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Doubt Description</label>
            <textarea
              rows="4"
              placeholder="Describe your question in detail"
              value={doubtForm.description}
              onChange={(e) => setDoubtForm((prev) => ({ ...prev, description: e.target.value }))}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Attachment (optional)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
              onChange={(e) => setDoubtForm((prev) => ({ ...prev, attachment: e.target.files?.[0] || null }))}
            />
          </div>
          <button className="submit-btn" type="button" onClick={handleSubmitDoubt} disabled={messageSending}>
            {messageSending ? 'Submitting...' : 'Submit Doubt'}
          </button>
        </div>
      )}
      <div className="student-messages-container">
        <div className="student-messages-sidebar">
          <div className="student-messages-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by subject, title, status..."
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
            />
          </div>
          <div className="student-thread-list">
            {messageThreadsLoading ? (
              <div className="student-thread-item">
                <div className="student-thread-meta">
                  <h4>Loading doubts...</h4>
                </div>
              </div>
            ) : courseScopedThreads.length > 0 ? courseScopedThreads.map((thread) => (
              <div
                key={thread._id}
                className={`student-thread-item ${selectedMessageThread?._id === thread._id ? 'active' : ''}`}
                onClick={() => setSelectedMessageThread(thread)}
              >
                <div className="student-thread-avatar">{thread.teacher?.name?.charAt(0) || 'T'}</div>
                <div className="student-thread-meta">
                  <h4>{thread.title}</h4>
                  <p>{thread.subject} • {thread.status === 'solved' ? 'Solved' : 'Pending'}</p>
                  <span>{formatMessageDateTime(thread.updatedAt)}</span>
                </div>
              </div>
            )) : (
              <div className="student-thread-item">
                <div className="student-thread-meta">
                  <h4>No doubts submitted yet</h4>
                  <p>Submit your first doubt using the Create Doubt button.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="student-message-panel">
          {selectedMessageThread ? (
            <>
              <div className="student-message-header">
                <div className="student-thread-avatar">{selectedMessageThread.teacher?.name?.charAt(0) || 'T'}</div>
                <div>
                  <h3>{selectedMessageThread.title}</h3>
                  <span>
                    {selectedMessageThread.subject} • {formatClassLevelLabel(selectedMessageThread.classLevel)} • {selectedMessageThread.status === 'solved' ? 'Solved' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="student-message-body">
                <div className="student-message-bubble received">
                  <p><strong>Teacher:</strong> {selectedMessageThread.teacher?.name || 'Assigned Teacher'}</p>
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
                <div className={`student-message-bubble ${selectedMessageThread.status === 'solved' ? 'sent' : 'received'}`}>
                  <p><strong>Teacher Solution:</strong></p>
                  <p>{selectedMessageThread.solution?.trim() ? selectedMessageThread.solution : 'Awaiting teacher response...'}</p>
                  {selectedMessageThread.solvedAt && <span>Solved on {formatMessageDateTime(selectedMessageThread.solvedAt)}</span>}
                </div>
              </div>
            </>
          ) : (
            <div className="student-message-body">
              <div className="student-message-bubble received">
                <p>Select a doubt from the left panel to view details and resolution.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDoubtsSection;
