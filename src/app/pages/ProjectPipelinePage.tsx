import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Monitor,
  X,
  Camera,
  History,
  Activity,
  Zap
} from 'lucide-react';
import { DEPARTMENTS } from '../lib/constants';
import type { ProjectStage, ProjectHealth, Project } from '../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES: { id: ProjectStage; label: string; color: string; desc: string }[] = [
  { id: 'P1', label: 'Ideation', color: 'bg-primary/5', desc: 'Conceptualizing potential breakthroughs.' },
  { id: 'P2', label: 'Design', color: 'bg-indigo-500/5', desc: 'Architecting visual and functional logic.' },
  { id: 'P3', label: 'Development', color: 'bg-blue-500/5', desc: 'Iterating on core codebase and assets.' },
  { id: 'P4', label: 'Testing', color: 'bg-amber-500/5', desc: 'Stress testing and reliability protocols.' },
  { id: 'P5', label: 'Live', color: 'bg-emerald-500/5', desc: 'Deployed across institutional network.' },
];

export default function ProjectPipelinePage() {
  const { projects, archiveProject } = useData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  // Archival State
  const [archivingProject, setArchivingProject] = useState<Project | null>(null);
  const [funFact, setFunFact] = useState('');
  const [teamPhoto, setTeamPhoto] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.lead.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === 'all' || p.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [projects, search, deptFilter]);

  const handleArchiveConfirm = () => {
    if (archivingProject) {
      archiveProject(archivingProject.id, funFact, teamPhoto);
      toast.success(`${archivingProject.title} is now immortalized on the Memory Wall!`, {
        description: 'Check it out in the Memories section.',
        icon: <History size={16} />,
      });
      setArchivingProject(null);
      setFunFact('');
      setTeamPhoto('');
    }
  };

  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const healthy = filteredProjects.filter(p => p.health === 'green').length;
    const atRisk = filteredProjects.filter(p => p.health === 'yellow').length;
    const critical = filteredProjects.filter(p => p.health === 'red').length;
    return { total, healthy, atRisk, critical };
  }, [filteredProjects]);

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <Activity size={20} />
             </div>
             <div>
               <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                 Operation Nexus
               </p>
               <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
                 Project Pipeline
               </h1>
             </div>
          </div>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Tracking departmental deployments from initial ideation to live synchronization. 
            Maintain total oversight over the university's technical evolution.
          </p>
        </div>

        {/* Tactical Stat Console */}
        <div className="flex items-center gap-4 bg-card/40 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-border/10 shadow-2xl ring-1 ring-white/5">
          <StatMini label="Active" value={stats.total} color="primary" />
          <div className="w-px h-10 bg-border/10" />
          <StatMini label="Healthy" value={stats.healthy} color="emerald" icon={<CheckCircle2 size={12} />} />
          <StatMini label="At Risk" value={stats.atRisk} color="amber" icon={<AlertCircle size={12} />} />
          <StatMini label="Critical" value={stats.critical} color="rose" icon={<AlertCircle size={12} />} />
        </div>
      </motion.div>

      {/* Control Strip (Search & View Logic) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl ring-1 ring-white/5">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-96 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search active project signatures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-sidebar border border-border/10 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground placeholder-muted-foreground/20 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="hidden md:flex items-center gap-2 mr-2">
               <Filter size={18} className="text-muted-foreground/30" />
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Sector Filter</span>
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full md:w-56 px-6 py-4 rounded-2xl bg-sidebar border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold tracking-tight text-foreground"
            >
              <option value="all">Unified Segments</option>
              {DEPARTMENTS.sort().map(d => (
                <option key={d} value={d}>{d} Sector</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center bg-sidebar p-1.5 rounded-2xl border border-border/10 shadow-inner">
          <button 
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${view === 'kanban' ? 'bg-primary text-white shadow-xl px-8 scale-105' : 'text-muted-foreground/40 hover:text-foreground'}`}
          >
            <LayoutGrid size={16} /> Grid Dimension
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${view === 'list' ? 'bg-primary text-white shadow-xl px-8 scale-105' : 'text-muted-foreground/40 hover:text-foreground'}`}
          >
            <List size={16} /> List Audit
          </button>
        </div>
      </div>

      {/* Primary Workspace */}
      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start"
          >
            {STAGES.map((stage) => {
              const stageProjects = filteredProjects.filter(p => p.stage === stage.id);
              return (
                <div key={stage.id} className="flex flex-col gap-6">
                  <div className="px-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${stage.id === 'P5' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-primary/40'}`} />
                         <h3 className="font-black text-foreground text-xs uppercase tracking-[0.2em]">{stage.label}</h3>
                      </div>
                      <span className="text-[10px] font-black font-mono text-muted-foreground/20">{stage.id}</span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground/40 truncate italic">"{stage.desc}"</p>
                  </div>
                  
                  <div className={`flex flex-col gap-6 p-6 rounded-[2.5rem] min-h-[600px] ${stage.color} border border-border/5 shadow-inner ring-1 ring-white/5`}>
                    {stageProjects.length > 0 ? (
                      stageProjects.map((project, idx) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <ProjectCard 
                            project={project} 
                            onArchive={(id) => {
                              const p = projects.find(proj => proj.id === id);
                              if (p) setArchivingProject(p);
                            }}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/10 rounded-[2rem] text-muted-foreground/20">
                        <Zap size={24} className="mb-4 opacity-50" />
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none">Vacuum State</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 overflow-hidden shadow-2xl ring-1 ring-white/5"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sidebar-accent/30 border-b border-border/10">
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Project Signature</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Sector</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Dimension</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Vitality</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Sequence</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {filteredProjects.map(p => (
                  <tr key={p.id} className="group hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sidebar-accent/50 border border-border/10 flex items-center justify-center text-primary font-black text-xs">
                           {p.title.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-wider flex items-center gap-2">
                             System Lead: <span className="text-primary/60">{p.lead}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg bg-sidebar-accent/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border/5">{p.department}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="font-black text-[11px] text-foreground uppercase tracking-tight">
                          {STAGES.find(s => s.id === p.stage)?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          p.health === 'green' ? 'bg-emerald-500' : 
                          p.health === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                        } shadow-[0_0_8px_rgba(37,99,235,0.2)]`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{p.health}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-32 bg-sidebar-accent/30 h-1.5 rounded-full overflow-hidden border border-border/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${p.progress}%` }}
                          className={`h-full rounded-full ${
                            p.health === 'green' ? 'bg-emerald-500' : 
                            p.health === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground/20 mt-2 block">{p.progress}% SYNC</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {p.stage === 'P5' ? (
                        <button 
                          onClick={() => setArchivingProject(p)}
                          className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-xl shadow-primary/10"
                        >
                          <History size={18} />
                        </button>
                      ) : (
                        <ChevronRight size={18} className="text-muted-foreground/20 ml-auto group-hover:text-primary transition-colors" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Dimension Modal */}
      <AnimatePresence>
        {archivingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-2xl" 
              onClick={() => setArchivingProject(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-card/95 backdrop-blur-3xl w-full max-w-xl rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-border/10 overflow-hidden ring-1 ring-white/10"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Immobilization Protocol</p>
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter leading-tight">
                      Archiving <span className="text-primary italic">{archivingProject.title}</span>.
                    </h2>
                    <p className="text-muted-foreground/60 text-sm font-medium">Capture the final memory signature for the Hall of Builders.</p>
                  </div>
                  <button 
                    onClick={() => setArchivingProject(null)}
                    className="w-10 h-10 flex items-center justify-center bg-sidebar-accent/50 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.3em] ml-2">Team Build "Fun Fact"</label>
                    <textarea 
                      value={funFact}
                      onChange={(e) => setFunFact(e.target.value)}
                      placeholder="e.g. The drone once flew into a wedding rehearsal in the campus garden!"
                      className="w-full p-6 bg-sidebar border border-border/10 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground placeholder-muted-foreground/20 min-h-[140px] resize-none shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.3em] ml-2">Team Visual Signature</label>
                    <div className="relative">
                      <Camera className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                      <input 
                        type="text"
                        value={teamPhoto}
                        onChange={(e) => setTeamPhoto(e.target.value)}
                        placeholder="IPFS Link or Asset URL..."
                        className="w-full pl-16 pr-8 py-5 bg-sidebar border border-border/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground placeholder-muted-foreground/20 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      onClick={() => setArchivingProject(null)}
                      className="flex-1 py-5 bg-sidebar-accent/50 text-muted-foreground font-black rounded-2xl hover:bg-sidebar-accent hover:text-foreground transition-all uppercase text-[10px] tracking-widest"
                    >
                      Abort
                    </button>
                    <button 
                      onClick={handleArchiveConfirm}
                      disabled={!funFact}
                      className="flex-[1.5] py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all uppercase text-[10px] tracking-widest"
                    >
                      Commit to History
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-10 py-5 bg-primary/10 text-primary text-[9px] font-black text-center uppercase tracking-[0.3em] border-t border-primary/20 backdrop-blur-3xl">
                Immutably writing to institutional memory wall.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatMini({ label, value, color, icon }: { label: string; value: number; color: string; icon?: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/5 border-primary/10',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
    rose: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
  };
  
  return (
    <div className={`px-5 py-3 rounded-2xl border flex items-center gap-4 transition-all duration-300 hover:scale-105 ring-1 ring-white/5 ${colorMap[color]}`}>
      <div className="flex flex-col">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1.5">{label}</p>
        <p className="text-xl font-black leading-none tracking-tighter">{value}</p>
      </div>
      {icon && <div className="p-2 rounded-xl bg-white/10">{icon}</div>}
    </div>
  );
}
