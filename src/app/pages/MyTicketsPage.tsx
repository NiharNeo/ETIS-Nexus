import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { EventRegistration } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { ClubLogo } from '../components/clubs/ClubLogo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CertificateTemplate } from '../components/events/CertificateTemplate';
import {
  Ticket,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  ScanLine,
  Zap,
  ShieldCheck,
  Award,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MyTicketsPage() {
  const { user } = useAuth();
  const { getRegistrations, events, clubs, getOrCreateCertificate } = useData();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const certRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const regs = await getRegistrations();
        setRegistrations(regs);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, getRegistrations]);

  const handleDownload = useCallback((reg: EventRegistration, eventTitle: string) => {
    const canvas = document.getElementById(`qr-canvas-${reg.id}`) as HTMLCanvasElement | null;
    if (!canvas) {
      toast.error('QR canvas not found. Expand the ticket first.');
      return;
    }
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `ETIS-Ticket-${eventTitle.replace(/\s+/g, '-')}-${reg.id.slice(0, 8)}.png`;
    link.click();
    toast.success('Ticket Downloaded', { description: 'Your QR ticket has been saved.' });
  }, []);

  const handleDownloadCertificate = async (reg: EventRegistration, eventTitle: string, clubName: string) => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating Credential...', { description: 'Synthesizing institutional certificate.' });

    try {
      // 1. Get/Issue certificate metadata
      const cert = await getOrCreateCertificate(reg.id);
      if (!cert) throw new Error('Failed to issue certificate');

      const event = events.find(e => e.id === reg.eventId);
      const club = clubs.find(c => c.id === event?.clubId);

      // 2. Prepare data for template
      setCertData({
        id: cert.id,
        name: cert.studentName,
        eventTitle: cert.eventTitle,
        clubName: cert.department === 'NiharNeo/ETIS-Nexus' ? 'ETIS Nexus' : (club?.name || 'Club'),
        clubLogo: club?.logo?.startsWith('http') ? club.logo : undefined,
        department: cert.department || 'NiharNeo/ETIS-Nexus',
        date: format(new Date(cert.issuedAt), 'MMMM d, yyyy'),
        verifyUrl: `${window.location.origin}/verify/cert/${cert.verificationHash}`
      });

      // 3. Wait for canvas to draw (Wait for RAF and state)
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!certRef.current) throw new Error('Generation buffer failed');

      // 4. Capture directly from canvas ref
      const canvas = certRef.current;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // 5. Convert to PDF (A4 Landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ETIS-Certificate-${eventTitle.replace(/\s+/g, '-')}.pdf`);

      toast.success('Certificate Generated', { id: toastId, description: 'Your achievement has been documented.' });
    } catch (err: any) {
      console.error('Certificate generation failed:', err);
      const errorMsg = err.message || 'The verification ledger is currently unavailable.';
      toast.error('Generation Failed', { id: toastId, description: errorMsg });
    } finally {
      setIsGenerating(false);
      setCertData(null);
    }
  };

  const checkedIn = registrations.filter((r) => r.checkedIn).length;
  const upcoming = registrations.filter((r) => {
    const ev = events.find((e) => e.id === r.eventId);
    return ev && new Date(ev.date) > new Date() && !r.checkedIn;
  }).length;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Zap size={32} className="mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.3em] font-black">
            Loading Quantum Tickets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1100px] mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Ticket size={20} />
          </div>
          <div>
            <p className="text-primary font-black uppercase tracking-[0.3em]" style={{ fontSize: '10px' }}>
              Authentication Vault
            </p>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-none">
              My Tickets
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground/60 font-medium max-w-xl">
          Your institutional event credentials. Each QR code grants access to the physical venue.
        </p>

        {/* Stats Strip */}
        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-card/60 backdrop-blur-3xl border border-border/10 ring-1 ring-white/5 w-fit">
          <div className="px-6 border-r border-border/10 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Total Tickets</p>
            <p className="text-2xl font-black text-foreground">{registrations.length}</p>
          </div>
          <div className="px-6 border-r border-border/10 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Upcoming</p>
            <p className="text-2xl font-black text-primary">{upcoming}</p>
          </div>
          <div className="px-6 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Attended</p>
            <p className="text-2xl font-black text-emerald-500">{checkedIn}</p>
          </div>
        </div>
      </motion.div>

      {/* Ticket List */}
      {registrations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 rounded-[3rem] bg-card/30 border border-border/5"
        >
          <Ticket size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground/30 text-[10px] uppercase tracking-[0.3em] font-black">
            No tickets generated. Register for an event to receive your QR credential.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg, i) => {
            const event = events.find((e) => e.id === reg.eventId);
            const club = event ? clubs.find((c) => c.id === event.clubId) : null;
            const isExpanded = expandedId === reg.id;
            const qrPayload = JSON.stringify({ ticket_id: reg.qrCodeId, event_id: reg.eventId });
            const eventDate = event ? new Date(event.date) : null;
            const isPast = eventDate ? eventDate < new Date() : false;

            return (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${reg.checkedIn
                    ? 'bg-emerald-500/[0.03] border-emerald-500/20'
                    : isPast
                      ? 'bg-card/30 border-border/5 opacity-60'
                      : 'bg-card/60 border-border/10 ring-1 ring-white/5'
                  }`}
              >
                {/* Ticket Header Row */}
                <div
                  className="flex items-center gap-5 p-6 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                >
                  {/* Club Logo */}
                  <div className="flex-shrink-0">
                    <ClubLogo logo={club?.logo} name={club?.name || 'Club'} size="md" />
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0 overflow-hidden space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">
                      {club?.name || 'Unknown Club'}
                    </p>
                    <h3 className="text-lg font-black tracking-tighter text-foreground truncate">
                      {event?.title || 'Event Removed'}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">
                      {event && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={11} />
                            {format(new Date(event.date), 'MMM d, yyyy')}
                          </span>
                          {event.venue && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={11} />
                              {event.venue}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {reg.checkedIn ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck size={14} />
                        Verified
                      </div>
                    ) : isPast ? (
                      <div className="px-4 py-2 rounded-xl bg-white/5 text-muted-foreground/40 border border-border/10 text-[10px] font-black uppercase tracking-[0.2em]">
                        Expired
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Clock size={14} className="animate-pulse" />
                        Active
                      </div>
                    )}
                    <div className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded QR Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/10 p-8 flex flex-col md:flex-row items-center gap-10">
                        {/* QR Code */}
                        <div className="relative group/qr">
                          {/* Visible SVG for display */}
                          <div className="bg-white p-5 rounded-[2rem] shadow-2xl ring-4 ring-primary/10 border border-primary/20 group-hover/qr:scale-105 transition-transform duration-500">
                            <QRCodeSVG
                              value={qrPayload}
                              size={160}
                              level="H"
                              includeMargin={true}
                              fgColor="#0f0f11"
                            />
                          </div>
                          {/* Hidden canvas for download */}
                          <div className="hidden">
                            <QRCodeCanvas
                              id={`qr-canvas-${reg.id}`}
                              value={qrPayload}
                              size={400}
                              level="H"
                              includeMargin={true}
                              fgColor="#0f0f11"
                            />
                          </div>
                          {reg.checkedIn && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                              <div className="text-center">
                                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                                <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-2">
                                  Scanned
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ticket Details */}
                        <div className="flex-1 space-y-6">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                              Ticket ID
                            </p>
                            <p className="font-mono text-sm font-bold text-foreground/80 break-all">
                              {reg.qrCodeId}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                              Registered At
                            </p>
                            <p className="text-sm font-bold text-foreground/80">
                              {format(new Date(reg.registeredAt), 'MMM d, yyyy • HH:mm')}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                              Instructions
                            </p>
                            <p className="text-sm text-muted-foreground/60 font-medium leading-relaxed">
                              Present this QR code at the event entrance. The scanner will validate your ticket and record your attendance automatically.
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => handleDownload(reg, event?.title || 'Event')}
                              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                              <Download size={14} />
                              Download Ticket
                            </button>
                            {reg.checkedIn && (
                              <button
                                onClick={() => handleDownloadCertificate(reg, event?.title || 'Event', club?.name || 'Club')}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                              >
                                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                                E-Certificate
                              </button>
                            )}
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card/60 border border-border/10 text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.2em]">
                              <ScanLine size={14} />
                              Scannable at Venue
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Generation Buffer (Hidden) */}
      <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none overflow-hidden">
        {certData && (
          <>
            <QRCodeCanvas
              id="hidden-qr-canvas"
              value={certData.verifyUrl}
              size={256}
              level="H"
            />
            <CertificateTemplate
              ref={certRef}
              {...certData}
            />
          </>
        )}
      </div>
    </div>
  );
}
