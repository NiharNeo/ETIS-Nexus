import React from 'react';
import { BookOpen, Calendar, Eye, Tag, ArrowRight } from 'lucide-react';
import type { WikiArticle } from '../../types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface WikiArticleCardProps {
  article: WikiArticle;
  onClick: () => void;
}

const WikiArticleCard: React.FC<WikiArticleCardProps> = ({ article, onClick }) => {
  const categoryColors: Record<string, string> = {
    GitHub: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Project Management': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    Technical: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Process: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    General: 'text-muted-foreground bg-muted-foreground/10 border-muted-foreground/20',
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className="group bg-card/40 backdrop-blur-2xl rounded-[2rem] p-7 border border-border/10 hover:border-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer flex flex-col h-full ring-1 ring-white/5 relative overflow-hidden"
    >
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-1000" />

      <div className="flex justify-between items-center mb-6">
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${categoryColors[article.category] || categoryColors.General}`}>
          {article.category}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground/40 text-[10px] font-bold">
          <Eye size={12} />
          {article.viewCount} Views
        </div>
      </div>

      <h3 className="text-xl font-black text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tighter">
        {article.title}
      </h3>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-sidebar-accent/50 border border-border/10 flex items-center justify-center text-primary font-black text-sm group-hover:rotate-6 transition-transform">
          {article.author.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-foreground truncate tracking-tight">{article.author}</p>
          <p className="text-[9px] text-muted-foreground/50 uppercase font-black tracking-widest">{article.authorRole}</p>
        </div>
      </div>

      {/* Tags Cluster */}
      <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
        {article.tags.slice(0, 3).map(tag => (
          <span key={tag} className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest bg-sidebar-accent/20 px-2.5 py-1 rounded-lg border border-border/5 group-hover:bg-primary/5 group-hover:text-primary transition-all">
            <Tag size={10} className="text-primary/40" />
            {tag}
          </span>
        ))}
        {article.tags.length > 3 && (
          <span className="text-[10px] font-black text-muted-foreground/20 py-1">+{article.tags.length - 3}</span>
        )}
      </div>

      <div className="pt-6 border-t border-border/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground/30 text-[9px] font-black uppercase tracking-widest">
          <Calendar size={12} />
          {format(new Date(article.lastUpdated), 'MMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[9px] translate-x-2 group-hover:translate-x-0 transition-transform opacity-0 group-hover:opacity-100">
          Explore <ArrowRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default WikiArticleCard;
