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
  Bell,
  Ticket,
  ScanLine,
  UserCheck
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
    label: 'My Tickets',
    icon: <Ticket size={18} />,
    to: '/my-tickets',
    roles: ['super_admin', 'club_rep', 'student'],
  },
  {
    label: 'QR Scanner',
    icon: <ScanLine size={18} />,
    to: '/scan',
    roles: ['super_admin', 'club_rep'],
  },
  {
    label: 'Attendance Hub',
    icon: <UserCheck size={18} />,
    to: '/attendance',
    roles: ['super_admin', 'club_rep'],
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
    <div className="flex flex-col h-full bg-sidebar">
      {/* Branding */}
      <div className="px-8 py-10 border-b border-border/50">
        <div className="flex flex-col">
          <h1 className="text-foreground tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontStyle: 'italic' }}>
            ETIS <br/><span className="text-primary not-italic font-bold">Nexus</span>.
          </h1>
          <div className="flex items-center gap-2 mt-6">
            <span className="w-2 h-2 bg-primary"></span>
            <p className="text-foreground uppercase tracking-[0.2em] font-medium" style={{ fontSize: '9px' }}>
              Intelligence Sector
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-6 py-8">
        <div>
          <p className="px-4 mb-4 text-foreground/50 uppercase tracking-[0.2em] font-bold" style={{ fontSize: '10px' }}>
            Main Menu
          </p>
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 border-l-[3px] transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-muted border-primary text-primary font-bold'
                      : 'border-transparent text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-transform duration-300 group-hover:-translate-y-0.5 ${isActive ? 'text-primary' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold tracking-tight uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Categories Placeholder */}
        <div className="mt-8">
          <p className="px-4 mb-4 text-foreground/50 uppercase tracking-[0.2em] font-bold" style={{ fontSize: '10px' }}>
            Explore Categories
          </p>
          <div className="px-4 space-y-3">
            <div className="flex items-center gap-3 text-foreground/70 hover:text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 border border-foreground/30 group-hover:bg-primary group-hover:border-primary transition-colors"></div>
              <span className="text-xs font-medium uppercase tracking-wider" style={{fontSize: '10px'}}>Tech & Engineering</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/70 hover:text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 border border-foreground/30 group-hover:bg-primary group-hover:border-primary transition-colors"></div>
              <span className="text-xs font-medium uppercase tracking-wider" style={{fontSize: '10px'}}>Arts & Culture</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/70 hover:text-primary cursor-pointer transition-colors group">
              <div className="w-2 h-2 border border-foreground/30 group-hover:bg-primary group-hover:border-primary transition-colors"></div>
              <span className="text-xs font-medium uppercase tracking-wider" style={{fontSize: '10px'}}>Sports & Fitness</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Profile */}
      <div className="p-4 bg-sidebar border-t border-border/50">
        {user && (
          <div className="flex items-center gap-4 p-3 bg-muted border border-border mb-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 object-cover border border-border grayscale hover:grayscale-0 transition-all"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-bold truncate tracking-tight" style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                {user.name}
              </p>
              <p className="text-foreground/70 truncate uppercase tracking-widest" style={{ fontSize: '9px' }}>
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full py-3 border border-border hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} />
          Sign Out
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
