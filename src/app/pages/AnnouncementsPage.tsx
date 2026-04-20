import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Megaphone, Plus, Clock, User, Filter, X, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../components/common/Modal';
import { toast } from 'sonner';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'global' as 'global' | 'club'
  });

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        const success = await updateAnnouncement(editingId, formData);
        if (success) {
          toast.success('Signal Recalibrated', {
            description: 'The broadcast has been updated across the nexus.'
          });
          setIsModalOpen(false);
          setFormData({ title: '', content: '', type: 'global' });
          setEditingId(null);
        }
      } else {
        const payload = { ...formData, authorId: user.id };
        const success = await addAnnouncement(payload);
        if (success) {
          toast.success('Broadcast Transmitted', {
            description: 'The signal has been amplified across all campus nodes.',
            icon: <Megaphone className="text-primary" size={16} />
          });
          setIsModalOpen(false);
          setFormData({ title: '', content: '', type: 'global' });
          setEditingId(null);
        }
      }
    } catch (err) {
      toast.error('Sync failure', { description: 'Failed to transmit broadcast.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <Megaphone size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Nexus <span className="text-primary">Broadcasts</span></h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Stay synchronized with campus-wide updates, mission briefings, and critical system alerts.
          </p>
        </div>

        {user?.role === 'super_admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 scale-100 hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>Post Broadcast</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6">
        {announcements.map((ann) => (
          <div 
            key={ann.id}
            className="group relative p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    ann.type === 'global' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {ann.type} Signal
                  </span>
                  <div className="flex items-center gap-1.5 text-muted-foreground/40 font-bold uppercase tracking-widest text-[9px]">
                    <Clock size={12} />
                    {format(new Date(ann.createdAt), 'MMM d, h:mm a')}
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">
                  {ann.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {ann.content}
                </p>

                <div className="pt-6 flex items-center justify-between border-t border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <User size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{ann.authorName || 'Authorized Unit'}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Campus Governance</p>
                    </div>
                  </div>

                  {user?.role === 'super_admin' && (
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => {
                          setFormData({ title: ann.title, content: ann.content, type: ann.type });
                          setEditingId(ann.id);
                          setIsModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all"
                        title="Recalibrate Signal"
                      >
                        <X size={16} className="rotate-45" /> {/* Using X as a pencil-like icon if pencil isn't imported, or I can import it */}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Decommission this broadcast signal?')) {
                            deleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-muted hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                        title="Terminate Signal"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6 text-muted-foreground/20">
              <Megaphone size={40} />
            </div>
            <p className="text-xl font-black text-muted-foreground/40 uppercase tracking-widest">No Active Signals</p>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Post New Broadcast"
      >
        <form onSubmit={handlePost} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Broadcast Title</label>
            <input 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="System Update: Sector 7 Active"
              className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold tracking-tight"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Detailed Intel</label>
            <textarea 
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Provide clear and concise information for the community..."
              rows={5}
              className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold tracking-tight resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Clock className="animate-spin" size={18} /> : <Send size={18} />}
              <span>Transmit Signal</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
