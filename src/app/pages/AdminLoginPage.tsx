import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Terminal, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    setError('');
    if (!email || !password) {
      setError('Credentials required for institutional control.');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message ?? 'Access Denied: Invalid Administrative Credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] selection:bg-primary/20 p-6 relative overflow-hidden">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 lg:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
          <div className="mb-12 text-center">
             <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mx-auto mb-6">
                <Terminal size={24} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Institutional Terminal</p>
             <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">
               Nexus Command Centre
             </h2>
             <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest italic">
               Administrative Access Only
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500"
                >
                  <ShieldAlert size={18} />
                  <p className="text-[11px] font-black uppercase tracking-wider">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">
                  Admin Identity
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexus.edu"
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold text-white transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">
                  Secure Passcode
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold text-white transition-all placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} /> Authenticate Session
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
               Secure Auth Node • v4.2.0-STABLE
            </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
          >
            ← Return to Public Portal
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
