import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/events/EventCard';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { Modal } from '../components/common/Modal';
import { EventForm } from '../components/events/EventForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { ClubLogo } from '../components/clubs/ClubLogo';
import type { ClubEvent, EventFormData } from '../types';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Send,
  Calendar,
  AlertTriangle,
  Scan,
  Maximize,
  LayoutGrid,
  Zap,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  History,
  Clock,
  Archive,
  MoreVertical,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type TabFilter = 'all' | 'draft' | 'pending' | 'approved' | 'rejected';

export default function RepEventsPage() {
  const { user } = useAuth();
  const { events, clubs, addEvent, updateEvent, deleteEvent, submitForApproval } = useData();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [editEvent, setEditEvent] = useState<ClubEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [scannerEvent, setScannerEvent] = useState<ClubEvent | null>(null);
  const [tab, setTab] = useState<TabFilter>('all');

  const myClubs = clubs.filter((c) => user?.clubIds?.includes(c.id));
  const myEvents = useMemo(
    () => events.filter((e) => user?.clubIds?.includes(e.clubId)),
    [events, user]
  );

  const filtered = useMemo(() => {
    if (tab === 'all') return myEvents;
    return myEvents.filter((e) => e.status === tab);
  }, [myEvents, tab]);

  const counts = useMemo(() => ({
    all: myEvents.length,
    draft: myEvents.filter((e) => e.status === 'draft').length,
    pending: myEvents.filter((e) => e.status === 'pending').length,
    approved: myEvents.filter((e) => e.status === 'approved').length,
    rejected: myEvents.filter((e) => e.status === 'rejected').length,
  }), [myEvents]);

  const handleEdit = (updates: EventFormData) => {
    if (!editEvent || !user) return;
    updateEvent(editEvent.id, {
      title: updates.title,
      description: updates.description,
      shortDescription: updates.description.substring(0, 100) + '...',
      date: updates.date,
      startTime: updates.startTime,
      endTime: updates.endTime,
      venue: updates.venue,
      mode: updates.mode,
      registrationLink: updates.registrationLink,
      capacity: updates.capacity,
      tags: updates.tags.split(',').map((t) => t.trim()).filter(Boolean),
      coverImage: updates.coverImage,
    });
    toast.success('Local Protocol Updated', {
      description: `Updates saved as draft for "${updates.title}".`,
      icon: <Archive className="text-primary" size={16} />
    });
    setEditEvent(null);
  };

  const handleEditSubmit = (updates: EventFormData) => {
    if (!editEvent || !user) return;
    updateEvent(editEvent.id, {
      title: updates.title,
      description: updates.description,
      shortDescription: updates.description.substring(0, 100) + '...',
      date: updates.date,
      startTime: updates.startTime,
      endTime: updates.endTime,
      venue: updates.venue,
      mode: updates.mode,
      registrationLink: updates.registrationLink,
      capacity: updates.capacity,
      tags: updates.tags.split(',').map((t) => t.trim()).filter(Boolean),
      coverImage: updates.coverImage,
      status: 'pending',
    });
    toast.success('Mission Deployed', {
      description: `"${updates.title}" has been submitted for governance authorization.`,
      icon: <Send className="text-primary" size={16} />
    });
    setEditEvent(null);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDeleteConfirm(null);
    toast.error('Mission Terminated', {
      description: 'The event protocol has been permanently purged.',
      icon: <Trash2 size={16} />
    });
  };

  const handleSubmitForApproval = (id: string) => {
    submitForApproval(id);
    toast.success('Verification Initiated', {
      description: 'Event logic transmitted for executive review.',
      icon: <Send className="text-primary" size={16} />
    });
  };

  const TABS: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Unified Grid', icon: <LayoutGrid size={14} /> },
    { id: 'draft', label: 'Local Drafts', icon: <Archive size={14} /> },
    { id: 'pending', label: 'Audit Backlog', icon: <Clock size={14} /> },
    { id: 'approved', label: 'Synchronized', icon: <CheckCircle2 size={14} /> },
    { id: 'rejected', label: 'Halted Protocols', icon: <ShieldAlert size={14} /> },
  ];

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Editorial Mission Control Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
               <Zap size={20} />
             </div>
             <div>
               <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                 Representative Operations Port
               </p>
               <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">
                 My <span className="text-muted-foreground/20 italic">Confluences</span>.
               </h1>
             </div>
          </div>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
            Club mission control. Coordinate institutional events for: 
            <span className="text-primary font-black"> {myClubs.map((c) => c.name).join(', ')}</span>.
          </p>
        </div>

        <button
          onClick={() => navigate('/rep/events/new')}
          className="group flex items-center gap-4 px-8 py-5 bg-primary text-white rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-5px_rgba(37,99,235,0.4)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <PlusCircle size={20} className="relative z-10" />
          <span className="text-xs font-black uppercase tracking-widest relative z-10">Commission New Event</span>
        </button>
      </motion.div>

      {/* Operational Tunnels (Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {(['draft', 'pending', 'approved', 'rejected'] as const).map((s) => {
          const config: Record<string, { color: string, bg: string, border: string, icon: any }> = {
            draft: { color: 'text-muted-foreground', bg: 'bg-card/40', border: 'border-border/10', icon: Archive },
            pending: { color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10', icon: Clock },
            approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', icon: ShieldCheck },
            rejected: { color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10', icon: ShieldAlert },
          };
          const Icon = config[s].icon;
          return (
            <motion.div
              whileHover={{ y: -5 }}
              key={s}
              className={`p-8 rounded-[2.5rem] border ${config[s].border} ${config[s].bg} backdrop-blur-3xl cursor-pointer hover:shadow-2xl transition-all shadow-xl ring-1 ring-white/5 space-y-4 group overflow-hidden relative`}
              onClick={() => setTab(s)}
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                 <Icon size={80} />
              </div>
              <div className={`w-10 h-10 rounded-xl bg-sidebar flex items-center justify-center border border-border/10 ${config[s].color}`}>
                 <Icon size={18} />
              </div>
              <div className="space-y-1">
                <p className={`text-4xl font-black tracking-tighter leading-none ${config[s].color}`}>{counts[s]}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{s === 'draft' ? 'Local Draft' : s === 'approved' ? 'Synchronized' : s === 'pending' ? 'Audit Pending' : 'Halted'}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Operational Audit Console (Tabs) */}
      <div className="flex items-center gap-3 p-1.5 bg-card/60 rounded-[1.5rem] border border-border/10 shadow-inner overflow-x-auto no-scrollbar w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              tab === t.id
                ? 'bg-primary text-white shadow-xl px-12'
                : 'text-muted-foreground/40 hover:text-foreground hover:bg-sidebar/50'
            }`}
          >
            <div className={tab === t.id ? 'text-white' : 'text-primary/40'}>{t.icon}</div>
            {t.label}
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[9px] font-black ${tab === t.id ? 'bg-white/20' : 'bg-sidebar-accent/50'}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Execution Area */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-48 text-center bg-card/20 rounded-[4rem] border border-dashed border-border/10 space-y-8"
          >
            <div className="w-24 h-24 bg-card/40 rounded-[2.5rem] flex items-center justify-center text-muted-foreground/10 mx-auto shadow-3xl ring-1 ring-white/5">
              <Calendar size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none">Zero Operational Matches</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">No {tab === 'all' ? '' : tab} event protocols detected within the mission grid.</p>
            </div>
            <button
              onClick={() => navigate('/rep/events/new')}
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 mx-auto"
            >
              Initialize First Protocol <PlusCircle size={16} />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filtered.map((event, index) => {
              const club = clubs.find((c) => c.id === event.clubId);
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 p-8 flex flex-col lg:flex-row lg:items-center gap-8 hover:border-primary/30 transition-all shadow-3xl ring-1 ring-white/5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                     <Zap size={140} className="text-primary" />
                  </div>
                  
                  <div className="w-20 h-20 rounded-[1.5rem] bg-sidebar flex items-center justify-center shadow-inner border border-border/10 shrink-0 group-hover:scale-110 transition-transform relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                     <ClubLogo logo={club?.logo} name={club?.name || ''} size="lg" className="w-full h-full rounded-none border-none shadow-none bg-transparent" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h4 className="text-2xl font-black text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors truncate">
                        {event.title}
                      </h4>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="flex items-center gap-6 flex-wrap opacity-60">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{format(new Date(event.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Clock size={14} className="text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest leading-none">{event.startTime} – {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <MapPin size={14} className="text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest leading-none truncate max-w-[200px]">{event.venue}</span>
                      </div>
                    </div>
                    {event.rejectionReason && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 w-fit">
                        <ShieldAlert size={14} className="text-rose-500" />
                        <p className="text-rose-400 font-bold italic text-xs">Governance Halt: "{event.rejectionReason}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 relative z-10">
                    <AnimatePresence mode="popLayout">
                      {event.status === 'draft' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubmitForApproval(event.id)}
                          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
                        >
                          <Send size={15} /> Deploy Mission
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {(event.status === 'draft' || event.status === 'rejected') && (
                      <button
                        onClick={() => setEditEvent(event)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sidebar hover:bg-card transition-all border border-border/10 text-muted-foreground/40 hover:text-primary shadow-xl"
                      >
                        <Edit2 size={20} />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sidebar hover:bg-card transition-all border border-border/10 text-muted-foreground/40 hover:text-primary shadow-xl"
                    >
                      <Eye size={20} />
                    </button>

                    {(event.status === 'draft' || event.status === 'rejected') && (
                      <button
                        onClick={() => setDeleteConfirm(event.id)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 text-rose-500 shadow-xl"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}

                    {event.status === 'approved' && (
                      <>
                        <button
                          onClick={() => navigate(`/attendance?eventId=${event.id}`)}
                          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary/10 hover:bg-primary transition-all border border-primary/20 text-primary hover:text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                          title="Operations Terminal"
                        >
                          <Activity size={20} />
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/attendance?eventId=${event.id}`)}
                          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20"
                        >
                          <UserCheck size={18} /> Attendance Hub
                        </motion.button>
                      </>
                    )}

                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-muted-foreground/10 hover:text-foreground transition-all">
                       <MoreVertical size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Persistence Modal (Edit) */}
      <Modal
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        title="Protocol Recalibration"
        size="lg"
      >
        {editEvent && (
          <div className="bg-card backdrop-blur-3xl rounded-[3rem] p-4">
            <EventForm
              initialData={editEvent}
              onSaveDraft={handleEdit}
              onSubmit={handleEditSubmit}
            />
          </div>
        )}
      </Modal>

      {/* Purge Modal (Delete) */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Protocol Purge"
        size="sm"
      >
        <div className="p-10 space-y-10 text-center">
            <div className="w-24 h-24 bg-rose-500/5 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20 ring-12 ring-rose-500/5 animate-pulse">
              <ShieldAlert size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-foreground tracking-tighter">Terminate Protocol?</h3>
              <p className="text-muted-foreground font-medium leading-relaxed italic">
                This action will permanently purge the event signature from the institutional nexus. This cannot be reversed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-5 rounded-2xl bg-sidebar hover:bg-card transition-all border border-border/10 text-muted-foreground font-black uppercase text-[10px] tracking-widest"
              >
                Abort Purge
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="py-5 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/30 font-black uppercase text-[10px] tracking-widest"
              >
                Confirm Purge
              </button>
            </div>
        </div>
      </Modal>

      {/* Optical Sensor Modal (Scanner) */}
      <Modal
        open={!!scannerEvent}
        onClose={() => setScannerEvent(null)}
        title="Optical Scanner Integration"
        size="md"
      >
        {scannerEvent && (
          <div className="p-12 flex flex-col items-center justify-center space-y-10 bg-card backdrop-blur-3xl rounded-[3.5rem]">
            <div className="text-center space-y-4">
               <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none">
                 {scannerEvent.title}
               </h3>
               <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Optical Sensor Active • ID SYNC</p>
               </div>
            </div>
            
            {/* Tactical High-Fidelity Viewfinder */}
            <div className="relative w-72 h-72 rounded-[3rem] overflow-hidden border-4 border-sidebar shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-slate-950 flex items-center justify-center group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent)] opacity-40" />
               <div className="absolute inset-x-0 h-[3px] bg-emerald-500/40 shadow-[0_0_20px_4px_rgba(16,185,129,0.6)] animate-scan z-20" />
               <Maximize size={60} className="text-white/5 absolute inset-0 m-auto group-hover:scale-110 transition-transform duration-1000" />
               
               {/* Viewfinder Corners */}
               <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-emerald-500/40 rounded-tl-xl" />
               <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-emerald-500/40 rounded-tr-xl" />
               <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-emerald-500/40 rounded-bl-xl" />
               <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-emerald-500/40 rounded-br-xl" />
               
               <div className="w-56 h-56 border-2 border-dashed border-white/10 rounded-[2rem] animate-pulse" />
            </div>
            
            <p className="text-muted-foreground/20 font-mono text-[9px] uppercase tracking-[0.4em] animate-pulse">
               Awaiting encrypted token calibration...
            </p>

            <button
              onClick={() => {
                toast.success('Authentication Token Verified', {
                  description: 'Attendee credential validated and synchronized.',
                  icon: <CheckCircle2 className="text-emerald-500" size={16} />
                });
                setScannerEvent(null);
              }}
              className="w-full py-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em] shadow-xl"
            >
              Simulate Tactical Verification
            </button>
          </div>
        )}
      </Modal>

      {/* Detailed Intel Dimension */}
      <EventDetailModal
        event={selectedEvent}
        club={clubs.find((c) => c.id === selectedEvent?.clubId)}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
