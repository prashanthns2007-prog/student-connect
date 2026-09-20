import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import AnnouncementsBoard from '../components/AnnouncementsBoard';

import { Cloud } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<any>(null);
  const [isSyncingCloud, setIsSyncingCloud] = React.useState(false);
  const { showNotification } = useNotification();

  const syncToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      // 1. Fetch current mock stats and announcements to sync
      const res = await fetch('/api/announcements');
      const announcements = await res.json();
      
      const batch = writeBatch(db);
      
      announcements.forEach((ann: any) => {
        const ref = doc(collection(db, 'announcements'));
        batch.set(ref, {
          title: ann.TITLE || ann.title,
          content: ann.CONTENT || ann.content,
          targetRole: ann.TARGET_ROLE || ann.targetRole || 'ALL',
          createdAt: ann.CREATED_AT || ann.createdAt || new Date().toISOString()
        });
      });

      await batch.commit();
      showNotification('Institutional registry synchronized to Cloud Persistence', 'success');
    } catch (err) {
      showNotification('Cloud synchronization failed', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  React.useEffect(() => {
    fetch('/api/admin/stats').then(res => res.json()).then(data => setStats(data));
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats?.students || 0, icon: GraduationCap, color: 'blue' },
    { title: 'Total Teachers', value: stats?.teachers || 0, icon: Users, color: 'emerald' },
    { title: 'Departments', value: stats?.courses || 0, icon: Briefcase, color: 'purple' },
    { title: 'Active Subjects', value: stats?.subjects || 0, icon: BookOpen, color: 'orange' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight">University Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Strategic oversight and institutional resource coordination.</p>
        </div>
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/30">
          <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Authorized Session</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="academic-card p-6 group cursor-default"
          >
            <div className={`w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
              <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5">{stat.title}</p>
            <h3 className="text-3xl font-serif text-slate-900 dark:text-white leading-none">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-[#0F172A] rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-sm">
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                 <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-100">Executive Access</span>
              </div>
              <h2 className="text-4xl font-serif mb-4 leading-tight italic">Excellence through <br/>Institutional Oversight.</h2>
              <p className="text-slate-400 max-w-md leading-relaxed mb-10 text-sm font-medium">
                You possess full administrative command over the academic infrastructure. Orchestrate faculty assignments, analyze scholar trajectories, and disseminate high-priority notices.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:bg-indigo-50 transition-all text-sm shadow-xl shadow-black/20">
                  Analytics Suite
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={syncToCloud}
                  disabled={isSyncingCloud}
                  className="bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold border border-white/10 hover:bg-white/20 transition-all text-sm backdrop-blur-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Cloud size={18} className={isSyncingCloud ? 'animate-pulse' : ''} />
                  {isSyncingCloud ? 'Synchronizing...' : 'Sync to Cloud'}
                </button>
              </div>
            </div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[100%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute top-[10%] right-[10%] w-[20%] h-[40%] bg-blue-500/10 rounded-full blur-[60px]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="academic-card p-8">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-serif text-2xl text-slate-900 dark:text-white">Infrastructure Logs</h3>
                   <CalendarIcon size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-6">
                   {[
                     { msg: 'Global Security Audit Completed', time: '14 min ago', status: 'indigo' },
                     { msg: 'Faculty Records Synchronized', time: '1 hour ago', status: 'emerald' },
                     { msg: 'Scholar Dataset Backup Executed', time: '4 hours ago', status: 'blue' }
                   ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                         <div className={`w-1.5 h-1.5 bg-${item.status}-400 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-snug">{item.msg}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{item.time}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="academic-card p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
                   <TrendingUp size={28} />
                </div>
                <div className="space-y-1">
                   <p className="text-5xl font-serif text-slate-900 dark:text-white tabular-nums">42</p>
                   <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Scholars Currently Active</p>
                </div>
                <div className="mt-8 flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[8px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   Live Monitoring
                </div>
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

export default AdminDashboard;
