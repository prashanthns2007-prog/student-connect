import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  MoreVertical,
  Filter,
  UserX,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showNotification } = useNotification();

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    role: 'STUDENT',
    password: 'password123',
    // Student extra
    courseId: 'BTECH',
    branchId: 'CSE',
    semester: 1,
    section: 'A',
    registrationNo: '',
    // Teacher extra
    deptId: 'CS',
    designation: 'Assistant Professor',
    // Staff extra
    roleDescription: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      showNotification('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showNotification('Update failed', 'error');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (default: password123):') || 'password123';
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) {
        showNotification('Password reset successfully', 'success');
      }
    } catch (err) {
      showNotification('Reset failed', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showNotification('User created successfully', 'success');
        setIsAddModalOpen(false);
        fetchUsers();
        setFormData({ ...formData, userId: '', name: '', email: '', registrationNo: '' });
      } else {
        const data = await res.json();
        showNotification(data.error || 'Failed to create user', 'error');
      }
    } catch (err) {
      showNotification('Server error', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) || u.USER_ID?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'ALL' || u.ROLE === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-slate-900 dark:text-white tracking-tight">Identity Register</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Orchestrate university-wide credentialing for scholars, faculty, and executives.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="academic-button-primary !px-8 !py-3.5 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20"
        >
          <UserPlus size={18} />
          Enroll New Entity
        </button>
      </div>

      <div className="academic-card p-8 flex flex-col md:flex-row gap-6 bg-[#FDFDFD] dark:bg-slate-900/50">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by legal name or identification ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium shadow-sm dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <Filter size={16} className="text-slate-400 dark:text-slate-500" />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Designations</option>
              <option value="STUDENT">Scholars</option>
              <option value="TEACHER">Faculty</option>
              <option value="STAFF">Administrative Staff</option>
              <option value="ADMIN">System Executives</option>
            </select>
          </div>
        </div>
      </div>

      <div className="academic-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Entity Identity</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Designation</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 dark:text-slate-500 font-serif text-lg italic">Accessing centralized directory...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.USER_ID} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-serif text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {u.NAME?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-base">{u.NAME}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{u.USER_ID} • {u.EMAIL}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      u.ROLE === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30' :
                      u.ROLE === 'TEACHER' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' :
                      u.ROLE === 'STUDENT' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {u.ROLE}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full shadow-sm ${u.STATUS === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${u.STATUS === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {u.STATUS}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleResetPassword(u.USER_ID)}
                        className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/30 shadow-sm"
                        title="Reset Credentials"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(u.USER_ID, u.STATUS)}
                        className={`p-2.5 rounded-xl transition-all border border-transparent shadow-sm ${
                          u.STATUS === 'ACTIVE' ? 'text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-100 dark:hover:border-rose-800/30' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-100 dark:hover:border-emerald-800/30'
                        }`}
                        title={u.STATUS === 'ACTIVE' ? 'Suspend Access' : 'Restore Access'}
                      >
                        {u.STATUS === 'ACTIVE' ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 dark:text-slate-500 italic font-serif text-lg">No records matched the specified criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#FDFDFD] dark:bg-slate-900/80">
                <div>
                  <h2 className="text-3xl font-serif text-slate-900 dark:text-white tracking-tight">Institutional Enrollment</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Register New Academic Entity</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all flex items-center justify-center">
                  <UserX size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Universal Identity (ID)</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.userId}
                      onChange={(e) => setFormData({...formData, userId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white dark:placeholder:text-slate-600"
                      placeholder="e.g., SCHOLAR-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Institutional Designation</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white"
                    >
                      <option value="STUDENT">Scholar</option>
                      <option value="TEACHER">Faculty Member</option>
                      <option value="STAFF">Administrative Staff</option>
                      <option value="ADMIN">System Executive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Official Communications (Email)</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <h3 className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Designation-Specific Parameters</h3>
                  
                  {formData.role === 'STUDENT' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input 
                        type="text" 
                        placeholder="Matriculation Number"
                        value={formData.registrationNo}
                        onChange={(e) => setFormData({...formData, registrationNo: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white dark:placeholder:text-slate-600"
                      />
                      <select 
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white"
                      >
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Academic Semester {s}</option>)}
                      </select>
                    </div>
                  )}

                  {formData.role === 'TEACHER' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input 
                        type="text" 
                        placeholder="Academic Department (e.g., Computer Science)"
                        value={formData.deptId}
                        onChange={(e) => setFormData({...formData, deptId: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white dark:placeholder:text-slate-600"
                      />
                      <input 
                        type="text" 
                        placeholder="Faculty Designation"
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white dark:placeholder:text-slate-600"
                      />
                    </div>
                  )}

                  {formData.role === 'STAFF' && (
                    <input 
                      type="text" 
                      placeholder="Administrative Responsibility Description"
                      value={formData.roleDescription}
                      onChange={(e) => setFormData({...formData, roleDescription: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 focus:border-indigo-500 text-sm font-bold transition-all dark:text-white dark:placeholder:text-slate-600"
                    />
                  )}
                </div>

                <div className="pt-10 flex items-center justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="academic-button-primary !px-10 !py-3.5 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20"
                  >
                    Confirm Registration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
