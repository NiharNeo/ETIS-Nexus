import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface ClubLogoProps {
  logo?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ClubLogo({ logo, name, size = 'md', className = '' }: ClubLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-lg',
    md: 'w-12 h-12 rounded-xl text-2xl',
    lg: 'w-16 h-16 rounded-2xl text-3xl',
    xl: 'w-32 h-32 rounded-[2rem] text-6xl',
  };

  const hasLogo = logo && logo.length > 0 && logo !== '🏛️';
  // Robust URL detection (http, https, data:, blob:, or relative paths)
  const isUrl = hasLogo && /^(https?:\/\/|data:|blob:|\/)/.test(logo);

  return (
    <div className={`flex items-center justify-center bg-zinc-50 border border-black/5 overflow-hidden shadow-sm transition-transform hover:scale-105 ${sizeClasses[size]} ${className}`}>
      {hasLogo ? (
        isUrl ? (
          <img 
            src={logo} 
            alt={`${name} Logo`} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + name;
            }}
          />
        ) : (
          <span className="relative z-10">{logo}</span>
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-50/50">
          <LayoutGrid className="text-primary/20" size={size === 'xl' ? 60 : 20} />
        </div>
      )}
    </div>
  );
}
