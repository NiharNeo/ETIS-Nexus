import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  CalendarDays,
  BookOpen,
  Clock,
  TrendingUp,
  ArrowRight,
  BarChart2,
  Activity,
  Zap,
  Globe,
  Sparkles,
  Plus,
  Building2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { BentoGrid, BentoCard } from '../components/ui/bento-grid';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { Skeleton } from '../components/ui/skeleton';
import type { ClubEvent, ClubFormData } from '../types';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CLUB_COLORS } from '../lib/constants';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const { clubs, events, isLoading } = useData();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState<ClubFormData>({
    name: '',
    department: '',
    description: '',
    shortDescription: '',
    tags: ''
  });

  const { addClub } = useData();

  const handleAddClub = async () => {
    console.log('Initiating club creation flow...');
    if (!newClubData.name || !newClubData.department) {
      toast.error('Missing Information', { description: 'Please provide name and department.' });
      return;
    }
    
    try {
      const result = await addClub(newClubData);
      if (result) {
        toast.success('Club Created', { 
          description: `${newClubData.name} has been added successfully.`,
          icon: <CheckCircle2 className="text-emerald-500" size={16} />
        });
        setIsAddClubModalOpen(false);
        setNewClubData({ name: '', department: '', description: '', shortDescription: '', tags: '' });
      } else {
        toast.error('Creation Failed', { 
          description: 'Institutional protocol rejected the request. Please check backend connectivity.',
          icon: <Zap className="text-red-500" size={16} />
        });
      }
    } catch (err) {
      toast.error('System Fault', { 
        description: 'A critical error occurred during initialization.',
        icon: <Zap className="text-red-500" size={16} />
      });
    }
  };

  const today = new Date();
  const nextWeek = addDays(today, 7);

  const stats = useMemo(() => {
    const approvedClubs = clubs.filter((c) => c.status === 'approved');
    const approvedEvents = events.filter((e) => e.status === 'approved' || user?.role === 'super_admin');
    const upcomingEvents = approvedEvents.filter((e) => isAfter(new Date(e.date), today));
    
    return {
      totalClubs: approvedClubs.length,
      totalEvents: approvedEvents.length,
      upcomingCount: upcomingEvents.length,
      thisWeek: approvedEvents.filter(
        (e) => isAfter(new Date(e.date), today) && isBefore(new Date(e.date), nextWeek)
      ).length,
    };
  }, [clubs, events, today, nextWeek]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.status === 'approved' && isAfter(new Date(e.date), today))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [events, today]);

  const recentActivity = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [events]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      approved: events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === i && d.getFullYear() === 2026 && e.status === 'approved';
      }).length,
    }));
  }, [events]);

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-20 w-1/3 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6 auto-rows-[20rem]">
          <Skeleton className="col-span-2 rounded-3xl" />
          <Skeleton className="col-span-1 rounded-3xl" />
          <Skeleton className="col-span-1 rounded-3xl" />
          <Skeleton className="col-span-2 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10">
      {/* Black Text Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-10"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-black text-white text-[10px] font-black uppercase tracking-widest">
              System Dashboard
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter leading-none">
            {greeting()}, <span className="underline decoration-black/10">{user?.name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(' ')[0]}</span>.
          </h1>
          <p className="text-black/60 font-medium text-xl">
             There are {stats.upcomingCount} active events scheduled on campus.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-50">
          <button
            onClick={() => { console.log('Browse Events clicked'); navigate('/events'); }}
            className="px-8 py-4 rounded-2xl bg-white border-2 border-black text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
          >
            Browse Events
          </button>
          <button
            onClick={() => { console.log('Create Event clicked'); navigate('/rep/events/new'); }}
            className="px-8 py-4 rounded-2xl bg-black text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Create Event
          </button>
          
          {user?.role === 'super_admin' && (
            <button
              id="dashboard-create-club-btn"
              onClick={() => { console.log('Create Club button clicked'); setIsAddClubModalOpen(true); }}
              className="px-8 py-4 rounded-2xl bg-white border-2 border-black text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2 relative z-50"
            >
              <Building2 size={18} /> Create Club
            </button>
          )}
        </div>
      </motion.div>

      {/* Bento Grid Layout - High Contrast */}
      <BentoGrid>
        <BentoCard
          className="md:col-span-2 bg-white border border-black/5"
          title="Campus Activity"
          description="A summary of university engagement metrics."
          header={
            <div className="flex-1 p-8 flex items-center justify-around bg-zinc-50/50">
              <div className="text-center space-y-1">
                <p className="text-black/40 font-black text-[10px] uppercase tracking-widest">Total Clubs</p>
                <h3 className="text-6xl font-black text-black tracking-tighter">{stats.totalClubs}</h3>
              </div>
              <div className="w-px h-16 bg-black/10" />
              <div className="text-center space-y-1">
                <p className="text-black/40 font-black text-[10px] uppercase tracking-widest">Live Events</p>
                <h3 className="text-6xl font-black text-black tracking-tighter">{stats.totalEvents}</h3>
              </div>
              <div className="w-px h-16 bg-black/10" />
              <div className="text-center space-y-1">
                <p className="text-black/40 font-black text-[10px] uppercase tracking-widest">This Week</p>
                <h3 className="text-6xl font-black text-black tracking-tighter">{stats.thisWeek}</h3>
              </div>
            </div>
          }
          icon={<Activity size={20} className="text-black" />}
        />

        <BentoCard
          className="md:col-span-1 bg-white border border-black/5"
          title="Monthly Growth"
          description="Approved events over the last six months."
          header={
            <div className="flex-1 w-full h-full p-6 pt-10 overflow-hidden bg-zinc-50/30">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="approved" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#000000' : 'rgba(0,0,0,0.1)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
          icon={<BarChart2 size={20} className="text-black" />}
        />

        <BentoCard
          className="md:col-span-1 bg-white border border-black/5"
          title="Recent Updates"
          description="Latest system notifications."
          header={
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[300px]">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 hover:bg-black hover:text-white transition-all cursor-pointer group border border-black/5">
                  <div className="w-2 h-2 rounded-full bg-black group-hover:bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate uppercase tracking-tight">{event.title}</p>
                    <p className="text-[9px] font-bold opacity-40 group-hover:opacity-60 uppercase">{format(new Date(event.updatedAt), 'MMM d • HH:mm')}</p>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          }
          icon={<Globe size={20} className="text-black" />}
        />

        <BentoCard
          className="md:col-span-2 bg-white border border-black/5"
          title="Major Events"
          description="High-priority events coming up in the university."
          header={
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-zinc-50/20">
              {upcomingEvents.map((event) => {
                const club = clubs.find(c => c.id === event.clubId);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-6 rounded-[2rem] bg-white border border-black/5 hover:border-black transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm">
                        {club?.logo || '🏛'}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{club?.name}</span>
                    </div>
                    <h4 className="text-lg font-black tracking-tight text-black mb-2 leading-none">{event.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-black font-black uppercase tracking-widest opacity-30">
                      <CalendarDays size={12} />
                      {format(new Date(event.date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          }
          icon={<Sparkles size={20} className="text-black" />}
        />
      </BentoGrid>

      <EventDetailModal
        event={selectedEvent}
        club={clubs.find((c) => c.id === selectedEvent?.clubId)}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Modal
        open={isAddClubModalOpen}
        onClose={() => setIsAddClubModalOpen(false)}
        title="Add New Institutional Club"
      >
        <div className="p-10 space-y-8 bg-white rounded-[3rem]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Club Name</label>
              <input
                type="text"
                placeholder="e.g. Robotics Hub"
                className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
                value={newClubData.name}
                onChange={(e) => setNewClubData({...newClubData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Department</label>
              <input
                type="text"
                placeholder="e.g. Technology"
                className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
                value={newClubData.department}
                onChange={(e) => setNewClubData({...newClubData, department: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Short Description</label>
            <input
              type="text"
              placeholder="One line about the club..."
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
              value={newClubData.shortDescription}
              onChange={(e) => setNewClubData({...newClubData, shortDescription: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Full Description</label>
            <textarea
              rows={4}
              placeholder="Detail the club's mission and activities..."
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-medium"
              value={newClubData.description}
              onChange={(e) => setNewClubData({...newClubData, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="tech, innovation, ai..."
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-black/5 focus:outline-none focus:ring-4 focus:ring-black/5 text-black font-bold"
              value={newClubData.tags}
              onChange={(e) => setNewClubData({...newClubData, tags: e.target.value})}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setIsAddClubModalOpen(false)}
              className="flex-1 py-5 rounded-2xl bg-zinc-100 text-black/60 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all border border-black/5"
            >
              Cancel
            </button>
            <button
              onClick={handleAddClub}
              className="flex-1 py-5 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/20"
            >
              Confirm Creation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
