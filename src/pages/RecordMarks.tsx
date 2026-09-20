import React, { useState, useEffect } from 'react';
import { FileText, Users, Save, Calendar, Filter, ChevronRight, Hash } from 'lucide-react';
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
  obtainedMarks?: string;
}

const RecordMarks: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const [examConfig, setExamConfig] = useState({
    examType: 'INTERNAL',
    maxMarks: '20',
    examDate: new Date().toISOString().split('T')[0]
  });

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
        setStudents(data.map((s: any) => ({ ...s, obtainedMarks: '' })));
      }
    } catch (err) {
      showNotification('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setStudents(prev => prev.map(s => 
      s.STUDENT_ID === studentId ? { ...s, obtainedMarks: value } : s
    ));
  };

  const handleSubmit = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s.STUDENT_ID,
        subjectId: selectedSubject.SUBJECT_ID,
        examType: examConfig.examType,
        maxMarks: Number(examConfig.maxMarks),
        obtainedMarks: Number(s.obtainedMarks) || 0,
        teacherId: user?.userId,
        examDate: examConfig.examDate
      }));

      const res = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });

      if (res.ok) {
        showNotification('Marks recorded successfully', 'success');
        setSelectedSubject(null);
        setStudents([]);
      } else {
        showNotification('Failed to save marks', 'error');
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
          <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Academic Grading</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Evaluate scholarly performance for modular assessments.</p>
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
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <FileText size={22} />
                  </div>
                  <ChevronRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{sub.SUBJECT_NAME}</h3>
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
              <div className="col-span-full py-32 academic-card border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                <Filter className="text-slate-200 dark:text-slate-700 mb-6" size={48} />
                <p className="text-slate-500 dark:text-slate-400 font-serif text-xl">No Assigned Modules</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 font-medium tracking-wide">Grading registers will appear here once module assignments are confirmed.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="marks-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="academic-card p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end bg-[#FDFDFD] dark:bg-slate-900/50">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Assessment Tier</label>
                <select 
                  value={examConfig.examType}
                  onChange={(e) => setExamConfig({...examConfig, examType: e.target.value})}
                  className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-900/20 focus:border-purple-500 text-sm font-bold tracking-tight transition-all shadow-sm dark:text-white"
                >
                  <option value="INTERNAL">Internal Assessment</option>
                  <option value="MID_TERM">Mid Term Examination</option>
                  <option value="FINAL">Final Comprehensive</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Max Score</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" size={16} />
                  <input 
                    type="number"
                    value={examConfig.maxMarks}
                    onChange={(e) => setExamConfig({...examConfig, maxMarks: e.target.value})}
                    className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-900/20 focus:border-purple-500 text-sm font-bold tracking-tight shadow-sm transition-all dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Exam Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" size={16} />
                  <input 
                    type="date"
                    value={examConfig.examDate}
                    onChange={(e) => setExamConfig({...examConfig, examDate: e.target.value})}
                    className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-900/20 focus:border-purple-500 text-sm font-bold tracking-tight shadow-sm transition-all dark:text-white"
                  />
                </div>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="academic-button-primary !px-8 !py-3 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 disabled:opacity-50 !bg-purple-600 hover:!bg-purple-700 dark:!bg-purple-500 dark:hover:!bg-purple-400 sm:col-span-2 md:col-span-1"
              >
                <Save size={18} />
                {isSubmitting ? 'Recording...' : 'Publish Results'}
              </button>
            </div>

            <div className="academic-card overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-[#FDFDFD] dark:bg-slate-900/50">
                <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Grading Ledger</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide mt-1">{selectedSubject.SUBJECT_NAME} • Section {selectedSubject.SECTION}</p>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Registration ID</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Scholar Name</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] w-48 text-center">Score Assessment</th>
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
                            <div className="relative group">
                               <input
                                 type="number"
                                 min="0"
                                 max={examConfig.maxMarks}
                                 value={student.obtainedMarks}
                                 onChange={(e) => handleMarkChange(student.STUDENT_ID, e.target.value)}
                                 placeholder="0"
                                 className="w-32 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-900/20 focus:border-purple-500 text-center font-bold text-slate-700 dark:text-white shadow-sm transition-all"
                               />
                               <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 dark:text-slate-600">
                                 / {examConfig.maxMarks}
                               </div>
                            </div>
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
                      <div className="relative group">
                        <input
                          type="number"
                          min="0"
                          max={examConfig.maxMarks}
                          value={student.obtainedMarks}
                          onChange={(e) => handleMarkChange(student.STUDENT_ID, e.target.value)}
                          placeholder="0"
                          className="w-24 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-4 focus:ring-purple-50 dark:focus:ring-purple-900/20 focus:border-purple-500 text-center font-bold text-slate-700 dark:text-white shadow-sm transition-all text-xs"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300 dark:text-slate-600">
                          / {examConfig.maxMarks}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{student.NAME}</h4>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordMarks;
