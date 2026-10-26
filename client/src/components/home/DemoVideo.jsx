import React from "react";
import { Link } from "react-router-dom";
import "./DemoVideo.css";
import demoSideImage from "../../assets/teachers/teach3.jpg";

const DemoVideo = () => {
  return (
    <section className="demo-video-section" id="demo-video">
      <div className="demo-video-wrap">
        <div className="demo-video-text">
          <h2>Experience Learning with MyTutee</h2>
          <p>
            Discover interactive learning that keeps students engaged, connect with expert tutors who guide every step,
            and enjoy personalized classes designed around each learner&apos;s pace and goals.
          </p>

          <div className="demo-actions">
            <Link className="demo-cta-btn" to="/contact">
              Book a Free Demo
            </Link>
          </div>
        </div>

        <div className="demo-image-side">
          <img
            src={demoSideImage}
            alt="Virtual classroom session with teacher and student learning online"
            className="demo-side-image"
            loading="lazy"
          />
          <div className="demo-image-badge">Interactive Virtual Classrooms</div>
        </div>
      </div>
    </section>
  );
};

export default DemoVideo;
