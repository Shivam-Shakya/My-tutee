import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

/* ───── Country list with codes & phone prefixes ───── */
const COUNTRIES = [
  { name: "India", code: "in", phone: "+91" },
  { name: "United States", code: "us", phone: "+1" },
  { name: "United Kingdom", code: "gb", phone: "+44" },
  { name: "Canada", code: "ca", phone: "+1" },
  { name: "Australia", code: "au", phone: "+61" },
  { name: "Germany", code: "de", phone: "+49" },
  { name: "France", code: "fr", phone: "+33" },
  { name: "Japan", code: "jp", phone: "+81" },
  { name: "South Korea", code: "kr", phone: "+82" },
  { name: "Brazil", code: "br", phone: "+55" },
  { name: "Mexico", code: "mx", phone: "+52" },
  { name: "South Africa", code: "za", phone: "+27" },
  { name: "Nigeria", code: "ng", phone: "+234" },
  { name: "UAE", code: "ae", phone: "+971" },
  { name: "Saudi Arabia", code: "sa", phone: "+966" },
  { name: "Singapore", code: "sg", phone: "+65" },
  { name: "Malaysia", code: "my", phone: "+60" },
  { name: "Indonesia", code: "id", phone: "+62" },
  { name: "Pakistan", code: "pk", phone: "+92" },
  { name: "Bangladesh", code: "bd", phone: "+880" },
  { name: "Sri Lanka", code: "lk", phone: "+94" },
  { name: "Nepal", code: "np", phone: "+977" },
  { name: "China", code: "cn", phone: "+86" },
  { name: "Russia", code: "ru", phone: "+7" },
  { name: "Italy", code: "it", phone: "+39" },
  { name: "Spain", code: "es", phone: "+34" },
  { name: "Netherlands", code: "nl", phone: "+31" },
  { name: "Sweden", code: "se", phone: "+46" },
  { name: "Switzerland", code: "ch", phone: "+41" },
  { name: "New Zealand", code: "nz", phone: "+64" },
];

const SignUp = ({ onClose, onSwitchToLogin, isModal }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  /* ─── Common form fields ─── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ─── Teacher-specific fields ─── */
  const [subject, setSubject] = useState("");

  /* ─── Parent-specific fields ─── */
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentLinkingError, setStudentLinkingError] = useState("");

  /* ─── OTP state ─── */
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signup, sendEmailOtp, verifyEmailOtp } = useAuth();
  const navigate = useNavigate();

  /* ─── Auto-detect country from IP ─── */
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code) {
          const code = data.country_code.toLowerCase();
          const match = COUNTRIES.find((c) => c.code === code);
          if (match) {
            setPhoneCode(match.phone);
          }
        }
      } catch {
        /* ignore */
      }
    };
    detect();
  }, []);

  const roles = [
    {
      key: "student",
      label: "Student",
      icon: "🎓",
      description: "Access courses, track progress and learn from the best teachers.",
    },
    {
      key: "teacher",
      label: "Teacher",
      icon: "👨‍🏫",
      description: "Create courses, manage students and grow your teaching career.",
    },
    {
      key: "parent",
      label: "Parent",
      icon: "👨‍👩‍👧",
      description: "Monitor your child's progress, attendance and performance.",
    },
  ];

  /* ─── Validation ─── */
  const validateForm = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Email is invalid";
    if (!emailVerified) e.email = "Please verify your email first";

    if (!phone.trim()) e.phone = "Phone number is required";

    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";

    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";

    // Teacher-specific validation
    if (selectedRole === "teacher" && !subject.trim()) {
      e.subject = "Subject is required";
    }

    // Parent-specific validation
    if (selectedRole === "parent") {
      if (!studentName.trim()) e.studentName = "Student's name is required";
      if (!studentEmail.trim()) e.studentEmail = "Student's email is required";
      else if (!/\S+@\S+\.\S+/.test(studentEmail)) e.studentEmail = "Student's email is invalid";
    }

    return e;
  };

  /* ─── OTP handlers ─── */
  const handleSendEmailOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors((p) => ({ ...p, email: "Enter a valid email first" }));
      return;
    }
    setEmailOtpLoading(true);
    const res = await sendEmailOtp(email, selectedRole);
    setEmailOtpLoading(false);
    if (res.error) {
      setErrors((p) => ({ ...p, email: res.error }));
    } else {
      setEmailOtpSent(true);
      setErrors((p) => { const n = { ...p }; delete n.email; return n; });
    }
  };

  const handleVerifyEmailOtp = async () => {
    const res = await verifyEmailOtp(email, emailOtp);
    if (res.error) {
      setErrors((p) => ({ ...p, emailOtp: res.error }));
    } else {
      setEmailVerified(true);
      setErrors((p) => { const n = { ...p }; delete n.emailOtp; delete n.email; return n; });
    }
  };

  /* ─── Submit ─── */
  const handleSignup = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    const result = await signup({
      name,
      email,
      emailVerified,
      phone: phoneCode + phone,
      password,
      role: selectedRole,
      // Teacher-specific fields
      subject: selectedRole === "teacher" ? subject : "",
      // Parent-specific fields
      studentName: selectedRole === "parent" ? studentName : "",
      studentEmail: selectedRole === "parent" ? studentEmail : "",
    });

    if (result.error) {
      setLoading(false);
      if (selectedRole === "parent" && /Student not found|Student name does not match/i.test(result.error)) {
        setStudentLinkingError(result.error);
        setErrors((prev) => ({ ...prev, studentEmail: result.error }));
      } else {
        setErrors({ general: result.error });
      }
      return;
    }

    setLoading(false);
    if (isModal && onClose) onClose();

    if (selectedRole === "teacher") {
      navigate("/profile/teacher", { state: { isNewUser: true } });
    } else if (selectedRole === "parent") {
      navigate("/dashboard/parentdashboard", { state: { isNewUser: true } });
    } else {
      navigate("/profile/student", { state: { isNewUser: true } });
    }
  };

  /* ─── Reset ─── */
  const handleBack = () => {
    setSelectedRole(null);
    setErrors({});
    setName(""); setEmail(""); setPhone("");
    setPassword(""); setConfirmPassword("");
    setSubject("");
    setStudentName(""); setStudentEmail(""); setStudentLinkingError("");
    setEmailOtp(""); setEmailVerified(false); setEmailOtpSent(false);
  };

  /* ================= ROLE SELECTION SCREEN ================= */
  if (!selectedRole) {
    return (
      <div className="auth-container">
        <div className="auth-card role-selection">
          {/* Brand */}
          <div className="auth-brand-strip">
            <span className="brand-logo">MT</span>
            <span className="brand-name">myTutee</span>
          </div>

          <div className="auth-header">
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">
              Join thousands of learners and educators. Pick a role that best describes you to get a personalised experience.
            </p>
          </div>

          <div className="role-buttons">
            {roles.map((role) => (
              <button
                key={role.key}
                className="role-btn"
                onClick={() => setSelectedRole(role.key)}
              >
                <span className="role-icon">{role.icon}</span>
                <div className="role-text">
                  <span className="role-label">{role.label}</span>
                  <div className="role-desc-wrapper">
                    <span className="role-desc">{role.description}</span>
                    <svg className="role-arrow" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="auth-divider"><span>Already registered?</span></div>

          <p className="auth-switch-text">
            Have an account?{' '}
            {isModal ? (
              <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Sign In Instead</a>
            ) : (
              <a href="/login">Sign In Instead</a>
            )}
          </p>

          <p className="auth-footer-note">
            By creating an account you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    );
  }

  /* ================= SIGNUP FORM ================= */
  const roleLabel = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);

  return (
    <div className="auth-container">
      <div className="auth-card signup-card-wide">
        <button className="back-btns" onClick={handleBack}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Change Role
        </button>

        {/* ── Header ── */}
        <div className="auth-header">
          <h2>{roleLabel} Registration</h2>
          <p className="auth-subtitle">
            Fill in the details below to create your {roleLabel.toLowerCase()} account. Fields marked with <strong>*</strong> are required.
          </p>
        </div>

        {/* ── Error banner ── */}
        {errors.general && (
          <div className="error-banner">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="auth-form-body">


          {/* Full Name */}
          <div className="form-groups">
            <label>Full Name *</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? 'input-error' : ''} />
            </div>
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email + OTP */}
          <div className="form-groups">
            <label>Email Address *</label>
            <div className="input-with-btn">
              <div className="input-icon-wrapper" style={{ flex: 1 }}>
                <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); setEmailOtpSent(false); }}
                  disabled={emailVerified}
                  className={errors.email ? 'input-error' : ''}
                />
              </div>
              {!emailVerified && (
                <button type="button" className="otp-btn" onClick={handleSendEmailOtp} disabled={emailOtpLoading}>
                  {emailOtpLoading ? "Sending…" : emailOtpSent ? "Resend OTP" : "Send OTP"}
                </button>
              )}
              {emailVerified && <span className="verified-badge">✓ Verified</span>}
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
            {!emailVerified && !errors.email && <span className="field-hint">We'll send a 6-digit code to verify this email.</span>}
          </div>

          {emailOtpSent && !emailVerified && (
            <div className="form-groups otp-group">
              <label>Email Verification Code</label>
              <div className="input-with-btn">
                <input placeholder="Enter 6-digit OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} maxLength={6} />
                <button type="button" className="otp-btn verify" onClick={handleVerifyEmailOtp}>Verify</button>
              </div>
              {errors.emailOtp && <span className="field-error">{errors.emailOtp}</span>}
            </div>
          )}

          {/* Phone */}
          <div className="form-groups">
            <label>Mobile / Phone Number *</label>
            <div className={`phone-input-row ${errors.phone ? 'input-error' : ''}`}>
              <select
                className="phone-code-selects"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
              >
                <option value="">+</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.phone}>
                    {c.phone}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-groups">
              <label>Password *</label>
              <div className="input-icon-wrapper">
                <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'input-error' : ''}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="form-groups">
              <label>Confirm Password *</label>
              <div className="input-icon-wrapper">
                <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle confirm password">
                  {showConfirmPassword ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* ═══════ SECTION: Teacher Subject ═══════ */}
          {selectedRole === "teacher" && (
            <>
              <div className="form-groups">
                <label>Subject *</label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <input
                    placeholder="e.g., Mathematics, Physics, English"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={errors.subject ? 'input-error' : ''}
                  />
                </div>
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>
            </>
          )}

          {/* ═══════ SECTION: Parent Child Info ═══════ */}
          {selectedRole === "parent" && (
            <>
              <div className="form-row">
                <div className="form-groups">
                  <label>Student's Name *</label>
                  <div className="input-icon-wrapper">
                    <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter child's full name"
                      className={errors.studentName ? 'input-error' : ''}
                    />
                  </div>
                  {errors.studentName && <span className="field-error">{errors.studentName}</span>}
                </div>
                <div className="form-groups">
                  <label>Student's Email ID *</label>
                  <div className="input-icon-wrapper">
                    <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <input
                      value={studentEmail}
                      onChange={(e) => {
                        setStudentEmail(e.target.value);
                        setStudentLinkingError("");
                      }}
                      placeholder="Enter student's registered email"
                      type="email"
                      className={errors.studentEmail ? 'input-error' : ''}
                    />
                  </div>
                  {errors.studentEmail && <span className="field-error">{errors.studentEmail}</span>}
                  {studentLinkingError && <span className="field-error">{studentLinkingError}</span>}
                  <small className="field-hint" style={{ marginTop: '8px', color: '#666', display: 'block' }}>
                    Enter the email address your child has registered with to link their account.
                  </small>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="btn-loader"></span> : `Create ${roleLabel} Account`}
          </button>
        </form>

        <div className="auth-divider"><span>Already registered?</span></div>

        <p className="auth-switch-text">
          Have an account?{' '}
          {isModal ? (
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Sign In Instead</a>
          ) : (
            <a href="/login">Sign In Instead</a>
          )}
        </p>
      </div>
    </div>
  );
};

export default SignUp;
