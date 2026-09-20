import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const StudentFeedback: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/student/timetable');
        const data = await response.json();
        // Extract unique subjects
        const uniqueSubjects = Array.from(new Set(data.map((item: any) => item.SUBJECT_NAME)))
          .map(name => {
            const item = data.find((i: any) => i.SUBJECT_NAME === name);
            return { id: item.SUBJECT_ID || name, name: name };
          });
        setSubjects(uniqueSubjects);
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || rating === 0 || !comments.trim()) {
      setMessage({ type: 'error', text: 'Please complete all fields and provide a rating.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          rating,
          comments
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thank you. Your anonymous feedback has been recorded in the institutional registry.' });
        setSelectedSubject('');
        setRating(0);
        setComments('');
      } else {
        setMessage({ type: 'error', text: 'Failed to submit feedback. Please try again later.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred during submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight italic">Instructional Quality Feedback</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Provide anonymous scholarly insights on pedagogical effectiveness and curriculum delivery.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="academic-card p-10 bg-[#FDFDFD] dark:bg-slate-900/50"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-slate-900 dark:text-white leading-none">Feedback Submission</h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Anonymous Disclosure Protocol</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Select Academic Subject</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all shadow-sm dark:text-white"
            >
              <option value="">— Select Subject —</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Instructional Rating</label>
            <div className="flex items-center gap-4 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition-all duration-300 ${rating >= star ? 'text-amber-400 scale-110' : 'text-slate-200 dark:text-slate-700 hover:text-slate-300 dark:hover:text-slate-600'}`}
                >
                  <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {rating === 5 ? 'Exceptional' : rating === 4 ? 'Commendable' : rating === 3 ? 'Satisfactory' : rating === 2 ? 'Needs Improvement' : rating === 1 ? 'Deficient' : 'Awaiting Rating'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Critical Comments & Insights</label>
            <textarea 
              rows={6}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide constructive scholarly feedback on the instruction quality..."
              className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-medium transition-all resize-none shadow-sm leading-relaxed dark:text-white dark:placeholder:text-slate-600"
            />
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30 text-red-700 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <p className="text-xs font-bold uppercase tracking-wide">{message.text}</p>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full academic-button-primary !py-5 shadow-2xl shadow-indigo-100/50 dark:shadow-indigo-900/40 flex items-center justify-center gap-3 group"
          >
            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            {isSubmitting ? 'Transmitting Disclosure...' : 'Submit Anonymous Feedback'}
          </button>
        </form>
      </motion.div>

      <div className="academic-card p-8 bg-[#0F172A] border-none text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
            <CheckCircle size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Privacy Guarantee</p>
            <p className="text-sm font-serif italic text-slate-300">
              "Student identities are never associated with feedback entries. This protocol ensures pure, uninhibited intellectual evaluation of institutional delivery."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
