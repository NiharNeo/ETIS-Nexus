import React from 'react';
import { ShieldCheck, Award, GraduationCap, Calendar, MapPin } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface CertificateTemplateProps {
  id: string;
  name: string;
  eventTitle: string;
  clubName: string;
  department: string;
  date: string;
  verifyUrl: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>((props, ref) => {
  return (
    <div 
      ref={ref}
      style={{ width: '1122px', height: '794px' }} // Standard A4 Landscape at 96 DPI
      className="bg-white p-16 relative overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 border-[24px] border-emerald-500/5" />
      <div className="absolute inset-2 border-2 border-emerald-500/20" />
      
      {/* Corner Accents */}
      {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
        <div key={i} className={`absolute w-32 h-32 ${pos} bg-emerald-500/5 blur-3xl`} />
      ))}

      {/* Content Layout */}
      <div className="relative h-full border-[1px] border-emerald-500/10 p-12 flex flex-col items-center justify-between text-center">
        
        {/* Header - Institutional Identity */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-foreground">
              ETIS <span className="text-emerald-500 not-italic">Nexus</span>.
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/20 leading-none">
              Governance & Integrity Sector
            </p>
          </div>
          <div className="w-16 h-1 bg-emerald-500 mx-auto" />
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h2 className="text-[12px] font-black uppercase tracking-[0.8em] text-emerald-500/60 ml-[0.8em]">
            Credential of Achievement
          </h2>
          <div className="space-y-2">
            <p className="text-[14px] font-bold text-foreground/40 italic">This institutional document formally recognizes that</p>
            <h3 className="text-6xl font-black text-foreground tracking-tighter uppercase px-20">
              {props.name}
            </h3>
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-6 max-w-2xl mx-auto">
          <p className="text-lg font-medium text-foreground/60 leading-relaxed">
            Has successfully demonstrated dedicated participation and completed all verification requirements for the convergence titled:
          </p>
          <div className="space-y-1">
             <h4 className="text-3xl font-black text-foreground tracking-tight underline decoration-emerald-500/30 underline-offset-8">
               {props.eventTitle}
             </h4>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mt-4">
               Authorized by {props.clubName}
             </p>
          </div>
        </div>

        {/* Footer - Details & Signatures */}
        <div className="w-full flex items-end justify-between px-4">
          
          {/* Verification QR */}
          <div className="flex flex-col items-center gap-3">
             <div className="p-3 bg-white border border-emerald-500/20 rounded-2xl shadow-xl">
               <QRCodeCanvas 
                 value={props.verifyUrl}
                 size={90}
                 level="H"
               />
             </div>
             <div className="space-y-1 text-left w-full">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30">Verification UUID</p>
                <p className="text-[9px] font-mono font-bold text-emerald-600 uppercase">{props.id.slice(0, 18)}...</p>
             </div>
          </div>

          {/* Department Info */}
          <div className="space-y-2 text-center pb-2">
            <div className="flex items-center gap-2 justify-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">
               <GraduationCap size={12} /> {props.department} Sector
            </div>
            <div className="flex items-center gap-4 justify-center text-[10px] font-black text-foreground/40 uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><Calendar size={11} /> {props.date}</span>
               <span className="flex items-center gap-1.5"><MapPin size={11} /> Campus HQ</span>
            </div>
          </div>

          {/* Institutional Stamp */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
               <ShieldCheck size={120} className="text-emerald-500" />
            </div>
            <div className="relative pt-12 border-t border-black/10 min-w-[200px]">
               <p className="text-[11px] font-black italic text-foreground leading-none mb-1">Nexus Registrar</p>
               <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20">ETIS Governance Lead</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
});
