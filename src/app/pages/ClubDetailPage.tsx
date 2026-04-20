import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Users,
  Calendar,
  Globe,
  Instagram,
  Linkedin,
  ExternalLink,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Zap,
  Activity,
  Settings as SettingsIcon,
} from 'lucide-react';
import { EventCard } from '../components/events/EventCard';
import { EventDetailModal } from '../components/events/EventDetailModal';
import type { ClubEvent, Club } from '../types';
import { format } from 'date-fns';
import { CLUB_COLORS } from '../lib/constants';
import { StatusBadge } from '../components/common/StatusBadge';
import { ClubLogo } from '../components/clubs/ClubLogo';
import { ManageMembersModal } from '../components/clubs/ManageMembersModal';
import { Modal } from '../components/common/Modal';
import { ClubForm } from '../components/clubs/ClubForm';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import type { ClubFormData } from '../types';

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    clubs, 
    events, 
    updateClub, 
    getUsers 
  } = useData();
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'about'>('events');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const club = clubs.find((c) => c.id === id);


  const handleUpdate = async (data: ClubFormData) => {
    if (!club || !user) return;
    setIsSubmitting(true);
    try {
      // Process tags back to array
      const tagsArray = typeof data.tags === 'string' 
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
        : data.tags;

      await updateClub(club.id, { ...data, tags: tagsArray });
      toast.success('Institutional Recall Complete', {
        description: `${club.name} profile has been recalibrated.`,
        icon: <Zap className="text-primary" size={16} />
      });
      setIsEditing(false);
    } catch (err) {
      toast.error('Sync Failure', {
        description: 'Failed to update club telemetry.',
        icon: <Zap className="text-rose-500" size={16} />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!club) {
    return (
      <div className="p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-card/40 rounded-3xl flex items-center justify-center mx-auto border border-border/10">
          <LayoutGrid className="text-muted-foreground/20" size={40} />
        </div>
        <p className="text-muted-foreground font-medium text-lg italic">Protocol not found. The entity may have been decommissioned.</p>
        <button
          onClick={() => navigate('/clubs')}
          className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          Return to Nexus
        </button>
      </div>
    );
  }

  const clubColor = CLUB_COLORS[club.id] ?? '#6366f1';
  const clubEvents = events.filter((e: ClubEvent) => {
    if (e.clubId !== club.id) return false;
    if (user?.role === 'super_admin') return true;
    if (user?.role === 'club_rep' && user.clubIds?.includes(club.id)) return true;
    return e.status === 'approved';
  });
  const [reps, setReps] = useState<any[]>([]);

  useEffect(() => {
    if (club?.repIds?.length) {
      getUsers().then(allUsers => {
        const clubReps = allUsers.filter(u => club.repIds.includes(u.id));
        setReps(clubReps);
      });
    }
  }, [club?.repIds, getUsers]);

  const tabs = [
    { id: 'events', label: `Convergent Events (${clubEvents.length})`, icon: <Zap size={14} /> },
    { id: 'about', label: 'Institutional Profile', icon: <Users size={14} /> },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12">
      {/* Editorial Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3.5rem] bg-sidebar border border-border/10 shadow-3xl ring-1 ring-white/5"
      >
        {/* Cover Canvas */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {club.coverImage ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              src={club.coverImage}
              alt={club.name}
              className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center opacity-40"
              style={{ background: `radial-gradient(circle at center, ${clubColor}30, transparent)` }}
            >
              <ClubLogo logo={club.logo} name={club.name} size="xl" className="grayscale opacity-10 border-none bg-transparent shadow-none" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/40 to-transparent" />

          {/* Navigation Matrix */}
          <div className="absolute top-8 left-8 flex items-center gap-4 z-20">
            <button
              onClick={() => navigate('/clubs')}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/80 backdrop-blur-2xl border border-white/5 text-foreground hover:bg-primary hover:text-white transition-all shadow-2xl"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Nexus</span>
            </button>
            {user?.role === 'super_admin' && (
              <div className="scale-110 drop-shadow-2xl">
                <StatusBadge status={club.status} />
              </div>
            )}
            
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-card/80 backdrop-blur-2xl border border-white/5 text-foreground hover:bg-primary hover:text-white transition-all shadow-xl"
            >
              <Users size={14} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                {user?.role === 'super_admin' || (user?.role === 'club_rep' && user.clubIds?.includes(club.id)) 
                  ? 'Manage Roster' 
                  : 'View Roster'}
              </span>
            </button>

            {(user?.role === 'super_admin' || (user?.role === 'club_rep' && user.clubIds?.includes(club.id))) && (
              <button
                onClick={() => setIsEditing(true)}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white border border-primary/20 hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                <SettingsIcon size={14} className="group-hover:rotate-90 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Brand Integration Layer */}
        <div className="px-10 pb-12 -mt-20 relative z-10 flex flex-col md:flex-row items-end gap-10">
          <ClubLogo 
            logo={club.logo} 
            name={club.name} 
            size="xl" 
            className="w-40 h-40 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border-4 border-sidebar flex-shrink-0 relative overflow-hidden" 
          />

          <div className="flex-1 pb-2 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">
                  {club.name}
                </h1>
                <Sparkles size={24} className="text-primary opacity-40 animate-pulse" />
              </div>
              <p className="text-xl font-bold italic opacity-60" style={{ color: clubColor }}>
                {club.department} Intelligence Sector
              </p>
            </div>

            {/* Operational Telemetry */}
            <div className="flex flex-wrap items-center gap-8 py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-accent/50 flex items-center justify-center text-muted-foreground/40 border border-border/10">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-1">Census</p>
                  <p className="text-lg font-black tracking-tighter text-foreground leading-none">
                    {club.memberCount} Members
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-border/10" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-accent/50 flex items-center justify-center text-muted-foreground/40 border border-border/10">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-1">Throughput</p>
                  <p className="text-lg font-black tracking-tighter text-foreground leading-none">
                    {clubEvents.length} Events
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-border/10" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-accent/50 flex items-center justify-center text-muted-foreground/40 border border-border/10">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-1">Commissioned</p>
                  <p className="text-lg font-black tracking-tighter text-foreground leading-none">
                    {format(new Date(club.createdAt), 'MMM yyyy')}
                  </p>
                </div>
              </div>

              {/* Tag Matrix */}
              <div className="flex flex-wrap gap-2 ml-auto">
                {club.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${clubColor}10`,
                      borderColor: `${clubColor}20`,
                      color: clubColor,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary Dimension Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Hub Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Tab Control Console */}
          <div className="flex gap-2 p-1.5 bg-card/40 backdrop-blur-3xl rounded-[2rem] w-fit border border-border/10 shadow-xl ring-1 ring-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'events' | 'about')}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-105'
                    : 'text-muted-foreground/40 hover:text-foreground'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'events' ? (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {clubEvents.length === 0 ? (
                  <div className="py-32 text-center bg-card/20 rounded-[4rem] border border-dashed border-border/10 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-card/40 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/5">
                      <BookOpen size={32} className="text-muted-foreground/10" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground tracking-tighter">Negative Signal</h3>
                    <p className="text-muted-foreground text-sm font-medium mt-2 max-w-xs">
                      No convergent events currently scheduled in the nexus. Check back later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {clubEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <EventCard
                          event={event}
                          club={club}
                          showStatus={user?.role !== 'student'}
                          onClick={() => setSelectedEvent(event)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="about"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card/40 backdrop-blur-3xl rounded-[3.5rem] border border-border/10 p-12 shadow-2xl ring-1 ring-white/5 space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                  <Users size={160} />
                </div>
                <div className="max-w-3xl relative z-10 space-y-6">
                  <h3 className="text-4xl font-black text-foreground tracking-tighter leading-tight">
                    Institutional <span className="text-primary italic">Statement</span>.
                  </h3>
                  <p className="text-muted-foreground text-xl font-medium leading-relaxed">
                    {club.description}
                  </p>

                  {club.rejectionReason && user?.role === 'super_admin' && (
                    <div className="mt-8 p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem]">
                      <div className="flex items-center gap-2 mb-4 text-rose-500">
                        <AlertCircle size={18} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Rejection Feed</p>
                      </div>
                      <p className="text-rose-400 font-bold italic leading-relaxed">
                        "{club.rejectionReason}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tactical Perimeter (Sidebar) */}
        <div className="space-y-10">
          {/* Elite Representatives */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 p-8 shadow-2xl ring-1 ring-white/5"
          >
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-8 flex items-center gap-2">
              <Users size={14} className="text-primary" />
              Direct Representatives
            </h4>
            {reps.length === 0 ? (
              <p className="text-muted-foreground/30 font-medium italic text-xs text-center py-6">
                No reps assigned to protocol.
              </p>
            ) : (
              <div className="space-y-6">
                {reps.map((rep) => (
                  <div key={rep.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={rep.avatar}
                        alt={rep.name}
                        className="w-12 h-12 rounded-2xl ring-2 ring-white/5 relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div>
                      <p className="text-foreground font-black text-sm tracking-tight group-hover:text-primary transition-colors">
                        {rep.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest leading-none mt-1">
                        {rep.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Social Synchronicity */}
          {club.socialLinks && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 p-8 shadow-2xl ring-1 ring-white/5"
            >
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-8 flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                Network Nodes
              </h4>
              <div className="space-y-4">
                {club.socialLinks.website && (
                  <a
                    href={club.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-[1.5rem] bg-sidebar hover:bg-primary hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-primary group-hover:text-white transition-colors" />
                      <span className="text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Central Hub</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40" />
                  </a>
                )}
                {club.socialLinks.instagram && (
                  <div className="flex items-center gap-3 p-4 rounded-[1.5rem] bg-sidebar border border-border/5">
                    <Instagram size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{club.socialLinks.instagram}</span>
                  </div>
                )}
                {club.socialLinks.linkedin && (
                  <div className="flex items-center gap-3 p-4 rounded-[1.5rem] bg-sidebar border border-border/5">
                    <Linkedin size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{club.socialLinks.linkedin}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Core Analytics Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-[3rem] p-10 relative overflow-hidden group border border-primary/10"
            style={{ backgroundColor: `${clubColor}08` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
              <Zap size={100} style={{ color: clubColor }} />
            </div>
            <h4 className="mb-8 font-black text-[10px] uppercase tracking-[0.3em]" style={{ color: clubColor }}>
              Sector Metrics
            </h4>
            <div className="space-y-6">
              <MetricItem label="Total Convergences" value={clubEvents.length} color={clubColor} />
              <MetricItem label="Governance Approved" value={clubEvents.filter((e) => e.status === 'approved').length} color={clubColor} />
              <MetricItem label="Census Velocity" value={club.memberCount} color={clubColor} />
            </div>
          </motion.div>
        </div>
      </div>

      <EventDetailModal
        event={selectedEvent}
        club={club}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <ManageMembersModal
        club={club}
        open={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Recalibrate Institutional Profile"
      >
        <div className="p-8">
          <ClubForm
            initialData={club}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}

function MetricItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-2">
      <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">{label}</span>
      <span className="text-2xl font-black leading-none tracking-tighter" style={{ color: color }}>
        {value}
      </span>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
