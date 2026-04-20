import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ClubCard } from '../components/clubs/ClubCard';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Users, 
  Sparkles, 
  LayoutGrid, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { toast } from 'sonner';
import type { ClubFormData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ClubsPage() {
  const { clubs, isLoading, addClub } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState<ClubFormData>({
    name: '',
    department: '',
    description: '',
    shortDescription: '',
    tags: ''
  });

  const handleAddClub = async () => {
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
          description: 'The institutional server returned an error. Please try again later.',
          icon: <Zap className="text-red-500" size={16} />
        });
      }
    } catch (err) {
      toast.error('Connection Error', { 
        description: 'Failed to synchronize with the university backend.',
        icon: <Zap className="text-red-500" size={16} />
      });
    }
  };

  const approvedClubs = clubs.filter((c) => c.status === 'approved');
  const departments = [...new Set(approvedClubs.map((c) => c.department))].sort();

  const filtered = useMemo(() => {
    return approvedClubs.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchDept = !filterDept || c.department === filterDept;
      return matchSearch && matchDept;
    });
  }, [approvedClubs, search, filterDept]);

  return (
    <div className="p-8 lg:p-12 max-w-[1700px] mx-auto space-y-16">
      {/* Editorial Header Dimension */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-12"
      >
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
               <Building2 size={24} />
             </div>
             <div>
               <p className="text-primary font-black uppercase tracking-[0.4em]" style={{ fontSize: '10px' }}>
                 Institutional Nexus Protocol
               </p>
               <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-none">
                 Club <span className="text-muted-foreground/20 italic">Nexus</span>.
               </h1>
             </div>
          </div>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
            Discover the university's elite digital and physical associations. 
            Connect with institutional hubs and lead the next wave of campus innovation.
          </p>
        </div>
        
        {/* Real-time Sector Telemetry */}
        <div className="flex items-center gap-8 p-8 rounded-[3rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-3xl ring-1 ring-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000">
              <Sparkles size={100} className="text-primary" />
           </div>
           
           <div className="px-6 text-center border-r border-border/10">
             <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-1.5">Foundations</p>
             <div className="flex items-center justify-center gap-2">
                <span className="text-primary font-black text-4xl tracking-tighter leading-none">{approvedClubs.length}</span>
                <TrendingUp size={16} className="text-emerald-500 mb-1" />
             </div>
           </div>
           <div className="px-6 text-center">
             <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-1.5">Active Sectors</p>
             <div className="flex items-center justify-center gap-2">
                <span className="text-foreground font-black text-4xl tracking-tighter leading-none">{departments.length}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)] mb-1" />
             </div>
           </div>
           {user?.role === 'super_admin' && (
             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => setIsAddClubModalOpen(true)}
               className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:bg-zinc-800 transition-all relative overflow-hidden group/btn"
               title="Create New Club"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <Plus size={24} className="text-white relative z-10" />
             </motion.button>
           )}
        </div>
      </motion.div>

      {/* Discovery Console (Search & Filter Logic) */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between p-6 rounded-[3.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl ring-1 ring-white/5">
        <div className="relative w-full lg:w-[45%] group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center">
            <Search size={24} className="absolute left-8 text-muted-foreground/20 group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search the nexus by organization signature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-20 pr-10 py-6 rounded-[2.5rem] bg-sidebar border border-border/10 text-lg font-bold tracking-tight text-foreground placeholder-muted-foreground/10 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-2 bg-sidebar rounded-[2rem] border border-border/5 shadow-inner overflow-x-auto no-scrollbar max-w-full">
           <div className="px-6 flex items-center gap-3 border-r border-border/10">
              <Filter size={18} className="text-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 whitespace-nowrap">Sector Select</span>
           </div>
           <div className="flex items-center gap-3">
             <button
               onClick={() => setFilterDept('')}
               className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                 filterDept === '' 
                   ? 'bg-primary text-white shadow-xl px-12' 
                   : 'text-muted-foreground/40 hover:text-foreground hover:bg-white/5'
               }`}
             >
               Unified Hubs
             </button>
             {departments.map((dept) => (
               <button
                 key={dept}
                 onClick={() => setFilterDept(dept)}
                 className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                   filterDept === dept
                     ? 'bg-primary text-white shadow-xl px-12'
                     : 'text-muted-foreground/40 hover:text-foreground hover:bg-white/5'
                 }`}
               >
                 {dept} Sector
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Institutional Gallery Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} className="space-y-6 p-2">
                <Skeleton className="h-64 rounded-[3rem] bg-card/40" />
                <div className="space-y-3 px-4">
                  <Skeleton className="h-8 w-2/3 rounded-xl bg-card/40" />
                  <Skeleton className="h-4 w-full rounded-lg bg-card/20" />
                </div>
              </motion.div>
            ))
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full py-48 text-center space-y-8"
            >
              <div className="w-28 h-28 bg-card/40 rounded-[3rem] border border-dashed border-border/20 flex items-center justify-center mx-auto shadow-3xl ring-1 ring-white/5">
                <MapPin size={48} className="text-muted-foreground/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black tracking-tighter text-foreground leading-none">Nexus Void Encountered</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium text-lg italic opacity-60">
                  No institutional hubs detected within the current coordinate spectrum.
                </p>
              </div>
              <button
                onClick={() => { setSearch(''); setFilterDept(''); }}
                className="px-10 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                Reset Sensors
              </button>
            </motion.div>
          ) : (
            filtered.map((club, index) => (
              <motion.div
                key={club.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ClubCard club={club} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

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
