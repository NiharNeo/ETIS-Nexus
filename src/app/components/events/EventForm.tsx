import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Save,
  Send,
  AlertCircle,
  UploadCloud,
  X,
  Sparkles,
  LayoutGrid,
  Calendar,
  Clock,
  MapPin,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import type { EventFormData, EventMode, ClubEvent } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from '../common/ImageUploader';
import { uploadFile } from '../../lib/supabase';

interface EventFormProps {
  initialData?: Partial<ClubEvent>;
  onSaveDraft: (data: EventFormData) => void;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

const eventSchema = z.object({
  title: z.string().min(5, 'Protocol title must be at least 5 characters'),
  description: z.string().min(20, 'Mission brief must be at least 20 characters'),
  date: z.string().min(1, 'Temporal coordinate is required'),
  startTime: z.string().min(1, 'Start synchronization required'),
  endTime: z.string().min(1, 'End synchronization required'),
  venue: z.string().min(1, 'Nexus coordinate is required'),
  mode: z.enum(['offline', 'online', 'hybrid']),
  capacity: z.coerce.number().positive('Must be a positive integer').optional().or(z.literal('').transform(() => undefined)),
  registrationLink: z.string().url('Invalid URL protocol').optional().or(z.literal('').transform(() => undefined)),
  tags: z.string().default(''),
  coverImage: z.string().url('Invalid telemetry URL').optional().or(z.literal('').transform(() => undefined)),
});

type EventFormValues = z.infer<typeof eventSchema>;

export function EventForm({ initialData, onSaveDraft, onSubmit, isLoading }: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      date: initialData?.date ?? '',
      startTime: initialData?.startTime ?? '',
      endTime: initialData?.endTime ?? '',
      venue: initialData?.venue ?? '',
      mode: initialData?.mode ?? 'offline',
      registrationLink: initialData?.registrationLink ?? '',
      capacity: initialData?.capacity,
      tags: initialData?.tags?.join(', ') ?? '',
      coverImage: initialData?.coverImage ?? '',
    },
  });

  const [action, setAction] = useState<'draft' | 'submit'>('draft');
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.coverImage ? initialData.coverImage : null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const mode = watch('mode') as EventMode;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      // For this demo, we'll store the objectUrl as the coverImage so it shows up in this session
      setValue('coverImage', objectUrl, { shouldValidate: true });
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const removeImage = () => {
    setPreviewImage(null);
    setValue('coverImage', '', { shouldValidate: true });
  };

  const handleFormSubmit = async (data: EventFormData) => {
    let finalCoverImage = data.coverImage;

    if (coverFile) {
      try {
        const path = `events/${Date.now()}-${coverFile.name}`;
        finalCoverImage = await uploadFile('covers', path, coverFile);
      } catch (err) {
        console.error('Failed to upload cover image:', err);
      }
    }

    const finalData = { ...data, coverImage: finalCoverImage };

    if (action === 'draft') {
      onSaveDraft(finalData);
    } else {
      onSubmit(finalData);
    }
  };

  const glassInput = "relative z-10 w-full px-8 py-5 rounded-3xl bg-sidebar border border-border/10 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground placeholder-muted-foreground/10 transition-all shadow-inner";
  const labelText = "text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 block px-1";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10 p-2">
      {/* Title Dimension */}
      <div className="space-y-4">
        <label className={labelText}>
           Protcol Signature (Title)
        </label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <input
            {...register('title')}
            className={`${glassInput} ${errors.title ? 'border-rose-500/30' : ''}`}
            placeholder="Initialize event signature..."
          />
        </div>
        <AnimatePresence>
          {errors.title && (
            <motion.p 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 text-rose-500 font-bold px-2" 
              style={{ fontSize: '11px' }}
            >
              <AlertCircle size={12} /> {errors.title.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Description Dimension */}
      <div className="space-y-4">
        <label className={labelText}>
           Operational Mission Brief
        </label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <textarea
            {...register('description')}
            rows={5}
            className={`${glassInput} resize-none italic leading-relaxed ${errors.description ? 'border-rose-500/30' : ''}`}
            placeholder="Detail event logistics, objectives, and tactical agenda..."
          />
        </div>
        {errors.description && (
          <p className="flex items-center gap-2 text-rose-500 font-bold px-2" style={{ fontSize: '11px' }}>
            <AlertCircle size={12} /> {errors.description.message}
          </p>
        )}
      </div>

      {/* Temporal Coordinates (Date & Time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <label className={labelText}>Temporal Horizon</label>
          <div className="relative group">
            <Calendar className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input type="date" {...register('date')} className={`${glassInput} pl-16 ${errors.date ? 'border-rose-500/30' : ''}`} />
          </div>
        </div>
        <div className="space-y-4">
          <label className={labelText}>Sync Start (Time)</label>
          <div className="relative group">
            <Clock className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input type="time" {...register('startTime')} className={`${glassInput} pl-16 ${errors.startTime ? 'border-rose-500/30' : ''}`} />
          </div>
        </div>
        <div className="space-y-4">
          <label className={labelText}>Sync Termination</label>
          <div className="relative group">
            <Clock className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input type="time" {...register('endTime')} className={`${glassInput} pl-16 ${errors.endTime ? 'border-rose-500/30' : ''}`} />
          </div>
        </div>
      </div>

      {/* Nexus & Mode Dynamics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className={labelText}>Nexus Coordinate (Venue)</label>
          <div className="relative group">
            <MapPin className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
            <input
              {...register('venue')}
              className={`${glassInput} pl-16 ${errors.venue ? 'border-rose-500/30' : ''}`}
              placeholder={mode === 'online' ? "Virtual Stream URL..." : "Physical Sector ID..."}
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className={labelText}>Operational Mode</label>
          <div className="relative group">
            <LayoutGrid className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={18} />
            <select {...register('mode')} className={`${glassInput} pl-16 appearance-none cursor-pointer`}>
              <option value="offline">OFFLINE PERSISTENCE</option>
              <option value="online">VIRTUAL HUB</option>
              <option value="hybrid">DUAL-MODE HYBRID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources & Intel Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className={labelText}>Personnel Capacity</label>
          <div className="relative group">
             <Activity className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
             <input type="number" {...register('capacity')} className={`${glassInput} pl-16`} placeholder="Unrestricted..." />
          </div>
        </div>
        <div className="space-y-4">
          <label className={labelText}>Auth Repository URL</label>
          <div className="relative group">
             <Send className="absolute z-20 pointer-events-none left-6 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
             <input {...register('registrationLink')} className={glassInput} style={{ paddingLeft: '4rem' }} placeholder="https://external-rep.io/..." />
          </div>
        </div>
      </div>

      {/* Metadata Classification */}
      <div className="space-y-4">
        <label className={labelText}>Sector Identity (Tags, comma-separated)</label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <input
            {...register('tags')}
            className={glassInput}
            placeholder="e.g. INFILTRATION, CODE_RED, TECHNICAL_AUDIT"
          />
        </div>
      </div>

      {/* Cover Intelligence (Integrated Uploader) */}
      <div className="space-y-4">
        <ImageUploader 
          label="Visual Identity Protocol (Cover Image)"
          aspectRatio="video"
          initialImage={previewImage}
          onFileSelected={(file) => setCoverFile(file)}
          onImageSelected={(base64) => {
            setPreviewImage(base64);
            setValue('coverImage', base64, { shouldValidate: true });
          }}
        />
        <input type="hidden" {...register('coverImage')} />
      </div>

      {/* Governance Disclaimer */}
      <motion.div 
        whileHover={{ x: 5 }}
        className="p-8 bg-primary/[0.03] border border-primary/20 rounded-[2.5rem] flex items-start gap-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
           <ShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Authorization Protocol</p>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed italic opacity-80">
            Local drafts are persistent in your terminal. Upon submission for authorization, executive review is required before mission deployment to the public nexus.
          </p>
        </div>
      </motion.div>

      {/* Tactical Execution Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 border-t border-border/5">
        <motion.button
          type="submit"
          onClick={() => setAction('draft')}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-6 rounded-3xl bg-sidebar border border-border/10 text-muted-foreground font-black uppercase text-[10px] tracking-[0.3em] hover:bg-card hover:text-foreground transition-all shadow-xl disabled:opacity-20 flex items-center justify-center gap-3"
        >
          <Save size={16} /> Save Local Draft
        </motion.button>
        <motion.button
          type="submit"
          onClick={() => setAction('submit')}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="py-6 rounded-3xl bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:bg-primary/90 transition-all disabled:opacity-20 flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Send size={16} className="relative z-10" /> <span className="relative z-10">Deploy For Authorization</span>
        </motion.button>
      </div>
    </form>
  );
}
