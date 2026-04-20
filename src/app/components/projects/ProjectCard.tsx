import { Project } from '../../types';
import { 
  MoreHorizontal, 
  ArrowUpRight,
  History as HistoryIcon,
  Activity,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onArchive?: (id: string) => void;
}

export function ProjectCard({ project, onArchive }: ProjectCardProps) {
  const healthColors: Record<string, string> = {
    green: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    yellow: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    red: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/10 hover:border-primary/30 transition-all duration-300 cursor-pointer p-6 shadow-sm hover:shadow-2xl ring-1 ring-white/5 overflow-hidden"
    >
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Health Indicator Strip */}
      <div className={`absolute top-0 left-0 w-1 h-full ${healthColors[project.health]}`} />

      {/* Archive Action Overlay for P5 */}
      {project.stage === 'P5' && onArchive && (
        <div className="absolute top-4 right-12 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onArchive(project.id);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl transform active:scale-95 transition-all"
            title="Archive to Memory Wall"
          >
            <HistoryIcon size={12} />
            Archive
          </button>
        </div>
      )}

      <div className="flex justify-between items-start mb-5 relative z-10">
         <span className="px-2.5 py-1 rounded-lg bg-sidebar-accent/50 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border border-border/5 group-hover:bg-primary/10 group-hover:text-primary transition-all">
           {project.department}
         </span>
         <button className="text-muted-foreground/30 hover:text-foreground transition-colors">
           <MoreHorizontal size={16} />
         </button>
      </div>

      <h4 className="text-lg font-black text-foreground tracking-tighter mb-2 line-clamp-1 group-hover:text-primary transition-colors">
        {project.title}
      </h4>
      <p className="text-muted-foreground/60 text-xs font-medium line-clamp-2 leading-relaxed mb-6 italic opacity-80 group-hover:opacity-100 transition-opacity">
        "{project.description}"
      </p>

      {/* Operational Intelligence (Health/Progress) */}
      <div className="mb-8 relative z-10">
         <div className="flex justify-between items-end mb-2">
           <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${healthColors[project.health]}`} />
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">Status Level</span>
           </div>
           <span className="text-xs font-black text-foreground leading-none">{project.progress}%</span>
         </div>
         <div className="w-full h-1.5 bg-sidebar-accent/30 rounded-full overflow-hidden border border-border/5">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${project.progress}%` }}
             transition={{ duration: 1, ease: 'easeOut' }}
             className={`h-full rounded-full ${healthColors[project.health]}`} 
           />
         </div>
      </div>

      {/* Crew & Telemetry Footer */}
      <div className="pt-6 border-t border-border/10 flex items-center justify-between relative z-10">
         <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-7 h-7 rounded-2xl border-2 border-card bg-sidebar-accent/50 flex items-center justify-center overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.id}${i}`} alt="Team member" className="opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {project.teamSize > 3 && (
              <div className="w-7 h-7 rounded-2xl border-2 border-card bg-sidebar-accent/20 flex items-center justify-center text-[8px] font-black text-muted-foreground/40">
                +{project.teamSize - 3}
              </div>
            )}
         </div>

         <div className="flex items-center gap-2 text-muted-foreground/40 group-hover:text-primary transition-colors">
           <Zap size={14} className="group-hover:animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">Interface</span>
           <ArrowUpRight size={14} />
         </div>
      </div>
    </motion.div>
  );
}
