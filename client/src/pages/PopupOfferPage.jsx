import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PROGRAM_CATALOG, getProgramById } from '../constants/programCatalog';
import { buildProgramPaymentState } from '../utils/programEnrollment';
import popupImage from '../assets/new course.jpg';
import './PopupOfferPage.css';

const PopupOfferPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const courseName = state?.courseName || 'SAT';
  const defaultProgram = PROGRAM_CATALOG[courseName]?.[0] || PROGRAM_CATALOG.SAT[0];
  const selectedProgram = useMemo(() => {
    return getProgramById(courseName, state?.programId) || defaultProgram;
  }, [courseName, state?.programId, defaultProgram]);

  if (!selectedProgram) {
    return (
      <div className="popup-offer-page">
        <div className="popup-offer-card">
          <h1>Offer unavailable</h1>
          <button type="button" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    navigate('/payment', {
      state: buildProgramPaymentState(courseName, selectedProgram)
    });
  };

  return (
    <div className="popup-offer-page">
      <section className="popup-offer-card">
        <img src={popupImage} alt={`${courseName} banner`} className="popup-offer-banner" />
        <div className="popup-offer-content">
          <p className="popup-offer-tag">Special {courseName} Program</p>
          <h1>{selectedProgram.name}</h1>
          <p className="popup-offer-description">{selectedProgram.description}</p>

          <div className="popup-offer-meta">
            <div>
              <span>Course</span>
              <strong>{courseName}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{selectedProgram.duration || 'Flexible'}</strong>
            </div>
            <div>
              <span>Program Fee</span>
              <strong>Rs {Number(selectedProgram.fee || 0).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="popup-offer-actions">
            <button type="button" className="popup-offer-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
            <button type="button" className="popup-offer-primary" onClick={handleEnroll}>
              Enroll Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PopupOfferPage;
