import { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  requireAuth?: boolean;
  requiredRole?: string[];
  title?: string;
}

export function AppLayout({ requireAuth = true, requiredRole, title }: AppLayoutProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 overflow-hidden relative isolate">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/50 to-violet-500/50 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt" />
          <div className="relative flex items-center justify-center">
            <GraduationCap size={48} className="text-white animate-bounce" />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <h2 className="text-white font-bold text-xl tracking-tight">Initializing Session</h2>
          <div className="flex items-center gap-1.5 h-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>

        <p className="mt-6 text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2">
          Syncing with Institutional Protocols...
        </p>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50/50 relative overflow-hidden isolate">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50/40 to-white/40 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-100/50 to-transparent -z-10 pointer-events-none" />

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
