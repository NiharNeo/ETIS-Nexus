
  import { useState } from 'react';
  import { useNavigate, Navigate } from 'react-router';
  import { GraduationCap, Eye, EyeOff, LogIn, ShieldAlert, Linkedin } from 'lucide-react';
  import { useAuth } from '../context/AuthContext';
  import { motion, AnimatePresence } from 'motion/react';

  export default function LoginPage() {
    const { login, registerUser, isAuthenticated, loading: authLoading, signInWithLinkedIn } = useAuth();
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
      return null;
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!email || !password || (isRegistering && !name)) {
        setError('Credentials required for institutional access.');
        return;
      }
      setLoading(true);
      let result;
      if (isRegistering) {
        result = await registerUser({ name, email, password, department });
      } else {
        result = await login(email, password);
      }
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message ?? 'Authentication rejected.');
      }
    };

    const handleLinkedInLogin = async () => {
      setError('');
      try {
        await signInWithLinkedIn();
      } catch (err: any) {
        setError(err.message || 'LinkedIn authentication failed.');
      }
    };

    const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
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

            <div className="bg-white rounded-[3rem] border border-black/5 p-8 lg:p-14 shadow-2xl shadow-black/5">
              <div className="mb-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Portal Authentication</p>
                 <h2 className="text-4xl font-black text-foreground tracking-tighter leading-none">
                   {isRegistering ? 'Create Account' : 'Welcome Back'} <br />
                   <span className="text-foreground/10 italic">{isRegistering ? 'Student Identity.' : 'Sign In.'}</span>
                 </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="space-y-5">
                  {isRegistering && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                         Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-6 py-4 bg-slate-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold text-foreground transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full px-6 py-4 bg-slate-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold text-foreground transition-all"
                    />
                  </div>

                  {isRegistering && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full px-6 py-4 bg-slate-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold text-foreground transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-6 py-4 bg-slate-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold text-foreground transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
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
                  className="w-full py-5 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={16} /> {isRegistering ? 'Create Identity' : 'Sign In to Portal'}
                    </>
                  )}
                </motion.button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/5"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
                  <span className="bg-white px-4 text-foreground/20">Identity Gateway</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleLinkedInLogin}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-2xl bg-white border border-black/5 text-[#0077B5] font-black uppercase text-[10px] tracking-[0.3em] shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <Linkedin size={16} fill="currentColor" /> Continue with LinkedIn
              </motion.button>


              <div className="mt-8 text-center">
                <button 
                  onClick={toggleMode}
                  className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors"
                >
                  {isRegistering ? 'Already registered? Sign In' : 'New student? Create an account'}
                </button>
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
