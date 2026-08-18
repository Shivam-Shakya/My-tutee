import React, { useState } from "react";
import { BASE_URL } from "../../config";
import "./CTASection.css";

const API_URL = `${BASE_URL}/contact`;

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to subscribe right now.");
      }

      setStatus({ type: "success", message: payload?.message || "Subscribed successfully" });
      setEmail("");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to subscribe right now." });
    }
  };

  return (
    <section className="cta-section" id="subscribe">
      <div className="cta-wrap">
        <h2>Subscribe to Our Newsletter</h2>
        <p>
          Get updates on new courses, practical learning tips, and important
          announcements delivered straight to your inbox.
        </p>

        <form className="subscribe-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="subscribe-input"
            placeholder="Enter your email address"
            aria-label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" className="subscribe-btn">
            Subscribe Now
          </button>
        </form>

        {status.message && (
          <p className={`subscribe-message ${status.type}`}>{status.message}</p>
        )}
      </div>
    </section>
  );
};

export default CTASection;