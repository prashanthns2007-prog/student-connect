import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { GraduationCap, Lock, User as UserIcon, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authenticate with institutional server
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. Synchronize with Firebase Auth for Cloud Persistence access
        try {
          await signInAnonymously(auth);
        } catch (fbErr) {
          console.warn('Firebase Cloud Sync failed, continuing with local persistence');
        }
        
        login(data.userId, data.role, data.name);
        showNotification(`Welcome back, ${data.name}!`, 'success');
        navigate('/');
      } else {
        showNotification(data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      showNotification('Could not connect to the server. Please check your internet connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] flex items-center justify-center p-4 selection:bg-indigo-500/30 transition-colors duration-500">
      {/* Theme Toggle for Login */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={toggleTheme}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xl transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="max-w-4xl w-full flex bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/20 dark:border-slate-800/50 shadow-2xl relative z-10"
      >
        {/* Left Side - Brand */}
        <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#ffffff_0%,transparent_70%)]"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-xl mb-8">
              <GraduationCap size={28} />
            </div>
            <h1 className="text-4xl font-serif text-white leading-tight mb-4">
              Advancing Excellence <br/> Through Technology
            </h1>
            <p className="text-indigo-100/70 text-sm max-w-xs leading-relaxed font-medium">
              Welcome to the Unified Academic Portal. Access your scholarly resources, administrative tools, and collaborative spaces.
            </p>
          </div>

          <div className="relative z-10">
             <div className="flex items-center gap-4 text-indigo-100/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>The Academy</span>
                <span className="w-8 h-px bg-indigo-100/20"></span>
                <span>Portal Entrance</span>
             </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-10 sm:p-14 bg-white dark:bg-[#020617]/50 backdrop-blur-md">
          <div className="mb-10 lg:hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white mb-4">
              <GraduationCap size={24} />
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-serif text-slate-900 dark:text-white mb-2">Member Sign In</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please authenticate with your institutional credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Universal Identifier</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
                  placeholder="ID (e.g. ADMIN001)"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Passcode</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full academic-button-primary mt-4 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? 'Verifying Credentials...' : 'Authenticate Access'}
              </span>
              <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </form>

          <div className="mt-12 flex flex-col items-center gap-4">
             <div className="w-full h-px bg-slate-100 dark:bg-slate-800 relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#020617] px-3 text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                   Support
                </span>
             </div>
             <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-loose text-center">
                Access requires valid authorization. <br/>
                For lost credentials, please contact the Registrar's Office.
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
