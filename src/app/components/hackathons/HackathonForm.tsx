import { useState } from 'react';
import { PlusCircle, Calendar, MapPin, Globe, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { Hackathon } from '../../types';

interface HackathonFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function HackathonForm({ onSubmit, onClose, isLoading }: HackathonFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    description: '',
    deadline: '',
    startDate: '',
    endDate: '',
    venue: '',
    mode: 'online' as 'online' | 'offline' | 'hybrid',
    applyLink: '',
    tags: '',
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        teamFormationActive: true
      });
    } catch (error) {
      console.error('Failed to deploy hackathon:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Visual Identity Strip */}
      <div className="relative h-32 rounded-3xl overflow-hidden border border-border group">
        <img src={formData.coverImage} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20 backdrop-blur-md">
            <PlusCircle size={18} />
          </div>
          <h2 className="text-xl font-black tracking-tighter text-foreground uppercase">New Mission Initialization</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Mission Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            placeholder="e.g. Nexus Global Hackathon"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Host Organization</label>
          <input
            type="text"
            required
            value={formData.organizer}
            onChange={e => setFormData({ ...formData, organizer: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            placeholder="e.g. Major League Hacking"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Strategic Intelligence (Description)</label>
        <textarea
          required
          rows={3}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium no-scrollbar"
          placeholder="Describe the mission parameters and expected strategic outcomes..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Deadline</label>
          <input
            type="datetime-local"
            required
            value={formData.deadline}
            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Mission Start</label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Mission End</label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Deployment Mode</label>
          <select
            value={formData.mode}
            onChange={e => setFormData({ ...formData, mode: e.target.value as any })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          >
            <option value="online">Digital Only (Online)</option>
            <option value="offline">In-Person (Offline)</option>
            <option value="hybrid">Multimodal (Hybrid)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Station Coordinates (Venue)</label>
          <input
            type="text"
            required
            value={formData.venue}
            onChange={e => setFormData({ ...formData, venue: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            placeholder="e.g. University Tech Hub / Discord"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Deployment URL</label>
          <input
            type="url"
            required
            value={formData.applyLink}
            onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            placeholder="https://hackathon.com/apply"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Institutional Tags</label>
          <input
            type="text"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-sidebar border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            placeholder="AI, Blockchain, Web3 (Comma separated)"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors uppercase tracking-widest"
        >
          Abort
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-10 py-3 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Zap className="animate-pulse" size={18} />
          ) : (
            <ShieldCheck size={18} />
          )}
          Authorize Mission
        </button>
      </div>
    </form>
  );
}
