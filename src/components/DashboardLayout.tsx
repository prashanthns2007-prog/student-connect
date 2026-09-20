import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  CheckSquare, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  BookOpen,
  Users,
  Briefcase, 
  FileSpreadsheet,
  Download,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: string[];
}

const SidebarItems: SidebarItem[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'] },
  { icon: <User size={18} />, label: 'Profile', path: '/profile', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'] },
  { icon: <CheckSquare size={18} />, label: 'Attendance', path: '/attendance', roles: ['ADMIN', 'STUDENT'] },
  { icon: <CheckSquare size={18} />, label: 'Mark Attendance', path: '/record-attendance', roles: ['TEACHER'] },
  { icon: <FileText size={18} />, label: 'Academic Records', path: '/marks', roles: ['ADMIN', 'STUDENT'] },
  { icon: <FileText size={18} />, label: 'Record Marks', path: '/record-marks', roles: ['TEACHER'] },
  { icon: <Clock size={18} />, label: 'Timetable', path: '/timetable', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { icon: <Calendar size={18} />, label: 'Events & Calendar', path: '/calendar', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'] },
  { icon: <Users size={18} />, label: 'Student Directory', path: '/manage-students', roles: ['ADMIN'] },
  { icon: <Briefcase size={18} />, label: 'Faculty Directory', path: '/manage-teachers', roles: ['ADMIN'] },
  { icon: <BookOpen size={18} />, label: 'Curriculum', path: '/manage-courses', roles: ['ADMIN'] },
  { icon: <Download size={18} />, label: 'Export Data', path: '/export-data', roles: ['ADMIN'] },
  { icon: <MessageSquare size={18} />, label: 'Quality Monitor', path: '/feedback-monitor', roles: ['ADMIN', 'STAFF'] },
  { icon: <MessageSquare size={18} />, label: 'Student Feedback', path: '/student-feedback', roles: ['STUDENT'] },
  { icon: <Bell size={18} />, label: 'Announcements', path: '/announcements', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'] },
  { icon: <Settings size={18} />, label: 'Security', path: '/change-password', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF'] },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) return null;

  const filteredItems = SidebarItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] flex font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-500">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] z-50 flex flex-col shadow-2xl"
          >
            <div className="p-10 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
                  <LayoutDashboard size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl text-white leading-none tracking-tight">The Academy</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-1">Institutional ERP</span>
                </div>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-1 custom-scrollbar">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4 px-4">Executive Dashboard</div>
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm group ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium shadow-xl shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-300'}`}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-8 mt-auto border-t border-white/5">
              <div className="bg-white/[0.03] rounded-2xl p-5 mb-4 border border-white/5 shadow-inner">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-white border border-white/10">
                      {user.name.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate italic font-serif tracking-wide">{user.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-0.5">{user.role}</p>
                   </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/20 border border-transparent transition-all"
                >
                  <LogOut size={14} />
                  Archive Session
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
        <header className="h-20 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-10 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all ${isSidebarOpen ? 'lg:opacity-0 pointer-events-none' : ''}`}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Registry Online</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all group"
                title={theme === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all relative group">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-[#020617] group-hover:scale-110 transition-transform"></span>
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
              <Link to="/profile" className="flex items-center gap-3 pl-2 group">
                <div className="w-9 h-9 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors">
                  <User size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
