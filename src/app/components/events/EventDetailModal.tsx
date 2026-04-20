import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, ExternalLink, Tag, Ticket, CheckCircle2, X, ShieldCheck, Send, Edit3 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { ClubEvent, Club } from '../../types';
import { StatusBadge, ModeBadge } from '../common/StatusBadge';
import { CLUB_COLORS } from '../../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { EventForm } from './EventForm';

interface EventDetailModalProps {
  event: ClubEvent | null;
  club?: Club;
  open: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, club, open, onClose }: EventDetailModalProps) {
  const [showTicket, setShowTicket] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const { registerForEvent, approveEvent, rejectEvent, submitForApproval, getRegistrations, updateEvent } = useData();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const fetchRegistration = useCallback(() => {
    if (user && event) {
      getRegistrations(event.id).then(regs => {
        const found = regs.find(r => r.userId === user.id);
        if (found) {
          setUserRegistration(found);
          setShowTicket(true);
        }
      });
    }
  }, [event?.id, user, getRegistrations]);

  useEffect(() => {
    if (open) {
      fetchRegistration();
    }
  }, [open, fetchRegistration]);

  // Reset state when modal opens/closes
  if (!open && showTicket) {
    setTimeout(() => {
      setShowTicket(false);
      setIsRegistering(false);
    }, 300);
  }

  const handleRegister = async () => {
    if (!user || !event) return;
    setIsRegistering(true);
    const success = await registerForEvent(event.id);
    if (success) {
      toast.success('Institutional Access Granted', {
        description: 'Your registration is confirmed. Unique QR signal generated.',
        icon: <ShieldCheck className="text-emerald-500" size={16} />
      });
      
      // Instant refresh of registrations to get the new QR signal
      await getRegistrations(event.id);
      fetchRegistration();
    } else {
      setIsRegistering(false);
    }
  };

  if (!event) return null;

  const clubColor = CLUB_COLORS[event.clubId] ?? '#6366f1';

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Obsidian Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-3xl"
              onClick={onClose}
            />

            {/* Vault Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card/95 backdrop-blur-3xl w-full max-w-2xl rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-border/10 overflow-hidden ring-1 ring-white/10"
            >
              {/* Header / Cover Area */}
              <div className="relative h-60 md:h-72">
                <img
                  src={event.coverImage || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&auto=format&fit=crop`}
                  alt={event.title}
                  className={`w-full h-full object-cover ${!event.coverImage ? 'opacity-30 grayscale' : 'opacity-60'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                
                {/* Close Overlay */}
                <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-sidebar/50 hover:bg-primary/20 hover:text-primary rounded-xl backdrop-blur-xl border border-white/5 transition-all text-muted-foreground z-30"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-8 left-10 right-10 z-10 space-y-3">
                  <div className="flex items-center gap-3">
                    <ModeBadge mode={event.mode}/>
                    <div className="scale-110">
                      <StatusBadge status={event.status}/>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter leading-tight drop-shadow-2xl">
                    {event.title}
                  </h2>
                </div>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto max-h-[calc(90vh-18rem)] custom-scrollbar">
                {/* Entity Integration */}
                {club && (
                  <div className="flex items-center gap-5 p-4 rounded-[2rem] bg-sidebar/50 border border-border/5 ring-1 ring-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-3xl shadow-inner border border-border/10">
                      {club.logo}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Sector Origin</p>
                      <p className="text-lg font-black text-foreground tracking-tighter leading-none">
                        {club.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-1">
                        {club.department} Intelligence
                      </p>
                    </div>
                  </div>
                )}

                {/* Technical Parameters Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ParamCard 
                    icon={<Calendar size={18} />} 
                    label="Mission Date" 
                    value={format(new Date(event.date), 'EEEE, MMMM d, yyyy')} 
                    color="blue"
                  />
                  <ParamCard 
                    icon={<Clock size={18} />} 
                    label="Temporal Window" 
                    value={`${event.startTime} – ${event.endTime}`} 
                    color="indigo"
                  />
                  <ParamCard 
                    icon={<MapPin size={18} />} 
                    label="Nexus Coordination" 
                    value={event.venue} 
                    color="purple"
                  />
                  {event.capacity && (
                    <ParamCard 
                      icon={<Users size={18} />} 
                      label="Resource Capacity" 
                      value={`${event.capacity} Entities`} 
                      color="emerald"
                    />
                  )}
                </div>

                {/* Dynamic Core (Ticket vs Bio) */}
                <AnimatePresence mode="wait">
                  {showTicket ? (
                    <motion.div 
                      key="ticket"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-8 rounded-[3rem] bg-primary/[0.03] border border-primary/20 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group shadow-inner"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <Ticket size={120} className="text-primary" />
                      </div>
                      
                      <div className="space-y-2 relative z-10">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-primary/20 animate-bounce">
                          <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter">Registration Confirmed.</h3>
                        <p className="text-muted-foreground text-sm font-medium">Authentication token generated for institutional access.</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl ring-4 ring-primary/10 border border-primary/20 relative z-10 group-hover:scale-105 transition-transform duration-500">
                        <QRCodeSVG 
                          value={userRegistration?.qrCodeId || `UNIFIED-SIGNAL-${event.id}`} 
                          size={180}
                          level="H"
                          includeMargin={true}
                          fgColor="#000000"
                        />
                      </div>
                      
                      <p className="text-[10px] font-black font-mono text-primary/40 tracking-[0.4em] relative z-10">
                        TOKEN-{userRegistration?.qrCodeId?.split('-')[0].toUpperCase() || 'SYNCHRONIZING'}
                      </p>

                      <button
                        onClick={() => setShowTicket(false)}
                        className="text-primary font-black uppercase text-[10px] tracking-[0.3em] hover:opacity-100 opacity-60 transition-opacity flex items-center gap-2"
                      >
                        Return to Intelligence Bio
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="bio"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      {/* Bio Statement */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Context Statement</h4>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed italic border-l-2 border-primary/20 pl-6">
                          "{event.description}"
                        </p>
                      </div>

                      {/* Operational Tags */}
                      {event.tags.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 ml-1">
                            <Tag size={12} className="text-primary/40" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Protocol Tags</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-sidebar border border-border/10 text-muted-foreground hover:border-primary/30 transition-all hover:scale-105"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Specific Feed */}
                {event.status === 'rejected' && event.rejectionReason && (
                  <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem]">
                     <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Governance Rejection Feed</p>
                     <p className="text-rose-400 font-bold italic text-sm">"{event.rejectionReason}"</p>
                  </div>
                )}

                {/* Execution Tier */}
                {user?.role === 'super_admin' ? (
                  <div className="flex flex-col gap-6 pt-6">
                    {event.status === 'pending' || event.status === 'rejected' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={async () => {
                             await approveEvent(event.id);
                             toast.success('Protocol Authorized', {
                               description: `"${event.title}" is now live.`,
                               icon: <CheckCircle2 className="text-emerald-500" size={16} />
                             });
                             onClose();
                           }}
                           className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20"
                         >
                           <CheckCircle2 size={16} /> Approve & Launch
                         </motion.button>
                         <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5"
                         >
                           <X size={16} /> Reject Protocol
                         </motion.button>
                      </div>
                    ) : (
                      <div className="text-center p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-4">
                         <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                           <ShieldCheck size={14} /> This confluence is synchronized
                         </p>
                         <button
                           onClick={() => setIsEditing(true)}
                           className="flex items-center justify-center gap-3 py-4 rounded-xl bg-primary/10 text-primary border border-primary/20 font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                         >
                           <Edit3 size={14} /> Recalibrate Mission Protocol
                         </button>
                      </div>
                    )}
                  </div>
                ) : !showTicket && event.status === 'approved' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                    {event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-sidebar border border-border/10 text-foreground font-black uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-white hover:text-black shadow-xl ring-1 ring-white/5"
                      >
                        External Node <ExternalLink size={16} />
                      </a>
                    )}
                    
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className={`flex items-center justify-center gap-3 py-5 rounded-2xl ${isRegistering ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]'} text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all sm:col-span-1`}
                      style={!event.registrationLink ? { gridColumn: 'span 2' } : {}}
                    >
                      {isRegistering ? 'Processing Signal...' : 'Generate Authentication Token'} <Ticket size={16} />
                    </button>
                  </div>
                )}

                {user?.role === 'club_rep' && event.status === 'draft' && (
                  <div className="pt-6">
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={async () => {
                         await submitForApproval(event.id);
                         toast.success('Mission Deployed', {
                           description: `"${event.title}" submitted for audit.`,
                           icon: <Send size={16} className="text-primary" />
                         });
                         onClose();
                       }}
                       className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
                     >
                       <Send size={16} /> Submit for Governance Audit
                     </motion.button>
                  </div>
                )}

                <p className="text-muted-foreground/20 text-center font-black uppercase tracking-[0.4em]" style={{ fontSize: '8px' }}>
                  LOGGED {format(new Date(event.createdAt), 'MMM d, yyyy')} • INTERNAL ARCHIVE SYNC
                </p>
              </div>
            </motion.div>
          </div>
          <Modal
            open={isEditing}
            onClose={() => setIsEditing(false)}
            title="Recalibrate Institutional Event"
          >
            <div className="p-8">
              <EventForm
                initialData={event}
                onSubmit={async (data) => {
                  const tagsArray = typeof data.tags === 'string'
                    ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                    : data.tags;
                  await updateEvent(event.id, { ...data, tags: tagsArray });
                  toast.success('Protocol Recalibrated');
                  setIsEditing(false);
                }}
                onSaveDraft={async (data) => {
                  const tagsArray = typeof data.tags === 'string'
                    ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                    : data.tags;
                  await updateEvent(event.id, { ...data, tags: tagsArray });
                  toast.success('Local Sync Complete');
                  setIsEditing(false);
                }}
              />
            </div>
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
}

function ParamCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-400/5 border-blue-400/10',
    indigo: 'text-indigo-400 bg-indigo-400/5 border-indigo-400/10',
    purple: 'text-purple-400 bg-purple-400/5 border-purple-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/5 border-emerald-500/10',
  };

  return (
    <div className={`flex items-start gap-4 p-5 rounded-[2rem] border transition-all hover:scale-[1.02] duration-500 ${colorMap[color] || ''}`}>
      <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-3xl border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1.5">{label}</p>
        <p className="text-[13px] font-black text-foreground tracking-tight leading-none truncate max-w-[150px]">
          {value}
        </p>
      </div>
    </div>
  );
}
