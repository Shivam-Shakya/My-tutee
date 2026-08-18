import React, { useState } from 'react';
import { FiFileText, FiSearch } from 'react-icons/fi';
import './StudentTestsSection.css';

const StudentTestsSection = ({
  testSearch,
  setTestSearch,
  fetchStudentTests,
  testsError,
  testsLoading,
  filteredStudentTests,
  testAnswerDrafts,
  createEmptyTestDraft,
  formatClassLevelLabel,
  formatMessageDateTime,
  testOptionLabels,
  handleSelectTestOption,
  handleSubmitTestAnswer,
  activeTestId,
  activeTestRemainingSeconds,
  handleToggleStudentTest,
  onOpenDoubts
}) => {
  const [expandedSolutions, setExpandedSolutions] = useState({});

  const toggleSolution = (testId, questionIndex) => {
    const key = `${testId}-${questionIndex}`;
    setExpandedSolutions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="student-tests-page">
      <div className="student-tests-header">
        <h2>Tests</h2>
        <p>View and attempt tests from your assigned teachers</p>
      </div>

      <div className="students-filters student-tests-filters">
        <div className="search-filter">
          <FiSearch />
          <input
            type="text"
            placeholder="Search tests by title, subject, teacher"
            value={testSearch}
            onChange={(e) => setTestSearch(e.target.value)}
          />
        </div>
        <button className="view-btn" onClick={() => fetchStudentTests({ withLoading: true })}>Refresh</button>
      </div>

      {testsError && <div className="error-message">{testsError}</div>}

      {testsLoading ? (
        <div className="info-message">Loading tests...</div>
      ) : filteredStudentTests.length > 0 ? (
        <div className="student-tests-list">
          {filteredStudentTests.map((test) => {
            const normalizedQuestions = Array.isArray(test.questions) ? test.questions.filter((question) => question && typeof question === 'object') : [];
            const draft = testAnswerDrafts[test._id] || createEmptyTestDraft();
            const answeredCount = normalizedQuestions.filter((_, index) => Boolean(draft.answers?.[index])).length;
            const isComplete = normalizedQuestions.length > 0 && answeredCount === normalizedQuestions.length;
            const isActiveTest = activeTestId === test._id;
            const isSubmitted = Boolean(test.submission);
            const hasStarted = !isSubmitted && Boolean(draft.startedAt);
            const testDurationMinutes = Number(test.durationMinutes || 60);

            return (
              <div key={test._id} className="student-test-card">
                <div className="student-test-card-header">
                  <h4>{test.title}</h4>
                  <span className="class-level-tag">{formatClassLevelLabel(test.classLevel)}</span>
                </div>
                <p className="student-test-meta">{test.subject} • {test.teacher?.name || 'Teacher'}</p>
                <p className="student-test-meta">Created: {formatMessageDateTime(test.createdAt || test.testDateTime)}</p>
                <p className="student-test-description">{test.description || 'No instructions provided.'}</p>

                <div className="student-test-stats">
                  <span className="student-test-stat-pill">Status: {isSubmitted ? 'Submitted' : hasStarted || isActiveTest ? 'Started' : 'Not Started'}</span>
                  <span className="student-test-stat-pill">Duration: {testDurationMinutes} min</span>
                  <span className="student-test-stat-pill">Total Questions: {normalizedQuestions.length}</span>
                  {test.submission?.submittedAt && <span className="student-test-stat-pill">Submitted: {formatMessageDateTime(test.submission.submittedAt)}</span>}
                </div>

                <div className="student-test-actions-row">
                  <button className="student-test-start-btn" onClick={() => handleToggleStudentTest(test)}>
                    {isActiveTest ? 'Hide Test' : isSubmitted || hasStarted ? 'View Test' : 'Start Test'}
                  </button>
                  {onOpenDoubts && (
                    <button className="student-test-start-btn secondary" onClick={onOpenDoubts}>
                      Discuss with Teacher
                    </button>
                  )}
                </div>

                {isActiveTest && !isSubmitted && (
                  <div className="student-test-timer-bar">
                    <span>Time Left</span>
                    <strong>{formatCountdown(activeTestRemainingSeconds)}</strong>
                  </div>
                )}

                {test.submission && (
                  <div className="test-result-summary">
                    <div className="test-result-pill total">Total: {test.submission.totalQuestions || normalizedQuestions.length}</div>
                    <div className="test-result-pill correct">Correct: {test.submission.correctAnswers || 0}</div>
                    <div className="test-result-pill incorrect">Incorrect: {test.submission.incorrectAnswers || 0}</div>
                  </div>
                )}

                {isActiveTest && (
                  <div className="student-test-questions">
                    {normalizedQuestions.map((question, index) => {
                      const solutionKey = `${test._id}-${index}`;
                      const isSolutionOpen = Boolean(expandedSolutions[solutionKey]);

                      return (
                        <div key={`${test._id}-question-${index}`} className="student-test-question-card">
                          <div className="student-test-question-header">
                            <h5 className="student-test-question-title">Question {index + 1}</h5>
                            {test.submission && (
                              <span className={`student-test-review-badge ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                                {question.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>
                          <p className="student-test-question-text">{question.questionText}</p>
                          <div className="student-test-options-grid">
                            {testOptionLabels.map((label, optionIndex) => {
                              const optionText = question.options?.[optionIndex] || '';
                              const isSelected = (test.submission ? question.selectedOption : draft.answers?.[index]) === label;
                              const isCorrect = test.submission && question.correctAnswer === label;

                              return (
                                <button
                                  key={`${test._id}-${index}-${label}`}
                                  type="button"
                                  className={`student-test-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
                                  onClick={() => !test.submission && handleSelectTestOption(test._id, index, label, normalizedQuestions.length)}
                                  disabled={isSubmitted}
                                >
                                  <span className="student-test-option-label">{label}</span>
                                  <span>{optionText}</span>
                                </button>
                              );
                            })}
                          </div>

                          {isSubmitted && (
                            <div className="student-test-solution-wrap">
                              <button
                                type="button"
                                className="student-test-solution-toggle"
                                onClick={() => toggleSolution(test._id, index)}
                              >
                                {isSolutionOpen ? 'Hide Solution' : 'View Solution'}
                              </button>

                              {isSolutionOpen && (
                                <div className="student-test-solution-panel">
                                  <h6>Solution / Explanation</h6>
                                  <p>{question.solution || 'No solution available for this question.'}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {draft.error && <div className="error-message">{draft.error}</div>}

                {isActiveTest && !isSubmitted && isComplete && (
                  <div className="student-test-actions">
                    <button
                      className="student-test-submit-btn"
                      onClick={() => handleSubmitTestAnswer(test._id)}
                      disabled={draft.submitting}
                    >
                      {draft.submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-full-state full-span">
          <FiFileText className="empty-icon" />
          <h3>No Tests Available</h3>
          <p>Tests assigned by your paid and assigned teachers will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default StudentTestsSection;
