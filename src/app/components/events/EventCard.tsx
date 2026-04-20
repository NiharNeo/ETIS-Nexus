import { Calendar, Clock, MapPin, Users, ArrowRight, Sparkles, Orbit } from 'lucide-react';
import { format } from 'date-fns';
import type { ClubEvent, Club } from '../../types';
import { StatusBadge, ModeBadge } from '../common/StatusBadge';
import { ClubLogo } from '../clubs/ClubLogo';
import { CLUB_COLORS } from '../../lib/constants';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: ClubEvent;
  club?: Club;
  showStatus?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function EventCard({ event, club, showStatus = false, onClick, compact = false }: EventCardProps) {
  const clubColor = CLUB_COLORS[event.clubId] ?? '#2563eb';

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 5, backgroundColor: "rgba(37, 99, 235, 0.05)" }}
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/10 hover:border-primary/30 transition-all duration-300 cursor-pointer group shadow-sm ring-1 ring-white/5"
      >
        <div
          className="w-1.5 h-10 rounded-full flex-shrink-0 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.3)]"
          style={{ backgroundColor: clubColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-black tracking-tight truncate group-hover:text-primary transition-colors" style={{ fontSize: '14px' }}>
            {event.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={10} /> {format(new Date(event.date), 'MMM d')}
            </span>
            <div className="w-1 h-1 rounded-full bg-border/40" />
            <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={10} /> {event.startTime}
            </span>
          </div>
        </div>
        <div className="scale-75 origin-right">
          <StatusBadge status={event.status} size="sm" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className="bg-card/40 backdrop-blur-2xl rounded-[2.5rem] border border-border/10 hover:border-primary/30 shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer group flex flex-col h-full overflow-hidden ring-1 ring-white/5"
    >
      {/* Visual Dimension / Cover */}
      <div className="relative">
        <div className="h-52 overflow-hidden relative bg-sidebar/50">
          <img
            src={event.coverImage || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&auto=format&fit=crop`}
            alt={event.title}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out ${!event.coverImage ? 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          
          {/* Overlay Meta */}
          <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ClubLogo logo={club?.logo} name={club?.name || ''} size="sm" className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-md">{club?.name}</span>
            </div>
            <ModeBadge mode={event.mode} size="sm" />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 scale-90 origin-right">
          {showStatus && <StatusBadge status={event.status} size="sm" />}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-xl font-black tracking-tighter text-foreground mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
            {event.title}
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-primary/40" />
             <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em]">Priority Sequence</p>
          </div>
        </div>

        <p className="text-muted-foreground font-medium text-sm line-clamp-2 mb-6 leading-relaxed flex-1 opacity-80 italic">
          "{event.shortDescription}"
        </p>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sidebar-accent/30 border border-border/5 flex items-center gap-3">
             <Calendar size={14} className="text-primary" />
             <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Date</span>
                <span className="text-xs font-bold text-foreground">{format(new Date(event.date), 'MMM d, yyyy')}</span>
             </div>
          </div>
          <div className="p-3 rounded-2xl bg-sidebar-accent/30 border border-border/5 flex items-center gap-3">
             <Clock size={14} className="text-primary" />
             <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Start</span>
                <span className="text-xs font-bold text-foreground">{event.startTime}</span>
             </div>
          </div>
          <div className="col-span-2 p-3 rounded-2xl bg-sidebar-accent/30 border border-border/5 flex items-center gap-3">
             <MapPin size={14} className="text-rose-500" />
             <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Portal/Venue</span>
                <span className="text-xs font-bold text-foreground truncate">{event.venue}</span>
             </div>
          </div>
        </div>

        {/* Tactical Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border/10 mt-auto">
          <div className="flex items-center gap-2">
            <Orbit size={14} className="text-muted-foreground/30 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Sequence Ready</span>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-[0_8px_16px_rgba(37,99,235,0.3)]">
            Open Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      {/* Decorative Aura */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </motion.div>
  );
}
