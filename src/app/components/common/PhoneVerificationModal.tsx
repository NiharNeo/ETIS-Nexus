import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ShieldCheck, X, Zap, RefreshCw, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  /** Pre-filled phone if already stored */
  existingPhone?: string;
}

export function PhoneVerificationModal({ open, onClose, onVerified, existingPhone }: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(existingPhone?.replace('+91', '') || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('phone');
        setOtp(['', '', '', '', '', '']);
        setSending(false);
        setVerifying(false);
      }, 300);
    }
  }, [open]);

  const fullPhone = `+91${phone.replace(/\D/g, '')}`;

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: fullPhone }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setStep('otp');
      setResendCooldown(30);
      toast.success('OTP Sent', { description: `Verification code sent to +91 ${phone}` });
    } catch (err: any) {
      toast.error('Failed to send OTP', { description: err.message });
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = otp.join('');
    if (token.length !== 6) {
      toast.error('Enter the complete 6-digit code.');
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: fullPhone, otp: token }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Phone Verified!', {
        description: 'Your number is now linked to your account.',
        icon: <ShieldCheck className="text-emerald-500" size={16} />,
      });
      onVerified();
      onClose();
    } catch (err: any) {
      toast.error('Invalid OTP', { description: err.message || 'The code you entered is incorrect.' });
    } finally {
      setVerifying(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-sm bg-card border border-border/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Top accent strip */}
          <div className="absolute top-0 inset-x-0 h-1 bg-primary" />

          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Smartphone size={15} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Phone Verification</p>
                </div>
                <h3 className="text-xl font-black tracking-tighter text-foreground">
                  {step === 'phone' ? 'Verify Your Number' : 'Enter OTP Code'}
                </h3>
                <p className="text-[11px] text-muted-foreground/50 font-medium leading-relaxed">
                  {step === 'phone'
                    ? 'A 6-digit code will be sent to your mobile number to confirm your identity.'
                    : `Code sent to +91 ${phone}. Check your messages.`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Step: Phone Input */}
            {step === 'phone' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-3.5 bg-muted/30 border border-border/10 rounded-2xl focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <div className="flex items-center gap-1.5 text-foreground font-black text-sm border-r border-border/20 pr-3 flex-shrink-0">
                    <Phone size={13} className="text-primary/60" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30 tracking-wider"
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={sending || phone.replace(/\D/g, '').length !== 10}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
                >
                  {sending ? <><Zap size={13} className="animate-pulse" /> Sending...</> : <><Smartphone size={13} /> Send OTP</>}
                </button>
              </div>
            )}

            {/* Step: OTP Input */}
            {step === 'otp' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-lg font-black bg-muted/30 border border-border/10 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                      style={{ height: '3.25rem' }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={verifying || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
                >
                  {verifying ? <><Zap size={13} className="animate-pulse" /> Verifying...</> : <><ShieldCheck size={13} /> Confirm Identity</>}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    ← Change Number
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={resendCooldown > 0 || sending}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary disabled:opacity-30 transition-colors"
                  >
                    <RefreshCw size={10} className={sending ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
