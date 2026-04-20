import { ContributionDay } from '../../types';
import { motion } from 'framer-motion';

interface ContributionHeatmapProps {
  activity: ContributionDay[];
}

export function ContributionHeatmap({ activity }: ContributionHeatmapProps) {
  const getColor = (count: number) => {
    if (count === 0) return 'bg-sidebar-accent/30';
    if (count < 3) return 'bg-primary/20';
    if (count < 6) return 'bg-primary/40';
    if (count < 10) return 'bg-primary/70';
    return 'bg-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]';
  };

  // Group activity into weeks (7 days per column)
  const columns = [];
  for (let i = 0; i < activity.length; i += 7) {
    columns.push(activity.slice(i, i + 7));
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get month labels based on the first day of each week
  const monthLabels = columns.map((week, idx) => {
    const firstDay = new Date(week[0].date);
    if (idx === 0 || firstDay.getDate() <= 7) {
      return months[firstDay.getMonth()];
    }
    return null;
  });

  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-max flex flex-col gap-3">
        {/* Month labels */}
        <div className="flex gap-[4px] ml-10 mb-1">
          {monthLabels.map((month, i) => (
            <div key={i} className="w-[14px] text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
              {month}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col gap-[4px] mr-2 justify-center py-1">
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none">M</span>
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none"></span>
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none">W</span>
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none"></span>
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none">F</span>
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none"></span>
            <span className="text-[8px] font-black text-muted-foreground/20 uppercase h-[14px] leading-none">S</span>
          </div>

          {/* Grid */}
          <div className="flex gap-[4px]">
            {columns.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[4px]">
                {week.map((day, dayIdx) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (weekIdx * 0.01) + (dayIdx * 0.01) }}
                    title={`${day.date}: ${day.count} activities`}
                    className={`w-[14px] h-[14px] rounded-sm transition-all hover:scale-125 hover:z-10 cursor-crosshair border border-white/5 ${getColor(day.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
