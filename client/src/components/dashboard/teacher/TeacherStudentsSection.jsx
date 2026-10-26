import React from 'react';
import { FiSearch } from 'react-icons/fi';

const TeacherStudentsSection = ({
  onBack,
  studentSearch,
  setStudentSearch,
  studentSubjectFilter,
  setStudentSubjectFilter,
  studentSubjectOptions,
  fetchTeacherStudents,
  studentsLastUpdated,
  studentsError,
  studentsLoading,
  filteredStudents
}) => (
  <div className="page-section">
    <div className="section-header">
      <h2 className="page-title">Student List</h2>
      <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
    </div>
    <div className="students-filters">
      <div className="search-filter">
        <FiSearch />
        <input
          type="text"
          placeholder="Search by name, email, class, subject..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
        />
      </div>
      <select className="course-filter" value={studentSubjectFilter} onChange={(e) => setStudentSubjectFilter(e.target.value)}>
        <option value="">All Subjects</option>
        {studentSubjectOptions.map((subject) => (
          <option key={subject} value={subject}>{subject}</option>
        ))}
      </select>
      <button className="view-btn" onClick={() => fetchTeacherStudents({ withLoading: true })}>Refresh</button>
    </div>

    {studentsLastUpdated && <p className="students-last-updated">Updated: {studentsLastUpdated.toLocaleTimeString()}</p>}
    {studentsError && <div className="error-message">{studentsError}</div>}

    <div className="students-table-container">
      <table className="students-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Class Level</th>
            <th>Subject</th>
            <th>Joining Date</th>
          </tr>
        </thead>
        <tbody>
          {studentsLoading ? (
            <tr>
              <td colSpan="5" className="students-empty-row">Loading students...</td>
            </tr>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="student-cell">
                  <div className="student-avatar">{student.name?.charAt(0) || 'S'}</div>
                  <span>{student.name}</span>
                </td>
                <td>{student.email}</td>
                <td>{student.classLevel === 'Graduation' || student.classLevel === 'Post Graduation' ? student.classLevel : `Class ${student.classLevel}`}</td>
                <td>{student.subject}</td>
                <td>{new Date(student.enrolledAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="students-empty-row">
                No active paid students assigned to you yet for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default TeacherStudentsSection;
