import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PaymentPage.css';

import { BASE_URL, ORIGIN_URL } from "../config";

const API_PARENT = `${BASE_URL}/parents`;
const API_ORIGIN = ORIGIN_URL;
const PAYMENTS_API_URL = `${BASE_URL}/payments`;

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const course = state?.course;
  const teacher = state?.teacher;
  const selectedCourse = state?.selectedCourse;
  const selectedSubSubject = state?.selectedSubSubject;
  const programEnrollment = state?.programEnrollment;
  const satProgram = state?.satProgram;
  const coursePurchase = state?.coursePurchase;
  const normalizedProgramEnrollment = programEnrollment || (satProgram
    ? {
      courseName: 'SAT',
      programId: satProgram.id,
      programName: satProgram.name,
      description: satProgram.description,
      fee: Number(satProgram.fee || 0),
      duration: satProgram.duration || '',
      features: Array.isArray(satProgram.features) ? satProgram.features : []
    }
    : null);
  const isProgramEnrollmentPayment = Boolean(normalizedProgramEnrollment?.programName);
  const isCoursePurchasePayment = Boolean(coursePurchase?.mainCourse && Array.isArray(coursePurchase?.subCourses));

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const getDashboardPath = () => {
    if (currentUser?.role === 'teacher') return '/dashboard/teacherdeshboard';
    if (currentUser?.role === 'parent') return '/dashboard/parentdashboard';
    return '/dashboard/studentdeshboard';
  };

  const dashboardPath = getDashboardPath();
  const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;
  const resolvedTeacherId = teacher?._id || teacher?.id || null;
  const resolvedCourseName = course?.name || course?.courseName || selectedCourse?.name || '';
  const payableAmount = isProgramEnrollmentPayment
    ? Number(normalizedProgramEnrollment.fee || 0)
    : isCoursePurchasePayment
      ? coursePurchase.totalAmount
      : Number(course?.fee || course?.price || 0);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      navigate(dashboardPath);
    }, 1600);
    return () => clearTimeout(timer);
  }, [success, navigate, dashboardPath]);

  if (!(isProgramEnrollmentPayment || isCoursePurchasePayment || (course && teacher))) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <h2>Invalid Payment</h2>
          <p>No course or teacher selected.</p>
          <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Simulate payment gateway processing (in production, this would be actual payment gateway)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isProgramEnrollmentPayment) {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser) {
          const updatedUser = {
            ...storedUser,
            profile: {
              ...(storedUser.profile || {}),
              selectedCourse: {
                id: `${normalizedProgramEnrollment.courseName}-program`,
                name: normalizedProgramEnrollment.courseName,
                icon: '🎯'
              },
              selectedSubSubject: {
                name: normalizedProgramEnrollment.programName,
                selectionType: 'program'
              },
              enrolledProgram: {
                id: normalizedProgramEnrollment.programId,
                name: normalizedProgramEnrollment.programName,
                description: normalizedProgramEnrollment.description,
                fee: Number(normalizedProgramEnrollment.fee || 0),
                courseName: normalizedProgramEnrollment.courseName,
                duration: normalizedProgramEnrollment.duration || ''
              }
            },
            profileCompleted: true
          };

          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (updateUser) updateUser(updatedUser);
        }

        setProcessing(false);
        setSuccess(true);
        return;
      }

      if (isCoursePurchasePayment) {
        const paymentResponse = await fetch(`${PAYMENTS_API_URL}/create-course-purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            mainCourse: coursePurchase.mainCourse,
            subCourses: coursePurchase.subCourses,
            totalAmount: coursePurchase.totalAmount,
            paymentMethod,
            transactionDetails: {
              cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) : null,
              upiId: paymentMethod === 'upi' ? upiId : null
            }
          })
        });

        const paymentData = await paymentResponse.json();
        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || 'Payment failed');
        }

        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser) {
          const updatedUser = {
            ...storedUser,
            profile: {
              ...(storedUser.profile || {}),
              ...(paymentData.profile || {})
            },
            profileCompleted: true
          };

          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (updateUser) updateUser(updatedUser);
        }

        setProcessing(false);
        setSuccess(true);
        return;
      }

      // Keep amount strictly aligned with selected teacher pricing from previous step.
        const amount = Number(course?.fee || course?.price || 0);
        const subject = course?.subSubjectName || course?.courseName || course?.name || teacher?.assignedSubject || 'General';

        if (!resolvedTeacherId) {
          throw new Error('Teacher information is missing. Please go back and select a tutor again.');
        }

      if (amount <= 0) {
        throw new Error('Invalid teacher price. Please go back and select a teacher with a configured price.');
      }

      // Create payment record (this also creates assignment internally)
      const paymentResponse = await fetch(`${PAYMENTS_API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: resolvedTeacherId,
          subject: subject,
          selectedCourse: selectedCourse || null,
          selectedSubSubject: selectedSubSubject || { name: subject },
          amount: amount,
          paymentMethod: paymentMethod,
          paymentType: 'monthly',
          validityMonths: 1,
          transactionDetails: {
            cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) : null,
            upiId: paymentMethod === 'upi' ? upiId : null
          }
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || 'Payment failed');
      }

      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (storedUser && paymentData?.profile) {
        const updatedUser = {
          ...storedUser,
          profile: {
            ...(storedUser.profile || {}),
            ...paymentData.profile
          },
          profileCompleted: true
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (updateUser) updateUser(updatedUser);
      }

      setProcessing(false);
      setSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      setProcessing(false);
      setError(err.message || 'Payment failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="payment-page">
        <div className="payment-container success-container">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          {isProgramEnrollmentPayment ? (
            <p>
              You have successfully enrolled in <strong>{normalizedProgramEnrollment.programName}</strong>.
            </p>
          ) : isCoursePurchasePayment ? (
            <p>
              You have successfully purchased <strong>{coursePurchase.mainCourse.name}</strong>.
            </p>
          ) : (
            <p>You have successfully enrolled in <strong>{resolvedCourseName || 'Selected Subject'}</strong> with <strong>{teacher.name}</strong>.</p>
          )}
          <div className="success-details">
            <div className="detail-row">
              <span>Course</span>
              <span>{isProgramEnrollmentPayment ? normalizedProgramEnrollment.courseName : isCoursePurchasePayment ? coursePurchase.mainCourse.name : (resolvedCourseName || 'Selected Subject')}</span>
            </div>
            <div className="detail-row">
              <span>{isProgramEnrollmentPayment ? 'Program' : isCoursePurchasePayment ? 'Sub-Courses' : 'Teacher'}</span>
              <span>
                {isProgramEnrollmentPayment
                  ? normalizedProgramEnrollment.programName
                  : isCoursePurchasePayment
                    ? `${coursePurchase.subCourses.length} selected`
                    : teacher.name}
              </span>
            </div>
            {!isProgramEnrollmentPayment && (
              <div className="detail-row">
                <span>Payment For</span>
                <span>
                  {isCoursePurchasePayment
                    ? 'Course Package'
                    : course.name}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span>Amount Paid</span>
              <span>{formatCurrency(payableAmount)}</span>
            </div>
          </div>
          <button className="back-btn" onClick={() => navigate(dashboardPath)}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="back-arrow" onClick={() => navigate(-1)}>← Back</button>

        <div className="payment-layout">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-card">
              <div className="summary-course">
                <h4>{isProgramEnrollmentPayment ? normalizedProgramEnrollment.programName : isCoursePurchasePayment ? coursePurchase.mainCourse.name : course.name}</h4>
                <span className="summary-subject">{isProgramEnrollmentPayment ? normalizedProgramEnrollment.courseName : isCoursePurchasePayment ? 'Course Package' : course.subject}</span>
              </div>
              {isProgramEnrollmentPayment && (
                <div className="summary-teacher">
                  <div className="summary-avatar">{normalizedProgramEnrollment.courseName.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="summary-teacher-name">{normalizedProgramEnrollment.programName}</p>
                    <p className="summary-teacher-label">Program Enrollment</p>
                  </div>
                </div>
              )}
              {!isProgramEnrollmentPayment && !isCoursePurchasePayment && (
                <div className="summary-teacher">
                  <div className="summary-avatar">{teacher.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="summary-teacher-name">{teacher.name}</p>
                    <p className="summary-teacher-label">Your Teacher</p>
                  </div>
                </div>
              )}
              {isCoursePurchasePayment && (
                <div className="summary-subcourses">
                  {coursePurchase.subCourses.map((subCourse) => (
                    <div key={subCourse.id} className="summary-subcourses-row">
                      <span>{subCourse.name}</span>
                      <span>{formatCurrency(subCourse.price)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Course Fee</span>
                <span>{formatCurrency(payableAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(payableAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <h3>Payment Details</h3>

            {/* Payment Method Tabs */}
            <div className="payment-tabs">
              <button
                className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
                type="button"
              >
                💳 Card
              </button>
              <button
                className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
                type="button"
              >
                📱 UPI
              </button>
              <button
                className={`payment-tab ${paymentMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qr')}
                type="button"
              >
                📷 QR Code
              </button>
            </div>

            <form onSubmit={handlePayment} className="payment-form">

              {/* Card Payment */}
              {paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Payment */}
              {paymentMethod === 'upi' && (
                <div className="upi-section">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="upi-apps">
                    <p className="upi-label">Or pay using</p>
                    <div className="upi-app-grid">
                      <button type="button" className="upi-app-btn" onClick={() => setUpiId('gpay')}>Google Pay</button>
                      <button type="button" className="upi-app-btn" onClick={() => setUpiId('phonepe')}>PhonePe</button>
                      <button type="button" className="upi-app-btn" onClick={() => setUpiId('paytm')}>Paytm</button>
                      <button type="button" className="upi-app-btn" onClick={() => setUpiId('bhim')}>BHIM</button>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code Payment */}
              {paymentMethod === 'qr' && (
                <div className="qr-section">
                  <div className="qr-code-box">
                    <div className="qr-placeholder">
                      <div className="qr-grid">
                        {/* {[...Array(49)].map((_, i) => (
                          <div key={i} className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`}></div>
                        ))} */}
                      </div>
                    </div>
                    <p className="qr-instruction">Scan this QR code with any UPI app to pay</p>
                    <div className="qr-amount">
                      <span>Amount:</span>
                      <strong>{formatCurrency(payableAmount)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="payment-error">
                  <span>❌</span> {error}
                </div>
              )}

              <button type="submit" className="pay-btn" disabled={processing}>
                {processing ? 'Processing...' : `Pay ${formatCurrency(payableAmount)}`}
              </button>

              <p className="secure-text">🔒 Your payment is secure and encrypted</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
