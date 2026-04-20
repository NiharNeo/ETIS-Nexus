import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarDays,
  TrendingUp,
  Settings,
  LogOut,
  Shield,
  PlusCircle,
  BookOpen,
  ChevronRight,
  GraduationCap,
  X,
  Zap,
  BarChart3,
  History as HistoryIcon,
  Activity,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    to: '/dashboard',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Clubs',
    icon: <Users size={18} />,
    to: '/clubs',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Events',
    icon: <BookOpen size={18} />,
    to: '/events',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Announcements',
    icon: <Bell size={18} />,
    to: '/announcements',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Calendar',
    icon: <CalendarDays size={18} />,
    to: '/calendar',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Hackathons',
    icon: <Zap size={18} />,
    to: '/hackathons',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'History',
    icon: <HistoryIcon size={18} />,
    to: '/memories',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Wiki Hub',
    icon: <BookOpen size={18} />,
    to: '/knowledge',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'Create Event',
    icon: <PlusCircle size={18} />,
    to: '/rep/events/new',
    roles: ['super_admin', 'club_rep'],
  },
  {
    label: 'My Events',
    icon: <Activity size={18} />,
    to: '/rep/events',
    roles: ['club_rep'],
  },
  {
    label: 'Event Approvals',
    icon: <Shield size={18} />,
    to: '/admin/events',
    roles: ['super_admin', 'Super Admin'],
  },
  {
    label: 'Club Management',
    icon: <Shield size={18} />,
    to: '/admin/clubs',
    roles: ['super_admin'],
  },
  {
    label: 'Join Requests',
    icon: <Users size={18} />,
    to: '/rep/requests',
    roles: ['super_admin', 'club_rep'],
  },
  {
    label: 'Account Settings',
    icon: <Settings size={18} />,
    to: '/settings',
    roles: ['super_admin', 'club_rep', 'student'],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-2xl">
      {/* Branding */}
      <div className="px-8 py-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-2xl ring-1 ring-white/10">
              <GraduationCap size={24} className="text-sidebar-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-sidebar-foreground text-xl tracking-tighter" style={{ fontWeight: 800 }}>
              ETIS
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.1em]" style={{ fontSize: '9px' }}>
                System Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-6 pb-8">
        <div>
          <p className="px-4 mb-4 text-muted-foreground/50 uppercase tracking-[0.2em] font-bold" style={{ fontSize: '10px' }}>
            Main Menu
          </p>
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_10px_20px_-10px_rgba(37,99,235,0.2)]'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold tracking-tight" style={{ fontSize: '14px' }}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Categories Placeholder */}
        <div>
          <p className="px-4 mb-4 text-muted-foreground/50 uppercase tracking-[0.2em] font-bold" style={{ fontSize: '10px' }}>
            Explore
          </p>
          <div className="px-4 space-y-3">
            <div className="flex items-center gap-3 text-sidebar-foreground/40 hover:text-sidebar-foreground cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-sm bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
              <span className="text-xs font-medium">Tech & Engineering</span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-foreground/40 hover:text-sidebar-foreground cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-sm bg-purple-500/50 group-hover:bg-purple-500 transition-colors"></div>
              <span className="text-xs font-medium">Arts & Culture</span>
            </div>
            <div className="flex items-center gap-3 text-sidebar-foreground/40 hover:text-sidebar-foreground cursor-pointer transition-colors group">
              <div className="w-2 h-2 rounded-sm bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>
              <span className="text-xs font-medium">Sports & Fitness</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Profile */}
      <div className="p-4 bg-sidebar-accent/30 border-t border-sidebar-border/50 backdrop-blur-xl">
        {user && (
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-background/40 ring-1 ring-white/5 shadow-inner mb-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-sidebar flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground font-bold truncate tracking-tight" style={{ fontSize: '14px' }}>
                {user.name}
              </p>
              <p className="text-muted-foreground/70 truncate uppercase tracking-widest font-black" style={{ fontSize: '8px' }}>
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300 font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} />
          Sign Out Portal
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 z-30 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity duration-500"
            onClick={onMobileClose}
          />
          <aside className="relative w-72 bg-sidebar h-full shadow-[25px_0_50px_rgba(0,0,0,0.3)] z-10 transition-transform duration-500">
            <button
              onClick={onMobileClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground z-20"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
