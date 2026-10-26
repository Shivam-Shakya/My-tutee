import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ onClose, onSwitchToSignup, isModal }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotForm, setForgotForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotStatus, setForgotStatus] = useState({
    otpSent: false,
    otpVerified: false,
    loadingSendOtp: false,
    loadingVerifyOtp: false,
    loadingReset: false,
    error: '',
    success: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const {
    login,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetForgotPassword
  } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(username)) newErrors.username = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.error) {
      setErrors({ general: result.error });
      return;
    }

    if (isModal && onClose) onClose();
    const role = result.user?.role;
    if (role === 'teacher') navigate('/dashboard/teacherdeshboard');
    else if (role === 'parent') navigate('/dashboard/parentdashboard');
    else navigate('/dashboard/studentdeshboard');
  };

  const resetForgotState = () => {
    setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    setForgotStatus({
      otpSent: false,
      otpVerified: false,
      loadingSendOtp: false,
      loadingVerifyOtp: false,
      loadingReset: false,
      error: '',
      success: ''
    });
  };

  const openForgotPassword = (e) => {
    e.preventDefault();
    setErrors({});
    setShowForgotPassword(true);
    resetForgotState();
  };

  const backToLogin = (e) => {
    e.preventDefault();
    setShowForgotPassword(false);
    resetForgotState();
  };

  const onForgotFieldChange = (field, value) => {
    setForgotForm((prev) => ({ ...prev, [field]: value }));
    setForgotStatus((prev) => ({ ...prev, error: '', success: '' }));

    if (field === 'email') {
      setForgotStatus((prev) => ({ ...prev, otpSent: false, otpVerified: false }));
    }
    if (field === 'otp') {
      setForgotStatus((prev) => ({ ...prev, otpVerified: false }));
    }
  };

  const handleSendOtp = async () => {
    const normalizedEmail = forgotForm.email.trim();
    if (!normalizedEmail) {
      setForgotStatus((prev) => ({ ...prev, error: 'Email is required' }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setForgotStatus((prev) => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setForgotStatus((prev) => ({ ...prev, loadingSendOtp: true, error: '', success: '' }));
    const result = await sendForgotPasswordOtp(normalizedEmail);

    if (result.error) {
      setForgotStatus((prev) => ({ ...prev, loadingSendOtp: false, error: result.error }));
      return;
    }

    setForgotStatus((prev) => ({
      ...prev,
      loadingSendOtp: false,
      otpSent: true,
      otpVerified: false,
      success: result.message || 'OTP sent to email. Please check your inbox.'
    }));
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail = forgotForm.email.trim();
    const otpValue = forgotForm.otp.trim();

    if (!normalizedEmail) {
      setForgotStatus((prev) => ({ ...prev, error: 'Email is required' }));
      return;
    }
    if (!otpValue) {
      setForgotStatus((prev) => ({ ...prev, error: 'OTP is required' }));
      return;
    }

    setForgotStatus((prev) => ({ ...prev, loadingVerifyOtp: true, error: '', success: '' }));
    const result = await verifyForgotPasswordOtp(normalizedEmail, otpValue);

    if (result.error) {
      setForgotStatus((prev) => ({ ...prev, loadingVerifyOtp: false, error: result.error }));
      return;
    }

    setForgotStatus((prev) => ({
      ...prev,
      loadingVerifyOtp: false,
      otpVerified: true,
      success: 'OTP verified. Please set your new password.'
    }));
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = forgotForm.email.trim();
    const otpValue = forgotForm.otp.trim();

    if (!normalizedEmail) {
      setForgotStatus((prev) => ({ ...prev, error: 'Email is required' }));
      return;
    }

    if (!otpValue) {
      setForgotStatus((prev) => ({ ...prev, error: 'OTP is required' }));
      return;
    }

    if (!forgotStatus.otpVerified) {
      setForgotStatus((prev) => ({ ...prev, error: 'Please verify OTP first' }));
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setForgotStatus((prev) => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }

    setForgotStatus((prev) => ({ ...prev, loadingReset: true, error: '', success: '' }));
    const result = await resetForgotPassword(
      normalizedEmail,
      otpValue,
      forgotForm.newPassword,
      forgotForm.confirmPassword
    );

    if (result.error) {
      setForgotStatus((prev) => ({ ...prev, loadingReset: false, error: result.error }));
      return;
    }

    setForgotStatus((prev) => ({
      ...prev,
      loadingReset: false,
      success: 'Password reset successfully'
    }));

    setUsername(normalizedEmail);
    setPassword('');
    setTimeout(() => {
      setShowForgotPassword(false);
      resetForgotState();
    }, 1200);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* ── Branding strip ── */}
        <div className="auth-brand-strip">
          <span className="brand-logo">MT</span>
          <span className="brand-name">myTutee</span>
        </div>

        {/* ── Header ── */}
        <div className="auth-header">
          <h2>Welcome Back!</h2>
          <p className="auth-subtitle">
            Sign in to access your personalised dashboard, courses and learning progress.
          </p>
        </div>

        {/* ── Trust badges ── */}
        <div className="trust-badges">
          <span className="trust-badge">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Secure Login
          </span>
          <span className="trust-badge">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            24/7 Access
          </span>
          <span className="trust-badge">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Instant Dashboard
          </span>
        </div>

        {showForgotPassword ? (
          <>
            {forgotStatus.error && (
              <div className="error-banner">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{forgotStatus.error}</span>
              </div>
            )}

            {forgotStatus.success && (
              <div className="success-banner">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span>{forgotStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="auth-form-body">
              <div className="form-groups">
                <label>Email ID</label>
                <div className="input-with-btn">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={forgotForm.email}
                    onChange={(e) => onForgotFieldChange('email', e.target.value)}
                  />
                  <button
                    type="button"
                    className="otp-btn"
                    onClick={handleSendOtp}
                    disabled={forgotStatus.loadingSendOtp}
                  >
                    {forgotStatus.loadingSendOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div className="form-groups">
                <label>OTP Verification</label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={forgotForm.otp}
                    onChange={(e) => onForgotFieldChange('otp', e.target.value)}
                  />
                  <button
                    type="button"
                    className="otp-btn verify"
                    onClick={handleVerifyOtp}
                    disabled={!forgotStatus.otpSent || forgotStatus.loadingVerifyOtp}
                  >
                    {forgotStatus.loadingVerifyOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                {forgotStatus.otpVerified && <span className="verified-badge">OTP Verified</span>}
              </div>

              <div className="form-groups">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={forgotForm.newPassword}
                  onChange={(e) => onForgotFieldChange('newPassword', e.target.value)}
                  disabled={!forgotStatus.otpVerified}
                />
              </div>

              <div className="form-groups">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotForm.confirmPassword}
                  onChange={(e) => onForgotFieldChange('confirmPassword', e.target.value)}
                  disabled={!forgotStatus.otpVerified}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={!forgotStatus.otpVerified || forgotStatus.loadingReset}>
                {forgotStatus.loadingReset ? <span className="btn-loader"></span> : 'Submit'}
              </button>

              <div className="forgot-actions">
                <a href="#" className="forgot-link" onClick={backToLogin}>Back to login</a>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* ── Error ── */}
            {errors.general && (
              <div className="error-banner">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{errors.general}</span>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="auth-form-body">
              <div className="form-groups">
                <label>Email Address</label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrors({}); }}
                    className={errors.username ? 'input-error' : ''}
                  />
                </div>
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              <div className="form-groups">
                <div className="label-row">
                  <label>Password</label>
                  <a href="#" className="forgot-link" onClick={openForgotPassword}>Forgot password?</a>
                </div>
                <div className="input-icon-wrapper">
                  <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
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

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <span className="btn-loader"></span> : 'Sign In to Your Account'}
              </button>
            </form>
          </>
        )}

        {/* ── Footer ── */}
        <div className="auth-divider"><span>New here?</span></div>

        <p className="auth-switch-text">
          Don't have an account yet?{' '}
          {isModal ? (
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>Create a Free Account</a>
          ) : (
            <a href="/signup">Create a Free Account</a>
          )}
        </p>

        <p className="auth-footer-note">
          By signing in, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
