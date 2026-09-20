import React, { useState, useEffect } from 'react';
import { CheckSquare, Users, Save, Calendar, Filter, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface Subject {
  SUBJECT_ID: string;
  SUBJECT_NAME: string;
  COURSE_ID: string;
  BRANCH_ID: string;
  SEMESTER: number;
  SECTION: string;
}

interface Student {
  STUDENT_ID: string;
  NAME: string;
  REGISTRATION_NO: string;
  status?: 'PRESENT' | 'ABSENT';
}

const RecordAttendance: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/teacher/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (err) {
        showNotification('Failed to load subjects', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teacher/students?courseId=${subject.COURSE_ID}&branchId=${subject.BRANCH_ID}&semester=${subject.SEMESTER}&section=${subject.SECTION}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.map((s: any) => ({ ...s, status: 'PRESENT' })));
      }
    } catch (err) {
      showNotification('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.STUDENT_ID === studentId 
        ? { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } 
        : s
    ));
  };

  const handleSubmit = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s.STUDENT_ID,
        subjectId: selectedSubject.SUBJECT_ID,
        teacherId: user?.userId,
        attDate: date,
        status: s.status,
        remarks: ''
      }));

      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });

      if (res.ok) {
        showNotification('Attendance recorded successfully', 'success');
        setSelectedSubject(null);
        setStudents([]);
      } else {
        showNotification('Failed to save attendance', 'error');
      }
    } catch (err) {
      showNotification('Server error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Attendance Recording</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Verify scholarly presence for your assigned modules.</p>
        </div>
        {selectedSubject && (
          <button 
            onClick={() => setSelectedSubject(null)}
            className="academic-button-secondary !px-5 !py-2 !text-xs uppercase tracking-widest"
          >
            Switch Subject
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedSubject ? (
          <motion.div 
            key="subjects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.length > 0 ? subjects.map((sub, idx) => (
              <button
                key={idx}
                onClick={() => handleSubjectSelect(sub)}
                className="academic-card p-8 text-left group hover:scale-[1.02] transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Users size={22} />
                  </div>
                  <ChevronRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sub.SUBJECT_NAME}</h3>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {sub.COURSE_ID} • {sub.BRANCH_ID}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                    Semester {sub.SEMESTER} • Section {sub.SECTION}
                  </p>
                </div>
              </button>
            )) : (
              <div className="col-span-full py-32 academic-card border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center">
                <Filter className="text-slate-200 mb-6" size={48} />
                <p className="text-slate-500 font-serif text-xl">No Assigned Modules</p>
                <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">Please contact the Registrar if your assignments are missing.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="academic-card overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#FDFDFD] dark:bg-slate-900/50">
              <div>
                <h3 className="font-serif text-2xl text-slate-900 dark:text-white">{selectedSubject.SUBJECT_NAME}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
                  {selectedSubject.COURSE_ID} • Section {selectedSubject.SECTION} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">{students.length} Scholars Enrolled</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold tracking-tight text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                  />
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="academic-button-primary !px-8 !py-3 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSubmitting ? 'Finalizing...' : 'Submit Records'}
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Registration No</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Scholar Name</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {students.map((student) => (
                    <tr key={student.STUDENT_ID} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5">
                         <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">{student.REGISTRATION_NO}</span>
                      </td>
                      <td className="px-8 py-5">
                         <span className="font-bold text-slate-900 dark:text-slate-100">{student.NAME}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleStatus(student.STUDENT_ID)}
                            className={`w-32 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                              student.status === 'PRESENT' 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-sm' 
                                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-800/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-sm'
                            }`}
                          >
                            {student.status}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student) => (
                <div key={student.STUDENT_ID} className="p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">{student.REGISTRATION_NO}</span>
                    <button
                      onClick={() => toggleStatus(student.STUDENT_ID)}
                      className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                        student.status === 'PRESENT' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/30' 
                          : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-800/30'
                      }`}
                    >
                      {student.status}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{student.NAME}</h4>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordAttendance;
