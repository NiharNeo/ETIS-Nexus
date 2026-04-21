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
             <div className="w-12 h-12 bg-muted flex items-center justify-center text-primary border border-border rounded-none">
               <Building2 size={24} />
             </div>
             <div>
               <p className="text-primary font-bold uppercase tracking-[0.4em]" style={{ fontSize: '10px' }}>
                 Institutional Nexus Protocol
               </p>
               <h1 className="text-5xl lg:text-7xl font-normal tracking-tighter text-foreground leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                 Club <span className="underline decoration-border italic">Nexus</span>.
               </h1>
             </div>
          </div>
          <p className="text-xl text-foreground/70 font-medium leading-relaxed max-w-2xl">
            Discover the university's elite digital and physical associations. 
            Connect with institutional hubs and lead the next wave of campus innovation.
          </p>
        </div>
        
        {/* Real-time Sector Telemetry */}
        <div className="flex items-center gap-8 p-8 bg-card border border-border rounded-none group">
           <div className="px-6 text-center border-r border-border">
             <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-[0.2em] mb-1.5">Foundations</p>
             <div className="flex items-center justify-center gap-2">
                <span className="text-primary font-normal text-4xl tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>{approvedClubs.length}</span>
             </div>
           </div>
           <div className="px-6 text-center">
             <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-[0.2em] mb-1.5">Active Sectors</p>
             <div className="flex items-center justify-center gap-2">
                <span className="text-foreground font-normal text-4xl tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>{departments.length}</span>
             </div>
           </div>
           {user?.role === 'super_admin' && (
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsAddClubModalOpen(true)}
               className="w-14 h-14 bg-foreground flex items-center justify-center border border-foreground hover:bg-primary hover:border-primary transition-all rounded-none"
               title="Create New Club"
             >
                <Plus size={24} className="text-white" />
             </motion.button>
           )}
        </div>
      </motion.div>

      {/* Discovery Console (Search & Filter Logic) */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between p-6 bg-card border border-border shadow-none rounded-none">
        <div className="relative w-full lg:w-[45%] group">
          <div className="relative flex items-center">
            <Search size={24} className="absolute left-6 text-foreground/40 group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search the nexus by organization signature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-10 py-4 bg-transparent border-b border-input text-lg font-bold tracking-tight text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all shadow-none rounded-none"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-2 bg-muted border border-border max-w-full rounded-none">
           <div className="px-6 flex items-center gap-3 border-r border-border">
              <Filter size={18} className="text-foreground/40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40 whitespace-nowrap">Sector Select</span>
           </div>
           <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
             <button
               onClick={() => setFilterDept('')}
               className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border rounded-none ${
                 filterDept === '' 
                   ? 'bg-primary text-white border-primary shadow-none' 
                   : 'text-foreground/60 border-transparent hover:text-foreground hover:bg-card'
               }`}
             >
               Unified Hubs
             </button>
             {departments.map((dept) => (
               <button
                 key={dept}
                 onClick={() => setFilterDept(dept)}
                 className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border rounded-none whitespace-nowrap ${
                   filterDept === dept
                     ? 'bg-primary text-white border-primary shadow-none'
                     : 'text-foreground/60 border-transparent hover:text-foreground hover:bg-card'
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
