import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';
import logo from '../../assets/teachers/logo1.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isMobileCourseOpen, setIsMobileCourseOpen] = useState(false);
  const [isMobileProgramOpen, setIsMobileProgramOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const navbarRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  const handleNavLinkClick = () => {
    setIsOpen(false);
    setIsMobileCourseOpen(false);
    setIsMobileProgramOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/', { replace: true });
  };

  const goToDashboard = () => {
    if (user?.role === 'student') {
      navigate('/dashboard/studentdeshboard');
    } else if (user?.role === 'parent') {
      navigate('/dashboard/parentdashboard');
    } else if (user?.role === 'teacher') {
      navigate('/dashboard/teacherdeshboard');
    }
    setIsUserMenuOpen(false);
  };

  const getUserInitial = () => user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <nav className="navbar">
        <div className="top-info-bar">
          <div className="top-info-inner">
            <div className="top-info-left">
              <span className="top-info-item">
                Talk with us:
                <p className="top-info-link">+91 9910344403</p>
              </span>
              <span className="top-info-item">
                Mail Us:
                <p className="top-info-link">
                  info@mytutee.com
                </p>
              </span>
            </div>

            <div className="top-info-right">
              <NavLink to="/contact" className="top-info-link top-info-cta">
                Book a Free Demo class
              </NavLink>
              <span className="top-info-divider" aria-hidden="true">|</span>
              {user ? (
                <button type="button" className="top-info-action" onClick={goToDashboard}>
                  Dashboard
                </button>
              ) : (
                <button type="button" className="top-info-action" onClick={openAuthModal}>
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="navbar-container">

          {/* Logo */}
          <NavLink to="/" className="navbar-logo">
            <img src={logo} alt="Logo" />
          </NavLink>

          <div className="navbar-actions">
            <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>

              <NavLink
                to="/about"
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                About Us
              </NavLink>

              <NavLink
                to="/find-tutors"
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                Find Tutors
              </NavLink>

              {/* Program Dropdown - Mobile Enhanced */}
              <div className="navbar-link dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => setIsMobileProgramOpen(!isMobileProgramOpen)}
                  onMouseEnter={() => setIsProgramOpen(true)}
                  onMouseLeave={() => setIsProgramOpen(false)}
                  aria-expanded={isMobileProgramOpen}
                >
                  <span>Programs</span>
                  <span className={`dropdown-arrow ${isMobileProgramOpen ? 'open' : ''}`}>▾</span>
                </button>

                {(isProgramOpen || isMobileProgramOpen) && (
                  <div className="dropdown-menu">
                    <NavLink to="/english-speaking" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>English Speaking</NavLink>
                    <NavLink to="/test-prep" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>Test Prep</NavLink>
                    <NavLink to="/career-counseling" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>Career Counseling</NavLink>
                    <NavLink to="/academic" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>Academic</NavLink>
                    <NavLink to="/resume-making" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>Resume Making</NavLink>
                    <NavLink to="/visa-assistance" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>Visa Assistance</NavLink>
                    <NavLink to="/placement" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>Placement</NavLink>
                  </div>
                )}
              </div>

              {/* Course Dropdown - Mobile Enhanced */}
              <div className="navbar-link dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => setIsMobileCourseOpen(!isMobileCourseOpen)}
                  onMouseEnter={() => setIsCourseOpen(true)}
                  onMouseLeave={() => setIsCourseOpen(false)}
                  aria-expanded={isMobileCourseOpen}
                >
                  <span>Course</span>
                  <span className={`dropdown-arrow ${isMobileCourseOpen ? 'open' : ''}`}>▾</span>
                </button>

                {(isCourseOpen || isMobileCourseOpen) && (
                  <div className="dropdown-menu">
                    <NavLink to="/SatPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>SAT</NavLink>
                    <NavLink to="/ApPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>AP</NavLink>
                    <NavLink to="/Ib-dpPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>IB DP</NavLink>
                    <NavLink to="/Ib-mypPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>IB MYP</NavLink>
                    <NavLink to="/IgcsePage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>IGCSE</NavLink>
                    <NavLink to="/ActPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>ACT</NavLink>
                    <NavLink to="/PsatPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>PSAT</NavLink>
                    <NavLink to="/EsatPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>ESAT</NavLink>
                    <NavLink to="/TmuaPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>TMUA</NavLink>
                    <NavLink to="/GrePage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>GRE</NavLink>
                    <NavLink to="/GmatPage" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleNavLinkClick}>GMAT</NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/contact"
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                Contact
              </NavLink>
            </div>

            {/* Right side */}
            <div className="navbar-right">

              <div className="navbar-buttons">
                {user && (
                  <div className="user-avatar-container" ref={userMenuRef}>
                    <button
                      className="user-avatar"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      {getUserInitial()}
                    </button>

                    {isUserMenuOpen && (
                      <div className="user-menu">
                        <button className="dashboards-btn" onClick={goToDashboard}>
                          Dashboard
                        </button>

                        <button className="logout-btn" onClick={handleLogout}>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Toggle */}
              <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                <span className={`bar ${isOpen ? 'active' : ''}`}></span>
                <span className={`bar ${isOpen ? 'active' : ''}`}></span>
                <span className={`bar ${isOpen ? 'active' : ''}`}></span>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default Navbar;