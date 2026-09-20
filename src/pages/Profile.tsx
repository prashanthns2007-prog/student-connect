import React from 'react';
import { User, Mail, Phone, MapPin, Book, Briefcase, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="academic-card overflow-hidden shadow-2xl shadow-indigo-100/50">
        <div className="h-48 bg-[#0F172A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/5 font-serif text-8xl tracking-tighter italic">Prestigious</p>
          </div>
        </div>
        <div className="px-10 pb-12">
          <div className="relative -mt-16 mb-8 flex items-end justify-between">
            <div className="p-1.5 bg-white rounded-[2rem] shadow-xl">
              <div className="w-32 h-32 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-indigo-600 border border-slate-100 shadow-inner">
                <User size={56} className="text-slate-300" />
              </div>
            </div>
            <div className="mb-4">
              <span className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100 uppercase tracking-[0.2em] shadow-sm">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-serif text-slate-900 tracking-tight italic">{user.name}</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Identification ID: <span className="text-slate-600 tracking-normal ml-1">{user.userId}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-50">
            <div className="space-y-6">
              <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Communication Registry</h2>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Mail size={18} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Official Email</p>
                   <p className="text-sm font-bold text-slate-700">{user.email || 'not_provided@university.edu'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Phone size={18} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Primary Contact</p>
                   <p className="text-sm font-bold text-slate-700">+1 (555) 892-0402</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Academic Trajectory</h2>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Book size={18} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Departmental Affiliation</p>
                   <p className="text-sm font-bold text-slate-700">Computer Science & Engineering</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Calendar size={18} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Since</p>
                   <p className="text-sm font-bold text-slate-700">Autumn Term, 2022</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
