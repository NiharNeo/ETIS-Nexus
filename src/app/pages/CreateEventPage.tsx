import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EventForm } from '../components/events/EventForm';
import type { EventFormData } from '../types';
import { toast } from 'sonner';
import { 
  PlusCircle, 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Activity,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateEventPage() {
  const { user } = useAuth();
  const { clubs, addEvent } = useData();
  const navigate = useNavigate();

  const [selectedClubId, setSelectedClubId] = useState<string>('');

  const availableClubs = user?.role === 'super_admin' 
    ? clubs.filter(c => c.status === 'approved') 
    : clubs.filter(c => user?.clubIds?.includes(c.id));

  // Initialize selected club
  useEffect(() => {
    if (availableClubs.length > 0 && !selectedClubId) {
      setSelectedClubId(availableClubs[0].id);
    }
  }, [availableClubs, selectedClubId]);

  const handleCreate = async (data: EventFormData, status: 'draft' | 'pending' = 'draft') => {
    if (!user || availableClubs.length === 0 || !selectedClubId) return;

    const finalStatus = user.role === 'super_admin' ? (status === 'draft' ? 'draft' : 'approved') : status;

    await addEvent({
      ...data,
      clubId: selectedClubId,
      status: finalStatus
    });

    if (finalStatus === 'draft') {
      toast.success('Local Protocol Initialized', {
        description: `"${data.title}" saved as local draft.`,
        icon: <Zap className="text-primary" size={16} />
      });
    } else {
      toast.success('Mission Deployed', {
        description: `"${data.title}" successfully launched.`,
        icon: <ShieldCheck className="text-emerald-500" size={16} />
      });
    }

    navigate(user.role === 'super_admin' ? '/admin/events' : '/rep/events');
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12">
      {/* Editorial Header Dimension */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-6 max-w-2xl">
           <button
             onClick={() => navigate(-1)}
             className="flex items-center gap-3 text-muted-foreground/30 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[9px] group"
           >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
             Abort Initialization
           </button>
           
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                   <PlusCircle size={20} />
                 </div>
                 <div>
                   <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                     Institutional Deployment Port
                   </p>
                   <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-foreground leading-none">
                     Propose <span className="text-muted-foreground/20 italic">Mission</span>.
                   </h1>
                 </div>
              </div>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">
                 Initialize a new institutional confluence. Calibrate temporal coordinates, 
                 mission objectives, and strategic telemetry.
              </p>
           </div>
        </div>

        {/* Tactical Status Tunnel */}
        <div className="flex flex-col gap-4">
          {user?.role === 'super_admin' && (
            <div className="w-full">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-2">Host Organization</label>
              <select 
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-card border border-border/50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              >
                {availableClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div className="p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5 flex items-center gap-6">
             <div className="px-6 border-r border-border/10">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Sector</p>
                <p className="text-lg font-black text-foreground tracking-tighter leading-none">{availableClubs.find(c => c.id === selectedClubId)?.department || 'Unassigned'}</p>
             </div>
             <div className="px-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Auth Protocol</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-lg font-black text-primary tracking-tighter leading-none">ACTIVE</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Logic Entry Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card/60 backdrop-blur-3xl rounded-[4rem] border border-border/10 shadow-3xl ring-1 ring-white/10 overflow-hidden"
      >
        <div className="p-10 lg:p-14">
           <EventForm
             onSaveDraft={(data) => handleCreate(data, 'draft')}
             onSubmit={(data) => handleCreate(data, 'pending')}
           />
        </div>
      </motion.div>

      {/* Temporal Information Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
         <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Mission Integrity</h4>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
               Ensure all telemetry is accurate. Mission signatures cannot be altered once authorized by the executive board without recalibration protocols.
            </p>
         </div>
         <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Synchronized Calendar</h4>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
               Proposed confluences will be automatically synchronized with the universal university calendar upon authorization.
            </p>
         </div>
      </div>
    </div>
  );
}
