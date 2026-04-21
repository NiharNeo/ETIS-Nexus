import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { EventRegistration } from '../types';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  Users, Camera, CameraOff, Search, Ticket, Zap, Download,
  ShieldCheck, Activity, Clock, Filter, RefreshCw, BarChart2,
  UserCheck, UserX, CalendarDays, MapPin, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ClubLogo } from '../components/clubs/ClubLogo';

type ScanStatus = 'idle' | 'success' | 'already_scanned' | 'invalid_event' | 'not_found' | 'invalid_format' | 'db_error';
interface ScanFeedback { status: ScanStatus; registration?: EventRegistration; }

export default function EventAttendancePage() {
  const { user } = useAuth();
  const { events, clubs, validateAndCheckIn, getRegistrations, checkInStudent, deleteRegistration } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAuthorized = user?.role === 'super_admin' || user?.role === 'club_rep';

  // Build list of events this user can manage
  const userClubIds = clubs.filter(c => c.repIds?.includes(user?.id ?? '')).map(c => c.id);
  const manageableEvents = events.filter(e => {
    if (e.status !== 'approved') return false;
    if (user?.role === 'super_admin') return true;
    return userClubIds.includes(e.clubId);
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(
    searchParams.get('eventId') || manageableEvents[0]?.id || ''
  );
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'registered' | 'checked_in'>('all');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [checkingInRow, setCheckingInRow] = useState<string | null>(null);
  const [deletingRow, setDeletingRow] = useState<string | null>(null);

  const qrRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef('');
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scannerDivId = 'attendance-qr-reader';

  useEffect(() => { if (!isAuthorized) navigate('/dashboard'); }, [isAuthorized, navigate]);

  const loadRegistrations = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoadingRegs(true);
    try {
      const data = await getRegistrations(eventId);
      setRegistrations(data);
    } finally {
      setLoadingRegs(false);
    }
  }, [getRegistrations]);

  useEffect(() => { loadRegistrations(selectedEventId); }, [selectedEventId, loadRegistrations]);

  useEffect(() => () => { stopCamera(); if (cooldownRef.current) clearTimeout(cooldownRef.current); }, []);

  const stopCamera = useCallback(async () => {
    try {
      if (qrRef.current) {
        const state = qrRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await qrRef.current.stop();
        }
        qrRef.current.clear();
        qrRef.current = null;
      }
    } catch (_) {}
    setIsCameraOn(false);
  }, []);

  const onScanSuccess = useCallback(async (text: string) => {
    if (text === lastScannedRef.current) return;
    lastScannedRef.current = text;
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
    cooldownRef.current = setTimeout(() => { lastScannedRef.current = ''; }, 3000);
    if (!selectedEventId) return;
    const result = await validateAndCheckIn(text, selectedEventId);
    setScanFeedback({ status: result.success ? 'success' : result.message as ScanStatus, registration: result.registration });
    if (result.success && result.registration) {
      setRegistrations(prev => prev.map(r => r.id === result.registration!.id ? { ...r, checkedIn: true, status: 'checked_in' } : r));
    }
    setTimeout(() => setScanFeedback(null), 4000);
  }, [selectedEventId, validateAndCheckIn]);

  const startCamera = useCallback(async () => {
    if (!selectedEventId) { toast.error('Select an event first'); return; }
    setIsStarting(true);
    setScanFeedback(null);
    try {
      const scanner = new Html5Qrcode(scannerDivId);
      qrRef.current = scanner;
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 220 } }, onScanSuccess, () => {});
      setIsCameraOn(true);
    } catch {
      toast.error('Camera Access Denied', { description: 'Allow camera permissions to scan QR codes.' });
    } finally {
      setIsStarting(false);
    }
  }, [selectedEventId, onScanSuccess]);

  const handleEventChange = useCallback(async (id: string) => {
    if (isCameraOn) await stopCamera();
    setScanFeedback(null);
    setManualToken('');
    setSearchQuery('');
    setSelectedEventId(id);
  }, [isCameraOn, stopCamera]);

  const handleManualValidate = useCallback(async () => {
    if (!manualToken.trim() || !selectedEventId) return;
    setIsValidating(true);
    const result = await validateAndCheckIn(manualToken.trim(), selectedEventId);
    setScanFeedback({ status: result.success ? 'success' : result.message as ScanStatus, registration: result.registration });
    if (result.success && result.registration) {
      setRegistrations(prev => prev.map(r => r.id === result.registration!.id ? { ...r, checkedIn: true, status: 'checked_in' } : r));
    }
    setManualToken('');
    setTimeout(() => setScanFeedback(null), 4000);
    setIsValidating(false);
  }, [manualToken, selectedEventId, validateAndCheckIn]);

  const handleRowCheckIn = useCallback(async (reg: EventRegistration) => {
    if (reg.checkedIn || !selectedEventId) return;
    setCheckingInRow(reg.id);
    const ok = await checkInStudent(reg.id, selectedEventId);
    if (ok) {
      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, checkedIn: true, status: 'checked_in' } : r));
      toast.success(`${reg.userName} checked in ✓`);
    } else {
      toast.error('Check-in failed. Try again.');
    }
    setCheckingInRow(null);
  }, [selectedEventId, checkInStudent]);

  const handleDeleteRegistration = useCallback(async (reg: EventRegistration) => {
    if (!confirm(`Remove ${reg.userName || 'this attendee'}'s registration? This cannot be undone.`)) return;
    setDeletingRow(reg.id);
    const ok = await deleteRegistration(reg.id);
    if (ok) {
      setRegistrations(prev => prev.filter(r => r.id !== reg.id));
      toast.success('Registration removed', { description: `${reg.userName || 'Attendee'} has been unregistered.` });
    } else {
      toast.error('Failed to remove registration.');
    }
    setDeletingRow(null);
  }, [deleteRegistration]);

  const exportCSV = useCallback(() => {
    const ev = events.find(e => e.id === selectedEventId);
    const rows = [
      ['#', 'Name', 'Email', 'SRN', 'Year', 'Department', 'Status', 'Registered At', 'Ticket ID'],
      ...registrations.map((r, i) => [
        i + 1,
        r.userName || 'Unknown',
        r.userEmail || '—',
        r.userSrn || '—',
        r.userYear || '—',
        r.userDepartment || '—',
        r.checkedIn ? 'Checked In' : 'Registered',
        format(new Date(r.registeredAt), 'yyyy-MM-dd HH:mm'),
        r.qrCodeId || '—'
      ])
    ];
    const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${ev?.title?.replace(/\s+/g, '-') || selectedEventId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV Exported', { description: `${registrations.length} records downloaded.` });
  }, [registrations, selectedEventId, events]);

  // Filtered list
  const filtered = registrations.filter(r => {
    const matchSearch = !searchQuery ||
      r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userSrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userDepartment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' ||
      (filterStatus === 'checked_in' && r.checkedIn) ||
      (filterStatus === 'registered' && !r.checkedIn);
    return matchSearch && matchFilter;
  });

  const checkedCount = registrations.filter(r => r.checkedIn).length;
  const rate = registrations.length > 0 ? Math.round((checkedCount / registrations.length) * 100) : 0;
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedClub = selectedEvent ? clubs.find(c => c.id === selectedEvent.clubId) : null;

  const feedbackConfig = (s: ScanStatus) => ({
    success: { icon: <CheckCircle2 size={22} className="text-emerald-400" />, label: 'Access Granted', color: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-400' },
    already_scanned: { icon: <AlertTriangle size={22} className="text-amber-400" />, label: 'Already Verified', color: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-400' },
    invalid_event: { icon: <XCircle size={22} className="text-rose-400" />, label: 'Wrong Event', color: 'border-rose-500/30 bg-rose-500/10', text: 'text-rose-400' },
    not_found: { icon: <XCircle size={22} className="text-rose-400" />, label: 'Ticket Not Found', color: 'border-rose-500/30 bg-rose-500/10', text: 'text-rose-400' },
    invalid_format: { icon: <XCircle size={22} className="text-rose-400" />, label: 'Invalid QR', color: 'border-rose-500/30 bg-rose-500/10', text: 'text-rose-400' },
    db_error: { icon: <XCircle size={22} className="text-rose-400" />, label: 'System Error', color: 'border-rose-500/30 bg-rose-500/10', text: 'text-rose-400' },
    idle: { icon: null, label: '', color: '', text: '' },
  }[s]);

  if (!isAuthorized) return null;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <UserCheck size={16} />
            </div>
            <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Attendance Command Centre</p>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-none">Event Hub</h1>
          <p className="text-muted-foreground/50 text-sm font-medium">Scan tickets, manage registrants, and export attendance data.</p>
        </div>

        {/* Event Selector */}
        <div className="flex items-center gap-4">
          <div className="relative min-w-[280px]">
            <select
              value={selectedEventId}
              onChange={e => handleEventChange(e.target.value)}
              className="w-full appearance-none bg-card/60 backdrop-blur-xl border border-border/10 rounded-2xl px-5 py-3.5 pr-10 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="">— Select Event —</option>
              {manageableEvents.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
          </div>
          <button
            onClick={() => loadRegistrations(selectedEventId)}
            disabled={!selectedEventId || loadingRegs}
            className="p-3.5 rounded-2xl bg-card/60 border border-border/10 text-muted-foreground/40 hover:text-primary transition-all disabled:opacity-30"
            title="Refresh"
          >
            <RefreshCw size={16} className={loadingRegs ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* ── STATS BAR ── */}
      {selectedEventId && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {[
            { label: 'Total Registered', value: registrations.length, icon: <Users size={16} />, color: 'text-foreground' },
            { label: 'Checked In', value: checkedCount, icon: <CheckCircle2 size={16} />, color: 'text-emerald-500' },
            { label: 'Remaining', value: registrations.length - checkedCount, icon: <Clock size={16} />, color: 'text-primary' },
            { label: 'Attendance Rate', value: `${rate}%`, icon: <BarChart2 size={16} />, color: rate >= 75 ? 'text-emerald-500' : rate >= 40 ? 'text-amber-500' : 'text-rose-500' },
            { label: 'Event', value: selectedEvent?.title?.split(' ').slice(0, 3).join(' ') || '—', icon: <CalendarDays size={16} />, color: 'text-foreground/60' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border/10 ring-1 ring-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{stat.label}</p>
                <span className={`opacity-40 ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className={`text-2xl font-black tracking-tighter leading-none ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── PROGRESS BAR ── */}
      {registrations.length > 0 && (
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            animate={{ width: `${rate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-blue-500 to-emerald-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
          />
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

        {/* LEFT: QR SCANNER PANEL */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">

          {/* Camera Box */}
          <div className="rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border/10 ring-1 ring-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <ScanLine size={16} className="text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">QR Scanner</p>
              </div>
              {isCameraOn && (
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {/* Camera View */}
            <div className="relative min-h-[260px] bg-black/40 flex items-center justify-center mx-4 rounded-[2rem] overflow-hidden mb-4">
              <div id={scannerDivId} className="w-full" />
              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Camera size={28} className="text-primary/50" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Camera Offline</p>
                </div>
              )}
              {isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 relative">
                    {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c, i) => (
                      <div key={i} className={`absolute w-6 h-6 border-primary ${c}`} />
                    ))}
                    <motion.div
                      animate={{ y: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-5 space-y-3">
              <button
                onClick={isCameraOn ? stopCamera : startCamera}
                disabled={isStarting || !selectedEventId}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  isCameraOn
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white'
                    : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40'
                }`}
              >
                {isStarting ? <><Zap size={14} className="animate-pulse" /> Initializing...</>
                  : isCameraOn ? <><CameraOff size={14} /> Stop Scanner</>
                  : <><Camera size={14} /> Activate Scanner</>}
              </button>

              {/* Scan Feedback */}
              <AnimatePresence>
                {scanFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border ${feedbackConfig(scanFeedback.status).color} flex items-start gap-3`}
                  >
                    {feedbackConfig(scanFeedback.status).icon}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black uppercase tracking-[0.15em] ${feedbackConfig(scanFeedback.status).text}`}>
                        {feedbackConfig(scanFeedback.status).label}
                      </p>
                      {scanFeedback.registration && (
                        <p className="text-xs font-bold text-foreground/70 mt-1 truncate">{scanFeedback.registration.userName}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Manual Token */}
          <div className="p-5 rounded-[2.5rem] bg-card/40 border border-border/10 ring-1 ring-white/5 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Manual Token / Ticket ID</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-sidebar/60 border border-border/10 rounded-xl px-4 py-3">
                <Ticket size={14} className="text-primary/40 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Paste token or QR payload..."
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualValidate()}
                  className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/20"
                />
              </div>
              <button
                onClick={handleManualValidate}
                disabled={isValidating || !manualToken.trim() || !selectedEventId}
                className="px-4 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
              >
                {isValidating ? <Zap size={12} className="animate-pulse" /> : 'Validate'}
              </button>
            </div>
          </div>

          {/* Event Info Card */}
          {selectedEvent && (
            <div className="p-5 rounded-[2.5rem] bg-card/30 border border-border/5 space-y-3">
              <div className="flex items-center gap-3">
                   <ClubLogo logo={selectedClub?.logo} name={selectedClub?.name || ''} size="md" />
                <div>
                  <p className="text-sm font-black text-foreground">{selectedEvent.title}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{selectedClub?.name}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <CalendarDays size={11} /> {format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                </span>
                {selectedEvent.venue && (
                  <span className="flex items-center gap-2">
                    <MapPin size={11} /> {selectedEvent.venue}
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT: DATA TABLE */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border/10 ring-1 ring-white/5 flex flex-col overflow-hidden"
        >
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-border/10">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-sidebar/60 border border-border/10 rounded-xl px-4 py-2.5 flex-1 max-w-xs">
                <Search size={14} className="text-muted-foreground/30 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search name, email, department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/20"
                />
              </div>
              {/* Status filter pills */}
              <div className="flex items-center gap-1.5">
                {(['all', 'registered', 'checked_in'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                      filterStatus === f
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white/5 text-muted-foreground/40 hover:text-foreground border border-border/10'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'checked_in' ? 'In ✓' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                {filtered.length} / {registrations.length}
              </p>
              <button
                onClick={exportCSV}
                disabled={registrations.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card/80 backdrop-blur-xl border-b border-border/10 z-10">
                <tr>
                  {['#', 'Attendee', 'SRN', 'Dept', 'Registered', 'Status', 'Action', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingRegs ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Zap size={20} className="mx-auto text-primary animate-pulse mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Syncing roster...</p>
                    </td>
                  </tr>
                ) : !selectedEventId ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Users size={28} className="mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">Select an event to view registrants</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <UserX size={28} className="mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">No registrants match filter</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg, i) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-border/5 transition-colors ${
                        reg.checkedIn ? 'bg-emerald-500/[0.02]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* # */}
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-black text-muted-foreground/30">{i + 1}</span>
                      </td>

                      {/* Attendee */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-black text-sm text-foreground">{reg.userName || 'Unknown'}</p>
                          <p className="text-[10px] text-muted-foreground/40 font-medium">{reg.userEmail || '—'}</p>
                        </div>
                      </td>

                      {/* SRN */}
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-black text-foreground tracking-widest uppercase">
                          {reg.userSrn || '—'}
                        </span>
                      </td>

                      {/* Dept */}
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          reg.userDepartment
                            ? 'bg-primary/5 text-primary/60 border-primary/10'
                            : 'bg-white/5 text-muted-foreground/30 border-border/5'
                        }`}>
                          {reg.userDepartment || 'N/A'}
                        </span>
                      </td>

                      {/* Registered At */}
                      <td className="px-5 py-4">
                        <p className="text-[11px] font-bold text-muted-foreground/40">
                          {format(new Date(reg.registeredAt), 'MMM d, HH:mm')}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {reg.checkedIn ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest w-fit">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary/60 border border-primary/20 text-[9px] font-black uppercase tracking-widest w-fit">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {!reg.checkedIn ? (
                            <button
                              onClick={() => handleRowCheckIn(reg)}
                              disabled={checkingInRow === reg.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              {checkingInRow === reg.id
                                ? <Zap size={11} className="animate-pulse" />
                                : <UserCheck size={11} />}
                              {checkingInRow === reg.id ? 'Checking...' : 'Check In'}
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">—</span>
                          )}
                          {user?.role === 'super_admin' && (
                            <button
                              onClick={() => handleDeleteRegistration(reg)}
                              disabled={deletingRow === reg.id}
                              title="Remove registration"
                              className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-40"
                            >
                              {deletingRow === reg.id
                                ? <Zap size={11} className="animate-pulse" />
                                : <Trash2 size={11} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {registrations.length > 0 && (
            <div className="px-6 py-4 border-t border-border/10 flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground/30">
                Showing {filtered.length} of {registrations.length} registrants
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500/40" /> {checkedCount} verified
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-primary/30" /> {registrations.length - checkedCount} pending
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
