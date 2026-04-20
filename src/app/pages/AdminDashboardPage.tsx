import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CalendarDays,
  BarChart2,
  ArrowRight,
  Activity,
  ShieldCheck,
  Zap,
  LayoutGrid,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CLUB_COLORS } from '../lib/constants';
import { format, isAfter, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboardPage() {
  const { clubs, events } = useData();
  const navigate = useNavigate();

  const today = new Date();

  const stats = useMemo(() => {
    return {
      totalClubs: clubs.length,
      approvedClubs: clubs.filter((c) => c.status === 'approved').length,
      pendingClubs: clubs.filter((c) => c.status === 'pending').length,
      rejectedClubs: clubs.filter((c) => c.status === 'rejected').length,
      totalEvents: events.length,
      approvedEvents: events.filter((e) => e.status === 'approved').length,
      pendingEvents: events.filter((e) => e.status === 'pending').length,
      draftEvents: events.filter((e) => e.status === 'draft').length,
      rejectedEvents: events.filter((e) => e.status === 'rejected').length,
      upcomingEvents: events.filter(
        (e) => e.status === 'approved' && isAfter(new Date(e.date), today)
      ).length,
    };
  }, [clubs, events, today]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      approved: events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === i && d.getFullYear() === 2026 && e.status === 'approved';
      }).length,
      pending: events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === i && d.getFullYear() === 2026 && e.status === 'pending';
      }).length,
      rejected: events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === i && d.getFullYear() === 2026 && e.status === 'rejected';
      }).length,
    }));
  }, [events]);

  const clubActivity = useMemo(() => {
    return clubs
      .filter((c) => c.status === 'approved')
      .map((club) => ({
        id: club.id,
        name: club.name,
        logo: club.logo,
        department: club.department,
        total: events.filter((e) => e.clubId === club.id).length,
        approved: events.filter((e) => e.clubId === club.id && e.status === 'approved').length,
      }))
      .sort((a, b) => b.total - a.total);
  }, [clubs, events]);

  const eventStatusData = [
    { name: 'Approved', value: stats.approvedEvents, color: '#3b82f6' },
    { name: 'Pending', value: stats.pendingEvents, color: '#f59e0b' },
    { name: 'Draft', value: stats.draftEvents, color: '#64748b' },
    { name: 'Rejected', value: stats.rejectedEvents, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const pendingEvents = events.filter((e) => e.status === 'pending').slice(0, 5);

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Executive Command Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
               <ShieldCheck size={20} />
             </div>
             <div>
               <p className="text-rose-500 font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                 Executive Management Port
               </p>
               <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">
                 Command <span className="text-muted-foreground/20 italic">Center</span>.
               </h1>
             </div>
          </div>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
            Real-time university-wide governance oversight. Monitor sector throughput, 
            authorize operational requests, and audit structural metrics.
          </p>
        </div>

        {/* Global Operational Status */}
        <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5">
           <div className="px-6 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Sector Health</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                 <p className="text-2xl font-black text-foreground tracking-tighter leading-none uppercase">Optimal</p>
              </div>
           </div>
           <div className="w-px h-12 bg-border/10" />
           <div className="px-6">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Throughput Velocity</p>
              <p className="text-2xl font-black text-primary tracking-tighter leading-none">94.2%</p>
           </div>
        </div>
      </motion.div>

      {/* High-Priority Authorization Tunnels */}
      <AnimatePresence>
        {(stats.pendingEvents > 0 || stats.pendingClubs > 0) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {stats.pendingEvents > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group flex items-center justify-between p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] cursor-pointer hover:bg-amber-500/10 transition-all shadow-2xl overflow-hidden relative"
                onClick={() => navigate('/admin/events')}
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                    <AlertCircle size={100} className="text-amber-500" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none mb-2">
                      {stats.pendingEvents} Critical Authorizations
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 leading-none">Awaiting Operational Approval</p>
                  </div>
                </div>
                <ArrowRight size={24} className="text-amber-500 group-hover:translate-x-2 transition-transform relative z-10" />
              </motion.div>
            )}
            {stats.pendingClubs > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group flex items-center justify-between p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] cursor-pointer hover:bg-primary/10 transition-all shadow-2xl overflow-hidden relative"
                onClick={() => navigate('/admin/clubs')}
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                    <Users size={100} className="text-primary" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <LayoutGrid size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight leading-none mb-2">
                      {stats.pendingClubs} Institutional Requests
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none">Sector Commissioning Pending</p>
                  </div>
                </div>
                <ArrowRight size={24} className="text-primary group-hover:translate-x-2 transition-transform relative z-10" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Bento Stats GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <StatBento label="Unified Protocols" value={stats.totalClubs} icon={<LayoutGrid size={20} />} trend="+4.1%" />
          <StatBento label="Authorized Sectors" value={stats.approvedClubs} icon={<ShieldCheck size={20} />} color="emerald" />
          <StatBento label="Intel Throughput" value={stats.totalEvents} icon={<Zap size={20} />} trend="+12.4%" />
          <StatBento label="Live Confluences" value={stats.approvedEvents} icon={<CheckCircle2 size={20} />} color="primary" />
          <StatBento label="Audit Backlog" value={stats.pendingEvents} icon={<Clock size={20} />} color="amber" />
          <StatBento label="Temporal Horizon" value={stats.upcomingEvents} icon={<CalendarDays size={20} />} />
      </div>

      {/* Main Analytics Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Core Throughput Visualization */}
        <div className="xl:col-span-2 bg-card/60 backdrop-blur-3xl rounded-[3rem] border border-border/10 p-10 shadow-3xl ring-1 ring-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground tracking-tighter">Throughput Vector Analysis</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Cycle Period: Q1 2026</p>
            </div>
            <div className="px-6 py-2.5 rounded-xl bg-sidebar-accent/50 border border-border/10 flex items-center gap-3">
               <Activity size={16} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest">Real-time Stream</span>
            </div>
          </div>
          
          <div className="h-[400px] w-full mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barCategoryGap="35%">
                <defs>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 900 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 900 }} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                  itemStyle={{ color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="approved" fill="url(#approvedGrad)" radius={[8, 8, 0, 0]} name="Authorized" />
                <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} opacity={0.3} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Sphere */}
        <div className="bg-card/60 backdrop-blur-3xl rounded-[3rem] border border-border/10 p-10 shadow-3xl ring-1 ring-white/5 flex flex-col">
          <h3 className="text-2xl font-black text-foreground tracking-tighter mb-8">Status Stratification</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={eventStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                >
                    {eventStatusData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ filter: `drop-shadow(0 0 10px ${entry.color}40)` }}
                    />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '1rem' 
                    }} 
                />
                </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {eventStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-sidebar-accent/30 border border-border/5 group hover:bg-sidebar-accent/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.name} Protocols</span>
                </div>
                <span className="text-lg font-black text-foreground tracking-tighter">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Activity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Tier 1 Sector Activity */}
        <div className="bg-card/60 backdrop-blur-3xl rounded-[3.5rem] border border-border/10 p-10 shadow-3xl ring-1 ring-white/5 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter">Sector Momentum</h3>
            </div>
            <button
              onClick={() => navigate('/admin/clubs')}
              className="px-6 py-2.5 rounded-xl bg-sidebar hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-border/10 shadow-xl"
            >
              Strategic Audit <ArrowRight size={14} className="inline ml-2" />
            </button>
          </div>
          <div className="space-y-6">
            {clubActivity.slice(0, 5).map((club, i) => (
              <div
                key={club.id}
                className="flex items-center gap-5 group cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                onClick={() => navigate(`/clubs/${club.id}`)}
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl font-black" style={{ color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}>
                  #{i + 1}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-3xl shadow-3xl border border-border/10 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                   <span className="relative z-10">{club.logo}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-foreground truncate tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors">
                    {club.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                    {club.department} Intelligence
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-foreground tracking-tighter leading-none mb-1">
                    {club.total}
                  </p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                      Verified
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Review Queue */}
        <div className="bg-card/60 backdrop-blur-3xl rounded-[3.5rem] border border-border/10 p-10 shadow-3xl ring-1 ring-white/5 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle size={22} />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tighter">Authorization Queue</h3>
            </div>
            <button
              onClick={() => navigate('/admin/events')}
              className="px-6 py-2.5 rounded-xl bg-sidebar hover:bg-amber-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-border/10 shadow-xl"
            >
              Deep Review <ArrowRight size={14} className="inline ml-2" />
            </button>
          </div>
          
          <AnimatePresence>
            {pendingEvents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/10 ring-8 ring-emerald-500/5">
                   <CheckCircle2 size={40} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-foreground tracking-tight">Zero Backlog Correlation</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">All operational requests authorized</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => {
                  const club = clubs.find((c) => c.id === event.clubId);
                  return (
                    <motion.div
                      whileHover={{ x: 10 }}
                      key={event.id}
                      className="flex items-start gap-6 p-6 bg-sidebar/50 rounded-3xl border border-border/5 hover:border-amber-500/20 group transition-all"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-3xl shadow-2xl shrink-0 group-hover:scale-110 transition-transform">
                         {club?.logo}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-lg font-black text-foreground truncate tracking-tighter leading-none mb-2">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{club?.name}</p>
                           <div className="w-1 h-1 rounded-full bg-border/20" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{format(new Date(event.date), 'MMM d')}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <StatusBadge status={event.status} />
                      </div>
                    </motion.div>
                  );
                })}
                {stats.pendingEvents > 5 && (
                  <button
                    onClick={() => navigate('/admin/events')}
                    className="w-full py-4 text-center text-amber-500 font-black uppercase text-[10px] tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity"
                  >
                    + Audit {stats.pendingEvents - 5} Supplemental Requests
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatBento({ label, value, icon, trend, color = 'muted-foreground' }: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  trend?: string; 
  color?: string 
}) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    violet: 'text-violet-500',
    'muted-foreground': 'text-muted-foreground/40'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border/10 shadow-2xl ring-1 ring-white/5 space-y-6 group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
         {icon}
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-sidebar flex items-center justify-center shadow-inner border border-border/10 relative z-10 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-2">{label}</p>
        <div className="flex items-end justify-between">
          <h4 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            {value}
          </h4>
          {trend && (
            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
              <TrendingUp size={10} /> {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
