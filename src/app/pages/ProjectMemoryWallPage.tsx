import React, { useState } from 'react';
import { Camera, Search, Filter, History, Award, TrendingUp, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProjectMemoryCard from '../components/projects/ProjectMemoryCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectMemoryWallPage: React.FC = () => {
  const { memories, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.projectName.toLowerCase().includes(search.toLowerCase()) || 
                          memory.teamMembers.some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === 'all' || memory.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['all', ...Array.from(new Set(memories.map(m => m.department)))];

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Hall of Immortals Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
               <History size={20} />
             </div>
             <div>
               <p className="text-amber-500 font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                 Universal Documentation
               </p>
               <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">
                 Memory Wall <span className="text-muted-foreground/20 italic">Archive</span>.
               </h1>
             </div>
          </div>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
            Celebrating the definitive legacy of technical innovation. Every project that reached 
            the Live dimension is immortalized here to guide future cycles of excellence.
          </p>
        </div>

        {/* Legacy Telemetry Console */}
        <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5">
           <div className="px-6 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Immortals Count</p>
              <p className="text-4xl font-black text-amber-500 tracking-tighter leading-none">{memories.length}</p>
           </div>
           <div className="w-px h-12 bg-border/20" />
           <div className="px-6 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Verified Integrity</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500 mx-auto" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Hall of Honors Active</span>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Persistence Controls (Filters) */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-6 rounded-[3rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl ring-1 ring-white/5">
        <div className="relative w-full lg:w-[40%] group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search legacy project signatures or builder names..."
            className="w-full pl-16 pr-4 py-4.5 bg-sidebar border border-border/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 text-sm font-bold tracking-tight text-foreground placeholder-muted-foreground/10 transition-all shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full lg:w-auto no-scrollbar mask-gradient-overlay">
          <div className="p-3 bg-sidebar-accent/50 rounded-xl text-muted-foreground/30 mr-2 border border-border/5">
            <Filter size={18} />
          </div>
          {departments.map((dept, index) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                selectedDept === dept 
                ? 'bg-amber-500 text-white border-amber-500 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]' 
                : 'bg-card/40 text-muted-foreground/60 border-border/10 hover:border-amber-500/30 hover:text-foreground'
              }`}
            >
              {dept} Sector
            </button>
          ))}
        </div>
      </div>

      {/* Archive Grid DISPLAY */}
      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[500px] bg-card/40 rounded-[3rem] border border-border/10 animate-pulse" />
            ))}
          </div>
        ) : filteredMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProjectMemoryCard memory={memory} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-48 text-center bg-card/20 rounded-[4rem] border border-dashed border-border/10"
          >
            <div className="w-24 h-24 bg-card/40 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-3xl ring-1 ring-white/5">
              <Camera className="text-muted-foreground/10" size={40} />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none mb-4">Zero Legacy Correlation</h2>
            <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
              No archives found matching these synchronization parameters. The memory may reside in a different sector.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hall of Builders Philosophy Footer */}
      <div className="mt-24 py-20 border-t border-border/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 text-center space-y-8">
           <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.4em]" style={{ fontSize: '9px' }}>
              <TrendingUp size={16} />
              Protocol Integrity Matrix Active
           </div>
           <blockquote className="text-4xl md:text-5xl font-black text-foreground tracking-tighter max-w-4xl mx-auto leading-[1.1] opacity-40 hover:opacity-100 transition-opacity duration-700 cursor-default">
            "The definitive way to anticipate the <span className="text-primary italic">future</span> is to architect it immutably."
           </blockquote>
           <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sidebar-accent/50 border border-border/10 flex items-center justify-center text-primary group-hover:animate-bounce">
                 <Zap size={20} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">ETIS Institutional Governance Matrix • Phase 4.2</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMemoryWallPage;
