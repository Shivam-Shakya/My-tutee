const router = require("express").Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/authMiddleware");
const { DEFAULT_COURSE_CATALOG } = require("../constants/defaultCourseCatalog");

const hasValidFeeMapping = (offerings = []) => offerings.some((offering) => {
  const fullCourseFee = Number(offering?.fullCourseFee || 0);
  if (fullCourseFee > 0) return true;

  return (offering?.selectedSubSubjects || []).some((subSubject) => Number(subSubject?.fee || 0) > 0);
});

const buildTutorCard = (teacher, keyword = "") => {
  const offerings = Array.isArray(teacher.profile?.courseOfferings) ? teacher.profile.courseOfferings : [];
  const loweredKeyword = keyword.trim().toLowerCase();

  const flattened = offerings.flatMap((offering) => {
    const courseName = offering?.courseName || "";
    const matchesCourse = loweredKeyword && courseName.toLowerCase().includes(loweredKeyword);
    const rows = [];

    if (matchesCourse && Number(offering?.fullCourseFee || 0) > 0) {
      rows.push({
        type: "course",
        courseName,
        subSubjectName: "",
        fee: Number(offering.fullCourseFee || 0)
      });
    }

    (offering?.selectedSubSubjects || []).forEach((subSubject) => {
      const subName = subSubject?.name || "";
      const matchesSubSubject = loweredKeyword && subName.toLowerCase().includes(loweredKeyword);
      const fee = Number(subSubject?.fee || 0);
      if (fee <= 0) return;

      if (!loweredKeyword || matchesCourse || matchesSubSubject) {
        rows.push({
          type: "sub-subject",
          courseName,
          subSubjectName: subName,
          fee
        });
      }
    });

    if (!loweredKeyword && Number(offering?.fullCourseFee || 0) > 0) {
      rows.unshift({
        type: "course",
        courseName,
        subSubjectName: "",
        fee: Number(offering.fullCourseFee || 0)
      });
    }

    return rows;
  });

  return {
    id: teacher._id,
    name: teacher.name,
    location: teacher.profile?.location || "",
    experience: teacher.profile?.experience || "Not specified",
    qualifications: teacher.profile?.qualifications || "",
    teachingMode: teacher.profile?.teachingMode || "",
    bio: teacher.profile?.bio || "",
    phone: teacher.phone || "",
    offerings: flattened,
    profile: teacher.profile || {}
  };
};

const mapCourseDoc = (courseDoc) => ({
  id: courseDoc.courseId,
  name: courseDoc.name,
  description: courseDoc.description || "",
  icon: courseDoc.icon || "",
  subCourses: (courseDoc.subSubjects || []).map((sub) => ({
    id: sub.id,
    name: sub.name,
    price: Number(sub.price || 0)
  }))
});

/* PUBLIC course catalog from database */
router.get("/catalog", async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    return res.json({ courses: courses.map(mapCourseDoc) });
  } catch (error) {
    console.error("Get course catalog error:", error);
    return res.status(500).json({ message: "Failed to fetch course catalog" });
  }
});

/* ADMIN seed default course catalog to database */
router.post("/catalog/seed", auth, async (req, res) => {
  try {
    const actor = await User.findById(req.user.id).select("role");
    if (!actor || actor.role !== "admin") {
      return res.status(403).json({ message: "Only admin can seed course catalog" });
    }

    const operations = DEFAULT_COURSE_CATALOG.map((course) => ({
      updateOne: {
        filter: { courseId: course.id },
        update: {
          $set: {
            name: course.name,
            description: course.description || "",
            icon: course.icon || "",
            subSubjects: (course.subCourses || []).map((sub) => ({
              id: sub.id,
              name: sub.name,
              price: Number(sub.price || 0)
            })),
            isActive: true
          }
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Course.bulkWrite(operations, { ordered: false });
    }

    return res.json({ message: "Course catalog seeded successfully" });
  } catch (error) {
    console.error("Seed course catalog error:", error);
    return res.status(500).json({ message: "Failed to seed course catalog" });
  }
});

/* PUBLIC tutors search */
router.get("/public-tutors", async (req, res) => {
  try {
    const keyword = String(req.query.keyword || "").trim();
    const location = String(req.query.location || "").trim().toLowerCase();

    const teachers = await User.find({
      role: "teacher",
      profileCompleted: true,
      lastLoginAt: { $ne: null }
    }, { password: 0 });

    const tutors = teachers
      .filter((teacher) => {
        const offerings = Array.isArray(teacher.profile?.courseOfferings) ? teacher.profile.courseOfferings : [];
        if (!offerings.length || !hasValidFeeMapping(offerings)) return false;
        if (!teacher.profile?.location) return false;

        const locationMatch = !location || teacher.profile.location.toLowerCase().includes(location);
        if (!locationMatch) return false;

        if (!keyword) return true;

        const lowerKeyword = keyword.toLowerCase();
        return offerings.some((offering) => {
          const courseMatch = String(offering?.courseName || "").toLowerCase().includes(lowerKeyword);
          const subMatch = (offering?.selectedSubSubjects || []).some((subSubject) =>
            String(subSubject?.name || "").toLowerCase().includes(lowerKeyword)
          );
          return courseMatch || subMatch;
        });
      })
      .map((teacher) => buildTutorCard(teacher, keyword))
      .filter((teacher) => teacher.offerings.length > 0 || !keyword);

    res.json({ tutors });
  } catch (error) {
    console.error("Public tutors search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* PUBLIC tutor details */
router.get("/public-tutors/:tutorId", async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.tutorId,
      role: "teacher",
      profileCompleted: true,
      lastLoginAt: { $ne: null }
    }, { password: 0 });

    if (!teacher) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const offerings = Array.isArray(teacher.profile?.courseOfferings) ? teacher.profile.courseOfferings : [];
    if (!offerings.length || !hasValidFeeMapping(offerings)) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    if (!teacher.profile?.location) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json({ tutor: buildTutorCard(teacher) });
  } catch (error) {
    console.error("Public tutor details error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET teachers by subject */
router.get("/teachers", auth, async (req, res) => {
  try {
    const { subject, courseId, fullCourse } = req.query;
    if (!subject && !courseId) {
      return res.status(400).json({ message: "Subject or courseId is required" });
    }

    const teachers = await User.find({ role: "teacher" }, { password: 0 });

    const teachersWithDetails = teachers.map((teacher) => {
      const offerings = Array.isArray(teacher.profile?.courseOfferings)
        ? teacher.profile.courseOfferings
        : [];

      let matchedCourse = null;
      if (courseId) {
        matchedCourse = offerings.find((offering) => offering.courseId === courseId) || null;
      }

      if (!matchedCourse && subject) {
        matchedCourse = offerings.find((offering) =>
          (offering.selectedSubSubjects || []).some((subSubject) => subSubject.name === subject || subSubject.id === subject)
        ) || null;
      }

      let matchedSubSubject = null;
      if (matchedCourse && subject) {
        matchedSubSubject = (matchedCourse.selectedSubSubjects || []).find(
          (subSubject) => subSubject.name === subject || subSubject.id === subject
        ) || null;
      }

      const wantsFullCourse = fullCourse === "true";
      let resolvedFee = 0;

      if (wantsFullCourse && matchedCourse) {
        resolvedFee = Number(matchedCourse.fullCourseFee || 0);
      } else if (!wantsFullCourse && matchedSubSubject) {
        resolvedFee = Number(matchedSubSubject.fee || 0);
      }

      if (!matchedCourse && !matchedSubSubject) {
        return null;
      }

      if (wantsFullCourse && !matchedCourse) {
        return null;
      }

      if (!wantsFullCourse && subject && !matchedSubSubject) {
        return null;
      }

      if (resolvedFee <= 0) {
        return null;
      }

      const legacySubjectDetails = teacher.profile?.subjectDetails?.[subject] || {};

      return {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        subjects: teacher.subjects,
        profile: teacher.profile,
        matchedCourse: matchedCourse
          ? {
            id: matchedCourse.courseId,
            name: matchedCourse.courseName,
            fullCourseFee: Number(matchedCourse.fullCourseFee || 0)
          }
          : null,
        matchedSubSubject: matchedSubSubject
          ? {
            id: matchedSubSubject.id,
            name: matchedSubSubject.name,
            fee: Number(matchedSubSubject.fee || 0)
          }
          : null,
        resolvedFee,
        subjectSchedule: {
          timetable: legacySubjectDetails.timetable || [],
          pricePerHour: legacySubjectDetails.pricePerHour || "",
          pricePerMonth: legacySubjectDetails.pricePerMonth || "",
          classes: legacySubjectDetails.classes || "Class 9-12"
        }
      };
    }).filter(Boolean);

    res.json({ teachers: teachersWithDetails });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ENROLL student in a course */
router.post("/enroll", auth, async (req, res) => {
  try {
    const { courseId, courseName, subject, selectedSubSubjects = [], teacherId = null } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(c => c.courseId === courseId);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    user.enrolledCourses.push({ courseId, courseName, subject });
    await user.save();

    const normalizedSubSubjects = Array.isArray(selectedSubSubjects)
      ? selectedSubSubjects
        .filter((item) => item && (item.id || item.name))
        .map((item) => ({
          id: String(item.id || item.name),
          name: String(item.name || item.id),
          fee: Number(item.fee || item.price || 0)
        }))
      : [];

    const enrollment = await Enrollment.create({
      student: userId,
      teacher: teacherId || null,
      courseId: String(courseId),
      courseName: String(courseName || ""),
      selectedSubSubjects: normalizedSubSubjects,
      assignedSubject: String(subject || ""),
      classLevel: user.classLevel || ""
    });

    // Return teachers who teach this subject
    const teachers = await User.find(
      { role: "teacher", subjects: subject },
      { password: 0 }
    );

    res.json({
      message: "Enrolled successfully",
      enrolledCourse: { courseId, courseName, subject },
      enrollment,
      teachers
    });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET enrolled courses for logged-in student */
router.get("/my-courses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { enrolledCourses: 1 });
    if (!user) return res.status(404).json({ message: "User not found" });

    const enrollments = await Enrollment.find({
      student: req.user.id,
      status: { $in: ["active", "completed"] }
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.json({ enrolledCourses: user.enrolledCourses, enrollments });
  } catch (error) {
    console.error("My courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* GET teacher profile */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { password: 0 });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      profile: user.profile || {},
      subjects: user.subjects || []
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE user profile */
router.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { profile, classLevel } = req.body;
    user.profile = { ...user.profile?.toObject?.() || {}, ...profile };
    user.profileCompleted = true;

    // Update classLevel if provided (for students)
    if (classLevel && user.role === "student") {
      // Normalize class level
      const normalizedClassLevel = classLevel.replace(/th|st|nd|rd|Class /gi, '').trim();
      const validLevels = ["9", "10", "11", "12", "Graduation", "Post Graduation"];
      if (validLevels.includes(normalizedClassLevel)) {
        user.classLevel = normalizedClassLevel;
      }
    }

    // Also check profile.currentClass and save to classLevel for students
    if (profile?.currentClass && user.role === "student") {
      const normalizedClassLevel = profile.currentClass.replace(/th|st|nd|rd|Class /gi, '').trim();
      const validLevels = ["9", "10", "11", "12", "Graduation", "Post Graduation"];
      // Map "College" to "Graduation"
      if (normalizedClassLevel === "College") {
        user.classLevel = "Graduation";
      } else if (validLevels.includes(normalizedClassLevel)) {
        user.classLevel = normalizedClassLevel;
      }
    }

    await user.save();

    res.json({ message: "Profile updated", profile: user.profile, classLevel: user.classLevel });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* UPDATE teacher subjects */
router.put("/subjects", auth, async (req, res) => {
  try {
    const { subjects } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "teacher") return res.status(403).json({ message: "Only teachers can update subjects" });

    user.subjects = subjects;
    await user.save();

    res.json({ message: "Subjects updated", subjects: user.subjects });
  } catch (error) {
    console.error("Update subjects error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* SAVE subject details (timetable, pricing) for a teacher */
router.put("/subject-details", auth, async (req, res) => {
  try {
    const { subjectName, timetable, pricePerHour, pricePerMonth, classes } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "teacher") return res.status(403).json({ message: "Only teachers can update subject details" });

    // Initialize profile and subjectDetails if not exists
    if (!user.profile) user.profile = {};
    if (!user.profile.subjectDetails) user.profile.subjectDetails = {};

    // Save subject details
    user.profile.subjectDetails[subjectName] = {
      timetable: timetable || [],
      pricePerHour: pricePerHour || "",
      pricePerMonth: pricePerMonth || "",
      classes: classes || "Class 9-12",
      updatedAt: new Date()
    };

    user.markModified('profile');
    await user.save();

    res.json({
      message: "Subject details saved",
      subjectDetails: user.profile.subjectDetails[subjectName]
    });
  } catch (error) {
    console.error("Save subject details error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ADD a new subject with details for a teacher */
router.post("/add-subject", auth, async (req, res) => {
  try {
    const { subjectName, timetable, pricePerHour, pricePerMonth, classes } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "teacher") return res.status(403).json({ message: "Only teachers can add subjects" });

    // Check if subject already exists
    if (user.subjects && user.subjects.includes(subjectName)) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    // Add to subjects array
    if (!user.subjects) user.subjects = [];
    user.subjects.push(subjectName);

    // Initialize profile and subjectDetails if not exists
    if (!user.profile) user.profile = {};
    if (!user.profile.subjectDetails) user.profile.subjectDetails = {};

    // Save subject details
    user.profile.subjectDetails[subjectName] = {
      timetable: timetable || [],
      pricePerHour: pricePerHour || "",
      pricePerMonth: pricePerMonth || "",
      classes: classes || "Class 9-12",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    user.markModified('profile');
    await user.save();

    res.json({
      message: "Subject added successfully",
      subjects: user.subjects,
      subjectDetails: user.profile.subjectDetails[subjectName]
    });
  } catch (error) {
    console.error("Add subject error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* REMOVE a subject from teacher */
router.delete("/remove-subject/:subjectName", auth, async (req, res) => {
  try {
    const { subjectName } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "teacher") return res.status(403).json({ message: "Only teachers can remove subjects" });

    // Remove from subjects array
    user.subjects = user.subjects.filter(s => s !== subjectName);

    // Remove from subjectDetails
    if (user.profile && user.profile.subjectDetails) {
      delete user.profile.subjectDetails[subjectName];
      user.markModified('profile');
    }

    await user.save();

    res.json({
      message: "Subject removed successfully",
      subjects: user.subjects
    });
  } catch (error) {
    console.error("Remove subject error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
