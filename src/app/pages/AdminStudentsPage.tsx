import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Download, Filter, 
  GraduationCap, Linkedin, ShieldCheck, 
  SearchX, RefreshCw, ChevronDown,
  UserCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminStudentsPage() {
  const { user: authUser } = useAuth();
  const { clubs } = useData();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const isAuthorized = authUser?.role === 'super_admin';

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) loadStudents();
  }, [isAuthorized]);

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Department', 'Year', 'SRN', 'Provider', 'Joined At'],
      ...students.map(s => [
        s.name,
        s.email,
        s.department || '—',
        s.year || '—',
        s.srn || '—',
        s.auth_provider || 'email',
        format(new Date(s.created_at), 'yyyy-MM-dd')
      ])
    ];
    const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-roster-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Roster Exported', { description: `${students.length} records downloaded.` });
  };

  const filtered = students.filter(s => {
    const matchesSearch = !searchQuery || 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.srn?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = filterDept === 'all' || s.department === filterDept;
    const matchesYear = filterYear === 'all' || s.year === filterYear;

    return matchesSearch && matchesDept && matchesYear;
  });

  const uniqueDepts = Array.from(new Set(students.map(s => s.department).filter(Boolean)));
  const years = ['1st', '2nd', '3rd', '4th'];

  if (!isAuthorized) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <div className="text-center space-y-4">
          <ShieldCheck size={48} className="mx-auto text-rose-500/20" />
          <h2 className="text-2xl font-black tracking-tighter">Access Denied</h2>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Super Admin clearance required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-10">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Users size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Governance Sector</p>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-[0.85]">
            Identity <br />
            <span className="text-foreground/20 italic">Roster.</span>
          </h1>
          <p className="text-muted-foreground/50 text-sm font-medium max-w-md tracking-tight">
            Centralized management of the verified student population across all departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadStudents}
            className="p-4 rounded-2xl bg-card/60 border border-border/10 text-muted-foreground/40 hover:text-primary transition-all disabled:opacity-30"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download size={16} /> Export DB Roster
          </button>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex flex-col xl:flex-row gap-4 p-4 rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/10 ring-1 ring-white/5">
        <div className="flex-1 flex items-center gap-4 bg-sidebar/60 border border-border/10 rounded-2xl px-6 py-4">
          <Search size={18} className="text-muted-foreground/30" />
          <input 
            type="text" 
            placeholder="Search by Name, Email or SRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/20"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Dept Filter */}
          <div className="relative min-w-[200px]">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full appearance-none bg-sidebar/60 border border-border/10 rounded-2xl px-6 py-4 pr-12 text-[11px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">ALL DEPARTMENTS</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none" />
          </div>

          {/* Year Filter */}
          <div className="relative min-w-[160px]">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full appearance-none bg-sidebar/60 border border-border/10 rounded-2xl px-6 py-4 pr-12 text-[11px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">ALL YEARS</option>
              {years.map(y => <option key={y} value={y}>{y} YEAR</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* DATA AREA */}
      <div className="rounded-[3rem] bg-card/60 backdrop-blur-xl border border-border/10 ring-1 ring-white/5 overflow-hidden shadow-2xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/10 bg-sidebar/40">
                {['Student Info', 'Department', 'Year', 'SRN', 'Verification', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              <AnimatePresence mode="popLayout">
                {loading ? (
                    <tr>
                      <td colSpan={7} className="py-32 text-center">
                        <RefreshCw size={32} className="mx-auto text-primary animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20">Syncing Master Roster...</p>
                      </td>
                    </tr>
                ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-32 text-center">
                        <SearchX size={40} className="mx-auto text-muted-foreground/10 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">No Identities Recovered</p>
                      </td>
                    </tr>
                ) : (
                  filtered.map((student, i) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="group hover:bg-white/[0.02] transition-all"
                    >
                      {/* INFO */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {student.avatar ? (
                              <img src={student.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-border/10 grayscale group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-sidebar border border-border/10 flex items-center justify-center text-muted-foreground/20">
                                <UserCircle2 size={24} />
                              </div>
                            )}
                            {student.auth_provider === 'linkedin_oidc' && (
                              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-lg">
                                <Linkedin size={10} className="text-[#0077B5]" fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-foreground tracking-tight">{student.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground/40">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-8 py-6">
                        <span className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary/70 text-[9px] font-black uppercase tracking-widest">
                          {student.department || 'N/A'}
                        </span>
                      </td>

                      {/* YEAR */}
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black text-foreground/40 italic">
                          {student.year ? `${student.year} Year` : '—'}
                        </span>
                      </td>

                      {/* SRN */}
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black text-foreground tracking-[0.2em] uppercase">
                          {student.srn || 'N/A'}
                        </span>
                      </td>

                      {/* VERIFICATION */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {student.auth_provider === 'linkedin_oidc' ? (
                            <span className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                              <ShieldCheck size={12} /> VERIFIED
                            </span>
                          ) : (
                            <span className="text-muted-foreground/20 text-[9px] font-black uppercase tracking-widest">LEGACY</span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">ACTIVE</span>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-8 py-6">
                        <button className="p-3 rounded-xl bg-sidebar border border-border/5 text-muted-foreground/20 hover:text-primary transition-all">
                           {/* Action icon */}
                           <Users size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        {!loading && students.length > 0 && (
          <div className="px-10 py-6 border-t border-border/5 bg-sidebar/20 flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
              Showing {filtered.length} of {students.length} verified identities
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  <ShieldCheck size={12} /> {students.filter(s => s.auth_provider === 'linkedin_oidc').length} LinkedIn Verified
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
