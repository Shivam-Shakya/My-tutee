const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://mytutee.com",
  "https://www.mytutee.com",
]);

const extraOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGIN]
  .flatMap((value) => (value ? value.split(",") : []))
  .map((value) => value.trim())
  .filter(Boolean);

for (const origin of extraOrigins) {
  allowedOrigins.add(origin);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(express.json({ limit: "10mb" }));

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

app.set('trust proxy', 1);

/* DATABASE */
connectDB();

/* ROUTES */
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const assignmentRoutes = require("./routes/assignments");
const notificationRoutes = require("./routes/notifications");
const scheduledClassRoutes = require("./routes/scheduledClasses");
const paymentRoutes = require("./routes/payments");
const teacherAssignmentRoutes = require("./routes/teacherAssignments");
const contactRoutes = require("./routes/contact");
const lectureRoutes = require("./routes/lectures");
const messageRoutes = require("./routes/messages");
const doubtRoutes = require("./routes/doubts");
const testRoutes = require("./routes/tests");
const parentRoutes = require("./routes/parents");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/scheduled-classes", scheduledClassRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/teacher-assignments", teacherAssignmentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/parents", parentRoutes);

// Determine frontend static directory (allow override via PUBLIC_DIR env var)
const publicEnv = process.env.PUBLIC_DIR;
const staticCandidates = [];
if (publicEnv) staticCandidates.push(path.resolve(publicEnv));
staticCandidates.push(path.join(__dirname, "../public_html"));
staticCandidates.push(path.join(__dirname, "../client/dist"));
staticCandidates.push(path.join(__dirname, "../client/build"));
staticCandidates.push(path.join(__dirname, "../client/public"));

const resolvedStaticDir = staticCandidates.find((p) => fs.existsSync(p) && fs.existsSync(path.join(p, "index.html")));
if (resolvedStaticDir) {
  app.use(express.static(resolvedStaticDir));
  console.log(`Serving static frontend from: ${resolvedStaticDir}`);
} else {
  console.warn("No frontend build detected. Static files will not be served from the backend.");
}

app.get("/api/test", (req, res) => {
  res.send("API working ✅");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
// Log and keep process-level errors from crashing silently. Use a process manager (PM2) in production to restart on failure.
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Simple error handler to return JSON instead of crashing
app.use((err, req, res, next) => {
  console.error('Express error:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: 'Internal server error' });
});

// Only handle NON-API routes
app.get(/.*/, (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  // Serve SPA index if a frontend build exists. Look for common build folders
  // Allow overriding with PUBLIC_DIR environment variable.
  const publicEnv = process.env.PUBLIC_DIR;
  const candidates = [];
  if (publicEnv) candidates.push(path.resolve(publicEnv));
  candidates.push(path.join(__dirname, "../public_html"));
  candidates.push(path.join(__dirname, "../client/dist"));
  candidates.push(path.join(__dirname, "../client/build"));
  candidates.push(path.join(__dirname, "../client/public"));

  const staticDir = candidates.find((p) => fs.existsSync(p) && fs.existsSync(path.join(p, "index.html")));

  if (!staticDir) {
    console.warn("No frontend build found. Skipping SPA fallback. Set PUBLIC_DIR or upload the frontend build to public_html.");
    return res.status(404).json({ message: "Frontend not deployed on this server" });
  }

  return res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
