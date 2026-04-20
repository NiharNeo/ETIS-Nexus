import type { HTMLAttributes } from 'react';

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-slate-200/60 rounded-md ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ className = '', lines = 3, ...props }: HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-4/5' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 h-[300px] flex flex-col">
      <Skeleton className="w-full h-40 rounded-xl mb-4" />
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-5 mb-2" />
      <SkeletonText lines={2} />
      <div className="mt-auto flex gap-2">
        <Skeleton className="w-1/2 h-8 rounded-lg" />
        <Skeleton className="w-1/2 h-8 rounded-lg" />
      </div>
    </div>
  );
}
