import React, { useState } from "react";
import "./ContactPage.css";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { BASE_URL } from "../config";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: FaFacebookF, url: "#" },
  { label: "Instagram", icon: FaInstagram, url: "#" },
  { label: "LinkedIn", icon: FaLinkedinIn, url: "#" },
  { label: "Twitter", icon: FaTwitter, url: "#" },
];

const SUBJECTS = [
  "General Inquiry",
  "SAT Preparation",
  "ACT Preparation",
  "AP Courses",
  "IB DP / IB MYP",
  "IGCSE",
  "PSAT",
  "ESAT / TMUA",
  "English Speaking",
  "Career Counseling",
  "Visa Assistance",
  "Technical Support",
  "Other",
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverMsg, setServerMsg] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.subject) errs.subject = "Please select a subject.";
    if (!form.message.trim()) errs.message = "Message cannot be empty.";
    else if (form.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("loading");
    setServerMsg("");
    try {
      const res = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setServerMsg(data.message);
        setForm(initialForm);
      } else {
        setStatus("error");
        setServerMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setServerMsg("Unable to reach the server. Please check your connection.");
    }
  };

  return (
    <div className="contact-page">

      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Contact Us</h1>
          <h3>We'd Love to Hear From You</h3>
          <p>
            Have a question about our courses, need support, or want to learn
            more about the platform? Send us a message and we'll get back to
            you as soon as possible.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="contact-body">
        <div className="contact-container">

          {/* ── INFO PANEL ── */}
          <aside className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Our support team is available Monday – Saturday, 9 AM – 7 PM.
              Reach out through any of the channels below.
            </p>

            <div className="info-cards">
              <div className="info-card">
                <span className="info-icon" aria-hidden="true"><FaEnvelope /></span>
                <div>
                  <h4>Email Us</h4>
                  <p>
                    info@mytutee.com
                  </p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon" aria-hidden="true"><FaPhoneAlt /></span>
                <div>
                  <h4>Call Us</h4>
                  <p>+91 9910344403 <br />
                    +91 120 4962492</p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon" aria-hidden="true"><FaMapMarkerAlt /></span>
                <div>
                  <h4>Office Address</h4>
                  <p>
                    H-81/10, Shivaji Park, <br />
                    Panjabi Bagh West - New Delhi 110026
                  </p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-icon" aria-hidden="true"><FaClock /></span>
                <div>
                  <h4>Working Hours</h4>
                  <p>Mon – Sat: 9:00 AM – 7:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="social-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    className="social-pill"
                    aria-label={s.label}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="social-pill-icon" aria-hidden="true"><s.icon /></span>
                    <span className="social-pill-label">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* ── FORM ── */}
          <div className="contact-form-wrap">
            <h2>Send a Message</h2>
            <p className="form-sub">
              Fill out the form below and our team will respond within 24 hours.
            </p>

            {status === "success" && (
              <div className="form-alert form-alert--success">
                ✅ {serverMsg}
              </div>
            )}
            {status === "error" && (
              <div className="form-alert form-alert--error">
                ❌ {serverMsg}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              {/* Row 1 */}
              <div className="form-row">
                <div className={`form-group ${errors.fullName ? "has-error" : ""}`}>
                  <label htmlFor="fullName">Full Name <span>*</span></label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                  <label htmlFor="email">Email Address <span>*</span></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>

                <div className={`form-group ${errors.subject ? "has-error" : ""}`}>
                  <label htmlFor="subject">Subject <span>*</span></label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="">— Select a subject —</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.subject && <span className="field-error">{errors.subject}</span>}
                </div>
              </div>

              {/* Message */}
              <div className={`form-group ${errors.message ? "has-error" : ""}`}>
                <label htmlFor="message">Message <span>*</span></label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <><span className="spinner" /> Sending…</>
                ) : (
                  "Send Message →"
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ContactPage;
