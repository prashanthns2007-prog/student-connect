import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface Announcement {
  id: string;
  ANNOUNCEMENT_ID: string;
  TITLE: string;
  CONTENT: string;
  TARGET_ROLE: string;
  CREATED_AT: string;
}

const AnnouncementsBoard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.slice(0, 5)); // Show latest 5
        }
      } catch (err) {
        console.error('Failed to load announcements');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (isLoading) return <div className="animate-pulse bg-slate-50 dark:bg-slate-900 h-40 rounded-3xl"></div>;

  return (
    <div className="academic-card p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
            <Megaphone size={18} />
          </div>
          <h2 className="text-2xl font-serif text-slate-900 dark:text-white leading-none">University Bulletin</h2>
        </div>
        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all">
          History
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-6 flex-1">
        {announcements.length > 0 ? (
          announcements.map((item, idx) => (
            <motion.div 
              key={item.ANNOUNCEMENT_ID || item.id || `announcement-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer border-b border-slate-50 dark:border-slate-800/50 pb-5 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-300 dark:text-slate-600" />
                  {new Date(item.CREATED_AT).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  item.TARGET_ROLE === 'ALL' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/30'
                }`}>
                  {item.TARGET_ROLE}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm mb-1.5 leading-snug">
                {item.TITLE}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                {item.CONTENT}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-700 mb-3">
               <Megaphone size={24} />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium italic">No scholarly announcements at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsBoard;
