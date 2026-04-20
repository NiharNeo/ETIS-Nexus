import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, ModeBadge } from '../components/common/StatusBadge';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { Modal } from '../components/common/Modal';
import type { ClubEvent } from '../types';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Calendar,
  Filter,
  Activity,
  Plus,
  Trash2,
  Clock,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Archive,
  MoreVertical,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type TabFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'draft';

export default function AdminEventsPage() {
  const { user } = useAuth();
  const { events, clubs, approveEvent, rejectEvent, deleteEvent, addEvent } = useData();
  const [tab, setTab] = useState<TabFilter>('pending');
  const [search, setSearch] = useState('');
  const [filterClub, setFilterClub] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: '09:00',
    endTime: '11:00',
    venue: '',
    mode: 'in-person' as 'in-person', // Default to in-person for simplicity
    clubId: '',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    tags: ''
  });

  const handleCreateEvent = async () => {
    if (!newEventData.title || !newEventData.clubId) {
      toast.error('Missing Information', { description: 'Please provide title and club.' });
      return;
    }
    
    // cast to any to stop the tags string/array fight for now, but ensure data is structured
    const submissionData: any = {
      ...newEventData,
      status: 'pending',
      createdBy: 'u1',
      tags: newEventData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (!user) return;
    const result = await addEvent(submissionData);
    if (result) {
      toast.success('Event Created', { description: `${newEventData.title} has been added.` });
      setIsAddModalOpen(false);
      setNewEventData({
        title: '',
        shortDescription: '',
        description: '',
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: '09:00',
        endTime: '11:00',
        venue: '',
        mode: 'in-person',
        clubId: '',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        tags: ''
      });
    }
  };
  const [rejectModal, setRejectModal] = useState<ClubEvent | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approvedClubs = useMemo(() => clubs.filter((c) => c.status === 'approved'), [clubs]);

  const counts = useMemo(() => ({
    all: events.length,
    pending: events.filter((e) => e.status === 'pending').length,
    approved: events.filter((e) => e.status === 'approved').length,
    rejected: events.filter((e) => e.status === 'rejected').length,
    draft: events.filter((e) => e.status === 'draft').length,
  }), [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (tab !== 'all' && e.status !== tab) return false;
      if (filterClub && e.clubId !== filterClub) return false;
      if (search) {
        const s = search.toLowerCase();
        const club = clubs.find((c) => c.id === e.clubId);
        return (
          e.title.toLowerCase().includes(s) ||
          (club?.name.toLowerCase().includes(s) ?? false)
        );
      }
      return true;
    });
  }, [events, tab, filterClub, search, clubs]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [filtered]);

  const handleApprove = async (event: ClubEvent) => {
    await approveEvent(event.id);
    toast.success('Event Approved', {
      description: `"${event.title}" is now live.`,
      icon: <CheckCircle2 className="text-emerald-500" size={16} />
    });
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    await rejectEvent(rejectModal.id, rejectReason);
    toast.error('Event Rejected', {
      description: `"${rejectModal.title}" has been rejected.`,
      icon: <XCircle className="text-rose-500" size={16} />
    });
    setRejectModal(null);
    setRejectReason('');
  };

  const handleDelete = async (event: ClubEvent) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      await deleteEvent(event.id);
      toast.success('Event Deleted', { description: `"${event.title}" has been removed.` });
    }
  };

  const TABS: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'pending', label: 'Pending Approval', icon: <Clock size={14} /> },
    { id: 'approved', label: 'Approved', icon: <CheckCircle2 size={14} /> },
    { id: 'rejected', label: 'Rejected', icon: <XCircle size={14} /> },
    { id: 'draft', label: 'Drafts', icon: <Archive size={14} /> },
    { id: 'all', label: 'All Events', icon: <LayoutGrid size={14} /> },
  ];

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Simple Black Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-black/10 pb-10"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-xl">
               <Calendar size={24} />
             </div>
             <h1 className="text-5xl font-black tracking-tighter text-black leading-none">
               Event Approvals
             </h1>
          </div>
          <p className="text-black/60 font-medium text-lg max-w-2xl leading-relaxed">
            Review and approve event submissions from various university clubs.
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all shadow-2xl hover:scale-105"
          >
            <Plus size={20} /> Add New Event
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'pending' as TabFilter, label: 'Pending', count: counts.pending, color: 'text-amber-600' },
              { id: 'approved' as TabFilter, label: 'Live', count: counts.approved, color: 'text-emerald-600' },
              { id: 'rejected' as TabFilter, label: 'Rejected', count: counts.rejected, color: 'text-rose-600' },
              { id: 'all' as TabFilter, label: 'Total', count: counts.all, color: 'text-black' },
            ].map((item) => (
              <div 
                key={item.label}
                onClick={() => setTab(item.id)}
                className={`px-6 py-4 rounded-2xl bg-white border flex flex-col items-center cursor-pointer transition-all shadow-sm ${tab === item.id ? 'border-black' : 'border-black/5 hover:border-black/20'}`}
              >
                <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
                <span className="text-[9px] font-black uppercase text-black/40">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-6 bg-white rounded-[2.5rem] border border-black/5 shadow-sm">
        <div className="flex items-center gap-2 p-1.5 bg-zinc-50 rounded-2xl border border-black/5 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t.id
                  ? 'bg-black text-white shadow-xl'
                  : 'text-black/40 hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search event title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-4 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-xs font-black text-black placeholder-black/10 transition-all shadow-inner"
            />
          </div>
          <select
            value={filterClub}
            onChange={(e) => setFilterClub(e.target.value)}
            className="px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none text-[10px] font-black uppercase tracking-widest text-black"
          >
            <option value="">All Clubs</option>
            {approvedClubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table - High Contrast Black */}
      <div className="bg-white rounded-[3.5rem] border border-black/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b-2 border-black/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-black/60">Event Information</th>
                <th className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-black/60 hidden md:table-cell">Hosting Club</th>
                <th className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-black/60 hidden lg:table-cell">Date & Venue</th>
                <th className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-black/60">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-black/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              <AnimatePresence mode="popLayout">
                {sorted.map((event) => {
                  const club = clubs.find((c) => c.id === event.clubId);
                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={event.id} 
                      className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) {
                           setSelectedEvent(event);
                        }
                      }}
                    >
                      <td className="px-10 py-8 max-w-sm">
                        <div className="space-y-1">
                           <p className="text-xl font-black text-black tracking-tighter leading-none group-hover:underline">
                             {event.title}
                           </p>
                           <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                             {event.shortDescription}
                           </p>
                        </div>
                      </td>
                      <td className="px-5 py-8 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xl border border-black/5 shadow-inner">
                             {club?.logo}
                          </div>
                          <p className="text-sm font-black text-black">
                            {club?.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-8 hidden lg:table-cell">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-black/60 font-bold text-xs uppercase tracking-tighter">
                              <Calendar size={12} />
                              {format(new Date(event.date), 'MMM d, yyyy')}
                           </div>
                           <div className="flex items-center gap-2 text-black/30 font-bold text-[10px] uppercase tracking-tighter">
                              <MapPin size={12} />
                              {event.venue}
                           </div>
                        </div>
                      </td>
                      <td className="px-5 py-8">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 text-black/40 hover:bg-black hover:text-white transition-all border border-black/5"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {(event.status === 'pending' || event.status === 'rejected') && (
                            <button
                              onClick={() => handleApprove(event)}
                              className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                            >
                              Approve
                            </button>
                          )}
                          
                          {event.status === 'pending' && (
                            <button
                              onClick={() => setRejectModal(event)}
                              className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                            >
                              Reject
                            </button>
                          )}

                          <button 
                            onClick={() => handleDelete(event)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500/30 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                            title="Delete"
                          >
                             <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {sorted.length === 0 && (
            <div className="py-48 text-center bg-zinc-50/20">
              <Archive className="mx-auto text-black/5 mb-6" size={60} />
              <h3 className="text-2xl font-black text-black tracking-tighter">No events found</h3>
              <p className="text-black/40 font-medium">No results matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create University Event"
      >
        <div className="p-10 space-y-8 bg-white rounded-[3rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Event Title</label>
              <input
                type="text"
                placeholder="e.g. Annual Tech Symposium"
                className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
                value={newEventData.title}
                onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Hosting Club</label>
              <select
                className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
                value={newEventData.clubId}
                onChange={(e) => setNewEventData({...newEventData, clubId: e.target.value})}
              >
                <option value="">Select a Club</option>
                {approvedClubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
                value={newEventData.date}
                onChange={(e) => setNewEventData({...newEventData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Venue</label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium"
                className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
                value={newEventData.venue}
                onChange={(e) => setNewEventData({...newEventData, venue: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Short Description</label>
             <input
               type="text"
               placeholder="One line about the event..."
               className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
               value={newEventData.shortDescription}
               onChange={(e) => setNewEventData({...newEventData, shortDescription: e.target.value})}
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Full Description</label>
             <textarea
               rows={4}
               placeholder="Detail the event's goals and speaker/agenda details..."
               className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-medium"
               value={newEventData.description}
               onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
             />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-5 rounded-2xl bg-zinc-100 text-black/60 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all border border-black/5"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateEvent}
              className="flex-1 py-5 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl"
            >
              Confirm Creation
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectReason(''); }}
        title="Reject Event Submission"
      >
        <div className="p-10 space-y-8 bg-white rounded-[3rem]">
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-500/20">
             <p className="text-black font-bold">Rejecting: {rejectModal?.title}</p>
             <p className="text-black/40 text-[10px] uppercase font-black tracking-widest">Submitted by {clubs.find(c => c.id === rejectModal?.clubId)?.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Reason for rejection</label>
            <textarea
              rows={5}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this event submission was rejected..."
              className="w-full px-8 py-6 rounded-3xl border border-black/10 bg-zinc-50 text-black placeholder-black/10 focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setRejectModal(null); setRejectReason(''); }}
              className="py-5 rounded-2xl bg-zinc-100 text-black/60 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all border border-black/5"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="py-5 rounded-2xl bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-xl disabled:opacity-20"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      <EventDetailModal
        event={selectedEvent}
        club={clubs.find((c) => c.id === selectedEvent?.clubId)}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
