import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../config";
import "./FindTutorsPage.css";

const API_URL = `${BASE_URL}/courses/public-tutors`;

const FindTutorsPage = () => {
  const [courseInput, setCourseInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [allTutors, setAllTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTutors = async (keyword = "", location = "") => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (location.trim()) params.set("location", location.trim());

      const response = await fetch(`${API_URL}?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch tutors");
      }

      setAllTutors(Array.isArray(payload.tutors) ? payload.tutors : []);
    } catch (fetchError) {
      console.error("Failed to fetch tutors:", fetchError);
      setAllTutors([]);
      setError(fetchError.message || "Unable to load tutors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const filteredTutors = useMemo(() => {
    return allTutors;
  }, [allTutors]);

  const handleSearch = async (event) => {
    event.preventDefault();
    await fetchTutors(courseInput, locationInput);
  };

  return (
    <div className="find-tutors-page">
      <section className="find-tutors-hero">
        <div className="find-tutors-container">
          <h1>Find Tutors</h1>
          <p>Search by subject and location to discover expert teachers for personalized learning support.</p>

          <form className="find-tutors-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Course or Subject (e.g., SAT, Physics)"
              value={courseInput}
              onChange={(event) => setCourseInput(event.target.value)}
            />
            <input
              type="text"
              placeholder="Location (City / Area)"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="find-tutors-results">
        <div className="find-tutors-container">
          <div className="find-tutors-results-head">
            <h2>Available Tutors</h2>
            <span>{loading ? "Searching..." : `${filteredTutors.length} result(s)`}</span>
          </div>

          {error && (
            <div className="find-tutors-empty">
              <h3>Unable to load tutors</h3>
              <p>{error}</p>
            </div>
          )}

          {!error && loading ? (
            <div className="find-tutors-empty">
              <h3>Loading tutors...</h3>
              <p>Please wait while we fetch matching profiles.</p>
            </div>
          ) : !error && filteredTutors.length === 0 ? (
            <div className="find-tutors-empty">
              <h3>No tutors found for selected criteria</h3>
              <p>Try another course/sub-subject keyword or location to see matching tutor profiles.</p>
            </div>
          ) : (
            <div className="tutors-grid">
              {filteredTutors.map((tutor) => (
                <Link key={tutor.id} to={`/find-tutors/${tutor.id}`} className="tutor-card">
                  <div className="tutor-card-body">
                    <h3>{tutor.name}</h3>
                    <p className="tutor-subject">
                      {tutor.offerings?.[0]?.type === "course"
                        ? `${tutor.offerings[0].courseName} (Full Course)`
                        : tutor.offerings?.[0]?.subSubjectName || "Subject not specified"}
                    </p>
                    <p className="tutor-location">{tutor.location}</p>
                    <p className="tutor-description">
                      {tutor.offerings?.[0]?.type === "course"
                        ? `Course: ${tutor.offerings[0].courseName}`
                        : `Course: ${tutor.offerings?.[0]?.courseName || "N/A"}`}
                    </p>
                    <div className="tutor-meta">
                      <span>{tutor.experience} exp.</span>
                      <span>
                        Fee: Rs {Number(tutor.offerings?.[0]?.fee || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FindTutorsPage;
