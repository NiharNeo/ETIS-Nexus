import { useForm } from 'react-hook-form';
import { ClubFormData, Club } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { LayoutGrid, Type, AlignLeft, Hash, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClubFormProps {
  initialData?: Partial<Club>;
  onSubmit: (data: ClubFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClubForm({ initialData, onSubmit, onCancel, isLoading }: ClubFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClubFormData>({
    defaultValues: {
      name: initialData?.name || '',
      shortDescription: initialData?.shortDescription || '',
      description: initialData?.description || '',
      logo: initialData?.logo || '🏛️',
      department: initialData?.department || '',
      tags: initialData?.tags?.join(', ') || '',
      coverImage: initialData?.coverImage || '',
    }
  });

  const coverImage = watch('coverImage');

  const labelText = "text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 block px-1";
  const inputStyle = "w-full px-8 py-4 rounded-2xl bg-sidebar/50 border border-border/10 focus:outline-none focus:ring-4 focus:ring-primary/5 text-sm font-bold tracking-tight text-foreground transition-all";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className={labelText}>Institutional Name</label>
          <div className="relative group">
            <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
            <input {...register('name', { required: true })} className={`${inputStyle} pl-16`} placeholder="e.g. Robotics & AI Lab" />
          </div>
        </div>
        
        <div className="space-y-4">
          <label className={labelText}>Operational Logo (Emoji)</label>
          <div className="relative group">
            <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
            <input {...register('logo')} className={`${inputStyle} pl-16`} placeholder="e.g. 🤖" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className={labelText}>Tactical Summary (Short)</label>
        <div className="relative group">
          <AlignLeft className="absolute left-6 top-6 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
          <textarea {...register('shortDescription')} rows={2} className={`${inputStyle} pl-16 resize-none`} placeholder="Brief mission statement..." />
        </div>
      </div>

      <div className="space-y-4">
        <label className={labelText}>Full Intelligence Dossier (Description)</label>
        <div className="relative group">
          <AlignLeft className="absolute left-6 top-6 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
          <textarea {...register('description')} rows={4} className={`${inputStyle} pl-16 resize-none`} placeholder="Detailed organizational overview..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className={labelText}>Sector/Department</label>
          <div className="relative group">
            <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
            <input {...register('department')} className={`${inputStyle} pl-16`} placeholder="e.g. Engineering" />
          </div>
        </div>
        
        <div className="space-y-4">
          <label className={labelText}>Signal Tags (Comma separated)</label>
          <div className="relative group">
            <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" size={18} />
            <input {...register('tags')} className={`${inputStyle} pl-16`} placeholder="tech, ai, hardware" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ImageUploader 
          label="Institutional Cover Identity"
          aspectRatio="video"
          initialImage={coverImage}
          onImageSelected={(base64) => setValue('coverImage', base64)}
        />
      </div>

      <div className="pt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 rounded-2xl text-muted-foreground/60 font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all"
        >
          Abort Changes
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-10 py-4 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-zinc-800 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          <Save size={14} />
          {isLoading ? 'Processing...' : 'Sync Profile'}
        </button>
      </div>
    </form>
  );
}
