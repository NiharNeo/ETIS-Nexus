import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { EventRegistration } from '../types';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Users,
  Activity,
  Camera,
  CameraOff,
  Search,
  Ticket,
  Zap,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type ScanStatus = 'idle' | 'success' | 'already_scanned' | 'invalid_event' | 'not_found' | 'invalid_format' | 'db_error';

interface ScanResult {
  status: ScanStatus;
  registration?: EventRegistration;
}

export default function QRScannerPage() {
  const { user } = useAuth();
  const { events, clubs, validateAndCheckIn, getRegistrations } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Access control
  const isAuthorized = user?.role === 'super_admin' || user?.role === 'club_rep';
  
  // Filter events by role
  const scanableEvents = events.filter((e) => {
    if (e.status !== 'approved') return false;
    if (user?.role === 'super_admin') return true;
    return user?.clubIds?.includes(e.clubId);
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(
    searchParams.get('eventId') || scanableEvents[0]?.id || ''
  );

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'etis-qr-reader';
  const lastScannedRef = useRef<string>('');
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/dashboard');
    }
  }, [isAuthorized, navigate]);

  // Load registrations when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    setLoadingRegs(true);
    getRegistrations(selectedEventId)
      .then((data) => setRegistrations(data))
      .finally(() => setLoadingRegs(false));
  }, [selectedEventId, getRegistrations]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const stopCamera = useCallback(async () => {
    try {
      if (qrScannerRef.current) {
        const state = qrScannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await qrScannerRef.current.stop();
        }
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      }
    } catch (_) { /* ignore cleanup errors */ }
    setIsCameraOn(false);
  }, []);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    // Debounce: ignore if same payload within 3s cooldown
    if (decodedText === lastScannedRef.current) return;
    lastScannedRef.current = decodedText;
    
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
    cooldownRef.current = setTimeout(() => { lastScannedRef.current = ''; }, 3000);

    if (!selectedEventId) return;

    const result = await validateAndCheckIn(decodedText, selectedEventId);
    
    setScanResult({ status: result.success ? 'success' : result.message as ScanStatus, registration: result.registration });
    
    // Update local registrations state
    if (result.success && result.registration) {
      setRegistrations((prev) =>
        prev.map((r) => r.id === result.registration!.id ? { ...r, status: 'checked_in', checkedIn: true } : r)
      );
    }

    // Auto-clear result after 5s
    setTimeout(() => setScanResult(null), 5000);
  }, [selectedEventId, validateAndCheckIn]);

  const startCamera = useCallback(async () => {
    if (!selectedEventId) {
      toast.error('Select an event first');
      return;
    }
    setIsStarting(true);
    setScanResult(null);
    
    try {
      const scanner = new Html5Qrcode(scannerDivId);
      qrScannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleScanSuccess,
        () => { /* ignore scan errors (frame noise) */ }
      );
      setIsCameraOn(true);
    } catch (err: any) {
      toast.error('Camera Access Denied', {
        description: 'Allow camera access to use QR scanner.',
      });
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  }, [selectedEventId, handleScanSuccess]);

  const handleToggleCamera = useCallback(async () => {
    if (isCameraOn) {
      await stopCamera();
    } else {
      await startCamera();
    }
  }, [isCameraOn, stopCamera, startCamera]);

  const handleEventChange = useCallback(async (eventId: string) => {
    if (isCameraOn) await stopCamera();
    setScanResult(null);
    setManualToken('');
    setSelectedEventId(eventId);
  }, [isCameraOn, stopCamera]);

  const handleManualValidate = useCallback(async () => {
    if (!manualToken.trim() || !selectedEventId) return;
    setIsValidating(true);
    const result = await validateAndCheckIn(manualToken.trim(), selectedEventId);
    setScanResult({ status: result.success ? 'success' : result.message as ScanStatus, registration: result.registration });
    if (result.success && result.registration) {
      setRegistrations((prev) =>
        prev.map((r) => r.id === result.registration!.id ? { ...r, status: 'checked_in', checkedIn: true } : r)
      );
    }
    setManualToken('');
    setTimeout(() => setScanResult(null), 5000);
    setIsValidating(false);
  }, [manualToken, selectedEventId, validateAndCheckIn]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedClub = selectedEvent ? clubs.find((c) => c.id === selectedEvent.clubId) : null;
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;

  const getResultConfig = (status: ScanStatus) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle2 size={40} className="text-emerald-400" />,
          label: 'Access Granted',
          color: 'border-emerald-500/30 bg-emerald-500/10',
          textColor: 'text-emerald-400',
          message: 'Attendance recorded successfully.',
        };
      case 'already_scanned':
        return {
          icon: <AlertTriangle size={40} className="text-amber-400" />,
          label: 'Already Validated',
          color: 'border-amber-500/30 bg-amber-500/10',
          textColor: 'text-amber-400',
          message: 'This ticket has already been scanned.',
        };
      case 'invalid_event':
        return {
          icon: <XCircle size={40} className="text-rose-400" />,
          label: 'Wrong Event',
          color: 'border-rose-500/30 bg-rose-500/10',
          textColor: 'text-rose-400',
          message: 'QR code belongs to a different event.',
        };
      case 'not_found':
        return {
          icon: <XCircle size={40} className="text-rose-400" />,
          label: 'Invalid Ticket',
          color: 'border-rose-500/30 bg-rose-500/10',
          textColor: 'text-rose-400',
          message: 'No matching registration found.',
        };
      case 'invalid_format':
        return {
          icon: <XCircle size={40} className="text-rose-400" />,
          label: 'Unrecognized QR',
          color: 'border-rose-500/30 bg-rose-500/10',
          textColor: 'text-rose-400',
          message: 'QR code is not an ETIS ticket.',
        };
      default:
        return {
          icon: <XCircle size={40} className="text-rose-400" />,
          label: 'System Error',
          color: 'border-rose-500/30 bg-rose-500/10',
          textColor: 'text-rose-400',
          message: 'A database error occurred. Please retry.',
        };
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
      >
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground/30 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[9px] group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return to Sector
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <ScanLine size={20} />
            </div>
            <div>
              <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
                Attendance Terminal
              </p>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-none">
                QR Scanner
              </h1>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-1 p-2 rounded-[2rem] bg-card/60 backdrop-blur-3xl border border-border/10 ring-1 ring-white/5">
          <div className="px-6 py-3 border-r border-border/10 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Registered</p>
            <p className="text-xl font-black text-foreground">{registrations.length}</p>
          </div>
          <div className="px-6 py-3 border-r border-border/10 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Checked In</p>
            <p className="text-xl font-black text-emerald-500">{checkedInCount}</p>
          </div>
          <div className="px-6 py-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Remaining</p>
            <p className="text-xl font-black text-primary">{registrations.length - checkedInCount}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Scanner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Event Selector */}
          <div className="p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 ring-1 ring-white/5 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Select Event to Scan For
            </p>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full appearance-none bg-sidebar/60 border border-border/10 rounded-2xl px-6 py-4 pr-12 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="">-- Select Event --</option>
                {scanableEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} {clubs.find((c) => c.id === e.clubId)?.name ? `· ${clubs.find((c) => c.id === e.clubId)?.name}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
            </div>
            {selectedEvent && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-sidebar/50 border border-border/5">
                <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-xl border border-border/10">
                  {selectedClub?.logo || '🏛️'}
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">{selectedEvent.title}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    {format(new Date(selectedEvent.date), 'MMM d, yyyy')} · {selectedEvent.venue}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Scanner */}
          <div className="rounded-[2.5rem] bg-card/60 backdrop-blur-3xl border border-border/10 ring-1 ring-white/5 overflow-hidden">
            {/* Scanner viewport */}
            <div className="relative min-h-[300px] bg-black/40 flex items-center justify-center">
              <div id={scannerDivId} className="w-full" />

              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center p-8">
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Camera size={36} className="text-primary/60" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground/60 font-black uppercase tracking-[0.3em] text-[10px]">
                      Camera Offline
                    </p>
                    <p className="text-muted-foreground/30 text-sm font-medium">
                      Activate the scanner to begin reading QR tickets.
                    </p>
                  </div>
                </div>
              )}

              {/* Scan overlay grid */}
              {isCameraOn && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-60 h-60 relative">
                    {/* Corner markers */}
                    {[
                      'top-0 left-0 border-t-2 border-l-2',
                      'top-0 right-0 border-t-2 border-r-2',
                      'bottom-0 left-0 border-b-2 border-l-2',
                      'bottom-0 right-0 border-b-2 border-r-2',
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-8 h-8 border-primary ${cls}`} />
                    ))}
                    {/* Scan line animation */}
                    <motion.div
                      animate={{ y: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-primary/70 shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="p-6 space-y-4">
              <button
                onClick={handleToggleCamera}
                disabled={isStarting || !selectedEventId}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  isCameraOn
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                    : 'bg-primary text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {isStarting ? (
                  <><Zap size={16} className="animate-pulse" /> Initializing Camera...</>
                ) : isCameraOn ? (
                  <><CameraOff size={16} /> Stop Scanner</>
                ) : (
                  <><Camera size={16} /> Activate QR Scanner</>
                )}
              </button>

              {/* Scan Result Overlay */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className={`p-6 rounded-[2rem] border ${getResultConfig(scanResult.status).color} flex items-start gap-5`}
                  >
                    <div className="flex-shrink-0">{getResultConfig(scanResult.status).icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black uppercase tracking-[0.2em] ${getResultConfig(scanResult.status).textColor}`}>
                        {getResultConfig(scanResult.status).label}
                      </p>
                      <p className="text-muted-foreground/60 text-xs font-medium mt-1">
                        {getResultConfig(scanResult.status).message}
                      </p>
                      {scanResult.registration && (
                        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-sm font-black text-foreground">{scanResult.registration.userName}</p>
                          <p className="text-xs text-muted-foreground/50">{scanResult.registration.userEmail}</p>
                          {scanResult.registration.userDepartment && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 border border-white/5">
                              {scanResult.registration.userDepartment}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Manual Token Input */}
          <div className="p-6 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border/10 ring-1 ring-white/5 space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Manual Token Override (Fallback)
            </p>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-3 bg-sidebar/60 border border-border/10 rounded-2xl px-5 py-3.5">
                <Ticket size={16} className="text-primary/40 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Paste ticket ID or QR payload..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualValidate()}
                  className="flex-1 bg-transparent border-none text-sm font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              <button
                onClick={handleManualValidate}
                disabled={isValidating || !manualToken.trim() || !selectedEventId}
                className="px-6 py-3.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isValidating ? <Zap size={14} className="animate-pulse" /> : 'Validate'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Registrations List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Registrant Roster
            </p>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground/40">Live</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
            {loadingRegs ? (
              <div className="text-center py-12">
                <Zap size={20} className="mx-auto text-primary animate-pulse mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                  Syncing roster...
                </p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 rounded-[2rem] bg-card/30 border border-border/5">
                <Users size={24} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                  No registrants yet.
                </p>
              </div>
            ) : (
              registrations.map((reg) => (
                <div
                  key={reg.id}
                  className={`flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all ${
                    reg.checkedIn
                      ? 'bg-emerald-500/[0.03] border-emerald-500/20'
                      : 'bg-card/40 border-border/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    reg.checkedIn ? 'bg-emerald-500/10' : 'bg-primary/10'
                  }`}>
                    {reg.checkedIn
                      ? <ShieldCheck size={14} className="text-emerald-500" />
                      : <Activity size={14} className="text-primary/60" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate">{reg.userName || 'Unknown'}</p>
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest truncate">
                      {reg.userDepartment || reg.userEmail || '—'}
                    </p>
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg ${
                    reg.checkedIn
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : 'text-muted-foreground/40 bg-white/5'
                  }`}>
                    {reg.checkedIn ? 'In' : 'Reg'}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Progress Bar */}
          {registrations.length > 0 && (
            <div className="p-5 rounded-[2rem] bg-card/40 border border-border/10 space-y-3">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                <span>Attendance Progress</span>
                <span className="text-foreground">{Math.round((checkedInCount / registrations.length) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  animate={{ width: `${(checkedInCount / registrations.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-medium">
                {checkedInCount} of {registrations.length} registrants have been verified.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
