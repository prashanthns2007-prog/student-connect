import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Filter, Calendar, BarChart3, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

const FeedbackMonitor: React.FC = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch('/api/admin/feedback');
        const data = await response.json();
        setFeedback(data);
      } catch (err) {
        console.error('Failed to fetch feedback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const uniqueSubjects = Array.from(new Set(feedback.map(f => f.SUBJECT_NAME || f.subjectId)));

  const filteredFeedback = filter === 'ALL' 
    ? feedback 
    : feedback.filter(f => (f.SUBJECT_NAME || f.subjectId) === filter);

  const averageRating = filteredFeedback.length > 0
    ? (filteredFeedback.reduce((acc, f) => acc + f.rating, 0) / filteredFeedback.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-slate-900 tracking-tight italic">Instructional Quality Monitor</h1>
          <p className="text-slate-500 text-sm font-medium">Aggregate analytical oversight of pedagogical feedback and instructional delivery metrics.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm">
          <BarChart3 size={16} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.15em]">Global Index: {averageRating} / 5.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="academic-card p-8 bg-[#FDFDFD] sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <Filter size={18} className="text-indigo-600" />
              <h2 className="text-lg font-serif text-slate-900">Archive Filters</h2>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => setFilter('ALL')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                All Departments
              </button>
              {uniqueSubjects.map(sub => (
                <button 
                  key={sub}
                  onClick={() => setFilter(sub)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === sub ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid size={14} className="text-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Statistical Summary</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Submissions</p>
                  <p className="text-xl font-serif text-slate-900 leading-none">{filteredFeedback.length}</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Institutional Archives...</p>
            </div>
          ) : filteredFeedback.length > 0 ? (
            <div className="space-y-6">
              {filteredFeedback.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="academic-card p-8 group hover:scale-[1.01] transition-all duration-500 bg-white"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-widest border border-indigo-100">
                          {item.SUBJECT_NAME || item.subjectId}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={12} className="text-slate-200" />
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={item.rating >= star ? 'text-amber-400' : 'text-slate-100'} 
                            fill={item.rating >= star ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                       <MessageSquare size={18} />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-100 rounded-full group-hover:bg-indigo-600 transition-colors duration-500"></div>
                    <p className="text-slate-600 leading-relaxed text-sm italic font-medium pl-2">
                      "{item.comments}"
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Verification Status: Institutional Audit Verified</p>
                    <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                      Archive Disclosure <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="academic-card border-dashed border-2 border-slate-100 py-40 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                <MessageSquare size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-500 font-serif text-2xl italic">Archives Vacant</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3 max-w-xs leading-relaxed">No instructional quality disclosures have been registered in this classification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackMonitor;
