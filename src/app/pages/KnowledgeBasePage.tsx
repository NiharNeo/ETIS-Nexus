import React, { useState } from 'react';
import { Search, Library, Sparkles, Filter, ChevronRight, BookOpen, LayoutGrid, Zap, Terminal } from 'lucide-react';
import { useData } from '../context/DataContext';
import WikiArticleCard from '../components/knowledge/WikiArticleCard';
import WikiArticleViewer from '../components/knowledge/WikiArticleViewer';
import type { WikiArticle, WikiCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES: WikiCategory[] = ['GitHub', 'Project Management', 'Technical', 'Process', 'General'];

const KnowledgeBasePage: React.FC = () => {
  const { wikiArticles, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | 'All'>('All');
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);

  const filteredArticles = wikiArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) || 
                          article.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
                          article.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12">
      {/* Editorial Search Dimension */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[4rem] bg-sidebar p-12 md:p-24 text-center border border-border/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/5"
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[80%] bg-indigo-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-card/60 backdrop-blur-3xl border border-white/5 rounded-full shadow-2xl">
            <Library size={16} className="text-primary" />
            <span className="text-foreground font-black uppercase tracking-[0.3em] text-[10px]">Institutional Intelligence Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[1.1] tracking-tighter">
            Architecting <span className="text-primary italic">Collective</span> Wisdom.
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Direct interface to ETIS documentation. Protocol guides, system blueprints, 
            and technical lore curated by the university elite.
          </p>

          <div className="relative max-w-3xl mx-auto mt-16 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-[2.5rem] blur opacity-50 group-focus-within:opacity-100 transition-all duration-700" />
            <div className="relative flex items-center">
              <Search className="absolute left-8 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={24} />
              <input
                type="text"
                placeholder="Synchronize with intelligence database..."
                className="w-full pl-20 pr-8 py-7 bg-card border border-border/10 rounded-[2.5rem] shadow-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-xl font-bold tracking-tight text-foreground placeholder-muted-foreground/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-sidebar-accent/50 rounded-2xl text-[9px] font-black tracking-[0.2em] border border-border/10 text-muted-foreground/40 uppercase">
                <Sparkles size={14} className="text-primary" />
                Neural Search Active
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Strip (Categories & Logic) */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between pt-8 border-t border-border/5">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar scroll-smooth">
          <div className="p-3 rounded-2xl bg-sidebar-accent/50 text-muted-foreground/40 border border-border/5">
            <Filter size={18} />
          </div>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
              selectedCategory === 'All'
                ? 'bg-primary text-white border-primary shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]'
                : 'bg-card/40 text-muted-foreground border-border/10 hover:border-primary/20 hover:text-foreground'
            }`}
          >
            Universal
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]'
                  : 'bg-card/40 text-muted-foreground border-border/10 hover:border-primary/20 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-card/40 rounded-2xl border border-border/10 text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.3em]">
          <Terminal size={14} className="text-primary/40" />
          Maintained by GS Console & Senate Oversight
        </div>
      </div>

      {/* Intelligence Grid */}
      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-72 bg-card/40 rounded-[2rem] border border-border/10 animate-pulse" />
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <WikiArticleCard 
                  article={article} 
                  onClick={() => setSelectedArticle(article)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center bg-card/20 rounded-[4rem] border border-dashed border-border/10"
          >
            <div className="w-24 h-24 bg-card/40 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/5">
              <Search className="text-muted-foreground/10" size={40} />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tighter">Zero Correlation Detected</h2>
            <p className="text-muted-foreground mt-4 max-w-sm font-medium leading-relaxed">
              The intelligence database returned no matching protocol. Adjust your synchronization parameters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Resources Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-20">
        <div className="lg:col-span-2 bg-gradient-to-br from-primary/[0.03] to-transparent p-12 rounded-[3.5rem] border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <LayoutGrid size={120} className="text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-foreground tracking-tighter mb-8">System Blueprints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TemplateAction title="README Protocol" description="Standardized repository documentation structure." />
              <TemplateAction title="PR Integrity Check" description="Universal code quality and review standards." />
              <TemplateAction title="Nexus Proposal" description="Official senate template for association events." />
              <TemplateAction title="Project Pipeline" description="Architectural intent for P1-P5 deployments." />
            </div>
          </div>
        </div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-primary p-12 rounded-[3.5rem] text-white space-y-8 shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_70%)] opacity-50" />
          <div className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] border border-white/20 flex items-center justify-center relative z-10">
            <Zap size={32} />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-black tracking-tight leading-none">Contributor Gateway</h3>
            <p className="text-white/70 text-sm font-medium leading-relaxed">
              Identify as a domain lead? Submit institutional wisdom to the General Secretary for peer consensus.
            </p>
          </div>
          <button className="w-full py-5 bg-white text-primary font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl relative z-10">
            INITIALIZE UPLOAD
            <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>

      {/* Article Viewer Modal */}
      {selectedArticle && (
        <WikiArticleViewer 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </div>
  );
};

function TemplateAction({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-6 bg-card/60 backdrop-blur-xl rounded-3xl border border-border/5 hover:border-primary/40 hover:scale-[1.02] transition-all cursor-pointer group shadow-xl ring-1 ring-white/5">
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <h4 className="font-black text-foreground group-hover:text-primary transition-colors uppercase text-[10px] tracking-widest mb-1.5">{title}</h4>
          <p className="text-muted-foreground/60 text-xs font-medium truncate">{description}</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBasePage;
