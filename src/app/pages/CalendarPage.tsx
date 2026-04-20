import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EventCalendar } from '../components/calendar/EventCalendar';
import { EventDetailModal } from '../components/events/EventDetailModal';
import type { CalendarEvent, ClubEvent } from '../types';
import { CLUB_COLORS } from '../lib/constants';
import { Filter, X, Calendar as CalendarIcon, Sparkles, LayoutGrid, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const { clubs, events } = useData();
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [filterClub, setFilterClub] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterMode, setFilterMode] = useState('');

  const approvedClubs = clubs.filter((c) => c.status === 'approved');
  const approvedEvents = events.filter((e) => e.status === 'approved' || user?.role === 'super_admin');
  const departments = [...new Set(approvedClubs.map((c) => c.department))].sort();

  const calendarEvents = useMemo((): CalendarEvent[] => {
    return approvedEvents
      .filter((e) => {
        if (e.status !== 'approved' && user?.role !== 'super_admin') return false;
        if (filterClub && e.clubId !== filterClub) return false;
        if (filterMode && e.mode !== filterMode) return false;
        if (filterDept) {
          const club = clubs.find((c) => c.id === e.clubId);
          if (!club || club.department !== filterDept) return false;
        }
        return true;
      })
      .map((e) => {
        const club = clubs.find((c) => c.id === e.clubId);
        const color = CLUB_COLORS[e.clubId] ?? '#6366f1';
        return {
          id: e.id,
          title: e.title,
          start: `${e.date}T${e.startTime}:00`,
          end: `${e.date}T${e.endTime}:00`,
          backgroundColor: color,
          borderColor: color,
          textColor: '#ffffff',
          extendedProps: {
            clubName: club?.name ?? 'Unknown Club',
            venue: e.venue,
            mode: e.mode,
            status: e.status,
            description: e.shortDescription,
            clubId: e.clubId,
            startTime: e.startTime,
            endTime: e.endTime,
          },
        };
      });
  }, [events, clubs, filterClub, filterDept, filterMode]);

  const handleEventClick = (calEvent: CalendarEvent) => {
    const event = events.find((e) => e.id === calEvent.id);
    if (event) setSelectedEvent(event);
  };

  const clearFilters = () => {
    setFilterClub('');
    setFilterDept('');
    setFilterMode('');
  };

  const hasFilters = filterClub || filterDept || filterMode;

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
               <CalendarIcon size={20} />
             </div>
             <div>
               <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                 Temporal Dimension
               </p>
               <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
                 Event Calendar
               </h1>
             </div>
          </div>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Synchronize with the university nexus. A unified visual timeline of all 
            approved convergences, workshops, and high-fidelity deployments.
          </p>
        </div>

        {/* Global Telemetry */}
        <div className="flex items-center gap-6 p-5 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5">
           <div className="px-6 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1">Live Cycles</p>
              <p className="text-3xl font-black text-foreground tracking-tighter leading-none">{calendarEvents.length}</p>
           </div>
           <div className="w-px h-10 bg-border/10" />
           <div className="px-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <Activity size={16} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-1">Status</p>
                <p className="text-sm font-black text-foreground tracking-tight leading-none uppercase">Synchronized</p>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Control Console (Filters) */}
      <div className="p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl ring-1 ring-white/5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-sidebar-accent/50 rounded-xl text-muted-foreground/40 border border-border/5">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Filter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <select
              value={filterClub}
              onChange={(e) => setFilterClub(e.target.value)}
              className="px-6 py-3.5 rounded-2xl bg-sidebar border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold tracking-tight text-foreground transition-all shadow-inner"
            >
              <option value="">Unified Associations</option>
              {approvedClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>

            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-6 py-3.5 rounded-2xl bg-sidebar border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold tracking-tight text-foreground transition-all shadow-inner"
            >
              <option value="">Sector Breakdown</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} Sector
                </option>
              ))}
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-6 py-3.5 rounded-2xl bg-sidebar border border-border/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold tracking-tight text-foreground transition-all shadow-inner"
            >
              <option value="">Operational Mode</option>
              <option value="offline">📍 Physical (Offline)</option>
              <option value="online">🌐 Digital (Online)</option>
              <option value="hybrid">🔀 Multi-Vector (Hybrid)</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <X size={14} /> Clear Cycle
            </button>
          )}
        </div>
      </div>

      {/* Segment Legend Matrix */}
      <div className="flex flex-wrap gap-3 pb-4">
        {approvedClubs.map((club) => (
          <motion.button
            whileHover={{ y: -2 }}
            key={club.id}
            onClick={() => setFilterClub(filterClub === club.id ? '' : club.id)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 ${
              filterClub === club.id
                ? 'border-transparent shadow-xl scale-105'
                : 'border-white/5 bg-card/40 backdrop-blur-md opacity-40 hover:opacity-100'
            }`}
            style={
              filterClub === club.id
                ? { backgroundColor: CLUB_COLORS[club.id], color: 'white' }
                : {}
            }
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${filterClub === club.id ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse' : ''}`}
              style={filterClub !== club.id ? { backgroundColor: CLUB_COLORS[club.id] } : {}}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${filterClub === club.id ? 'text-white' : 'text-foreground'}`}
            >
              {club.logo} {club.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Main Temporal Workspace */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group lg:overflow-visible overflow-hidden"
      >
        {/* Background Decorative Glow */}
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10">
          <EventCalendar events={calendarEvents} onEventClick={handleEventClick} />
        </div>
      </motion.div>

      {/* Detail Deep Dive Dimension */}
      <EventDetailModal
        event={selectedEvent}
        club={clubs.find((c) => c.id === selectedEvent?.clubId)}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}