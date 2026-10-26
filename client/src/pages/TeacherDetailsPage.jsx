import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./TeacherDetailsPage.css";

import { BASE_URL } from "../config";

const API_URL = `${BASE_URL}/courses/public-tutors`;

const TeacherDetailsPage = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/${tutorId}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Tutor not found");
        }

        setTutor(payload.tutor || null);
      } catch (fetchError) {
        console.error("Failed to fetch tutor details:", fetchError);
        setTutor(null);
        setError(fetchError.message || "Tutor not found");
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [tutorId]);

  if (loading) {
    return (
      <div className="teacher-details-page">
        <div className="teacher-details-container teacher-not-found">
          <h2>Loading tutor profile...</h2>
          <p>Please wait while we fetch tutor details.</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="teacher-details-page">
        <div className="teacher-details-container teacher-not-found">
          <h2>Tutor not found</h2>
          <p>{error || "The tutor profile you requested is not available."}</p>
          <Link to="/find-tutors" className="back-to-tutors">Back to Find Tutors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-details-page">
      <div className="teacher-details-container">
        <Link to="/find-tutors" className="back-to-tutors">Back to Find Tutors</Link>

        <section className="teacher-profile-card">
          <div className="teacher-profile-content">
            <h1>{tutor.name}</h1>
            <p className="teacher-main-subject">{tutor.offerings?.[0]?.courseName || "Tutor"}</p>

            <div className="teacher-profile-grid">
              <p><strong>Subjects:</strong> {(tutor.offerings || []).map((offering) => offering.subSubjectName || offering.courseName).join(", ") || "N/A"}</p>
              <p><strong>Experience:</strong> {tutor.experience}</p>
              <p><strong>Qualification:</strong> {tutor.qualifications || "N/A"}</p>
              <p><strong>Location:</strong> {tutor.location}</p>
            </div>

            <p className="teacher-about">{tutor.bio || "No additional profile summary provided."}</p>

            <div className="teacher-profile-grid" style={{ marginTop: 14 }}>
              {(tutor.offerings || []).slice(0, 6).map((offering, index) => (
                <p key={`${offering.courseName}-${offering.subSubjectName}-${index}`}>
                  <strong>{offering.type === "course" ? `${offering.courseName} (Full Course)` : `${offering.courseName} - ${offering.subSubjectName}`}</strong>: Rs {Number(offering.fee || 0).toLocaleString("en-IN")}
                </p>
              ))}
            </div>

            <div className="teacher-action-buttons">
              <a className="action-btn message" href="/contact">Message</a>
              <a className="action-btn phone" href={`tel:${String(tutor.phone || "").replace(/\s+/g, "")}`}>Phone</a>
                <Link className="action-btn pay" to="/payment" state={tutor.offerings?.[0] ? { 
                  teacher: { ...tutor, _id: tutor.id }, 
                  course: tutor.offerings?.[0],
                  selectedCourse: tutor.offerings?.[0]?.courseName ? {
                    id: tutor.offerings[0].courseName,
                    name: tutor.offerings[0].courseName
                  } : null,
                  selectedSubSubject: tutor.offerings?.[0]?.subSubjectName ? {
                    id: tutor.offerings[0].subSubjectName,
                    name: tutor.offerings[0].subSubjectName,
                    fee: tutor.offerings[0].fee
                  } : null
                } : null}>Pay</Link>
            </div>
          </div>
        </section>

        <section className="teacher-reviews">
          <h2>Profile Summary</h2>
          <div className="teacher-review-card">
            <h3>{tutor.name}</h3>
            <p className="review-rating">Teaching Mode: {tutor.teachingMode || "Online"}</p>
            <p>This tutor appears based on selected course/sub-subject and location criteria.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDetailsPage;
