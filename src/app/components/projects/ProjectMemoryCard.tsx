import React from 'react';
import { Users, Code2, Calendar, Sparkles, Play, Zap } from 'lucide-react';
import type { ProjectMemory } from '../../types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface ProjectMemoryCardProps {
  memory: ProjectMemory;
}

const ProjectMemoryCard: React.FC<ProjectMemoryCardProps> = ({ memory }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative bg-card/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-border/10 shadow-3xl transition-all duration-500 ring-1 ring-white/5"
    >
      {/* Team Visual Signature */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={memory.teamPhoto} 
          alt={memory.projectName}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        
        {/* Interaction Trigger */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
          <div className="w-20 h-20 bg-primary/20 backdrop-blur-3xl rounded-full flex items-center justify-center border border-primary/30 text-white cursor-pointer hover:bg-primary/40 transform hover:scale-110 transition-all shadow-3xl">
            <Play fill="white" size={32} />
          </div>
        </div>

        {/* Impact Metric Overlay */}
        <div className="absolute top-6 right-6 px-5 py-2.5 bg-primary shadow-[0_10px_30px_rgba(37,99,235,0.4)] rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-white/20">
          <Sparkles size={14} className="text-white animate-pulse" />
          Impact Score: {memory.impactScore}
        </div>
      </div>

      {/* Narrative Container */}
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1.5 bg-sidebar-accent/50 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 border border-border/5">
            {memory.department} Sector
          </span>
          <div className="flex items-center gap-2 text-muted-foreground/30 text-[10px] font-black uppercase tracking-widest">
            <Calendar size={14} />
            {format(new Date(memory.completionDate), 'MMM yyyy')}
          </div>
        </div>

        <div className="space-y-2">
            <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
              {memory.projectName}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">Legacy Identity Recorded</p>
            </div>
        </div>

        {/* Crew Synchronization */}
        <div className="flex items-center gap-4 py-2 border-y border-border/5">
          <div className="flex -space-x-3">
            {memory.teamMembers.slice(0, 3).map((member, i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-2xl border-2 border-card bg-sidebar-accent/50 flex items-center justify-center text-[10px] font-black text-primary uppercase shadow-lg group-hover:rotate-6 transition-transform"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {member.charAt(0)}
              </div>
            ))}
            {memory.teamMembers.length > 3 && (
              <div className="w-10 h-10 rounded-2xl border-2 border-card bg-sidebar-accent/20 flex items-center justify-center text-[10px] font-black text-muted-foreground/40 shadow-lg">
                +{memory.teamMembers.length - 3}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground leading-none mb-1">Elite Synthesis</p>
            <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">{memory.teamMembers.length} Active Builders</p>
          </div>
        </div>

        {/* Lore / Builder Insight */}
        <div className="p-6 bg-primary/[0.03] rounded-[2rem] border border-primary/5 italic text-sm text-muted-foreground leading-relaxed relative overflow-hidden group/lore">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover/lore:scale-110 transition-transform">
             <Zap size={40} className="text-primary" />
          </div>
          <p className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
            "{memory.funFact}"
          </p>
        </div>

        {/* Structural Tech Stack */}
        <div className="flex flex-wrap gap-2 pt-2">
          {memory.techStack.map((tech, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 bg-sidebar-accent/30 border border-border/5 hover:border-primary/20 hover:text-primary transition-all cursor-crosshair"
            >
              <Code2 size={12} className="opacity-40" />
              {tech}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectMemoryCard;
