import React, { useEffect, useRef, useImperativeHandle, useState } from 'react';
import uniLogo from '../../../assets/uni-logo.png';

interface CertificateTemplateProps {
  id: string;
  name: string;
  eventTitle: string;
  clubName: string;
  clubLogo?: string;
  department: string;
  date: string;
  verifyUrl: string;
}

export const CertificateTemplate = React.forwardRef<HTMLCanvasElement, CertificateTemplateProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const uniLogoImgRef = useRef<HTMLImageElement>(null);
  const clubLogoImgRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    let loadedCount = 0;
    const itemsToLoad: string[] = [uniLogo];
    if (props.clubLogo) itemsToLoad.push(props.clubLogo);
    const totalToLoad = itemsToLoad.length;

    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) setImagesLoaded(true);
    };

    const uniImg = new Image();
    uniImg.src = uniLogo;
    uniImg.onload = checkLoaded;
    uniImg.onerror = checkLoaded;
    (uniLogoImgRef as any).current = uniImg;

    if (props.clubLogo) {
      const clubImg = new Image();
      clubImg.src = props.clubLogo;
      clubImg.crossOrigin = 'anonymous';
      clubImg.onload = checkLoaded;
      clubImg.onerror = checkLoaded;
      (clubLogoImgRef as any).current = clubImg;
    } else {
      setImagesLoaded(true);
    }
  }, [props.clubLogo]);

  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLORS = {
      maroon: '#990411',
      cream: '#FCF5E5', // Matches DESIGN.md surface
      text: '#1D1C15', // DESIGN.md on_surface
      accent: '#8B0000',
      charcoal: '#0f0f11',
      emerald: '#10b981'
    };

    const render = () => {
      // 1. Archival Substrate
      ctx.fillStyle = COLORS.cream;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Minimalist L-Corners
      const drawLCorner = (x: number, y: number, rX: number, rY: number) => {
        ctx.strokeStyle = COLORS.maroon;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + rY * 40);
        ctx.lineTo(x, y);
        ctx.lineTo(x + rX * 40, y);
        ctx.stroke();
      };
      drawLCorner(40, 40, 1, 1);
      drawLCorner(canvas.width - 40, 40, -1, 1);
      drawLCorner(canvas.width - 40, canvas.height - 40, -1, -1);
      drawLCorner(40, canvas.height - 40, 1, -1);

      const drawBorder = (offset: number, padding: number) => {
        ctx.strokeStyle = COLORS.maroon;
        ctx.lineWidth = 1;
        ctx.strokeRect(offset, offset, canvas.width - 2 * offset, canvas.height - 2 * offset);
      };
      drawBorder(70, 40);

      // 4. Branding & Logo Synthesis
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'bold italic 22px "Inter", sans-serif'; // Slightly smaller for wide look
      const etisW = ctx.measureText('ETIS ').width;
      ctx.fillStyle = COLORS.charcoal;
      ctx.fillText('ETIS ', 100, 70);
      ctx.fillStyle = COLORS.maroon;
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('Nexus.', 100 + etisW, 70);

      if (uniLogoImgRef.current && uniLogoImgRef.current.complete && uniLogoImgRef.current.naturalWidth > 0) {
        const logo = uniLogoImgRef.current;
        const aspect = logo.width / logo.height;
        const h = 90; const w = h * aspect; // Slightly smaller
        ctx.drawImage(logo, canvas.width / 2 - w / 2, 60, w, h);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.letterSpacing = '8px';
      ctx.fillText('SAPTHAGIRI NPS UNIVERSITY', canvas.width / 2, 165);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = COLORS.maroon;
      ctx.font = 'bold 16px "Newsreader", serif';
      ctx.letterSpacing = '10px';
      ctx.fillText('OFFICIAL CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 200);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = COLORS.maroon;
      ctx.fillRect(canvas.width / 2 - 250, 235, 500, 36);
      ctx.fillStyle = COLORS.cream;
      ctx.font = 'bold 13px "Newsreader", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('THIS CERTIFICATE IS AWARDED TO', canvas.width / 2, 253);
      ctx.letterSpacing = '0px';

      // 6. Student Identity (Newsreader Italic - ULTIMA COMPRESSION)
      ctx.fillStyle = COLORS.text;
      ctx.font = 'italic 700 86px "Newsreader", serif';
      ctx.fillText(props.name, canvas.width / 2, 340);

      // Subtle Divider
      ctx.strokeStyle = 'rgba(29, 28, 21, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(canvas.width / 2 - 180, 410); ctx.lineTo(canvas.width / 2 + 180, 410); ctx.stroke();

      // 7. Institutional Narrative (ULTIMA COMPRESSION)
      ctx.fillStyle = 'rgba(29, 28, 21, 0.8)';
      ctx.font = '500 17px "Newsreader", serif';
      const desc = `For demonstrating institutional excellence and participating with high distinction in the event titled "${props.eventTitle}". This credential serves as a permanent record of validated participation within the ETIS Nexus ecosystem.`;
      const words = desc.split(' ');
      let line = ''; let yShift = 450; const maxWidth = 800;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, canvas.width / 2, yShift);
          line = words[n] + ' '; yShift += 22;
        } else { line = testLine; }
      }
      ctx.fillText(line, canvas.width / 2, yShift);

      // 8. Central Shield Seal (ULTIMA COMPRESSION)
      ctx.save();
      ctx.translate(canvas.width / 2, 580); // Pulled to 580
      ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fillStyle = 'rgba(153, 4, 17, 0.05)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, -10); ctx.lineTo(10, 3); ctx.quadraticCurveTo(0, 16, -10, 3); ctx.closePath();
      ctx.fillStyle = COLORS.maroon; ctx.fill();
      ctx.strokeStyle = COLORS.cream; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(0, 4); ctx.lineTo(6, -5); ctx.stroke();
      ctx.restore();

      // 9. Triple signature Block (ULTIMA COMPRESSION)
      const sigY = 680; // Pulled to 680
      const drawSig = (x: number, title: string, metadata: string) => {
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.text;
        ctx.font = 'italic 600 18px "Newsreader", serif';
        ctx.fillText(title, x, sigY);
        ctx.strokeStyle = 'rgba(29, 28, 21, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 85, sigY + 20); ctx.lineTo(x + 85, sigY + 20); ctx.stroke();
        ctx.font = 'bold 10px "Newsreader", serif';
        ctx.fillStyle = 'rgba(29, 28, 21, 0.5)';
        ctx.fillText(metadata, x, sigY + 40);
      };
      drawSig(canvas.width / 4, 'Institutional Dean', 'DEAN');
      drawSig(canvas.width / 2, 'Executive Director', 'DIRECTOR');
      drawSig(canvas.width * 0.75, 'Institutional CHRO', 'CHRO');

      // 10. Verification Logic (QR Tucked high)
      const hiddenQrCanvas = document.querySelector('#hidden-qr-canvas') as HTMLCanvasElement;
      if (hiddenQrCanvas) {
        ctx.drawImage(hiddenQrCanvas, canvas.width / 2 - 30, canvas.height - 100, 60, 60);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.font = 'bold 7px monospace';
      ctx.fillText(props.date.toUpperCase() + ' • VERIFICATION ID: ' + props.id.slice(0, 24).toUpperCase(), canvas.width / 2, canvas.height - 20);
    };

    render();
  }, [imagesLoaded, props]);

  return (
    <div style={{ position: 'relative' }}>
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');
      `}</style>
      <canvas 
        ref={canvasRef}
        width={1414} 
        height={850}
        style={{ width: '707px', height: '425px', background: 'white', border: '1px solid #eee' }}
      />
      <div id="hidden-qr-generator" style={{ display: 'none' }}>
         <canvas id="hidden-qr-canvas" width={256} height={256} />
      </div>
    </div>
  );
});
