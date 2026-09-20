export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'STAFF';
export type AccountStatus = 'ACTIVE' | 'DISABLED';

export interface User {
  userId: string;
  role: UserRole;
  status: AccountStatus;
  name: string;
  email: string;
}

export interface Student extends User {
  courseId: string;
  branchId: string;
  semester: number;
  section: string;
  registrationNo: string;
  admissionDate: string;
}

export interface Teacher extends User {
  deptId: string;
  designation: string;
}

export interface Staff extends User {
  roleDescription: string;
}

export interface Department {
  deptId: string;
  deptName: string;
}

export interface Course {
  courseId: string;
  courseName: string;
}

export interface Subject {
  subjectId: string;
  subjectName: string;
  courseId: string;
  branchId: string;
  semester: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
}

export interface MarkRecord {
  id: string;
  studentId: string;
  subjectId: string;
  examType: 'INTERNAL' | 'ASSIGNMENT' | 'FINAL';
  maxMarks: number;
  obtainedMarks: number;
  date: string;
}

export interface TimetableEntry {
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room: string;
  courseId: string;
  branchId: string;
  semester: number;
  section: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'SEMINAR' | 'IMPORTANT';
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: UserRole | 'ALL';
  createdAt: string;
}
