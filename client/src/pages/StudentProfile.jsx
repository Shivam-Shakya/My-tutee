import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './StudentProfile.css';

import { BASE_URL } from "../config";

const API_URL = `${BASE_URL}/courses`;

const DEFAULT_PROFILE = {
  photo: '',
  phone: '',
  location: '',
  dateOfBirth: '',
  school: '',
  currentClass: '',
  board: '',
  learningGoals: '',
  preferredMode: 'Online',
  parentName: '',
  parentPhone: '',
};

const StudentProfile = ({ embedded = false }) => {
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
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef(null);

  const classOptions = ['9', '10', '11', '12', 'Graduation', 'Post Graduation'];
  const boardOptions = ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Board', 'Cambridge', 'Other'];

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
    setSaveError('');
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to save profile');
      }

      const updatedProfile = {
        ...profile,
        ...(payload?.profile || {}),
      };
      setProfile(updatedProfile);

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.profile = updatedProfile;
        storedUser.profileCompleted = true;
        if (payload?.classLevel) {
          storedUser.classLevel = payload.classLevel;
        }
        localStorage.setItem('user', JSON.stringify(storedUser));
        if (updateUser) updateUser(storedUser);
      }

      setEditing(false);
      navigate('/student/course-selection');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'S';

  if (loading) {
    return (
      <div className="profile-page student">
        <div className="profile-loading">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-page student ${embedded ? 'embedded' : ''}`}>
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
              <span className="role-badge">Student</span>
              <div className="hero-meta">
                {profile.currentClass && (
                  <span className="meta-pill">🏫 Class {profile.currentClass}</span>
                )}
                {profile.board && (
                  <span className="meta-pill">📚 {profile.board}</span>
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
              {editing ? (saving ? 'Saving...' : '💾 Save & Continue') : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {saveError && <p className="purchase-error">{saveError}</p>}

        {/* View Mode */}
        {!editing && (
          <div className="profile-view">
            <div className="view-section">
              <h3>📋 Personal Information</h3>
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
                  <span className="view-label">Location</span>
                  <span className="view-value">{profile.location || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Date of Birth</span>
                  <span className="view-value">{profile.dateOfBirth || '—'}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3>🎓 Academic Information</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">School / College</span>
                  <span className="view-value">{profile.school || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Current Class</span>
                  <span className="view-value">{profile.currentClass || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Board</span>
                  <span className="view-value">{profile.board || '—'}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3>🎯 Learning Preferences</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">Preferred Mode</span>
                  <span className="view-value">{profile.preferredMode || '—'}</span>
                </div>
              </div>
              {profile.learningGoals && (
                <div className="view-item full">
                  <span className="view-label">Learning Goals</span>
                  <p className="bio-text">{profile.learningGoals}</p>
                </div>
              )}
            </div>

            <div className="view-section">
              <h3>👨‍👩‍👧 Parent/Guardian Information</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">Parent Name</span>
                  <span className="view-value">{profile.parentName || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">Parent Phone</span>
                  <span className="view-value">{profile.parentPhone || '—'}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3>🚀 Next Step</h3>
              <p className="bio-text">Proceed to the Course Selection page to choose subject and hire a teacher.</p>
              <button type="button" className="proceed-payment-btn" onClick={() => navigate('/student/course-selection')}>
                Open Course Selection
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {editing && (
          <div className="profile-edit">
            {/* Personal Information */}
            <div className="edit-section">
              <h3>📋 Personal Information</h3>
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
                  <label>Location / City</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                  />
                </div>
                <div className="form-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="edit-section">
              <h3>🎓 Academic Information</h3>
              <div className="form-grid">
                <div className="form-field full">
                  <label>School / College Name</label>
                  <input
                    type="text"
                    value={profile.school}
                    onChange={(e) => handleProfileChange('school', e.target.value)}
                    placeholder="e.g. Delhi Public School"
                  />
                </div>
                <div className="form-field">
                  <label>Current Class</label>
                  <select
                    value={profile.currentClass}
                    onChange={(e) => handleProfileChange('currentClass', e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Board</label>
                  <select
                    value={profile.board}
                    onChange={(e) => handleProfileChange('board', e.target.value)}
                  >
                    <option value="">Select Board</option>
                    {boardOptions.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Learning Preferences */}
            <div className="edit-section">
              <h3>🎯 Learning Preferences</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Preferred Learning Mode</label>
                  <select
                    value={profile.preferredMode}
                    onChange={(e) => handleProfileChange('preferredMode', e.target.value)}
                  >
                    <option value="Online">Online (Live)</option>
                    <option value="Offline">Offline (In-person)</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Recorded">Pre-recorded</option>
                  </select>
                </div>
              </div>
              <div className="form-field full">
                <label>Learning Goals</label>
                <textarea
                  value={profile.learningGoals}
                  onChange={(e) => handleProfileChange('learningGoals', e.target.value)}
                  placeholder="What do you want to achieve? (e.g., Improve in Math, Prepare for JEE, etc.)"
                  rows={3}
                />
              </div>
            </div>

            {/* Parent Information */}
            <div className="edit-section">
              <h3>👨‍👩‍👧 Parent/Guardian Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Parent/Guardian Name</label>
                  <input
                    type="text"
                    value={profile.parentName}
                    onChange={(e) => handleProfileChange('parentName', e.target.value)}
                    placeholder="Enter parent's name"
                  />
                </div>
                <div className="form-field">
                  <label>Parent Phone Number</label>
                  <input
                    type="tel"
                    value={profile.parentPhone}
                    onChange={(e) => handleProfileChange('parentPhone', e.target.value)}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
