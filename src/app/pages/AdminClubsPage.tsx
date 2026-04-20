import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ImageUploader } from '../components/common/ImageUploader';
import { uploadFile } from '../lib/supabase';
import type { Club, ClubFormData } from '../types';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Users,
  Calendar,
  Building2,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  MoreVertical,
  ShieldAlert,
  Archive,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminClubsPage() {
  const { user } = useAuth();
  const { clubs, approveClub, rejectClub, addClub, deleteClub } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [rejectModal, setRejectModal] = useState<Club | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClubData, setNewClubData] = useState<ClubFormData>({
    name: '',
    department: '',
    description: '',
    shortDescription: '',
    tags: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    return clubs.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.department.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [clubs, search, filterStatus]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filtered]);

  const handleApprove = async (club: Club) => {
    await approveClub(club.id);
    toast.success('Club Approved', {
      description: `${club.name} is now active.`,
      icon: <CheckCircle2 className="text-emerald-500" size={16} />
    });
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    await rejectClub(rejectModal.id, rejectReason);
    toast.error('Club Rejected', {
      description: `${rejectModal.name} has been rejected.`,
      icon: <XCircle className="text-rose-500" size={16} />
    });
    setRejectModal(null);
    setRejectReason('');
  };

  const handleAddClub = async () => {
    if (!newClubData.name || !newClubData.department) {
      toast.error('Missing Information', { description: 'Please provide name and department.' });
      return;
    }
    try {
      let logoUrl = '🏛️';
      let coverUrl = '';

      if (logoFile) {
        logoUrl = await uploadFile('logos', `clubs/logo-${Date.now()}-${logoFile.name}`, logoFile);
      }
      if (coverFile) {
        coverUrl = await uploadFile('covers', `clubs/cover-${Date.now()}-${coverFile.name}`, coverFile);
      }

      const result = await addClub({
        ...newClubData,
        logo: logoUrl,
        coverImage: coverUrl
      });
      if (result) {
        toast.success('Club Created', { 
          description: `${newClubData.name} has been added successfully.`,
          icon: <CheckCircle2 className="text-emerald-500" size={16} />
        });
        setIsAddModalOpen(false);
        setNewClubData({ name: '', department: '', description: '', shortDescription: '', tags: '' });
        setLogoFile(null);
        setCoverFile(null);
      } else {
        toast.error('Creation Failed', { 
          description: 'The administrative server rejected the request.',
          icon: <Zap className="text-red-500" size={16} />
        });
      }
    } catch (err) {
      toast.error('Network error', { 
        description: 'Failed to reach the administrative gateway.',
        icon: <Zap className="text-red-500" size={16} />
      });
    }
  };

  const handleDelete = async (club: Club) => {
    if (confirm(`Are you sure you want to delete "${club.name}"? This will also delete all its events.`)) {
      await deleteClub(club.id);
      toast.success('Club Deleted', { description: `${club.name} has been removed from the system.` });
    }
  };

  const counts = {
    all: clubs.length,
    pending: clubs.filter((c) => c.status === 'pending').length,
    approved: clubs.filter((c) => c.status === 'approved').length,
    rejected: clubs.filter((c) => c.status === 'rejected').length,
  };

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
               <Building2 size={24} />
             </div>
             <h1 className="text-5xl font-black tracking-tighter text-black leading-none">
               Club Management
             </h1>
          </div>
          <p className="text-black/60 font-medium text-lg max-w-2xl leading-relaxed">
            Manage university clubs. Add new organizations, approve requests, or update existing ones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Add New Club
        </button>
      </motion.div>

      {/* Stats Summary - Simple Black */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Clubs', count: counts.all, color: 'text-black' },
          { label: 'Approved', count: counts.approved, color: 'text-emerald-600' },
          { label: 'Pending Approval', count: counts.pending, color: 'text-amber-600' },
          { label: 'Rejected', count: counts.rejected, color: 'text-rose-600' },
        ].map((item) => (
          <div key={item.label} className="p-8 rounded-3xl bg-white border-2 border-black/5 shadow-sm hover:border-black/20 transition-all flex flex-col items-center text-center">
            <span className={`text-5xl font-black tracking-tight ${item.color}`}>{item.count}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-2">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-6 bg-white rounded-[2.5rem] border border-black/5 shadow-sm">
        <div className="relative w-full lg:w-[40%] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by club name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-zinc-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 text-sm font-bold text-black placeholder-black/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-zinc-50 rounded-2xl border border-black/5 overflow-x-auto no-scrollbar">
           {['', 'pending', 'approved', 'rejected'].map((status) => (
             <button
               key={status}
               onClick={() => setFilterStatus(status)}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 filterStatus === status 
                   ? 'bg-black text-white' 
                   : 'text-black/40 hover:text-black'
               }`}
             >
               {status === '' ? 'All' : status}
             </button>
           ))}
        </div>
      </div>

      {/* Table - High Contrast Black */}
      <div className="bg-white rounded-[3rem] border border-black/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b-2 border-black/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-black/60">Club Details</th>
                <th className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-black/60 hidden md:table-cell">Department</th>
                <th className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-black/60 hidden lg:table-cell">Members</th>
                <th className="px-5 py-6 text-[10px] font-black uppercase tracking-widest text-black/60">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-black/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              <AnimatePresence mode="popLayout">
                {sorted.map((club) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={club.id} 
                    className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('button')) {
                        navigate(`/clubs/${club.id}`);
                      }
                    }}
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-3xl border border-black/5 group-hover:scale-110 transition-transform">
                           {club.logo}
                        </div>
                        <div>
                          <p className="text-xl font-black text-black tracking-tighter leading-none mb-1 group-hover:underline">
                            {club.name}
                          </p>
                          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                            Created {format(new Date(club.createdAt), 'MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-8 hidden md:table-cell">
                      <span className="text-sm font-black text-black ">{club.department}</span>
                    </td>
                    <td className="px-5 py-8 hidden lg:table-cell">
                      <span className="text-sm font-black text-black/60 ">{club.memberCount} Members</span>
                    </td>
                    <td className="px-5 py-8">
                      <StatusBadge status={club.status} />
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/clubs/${club.id}`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 text-black/40 hover:bg-black hover:text-white transition-all border border-black/5"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {club.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(club)}
                            className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                          >
                            Approve
                          </button>
                        )}
                        
                        {club.status === 'pending' && (
                          <button
                            onClick={() => setRejectModal(club)}
                            className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                          >
                            Reject
                          </button>
                        )}

                        <button 
                          onClick={() => handleDelete(club)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500/30 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                          title="Delete"
                        >
                           <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {sorted.length === 0 && (
            <div className="py-48 text-center bg-zinc-50/20">
              <Archive className="mx-auto text-black/5 mb-6" size={60} />
              <h3 className="text-2xl font-black text-black tracking-tighter">No clubs found</h3>
              <p className="text-black/40 font-medium">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Club Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader 
              label="Club Logo"
              aspectRatio="square"
              onImageSelected={() => {}} // We'll use file selected for upload
              onFileSelected={(file) => setLogoFile(file)}
            />
            <ImageUploader 
              label="Cover Image"
              aspectRatio="video"
              onImageSelected={() => {}}
              onFileSelected={(file) => setCoverFile(file)}
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
              onClick={handleAddClub}
              className="flex-1 py-5 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/20"
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
        title="Reject Club Application"
      >
        <div className="p-10 space-y-8 bg-white rounded-[3rem]">
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-500/20">
             <p className="text-black font-bold">Rejecting: {rejectModal?.name}</p>
             <p className="text-black/40 text-[10px] uppercase font-black tracking-widest">{rejectModal?.department} Department</p>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-black/40 pl-2">Reason for rejection</label>
             <textarea
               rows={5}
               value={rejectReason}
               onChange={(e) => setRejectReason(e.target.value)}
               placeholder="Please explain why this club is being rejected..."
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
    </div>
  );
}
