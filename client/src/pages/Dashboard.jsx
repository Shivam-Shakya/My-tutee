import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import '../App.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <div>Please login</div>;

  const getDashboardComponent = () => {
    switch (user.role) {
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
      case 'parent':
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        {getDashboardComponent()}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;