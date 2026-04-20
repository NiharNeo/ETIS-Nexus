import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { HackathonCard } from '../components/hackathons/HackathonCard';
import { 
  Search, 
  Filter, 
  Zap, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Activity,
  Target,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { HackathonForm } from '../components/hackathons/HackathonForm';
import { toast } from 'sonner';

export default function HackathonRadarPage() {
  const { hackathons, addHackathon } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'online' | 'offline' | 'hybrid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'super_admin';

  const handleAddHackathon = async (data: any) => {
    setIsSubmitting(true);
    try {
      const success = await addHackathon(data);
      if (success) {
        toast.success('Institutional Deployment Complete', {
          description: `"${data.title}" has been commissioned on the radar.`,
          icon: <Zap className="text-primary" size={16} />
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error('Deployment Failure', {
        description: 'Failed to commission new hackathon vector.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHackathons = useMemo(() => {
    return hackathons.filter(h => {
      const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase()) || 
                          h.organizer.toLowerCase().includes(search.toLowerCase()) ||
                          h.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesMode = modeFilter === 'all' || h.mode === modeFilter;
      return matchesSearch && matchesMode;
    });
  }, [hackathons, search, modeFilter]);

  const upcomingDeadlines = useMemo(() => {
    return [...hackathons]
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [hackathons]);

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-12">
      {/* Editorial Hero Dimensionality */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[4rem] bg-sidebar p-12 lg:p-20 text-foreground border border-border/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
      >
        {/* Vector Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group">
          <Zap size={400} className="absolute -top-20 -right-20 rotate-12 text-primary group-hover:rotate-6 transition-transform duration-[3s]" />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-10">
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-card/60 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl flex items-center gap-3">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Radar Curations</span>
             </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
              Hackathon <span className="text-primary italic">Radar</span>.
            </h1>
            <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-2xl">
              Omniscient coverage of competitive deployments. Orchestrate cross-departmental teams 
              and architect the future directly within the institutional nexus.
            </p>
          </div>
          
          {/* Quick Intel Strip */}
          <div className="flex flex-wrap gap-4 pt-4">
            {upcomingDeadlines.map((h, idx) => (
              <motion.div 
                key={h.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 bg-card/40 backdrop-blur-3xl px-6 py-4 rounded-3xl border border-white/5 group cursor-pointer hover:bg-white/10 transition-all shadow-2xl ring-1 ring-white/5"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-primary/40 tracking-[0.2em] leading-none mb-1">Window Warning</p>
                  <p className="text-sm font-black tracking-tight leading-none group-hover:text-primary transition-colors">{h.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Control Strip (Search & Filter Logic) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 rounded-[3rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl ring-1 ring-white/5">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
          <div className="relative w-full md:w-[400px] group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by intelligence signature, hub, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-4 py-4.5 rounded-2xl bg-sidebar border border-border/10 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground placeholder-muted-foreground/10 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-sidebar rounded-[1.5rem] border border-border/10 shadow-inner overflow-x-auto no-scrollbar">
             {['all', 'online', 'offline', 'hybrid'].map((mode) => (
               <button
                 key={mode}
                 onClick={() => setModeFilter(mode as any)}
                 className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                   modeFilter === mode 
                     ? 'bg-primary text-white shadow-xl px-10' 
                     : 'text-muted-foreground/40 hover:text-foreground'
                 }`}
               >
                 {mode === 'all' ? 'Unified' : mode}
               </button>
             ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 px-8 py-4 bg-sidebar/50 rounded-2xl border border-border/10 text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.3em] shadow-inner">
          <Target size={14} className="text-primary/40" />
          Radar Lock: <span className="text-foreground">{filteredHackathons.length}</span> Upcoming Vectors Identified
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full lg:w-auto px-10 py-5 bg-primary text-white font-black rounded-3xl hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-3xl shadow-primary/30"
          >
            <Plus size={18} />
            Commission New Vector
          </button>
        )}
      </div>

      {/* Logic Modal */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Commission Institutional Hackathon"
      >
        <div className="p-8">
          <HackathonForm 
            onSubmit={handleAddHackathon}
            onClose={() => setIsModalOpen(false)}
            isLoading={isSubmitting}
          />
        </div>
      </Modal>

      {/* Intelligence Grid DISPLAY */}
      <AnimatePresence mode="popLayout">
        {filteredHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredHackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <HackathonCard hackathon={hackathon} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-48 text-center bg-card/20 rounded-[4rem] border border-dashed border-border/10"
          >
            <div className="w-24 h-24 bg-card/40 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-3xl ring-1 ring-white/5">
              <Zap className="text-muted-foreground/10" size={40} />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none mb-4">Zero Vector Correlation</h2>
            <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
              The radar returned no competitive events matching these parameters. Reset filters to recalibrate.
            </p>
            <button 
              onClick={() => { setSearch(''); setModeFilter('all'); }}
              className="mt-10 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3"
            >
              Recalibrate Radar <Activity size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Philosophy Footer Segment */}
      <div className="pt-24 pb-12 border-t border-border/10 text-center space-y-4">
         <div className="flex items-center justify-center gap-4 opacity-20">
            <div className="w-12 h-[1px] bg-foreground" />
            <Zap size={24} />
            <div className="w-12 h-[1px] bg-foreground" />
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/30">ETIS Institutional Competitive Intelligence Protocol</p>
      </div>
    </div>
  );
}
