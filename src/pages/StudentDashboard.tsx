import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Award,
  Bell,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import AnnouncementsBoard from '../components/AnnouncementsBoard';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => setProfile(data));
  }, []);

  const stats = [
    { label: 'Attendance', value: '92%', icon: CheckCircle2, color: 'emerald' },
    { label: 'Current GPA', value: '3.8', icon: Award, color: 'blue' },
    { label: 'Due Exams', value: '2', icon: Bell, color: 'orange' },
    { label: 'Credits', value: '18', icon: BookOpen, color: 'purple' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Student Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
             <span>Academic Session 2024–25</span>
             <span className="hidden sm:block w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
             <span>Spring Semester</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
             <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
               {user?.name?.[0]}
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.15em] mt-1.5">{profile?.COURSE_ID} • {profile?.BRANCH_ID}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
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
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Welcome Banner */}
          <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-sm">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-100">Scholar Update</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif mb-4 leading-tight">Focus on your academic <br className="hidden md:block"/>excellence, {user?.name?.split(' ')[0]}.</h2>
                <p className="text-slate-400 max-w-sm leading-relaxed mb-8 md:mb-10 text-sm font-medium">
                  You have 3 classes scheduled for today. Your next session starts in 45 minutes at the Great Hall.
                </p>
                <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:bg-indigo-50 transition-all text-sm shadow-xl shadow-black/20">
                  Consult Timetable
                  <ArrowRight size={18} />
                </button>
             </div>
             <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[100%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
             <div className="absolute top-[10%] right-[10%] w-[20%] h-[40%] bg-blue-500/10 rounded-full blur-[60px]"></div>
          </div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="academic-card p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Upcoming Lectures</h3>
                   <Clock size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-5">
                   {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-5 p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                         <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-serif text-xl shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
                            {i === 1 ? 'DS' : 'OS'}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{i === 1 ? 'Data Structures' : 'Operating Systems'}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">10:30 AM</span>
                               <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Room 204</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="academic-card p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Performance Metrics</h3>
                   <TrendingUp size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="h-36 flex items-end gap-3 justify-between px-2">
                   {[40, 70, 45, 90, 65, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg relative group overflow-hidden">
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 }}
                           className="bg-indigo-500 rounded-lg w-full transition-all group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)] dark:shadow-indigo-500/20"
                         />
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 px-1">
                   <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sem 1</span>
                   <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sem 4</span>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-1">
          <AnnouncementsBoard />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
