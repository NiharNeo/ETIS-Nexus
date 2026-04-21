import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, UserCheck, Shield } from 'lucide-react';

const DEPARTMENTS = [
  'CSE', 'DS', 'BBA', 'BCA', 'MBA', 
  'EEE', 'ECE', 'AIML', 'AIDS'
];

const YEARS = ['1st', '2nd', '3rd', '4th'];

export default function OnboardingPage() {
  const { user, updateUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [srn, setSrn] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already onboarded or not a student
  if (!authLoading && isAuthenticated && user) {
    if (user.role !== 'student' || (user.department && user.year && user.srn)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (authLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !year || !srn) return;

    setLoading(true);
    await updateUser({
      department,
      year,
      srn
    });
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Polish */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-white rounded-[3rem] border border-black/5 p-10 lg:p-16 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
          <div className="mb-12 text-center lg:text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <UserCheck size={28} />
              </div>
              <div className="h-[2px] flex-1 bg-black/5" />
              <Shield size={20} className="text-foreground/10" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Identity Finalization</p>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-[0.85]">
              Complete Your <br />
              <span className="text-foreground/20 italic">Student Profile.</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Department Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                  Department / Branch
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDepartment(dept)}
                      className={`py-3 rounded-xl text-[11px] font-black transition-all border ${
                        department === dept 
                          ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                          : 'bg-slate-50 text-foreground/40 border-black/5 hover:border-black/20 hover:text-foreground'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Year Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                    Current Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold text-foreground transition-all appearance-none"
                  >
                    <option value="" disabled>Select Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
                  </select>
                </div>

                {/* SRN Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                    Student ID / SRN
                  </label>
                  <input
                    type="text"
                    value={srn}
                    onChange={(e) => setSrn(e.target.value.toUpperCase())}
                    placeholder="e.g. PES2023..."
                    className="w-full px-6 py-4 bg-slate-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold text-foreground uppercase tracking-widest placeholder:lowercase placeholder:tracking-normal transition-all"
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !department || !year || !srn}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-6 rounded-3xl bg-black text-white font-black uppercase text-[11px] tracking-[0.4em] shadow-xl shadow-black/20 hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              Confirm Account Sync
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <p className="text-center text-[9px] font-bold text-foreground/20 mt-10 uppercase tracking-[0.3em]">
            Institutional Data Node • Security Level 4
          </p>
        </div>
      </motion.div>
    </div>
  );
}
