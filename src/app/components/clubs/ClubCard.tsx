import { useNavigate } from 'react-router';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import type { Club } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ClubLogo } from './ClubLogo';
import { motion } from 'framer-motion';

interface ClubCardProps {
  club: Club;
  showStatus?: boolean;
}

export function ClubCard({ club, showStatus = false }: ClubCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      onClick={() => navigate(`/clubs/${club.id}`)}
      className="bg-card/40 backdrop-blur-2xl rounded-[2rem] border border-border/10 hover:border-primary/30 transition-all duration-500 cursor-pointer group overflow-hidden flex flex-col h-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-1 ring-white/5"
    >
      {/* Visual Identity / Cover */}
      <div className="h-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 via-transparent to-black/40 z-10" />
        {club.coverImage ? (
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-sidebar flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-primary)_1px,_transparent_1px)] bg-[size:20px_20px]" />
            <ClubLogo logo={club.logo} name={club.name} size="xl" className="filter grayscale group-hover:grayscale-0 transition-all duration-500 bg-transparent border-none shadow-none" />
          </div>
        )}
        
        {/* Department Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
            {club.department}
          </div>
        </div>

        {showStatus && (
          <div className="absolute top-4 right-4 z-20 scale-90 origin-right">
            <StatusBadge status={club.status} size="sm" />
          </div>
        )}
      </div>

      {/* Floating Logo Trigger (Corrected Position) */}
      <div className="absolute top-[8.5rem] left-6 z-20">
          <ClubLogo logo={club.logo} name={club.name} size="md" className="border-4 border-sidebar-accent/50 group-hover:rotate-6 transition-transform duration-500" />
      </div>

      {/* Content Engine */}
      <div className="p-7 pt-10 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-foreground text-xl font-black tracking-tighter mb-1.5 group-hover:text-primary transition-colors">
            {club.name}
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-primary" />
             <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest leading-none">
               Premier Association
             </p>
          </div>
        </div>

        <p className="text-muted-foreground font-medium text-sm line-clamp-2 mb-6 leading-relaxed flex-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
          "{club.shortDescription}"
        </p>

        {/* Modular Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {club.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-sidebar-accent/50 text-muted-foreground border border-border/10 rounded-lg text-[10px] font-bold uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300"
            >
              {tag}
            </span>
          ))}
          {club.tags.length > 3 && (
            <span className="px-2.5 py-1 bg-sidebar-accent/20 text-muted-foreground/40 rounded-lg text-[10px] font-bold">
              +{club.tags.length - 3}
            </span>
          )}
        </div>

        {/* Interactive Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border/10 mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Users size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-black text-sm tracking-tight leading-none">{club.memberCount}</span>
              <span className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-widest mt-1">Active Souls</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all duration-300">
            Nexus Protocol <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles size={16} className="text-primary/40 animate-pulse" />
      </div>
    </motion.div>
  );
}
