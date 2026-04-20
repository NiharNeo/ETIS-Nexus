import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import EventsPage from './pages/EventsPage';
import RepEventsPage from './pages/RepEventsPage';
import CreateEventPage from './pages/CreateEventPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminClubsPage from './pages/AdminClubsPage';
import AdminEventsPage from './pages/AdminEventsPage';
import EventManagePage from './pages/EventManagePage';
import ProjectPipelinePage from './pages/ProjectPipelinePage';
import HackathonRadarPage from './pages/HackathonRadarPage';
import ContributionRadarPage from './pages/ContributionRadarPage';
import ProjectMemoryWallPage from './pages/ProjectMemoryWallPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import SettingsPage from './pages/SettingsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    // Main authenticated layout
    Component: AppLayout,
    children: [
      {
        path: '/dashboard',
        Component: DashboardPage,
      },
      {
        path: '/settings',
        Component: SettingsPage,
      },
      {
        path: '/calendar',
        Component: CalendarPage,
      },
      {
        path: '/pipeline',
        Component: ProjectPipelinePage,
      },
      {
        path: '/hackathons',
        Component: HackathonRadarPage,
      },
      {
        path: '/contributions',
        Component: ContributionRadarPage,
      },
      {
        path: '/memories',
        Component: ProjectMemoryWallPage,
      },
      {
        path: '/knowledge',
        Component: KnowledgeBasePage,
      },
      {
        path: '/announcements',
        Component: AnnouncementsPage,
      },
      {
        path: '/clubs',
        Component: ClubsPage,
      },
      {
        path: '/clubs/:id',
        Component: ClubDetailPage,
      },
      {
        path: '/events',
        Component: EventsPage,
      },
      {
        path: '/events/:id/manage',
        Component: EventManagePage,
      },
      // Club Rep Routes
      {
        path: '/rep/events',
        Component: RepEventsPage,
      },
      {
        path: '/rep/events/new',
        Component: CreateEventPage,
      },
      // Admin Routes
      {
        path: '/admin',
        Component: AdminDashboardPage,
      },
      {
        path: '/admin/clubs',
        Component: AdminClubsPage,
      },
      {
        path: '/admin/events',
        Component: AdminEventsPage,
      },
    ],
  },
  {
    path: '/',
    Component: LoginPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);