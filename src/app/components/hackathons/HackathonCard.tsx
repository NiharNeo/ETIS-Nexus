import { Hackathon } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  MapPin, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const { formTeam } = useData();
  const { user } = useAuth();
  
  const handleFormTeam = () => {
    if (!user) return;
    formTeam(hackathon.id);
    toast.success('Interests Signaled', {
      description: 'The Domain Leads have been synchronized to start cross-department coordination.',
      icon: <Zap className="text-primary" size={16} />
    });
  };

  const isUrgent = new Date(hackathon.deadline).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 7;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="group relative flex flex-col bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-border/10 overflow-hidden shadow-2xl hover:border-primary/30 transition-all duration-500 ring-1 ring-white/5 h-full"
    >
      {/* Visual Identity Layer */}
      <div className="relative h-56 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          src={hackathon.coverImage} 
          alt={hackathon.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        
        {/* Badges Matrix */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-3xl border shadow-2xl ${
            hackathon.mode === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            hackathon.mode === 'offline' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
            'bg-primary/10 border-primary/20 text-primary'
          }`}>
            {hackathon.mode} Protocol
          </span>
          {isUrgent && (
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2"
            >
              <Clock size={12} /> Execution Imminent
            </motion.span>
          )}
        </div>

        {/* Tactical Tag Cluster */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2">
            {hackathon.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-xl bg-white/5 backdrop-blur-3xl text-white/60 text-[8px] font-black border border-white/5 uppercase tracking-[0.15em]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Intel Data Area */}
      <div className="p-8 flex-1 flex flex-col space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            <h4 className="text-2xl font-black text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
              {hackathon.title}
            </h4>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
               <Trophy size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] leading-none">
              Organized by {hackathon.organizer} Hub
            </p>
          </div>
        </div>

        <p className="text-muted-foreground/60 text-sm font-medium leading-relaxed line-clamp-2 italic">
          "{hackathon.description}"
        </p>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <div className="p-4 rounded-2xl bg-sidebar-accent/30 border border-border/5 flex items-center gap-4 transition-all group/stat hover:bg-sidebar-accent/50">
            <MapPin size={16} className="text-muted-foreground/30 group-hover/stat:text-primary transition-colors" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase text-muted-foreground/20 tracking-widest leading-none mb-1">Nexus</p>
              <p className="text-xs font-black text-foreground truncate tracking-tight">{hackathon.venue}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-sidebar-accent/30 border border-border/5 flex items-center gap-4 transition-all group/stat hover:bg-sidebar-accent/50">
            <Target size={16} className="text-muted-foreground/30 group-hover/stat:text-rose-500 transition-colors" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase text-muted-foreground/20 tracking-widest leading-none mb-1">Window</p>
              <p className="text-xs font-black text-foreground truncate tracking-tight">
                {formatDistanceToNow(new Date(hackathon.deadline), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Tier Section */}
        <div className="mt-auto space-y-4 pt-6 border-t border-border/10">
          <div className="flex gap-4">
            <button 
              onClick={handleFormTeam}
              disabled={!hackathon.teamFormationActive}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
                hackathon.teamFormationActive 
                  ? 'bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/20' 
                  : 'bg-sidebar-accent/50 text-muted-foreground/20 cursor-not-allowed border border-border/10'
              }`}
            >
              <Users size={16} />
              {hackathon.teamFormationActive ? 'Synchronize Team' : 'Sector Locked'}
            </button>
            <a 
              href={hackathon.applyLink} 
              target="_blank" 
              rel="noreferrer"
              className="w-14 h-14 rounded-2xl bg-sidebar-accent/50 text-muted-foreground hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xl border border-border/10"
            >
              <ExternalLink size={20} />
            </a>
          </div>
          
          <AnimatePresence>
            {hackathon.teamFormationActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Sparkles size={12} className="text-primary" />
                  <p className="text-[9px] text-primary font-black uppercase tracking-widest leading-none">
                    Signals Domain Leads for cross-dept coordination
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
