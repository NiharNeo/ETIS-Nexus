import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/events/EventCard';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { Skeleton } from '../components/ui/skeleton';
import type { ClubEvent, EventMode } from '../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  Sparkles, 
  Orbit, 
  Zap, 
  Activity, 
  MapPin, 
  TrendingUp,
  LayoutGrid,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

export default function EventsPage() {
  const { events, clubs, isLoading } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [filterClub, setFilterClub] = useState('');
  const [filterMode, setFilterMode] = useState<EventMode | ''>('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);

  const approvedClubs = clubs.filter((c) => c.status === 'approved');
  const departments = [...new Set(approvedClubs.map((c) => c.department))].sort();

  const baseEvents = useMemo(() => {
    if (user?.role === 'super_admin') return events;
    if (user?.role === 'club_rep') {
      return events.filter(
        (e) => e.status === 'approved' || user.clubIds?.includes(e.clubId)
      );
    }
    return events.filter((e) => e.status === 'approved');
  }, [events, user]);

  const filtered = useMemo(() => {
    return baseEvents.filter((e) => {
      if (search) {
        const s = search.toLowerCase();
        const club = clubs.find((c) => c.id === e.clubId);
        if (
          !e.title.toLowerCase().includes(s) &&
          !e.description.toLowerCase().includes(s) &&
          !e.tags.some((t) => t.toLowerCase().includes(s)) &&
          !(club?.name.toLowerCase().includes(s))
        )
          return false;
      }
      if (filterClub && e.clubId !== filterClub) return false;
      if (filterMode && e.mode !== filterMode) return false;
      if (filterDept) {
        const club = clubs.find((c) => c.id === e.clubId);
        if (!club || club.department !== filterDept) return false;
      }
      return true;
    });
  }, [baseEvents, search, filterClub, filterMode, filterDept, clubs]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filtered]);

  const clearFilters = () => {
    setSearch('');
    setFilterClub('');
    setFilterMode('');
    setFilterDept('');
  };

  const hasFilters = search || filterClub || filterMode || filterDept;

  return (
    <div className="p-8 lg:p-12 max-w-[1700px] mx-auto space-y-16">
      {/* Editorial Temporal Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
      >
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
               <Orbit size={24} />
             </div>
             <div>
               <p className="text-primary font-black uppercase tracking-[0.4em]" style={{ fontSize: '10px' }}>
                 Universal Temporal Dimension
               </p>
               <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-none">
                 Event <span className="text-muted-foreground/20 italic">Horizon</span>.
               </h1>
             </div>
          </div>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
            Monitor approaching campus milestones. Direct access to all institutional signals, 
            high-fidelity hackathons, and global cultural convergences.
          </p>
        </div>
        
        {/* Real-time Temporal Telemetry */}
        <div className="flex items-center gap-8 p-8 rounded-[3rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
              <Calendar size={100} className="text-primary" />
           </div>
           
           <div className="px-6 text-center border-r border-border/10">
             <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-1.5">Total Signals</p>
             <div className="flex items-center justify-center gap-2">
                <span className="text-primary font-black text-4xl tracking-tighter leading-none">{sorted.length}</span>
                <TrendingUp size={16} className="text-emerald-500 mb-1" />
             </div>
           </div>
           <div className="px-6 text-center">
             <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-1.5">Virtual Sync</p>
             <div className="flex items-center justify-center gap-2">
                <span className="text-foreground font-black text-4xl tracking-tighter leading-none">
                   {sorted.filter(e => e.mode === 'online').length}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)] mb-1" />
             </div>
           </div>
           <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:bg-primary/90 transition-all relative overflow-hidden group/btn"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <Zap size={24} className="text-white relative z-10" />
           </motion.button>
        </div>
      </motion.div>

      {/* Temporal Control Console (Search & Filter Dynamics) */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between p-6 rounded-[3.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl ring-1 ring-white/5">
        <div className="relative w-full lg:w-[40%] group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center">
            <Search size={22} className="absolute left-8 text-muted-foreground/20 group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="text"
              placeholder="Synchronize with signal signatures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-20 pr-10 py-6 rounded-[2.5rem] bg-sidebar border border-border/10 text-lg font-bold tracking-tight text-foreground placeholder-muted-foreground/10 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
           <div className="flex items-center gap-3 p-1.5 bg-sidebar rounded-[1.8rem] border border-border/5 shadow-inner">
             <select
               value={filterClub}
               onChange={(e) => setFilterClub(e.target.value)}
               className="bg-transparent px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:text-foreground transition-colors outline-none cursor-pointer"
             >
               <option value="">Unified Alliances</option>
               {approvedClubs.map((c) => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
             <div className="w-px h-6 bg-border/10" />
             <select
               value={filterMode}
               onChange={(e) => setFilterMode(e.target.value as EventMode | '')}
               className="bg-transparent px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:text-foreground transition-colors outline-none cursor-pointer"
             >
               <option value="">Status/Mode</option>
               <option value="offline">Physical Persistence</option>
               <option value="online">Virtual Dimension</option>
               <option value="hybrid">Trans-Hybrid</option>
             </select>
           </div>

           {hasFilters && (
             <motion.button
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={clearFilters}
               className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl group"
             >
               <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
             </motion.button>
           )}
        </div>
      </div>

      {/* Main Signal Matrix (Grid Gallery) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} className="space-y-6 p-2">
                <Skeleton className="h-64 rounded-[3rem] bg-card/40" />
                <div className="space-y-3 px-4">
                  <Skeleton className="h-8 w-2/3 rounded-xl bg-card/40" />
                  <Skeleton className="h-20 w-full rounded-2xl bg-card/20" />
                </div>
              </motion.div>
            ))
          ) : sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full py-48 text-center space-y-8"
            >
              <div className="w-28 h-28 bg-card/40 rounded-[3rem] border border-dashed border-border/20 flex items-center justify-center mx-auto shadow-3xl ring-1 ring-white/5">
                <Clock size={48} className="text-muted-foreground/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black tracking-tighter text-foreground leading-none">Zero Convergence</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium text-lg italic opacity-60">
                  No active signal detected within the current coordinate matrix.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="px-10 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                Reset Temporal Sensors
              </button>
            </motion.div>
          ) : (
            sorted.map((event, index) => {
              const club = clubs.find((c) => c.id === event.clubId);
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard
                    event={event}
                    club={club}
                    showStatus={user?.role === 'super_admin' || user?.role === 'club_rep'}
                    onClick={() => setSelectedEvent(event)}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Global Intel Insight Dimension */}
      <EventDetailModal
        event={selectedEvent}
        club={clubs.find((c) => c.id === selectedEvent?.clubId)}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
