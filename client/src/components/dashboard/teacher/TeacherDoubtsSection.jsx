import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const TeacherDoubtsSection = ({
  onBack,
  messagesError,
  messageSearch,
  setMessageSearch,
  messageThreadsLoading,
  filteredMessageThreads,
  selectedMessageThread,
  setSelectedMessageThread,
  formatMessageDateTime,
  formatClassLevelLabel,
  buildAssetUrl,
  solutionInput,
  setSolutionInput,
  handleSendTeacherMessage,
  messageSending
}) => {
  const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);

  useEffect(() => {
    setIsReplyFormVisible(false);
  }, [selectedMessageThread?._id]);

  const handleReplySubmit = async () => {
    const result = await handleSendTeacherMessage();
    if (result?.success) {
      setIsReplyFormVisible(false);
    }
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="page-title">Doubts</h2>
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
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
              <div className="message-item"><div className="message-preview"><h4>Loading doubts...</h4></div></div>
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
              <div className="message-item"><div className="message-preview"><h4>No doubts found</h4><p>Doubts from assigned and paid students will appear here.</p></div></div>
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
                      <a href={buildAssetUrl(selectedMessageThread.attachment.fileUrl)} target="_blank" rel="noopener noreferrer">
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
                <div className="section-form-toggle-row message-reply-toggle-row">
                  <button
                    type="button"
                    className={`section-form-toggle-btn ${isReplyFormVisible ? 'active' : ''}`}
                    onClick={() => setIsReplyFormVisible((prev) => !prev)}
                  >
                    {isReplyFormVisible ? 'Hide Reply Form' : 'Reply to Doubt'}
                  </button>
                </div>
              )}
              {selectedMessageThread.status !== 'solved' && isReplyFormVisible && (
                <div className="message-input-area">
                  <textarea
                    rows="4"
                    placeholder="Write your solution for this doubt..."
                    value={solutionInput}
                    onChange={(e) => setSolutionInput(e.target.value)}
                  ></textarea>
                  <button className="send-btn" onClick={handleReplySubmit} disabled={messageSending || !solutionInput.trim()}>
                    {messageSending ? 'Submitting...' : 'Mark as Solved'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="message-detail-body"><div className="message-bubble received"><p>Select a doubt from the left panel to view details and resolve it.</p></div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDoubtsSection;
