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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground overflow-hidden relative isolate">
        <div className="relative group">
          <div className="relative flex items-center justify-center border border-border p-8">
            <GraduationCap size={48} className="text-primary" strokeWidth={1} />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <h2 className="font-bold text-xl tracking-tight uppercase" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}>Initializing</h2>
          <div className="w-12 h-[2px] bg-primary animate-pulse" />
        </div>

        <p className="mt-6 text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Curating Specimen...
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

  // Mandatory Onboarding Guard for Students
  const isIncompleteStudent = user?.role === 'student' && (!user.department || !user.year || !user.srn);
  const isCurrentlyOnboarding = window.location.pathname === '/onboarding';

  if (requireAuth && isAuthenticated && isIncompleteStudent && !isCurrentlyOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex h-screen bg-background relative overflow-hidden isolate">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative border-l border-border/50">
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
