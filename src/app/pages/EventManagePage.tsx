import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { EventRegistration } from '../types';
import { 
  Users, CheckCircle2, Ticket, Search, ArrowLeft,
  Activity, Zap, ShieldCheck, ScanLine
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function EventManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, clubs, getRegistrations, checkInStudent, validateAndCheckIn } = useData();
  
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tokenSearch, setTokenSearch] = useState('');

  const event = events.find(e => e.id === id);
  const club = event ? clubs.find(c => c.id === event.clubId) : null;

  // Security Verification
  const isAuthorized = user?.role === 'super_admin' || (user?.role === 'club_rep' && user.clubIds?.includes(event?.clubId || ''));

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/dashboard');
      return;
    }

    const fetchRegistrations = async () => {
      if (!id) return;
      try {
        const data = await getRegistrations(id);
        setRegistrations(data);
      } catch (e) {
        console.error('Failed fetching registrations', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistrations();
  }, [id, isAuthorized, navigate]);

  const handleCheckIn = async (regId: string) => {
    if (!id) return;
    
    // Optimistic UI
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'checked_in' } : r));
    
    try {
      const success = await checkInStudent(regId, id);
      if (success) {
        toast.success('Authentication Validated', {
          description: `Student successfully checked in.`,
          icon: <ShieldCheck className="text-emerald-500" size={16} />
        });
      } else {
        toast.error('Sync failure');
        // Rollback
        setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'registered' } : r));
      }
    } catch (e) {
      console.error(e);
      toast.error('Sync failure');
    }
  };

  const handleCheckInByToken = async () => {
    if (!tokenSearch.trim() || !id) return;
    const reg = registrations.find(r => r.qrCodeId === tokenSearch.trim() || r.qrCodeId?.startsWith(tokenSearch.trim().toLowerCase()));
    if (!reg) {
      toast.error('Invalid Signal', { description: 'Token not found in local frequency registry.' });
      return;
    }
    if (reg.status === 'checked_in') {
      toast.info('Operative Already Logged', { description: `${reg.userName} is already registered as present.` });
      return;
    }
    await handleCheckIn(reg.id);
    setTokenSearch('');
  };

  const filteredRegs = registrations.filter(r => 
    r.userName?.toLowerCase().includes(search.toLowerCase()) || 
    r.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (!event || !isAuthorized) return null;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
      >
        <div className="space-y-6 max-w-2xl">
           <button
             onClick={() => navigate(-1)}
             className="flex items-center gap-3 text-muted-foreground/30 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[9px] group"
           >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
             Return to Sector
           </button>
           
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                   <Activity size={20} />
                 </div>
                 <div>
                   <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                     Operations Terminal
                   </p>
                   <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-none">
                     {event.title}
                   </h1>
                 </div>
              </div>
           </div>
        </div>

        {/* Tactical Status Tunnel */}
        <div className="p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5 flex items-center gap-6">
           <div className="px-6 border-r border-border/10">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Total Registrants</p>
              <p className="text-2xl font-black text-foreground tracking-tighter leading-none">{registrations.length}</p>
           </div>
           <div className="px-6 border-r border-border/10">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Checked In</p>
              <div className="flex items-center gap-2">
                 <p className="text-2xl font-black text-emerald-500 tracking-tighter leading-none">
                   {registrations.filter(r => r.status === 'checked_in').length}
                 </p>
              </div>
           </div>
           <div className="px-6">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-1.5">Rate</p>
              <p className="text-2xl font-black text-primary tracking-tighter leading-none">
                {registrations.length > 0 ? Math.round((registrations.filter(r => r.status === 'checked_in').length / registrations.length) * 100) : 0}%
              </p>
           </div>
        </div>
        {/* QR Scanner Shortcut */}
        <button
          onClick={() => navigate(`/scan?eventId=${id}`)}
          className="flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ScanLine size={18} /> Open QR Scanner
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-4 bg-card/60 rounded-3xl p-2 border border-border/10 ring-1 ring-white/5 backdrop-blur-xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="text-muted-foreground/50" size={18} />
              <input
                type="text"
                placeholder="Roster Search (Designation / Email)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/30 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-primary/5 rounded-3xl p-2 border border-primary/20 ring-1 ring-primary/5 backdrop-blur-xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Ticket className="text-primary/50" size={18} />
              <input
                type="text"
                placeholder="Cryptographic Signal Integration (Token ID)..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckInByToken()}
                className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-primary/30 font-black tracking-widest"
              />
              <button 
                onClick={handleCheckInByToken}
                className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all"
              >
                Validate
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 rounded-xl bg-sidebar border border-border/10 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            <div className="col-span-4">Operative</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-3">Registry Timestamp</div>
            <div className="col-span-2 text-right">Status Hook</div>
          </div>

          {isLoading ? (
            <div className="text-center p-12 text-muted-foreground/50 text-[10px] uppercase tracking-[0.3em] font-black">
              <Zap size={24} className="mx-auto mb-4 animate-pulse" />
              Scanning Quantum Frequencies...
            </div>
          ) : filteredRegs.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground/30 text-[10px] uppercase tracking-[0.3em] font-black bg-card/30 rounded-[3rem] border border-border/5">
              Zero Convergence Detected.
            </div>
          ) : (
            filteredRegs.map((reg) => (
              <div 
                key={reg.id}
                className="grid grid-cols-12 gap-4 px-6 py-6 rounded-[2rem] bg-card/60 border border-border/10 ring-1 ring-white/5 items-center hover:scale-[1.01] transition-transform"
              >
                <div className="col-span-4">
                  <p className="font-bold text-sm text-foreground">{reg.userName}</p>
                  <p className="text-xs text-muted-foreground">{reg.userEmail}</p>
                </div>
                <div className="col-span-3">
                  <span className="px-3 py-1 bg-white/5 rounded-xl text-xs font-medium text-muted-foreground border border-white/5">
                    {reg.userDepartment || 'Unknown Sector'}
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 focus:outline-none">
                    {new Date(reg.registeredAt).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 flex justify-end">
                  {reg.status === 'registered' ? (
                    <button
                      onClick={() => handleCheckIn(reg.id)}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-white transition-all ring-1 ring-primary/20"
                    >
                      Check-In
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-black uppercase text-[10px] tracking-[0.2em] border border-emerald-500/20 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Verified
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
