import * as React from "react";
import { cn } from "./utils";
import { motion } from "motion/react";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid md:grid-cols-3 auto-rows-[20rem] gap-6 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

export function BentoCard({
  className,
  title,
  description,
  header,
  icon,
  onAction,
  actionLabel,
}: BentoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "row-span-1 border border-border/10 bg-card/40 backdrop-blur-xl group/bento transition duration-300 shadow-sm hover:shadow-xl justify-between flex flex-col space-y-4 rounded-3xl overflow-hidden ring-1 ring-white/5",
        className
      )}
    >
      {header && (
        <div className="flex flex-1 w-full h-full min-h-[6rem] overflow-hidden group-hover/bento:scale-105 transition duration-500">
          {header}
        </div>
      )}
      <div className="p-6 pt-0 group-hover/bento:translate-x-2 transition duration-300">
        <div className="flex items-center gap-2 mb-2">
          {icon && <div className="text-primary">{icon}</div>}
          {title && (
            <div className="font-black text-foreground tracking-tight" style={{ fontSize: '18px' }}>
              {title}
            </div>
          )}
        </div>
        {description && (
          <div className="font-medium text-muted-foreground leading-relaxed" style={{ fontSize: '13px' }}>
            {description}
          </div>
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300"
          >
            {actionLabel || "View Details"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
