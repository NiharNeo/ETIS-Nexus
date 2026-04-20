import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ImageUploader } from '../components/common/ImageUploader';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Building, 
  Save, 
  ChevronLeft,
  Settings as SettingsIcon,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [department, setDepartment] = useState(user?.department || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let finalAvatarUrl = avatar;

      if (avatarFile && user) {
        const { uploadFile } = await import('../lib/supabase');
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        finalAvatarUrl = await uploadFile('avatars', fileName, avatarFile);
      }

      await updateUser({ name, avatar: finalAvatarUrl, department });
      toast.success('Profile Synchronized', {
        description: 'Your institutional identity has been updated.',
        icon: <CheckCircle2 className="text-emerald-500" size={16} />
      });
    } catch (err) {
      console.error(err);
      toast.error('Sync Failure', {
        description: 'Failed to update user telemetry.',
        icon: <Zap className="text-rose-500" size={16} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const glassContainer = "bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 p-10 lg:p-14 shadow-3xl ring-1 ring-white/5";
  const labelText = "text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 block px-1";
  const inputStyle = "w-full px-8 py-5 rounded-3xl bg-sidebar/50 border border-border/10 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground transition-all";

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-muted-foreground/30 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[9px] group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Nexus
        </button>
        
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
            <SettingsIcon size={32} />
          </div>
          <div>
            <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>User Configuration</p>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-none">Settings.</h1>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className={glassContainer}>
            <ImageUploader 
              label="Visual Identity (PFP)"
              aspectRatio="square"
              initialImage={avatar}
              onImageSelected={setAvatar}
              onFileSelected={setAvatarFile}
            />
            <p className="mt-6 text-[10px] text-center text-muted-foreground/40 leading-relaxed uppercase tracking-widest font-black">
              Digital Signature Avatar
            </p>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className={glassContainer}>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className={labelText}>Institutional Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className={`${inputStyle} pl-16`} 
                  />
                </div>
              </div>

              <div className="space-y-4 opacity-50 cursor-not-allowed">
                <label className={labelText}>Operational Email (Locked)</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20" size={18} />
                  <input type="text" value={user?.email} disabled className={`${inputStyle} pl-16`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className={labelText}>Governance Role</label>
                  <div className="relative">
                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20" size={18} />
                    <input type="text" value={user?.role?.replace('_', ' ').toUpperCase()} disabled className={`${inputStyle} pl-16 bg-sidebar/20 text-muted-foreground/40`} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className={labelText}>Sector Location</label>
                  <div className="relative group">
                    <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)} 
                      className={`${inputStyle} pl-16`} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-12 py-5 rounded-[2rem] bg-black text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-zinc-800 transition-all flex items-center gap-4 group"
                >
                  <Save size={18} className="group-hover:rotate-12 transition-transform" />
                  {isLoading ? 'Synchronizing...' : 'Save Configuration'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
