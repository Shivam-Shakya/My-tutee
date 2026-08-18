import React, { useState } from 'react';
import { FiEdit, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import './TeacherTestsSection.css';

const TeacherTestsSection = ({
  onBack,
  testSearch,
  setTestSearch,
  fetchTeacherTests,
  testsError,
  testsSuccess,
  testForm,
  handleSaveTest,
  handleTestFormChange,
  teacherSubjects,
  DEFAULT_SUBJECT_OPTIONS,
  classLevelOptions,
  formatClassLevelLabel,
  handleTestQuestionChange,
  optionLabels,
  handleAddQuestionToTest,
  handleCancelQuestionEdit,
  handleEditTestQuestion,
  handleRemoveTestQuestion,
  resetTestForm,
  testSubmitting,
  testsLoading,
  filteredTeacherTests,
  formatMessageDateTime,
  teacherStudents,
  studentsLoading,
  studentsError,
  fetchTeacherStudents,
  handleAssignTestToStudent,
  handleEditTest,
  handleViewTestSubmissions,
  selectedTestSubmissionsId,
  handleDeleteTest,
  loadingSubmissions,
  selectedTestSubmissions
}) => {
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState('');
  const [shareModalTest, setShareModalTest] = useState(null);
  const [shareSearch, setShareSearch] = useState('');
  const [assigningStudentId, setAssigningStudentId] = useState('');

  const handleCreateTestClick = () => {
    setIsCreateFormVisible((prev) => {
      const nextVisible = !prev;
      if (!nextVisible) {
        resetTestForm();
      }
      return nextVisible;
    });
  };

  const handleEditTestClick = (test) => {
    setIsCreateFormVisible(true);
    handleEditTest(test);
  };

  const handleTestSubmit = async (event) => {
    const result = await handleSaveTest(event);

    if (result?.success) {
      setIsCreateFormVisible(false);
    }
  };

  const handleToggleViewTest = (testId) => {
    setExpandedTestId((prev) => (prev === testId ? '' : testId));
  };

  const handleOpenShareModal = async (test) => {
    setShareModalTest(test);
    setShareSearch('');
    await fetchTeacherStudents({ withLoading: true });
  };

  const handleCloseShareModal = () => {
    setShareModalTest(null);
    setShareSearch('');
    setAssigningStudentId('');
  };

  const handleShareTestToStudent = async (studentId) => {
    if (!shareModalTest?._id || !studentId) return;

    setAssigningStudentId(studentId);
    const result = await handleAssignTestToStudent(shareModalTest._id, studentId);

    if (result?.success) {
      setShareModalTest((prev) => {
        if (!prev) return prev;

        const existingAssigned = Array.isArray(prev.assignedStudents) ? prev.assignedStudents : [];
        const alreadyAssigned = existingAssigned.some((id) => String(id) === String(studentId));

        return {
          ...prev,
          isVisible: true,
          assignedStudents: alreadyAssigned ? existingAssigned : [...existingAssigned, studentId]
        };
      });
    }

    setAssigningStudentId('');
  };

  const isStudentEligibleForTest = (student, test) => {
    if (!student || !test) return false;
    return student.subject === test.subject && String(student.classLevel) === String(test.classLevel);
  };

  const normalizedStudentSearch = shareSearch.trim().toLowerCase();
  const popupStudents = (teacherStudents || []).filter((student) => {
    if (!normalizedStudentSearch) return true;

    return student.name?.toLowerCase().includes(normalizedStudentSearch)
      || student.email?.toLowerCase().includes(normalizedStudentSearch)
      || student.subject?.toLowerCase().includes(normalizedStudentSearch)
      || student.classLevel?.toLowerCase().includes(normalizedStudentSearch);
  });

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="page-title">Test</h2>
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="students-filters">
        <div className="search-filter">
          <FiSearch />
          <input type="text" placeholder="Search by title, subject, class level" value={testSearch} onChange={(e) => setTestSearch(e.target.value)} />
        </div>
        <button className="view-btn" onClick={() => fetchTeacherTests({ withLoading: true })}>Refresh</button>
      </div>

      {testsError && <div className="error-message">{testsError}</div>}
      {testsSuccess && <div className="success-message">{testsSuccess}</div>}

      <div className="test-create-toolbar">
        <button type="button" className={`test-create-toggle-btn ${isCreateFormVisible ? 'active' : ''}`} onClick={handleCreateTestClick}>
          <FiPlus />
          <span>{isCreateFormVisible ? 'Hide Test Form' : 'Create Test'}</span>
        </button>
      </div>

      {isCreateFormVisible && (
        <div className="form-card test-form-card">
          <h3 className="form-subtitle">{testForm.editingId ? 'Edit Test' : 'Create New Test'}</h3>
          <form onSubmit={handleTestSubmit}>
            <div className="form-group">
              <label>Subject</label>
              <select name="subject" value={testForm.subject} onChange={handleTestFormChange} required>
                <option value="">Choose a subject</option>
                {teacherSubjects.length > 0 ? teacherSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>) : DEFAULT_SUBJECT_OPTIONS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Class Level</label>
              <select name="classLevel" value={testForm.classLevel} onChange={handleTestFormChange} required>
                <option value="">Choose class level</option>
                {classLevelOptions.map((level) => <option key={level} value={level}>{formatClassLevelLabel(level)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Test Title</label>
              <input type="text" name="title" value={testForm.title} onChange={handleTestFormChange} placeholder="Enter test title" required />
            </div>
            <div className="form-group">
              <label>Test Description / Instructions</label>
              <textarea rows="4" name="description" value={testForm.description} onChange={handleTestFormChange} placeholder="Add test instructions"></textarea>
            </div>

            <div className="form-group"><label>Duration (Minutes)</label><input type="number" min="1" name="durationMinutes" value={testForm.durationMinutes} onChange={handleTestFormChange} placeholder="e.g. 60" required /></div>

            <div className="form-group"><label>Question Text</label><textarea rows="3" name="questionText" value={testForm.currentQuestion.questionText} onChange={handleTestQuestionChange} placeholder="Enter the full question"></textarea></div>
            <div className="form-row">
              <div className="form-group"><label>Option A</label><input type="text" name="optionA" value={testForm.currentQuestion.optionA} onChange={handleTestQuestionChange} placeholder="Option A" /></div>
              <div className="form-group"><label>Option B</label><input type="text" name="optionB" value={testForm.currentQuestion.optionB} onChange={handleTestQuestionChange} placeholder="Option B" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Option C</label><input type="text" name="optionC" value={testForm.currentQuestion.optionC} onChange={handleTestQuestionChange} placeholder="Option C" /></div>
              <div className="form-group"><label>Option D</label><input type="text" name="optionD" value={testForm.currentQuestion.optionD} onChange={handleTestQuestionChange} placeholder="Option D" /></div>
            </div>
            <div className="form-group">
              <label>Correct Answer</label>
              <select name="correctAnswer" value={testForm.currentQuestion.correctAnswer} onChange={handleTestQuestionChange}>
                {optionLabels.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Solution / Explanation</label>
              <textarea
                rows="4"
                name="solution"
                value={testForm.currentQuestion.solution}
                onChange={handleTestQuestionChange}
                placeholder="Write the full explanation for this question. Example: Answer: B because ..."
              ></textarea>
            </div>

            <div className="form-actions" style={{ marginTop: '-4px', marginBottom: '20px' }}>
              <button type="button" className="btn-secondary" onClick={handleAddQuestionToTest}>{testForm.editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}</button>
              {testForm.editingQuestionIndex >= 0 && <button type="button" className="btn-secondary" onClick={handleCancelQuestionEdit}>Cancel Edit</button>}
            </div>
            <div className="form-group">
              <label>Questions Added</label>
              {testForm.questions.length > 0 ? (
                <div className="test-question-builder">
                  {testForm.questions.map((question, index) => (
                    <div key={`${question.questionText}-${index}`} className="test-question-item">
                      <div>
                        <strong>Q{index + 1}.</strong> {question.questionText}
                        <div className="test-question-options">
                          {optionLabels.map((label) => <span key={`${label}-${index}`} className={`test-option-chip ${question.correctAnswer === label ? 'correct' : ''}`}>{label}: {question[`option${label}`]}</span>)}
                        </div>
                        <div className="test-question-solution-block">
                          <span className="test-question-solution-label">Solution</span>
                          <p className="test-question-solution-text">{question.solution}</p>
                        </div>
                      </div>
                      <div className="test-builder-actions">
                        <button type="button" className="btn-small" onClick={() => handleEditTestQuestion(index)}><FiEdit /> Edit</button>
                        <button type="button" className="btn-small btn-danger" onClick={() => handleRemoveTestQuestion(index)}><FiTrash2 /> Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="info-message">No questions added yet.</div>}
            </div>
            <div className="form-group"><label>Status</label><select name="status" value={testForm.status} onChange={handleTestFormChange}><option value="published">Published</option><option value="draft">Draft</option></select></div>
            <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => { resetTestForm(); setIsCreateFormVisible(false); }}>Close</button><button type="submit" className="btn-primary" disabled={testSubmitting}>{testSubmitting ? 'Saving...' : testForm.editingId ? 'Update Test' : 'Create Test'}</button></div>
          </form>
        </div>
      )}

      <div className="test-list-section">
        <h3 className="section-subtitle">All Created Tests</h3>
        {testsLoading ? (
          <div className="info-message">Loading tests...</div>
        ) : filteredTeacherTests.length > 0 ? (
          <div className="test-list-grid">
            {filteredTeacherTests.map((test) => (
              <div key={test._id} className="test-card">
                <div className="test-card-header"><h4>{test.title}</h4><span className="test-class-level-tag">{formatClassLevelLabel(test.classLevel)}</span></div>
                <p className="test-card-subject">{test.subject} • {test.status === 'draft' ? 'Draft' : 'Published'}</p>
                <div className={`test-visibility-badge ${test.isVisible ? 'visible' : 'hidden'}`}>{test.isVisible ? 'Visible to Students' : 'Hidden from Students'}</div>
                <div className="test-assigned-count">Shared with {test.assignedStudents?.length || 0} student(s)</div>
                <p className="test-card-schedule">Created: {formatMessageDateTime(test.createdAt || test.testDateTime)}</p>
                <p className="test-card-description">{test.description || 'No instructions provided.'}</p>
                <div className="test-card-stats"><span>Duration: {test.durationMinutes || 60} min</span><span>Questions: {test.questions?.length || 0}</span><span>Submissions: {test.submissionCount || 0}</span></div>
                {expandedTestId === test._id && Array.isArray(test.questions) && test.questions.length > 0 && (
                  <div className="teacher-test-preview">
                    <h5>Student View Preview</h5>
                    {test.questions.map((question, index) => (
                      <div key={`${test._id}-preview-${index}`} className="teacher-preview-question-card">
                        <p className="teacher-preview-question-title"><strong>Q{index + 1}.</strong> {question.questionText}</p>
                        <div className="teacher-preview-options-list">
                          {optionLabels.map((label, optionIndex) => {
                            const isCorrect = question.correctAnswer === label || Number(question.correctAnswer) === optionIndex;
                            return (
                              <div key={`${test._id}-preview-${index}-${label}`} className={`teacher-preview-option-item ${isCorrect ? 'correct' : ''}`}>
                                <span className="teacher-preview-option-label">{label}.</span>
                                <span className="teacher-preview-option-text">{question.options?.[optionIndex] || ''}</span>
                              </div>
                            );
                          })}
                        </div>
                        {question.solution && (
                          <div className="teacher-preview-solution-block">
                            <span className="teacher-preview-solution-label">Solution</span>
                            <p className="teacher-preview-solution-text">{question.solution}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="test-card-actions">
                  <button className="btn-small" onClick={() => handleToggleViewTest(test._id)}>{expandedTestId === test._id ? 'Hide Test' : 'View Test'}</button>
                  <button className="btn-small btn-success" onClick={() => handleOpenShareModal(test)}>Show</button>
                  <button className="btn-small" onClick={() => handleEditTestClick(test)}><FiEdit /> Edit</button>
                  <button className="btn-small" onClick={() => handleViewTestSubmissions(test._id)}>{selectedTestSubmissionsId === test._id ? 'Hide Submissions' : 'View Submissions'}</button>
                  <button className="btn-small btn-danger" onClick={() => handleDeleteTest(test._id)}><FiTrash2 /> Delete</button>
                </div>
                {selectedTestSubmissionsId === test._id && (
                  <div className="students-table-container" style={{ marginTop: '12px' }}>
                    {loadingSubmissions ? (
                      <div className="info-message">Loading submissions...</div>
                    ) : selectedTestSubmissions.length > 0 ? (
                      <table className="students-table"><thead><tr><th>Student</th><th>Submitted At</th><th>Result</th></tr></thead><tbody>{selectedTestSubmissions.map((submission) => (<tr key={submission._id}><td>{submission.student?.name || 'Student'}</td><td>{formatMessageDateTime(submission.submittedAt)}</td><td>{submission.correctAnswers || 0}/{submission.totalQuestions || submission.test?.questions?.length || 0} correct<div style={{ marginTop: '6px', color: '#64748b', fontSize: '12px' }}>Incorrect: {submission.incorrectAnswers || 0}</div></td></tr>))}</tbody></table>
                    ) : (
                      <div className="info-message">No submissions for this test yet.</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <div className="info-message">No tests created yet.</div>}
      </div>

      {shareModalTest && (
        <div className="test-share-modal-overlay" role="dialog" aria-modal="true">
          <div className="test-share-modal">
            <div className="test-share-modal-header">
              <div>
                <h3>Show Test: {shareModalTest.title}</h3>
                <p>Select a student to share this test. Only eligible students can receive it.</p>
              </div>
              <button type="button" className="test-share-close-btn" onClick={handleCloseShareModal} aria-label="Close share modal">
                <FiX />
              </button>
            </div>

            <div className="test-share-search-row">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by name, email, subject, class"
                value={shareSearch}
                onChange={(event) => setShareSearch(event.target.value)}
              />
            </div>

            {studentsError && <div className="error-message">{studentsError}</div>}

            <div className="test-share-list-wrap">
              {studentsLoading ? (
                <div className="info-message">Loading students...</div>
              ) : popupStudents.length > 0 ? (
                <div className="test-share-students-list">
                  {popupStudents.map((student) => {
                    const isEligible = isStudentEligibleForTest(student, shareModalTest);
                    const isAssigned = (shareModalTest.assignedStudents || []).some((id) => String(id) === String(student.studentId));
                    const isAssigning = assigningStudentId === String(student.studentId);

                    return (
                      <div key={`${shareModalTest._id}-${student.studentId}-${student.subject}-${student.classLevel}`} className="test-share-student-row">
                        <div className="test-share-student-meta">
                          <h4>{student.name || 'Student'}</h4>
                          <p>{student.email || 'No email available'}</p>
                          <div className="test-share-student-tags">
                            <span>{student.subject}</span>
                            <span>{student.classLevel}</span>
                          </div>
                          {!isEligible && (
                            <p className="test-share-eligibility-note">Not eligible for this test subject/class.</p>
                          )}
                        </div>
                        <button
                          type="button"
                          className={`btn-small ${isAssigned ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleShareTestToStudent(student.studentId)}
                          disabled={!isEligible || isAssigning || isAssigned}
                        >
                          {isAssigning ? 'Sharing...' : isAssigned ? 'Already Shared' : 'Show Test'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="info-message">No linked students found.</div>
              )}
            </div>

            <div className="test-share-modal-footer">
              <button type="button" className="btn-secondary" onClick={handleCloseShareModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTestsSection;
