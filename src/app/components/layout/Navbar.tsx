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
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 h-20 flex items-center gap-6 transition-all duration-500">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2.5 bg-card border border-border text-foreground hover:bg-muted transition-all shadow-none rounded-none"
      >
        <Menu size={18} />
      </button>

      {/* Dynamic Title / Breadcrumb */}
      <div className="flex flex-col">
        {title && (
          <h2 className="text-xl lg:text-3xl font-normal tracking-tight text-foreground transition-all" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-foreground/60">Ecosystem</span>
          <div className="w-1 h-1 bg-border" />
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary">Active Session</span>
        </div>
      </div>

      {/* Modern Search */}
      <div className="hidden md:flex flex-1 max-w-md ml-4">
        <div className="relative group w-full">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-0 text-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search Specimen Catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery('');
                }
              }}
              className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-input text-foreground placeholder:-foreground/40 focus:outline-none focus:border-b-2 focus:border-primary transition-all font-medium text-sm rounded-none"
            />
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative w-10 h-10 bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all shadow-none group rounded-none"
          >
            <Bell size={18} className="transition-transform group-hover:rotate-12" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] px-1 h-5 bg-primary text-white flex items-center justify-center font-bold" style={{ fontSize: '10px' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-14 w-80 bg-surface_container_lowest border border-border shadow-none overflow-hidden z-50 rounded-none">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted">
                <p className="text-foreground font-bold uppercase tracking-[0.1em]" style={{ fontSize: '11px', fontFamily: 'var(--font-sans)' }}>
                  Bulletin
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => user && markAllNotificationsRead()}
                    className="text-primary hover:underline font-medium"
                    style={{ fontSize: '10px' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar bg-background">
                {pulseFeed.length === 0 ? (
                  <div className="py-12 text-center text-foreground/40 font-medium uppercase tracking-widest" style={{ fontSize: '10px' }}>
                    No Current Dispatches
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
                        <div className="w-8 h-8 overflow-hidden flex-shrink-0 mt-1 border border-border">
                          <img src={item.avatar} alt={item.title} className="w-full h-full object-cover grayscale blur-[1px] hover:grayscale-0 hover:blur-none transition-all" />
                        </div>
                      ) : (
                        <div className={`w-2 h-2 mt-2 flex-shrink-0 ${item.feedType === 'announcement' ? 'bg-primary' : 'bg-foreground'}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-foreground font-bold tracking-tight" style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                            {item.title}
                          </p>
                          {item.feedType === 'announcement' && (
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] bg-muted border border-border text-foreground px-1.5 py-0.5" style={{fontFamily: 'var(--font-sans)'}}>Broadcast</span>
                          )}
                        </div>
                        <p className="text-foreground/80 line-clamp-2 leading-relaxed" style={{ fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
                          {item.message}
                        </p>
                        <p className="text-foreground/50 mt-2 font-medium uppercase tracking-[0.1em]" style={{ fontSize: '9px', fontFamily: 'var(--font-sans)' }}>
                          {format(new Date(item.createdAt), 'MMM d • HH:mm')}
                        </p>
                      </div>
                      {item.feedType === 'notification' && item.read && <Check size={14} className="text-foreground/30 flex-shrink-0 mt-1" />}
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
            <div className="w-10 h-10 overflow-hidden border border-border grayscale hover:grayscale-0 transition-all">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
