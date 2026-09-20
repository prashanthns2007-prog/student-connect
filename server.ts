import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole } from "./src/types";
import { initialize } from "./src/db/oracle";
import { UserService, AcademicService, AdminService, TeacherService, FeedbackService } from "./src/services/dbService";

const JWT_SECRET = process.env.JWT_SECRET || "academic-erp-secret-key-2024";

async function startServer() {
  // Initialize Oracle connection pool
  try {
    await initialize();
    console.log("Database initialized");
  } catch (err) {
    console.warn("Database initialization failed. Mock data or fallback logic might be needed for preview if no Oracle instance is available.");
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const authorize = (roles: UserRole[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden" });
    }
    next();
  };

  app.post("/api/login", async (req, res) => {
    const { userId, password } = req.body;
    try {
      const user = await UserService.findByUserId(userId);
      if (!user) return res.status(400).json({ error: "User not found" });
      if (user.STATUS === "DISABLED") return res.status(403).json({ error: "Account disabled" });

      const isValid = await bcrypt.compare(password, user.PASSWORD_HASH);
      if (!isValid) return res.status(400).json({ error: "Invalid password" });

      const name = user.STUDENT_NAME || user.TEACHER_NAME || user.STAFF_NAME || user.NAME || "User";
      const token = jwt.sign({ userId: user.USER_ID, role: user.ROLE, name }, JWT_SECRET, { expiresIn: "1h" });
      
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: "none" 
      });
      res.json({ userId: user.USER_ID, role: user.ROLE, name });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/me", authenticate, async (req: any, res) => {
    try {
      const user = await UserService.findByUserId(req.user.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const { PASSWORD_HASH, ...safeUser } = user;
      res.json({
        userId: safeUser.USER_ID,
        role: safeUser.ROLE,
        name: safeUser.STUDENT_NAME || safeUser.TEACHER_NAME || safeUser.STAFF_NAME || safeUser.NAME,
        email: safeUser.STUDENT_EMAIL || safeUser.TEACHER_EMAIL || safeUser.STAFF_EMAIL || safeUser.EMAIL,
        ...safeUser
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/student/attendance", authenticate, authorize(["STUDENT"]), async (req: any, res) => {
    const records = await AcademicService.getStudentAttendance(req.user.userId);
    res.json(records);
  });

  app.get("/api/student/marks", authenticate, authorize(["STUDENT"]), async (req: any, res) => {
    const records = await AcademicService.getStudentMarks(req.user.userId);
    res.json(records);
  });

  app.get("/api/student/timetable", authenticate, authorize(["STUDENT"]), async (req: any, res) => {
    const timetable = await AcademicService.getStudentTimetable(req.user.userId);
    res.json(timetable);
  });

  app.get("/api/teacher/timetable", authenticate, authorize(["TEACHER"]), async (req: any, res) => {
    const timetable = await AcademicService.getTeacherTimetable(req.user.userId);
    res.json(timetable);
  });

  app.get("/api/calendar", authenticate, async (req, res) => {
    const calendar = await AcademicService.getCalendar();
    res.json(calendar);
  });

  app.get("/api/announcements", authenticate, async (req: any, res) => {
    const announcements = await AcademicService.getAnnouncements(req.user.role);
    res.json(announcements);
  });

  app.post("/api/change-password", authenticate, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const user = await UserService.findByUserId(req.user.userId);
      if (!user) return res.status(404).json({ error: "User not found in registry" });
      
      const isValid = await bcrypt.compare(currentPassword, user.PASSWORD_HASH);
      if (!isValid) return res.status(400).json({ error: "Invalid current password" });

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await UserService.updatePassword(req.user.userId, passwordHash);
      res.json({ message: "Password updated" });
    } catch (err) {
      res.status(500).json({ error: "Registry synchronization failed" });
    }
  });

  app.get("/api/admin/stats", authenticate, authorize(["ADMIN"]), async (req, res) => {
    const stats = await AdminService.getStats();
    res.json(stats);
  });

  app.get("/api/admin/users", authenticate, authorize(["ADMIN"]), async (req, res) => {
    try {
      const users = await AdminService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authenticate, authorize(["ADMIN"]), async (req, res) => {
    const { userId, password, role, name, email, ...extra } = req.body;
    try {
      const passwordHash = await bcrypt.hash(password || "password123", 10);
      const user = await AdminService.createUser({ userId, passwordHash, role, name, email, ...extra });
      res.json({ message: "User created successfully", user });
    } catch (err) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id/status", authenticate, authorize(["ADMIN"]), async (req, res) => {
    const { status } = req.body;
    try {
      await AdminService.updateUserStatus(req.params.id, status);
      res.json({ message: "User status updated" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", authenticate, authorize(["ADMIN"]), async (req, res) => {
    const { newPassword } = req.body;
    try {
      const passwordHash = await bcrypt.hash(newPassword || "password123", 10);
      await UserService.updatePassword(req.params.id, passwordHash);
      res.json({ message: "Password reset successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.post("/api/admin/announcements", authenticate, authorize(["ADMIN"]), async (req: any, res) => {
    const { title, content, targetRole } = req.body;
    try {
      await AdminService.createAnnouncement({ 
        title, 
        content, 
        targetRole, 
        createdBy: req.user.userId 
      });
      res.json({ message: "Announcement posted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to post announcement" });
    }
  });

  app.post("/api/admin/bulk-import/students", authenticate, authorize(["ADMIN"]), async (req: any, res) => {
    try {
      const results = await AdminService.bulkImportStudents(req.body.data);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Bulk import failed" });
    }
  });

  app.post("/api/admin/bulk-import/teachers", authenticate, authorize(["ADMIN"]), async (req: any, res) => {
    try {
      const results = await AdminService.bulkImportTeachers(req.body.data);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Bulk import failed" });
    }
  });

  app.get("/api/admin/export/students", authenticate, authorize(["ADMIN"]), async (req: any, res) => {
    try {
      const students = await AdminService.getAllStudents();
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: "Export failed" });
    }
  });

  app.get("/api/admin/export/teachers", authenticate, authorize(["ADMIN"]), async (req: any, res) => {
    try {
      const teachers = await AdminService.getAllTeachers();
      res.json(teachers);
    } catch (err) {
      res.status(500).json({ error: "Export failed" });
    }
  });

  // Feedback Routes
  app.post("/api/feedback", authenticate, authorize(["STUDENT"]), async (req: any, res) => {
    try {
      const feedback = await FeedbackService.submitFeedback(req.body);
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/admin/feedback", authenticate, authorize(["ADMIN", "STAFF"]), async (req: any, res) => {
    try {
      const feedback = await FeedbackService.getAllFeedback();
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Feedback Routes
  app.get("/api/teacher/subjects", authenticate, authorize(["TEACHER"]), async (req: any, res) => {
    try {
      const subjects = await TeacherService.getTeacherSubjects(req.user.userId);
      res.json(subjects);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.get("/api/teacher/students", authenticate, authorize(["TEACHER"]), async (req: any, res) => {
    const { courseId, branchId, semester, section } = req.query;
    try {
      const students = await TeacherService.getStudentsForSubject(
        courseId as string, 
        branchId as string, 
        Number(semester), 
        section as string
      );
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/teacher/attendance", authenticate, authorize(["TEACHER"]), async (req: any, res) => {
    try {
      await TeacherService.submitAttendance(req.body.records);
      res.json({ message: "Attendance submitted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit attendance" });
    }
  });

  app.post("/api/teacher/marks", authenticate, authorize(["TEACHER"]), async (req: any, res) => {
    try {
      await TeacherService.submitMarks(req.body.records);
      res.json({ message: "Marks submitted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit marks" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
