import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import AnnouncementsBoard from '../components/AnnouncementsBoard';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Classes', value: '4', icon: Clock, color: 'blue' },
    { label: 'Assigned Students', value: '124', icon: GraduationCap, color: 'emerald' },
    { label: 'Attendance Taken', value: '100%', icon: CheckCircle2, color: 'purple' },
    { label: 'Pending Grades', value: '12', icon: Bell, color: 'orange' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Faculty Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back, {user?.name}. You have 2 sessions scheduled today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/record-attendance')}
            className="flex-1 md:flex-none academic-button-secondary !px-5 !py-2.5 !text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            Mark Attendance
          </button>
          <button 
            onClick={() => navigate('/record-marks')}
            className="flex-1 md:flex-none academic-button-primary !px-5 !py-2.5 !text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 whitespace-nowrap"
          >
            Record Marks
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="academic-card p-6 group cursor-default"
          >
            <div className={`w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
              <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5">{stat.label}</p>
            <h3 className="text-3xl font-serif text-slate-900 dark:text-white leading-none">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-sm">
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-100">Action Required</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif mb-4 leading-tight">Mid-term Academic <br className="hidden md:block"/>Evaluations Pending.</h2>
                <p className="text-slate-400 max-w-sm leading-relaxed mb-8 md:mb-10 text-sm font-medium">
                  Grade submissions for Section A - Data Structures are due by this Friday. Please ensure all student assessments are finalized.
                </p>
                <button 
                  onClick={() => navigate('/record-attendance')}
                  className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:bg-emerald-50 transition-all text-sm shadow-xl shadow-black/20"
                >
                  Verify Attendance
                  <ArrowRight size={18} />
                </button>
             </div>
             <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[100%] bg-emerald-600/10 rounded-full blur-[100px]"></div>
             <div className="absolute top-[10%] right-[10%] w-[20%] h-[40%] bg-blue-500/10 rounded-full blur-[60px]"></div>
          </div>

          <div className="academic-card p-8">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Teaching Schedule</h3>
                <CalendarIcon size={20} className="text-slate-300 dark:text-slate-600" />
             </div>
             <div className="space-y-5">
                {[
                  { time: '09:00 AM', subject: 'Data Structures', class: 'CS-4th Sem (A)', room: 'Lecture Hall 1' },
                  { time: '11:30 AM', subject: 'Operating Systems', class: 'CS-4th Sem (B)', room: 'Seminar Room 2' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-8 p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-24 uppercase tracking-[0.2em] leading-relaxed">{item.time}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-base">{item.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{item.class}</p>
                        <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{item.room}</p>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AnnouncementsBoard />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
