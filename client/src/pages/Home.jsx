import React from 'react';
import Hero from '../components/home/Hero';
import Roadmap from '../components/home/Roadmap';
import Testimonials from '../components/home/Testimonials';
import './Home.css';
import Courses from '../components/home/Courses';
import HowItWorks from '../components/home/HowItWorks';
import DemoVideo from '../components/home/DemoVideo';
import CTASection from '../components/home/CTASection';
import Popup from '../components/common/Popup';

const Home = () => {
  return (
    <div className="home">
      <Popup />
      <Hero />
      <Courses />
      <Roadmap />
      <HowItWorks />
      <DemoVideo />
      <Testimonials />
      <CTASection />
    </div>
  );
};

export default Home;