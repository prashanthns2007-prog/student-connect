import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Filter, AlertCircle, PieChart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface AttendanceRecord {
  id: string;
  SUBJECT_NAME: string;
  ATT_DATE: string;
  status: 'PRESENT' | 'ABSENT';
}

const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('/api/student/attendance');
        if (res.ok) {
          const data = await res.json();
          setAttendance(data);
        }
      } catch (err) {
        showNotification('Failed to load attendance', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const totalClasses = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-slate-900 tracking-tight">Academic Attendance</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Detailed log of your presence across registered courses.</p>
        </div>

        <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <PieChart size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Aggregate</p>
              <p className="text-2xl font-serif text-slate-900">{percentage}%</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Sessions</p>
            <p className="text-2xl font-serif text-slate-900">{presentCount}<span className="text-slate-300 mx-1">/</span>{totalClasses}</p>
          </div>
        </div>
      </div>

      <div className="academic-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#FDFDFD]">
          <h3 className="font-serif text-2xl text-slate-900">Attendance Log</h3>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Filter size={14} />
            Filter Records
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : attendance.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Session Date</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Course Module</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((record, idx) => (
                    <motion.tr 
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-white border border-slate-100 rounded-lg text-slate-400 shadow-sm">
                            <Calendar size={16} />
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            {new Date(record.ATT_DATE).toLocaleDateString(undefined, { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-slate-900">{record.SUBJECT_NAME}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] ${
                            record.status === 'PRESENT' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                              : 'bg-rose-50 text-rose-600 border border-rose-100/50'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {attendance.map((record, idx) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 flex flex-col gap-4 hover:bg-slate-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 shadow-sm scale-90">
                        <Calendar size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {new Date(record.ATT_DATE).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] ${
                      record.status === 'PRESENT' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100/50'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{record.SUBJECT_NAME}</h4>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
               <AlertCircle size={32} />
            </div>
            <p className="text-slate-500 font-serif text-xl">No Attendance Records Found</p>
            <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">Detailed logs will appear here once faculty records your presence.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
