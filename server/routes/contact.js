const router = require("express").Router();
const Contact = require("../models/Contact");
const Subscription = require("../models/Subscription");
const { sendNotificationEmail } = require("../utils/mailer");

const NOTIFICATION_EMAIL = "info@mytutee.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const buildContactNotificationHtml = ({ fullName, email, phone, subject, message }) => `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
    <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 18px 0; color: #111827;">New Contact Form Submission</h2>
      <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${fullName}</p>
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 18px 0 8px 0;"><strong>Message</strong></p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 10px; white-space: pre-wrap; color: #374151;">${message}</div>
    </div>
  </div>
`;

const buildSubscriptionNotificationHtml = (subscriberEmail) => `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
    <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 18px 0; color: #111827;">New Newsletter Subscription</h2>
      <p style="margin: 0;"><strong>Subscriber Email:</strong> ${subscriberEmail}</p>
    </div>
  </div>
`;

/* ── POST /api/contact — submit a contact enquiry ── */
router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ message: "Full name, email, subject, and message are required." });
    }

    // Basic email format check
    if (!EMAIL_REGEX.test(String(email || "").trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const entry = await Contact.create({ fullName, email, phone, subject, message });

    await sendNotificationEmail({
      to: NOTIFICATION_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: buildContactNotificationHtml({ fullName, email, phone, subject, message }),
      replyTo: normalizeEmail(email),
    });

    res.status(201).json({
      message: "Your message has been sent successfully",
      id: entry._id,
    });
  } catch (err) {
    console.error("Contact route error:", err);
    res.status(500).json({ message: err.message || "Server error. Please try again later." });
  }
});

/* ── POST /api/contact/subscribe — newsletter subscription ── */
router.post("/subscribe", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { email },
      { $set: { status: "active", source: "newsletter" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendNotificationEmail({
      to: NOTIFICATION_EMAIL,
      subject: "New Newsletter Subscription",
      html: buildSubscriptionNotificationHtml(email),
    });

    res.status(201).json({
      message: "Subscribed successfully",
      id: subscription._id,
    });
  } catch (err) {
    console.error("Subscribe route error:", err);
    res.status(500).json({ message: err.message || "Server error. Please try again later." });
  }
});

module.exports = router;
