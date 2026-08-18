import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { COURSE_CATALOG } from '../constants/courseCatalog';
import { BASE_URL } from "../config";
import './TeacherProfile.css';

// Toast Notification Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
    </div>
  );
};

const API_URL = `${BASE_URL}/courses`;

const DEFAULT_PROFILE = {
  photo: '',
  phone: '',
  location: '',
  qualifications: '',
  experience: '',
  preferredClasses: [],
  boards: [],
  teachingMode: 'Online',
  languages: [],
  availability: '',
  bio: '',
  skills: {
    conceptBuilding: false,
    examPreparation: false,
    doubtSolving: false,
    homeworkHelp: false,
    competitiveExam: false,
  },
  courseOfferings: [],
};

const normalizeCurrencyInput = (value) => value.replace(/[^0-9]/g, '');

const deriveSubjectsFromOfferings = (courseOfferings = []) => {
  const subjects = new Set();
  courseOfferings.forEach((offering) => {
    (offering.selectedSubSubjects || []).forEach((subSubject) => {
      if (subSubject?.name) subjects.add(subSubject.name);
    });
  });
  return Array.from(subjects);
};

const TeacherProfile = ({ onSaveComplete, embedded = false }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewUser = location.state?.isNewUser || false;
  const profileNotCompleted = !user?.profileCompleted;

  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });
  const [subjects, setSubjects] = useState(user?.subjects || []);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isNewUser || profileNotCompleted);
  const [toast, setToast] = useState(null);
  const [originalProfile, setOriginalProfile] = useState({ ...DEFAULT_PROFILE });
  const fileInputRef = useRef(null);

  const classOptions = ['9th', '10th', '11th', '12th'];
  const boardOptions = ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Board', 'Cambridge', 'Other'];
  const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'];
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
            setOriginalProfile((prev) => ({ ...prev, ...data.profile }));
            if (data.profile.photo) setPhotoPreview(data.profile.photo);
            setCourseOfferings(Array.isArray(data.profile.courseOfferings) ? data.profile.courseOfferings : []);
          }
          if (Array.isArray(data.subjects) && data.subjects.length > 0) {
            setSubjects(data.subjects);
          } else {
            setSubjects(deriveSubjectsFromOfferings(data.profile?.courseOfferings || []));
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

  useEffect(() => {
    if (!editing) return;
    setSubjects(deriveSubjectsFromOfferings(courseOfferings));
  }, [courseOfferings, editing]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value) => {
    const current = profile[field] || [];
    if (current.includes(value)) {
      handleProfileChange(field, current.filter((v) => v !== value));
    } else {
      handleProfileChange(field, [...current, value]);
    }
  };

  const handleSkillToggle = (skill) => {
    setProfile((prev) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: !prev.skills[skill] },
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

  const handleToggleCourse = (course) => {
    setCourseOfferings((prev) => {
      const alreadySelected = prev.some((offering) => offering.courseId === course.id);
      if (alreadySelected) {
        return prev.filter((offering) => offering.courseId !== course.id);
      }
      return [
        ...prev,
        {
          courseId: course.id,
          courseName: course.name,
          fullCourseFee: '',
          selectedSubSubjects: []
        }
      ];
    });
  };

  const handleCourseFeeChange = (courseId, value) => {
    const sanitized = normalizeCurrencyInput(value);
    setCourseOfferings((prev) => prev.map((offering) => (
      offering.courseId === courseId
        ? { ...offering, fullCourseFee: sanitized }
        : offering
    )));
  };

  const handleToggleSubSubject = (courseId, subSubject) => {
    setCourseOfferings((prev) => prev.map((offering) => {
      if (offering.courseId !== courseId) return offering;

      const exists = (offering.selectedSubSubjects || []).some((item) => item.id === subSubject.id);
      if (exists) {
        return {
          ...offering,
          selectedSubSubjects: offering.selectedSubSubjects.filter((item) => item.id !== subSubject.id)
        };
      }

      return {
        ...offering,
        selectedSubSubjects: [
          ...(offering.selectedSubSubjects || []),
          { id: subSubject.id, name: subSubject.name, fee: '' }
        ]
      };
    }));
  };

  const handleSubSubjectFeeChange = (courseId, subSubjectId, value) => {
    const sanitized = normalizeCurrencyInput(value);
    setCourseOfferings((prev) => prev.map((offering) => {
      if (offering.courseId !== courseId) return offering;

      return {
        ...offering,
        selectedSubSubjects: (offering.selectedSubSubjects || []).map((subSubject) => (
          subSubject.id === subSubjectId
            ? { ...subSubject, fee: sanitized }
            : subSubject
        ))
      };
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const normalizedOfferings = courseOfferings.map((offering) => ({
        ...offering,
        fullCourseFee: Number(offering.fullCourseFee || 0),
        selectedSubSubjects: (offering.selectedSubSubjects || []).map((subSubject) => ({
          ...subSubject,
          fee: Number(subSubject.fee || 0)
        }))
      }));
      const derivedSubjects = deriveSubjectsFromOfferings(normalizedOfferings);
      const profileToSave = {
        ...profile,
        courseOfferings: normalizedOfferings
      };

      // Save profile
      await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: profileToSave }),
      });

      // Save subjects
      await fetch(`${API_URL}/subjects`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subjects: derivedSubjects }),
      });

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.profile = profileToSave;
        storedUser.subjects = derivedSubjects;
        storedUser.profileCompleted = true;
        localStorage.setItem('user', JSON.stringify(storedUser));
        if (updateUser) updateUser(storedUser);
      }

      setEditing(false);
      setToast({ message: '✨ Profile saved successfully!', type: 'success' });
      setProfile(profileToSave);
      setSubjects(derivedSubjects);
      setOriginalProfile(profileToSave);

      // If embedded mode with callback, call it
      if (embedded && onSaveComplete) {
        onSaveComplete();
        return;
      }

      // Redirect to dashboard if first time completing profile
      if (isNewUser || profileNotCompleted) {
        navigate('/dashboard/teacherdeshboard');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setToast({ message: '❌ Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'T';

  if (loading) {
    return (
      <div className={`profile-page ${embedded ? 'embedded' : ''}`}>
        <div className="profile-loading">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify({ ...profile, courseOfferings }) !== JSON.stringify(originalProfile)
    || JSON.stringify(subjects) !== JSON.stringify(user?.subjects || []);
  const isSaveDisabled = saving || !hasChanges;

  return (
    <div className={`profile-page ${embedded ? 'embedded' : ''}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
              <h1 className="hero-name">{user?.name}</h1>
              <span className="role-badge">👨‍🏫 Teacher</span>
              <div className="hero-meta">
                {subjects.length > 0 && (
                  <div className="subjects-pills">
                    {subjects.map((subject) => (
                      <span key={subject} className="subject-pill">{subject}</span>
                    ))}
                  </div>
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
              className={`edit-profile-btn ${editing ? 'save' : ''} ${isSaveDisabled ? 'disabled' : ''}`}
              onClick={() => (editing ? handleSaveProfile() : setEditing(true))}
              disabled={isSaveDisabled}
              title={isSaveDisabled && editing ? 'No changes to save' : ''}
            >
              {editing ? (saving ? '⏳ Saving...' : '💾 Save Profile') : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* View Mode */}
        {!editing && (
          <div className="profile-view">
            <div className="view-section">
              <h3 className="section-title">📋 Basic Information</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">📧 Email</span>
                  <span className="view-value">{user?.email || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">📞 Phone</span>
                  <span className="view-value">{profile.phone || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">📍 Location</span>
                  <span className="view-value">{profile.location || '—'}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3 className="section-title">🎓 Professional Details</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">📚 Qualifications</span>
                  <span className="view-value">{profile.qualifications || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">⏱️ Experience</span>
                  <span className="view-value">{profile.experience || '—'}</span>
                </div>
              </div>
              <div className="view-item full">
                <span className="view-label view-label-full">📖 Subjects</span>
                <div className="tags-display">
                  {subjects.length > 0 ? subjects.map((s) => (
                    <span key={s} className="tag tag-subject">{s}</span>
                  )) : <span className="view-value">—</span>}
                </div>
              </div>
              <div className="view-item full">
                <span className="view-label view-label-full">💰 Course & Sub-Subject Fees</span>
                {(courseOfferings || []).length > 0 ? (
                  <div className="offerings-view-list">
                    {courseOfferings.map((offering) => (
                      <div key={offering.courseId} className="offering-view-card">
                        <div className="offering-view-head">
                          <strong>{offering.courseName}</strong>
                          <span>Full Course Fee: Rs {Number(offering.fullCourseFee || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="offering-view-subs">
                          {(offering.selectedSubSubjects || []).length > 0 ? (
                            offering.selectedSubSubjects.map((subSubject) => (
                              <div key={subSubject.id} className="offering-view-sub-item">
                                <span>{subSubject.name}</span>
                                <span>Rs {Number(subSubject.fee || 0).toLocaleString('en-IN')}</span>
                              </div>
                            ))
                          ) : (
                            <span className="view-value">No sub-subject selected</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <span className="view-value">—</span>}
              </div>
            </div>

            <div className="view-section">
              <h3 className="section-title">🎯 Teaching Preferences</h3>
              <div className="view-grid">
                <div className="view-item">
                  <span className="view-label">🟢 Teaching Mode</span>
                  <span className="view-value">{profile.teachingMode || '—'}</span>
                </div>
                <div className="view-item">
                  <span className="view-label">⏰ Availability</span>
                  <span className="view-value">{profile.availability || '—'}</span>
                </div>
              </div>
              <div className="view-item full">
                <span className="view-label view-label-full">👥 Preferred Classes</span>
                <div className="tags-display">
                  {(profile.preferredClasses || []).length > 0 ? profile.preferredClasses.map((c) => (
                    <span key={c} className="tag tag-class">{c}</span>
                  )) : <span className="view-value">—</span>}
                </div>
              </div>
              <div className="view-item full">
                <span className="view-label view-label-full">🏫 Boards</span>
                <div className="tags-display">
                  {(profile.boards || []).length > 0 ? profile.boards.map((b) => (
                    <span key={b} className="tag tag-board">{b}</span>
                  )) : <span className="view-value">—</span>}
                </div>
              </div>
              <div className="view-item full">
                <span className="view-label view-label-full">🗣️ Languages</span>
                <div className="tags-display">
                  {(profile.languages || []).length > 0 ? profile.languages.map((l) => (
                    <span key={l} className="tag tag-language">{l}</span>
                  )) : <span className="view-value">—</span>}
                </div>
              </div>
            </div>

            <div className="view-section">
              <h3 className="section-title">📝 About Me</h3>
              <p className="bio-text">{profile.bio || 'No bio added yet.'}</p>
            </div>

            {profile.skills && Object.values(profile.skills).some(Boolean) && (
              <div className="view-section">
                <h3 className="section-title">✨ Specializations</h3>
                <div className="tags-display">
                  {profile.skills.conceptBuilding && <span className="tag tag-skill">🧠 Concept Building</span>}
                  {profile.skills.examPreparation && <span className="tag tag-skill">📝 Exam Preparation</span>}
                  {profile.skills.doubtSolving && <span className="tag tag-skill">❓ Doubt Solving</span>}
                  {profile.skills.homeworkHelp && <span className="tag tag-skill">📚 Homework Help</span>}
                  {profile.skills.competitiveExam && <span className="tag tag-skill">🏆 Competitive Exam Guidance</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {editing && (
          <div className="profile-edit">
            {/* Basic Information */}
            <div className="edit-section">
              <h3 className="section-title">📋 Basic Information</h3>
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
              </div>
            </div>

            {/* Professional Details */}
            <div className="edit-section">
              <h3 className="section-title">🎓 Professional Details</h3>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Qualifications</label>
                  <textarea
                    value={profile.qualifications}
                    onChange={(e) => handleProfileChange('qualifications', e.target.value)}
                    placeholder="e.g. M.Sc Mathematics, B.Ed, CTET Qualified"
                    rows={2}
                  />
                </div>
                <div className="form-field">
                  <label>Teaching Experience</label>
                  <input
                    type="text"
                    value={profile.experience}
                    onChange={(e) => handleProfileChange('experience', e.target.value)}
                    placeholder="e.g. 5+ years"
                  />
                </div>
              </div>

              {/* Courses, Sub-Subjects, and Fees */}
              <div className="form-field full">
                <label>Courses, Sub-Subjects & Fee Mapping</label>
                <p className="form-hint">Select multiple courses, choose sub-subjects, and set separate fees for full course and each sub-subject.</p>

                <div className="course-offering-grid">
                  {COURSE_CATALOG.map((course) => {
                    const activeOffering = (courseOfferings || []).find((offering) => offering.courseId === course.id);
                    return (
                      <div key={course.id} className={`course-offering-card ${activeOffering ? 'active' : ''}`}>
                        <label className="course-offering-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(activeOffering)}
                            onChange={() => handleToggleCourse(course)}
                          />
                          <span>{course.icon} {course.name}</span>
                        </label>

                        {activeOffering && (
                          <div className="course-offering-body">
                            <div className="form-field">
                              <label>Full Course Fee (Rs)</label>
                              <input
                                type="text"
                                value={activeOffering.fullCourseFee || ''}
                                onChange={(e) => handleCourseFeeChange(course.id, e.target.value)}
                                placeholder="Enter full course fee"
                              />
                            </div>

                            <div className="offering-subsubject-list">
                              {course.subCourses.map((subSubject) => {
                                const selectedSubSubject = (activeOffering.selectedSubSubjects || []).find((item) => item.id === subSubject.id);
                                return (
                                  <div key={subSubject.id} className="offering-subsubject-item">
                                    <label className="offering-subsubject-toggle">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(selectedSubSubject)}
                                        onChange={() => handleToggleSubSubject(course.id, subSubject)}
                                      />
                                      <span>{subSubject.name}</span>
                                    </label>
                                    {selectedSubSubject && (
                                      <input
                                        type="text"
                                        value={selectedSubSubject.fee || ''}
                                        onChange={(e) => handleSubSubjectFeeChange(course.id, subSubject.id, e.target.value)}
                                        placeholder="Sub-subject fee"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Teaching Preferences */}
            <div className="edit-section">
              <h3 className="section-title">🎯 Teaching Preferences</h3>
              <div className="form-field full">
                <label>Preferred Classes</label>
                <div className="chip-selector">
                  {classOptions.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      className={`chip ${(profile.preferredClasses || []).includes(cls) ? 'active' : ''}`}
                      onClick={() => handleMultiSelect('preferredClasses', cls)}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field full">
                <label>Boards</label>
                <div className="chip-selector">
                  {boardOptions.map((board) => (
                    <button
                      key={board}
                      type="button"
                      className={`chip ${(profile.boards || []).includes(board) ? 'active' : ''}`}
                      onClick={() => handleMultiSelect('boards', board)}
                    >
                      {board}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Teaching Mode</label>
                  <select
                    value={profile.teachingMode}
                    onChange={(e) => handleProfileChange('teachingMode', e.target.value)}
                  >
                    <option value="Online">Online (Live)</option>
                    <option value="Offline">Offline (In-person)</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Recorded">Pre-recorded</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Availability</label>
                  <input
                    type="text"
                    value={profile.availability}
                    onChange={(e) => handleProfileChange('availability', e.target.value)}
                    placeholder="e.g. Mon–Fri, 4 PM – 8 PM"
                  />
                </div>
              </div>

              <div className="form-field full">
                <label>Languages Known</label>
                <div className="chip-selector">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`chip ${(profile.languages || []).includes(lang) ? 'active' : ''}`}
                      onClick={() => handleMultiSelect('languages', lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="edit-section">
              <h3 className="section-title">📝 About Me</h3>
              <div className="form-field full">
                <label>Short Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Write a short introduction about yourself and your teaching style..."
                  rows={4}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="edit-section">
              <h3 className="section-title">✨ Skills & Specializations</h3>
              <p className="form-hint">Select areas where you specialize:</p>
              <div className="skills-grid">
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.skills?.conceptBuilding || false}
                    onChange={() => handleSkillToggle('conceptBuilding')}
                  />
                  <span className="skill-icon">🧠</span>
                  <span>Concept Building</span>
                </label>
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.skills?.examPreparation || false}
                    onChange={() => handleSkillToggle('examPreparation')}
                  />
                  <span className="skill-icon">📝</span>
                  <span>Exam Preparation</span>
                </label>
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.skills?.doubtSolving || false}
                    onChange={() => handleSkillToggle('doubtSolving')}
                  />
                  <span className="skill-icon">❓</span>
                  <span>Doubt Solving</span>
                </label>
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.skills?.homeworkHelp || false}
                    onChange={() => handleSkillToggle('homeworkHelp')}
                  />
                  <span className="skill-icon">📚</span>
                  <span>Homework Help</span>
                </label>
                <label className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.skills?.competitiveExam || false}
                    onChange={() => handleSkillToggle('competitiveExam')}
                  />
                  <span className="skill-icon">🏆</span>
                  <span>Competitive Exam Guidance</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProfile;
