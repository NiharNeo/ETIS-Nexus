import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Award, Calendar, 
  MapPin, User, GraduationCap, 
  CheckCircle2, SearchX, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

export default function VerifyCertificatePage() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!hash) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('verification_hash', hash)
          .single();

        if (error) throw error;
        setCert(data);
      } catch (err) {
        console.error('Verification failed:', err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
          Authenticating Credential...
        </p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500 mb-8">
          <SearchX size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-2">Invalid Credential</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
          This certificate identifier could not be verified in the ETIS Nexus Secure Ledger.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
        >
          <ArrowLeft size={14} /> Back to Nexus
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white rounded-[3rem] border border-emerald-500/20 p-10 lg:p-16 shadow-[0_40px_100px_-20px_rgba(16,185,129,0.15)] text-center">
          
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <ShieldCheck size={48} />
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-12">
            <p className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Credential Authenticity: Verified</p>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-[0.85]">
              Certificate of <br />
              <span className="text-emerald-500/20 italic text-6xl">Validation.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-y border-black/5 py-12 mb-12">
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <User size={10} /> Certified Recipient
                </div>
                <p className="text-lg font-black text-foreground">{cert.student_name}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <GraduationCap size={10} /> Department / Branch
                </div>
                <p className="text-sm font-bold text-foreground/70">{cert.department || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <Award size={10} /> Validated Achievement
                </div>
                <p className="text-lg font-black text-foreground line-clamp-2">{cert.event_title}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <Calendar size={10} /> Validation Date
                </div>
                <p className="text-sm font-bold text-foreground/70">{format(new Date(cert.issued_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
               <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-tight">Institutional Signature Match</p>
              <p className="text-[10px] font-medium text-emerald-600/70">Verified by ETIS Nexus Governance Sector via Blockchain-inspired hashing.</p>
            </div>
          </div>

          <p className="mt-12 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/10 italic">
            Permanent Identity Ledger ID: {cert.verification_hash.slice(0, 16)}...
          </p>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-10 mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-all"
        >
          Explore ETIS Nexus Ecosystem <ArrowLeft size={14} className="rotate-180" />
        </button>
      </motion.div>
    </div>
  );
}
