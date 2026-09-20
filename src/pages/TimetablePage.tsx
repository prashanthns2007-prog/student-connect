import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Clock, MapPin, User, Calendar as CalendarIcon, GraduationCap, CalendarPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { initGoogleCalendar, syncEventToGoogleCalendar } from '../lib/googleCalendar';

interface TimetableEntry {
  DAY_OF_WEEK: string;
  START_TIME: string;
  END_TIME: string;
  SUBJECT_NAME: string;
  TEACHER_NAME?: string;
  ROOM_NO?: string;
  COURSE_NAME?: string;
  BRANCH_NAME?: string;
  SECTION?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        await initGoogleCalendar();
        const endpoint = user?.role === 'STUDENT' ? '/api/student/timetable' : '/api/teacher/timetable';
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setTimetable(data);
        } else {
          showNotification('Failed to fetch timetable', 'error');
        }
      } catch (err) {
        showNotification('Error connecting to server', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [user, showNotification]);

  const handleSync = async (entry: TimetableEntry) => {
    const key = `${entry.DAY_OF_WEEK}-${entry.START_TIME}-${entry.SUBJECT_NAME}`;
    setIsSyncing(key);
    
    try {
      // Calculate next occurrence of the day
      const today = new Date();
      const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const targetDayIndex = DAYS.indexOf(entry.DAY_OF_WEEK) + 1;
      
      let daysUntil = targetDayIndex - currentDayIndex;
      if (daysUntil < 0) daysUntil += 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntil);
      const dateStr = targetDate.toISOString().split('T')[0];

      await syncEventToGoogleCalendar({
        summary: `Lecture: ${entry.SUBJECT_NAME}`,
        description: `${entry.COURSE_NAME || ''} ${entry.SECTION || ''} in Hall ${entry.ROOM_NO || ''}. Faculty: ${entry.TEACHER_NAME || ''}`,
        start: `${dateStr}T${entry.START_TIME}:00`,
        end: `${dateStr}T${entry.END_TIME}:00`
      });
      showNotification('Synchronized to Google Calendar', 'success');
    } catch (err) {
      showNotification('Synchronization failed', 'error');
    } finally {
      setIsSyncing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Accessing Academic Curriculum...</p>
      </div>
    );
  }

  // Group by day
  const groupedTimetable: Record<string, TimetableEntry[]> = DAYS.reduce((acc, day) => {
    acc[day] = timetable.filter(entry => entry.DAY_OF_WEEK === day);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Academic Curriculum</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Synchronized schedule of modular lectures and laboratory sessions.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
          <CalendarIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-[0.15em]">Autumn Term 2024</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {DAYS.map((day, index) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="bg-[#F8FAFC] dark:bg-slate-900/50 py-3.5 rounded-xl font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-[0.2em] text-[10px] border border-slate-100 dark:border-slate-800 shadow-sm">
              {day}
            </div>
            
            <div className="flex flex-col gap-5 min-h-[300px]">
              {groupedTimetable[day].length > 0 ? (
                groupedTimetable[day].map((entry, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="academic-card p-6 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 group transition-all duration-500 bg-white dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-3">
                      <Clock size={12} />
                      {entry.START_TIME} — {entry.END_TIME}
                    </div>
                    
                    <h3 className="font-serif text-lg text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {entry.SUBJECT_NAME}
                    </h3>
                    
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-50 dark:border-slate-800">
                      <div className="space-y-2">
                        {user?.role === 'STUDENT' && entry.TEACHER_NAME && (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-medium tracking-wide">
                            <User size={12} className="text-slate-300 dark:text-slate-700" />
                            {entry.TEACHER_NAME}
                          </div>
                        )}
                        
                        {user?.role === 'TEACHER' && entry.COURSE_NAME && (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-medium tracking-wide">
                            <GraduationCap size={12} className="text-slate-300 dark:text-slate-700" />
                            {entry.COURSE_NAME} • {entry.SECTION}
                          </div>
                        )}

                        {entry.ROOM_NO && (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-medium tracking-wide">
                            <MapPin size={12} className="text-slate-300 dark:text-slate-700" />
                            Hall {entry.ROOM_NO}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleSync(entry)}
                        disabled={isSyncing === `${entry.DAY_OF_WEEK}-${entry.START_TIME}-${entry.SUBJECT_NAME}`}
                        title="Sync to Google Calendar"
                        className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                      >
                        <CalendarPlus size={14} className={isSyncing === `${entry.DAY_OF_WEEK}-${entry.START_TIME}-${entry.SUBJECT_NAME}` ? 'animate-pulse' : ''} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 text-center bg-slate-50/30 dark:bg-slate-900/20">
                  <span className="text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-widest italic">Recess Period</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimetablePage;
