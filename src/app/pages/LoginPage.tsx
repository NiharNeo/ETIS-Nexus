
  import { useState } from 'react';
  import { useNavigate, Navigate } from 'react-router';
  import { GraduationCap, Eye, EyeOff, LogIn, ShieldAlert, Linkedin } from 'lucide-react';
  import { useAuth } from '../context/AuthContext';
  import { motion, AnimatePresence } from 'motion/react';

  export default function LoginPage() {
    const { login, isAuthenticated, loading: authLoading, signInWithLinkedIn } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    if (authLoading) {
      return null;
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Manual login disabled on this portal
    };

    const handleLinkedInLogin = async () => {
      setError('');
      try {
        await signInWithLinkedIn();
      } catch (err: any) {
        setError(err.message || 'LinkedIn authentication failed.');
      }
    };



    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-background selection:bg-primary/20">
        {/* Left Side — Branding & Aesthetics */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-50 border-r border-black/5">
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 grayscale"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-152305085306e-8c3d3e7d9f3f?w=1200&q=80)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-primary/5" />
          
          <div className="relative z-10 flex flex-col justify-between p-20 text-foreground w-full">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div>
                <p className="text-3xl font-black tracking-tighter leading-none mb-1">ETIS <span className="text-primary italic">Nexus</span>.</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Institutional Governance</p>
              </div>
            </motion.div>

            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-foreground">
                  Streamline Your <br />
                  <span className="text-primary italic">Campus Life.</span>
                </h1>
                <p className="text-xl text-foreground/60 font-medium max-w-md">
                  A unified portal for clubs, event coordination, and university management.
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20"
            >
              <span>v4.2.0-STABLE</span>
              <div className="w-1 h-1 rounded-full bg-black/10" />
              <span>SECURE TUNNEL ACTIVE</span>
            </motion.div>
          </div>
        </div>

        {/* Right Side — Login Portal */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg relative z-10"
          >
            {/* Mobile Branding */}
            <div className="flex items-center gap-4 mb-12 lg:hidden">
              <p className="text-2xl font-black tracking-tighter text-foreground">ETIS <span className="text-primary italic">Nexus</span>.</p>
            </div>

            <div className="bg-white rounded-[3rem] border border-black/10 p-10 lg:p-16 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
              <div className="mb-12 text-center lg:text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 px-1">Identity Verification</p>
                 <h2 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-[0.85]">
                   Nexus <span className="text-foreground/20 italic">Gate.</span>
                 </h2>
              </div>

              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600"
                    >
                      <ShieldAlert size={18} />
                      <p className="text-[11px] font-black uppercase tracking-wider">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={handleLinkedInLogin}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-6 rounded-3xl bg-white border border-black/5 text-[#0077B5] font-black uppercase text-[11px] tracking-[0.4em] shadow-xl shadow-black/5 hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group"
                >
                  <div className="p-2 bg-[#0077B5]/10 rounded-xl group-hover:bg-[#0077B5]/20 transition-colors">
                    <Linkedin size={20} fill="currentColor" />
                  </div>
                  Verify Identity via LinkedIn
                </motion.button>

                <div className="text-center px-4 lg:px-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/30 leading-relaxed max-w-xs mx-auto">
                     Professional verification required for all <span className="text-primary italic">ETIS Nexus</span> participants.
                   </p>
                </div>

                <div className="pt-8 border-t border-black/5 text-center">
                  <button 
                    onClick={() => navigate('/nexus-terminal')}
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/10 hover:text-primary transition-colors"
                  >
                    Institutional Terminal Access
                  </button>
                </div>
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-foreground/20 mt-10 text-[9px] font-black uppercase tracking-widest"
            >
              Institutional access only • Secure production node
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }
