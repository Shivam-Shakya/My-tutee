import React from 'react';
import { NavLink } from 'react-router-dom';
import './Hero.css';
import heroImage from '../../assets/Group.png';
import heroBackground from '../../assets/bg-header-bg.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1>Educating For <br></br> Global Competence</h1>
          <p>
            An enriching learning experience with the best <br></br> test-prep assistance for ACT, SAT,<br></br>AP, IB, IGCSE and Pre-College Prep.
          </p>
          <div className="hero-buttons">
            <NavLink to="/about" className="btns-outline">Explore Now</NavLink>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Students and Teacher" />
        </div>
      </div>
      <div className="hero-overlays">
        <img src={heroBackground} alt="Hero Background" className="herobackgrounds" />
      </div>
    </section>
  );
};

export default Hero;