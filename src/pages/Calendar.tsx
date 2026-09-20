import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Tag, CalendarPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { AcademicEvent } from '../types';
import { useNotification } from '../context/NotificationContext';
import { initGoogleCalendar, syncEventToGoogleCalendar } from '../lib/googleCalendar';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        await initGoogleCalendar();
        const res = await fetch('/api/calendar');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        } else {
          showNotification('Failed to access institutional calendar', 'error');
        }
      } catch (err) {
        showNotification('Error connecting to academic registry', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
  }, [showNotification]);

  const handleSync = async (event: AcademicEvent) => {
    setIsSyncing(event.id || event.title);
    try {
      await syncEventToGoogleCalendar({
        summary: event.title,
        description: event.description,
        start: event.startDate,
        end: event.endDate || event.startDate
      });
      showNotification('Synchronized to Google Calendar', 'success');
    } catch (err) {
      showNotification('Synchronization failed', 'error');
    } finally {
      setIsSyncing(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HOLIDAY': return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/30';
      case 'EXAM': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30';
      case 'EVENT': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30';
      case 'SEMINAR': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Institutional Calendar</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chronological roadmap of academic milestones, examinations, and university assemblies.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Accessing Academic Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="academic-card p-8 group hover:scale-[1.01] transition-all duration-500 bg-[#FDFDFD] dark:bg-slate-900/50"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm ${getTypeColor(event.type)}`}>
                {event.type}
              </div>
              <div className="flex items-center gap-2.5 text-slate-300 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                <CalendarIcon size={14} className="text-slate-400 dark:text-slate-500" />
                <span>
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {event.endDate && event.endDate !== event.startDate && ` — ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
              </div>
            </div>
            
            <h3 className="text-2xl font-serif text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight italic">{event.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed font-medium italic">{event.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <Clock size={14} className="text-slate-300 dark:text-slate-700" />
                  <span>Standard Business Hours</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <MapPin size={14} className="text-slate-300 dark:text-slate-700" />
                  <span>Metropolitan Campus</span>
                </div>
              </div>

              <button
                onClick={() => handleSync(event)}
                disabled={isSyncing === (event.id || event.title)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 transition-all group/btn"
              >
                <CalendarPlus size={16} className={`transition-transform ${isSyncing === (event.id || event.title) ? 'animate-pulse' : 'group-hover/btn:scale-110'}`} />
                <span>{isSyncing === (event.id || event.title) ? 'Synchronizing...' : 'Sync to Calendar'}</span>
              </button>
            </div>
          </motion.div>
        ))}

        {events.length === 0 && (
          <div className="lg:col-span-2 py-40 flex flex-col items-center justify-center academic-card border-dashed border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
               <CalendarIcon size={32} className="text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-serif text-xl italic">No Pending Engagements</p>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">The academic registry is currently clear of upcoming events.</p>
          </div>
        )}
      </div>
    )}
    </div>
  );
};

export default CalendarPage;
