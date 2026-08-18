import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './ParentProfile.css';

import { BASE_URL, ORIGIN_URL } from "../config";

const API_PARENT = `${BASE_URL}/parents`;
const API_ORIGIN = ORIGIN_URL;

const DEFAULT_PROFILE = {
  photo: '',
  phone: '',
  location: '',
  occupation: '',
  alternatePhone: '',
  preferredContactTime: '',
  communicationPreference: 'Email',
  childName: '',
  childGrade: '',
  childSchool: '',
  relationToChild: 'Parent',
  emergencyContact: '',
  notificationPreferences: {
    gradeUpdates: true,
    attendanceAlerts: true,
    teacherMessages: true,
    paymentReminders: true,
    eventNotifications: true,
  },
};

const ParentProfile = ({ onSaveComplete, embedded = false }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewUser = location.state?.isNewUser || false;
  const profileNotCompleted = !user?.profileCompleted;

  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isNewUser || profileNotCompleted);
  const fileInputRef = useRef(null);

  const gradeOptions = ['Pre-School', 'Kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const relationOptions = ['Parent', 'Guardian', 'Grandparent', 'Sibling', 'Other'];
  const contactTimeOptions = ['Morning (8 AM - 12 PM)', 'Afternoon (12 PM - 5 PM)', 'Evening (5 PM - 9 PM)', 'Anytime'];
  const communicationOptions = ['Email', 'Phone Call', 'SMS', 'WhatsApp'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile((prev) => ({ ...prev, ...data.profile }));
            if (data.profile.photo) setPhotoPreview(data.profile.photo);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (pref) => {
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [pref]: !prev.notificationPreferences[pref],
      },
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        handleProfileChange('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      // Save profile
      await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile }),
      });

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.profile = profile;
        storedUser.profileCompleted = true;
        localStorage.setItem('user', JSON.stringify(storedUser));
        if (updateUser) updateUser(storedUser);
      }

      setEditing(false);

      // If embedded mode with callback, call it
      if (embedded && onSaveComplete) {
        onSaveComplete();
        return;
      }

      // Redirect to dashboard if first time completing profile
      if (isNewUser || profileNotCompleted) {
        navigate('/dashboard/parentdashboard');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'P';

  if (loading) {
    return (
      <div className={`profile-page parent ${embedded ? 'embedded' : ''}`}>
        <div className="profile-loading">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-page parent ${embedded ? 'embedded' : ''}`}>
      <div className="profile-container">
        {/* Profile Hero Card */}
        <div className="profile-hero">
          <div className="profile-hero__left">
            <div
              className="profile-avatar"
              onClick={() => editing && fileInputRef.current?.click()}
              title={editing ? 'Click to change photo' : ''}
            >
              {photoPreview ? (
                <img src={photoPreview} alt={user?.name} />
              ) : (
                <span className="avatar-initials">{initials}</span>
              )}
              {editing && <div className="avatar-overlay">📷</div>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="profile-hero__info">
              <h3>{user?.name}</h3>
              <span className="role-badge">Parent</span>
              <div className="hero-meta">
                {profile.childName && (
                  <span className="meta-pill">👨‍👧 {profile.childName}</span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-hero__actions">
            {editing && !isNewUser && !profileNotCompleted && (
              <button className="edit-profile-btn cancel" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
            <button
              className={`edit-profile-btn ${editing ? 'save' : ''}`}
              onClick={() => (editing ? handleSaveProfile() : setEditing(true))}
              disabled={saving}
            >
              {editing ? (saving ? 'Saving...' : '💾 Save Profile') : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* View Mode */}
        {!editing && (
          <div className="profile-view">
            <div className="view-section">
              <h3>📋 Contact Information</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">Email</span>
                  <span className="view-value">{user?.email || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Phone</span>
                  <span className="view-value">{profile.phone || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Alternate Phone</span>
                  <span className="view-value">{profile.alternatePhone || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Location</span>
                  <span className="view-value">{profile.location || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Occupation</span>
                  <span className="view-value">{profile.occupation || '—'}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3>👨‍👧 Child Information</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">Child's Name</span>
                  <span className="view-value">{profile.childName || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Grade</span>
                  <span className="view-value">{profile.childGrade || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">School</span>
                  <span className="view-value">{profile.childSchool || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Relation to Child</span>
                  <span className="view-value">{profile.relationToChild || '—'}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3>📞 Communication Preferences</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">Preferred Contact Time</span>
                  <span className="view-value">{profile.preferredContactTime || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Communication Method</span>
                  <span className="view-value">{profile.communicationPreference || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Emergency Contact</span>
                  <span className="view-value">{profile.emergencyContact || '—'}</span>
                </div>
              </div>
            </div>

            {profile.notificationPreferences && Object.values(profile.notificationPreferences).some(Boolean) && (
              <div className="view-section">
                <h3>🔔 Notification Settings</h3>
                <div className="tags-display">
                  {profile.notificationPreferences.gradeUpdates && <span className="tag highlight">Grade Updates</span>}
                  {profile.notificationPreferences.attendanceAlerts && <span className="tag highlight">Attendance Alerts</span>}
                  {profile.notificationPreferences.teacherMessages && <span className="tag highlight">Teacher Messages</span>}
                  {profile.notificationPreferences.paymentReminders && <span className="tag highlight">Payment Reminders</span>}
                  {profile.notificationPreferences.eventNotifications && <span className="tag highlight">Event Notifications</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {editing && (
          <div className="profile-edit">
            {/* Contact Information */}
            <div className="edit-section">
              <h3>📋 Contact Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div className="form-field">
                  <label>Alternate Phone</label>
                  <input
                    type="tel"
                    value={profile.alternatePhone}
                    onChange={(e) => handleProfileChange('alternatePhone', e.target.value)}
                    placeholder="e.g. +91 9876543211"
                  />
                </div>
                <div className="form-field">
                  <label>Location / City</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                  />
                </div>
                <div className="form-field">
                  <label>Occupation</label>
                  <input
                    type="text"
                    value={profile.occupation}
                    onChange={(e) => handleProfileChange('occupation', e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>
            </div>

            {/* Child Information */}
            <div className="edit-section">
              <h3>👨‍👧 Child Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Child's Name</label>
                  <input
                    type="text"
                    value={profile.childName}
                    onChange={(e) => handleProfileChange('childName', e.target.value)}
                    placeholder="Enter child's name"
                  />
                </div>
                <div className="form-field">
                  <label>Grade</label>
                  <select
                    value={profile.childGrade}
                    onChange={(e) => handleProfileChange('childGrade', e.target.value)}
                  >
                    <option value="">Select Grade</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>School Name</label>
                  <input
                    type="text"
                    value={profile.childSchool}
                    onChange={(e) => handleProfileChange('childSchool', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="form-field">
                  <label>Relation to Child</label>
                  <select
                    value={profile.relationToChild}
                    onChange={(e) => handleProfileChange('relationToChild', e.target.value)}
                  >
                    {relationOptions.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="edit-section">
              <h3>📞 Communication Preferences</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Preferred Contact Time</label>
                  <select
                    value={profile.preferredContactTime}
                    onChange={(e) => handleProfileChange('preferredContactTime', e.target.value)}
                  >
                    <option value="">Select Time</option>
                    {contactTimeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Communication Method</label>
                  <select
                    value={profile.communicationPreference}
                    onChange={(e) => handleProfileChange('communicationPreference', e.target.value)}
                  >
                    {communicationOptions.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field full">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    value={profile.emergencyContact}
                    onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                    placeholder="Name and phone number"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="edit-section">
              <h3>🔔 Notification Preferences</h3>
              <p className="form-hint">Select the notifications you want to receive:</p>
              <div className="notification-grid">
                <label className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences?.gradeUpdates || false}
                    onChange={() => handleNotificationToggle('gradeUpdates')}
                  />
                  <span className="notif-icon">📊</span>
                  <span>Grade Updates</span>
                </label>
                <label className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences?.attendanceAlerts || false}
                    onChange={() => handleNotificationToggle('attendanceAlerts')}
                  />
                  <span className="notif-icon">✅</span>
                  <span>Attendance Alerts</span>
                </label>
                <label className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences?.teacherMessages || false}
                    onChange={() => handleNotificationToggle('teacherMessages')}
                  />
                  <span className="notif-icon">💬</span>
                  <span>Teacher Messages</span>
                </label>
                <label className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences?.paymentReminders || false}
                    onChange={() => handleNotificationToggle('paymentReminders')}
                  />
                  <span className="notif-icon">💳</span>
                  <span>Payment Reminders</span>
                </label>
                <label className="notification-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences?.eventNotifications || false}
                    onChange={() => handleNotificationToggle('eventNotifications')}
                  />
                  <span className="notif-icon">🎉</span>
                  <span>Event Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentProfile;
