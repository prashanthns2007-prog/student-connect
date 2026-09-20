import { execute, isDemoMode } from '../db/oracle';
import bcrypt from 'bcryptjs';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// --- Error Handler ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Mock Data Fallback ---
const MOCK_DATA = {
  users: [
    { USER_ID: "ADMIN001", PASSWORD_HASH: bcrypt.hashSync("admin123", 10), ROLE: "ADMIN", STATUS: "ACTIVE", NAME: "System Admin", EMAIL: "admin@university.edu" },
    // 10 Teachers
    ...Array.from({ length: 10 }).map((_, i) => ({
      USER_ID: `TEACHER${(i + 1).toString().padStart(3, '0')}`,
      PASSWORD_HASH: bcrypt.hashSync("teacher123", 10),
      ROLE: "TEACHER",
      STATUS: "ACTIVE",
      NAME: `Dr. Teacher ${i + 1}`,
      EMAIL: `teacher${i + 1}@university.edu`,
      TEACHER_NAME: `Dr. Teacher ${i + 1}`,
      TEACHER_EMAIL: `teacher${i + 1}@university.edu`,
      DEPT_ID: i < 5 ? "CS" : "EE",
      DESIGNATION: i === 0 ? "Professor" : i < 3 ? "Associate Professor" : "Assistant Professor"
    })),
    // 30 Students
    ...Array.from({ length: 30 }).map((_, i) => ({
      USER_ID: `STUDENT${(i + 1).toString().padStart(3, '0')}`,
      PASSWORD_HASH: bcrypt.hashSync("student123", 10),
      ROLE: "STUDENT",
      STATUS: "ACTIVE",
      NAME: `Student ${i + 1}`,
      EMAIL: `student${i + 1}@student.edu`,
      STUDENT_NAME: `Student ${i + 1}`,
      STUDENT_EMAIL: `student${i + 1}@student.edu`,
      COURSE_ID: "BTECH",
      BRANCH_ID: "CSE",
      SEMESTER: 4,
      SECTION: i < 15 ? "A" : "B",
      REGISTRATION_NO: `REG${(i + 1).toString().padStart(3, '0')}`
    })),
    { 
      USER_ID: "STAFF001", 
      PASSWORD_HASH: bcrypt.hashSync("staff123", 10), 
      ROLE: "STAFF", 
      STATUS: "ACTIVE", 
      NAME: "Alice Brown",
      EMAIL: "alice@university.edu",
      STAFF_NAME: "Alice Brown", 
      STAFF_EMAIL: "alice@university.edu", 
      ROLE_DESCRIPTION: "Registrar" 
    }
  ],
  attendance: [
    { id: "1", studentId: "STUDENT001", subjectId: "CS101", SUBJECT_NAME: "Data Structures", teacherId: "TEACHER001", ATT_DATE: "2024-03-01", status: "PRESENT" },
    { id: "2", studentId: "STUDENT001", subjectId: "CS101", SUBJECT_NAME: "Data Structures", teacherId: "TEACHER001", ATT_DATE: "2024-03-02", status: "ABSENT" }
  ],
  marks: [
    { id: "1", studentId: "STUDENT001", subjectId: "CS101", SUBJECT_NAME: "Data Structures", examType: "INTERNAL", maxMarks: 20, obtainedMarks: 18, EXAM_DATE: "2024-02-15" }
  ],
  timetable: [
    { DAY_OF_WEEK: "Monday", START_TIME: "09:00", END_TIME: "10:00", SUBJECT_NAME: "Data Structures", TEACHER_NAME: "Dr. Teacher 1", ROOM_NO: "LHC-1", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Monday", START_TIME: "10:30", END_TIME: "11:30", SUBJECT_NAME: "Digital Electronics", TEACHER_NAME: "Dr. Teacher 6", ROOM_NO: "LHC-2", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Monday", START_TIME: "14:00", END_TIME: "15:00", SUBJECT_NAME: "Machine Learning", TEACHER_NAME: "Dr. Teacher 3", ROOM_NO: "LHC-3", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Tuesday", START_TIME: "09:00", END_TIME: "10:00", SUBJECT_NAME: "Operating Systems", TEACHER_NAME: "Dr. Teacher 2", ROOM_NO: "LHC-2", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Tuesday", START_TIME: "11:00", END_TIME: "12:00", SUBJECT_NAME: "Microprocessors", TEACHER_NAME: "Dr. Teacher 7", ROOM_NO: "LAB-1", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Wednesday", START_TIME: "09:00", END_TIME: "10:00", SUBJECT_NAME: "Cyber Security", TEACHER_NAME: "Dr. Teacher 8", ROOM_NO: "LHC-2", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Wednesday", START_TIME: "13:00", END_TIME: "14:00", SUBJECT_NAME: "Algorithms", TEACHER_NAME: "Dr. Teacher 3", ROOM_NO: "LHC-3", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Thursday", START_TIME: "09:00", END_TIME: "10:00", SUBJECT_NAME: "Database Systems", TEACHER_NAME: "Dr. Teacher 4", ROOM_NO: "LHC-1", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Thursday", START_TIME: "11:00", END_TIME: "12:00", SUBJECT_NAME: "Software Engineering", TEACHER_NAME: "Dr. Teacher 9", ROOM_NO: "LHC-4", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Friday", START_TIME: "10:00", END_TIME: "11:00", SUBJECT_NAME: "Computer Networks", TEACHER_NAME: "Dr. Teacher 5", ROOM_NO: "LHC-4", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" },
    { DAY_OF_WEEK: "Friday", START_TIME: "14:00", END_TIME: "15:00", SUBJECT_NAME: "Cloud Computing", TEACHER_NAME: "Dr. Teacher 10", ROOM_NO: "LAB-2", COURSE_NAME: "BTECH", BRANCH_NAME: "CSE", SEMESTER: 4, SECTION: "A" }
  ],
  calendar: [
    { id: "1", title: "Semester Commencement", type: "IMPORTANT", startDate: "2024-01-15", endDate: "2024-01-15", description: "Classes begin for Spring 2024" },
    { id: "2", title: "Mid-Term Exams", type: "EXAM", startDate: "2024-03-10", endDate: "2024-03-15", description: "Internal assessments" },
    { id: "3", title: "Spring Break", type: "HOLIDAY", startDate: "2024-03-20", endDate: "2024-03-27", description: "Mid-semester holidays" },
    { id: "4", title: "Cultural Fest", type: "EVENT", startDate: "2024-04-05", endDate: "2024-04-07", description: "Annual cultural festival" },
    { id: "5", title: "Final Exams", type: "EXAM", startDate: "2024-05-20", endDate: "2024-06-05", description: "End semester examinations" },
    { id: "6", title: "Academic Council Meeting", type: "IMPORTANT", startDate: "2024-02-10", endDate: "2024-02-10", description: "Strategic planning for next semester" },
    { id: "7", title: "International Seminar on AI", type: "EVENT", startDate: "2024-03-25", endDate: "2024-03-25", description: "Guest speakers from industry leaders" },
    { id: "8", title: "Internal Assessment 2", type: "EXAM", startDate: "2024-04-15", endDate: "2024-04-18", description: "Second phase of internal evaluations" },
    { id: "9", title: "Labor Day", type: "HOLIDAY", startDate: "2024-05-01", endDate: "2024-05-01", description: "University closure for Labor Day" },
    { id: "10", title: "Independence Day", type: "EVENT", startDate: "2024-08-15", endDate: "2024-08-15", description: "Annual independence day celebrations and flag hoisting" }
  ],
  announcements: [
    { id: "1", title: "Exam Schedule Out", content: "Check the calendar for final exam dates.", targetRole: "ALL", createdAt: new Date().toISOString() },
    { id: "2", title: "Holiday Notice", content: "The university will remain closed on Monday for Holi celebrations.", targetRole: "ALL", createdAt: new Date().toISOString() }
  ],
  feedback: [
    { id: "1", subjectId: "CS101", rating: 5, comments: "Excellent lecture on data structures. Very clear.", createdAt: new Date().toISOString() },
    { id: "2", subjectId: "CS102", rating: 4, comments: "Good class, but the lab sessions could be more organized.", createdAt: new Date().toISOString() }
  ]
};

export const UserService = {
  async findByUserId(userId: string): Promise<any> {
    // Try Firestore first for cloud persistence
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return { USER_ID: userDoc.id, ...data };
      }
    } catch (err: any) {
      console.warn(`Firestore user fetch failed (${userId}): ${err?.message || 'Unknown error'}`);
    }

    if (isDemoMode) {
      return MOCK_DATA.users.find(u => u.USER_ID.toUpperCase() === userId.toUpperCase());
    }
    const result = await execute(
      `SELECT u.*, 
        s.NAME as STUDENT_NAME, s.EMAIL as STUDENT_EMAIL, s.COURSE_ID, s.BRANCH_ID, s.SEMESTER, s.SECTION,
        t.NAME as TEACHER_NAME, t.EMAIL as TEACHER_EMAIL, t.DEPT_ID, t.DESIGNATION,
        st.NAME as STAFF_NAME, st.EMAIL as STAFF_EMAIL
       FROM USERS u
       LEFT JOIN STUDENTS s ON u.USER_ID = s.STUDENT_ID
       LEFT JOIN TEACHERS t ON u.USER_ID = t.TEACHER_ID
       LEFT JOIN STAFF st ON u.USER_ID = st.STAFF_ID
       WHERE u.USER_ID = :userId`,
      [userId]
    );
    return result.rows?.[0];
  },

  async updatePassword(userId: string, passwordHash: string) {
    // Update Firestore if user exists there
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, { passwordHash });
      }
    } catch (err) {
      console.warn('Firestore password update failed');
    }

    if (isDemoMode) {
      const user = MOCK_DATA.users.find(u => u.USER_ID.toUpperCase() === userId.toUpperCase());
      if (user) user.PASSWORD_HASH = passwordHash;
      return;
    }
    return await execute(
      `UPDATE USERS SET PASSWORD_HASH = :passwordHash WHERE USER_ID = :userId`,
      [passwordHash, userId]
    );
  }
};

export const AcademicService = {
  async getStudentAttendance(studentId: string) {
    try {
      const q = query(
        collection(db, 'attendance'), 
        where('studentId', '==', studentId),
        orderBy('attDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ATT_DATE: data.attDate || data.ATT_DATE,
          SUBJECT_NAME: data.subjectName || data.SUBJECT_NAME,
          ...data 
        };
      });
    } catch (err) {
      console.warn('Firestore attendance fetch failed');
    }

    if (isDemoMode) return MOCK_DATA.attendance.filter(a => a.studentId === studentId);
    const result = await execute(
      `SELECT a.*, s.SUBJECT_NAME 
       FROM ATTENDANCE a
       JOIN SUBJECTS s ON a.SUBJECT_ID = s.SUBJECT_ID
       WHERE a.STUDENT_ID = :studentId
       ORDER BY a.ATT_DATE DESC`,
      [studentId]
    );
    return result.rows;
  },

  async getStudentMarks(studentId: string) {
    try {
      const q = query(
        collection(db, 'marks'), 
        where('studentId', '==', studentId),
        orderBy('examDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          EXAM_DATE: data.examDate || data.EXAM_DATE,
          SUBJECT_NAME: data.subjectName || data.SUBJECT_NAME,
          ...data 
        };
      });
    } catch (err) {
      console.warn('Firestore marks fetch failed');
    }

    if (isDemoMode) return MOCK_DATA.marks.filter(m => m.studentId === studentId);
    const result = await execute(
      `SELECT m.*, s.SUBJECT_NAME 
       FROM MARKS m
       JOIN SUBJECTS s ON m.SUBJECT_ID = s.SUBJECT_ID
       WHERE m.STUDENT_ID = :studentId
       ORDER BY m.EXAM_DATE DESC`,
      [studentId]
    );
    return result.rows;
  },

  async getCalendar() {
    try {
      const snapshot = await getDocs(query(collection(db, 'calendar'), orderBy('startDate', 'asc')));
      if (!snapshot.empty) return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || data.TITLE,
          type: data.type || data.TYPE,
          startDate: data.startDate || data.START_DATE,
          endDate: data.endDate || data.END_DATE,
          description: data.description || data.DESCRIPTION,
          ...data
        };
      });
    } catch (err) {
      console.warn('Firestore calendar fetch failed');
    }

    if (isDemoMode) return MOCK_DATA.calendar;
    const result = await execute(`SELECT * FROM ACADEMIC_CALENDAR ORDER BY START_DATE ASC`);
    return result.rows;
  },

  async getAnnouncements(role: string) {
    try {
      const q = query(
        collection(db, 'announcements'),
        where('targetRole', 'in', [role, 'ALL']),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ANNOUNCEMENT_ID: d.id,
          TITLE: data.title || '',
          CONTENT: data.content || '',
          TARGET_ROLE: data.targetRole || 'ALL',
          CREATED_AT: data.createdAt || new Date().toISOString(),
          ...data 
        };
      });
    } catch (err: any) {
      console.warn(`Firestore announcements fetch failed: ${err?.message || 'Unknown error'}`);
    }

    if (isDemoMode) return MOCK_DATA.announcements;
    const result = await execute(
      `SELECT * FROM ANNOUNCEMENTS 
       WHERE TARGET_ROLE = :role OR TARGET_ROLE = 'ALL' 
       ORDER BY CREATED_AT DESC`,
      [role]
    );
    return result.rows;
  },

  async getStudentTimetable(studentId: string) {
    if (isDemoMode) return MOCK_DATA.timetable;
    const result = await execute(
      `SELECT t.*, s.SUBJECT_NAME, co.COURSE_NAME, b.BRANCH_NAME, tea.NAME as TEACHER_NAME
       FROM TIMETABLE t
       JOIN SUBJECTS s ON t.SUBJECT_ID = s.SUBJECT_ID
       JOIN COURSES co ON t.COURSE_ID = co.COURSE_ID
       JOIN BRANCHES b ON t.BRANCH_ID = b.BRANCH_ID
       JOIN TEACHERS tea ON t.TEACHER_ID = tea.TEACHER_ID
       JOIN STUDENTS stu ON t.COURSE_ID = stu.COURSE_ID AND t.BRANCH_ID = stu.BRANCH_ID AND t.SEMESTER = stu.SEMESTER AND t.SECTION = stu.SECTION
       WHERE stu.STUDENT_ID = :studentId
       ORDER BY CASE 
         WHEN DAY_OF_WEEK = 'Monday' THEN 1
         WHEN DAY_OF_WEEK = 'Tuesday' THEN 2
         WHEN DAY_OF_WEEK = 'Wednesday' THEN 3
         WHEN DAY_OF_WEEK = 'Thursday' THEN 4
         WHEN DAY_OF_WEEK = 'Friday' THEN 5
         WHEN DAY_OF_WEEK = 'Saturday' THEN 6
         WHEN DAY_OF_WEEK = 'Sunday' THEN 7
       END, START_TIME ASC`,
      [studentId]
    );
    return result.rows;
  },

  async getTeacherTimetable(teacherId: string) {
    if (isDemoMode) return MOCK_DATA.timetable;
    const result = await execute(
      `SELECT t.*, s.SUBJECT_NAME, co.COURSE_NAME, b.BRANCH_NAME
       FROM TIMETABLE t
       JOIN SUBJECTS s ON t.SUBJECT_ID = s.SUBJECT_ID
       JOIN COURSES co ON t.COURSE_ID = co.COURSE_ID
       JOIN BRANCHES b ON t.BRANCH_ID = b.BRANCH_ID
       WHERE t.TEACHER_ID = :teacherId
       ORDER BY CASE 
         WHEN DAY_OF_WEEK = 'Monday' THEN 1
         WHEN DAY_OF_WEEK = 'Tuesday' THEN 2
         WHEN DAY_OF_WEEK = 'Wednesday' THEN 3
         WHEN DAY_OF_WEEK = 'Thursday' THEN 4
         WHEN DAY_OF_WEEK = 'Friday' THEN 5
         WHEN DAY_OF_WEEK = 'Saturday' THEN 6
         WHEN DAY_OF_WEEK = 'Sunday' THEN 7
       END, START_TIME ASC`,
      [teacherId]
    );
    return result.rows;
  }
};

export const AdminService = {
  async getStats() {
    if (isDemoMode) return { students: 1, teachers: 1, staff: 1, subjects: 1, courses: 1 };
    const students = await execute(`SELECT COUNT(*) as COUNT FROM STUDENTS`);
    const teachers = await execute(`SELECT COUNT(*) as COUNT FROM TEACHERS`);
    const staff = await execute(`SELECT COUNT(*) as COUNT FROM STAFF`);
    const subjects = await execute(`SELECT COUNT(*) as COUNT FROM SUBJECTS`);
    const courses = await execute(`SELECT COUNT(*) as COUNT FROM COURSES`);

    return {
      students: (students.rows?.[0] as any)?.COUNT || 0,
      teachers: (teachers.rows?.[0] as any)?.COUNT || 0,
      staff: (staff.rows?.[0] as any)?.COUNT || 0,
      subjects: (subjects.rows?.[0] as any)?.COUNT || 0,
      courses: (courses.rows?.[0] as any)?.COUNT || 0,
    };
  },

  async getAllUsers() {
    try {
      const snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      if (!snapshot.empty) return snapshot.docs.map(d => ({ 
        USER_ID: d.id, 
        ...d.data(),
        // Ensure NAME and EMAIL are mapped if stored in lowercase in Firestore
        NAME: d.data().name || d.data().NAME,
        EMAIL: d.data().email || d.data().EMAIL,
        ROLE: d.data().role || d.data().ROLE,
        STATUS: d.data().status || d.data().STATUS
      }));
    } catch (err) {
      console.warn('Firestore users fetch failed');
    }

    if (isDemoMode) return MOCK_DATA.users;
    const result = await execute(
      `SELECT u.USER_ID, u.ROLE, u.STATUS, u.CREATED_AT,
        COALESCE(s.NAME, t.NAME, st.NAME) as NAME,
        COALESCE(s.EMAIL, t.EMAIL, st.EMAIL) as EMAIL
       FROM USERS u
       LEFT JOIN STUDENTS s ON u.USER_ID = s.STUDENT_ID
       LEFT JOIN TEACHERS t ON u.USER_ID = t.TEACHER_ID
       LEFT JOIN STAFF st ON u.USER_ID = st.STAFF_ID
       ORDER BY u.CREATED_AT DESC`
    );
    return result.rows;
  },

  async getAllStudents() {
    if (isDemoMode) return MOCK_DATA.users.filter(u => u.ROLE === 'STUDENT');
    const result = await execute(
      `SELECT s.*, u.STATUS, u.ROLE
       FROM STUDENTS s
       JOIN USERS u ON s.STUDENT_ID = u.USER_ID`
    );
    return result.rows;
  },

  async getAllTeachers() {
    if (isDemoMode) return MOCK_DATA.users.filter(u => u.ROLE === 'TEACHER');
    const result = await execute(
      `SELECT t.*, u.STATUS, u.ROLE
       FROM TEACHERS t
       JOIN USERS u ON t.TEACHER_ID = u.USER_ID`
    );
    return result.rows;
  },

  async createUser(userData: any) {
    // Persistent Cloud Write
    try {
      await setDoc(doc(db, 'users', userData.userId), {
        ...userData,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Firestore user creation failed');
    }

    if (isDemoMode) {
      const newUser = { 
        USER_ID: userData.userId,
        PASSWORD_HASH: userData.passwordHash,
        ROLE: userData.role,
        NAME: userData.name,
        EMAIL: userData.email,
        STATUS: 'ACTIVE', 
        CREATED_AT: new Date().toISOString(),
        ...userData 
      };
      MOCK_DATA.users.push(newUser);
      return newUser;
    }
    
    // 1. Create entry in USERS table
    await execute(
      `INSERT INTO USERS (USER_ID, PASSWORD_HASH, ROLE, STATUS) VALUES (:id, :hash, :role, 'ACTIVE')`,
      [userData.userId, userData.passwordHash, userData.role]
    );

    // 2. Create entry in profile table based on role
    if (userData.role === 'STUDENT') {
      await execute(
        `INSERT INTO STUDENTS (STUDENT_ID, NAME, EMAIL, COURSE_ID, BRANCH_ID, SEMESTER, SECTION, REGISTRATION_NO) 
         VALUES (:id, :name, :email, :courseId, :branchId, :semester, :section, :regNo)`,
        [userData.userId, userData.name, userData.email, userData.courseId, userData.branchId, userData.semester, userData.section, userData.registrationNo]
      );
    } else if (userData.role === 'TEACHER') {
      await execute(
        `INSERT INTO TEACHERS (TEACHER_ID, NAME, EMAIL, DEPT_ID, DESIGNATION) 
         VALUES (:id, :name, :email, :deptId, :designation)`,
        [userData.userId, userData.name, userData.email, userData.deptId, userData.designation]
      );
    } else if (userData.role === 'STAFF') {
      await execute(
        `INSERT INTO STAFF (STAFF_ID, NAME, EMAIL, ROLE_DESCRIPTION) 
         VALUES (:id, :name, :email, :roleDescription)`,
        [userData.userId, userData.name, userData.email, userData.roleDescription]
      );
    }
    return userData;
  },

  async updateUserStatus(userId: string, status: string) {
    if (isDemoMode) {
      const user = MOCK_DATA.users.find(u => u.USER_ID.toUpperCase() === userId.toUpperCase());
      if (user) user.STATUS = status;
      return;
    }
    return await execute(`UPDATE USERS SET STATUS = :status WHERE USER_ID = :id`, [status, userId]);
  },

  async createAnnouncement(announcementData: any) {
    if (isDemoMode) {
      const newAnnouncement = { 
        id: Math.random().toString(), 
        ...announcementData, 
        CREATED_AT: new Date().toISOString() 
      };
      MOCK_DATA.announcements.unshift(newAnnouncement);
      return newAnnouncement;
    }
    return await execute(
      `INSERT INTO ANNOUNCEMENTS (TITLE, CONTENT, TARGET_ROLE, CREATED_BY) 
       VALUES (:title, :content, :targetRole, :createdBy)`,
      [announcementData.title, announcementData.content, announcementData.targetRole, announcementData.createdBy]
    );
  },

  async bulkImportStudents(students: any[]) {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    for (const student of students) {
      try {
        if (!student.USER_ID || !student.NAME || !student.EMAIL) {
          throw new Error(`Missing required fields (USER_ID, NAME, EMAIL)`);
        }
        
        // Check for duplicate ID
        const existing = await UserService.findByUserId(student.USER_ID);
        if (existing) {
          throw new Error(`User ID ${student.USER_ID} already exists`);
        }
        
        const passwordHash = student.PASSWORD_HASH || bcrypt.hashSync("student123", 10);
        
        await this.createUser({
          userId: student.USER_ID,
          passwordHash,
          role: 'STUDENT',
          name: student.NAME,
          email: student.EMAIL,
          courseId: student.COURSE_ID || 'BTECH',
          branchId: student.BRANCH_ID || 'CSE',
          semester: Number(student.SEMESTER) || 1,
          section: student.SECTION || 'A',
          registrationNo: student.REGISTRATION_NO || student.USER_ID
        });
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${students.indexOf(student) + 1}: ${err.message}`);
      }
    }
    return results;
  },

  async bulkImportTeachers(teachers: any[]) {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    for (const teacher of teachers) {
      try {
        if (!teacher.USER_ID || !teacher.NAME || !teacher.EMAIL) {
          throw new Error(`Missing required fields (USER_ID, NAME, EMAIL)`);
        }
        
        // Check for duplicate ID
        const existing = await UserService.findByUserId(teacher.USER_ID);
        if (existing) {
          throw new Error(`User ID ${teacher.USER_ID} already exists`);
        }
        
        const passwordHash = teacher.PASSWORD_HASH || bcrypt.hashSync("teacher123", 10);
        
        await this.createUser({
          userId: teacher.USER_ID,
          passwordHash,
          role: 'TEACHER',
          name: teacher.NAME,
          email: teacher.EMAIL,
          deptId: teacher.DEPT_ID || 'CS',
          designation: teacher.DESIGNATION || 'Assistant Professor'
        });
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${teachers.indexOf(teacher) + 1}: ${err.message}`);
      }
    }
    return results;
  }
};

export const TeacherService = {
  async getTeacherSubjects(teacherId: string) {
    if (isDemoMode) {
      // Return a set of unique subjects from the timetable mock for demo
      const subjects = MOCK_DATA.timetable
        .filter(t => t.TEACHER_NAME.includes('Teacher')) // Simple filter for demo
        .map(t => ({ 
          SUBJECT_ID: 'CS101', // Mock ID
          SUBJECT_NAME: t.SUBJECT_NAME,
          COURSE_ID: t.COURSE_NAME,
          BRANCH_ID: t.BRANCH_NAME,
          SEMESTER: t.SEMESTER,
          SECTION: t.SECTION 
        }));
      return Array.from(new Set(subjects.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
    }
    const result = await execute(
      `SELECT DISTINCT s.SUBJECT_ID, s.SUBJECT_NAME, t.COURSE_ID, t.BRANCH_ID, t.SEMESTER, t.SECTION
       FROM TIMETABLE t
       JOIN SUBJECTS s ON t.SUBJECT_ID = s.SUBJECT_ID
       WHERE t.TEACHER_ID = :teacherId`,
      [teacherId]
    );
    return result.rows;
  },

  async getStudentsForSubject(courseId: string, branchId: string, semester: number, section: string) {
    if (isDemoMode) {
      return MOCK_DATA.users
        .filter((u: any) => u.ROLE === 'STUDENT' && u.SECTION === section)
        .map((u: any) => ({
          STUDENT_ID: u.USER_ID,
          NAME: u.STUDENT_NAME,
          REGISTRATION_NO: u.REGISTRATION_NO
        }));
    }
    const result = await execute(
      `SELECT STUDENT_ID, NAME, REGISTRATION_NO 
       FROM STUDENTS 
       WHERE COURSE_ID = :courseId AND BRANCH_ID = :branchId AND SEMESTER = :semester AND SECTION = :section
       ORDER BY NAME ASC`,
      [courseId, branchId, semester, section]
    );
    return result.rows;
  },

  async submitAttendance(data: any[]) {
    if (isDemoMode) {
      data.forEach(item => {
        MOCK_DATA.attendance.push({
          id: Math.random().toString(),
          ...item
        });
      });
      return;
    }
    for (const item of data) {
      await execute(
        `INSERT INTO ATTENDANCE (STUDENT_ID, SUBJECT_ID, TEACHER_ID, ATT_DATE, STATUS, REMARKS)
         VALUES (:studentId, :subjectId, :teacherId, TO_DATE(:attDate, 'YYYY-MM-DD'), :status, :remarks)`,
        [item.studentId, item.subjectId, item.teacherId, item.attDate, item.status, item.remarks]
      );
    }
  },

  async submitMarks(data: any[]) {
    if (isDemoMode) {
      data.forEach(item => {
        MOCK_DATA.marks.push({
          id: Math.random().toString(),
          ...item
        });
      });
      return;
    }
    for (const item of data) {
      await execute(
        `INSERT INTO MARKS (STUDENT_ID, SUBJECT_ID, EXAM_TYPE, MAX_MARKS, OBTAINED_MARKS, TEACHER_ID, EXAM_DATE)
         VALUES (:studentId, :subjectId, :examType, :maxMarks, :obtainedMarks, :teacherId, TO_DATE(:examDate, 'YYYY-MM-DD'))`,
        [item.studentId, item.subjectId, item.examType, item.maxMarks, item.obtainedMarks, item.teacherId, item.examDate]
      );
    }
  }
};

export const FeedbackService = {
  async submitFeedback(feedbackData: any) {
    try {
      const docRef = await addDoc(collection(db, 'feedback'), {
        ...feedbackData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...feedbackData };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'feedback');
    }

    if (isDemoMode) {
      const newFeedback = {
        id: Math.random().toString(),
        ...feedbackData,
        createdAt: new Date().toISOString()
      };
      MOCK_DATA.feedback.unshift(newFeedback);
      return newFeedback;
    }
    return await execute(
      `INSERT INTO SUBJECT_FEEDBACK (SUBJECT_ID, RATING, COMMENTS)
       VALUES (:subjectId, :rating, :comments)`,
      [feedbackData.subjectId, feedbackData.rating, feedbackData.comments]
    );
  },

  async getAllFeedback() {
    if (isDemoMode) return MOCK_DATA.feedback;
    const result = await execute(
      `SELECT f.*, s.SUBJECT_NAME
       FROM SUBJECT_FEEDBACK f
       JOIN SUBJECTS s ON f.SUBJECT_ID = s.SUBJECT_ID
       ORDER BY f.CREATED_AT DESC`
    );
    return result.rows;
  },

  async getFeedbackBySubject(subjectId: string) {
    if (isDemoMode) return MOCK_DATA.feedback.filter(f => f.subjectId === subjectId);
    const result = await execute(
      `SELECT f.*, s.SUBJECT_NAME
       FROM SUBJECT_FEEDBACK f
       JOIN SUBJECTS s ON f.SUBJECT_ID = s.SUBJECT_ID
       WHERE f.SUBJECT_ID = :subjectId
       ORDER BY f.CREATED_AT DESC`,
      [subjectId]
    );
    return result.rows;
  }
};
