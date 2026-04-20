import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50/50', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-100/50', value: 'text-blue-700' },
  indigo: { bg: 'bg-indigo-50/50', icon: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-100/50', value: 'text-indigo-700' },
  emerald: { bg: 'bg-emerald-50/50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100/50', value: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50/50', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-100/50', value: 'text-amber-700' },
  rose: { bg: 'bg-rose-50/50', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-100/50', value: 'text-rose-700' },
  violet: { bg: 'bg-violet-50/50', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-100/50', value: 'text-violet-700' },
};

export function StatCard({ label, value, icon, color, change, changeType, subtitle }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`rounded-2xl border p-5 ${styles.bg} ${styles.border} flex flex-col gap-3 shadow-sm hover:shadow-md backdrop-blur-sm transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${styles.icon} shadow-inner`}>
          {icon}
        </div>
        {change && (
          <span
            className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
              changeType === 'up'
                ? 'bg-emerald-100/80 text-emerald-700'
                : changeType === 'down'
                ? 'bg-red-100/80 text-red-700'
                : 'bg-slate-100/80 text-slate-600'
            }`}
            style={{ fontWeight: 600 }}
          >
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>
      <div className="mt-1">
        <p className={`${styles.value} tracking-tight`} style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.1 }}>
          {value}
        </p>
        <p className="text-slate-600 mt-1" style={{ fontSize: '14px', fontWeight: 600 }}>
          {label}
        </p>
        {subtitle && (
          <p className="text-slate-400 mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
