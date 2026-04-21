import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Building2,
  Settings2,
  Palette,
  Eye,
  EyeOff,
  Zap,
  Activity,
  BarChart2,
  ArrowRight,
  Globe,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ClubLogo } from '../components/clubs/ClubLogo';
import { ImageUploader } from '../components/common/ImageUploader';
import { uploadFile } from '../lib/supabase';
import { BentoGrid, BentoCard } from '../components/ui/bento-grid';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { Skeleton } from '../components/ui/skeleton';
import { useAesthetics, AestheticTheme } from '../context/ThemeContext';
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
  const { theme, setTheme, widgets, setWidgetVisibility } = useAesthetics();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [isAestheticsModalOpen, setIsAestheticsModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState<ClubFormData>({
    name: '',
    department: '',
    description: '',
    shortDescription: '',
    tags: '',
    logo: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { addClub } = useData();

  const handleAddClub = async () => {
    console.log('Initiating club creation flow...');

    if (!newClubData.name || !newClubData.department || !logoFile) {
      toast.error('Missing Information', { description: 'Please provide name, department, and logo.' });
      return;
    }
    
    try {
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await uploadFile('logos', `clubs/logo-${Date.now()}-${logoFile.name}`, logoFile);
      }
      
      const result = await addClub({ ...newClubData, logo: logoUrl });
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
      <div className="p-8 space-y-8 bg-background">
        <Skeleton className="h-20 w-1/3 rounded-none" />
        <div className="grid grid-cols-3 gap-6 auto-rows-[20rem]">
          <Skeleton className="col-span-2 rounded-none" />
          <Skeleton className="col-span-1 rounded-none" />
          <Skeleton className="col-span-1 rounded-none" />
          <Skeleton className="col-span-2 rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 bg-background min-h-screen">
      {/* Editorial Header Dimension */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-foreground text-card text-[10px] font-bold uppercase tracking-[0.2em] rounded-none">
              System Dashboard
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-normal text-foreground tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {greeting()}, <span className="underline decoration-border">{user?.name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(' ')[0]}</span>.
          </h1>
          <p className="text-foreground/70 font-medium text-xl" style={{ fontFamily: 'var(--font-sans)' }}>
             There are {stats.upcomingCount} active events scheduled on campus.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-50">
          <button
            onClick={() => setIsAestheticsModalOpen(true)}
            className="px-6 py-4 bg-muted text-foreground/70 hover:text-foreground border border-border hover:bg-surface_container transition-all flex items-center gap-2 group rounded-none"
            title="Recalibrate Interface"
          >
            <Settings2 size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-[0.2em]">Recalibrate</span>
          </button>

          <button
            onClick={() => { console.log('Browse Events clicked'); navigate('/events'); }}
            className="px-8 py-4 bg-transparent border-2 border-foreground text-foreground font-bold uppercase text-xs tracking-[0.2em] hover:bg-muted transition-all shadow-none rounded-none"
          >
            Browse Events
          </button>
          {(user?.role === 'super_admin' || user?.role === 'club_rep') && (
            <button
              onClick={() => { console.log('Create Event clicked'); navigate('/rep/events/new'); }}
              className="px-8 py-4 bg-primary text-white border border-primary font-bold uppercase text-xs tracking-[0.2em] shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 rounded-none"
            >
              <Plus size={18} /> Create Event
            </button>
          )}
          
          {user?.role === 'super_admin' && (
            <button
              id="dashboard-create-club-btn"
              onClick={() => { console.log('Create Club button clicked'); setIsAddClubModalOpen(true); }}
              className="px-8 py-4 bg-transparent border border-foreground text-foreground font-bold uppercase text-xs tracking-[0.2em] hover:bg-muted transition-all flex items-center gap-2 relative z-50 rounded-none"
            >
              <Building2 size={18} /> Create Club
            </button>
          )}
        </div>
      </motion.div>

      {/* Bento Grid Layout - High Contrast */}
      <BentoGrid className="rounded-none">
        {widgets.activity && (
          <BentoCard
            className="md:col-span-2 bg-card border border-border rounded-none shadow-none"
            title="Campus Activity"
            description="A summary of university engagement metrics."
            header={
              <div className="flex-1 p-8 flex items-center justify-around bg-muted border-b border-border">
                <div className="text-center space-y-1">
                  <p className="text-foreground/50 font-bold text-[10px] uppercase tracking-[0.2em]">Total Clubs</p>
                  <h3 className="text-6xl font-normal text-foreground tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{stats.totalClubs}</h3>
                </div>
                <div className="w-px h-16 bg-border" />
                <div className="text-center space-y-1">
                  <p className="text-foreground/50 font-bold text-[10px] uppercase tracking-[0.2em]">Live Events</p>
                  <h3 className="text-6xl font-normal text-foreground tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{stats.totalEvents}</h3>
                </div>
                <div className="w-px h-16 bg-border" />
                <div className="text-center space-y-1">
                  <p className="text-foreground/50 font-bold text-[10px] uppercase tracking-[0.2em]">This Week</p>
                  <h3 className="text-6xl font-normal text-foreground tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{stats.thisWeek}</h3>
                </div>
              </div>
            }
            icon={<Activity size={20} className="text-foreground" />}
          />
        )}

        {widgets.growth && (
          <BentoCard
            className="md:col-span-1 bg-card border border-border rounded-none shadow-none"
            title="Monthly Growth"
            description="Approved events over the last six months."
            header={
              <div className="flex-1 w-full h-full p-6 pt-10 overflow-hidden bg-muted border-b border-border">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Bar dataKey="approved" radius={[0, 0, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--primary)' : 'var(--border)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
            icon={<BarChart2 size={20} className="text-foreground" />}
          />
        )}

        {widgets.updates && (
          <BentoCard
            className="md:col-span-1 bg-card border border-border rounded-none shadow-none"
            title="Recent Updates"
            description="Latest system notifications."
            header={
              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[300px] border-b border-border">
                {recentActivity.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-4 bg-muted hover:bg-primary hover:text-white transition-all cursor-pointer group border border-border rounded-none">
                    <div className="w-2 h-2 bg-foreground group-hover:bg-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate uppercase tracking-tight" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>{event.title}</p>
                      <p className="text-[9px] font-bold opacity-50 group-hover:opacity-80 uppercase">{format(new Date(event.updatedAt), 'MMM d • HH:mm')}</p>
                    </div>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            }
            icon={<Globe size={20} className="text-foreground" />}
          />
        )}

        {widgets.events && (
          <BentoCard
            className="md:col-span-2 bg-card border border-border rounded-none shadow-none"
            title="Major Events"
            description="High-priority events coming up in the university."
            header={
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-muted border-b border-border">
                {upcomingEvents.map((event) => {
                  const club = clubs.find(c => c.id === event.clubId);
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-6 bg-card border border-border hover:border-primary transition-all cursor-pointer group shadow-none rounded-none"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <ClubLogo logo={club?.logo} name={club?.name || ''} size="sm" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">{club?.name}</span>
                      </div>
                      <h4 className="text-xl font-normal tracking-tight text-foreground mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>{event.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-foreground font-bold uppercase tracking-[0.2em] opacity-40">
                        <CalendarDays size={12} />
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  );
                })}
              </div>
            }
            icon={<Sparkles size={20} className="text-foreground" />}
          />
        )}
      </BentoGrid>

      <EventDetailModal
        event={selectedEvent}
        club={clubs.find((c) => c.id === selectedEvent?.clubId)}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Modal
        open={isAestheticsModalOpen}
        onClose={() => setIsAestheticsModalOpen(false)}
        title="Recalibrate Interface [Aesthetics]"
      >
        <div className="p-8 space-y-8 bg-white rounded-[3rem]">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2 flex items-center gap-2">
              <Palette size={14} /> Aesthetic Presets
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'default', name: 'Nexus Standard', color: 'bg-slate-100', text: 'text-slate-900' },
                { id: 'midnight', name: 'Midnight Protocol', color: 'bg-slate-950', text: 'text-sky-400' },
                { id: 'cyberpunk', name: 'Cyberpunk Core', color: 'bg-zinc-900', text: 'text-pink-500' },
                { id: 'emerald', name: 'Emerald Sector', color: 'bg-emerald-950', text: 'text-emerald-400' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as AestheticTheme)}
                  className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                    theme === t.id ? 'border-primary' : 'border-black/5 hover:border-black/10'
                  } ${t.color}`}
                >
                  <div className={`font-black text-xs uppercase tracking-tighter ${t.text}`}>{t.name}</div>
                  {theme === t.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                  <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap size={40} className={t.text} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-black/5 pt-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2 flex items-center gap-2">
              <Eye size={14} /> Operational Widgets
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'activity', name: 'Campus Activity Stats', icon: <Activity size={16} /> },
                { id: 'growth', name: 'Monthly Growth Chart', icon: <BarChart2 size={16} /> },
                { id: 'updates', name: 'Recent System Updates', icon: <Globe size={16} /> },
                { id: 'events', name: 'Major Campus Events', icon: <Sparkles size={16} /> },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWidgetVisibility(w.id as any, !widgets[w.id as keyof typeof widgets])}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-black/40">{w.icon}</div>
                    <span className="text-xs font-bold text-black uppercase tracking-tight">{w.name}</span>
                  </div>
                  {widgets[w.id as keyof typeof widgets] ? (
                    <Eye size={16} className="text-primary" />
                  ) : (
                    <EyeOff size={16} className="text-black/20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsAestheticsModalOpen(false)}
            className="w-full py-5 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/20"
          >
            Apply Configurations
          </button>
        </div>
      </Modal>

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
          <div className="space-y-4">
            <ImageUploader 
              label="Institutional Logo (Required)"
              aspectRatio="square"
              onImageSelected={() => {}} 
              onFileSelected={(file) => setLogoFile(file)}
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
