import React from 'react';
import { X, Calendar, User, Tag, Share2, CornerUpRight, Clock, ShieldCheck } from 'lucide-react';
import type { WikiArticle } from '../../types';
import { format } from 'date-fns';

interface WikiArticleViewerProps {
  article: WikiArticle;
  onClose: () => void;
}

const WikiArticleViewer: React.FC<WikiArticleViewerProps> = ({ article, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 zoom-in-95 duration-300">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black text-indigo-600 border border-slate-200 dark:border-slate-800 uppercase tracking-widest shadow-sm">
              ETIS Institutional Wiki
            </span>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Clock size={14} />
              Est. Reading: 5 min
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <Share2 size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-600 dark:text-slate-300"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            {/* Meta Header */}
            <div className="flex Array-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <Calendar size={16} />
                Updated {format(new Date(article.lastUpdated), 'MMMM d, yyyy')}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            {/* Author Section */}
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl mb-12 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {article.author}
                    <ShieldCheck size={16} className="text-blue-500" />
                  </p>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{article.authorRole}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-black text-slate-400 uppercase text-right mb-1">Article Peer-Reviewed</div>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200" />
                  ))}
                </div>
              </div>
            </div>

            {/* Markdown-style Content Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Footer Tags */}
            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-indigo-500" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Metadata Tags</span>
              </div>
              <div className="flex Array-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-400 transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Actions */}
        <div className="px-12 py-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm hover:translate-x-1 transition-transform">
              Next Recommended Guide
              <CornerUpRight size={18} />
            </button>
            <div className="text-xs font-medium text-slate-400">
              Institutional Knowledge Asset ID: {article.id.toUpperCase()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WikiArticleViewer;
