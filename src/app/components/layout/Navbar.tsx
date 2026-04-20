import { Bell, Menu, Search, Check, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const { user } = useAuth();
  const { notifications, announcements, markNotificationRead, markAllNotificationsRead } = useData();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  
  const userNotifs = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  // Combine real notifications with global announcements for the "Pulse Feed"
  const pulseFeed = [
    ...userNotifs.map(n => ({ ...n, feedType: 'notification', avatar: undefined })),
    ...announcements.filter(a => a.type === 'global').slice(0, 5).map(a => ({
      id: a.id,
      title: a.title,
      message: a.content,
      type: 'info',
      read: true,
      createdAt: a.createdAt,
      link: '/announcements',
      feedType: 'announcement',
      avatar: a.authorAvatar
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifTypeClass = {
    success: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    error: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    warning: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    info: 'bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]',
  };

  return (
    <header className="sticky top-0 z-40 bg-background/50 backdrop-blur-3xl border-b border-border/50 px-6 h-20 flex items-center gap-6 transition-all duration-500">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2.5 rounded-xl bg-card border border-border/50 text-foreground/60 hover:text-primary transition-all shadow-sm"
      >
        <Menu size={18} />
      </button>

      {/* Dynamic Title / Breadcrumb */}
      <div className="flex flex-col">
        {title && (
          <h2 className="text-xl lg:text-2xl font-black tracking-tight text-foreground transition-all">
            {title}
          </h2>
        )}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">Ecosystem</span>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/80">Active Session</span>
        </div>
      </div>

      {/* Modern Search */}
      <div className="hidden md:flex flex-1 max-w-md ml-4">
        <div className="relative group w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search Terminal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery('');
                }
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/40 border border-border/50 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-foreground/60 hover:text-primary transition-all shadow-sm group"
          >
            <Bell size={18} className="group-hover:shake transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-lg bg-primary text-white flex items-center justify-center font-black shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ fontSize: '9px' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-14 w-80 bg-card/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-border/50 overflow-hidden z-50 animate-in fade-in zoom-in duration-300">
              <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                <p className="text-foreground font-black uppercase tracking-widest" style={{ fontSize: '11px' }}>
                  The Pulse <span className="text-primary ml-1">Feeds</span>
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => user && markAllNotificationsRead()}
                    className="text-primary hover:underline font-bold"
                    style={{ fontSize: '10px' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {pulseFeed.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground/40 font-bold uppercase tracking-widest" style={{ fontSize: '10px' }}>
                    Zero Static
                  </div>
                ) : (
                  pulseFeed.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.feedType === 'notification') {
                          markNotificationRead(item.id);
                        }
                        setNotifOpen(false);
                        if (item.link) navigate(item.link);
                      }}
                      className={`px-5 py-4 border-b border-border/20 cursor-pointer hover:bg-primary/5 transition-colors flex gap-4 ${
                        item.feedType === 'notification' && !item.read ? 'bg-primary/[0.02]' : ''
                      }`}
                    >
                      {item.feedType === 'announcement' && item.avatar ? (
                        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 mt-1 border border-primary/20 shadow-lg">
                          <img src={item.avatar} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${item.feedType === 'announcement' ? 'bg-primary/20' : notifTypeClass[item.type as keyof typeof notifTypeClass]}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-foreground font-bold tracking-tight" style={{ fontSize: '13px' }}>
                            {item.title}
                          </p>
                          {item.feedType === 'announcement' && (
                            <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded">Broadcast</span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed" style={{ fontSize: '12px' }}>
                          {item.message}
                        </p>
                        <p className="text-muted-foreground/30 mt-2 font-black uppercase tracking-widest" style={{ fontSize: '9px' }}>
                          {format(new Date(item.createdAt), 'MMM d • HH:mm')}
                        </p>
                      </div>
                      {item.feedType === 'notification' && item.read && <Check size={14} className="text-muted-foreground/20 flex-shrink-0 mt-1" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Minimal User Trigger (Mobile Only/Extra) */}
        {!title && user && (
          <div className="flex items-center gap-3 pr-2">
            <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-xl">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
