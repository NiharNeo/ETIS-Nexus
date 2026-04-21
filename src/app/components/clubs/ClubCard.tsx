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
      className="bg-card rounded-none border border-border hover:border-primary transition-all duration-500 cursor-pointer group overflow-hidden flex flex-col h-full shadow-none"
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
          <div className="px-3 py-1 rounded-none bg-primary border text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-none">
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
          <h3 className="text-foreground text-2xl font-normal tracking-tight mb-1.5 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
            {club.name}
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 bg-primary" />
             <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] leading-none">
               Premier Association
             </p>
          </div>
        </div>

        <p className="text-foreground/70 font-normal text-sm line-clamp-2 mb-6 leading-relaxed flex-1 italic opacity-80 group-hover:opacity-100 transition-opacity" style={{ fontFamily: 'var(--font-display)' }}>
          "{club.shortDescription}"
        </p>

        {/* Modular Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {club.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[#ffdea0] text-[#261a00] border border-[#8f706c] rounded-none text-[10px] font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all duration-300"
            >
              {tag}
            </span>
          ))}
          {club.tags.length > 3 && (
            <span className="px-2.5 py-1 bg-muted text-foreground/40 rounded-none border border-border text-[10px] font-bold">
              +{club.tags.length - 3}
            </span>
          )}
        </div>

        {/* Interactive Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-muted flex items-center justify-center text-foreground border border-border">
              <Users size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-normal text-lg tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>{club.memberCount}</span>
              <span className="text-[9px] text-foreground/60 uppercase font-bold tracking-[0.2em] mt-1">Active Souls</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-none bg-transparent border border-foreground text-foreground text-[10px] font-bold uppercase tracking-[0.2em] group-hover:bg-foreground group-hover:text-card transition-all duration-300">
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
