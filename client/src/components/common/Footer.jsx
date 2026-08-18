import React from "react";
import "./Footer.css";
import logo from "../../assets/teachers/logo1.jpeg";
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: FaFacebookF, url: "#" },
  { label: "Twitter", icon: FaTwitter, url: "#" },
  { label: "Instagram", icon: FaInstagram, url: "#" },
  { label: "LinkedIn", icon: FaLinkedinIn, url: "#" },
];

const Footer = () => {
  const handleCourseNavigation = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-col brand">
          <img src={logo} alt="TeachLearn Logo" className="footer-logo" />
          <p>
            Empowering learners worldwide with high-quality education,
            expert mentors, and industry-ready courses.
          </p>
          <div className="social-icons">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.url}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* COURSES */}
        <div className="footer-col">
          <h4>Courses</h4>
          <ul>
            <li><Link to="/SatPage" onClick={handleCourseNavigation}>SAT</Link></li>
            <li><Link to="/ApPage" onClick={handleCourseNavigation}>AP</Link></li>
            <li><Link to="/Ib-dpPage" onClick={handleCourseNavigation}>IB DP</Link></li>
            <li><Link to="/Ib-mypPage" onClick={handleCourseNavigation}>IB MYP</Link></li>
            <li><Link to="/IgcsePage" onClick={handleCourseNavigation}>IGCSE</Link></li>
            <li><Link to="/ActPage" onClick={handleCourseNavigation}>ACT</Link></li>
            <li><Link to="/PsatPage" onClick={handleCourseNavigation}>PSAT</Link></li>
            <li><Link to="/EsatPage" onClick={handleCourseNavigation}>ESAT</Link></li>
            <li><Link to="/TmuaPage" onClick={handleCourseNavigation}>TMUA</Link></li>
          </ul>
        </div>

        {/* TEACHERS */}
        <div className="footer-col">
          <h4>Teachers</h4>
          <ul>
            <li><a href="#">Expert Mentors</a></li>
            <li><a href="#">Become a Teacher</a></li>
            <li><a href="#">Teaching Model</a></li>
            <li><a href="#">Top Rated</a></li>
          </ul>
        </div>

        {/* COMPANY */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>© 2026 MyTutee. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
