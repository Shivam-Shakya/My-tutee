import React from 'react';
import TeacherProfile from '../../../pages/TeacherProfile';

const TeacherProfileSection = ({ onSaveComplete }) => (
  <div className="page-section profile-embedded">
    <TeacherProfile embedded={true} onSaveComplete={onSaveComplete} />
  </div>
);

export default TeacherProfileSection;
