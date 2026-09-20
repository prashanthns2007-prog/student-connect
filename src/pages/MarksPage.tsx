import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Filter, AlertCircle, BarChart2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface MarkRecord {
  id: string;
  SUBJECT_NAME: string;
  examType: string;
  maxMarks: number;
  obtainedMarks: number;
  EXAM_DATE: string;
}

const MarksPage: React.FC = () => {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch('/api/student/marks');
        if (res.ok) {
          const data = await res.json();
          setMarks(data);
        }
      } catch (err) {
        showNotification('Failed to load marks', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const totalPossible = marks.reduce((acc, m) => acc + m.maxMarks, 0);
  const totalObtained = marks.reduce((acc, m) => acc + m.obtainedMarks, 0);
  const overallPercentage = totalPossible > 0 ? ((totalObtained / totalPossible) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-slate-900 tracking-tight">Academic Achievement</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Consolidated transcript of your modular examinations.</p>
        </div>

        <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <BarChart2 size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Aggregate</p>
              <p className="text-2xl font-serif text-slate-900">{overallPercentage}%</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Score</p>
              <p className="text-2xl font-serif text-slate-900">{totalObtained}<span className="text-slate-300 mx-1">/</span>{totalPossible}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="academic-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-[#FDFDFD]">
          <h3 className="font-serif text-2xl text-slate-900">Transcript Details</h3>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Sorted by Examination Date
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : marks.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Course Module</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Examination Tier</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Score Portfolio</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {marks.map((record, idx) => {
                    const percent = ((record.obtainedMarks / record.maxMarks) * 100).toFixed(0);
                    const statusColor = Number(percent) >= 75 ? 'emerald' : Number(percent) >= 40 ? 'indigo' : 'rose';
                    
                    return (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <span className="font-bold text-slate-900 block mb-0.5">{record.SUBJECT_NAME}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Recorded: {new Date(record.EXAM_DATE).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200/50">
                            {record.examType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-900 text-base">{record.obtainedMarks} <span className="text-slate-300 font-medium">/</span> {record.maxMarks}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-4">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.2 + idx * 0.05 }}
                                className={`h-full bg-${statusColor}-500 shadow-[0_0_8px_rgba(var(--color-${statusColor}-500),0.3)]`} 
                              />
                            </div>
                            <span className={`text-sm font-bold text-${statusColor}-600 tabular-nums`}>{percent}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {marks.map((record, idx) => {
                const percent = ((record.obtainedMarks / record.maxMarks) * 100).toFixed(0);
                const statusColor = Number(percent) >= 75 ? 'emerald' : Number(percent) >= 40 ? 'indigo' : 'rose';
                
                return (
                  <motion.div 
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 flex flex-col gap-4 hover:bg-slate-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-bold uppercase tracking-widest border border-slate-200/50">
                        {record.examType.replace('_', ' ')}
                      </span>
                      <span className={`text-sm font-bold text-${statusColor}-600 tabular-nums`}>{percent}% Efficiency</span>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{record.SUBJECT_NAME}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">
                        Session: {new Date(record.EXAM_DATE).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score Portfolio</span>
                      <span className="font-bold text-slate-900 text-sm">{record.obtainedMarks} <span className="text-slate-300 font-medium">/</span> {record.maxMarks}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
               <AlertCircle size={32} />
            </div>
            <p className="text-slate-500 font-serif text-xl">No Academic Records Found</p>
            <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide">Examination results will be published here upon faculty evaluation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarksPage;
