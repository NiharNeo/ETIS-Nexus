import { useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Flame, 
  Target,
  BarChart3,
  Activity,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ContributionHeatmap } from '../components/analytics/ContributionHeatmap';
import { motion } from 'framer-motion';

export default function ContributionRadarPage() {
  const { contributions } = useData();

  const sortedByPoints = useMemo(() => {
    return [...contributions].sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
  }, [contributions]);

  const topDept = sortedByPoints[0];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">Institutional Pulse Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-[1.1]">
            Contribution <span className="text-primary">Radar</span>.
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl leading-relaxed">
            A high-fidelity audit of departmental velocity. Tracking project deployments, 
            event frequency, and academic throughput to foster a culture of excellence.
          </p>
        </div>

        {/* Global Stats Hub */}
        <div className="flex items-center gap-8 p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5">
          <div className="text-center px-6">
            <p className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-widest mb-1.5">Network Heat</p>
            <p className="text-3xl font-black text-primary flex items-center justify-center gap-2 tracking-tighter">
              <Flame size={24} className="animate-pulse" /> 14.2k
            </p>
          </div>
          <div className="w-px h-12 bg-border/20" />
          <div className="px-6">
            <p className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-widest mb-1.5">Apex Entity</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                {topDept?.department === 'CSE' ? '💻' : '⚙️'}
              </div>
              <p className="text-xl font-black text-foreground tracking-tighter">
                {topDept?.department}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Apex Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {sortedByPoints.slice(0, 4).map((dept, index) => (
          <motion.div 
            key={dept.department}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-card/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-border/10 hover:border-primary/40 transition-all duration-500 shadow-xl ring-1 ring-white/5 overflow-hidden"
          >
            {/* Index Dimensionality */}
            <div className={`absolute top-0 right-0 w-16 h-16 flex items-center justify-center rounded-bl-[2rem] text-xl font-black z-10 transition-colors ${
              index === 0 ? 'bg-primary text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)]' :
              index === 1 ? 'bg-sidebar-accent/50 text-foreground' :
              'bg-sidebar-accent/20 text-muted-foreground/60'
            }`}>
              #{index + 1}
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-black text-foreground tracking-tighter mb-1">{dept.department}</h3>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Sector Intelligence</p>
              </div>
              
              <div className="space-y-6 mb-10">
                 <StatLinear label="Deployments" value={dept.stats.projects} color="primary" max={50} />
                 <StatLinear label="Convergences" value={dept.stats.events} color="indigo" max={30} />
                 <StatLinear label="Blueprints" value={dept.stats.papers} color="emerald" max={40} />
              </div>

              <div className="pt-8 border-t border-border/10 flex items-center justify-between">
                 <div>
                    <p className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-[0.2em] mb-1">Impact Score</p>
                    <p className="text-3xl font-black text-foreground tracking-tighter">{dept.stats.totalPoints}</p>
                 </div>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                   index === 0 ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(37,99,235,0.1)]' : 'bg-sidebar-accent/50 text-muted-foreground/40'
                 }`}>
                    {index === 0 ? <Trophy size={22} /> : <TrendingUp size={22} />}
                 </div>
              </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
              <Activity size={200} className="text-foreground" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap Dimension */}
      <div className="space-y-10 pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <BarChart3 size={24} />
             </div>
             <div>
               <h2 className="text-3xl font-black text-foreground tracking-tighter">Temporal Heatmaps</h2>
               <p className="text-muted-foreground font-medium text-sm">Visualizing 120-day contribution consistency.</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-3 bg-card/40 rounded-2xl border border-border/10 ring-1 ring-white/5">
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Intensity</span>
             <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-sm ${
                    i === 1 ? 'bg-sidebar-accent/30' :
                    i === 2 ? 'bg-primary/20' :
                    i === 3 ? 'bg-primary/40' :
                    i === 4 ? 'bg-primary/70' : 'bg-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                  }`} />
                ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {contributions.map((dept, index) => (
            <motion.div 
              key={dept.department}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-border/10 hover:border-primary/30 transition-all duration-500 shadow-2xl relative overflow-hidden"
            >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[2rem] bg-sidebar-accent/50 border border-border/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                        {dept.department === 'CSE' ? '💻' : 
                         dept.department === 'ECE' ? '📡' : 
                         dept.department === 'EEE' ? '⚡' : 
                         dept.department === 'MBA' ? '📊' : '⚙️'}
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-foreground tracking-tighter leading-none mb-2">{dept.department} Protocol</h4>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                          <Sparkles size={14} className="text-primary" />
                          {dept.stats.totalPoints} total impact points curated locally
                        </p>
                     </div>
                  </div>
                  <button className="px-8 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    Deploy Audit <ChevronRight size={18} />
                  </button>
               </div>
               
               <div className="relative z-10 px-4">
                 <ContributionHeatmap activity={dept.activity} />
               </div>

               {/* Background Texture */}
               <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Zap size={200} />
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatLinear({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">{label}</span>
        <span className="text-sm font-black text-foreground leading-none">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-sidebar-accent/30 rounded-full overflow-hidden border border-border/5 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${color === 'primary' ? 'bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 
                                             color === 'indigo' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 
                                             'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`} 
        />
      </div>
    </div>
  );
}
