import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onFileSelected?: (file: File) => void;
  initialImage?: string | null;
  aspectRatio?: 'square' | 'video' | 'any';
  label?: string;
}

export function ImageUploader({ onImageSelected, onFileSelected, initialImage, aspectRatio = 'any', label }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (onFileSelected) onFileSelected(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelected(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected, onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelected('');
  };

  const containerSpecs = {
    square: 'aspect-square max-w-[200px]',
    video: 'aspect-video w-full',
    any: 'min-h-[200px] w-full',
  };

  return (
    <div className="space-y-4">
      {label && <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 block px-1">{label}</label>}
      
      <div 
        {...getRootProps()} 
        className={`relative rounded-[2.5rem] overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border/10 bg-sidebar/50 hover:bg-white/[0.02]'
        } ${containerSpecs[aspectRatio]}`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={32} className="text-white" />
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-4 right-4 z-20 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-sidebar flex items-center justify-center border border-border/10 mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} className="text-primary/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-bold text-foreground">Click or Drag to Upload</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-1">PNG, JPG up to 2MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
