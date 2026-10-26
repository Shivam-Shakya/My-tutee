const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Otp = require("../models/Otp");

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizePhone = (phone) => String(phone || "").trim();
const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_TIME || 5);
const OTP_EXPIRE_MS = OTP_EXPIRE_MINUTES * 60 * 1000;

const createOrUpdateOtp = async ({ channel, identifier, purpose, otp }) => {
  const otpHash = await bcrypt.hash(String(otp), 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MS);

  await Otp.findOneAndUpdate(
    { channel, identifier, purpose },
    { $set: { otpHash, expiresAt, attempts: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const readOtpRecord = async ({ channel, identifier, purpose }) => {
  return Otp.findOne({ channel, identifier, purpose });
};

const deleteOtpRecord = async ({ channel, identifier, purpose }) => {
  await Otp.deleteOne({ channel, identifier, purpose });
};

/* ───── SMTP transporter (Hostinger via .env) ───── */
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.EMAIL_USER;
const smtpPass = process.env.EMAIL_PASS;

const smtpConfigured = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);
let transporter = null;

if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  console.log(`📧 Email transport configured with SMTP host ${smtpHost}:${smtpPort}`);
} else {
  console.error("✗ SMTP email configuration is missing. Set SMTP_HOST, SMTP_PORT, EMAIL_USER, and EMAIL_PASS in .env");
}

const buildOtpEmailHtml = (title, description, otp, footerNote) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin: 0 0 20px 0;">${title}</h2>
      <p style="color: #6b7280; margin: 0 0 15px 0;">${description}</p>
      <div style="background-color: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 0; letter-spacing: 5px;">${otp}</p>
      </div>
      <p style="color: #6b7280; margin: 0 0 10px 0;"><strong>Valid for ${OTP_EXPIRE_MINUTES} minutes only</strong></p>
      <p style="color: #6b7280; margin: 0 0 20px 0;">${footerNote}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
`;

/* ───── SEND EMAIL OTP ───── */
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const normalizedEmail = normalizeEmail(email);

    if (!transporter || !smtpConfigured) {
      return res.status(500).json({
        message: "Email service not configured. Please contact support.",
      });
    }

    // Check if email+role combination already exists
    // Students and parents can share the same email
    if (role) {
      const exists = await User.findOne({ email: normalizedEmail, role });
      if (exists) return res.status(400).json({ message: `This email is already registered as a ${role}` });
    } else {
      // If no role provided, check if email exists for teacher (teachers can't share email)
      const teacherExists = await User.findOne({ email: normalizedEmail, role: "teacher" });
      if (teacherExists) return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOtp();
    await createOrUpdateOtp({
      channel: "email",
      identifier: normalizedEmail,
      purpose: "signup-email",
      otp,
    });

    try {
      await transporter.sendMail({
        from: smtpUser,
        to: normalizedEmail,
        subject: "Email Verification OTP",
        html: buildOtpEmailHtml(
          "Email Verification",
          "Thank you for signing up! Please use the following code to verify your email address.",
          otp,
          "Do not share this code with anyone. Our team will never ask for this code."
        ),
      });
      console.log(`✓ OTP email sent successfully to ${normalizedEmail}`);

      return res.json({ message: "OTP sent to email. Please check your inbox." });
    } catch (error) {
      console.error(`✗ Failed to send OTP email to ${normalizedEmail}:`, error.message);
      await deleteOtpRecord({ channel: "email", identifier: normalizedEmail, purpose: "signup-email" });
      throw error;
    }
  } catch (error) {
    console.error("Send email OTP error:", error.message);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
});

/* ───── VERIFY EMAIL OTP ───── */
router.post("/verify-email-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    const record = await readOtpRecord({ channel: "email", identifier: email, purpose: "signup-email" });

    if (!record) return res.status(400).json({ message: "No OTP requested for this email" });
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await deleteOtpRecord({ channel: "email", identifier: email, purpose: "signup-email" });
      return res.status(400).json({ message: "OTP has expired" });
    }
    const isValidOtp = await bcrypt.compare(otp, record.otpHash);
    if (!isValidOtp) {
      await Otp.updateOne(
        { _id: record._id },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await deleteOtpRecord({ channel: "email", identifier: email, purpose: "signup-email" });
    await createOrUpdateOtp({
      channel: "email",
      identifier: email,
      purpose: "signup-email-verified",
      otp: "VERIFIED"
    });
    res.json({ message: "Email verified", verified: true });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── SEND PHONE OTP ───── */
router.post("/send-phone-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const otp = generateOtp();
    await createOrUpdateOtp({
      channel: "phone",
      identifier: phone,
      purpose: "phone-verification",
      otp,
    });

    // In production, integrate Twilio / MSG91 / etc.
    // For now, log to console so you can test
    console.log(`📱 Phone OTP for ${phone}: ${otp}`);

    res.json({ message: "OTP sent to phone (check server console)" });
  } catch (error) {
    console.error("Send phone OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ───── VERIFY PHONE OTP ───── */
router.post("/verify-phone-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const otp = String(req.body?.otp || "").trim();
    const record = await readOtpRecord({ channel: "phone", identifier: phone, purpose: "phone-verification" });

    if (!record) return res.status(400).json({ message: "No OTP requested for this number" });
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await deleteOtpRecord({ channel: "phone", identifier: phone, purpose: "phone-verification" });
      return res.status(400).json({ message: "OTP has expired" });
    }
    const isValidOtp = await bcrypt.compare(otp, record.otpHash);
    if (!isValidOtp) {
      await Otp.updateOne(
        { _id: record._id },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await deleteOtpRecord({ channel: "phone", identifier: phone, purpose: "phone-verification" });
    res.json({ message: "Phone verified", verified: true });
  } catch (error) {
    console.error("Verify phone OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── FORGOT PASSWORD: SEND OTP ───── */
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!transporter) {
      return res.status(500).json({ message: "Email service not configured. Please contact support." });
    }

    const otp = generateOtp();
    await createOrUpdateOtp({
      channel: "email",
      identifier: normalizedEmail,
      purpose: "forgot-password",
      otp,
    });

    await transporter.sendMail({
      from: smtpUser,
      to: normalizedEmail,
      subject: "Password Reset OTP",
      html: buildOtpEmailHtml(
        "Reset Your Password",
        "Use this OTP to reset your password.",
        otp,
        "If you did not request this, please ignore this email."
      ),
    });

    return res.json({ message: "OTP sent to email. Please check your inbox." });
  } catch (error) {
    console.error("Forgot password send OTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
});

/* ───── FORGOT PASSWORD: VERIFY OTP ───── */
router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await readOtpRecord({ channel: "email", identifier: normalizedEmail, purpose: "forgot-password" });
    if (!record) {
      return res.status(400).json({ message: "No OTP requested for this email" });
    }
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await deleteOtpRecord({ channel: "email", identifier: normalizedEmail, purpose: "forgot-password" });
      return res.status(400).json({ message: "OTP has expired" });
    }
    const isValidOtp = await bcrypt.compare(otp, record.otpHash);
    if (!isValidOtp) {
      await Otp.updateOne(
        { _id: record._id },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ message: "Invalid OTP" });
    }

    return res.json({ message: "OTP verified", verified: true });
  } catch (error) {
    console.error("Forgot password verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ───── FORGOT PASSWORD: RESET ───── */
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await readOtpRecord({ channel: "email", identifier: normalizedEmail, purpose: "forgot-password" });
    if (!record) {
      return res.status(400).json({ message: "No OTP requested for this email" });
    }
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await deleteOtpRecord({ channel: "email", identifier: normalizedEmail, purpose: "forgot-password" });
      return res.status(400).json({ message: "OTP has expired" });
    }
    const isValidOtp = await bcrypt.compare(otp, record.otpHash);
    if (!isValidOtp) {
      await Otp.updateOne(
        { _id: record._id },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateMany({ email: normalizedEmail }, { $set: { password: hashed } });

    await deleteOtpRecord({ channel: "email", identifier: normalizedEmail, purpose: "forgot-password" });
    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Forgot password reset error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ───── SIGNUP ───── */
router.post("/signup", async (req, res) => {
  try {
    const {
      name, email, password, role, phone,
      // Teacher-specific fields
      subject,
      // Parent-specific fields
      studentName, studentEmail
    } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedStudentEmail = String(studentEmail || "").trim().toLowerCase();

    const emailVerificationRecord = await readOtpRecord({
      channel: "email",
      identifier: normalizedEmail,
      purpose: "signup-email-verified"
    });

    const isEmailVerified = Boolean(
      emailVerificationRecord && Date.now() <= new Date(emailVerificationRecord.expiresAt).getTime()
    );

    if (!isEmailVerified) {
      return res.status(400).json({ message: "Please verify your email with OTP before signup" });
    }

    // Check if email+role combination already exists
    // Students and parents can share the same email with different passwords
    const exists = await User.findOne({ email: normalizedEmail, role });
    if (exists) return res.status(400).json({ message: `This email is already registered as a ${role}` });

    const hashed = await bcrypt.hash(password, 10);

    // If parent, prepare to link with student
    let linkedStudentId = null;
    let studentLinkingStatus = "pending";
    let studentLinkingError = "";

    if (role === "parent") {
      if (!studentName || !String(studentName).trim()) {
        return res.status(400).json({ message: "Student name is required" });
      }

      if (!normalizedStudentEmail) {
        return res.status(400).json({ message: "Student email is required" });
      }

      // Find student by email and verify provided student name matches.
      const student = await User.findOne({ email: normalizedStudentEmail, role: "student" });
      if (!student) {
        return res.status(400).json({ message: "Student not found. Please check the email ID." });
      }

      if (String(student.name || "").trim().toLowerCase() !== String(studentName).trim().toLowerCase()) {
        return res.status(400).json({ message: "Student name does not match the provided email." });
      }

      linkedStudentId = student._id;
      studentLinkingStatus = "linked";
      studentLinkingError = "";
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      emailVerified: true,
      phone: phone || "",
      password: hashed,
      role,
      // Teacher-specific fields
      subject: subject || "",
      // Parent-specific fields
      studentName: studentName || "",
      studentEmail: normalizedStudentEmail || "",
      linkedStudentId: linkedStudentId,
      studentLinkingStatus: studentLinkingStatus,
      studentLinkingError: studentLinkingError
    });

    await deleteOtpRecord({
      channel: "email",
      identifier: normalizedEmail,
      purpose: "signup-email-verified"
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        classLevel: newUser.classLevel,
        subjects: newUser.subjects,
        profile: newUser.profile || {},
        // Teacher-specific fields
        subject: newUser.subject,
        // Parent-specific fields
        studentName: newUser.studentName,
        studentEmail: newUser.studentEmail,
        linkedStudentId: newUser.linkedStudentId,
        studentLinkingStatus: newUser.studentLinkingStatus,
        studentLinkingError: newUser.studentLinkingError
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── LOGIN ───── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Find all users with this email (could be student and parent with same email)
    const users = await User.find({ email: normalizedEmail });
    if (users.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    // Check password against each user and find the matching one
    let matchedUser = null;
    for (const user of users) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) return res.status(400).json({ message: "Invalid email or password" });

    matchedUser.lastLoginAt = new Date();
    await matchedUser.save();

    const token = jwt.sign(
      { id: matchedUser._id, role: matchedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        phone: matchedUser.phone || "",
        classLevel: matchedUser.classLevel || "",
        subjects: matchedUser.subjects,
        profile: matchedUser.profile || {},
        // Teacher-specific fields
        subject: matchedUser.subject || "",
        // Parent-specific fields
        studentName: matchedUser.studentName || "",
        studentEmail: matchedUser.studentEmail || "",
        linkedStudentId: matchedUser.linkedStudentId || null,
        studentLinkingStatus: matchedUser.studentLinkingStatus || "pending",
        studentLinkingError: matchedUser.studentLinkingError || ""
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ───── GET USER BY ID ───── */
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
