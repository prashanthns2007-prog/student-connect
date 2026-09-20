import React, { useState } from 'react';
import { Download, Users, Briefcase, FileJson, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const ExportData: React.FC = () => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const exportToCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type: 'students' | 'teachers') => {
    setIsExporting(type);
    try {
      const response = await fetch(`/api/admin/export/${type}`);
      const data = await response.json();
      
      if (response.ok) {
        exportToCSV(data, `The_Academy_${type}_Export_${new Date().toISOString().split('T')[0]}`);
      } else {
        alert(`Failed to export ${type}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during export');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-serif text-slate-900 tracking-tight italic">Data Archive Export</h1>
        <p className="text-slate-500 text-sm font-medium">Extract and disseminate institutional records for administrative analysis and archival purposes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Students */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="academic-card p-10 group transition-all duration-500"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <Users size={32} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entity Classification</p>
              <h2 className="text-2xl font-serif text-slate-900 leading-none">Scholars Registry</h2>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed mb-10 italic">
            Contains comprehensive records of all enrolled students, including academic affiliations, contact coordinates, and current registration status.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => handleExport('students')}
              disabled={isExporting !== null}
              className="w-full academic-button-primary !py-4 flex items-center justify-center gap-3 shadow-xl shadow-indigo-100/50 group"
            >
              <FileSpreadsheet size={18} className="group-hover:rotate-12 transition-transform" />
              {isExporting === 'students' ? 'Generating Archive...' : 'Export Scholars as CSV'}
              <ChevronRight size={16} className="ml-auto opacity-50" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
              <Download size={10} />
              Secure Encrypted Transmission
            </div>
          </div>
        </motion.div>

        {/* Export Teachers */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="academic-card p-10 group transition-all duration-500"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center border border-emerald-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
              <Briefcase size={32} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entity Classification</p>
              <h2 className="text-2xl font-serif text-slate-900 leading-none">Faculty Registry</h2>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed mb-10 italic">
            Compiles the definitive index of university faculty, detailing departmental appointments, academic designations, and professional correspondence.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => handleExport('teachers')}
              disabled={isExporting !== null}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-100/50 transition-all group"
            >
              <FileSpreadsheet size={18} className="group-hover:rotate-12 transition-transform" />
              {isExporting === 'teachers' ? 'Generating Archive...' : 'Export Faculty as CSV'}
              <ChevronRight size={16} className="ml-auto opacity-50" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
              <Download size={10} />
              Verified Institutional Data
            </div>
          </div>
        </motion.div>
      </div>

      {/* Audit Log / Note */}
      <div className="academic-card p-8 bg-[#F8FAFC]/50 border-dashed">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
             <FileJson size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Administrative Disclosure</p>
            <p className="text-[11px] text-slate-400 font-medium italic mt-1">
              All data extractions are logged within the institutional audit registry. Please ensure compliance with academic privacy protocols before dissemination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
