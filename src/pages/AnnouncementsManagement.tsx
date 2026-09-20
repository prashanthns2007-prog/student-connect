import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Send, Trash2, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface Announcement {
  ANNOUNCEMENT_ID: string;
  TITLE: string;
  CONTENT: string;
  TARGET_ROLE: string;
  CREATED_AT: string;
}

const AnnouncementsManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'ALL'
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      showNotification('Failed to load announcements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showNotification('Announcement posted successfully', 'success');
        setFormData({ title: '', content: '', targetRole: 'ALL' });
        fetchAnnouncements();
      } else {
        showNotification('Failed to post announcement', 'error');
      }
    } catch (err) {
      showNotification('Server error', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'max-w-4xl mx-auto'} gap-10`}>
      {/* Post New Announcement - ADMIN ONLY */}
      {isAdmin && (
        <div className="lg:col-span-1">
          <div className="academic-card p-10 sticky top-8 bg-[#FDFDFD] dark:bg-slate-900/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm">
                <Megaphone size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-slate-900 dark:text-white leading-none">Bulletin Entry</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Disseminate Notice</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Subject Header</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Mandatory Faculty Convocation..."
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all shadow-sm dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Intended Recipients</label>
                <select 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all shadow-sm dark:text-white"
                >
                  <option value="ALL">Universal Assembly</option>
                  <option value="STUDENT">Scholars Exclusively</option>
                  <option value="TEACHER">Faculty Exclusively</option>
                  <option value="STAFF">Administrative Staff</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Bulletin Content</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Compose formal announcement text..."
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-medium transition-all resize-none shadow-sm leading-relaxed dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
              <button 
                disabled={isPosting}
                type="submit"
                className="w-full academic-button-primary !py-4 shadow-2xl shadow-indigo-100/50 dark:shadow-indigo-900/20"
              >
                <Send size={18} />
                {isPosting ? 'Broadcasting...' : 'Publish to Board'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className={isAdmin ? 'lg:col-span-2' : ''}>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-serif text-slate-900 dark:text-white tracking-tight">University Chronicle</h2>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <Filter size={14} className="text-indigo-400" />
              Archives by Date
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Accessing Bulletin Archives...</p>
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-6">
              {announcements.map((item, idx) => (
                <motion.div
                  key={item.ANNOUNCEMENT_ID}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="academic-card p-8 group hover:scale-[1.01] transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                          item.TARGET_ROLE === 'ALL' ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700' :
                          item.TARGET_ROLE === 'STUDENT' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30' :
                          item.TARGET_ROLE === 'TEACHER' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30' :
                          'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30'
                        }`}>
                          {item.TARGET_ROLE === 'ALL' ? 'General' : item.TARGET_ROLE}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={12} className="text-slate-200 dark:text-slate-700" />
                          {new Date(item.CREATED_AT).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{item.TITLE}</h3>
                    </div>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-wrap italic">
                      {item.CONTENT}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="academic-card border-dashed border-2 border-slate-200 dark:border-slate-800 py-32 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800">
                <Megaphone size={40} className="text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-serif text-2xl">Board is Vacant</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-3 font-medium tracking-wide max-w-xs leading-relaxed">Official university communications and scholarly bulletins will materialize here once published.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManagement;
