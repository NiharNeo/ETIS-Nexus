import { useNavigate } from 'react-router';
import { GraduationCap, Home, ArrowLeft, ShieldAlert, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden selection:bg-primary/30">
      {/* Background Dimensionality */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full animate-pulse-slow" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl relative z-10"
      >
        <motion.div 
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-24 h-24 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-3xl ring-1 ring-white/10"
        >
          <GraduationCap size={48} className="text-primary" />
        </motion.div>

        <div className="relative mb-8">
           <h1 className="text-[120px] lg:text-[180px] font-black text-white leading-none tracking-tighter opacity-10 select-none">
             404
           </h1>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-2">
                Null <span className="text-muted-foreground/30 italic">Protocol.</span>
              </h2>
              <div className="flex items-center gap-3">
                 <ShieldAlert size={14} className="text-rose-500" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60">Operational Termination: Sector Not Found</p>
              </div>
           </div>
        </div>

        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md mx-auto mb-12">
          The requested temporal coordinate does not exist in the institutional nexus. 
          Return to mission control or recalibrate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all shadow-xl"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Recalibrate
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:bg-primary/90 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Home size={16} className="relative z-10" /> <span className="relative z-10">Mission Control</span>
          </motion.button>
        </div>

        {/* Tactical Footer */}
        <div className="mt-20 flex items-center justify-center gap-6 opacity-20 text-[9px] font-black uppercase tracking-[0.4em] text-white">
           <Zap size={12} />
           <span>System Status: Core Functional</span>
           <div className="w-1 h-1 rounded-full bg-white" />
           <span>ID: 0x404_NULL</span>
        </div>
      </motion.div>
    </div>
  );
}
