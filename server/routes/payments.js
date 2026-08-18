const router = require("express").Router();
const Payment = require("../models/Payment");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const ScheduledClass = require("../models/ScheduledClass");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

/* CREATE a new payment */
router.post("/create", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can make payments" });
    }

    const {
      teacherId,
      subject,
      selectedCourse,
      selectedSubSubject,
      classLevel,
      amount,
      paymentMethod,
      paymentType,
      validityMonths,
      transactionDetails
    } = req.body;

    // Validate required fields
    if (!teacherId || !subject || !amount) {
      return res.status(400).json({ message: "Teacher, subject, and amount are required" });
    }

    // Get student's class level from profile if not provided
    const studentClassLevel = classLevel || student.classLevel || student.profile?.currentClass?.replace(/th|st|nd|rd|Class /gi, '').trim() || "";

    // Map "College" to "Graduation"
    const normalizedClassLevel = studentClassLevel === "College" ? "Graduation" : studentClassLevel;

    if (!normalizedClassLevel) {
      return res.status(400).json({ message: "Class level is required. Please set your class level in your profile." });
    }

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Generate unique payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate validity period (default 1 month)
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + (validityMonths || 1));

    // Check for existing valid payment
    const existingPayment = await Payment.findOne({
      student: studentId,
      teacher: teacherId,
      subject: subject,
      classLevel: normalizedClassLevel,
      status: "completed",
      validUntil: { $gte: new Date() }
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "You already have an active subscription for this subject with this teacher",
        existingPayment
      });
    }

    // Create payment record
    const payment = new Payment({
      paymentCategory: "teacher-subscription",
      student: studentId,
      teacher: teacherId,
      subject,
      classLevel: normalizedClassLevel,
      paymentId,
      amount,
      paymentMethod: paymentMethod || "card",
      paymentType: paymentType || "monthly",
      status: "completed", // In real scenario, this would be set after gateway confirmation
      validFrom,
      validUntil,
      transactionDetails: transactionDetails || {},
      invoiceNumber: `INV_${Date.now()}`
    });

    await payment.save();

    // Create or update assignment record
    let assignment = await Assignment.findOne({
      student: studentId,
      teacher: teacherId,
      subject: subject,
      classLevel: normalizedClassLevel
    });

    if (!assignment) {
      // Get teacher's schedule for this subject
      const teacherSubjectDetails = teacher.profile?.subjectDetails?.[subject] || {};

      assignment = new Assignment({
        student: studentId,
        teacher: teacherId,
        subject,
        classLevel: normalizedClassLevel,
        amountPaid: amount,
        paymentMethod: paymentMethod || "card",
        paymentId: paymentId,
        paymentStatus: "completed",
        timetable: teacherSubjectDetails.timetable || [],
        pricePerHour: teacherSubjectDetails.pricePerHour || "",
        pricePerMonth: teacherSubjectDetails.pricePerMonth || "",
        status: "active"
      });

      await assignment.save();
    } else {
      // Update existing assignment
      assignment.amountPaid = (assignment.amountPaid || 0) + amount;
      assignment.paymentStatus = "completed";
      assignment.status = "active";
      await assignment.save();
    }

    const selectedSubSubjects = selectedSubSubject
      ? [{
        id: String(selectedSubSubject.id || selectedSubSubject.name || subject),
        name: String(selectedSubSubject.name || selectedSubSubject.id || subject),
        fee: Number(selectedSubSubject.fee || selectedSubSubject.price || amount || 0)
      }]
      : [];

    const enrollmentFilter = {
      student: studentId,
      teacher: teacherId,
      assignedSubject: subject,
      status: "active"
    };

    const enrollmentPayload = {
      courseId: String(selectedCourse?.id || "custom"),
      courseName: String(selectedCourse?.name || selectedCourse || subject),
      selectedSubSubjects,
      classLevel: normalizedClassLevel,
      assignment: assignment._id
    };

    const enrollment = await Enrollment.findOneAndUpdate(
      enrollmentFilter,
      { $set: enrollmentPayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Link payment to assignment and enrollment
    payment.assignment = assignment._id;
    payment.enrollment = enrollment._id;
    await payment.save();

    // Persist selected course/subject/teacher mapping in student profile.
    student.profile = {
      ...(student.profile?.toObject?.() || student.profile || {}),
      selectedCourse: selectedCourse || null,
      selectedSubSubject: selectedSubSubject || { name: subject },
      assignedTeacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject,
        experience: teacher.profile?.experience || ''
      }
    };
    student.profileCompleted = true;
    student.markModified('profile');
    await student.save();

    teacher.notifications = teacher.notifications || [];
    teacher.notifications.unshift({
      type: 'student-assigned',
      message: `${student.name} hired you for ${subject}`,
      from: student._id,
      subject,
      createdAt: new Date(),
      read: false
    });
    await teacher.save();

    // Populate response
    const populatedPayment = await Payment.findById(payment._id)
      .populate("student", "name email")
      .populate("teacher", "name email subjects");

    res.status(201).json({
      message: "Payment successful",
      payment: populatedPayment,
      assignment,
      enrollment,
      profile: student.profile
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* CREATE a course package purchase payment */
router.post("/create-course-purchase", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Only students can purchase courses" });
    }

    const {
      mainCourse,
      subCourses,
      totalAmount,
      paymentMethod,
      transactionDetails
    } = req.body;

    if (!mainCourse?.id || !mainCourse?.name) {
      return res.status(400).json({ message: "Main course is required" });
    }

    if (!Array.isArray(subCourses) || subCourses.length === 0) {
      return res.status(400).json({ message: "At least one sub-course must be selected" });
    }

    if (!Number(totalAmount) || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Total amount must be greater than zero" });
    }

    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 12);

    const payment = new Payment({
      paymentCategory: "course-package",
      student: studentId,
      paymentId,
      amount: Number(totalAmount),
      paymentMethod: paymentMethod || "card",
      paymentType: "package",
      status: "completed",
      validFrom,
      validUntil,
      transactionDetails: {
        ...(transactionDetails || {}),
        mainCourse,
        subCourses
      },
      invoiceNumber: `INV_${Date.now()}`
    });

    await payment.save();

    const packageEnrollment = await Enrollment.create({
      student: studentId,
      courseId: String(mainCourse.id),
      courseName: String(mainCourse.name),
      selectedSubSubjects: subCourses.map((subCourse) => ({
        id: String(subCourse.id || subCourse.name),
        name: String(subCourse.name || subCourse.id),
        fee: Number(subCourse.price || 0)
      })),
      assignedSubject: String(mainCourse.name),
      classLevel: student.classLevel || "",
      payment: payment._id,
      status: "active"
    });

    payment.enrollment = packageEnrollment._id;
    await payment.save();

    student.profile = {
      ...(student.profile?.toObject?.() || student.profile || {}),
      purchasedCourse: {
        id: mainCourse.id,
        name: mainCourse.name,
        icon: mainCourse.icon || "",
      },
      selectedSubCourses: subCourses.map((subCourse) => ({
        id: subCourse.id,
        name: subCourse.name,
        price: Number(subCourse.price || 0)
      })),
      purchaseAmount: Number(totalAmount),
      purchaseDate: new Date().toISOString(),
      hasPurchasedCourse: true,
    };
    student.profileCompleted = true;
    student.markModified("profile");
    await student.save();

    res.status(201).json({
      message: "Course purchase payment successful",
      payment,
      enrollment: packageEnrollment,
      profile: student.profile
    });
  } catch (error) {
    console.error("Create course purchase payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* VERIFY payment status */
router.post("/verify", auth, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    const payment = await Payment.findOne({ paymentId })
      .populate("student", "name email")
      .populate("teacher", "name email subjects");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const isValid = payment.isValid();

    res.json({
      payment,
      isValid,
      daysRemaining: isValid ? Math.ceil((new Date(payment.validUntil) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET all payments for a student */
router.get("/my-payments", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const payments = await Payment.find({ student: studentId })
      .populate("teacher", "name email subjects")
      .sort({ createdAt: -1 });

    // Separate active and expired payments
    const now = new Date();
    const activePayments = payments.filter(p => p.status === "completed" && new Date(p.validUntil) >= now);
    const expiredPayments = payments.filter(p => p.status === "completed" && new Date(p.validUntil) < now);

    res.json({
      payments,
      activePayments,
      expiredPayments,
      totalActive: activePayments.length
    });
  } catch (error) {
    console.error("Get my payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET payments received by a teacher */
router.get("/received-payments", auth, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Verify user is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can access this endpoint" });
    }

    const payments = await Payment.find({ teacher: teacherId, status: "completed" })
      .populate("student", "name email phone")
      .sort({ createdAt: -1 });

    // Calculate total earnings
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const thisMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });
    const thisMonthEarnings = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      payments,
      totalEarnings,
      thisMonthEarnings,
      totalStudents: [...new Set(payments.map(p => p.student._id.toString()))].length
    });
  } catch (error) {
    console.error("Get received payments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* CHECK if student has paid for a specific subject/teacher */
router.get("/check-access", auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId, subject } = req.query;

    if (!teacherId || !subject) {
      return res.status(400).json({ message: "Teacher ID and subject are required" });
    }

    const validPayment = await Payment.findOne({
      student: studentId,
      teacher: teacherId,
      subject: subject,
      status: "completed",
      validUntil: { $gte: new Date() }
    });

    res.json({
      hasAccess: !!validPayment,
      payment: validPayment,
      daysRemaining: validPayment ? Math.ceil((new Date(validPayment.validUntil) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    });
  } catch (error) {
    console.error("Check access error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET active subjects for a student (subjects they've paid for) */
router.get("/active-subjects", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const validPayments = await Payment.find({
      student: studentId,
      paymentCategory: { $ne: "course-package" },
      status: "completed",
      validUntil: { $gte: new Date() }
    }).populate("teacher", "name email subjects profile");

    // Get unique subjects with their teachers
    const subjectMap = {};
    validPayments.forEach(payment => {
      if (!subjectMap[payment.subject]) {
        subjectMap[payment.subject] = {
          subject: payment.subject,
          teachers: [],
          validUntil: payment.validUntil
        };
      }
      subjectMap[payment.subject].teachers.push({
        _id: payment.teacher._id,
        name: payment.teacher.name,
        email: payment.teacher.email
      });
    });

    const activeSubjects = Object.values(subjectMap);

    res.json({ activeSubjects });
  } catch (error) {
    console.error("Get active subjects error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
