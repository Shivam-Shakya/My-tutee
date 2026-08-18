import React from 'react';
import StudentProfile from '../../../pages/StudentProfile';

const StudentProfileSection = ({ onSaveComplete }) => (
  <div className="page-section profile-embedded">
    <StudentProfile embedded={true} onSaveComplete={onSaveComplete} />
  </div>
);

export default StudentProfileSection;
