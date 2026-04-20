import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { GraduationCap, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, Zap, Sparkles, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const DEMO_ACCOUNTS = [
  { email: 'admin@university.edu', password: 'admin123', role: 'Super Admin', color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10' },
  { email: 'priya.mehta@university.edu', password: 'rep123', role: 'Club Rep', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
  { email: 'vikram.singh@university.edu', password: 'rep123', role: 'Club Rep', color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/10' },
  { email: 'aisha.khan@university.edu', password: 'student123', role: 'Student', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
];

export default function LoginPage() {
  const { login, registerUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  if (authLoading) {
    return null; // Let AppLayout handle the loading screen if needed, or just stay blank briefly
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (isRegistering && !name)) {
      setError('Protocol mismatch: credentials required.');
      return;
    }
    setLoading(true);
    let result;
    if (isRegistering) {
      result = await registerUser({ name, email, password, department });
    } else {
      // Direct role mapping for demo accounts to ensure standard roles
      const demo = DEMO_ACCOUNTS.find(a => a.email === email);
      const roleToUse = demo ? (demo.email === 'admin@university.edu' ? 'super_admin' : demo.email.includes('rep') ? 'club_rep' : 'student') : 'student';
      result = await login(email, password);
    }
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message ?? 'Authentication rejected.');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  const fillDemo = (demo: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background selection:bg-primary/30">
      {/* Cinematic Left Dimension — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-primary/20" />
        
        {/* Animated Grid Decoration */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col justify-between p-20 text-white w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl flex items-center justify-center border border-white/10 shadow-2xl ring-1 ring-white/10">
              <GraduationCap size={30} className="text-primary" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tighter leading-none mb-1">ETIS <span className="text-primary italic">Nexus</span>.</p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Next-Gen Governance</p>
            </div>
          </motion.div>

          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                The Nexus of <br />
                <span className="text-muted-foreground/30 italic">Campus Confluence.</span>
              </h1>

            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-8"
            >
              {[
                { label: 'Live Confluences', value: '24', icon: <Activity size={18} /> },
                { label: 'Verified Sectors', value: '12', icon: <ShieldCheck size={18} /> },
              ].map((stat, i) => (
                <div key={i} className="space-y-2 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                   <div className="text-primary mb-2">{stat.icon}</div>
                   <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20"
          >
            <span>v4.2.0-STABLE</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>SECURE TUNNEL ACTIVE</span>
          </motion.div>
        </div>
      </div>

      {/* High-Fidelity Entrance Portal — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-card/20 relative overflow-hidden">
        {/* Mobile-only Background Mesh */}
        <div className="absolute inset-0 lg:hidden opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-4 mb-12 lg:hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter">ETIS <span className="text-primary italic">Nexus</span>.</p>
              <p className="text-muted-foreground/30 font-black uppercase tracking-widest text-[9px]">Governance Portal</p>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-3xl rounded-[3.5rem] border border-border/10 p-12 lg:p-16 shadow-3xl ring-1 ring-white/5">
            <div className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.4)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">University Authentication</p>
               </div>
               <h2 className="text-4xl lg:text-5xl font-black text-black tracking-tighter leading-none">
                 {isRegistering ? 'Register' : 'Sign In'} <br />
                 <span className="text-black/10 italic">{isRegistering ? 'Student Identity.' : 'Campus Access.'}</span>
               </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-4 p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-500"
                  >
                    <ShieldAlert size={20} />
                    <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                {isRegistering && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 px-2">
                       Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="relative z-10 w-full px-8 py-5 bg-zinc-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 text-sm font-bold tracking-tight text-black placeholder-black/10 transition-all shadow-inner"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 px-2">
                    University Email
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="relative z-10 w-full px-8 py-5 bg-zinc-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 text-sm font-bold tracking-tight text-black placeholder-black/10 transition-all shadow-inner"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 px-2">
                      Department
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Computer Science"
                        className="relative z-10 w-full px-8 py-5 bg-zinc-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 text-sm font-bold tracking-tight text-black placeholder-black/10 transition-all shadow-inner"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 px-2">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="relative z-10 w-full px-8 py-5 bg-zinc-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 text-sm font-bold tracking-tight text-black placeholder-black/10 transition-all shadow-inner"
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-6 top-1/2 z-20 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 rounded-[2rem] bg-black text-white font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:bg-zinc-800 transition-all disabled:opacity-50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Checking Credentials...
                    </>
                   ) : (
                    <>
                       <LogIn size={18} /> {isRegistering ? 'Create Account' : 'Sign In Now'}
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={toggleMode}
                className="text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
              >
                {isRegistering ? 'Already have an account? Sign In.' : 'New here? Register your student ID.'}
              </button>
            </div>

            {/* Tactical Demo Tunnels */}
            <div className="mt-16 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="flex-1 h-px bg-border/5" />
                 <p className="text-center text-muted-foreground/20 text-[9px] font-black uppercase tracking-[0.4em]">
                   Simulated Access Nodes
                 </p>
                 <div className="flex-1 h-px bg-border/5" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEMO_ACCOUNTS.map((demo) => (
                  <motion.button
                    key={demo.email}
                    onClick={() => fillDemo(demo)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-start p-5 rounded-3xl border ${demo.border} ${demo.bg} hover:bg-sidebar transition-all group overflow-hidden relative`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                       <Sparkles size={40} className={demo.color} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground truncate w-full text-left mb-1">
                      {demo.email}
                    </p>
                    <div className="flex items-center justify-between w-full">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-20 group-hover:opacity-40 transition-opacity">Key: {demo.password}</p>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${demo.color} p-1.5 rounded-lg bg-white/5 border border-white/5`}>
                         {demo.role}
                       </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-muted-foreground/30 mt-10 text-[10px] font-black uppercase tracking-widest leading-none"
          >
            Tactical student audit node active • Unauthorized access prohibited
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
