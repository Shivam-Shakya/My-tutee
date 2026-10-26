import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROGRAM_CATALOG } from '../../constants/programCatalog';
import './Popup.css';
import popupImage from '../../assets/new course.jpg';

const Popup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Show popup on component mount (page load)
  useEffect(() => {
    // Check if popup has been shown in this session
    const hasShownPopup = sessionStorage.getItem('popupShown');

    if (!hasShownPopup) {
      // Delay popup appearance for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('popupShown', 'true');
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, []);

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
  };

  // Handle image click - redirect to courses or explore page
  const handleImageClick = () => {
    setIsVisible(false);
    navigate('/popup-offer', {
      state: {
        courseName: 'SAT',
        programId: PROGRAM_CATALOG.SAT[0]?.id || 'e-Rapid'
      }
    });
  };

  if (!isVisible) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        {/* Close button */}
        <button className="popup-close-btn" onClick={handleClose}>
          ×
        </button>

        {/* Popup content */}
        <div className="popup-content">
          <img
            src={popupImage}
            alt="Explore Tutoring Services"
            className="popup-image"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Popup;
