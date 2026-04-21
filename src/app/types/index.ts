// ─── User & Auth Types ──────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'club_rep' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clubIds?: string[]; // for club_rep: clubs they manage
  department?: string;
  year?: string;
  srn?: string;
  phone?: string;
  phoneVerified?: boolean;
  authProvider?: string;
  createdAt: string;
  settings?: {
    theme?: string;
    widgets?: {
      activity: boolean;
      growth: boolean;
      updates: boolean;
      events: boolean;
    };
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ─── Club Types ──────────────────────────────────────────────────────────────
export type ClubStatus = 'pending' | 'approved' | 'rejected';

export interface ClubMember {
  id: string;
  clubId: string;
  userId?: string;
  name: string;
  email?: string;
  role: string;
  joinDate: string;
}

export interface Club {
  id: string;
  name: string;
  department: string;
  logo: string;
  coverImage?: string;
  description: string;
  shortDescription: string;
  status: ClubStatus;
  repIds: string[]; // max 2
  memberCount: number;
  tags: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  members?: ClubMember[];
}

// ─── Event Types ──────────────────────────────────────────────────────────────
export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type EventMode = 'online' | 'offline' | 'hybrid';

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: 'registered' | 'checked_in';
  registeredAt: string;
  /** UUID stored in qr_code_id column — used as the ticket_id inside the QR payload */
  qrCodeId: string;
  /** Alias for qrCodeId — human-readable reference */
  ticketId?: string;
  userName?: string;
  userEmail?: string;
  userDepartment?: string;
  userSrn?: string;
  userYear?: string;
  checkedIn: boolean;
}

// ─── Attendance Types ─────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  registrationId: string;
  eventId: string;
  scannedAt: string;
  markedBy: string;
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  mode: EventMode;
  status: EventStatus;
  coverImage?: string;
  registrationLink?: string;
  tags: string[];
  capacity?: number;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

// ─── Notification Types ──────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// ─── Hackathon Types ─────────────────────────────────────────────────────────
export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  description: string;
  deadline: string; // ISO date string
  startDate: string;
  endDate: string;
  venue: string;
  mode: 'online' | 'offline' | 'hybrid';
  applyLink: string;
  coverImage: string;
  tags: string[];
  teamFormationActive: boolean;
}

export interface HackathonFilters {
  mode?: 'online' | 'offline' | 'hybrid' | 'all';
  search?: string;
  onlyTeamFormation?: boolean;
}

// ─── Heatmap Types ───────────────────────────────────────────────────────────
export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DepartmentContribution {
  department: string;
  activity: ContributionDay[];
  stats: {
    projects: number;
    events: number;
    papers: number;
    totalPoints: number;
  };
}

// ─── Project Memory Wall Types ───────────────────────────────────────────────
export interface ProjectMemory {
  id: string;
  projectId: string;
  projectName: string;
  department: string;
  teamMembers: string[];
  teamPhoto: string;
  demoVideoThumbnail: string; // Thumbnail URL
  techStack: string[];
  funFact: string;
  completionDate: string;
  impactScore: number;
}

// ─── Wiki / Knowledge Base Types ─────────────────────────────────────────────
export type WikiCategory = 'GitHub' | 'Project Management' | 'Technical' | 'Process' | 'General';

export interface WikiArticle {
  id: string;
  title: string;
  category: WikiCategory;
  content: string; // Markdown or rich text
  author: string;
  authorRole: string;
  lastUpdated: string;
  tags: string[];
  viewCount: number;
}

// ─── Announcement Types ───────────────────────────────────────────────────
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'global' | 'club';
  clubId?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  expiresAt?: string;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────
export interface MonthlyEventCount {
  month: string;
  events: number;
  approved: number;
  pending: number;
}

export interface ClubActivity {
  clubId: string;
  clubName: string;
  department: string;
  eventCount: number;
  approvedEvents: number;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

// ─── Form Types ──────────────────────────────────────────────────────────────
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  mode: EventMode;
  registrationLink?: string;
  capacity?: number;
  tags: string;
  coverImage?: string;
}

export interface ClubFormData {
  name: string;
  department: string;
  description: string;
  shortDescription: string;
  tags: string;
  logo?: string;
  coverImage?: string;
}

// ─── Project Types ────────────────────────────────────────────────────────────
export type ProjectStage = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export type ProjectHealth = 'green' | 'yellow' | 'red';

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  department: string;
  stage: ProjectStage;
  health: ProjectHealth;
  progress: number; // 0-100
  lead: string;
  members: ProjectMember[];
  techStack: string[];
  clubId?: string;
  teamSize: number;
  startDate: string;
  expectedCompletion: string;
  updatedAt: string;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────
export interface EventFilters {
  clubId?: string;
  department?: string;
  mode?: EventMode | '';
  dateFrom?: string;
  dateTo?: string;
  status?: EventStatus | '';
  search?: string;
}

export interface ProjectFilters {
  department?: string;
  stage?: ProjectStage | 'all';
  health?: ProjectHealth | 'all';
  search?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    clubName: string;
    venue: string;
    mode: EventMode;
    status: EventStatus;
    description: string;
    clubId: string;
    startTime: string;
    endTime: string;
  };
}
