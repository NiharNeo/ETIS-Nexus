import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { 
  Club, 
  ClubMember,
  ClubEvent, 
  Notification, 
  EventFormData, 
  ClubFormData, 
  EventRegistration,
  Project, 
  ProjectStage, 
  ProjectHealth, 
  Hackathon, 
  DepartmentContribution, 
  ProjectMemory, 
  WikiArticle,
  Announcement,
  AttendanceRecord
} from '../types';

// Alias to avoid conflict with browser Notification
type AppNotification = Notification;
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ShieldAlert, Bell } from 'lucide-react';

interface DataContextValue {
  isLoading: boolean;
  clubs: Club[];
  events: ClubEvent[];
  projects: Project[];
  hackathons: Hackathon[];
  contributions: DepartmentContribution[];
  memories: ProjectMemory[];
  notifications: AppNotification[];
  wikiArticles: WikiArticle[];
  announcements: Announcement[];
  registrations: EventRegistration[];
  // Club actions
  addClub: (data: ClubFormData) => Promise<Club | null>;
  deleteClub: (id: string) => Promise<void>;
  updateClub: (id: string, updates: Partial<Club>) => void;
  approveClub: (id: string) => void;
  rejectClub: (id: string, reason: string) => void;
  // Event actions
  addEvent: (data: any) => Promise<ClubEvent | null>;
  updateEvent: (id: string, updates: Partial<ClubEvent>) => void;
  deleteEvent: (id: string) => void;
  approveEvent: (id: string) => void;
  rejectEvent: (id: string, reason: string) => void;
  submitForApproval: (id: string) => void;
  // Project actions
  updateProjectStage: (id: string, stage: ProjectStage) => void;
  updateProjectHealth: (id: string, health: ProjectHealth) => void;
  archiveProject: (id: string, funFact: string, teamPhoto: string) => void;
  // Hackathon actions
  addHackathon: (data: any) => Promise<boolean>;
  formTeam: (hackathonId: string) => void;
  // Registration actions
  registerForEvent: (eventId: string) => Promise<EventRegistration | null>;
  getRegistrations: (eventId?: string) => Promise<EventRegistration[]>;
  checkInStudent: (regId: string, eventId: string) => Promise<boolean>;
  validateAndCheckIn: (qrPayload: string, eventId: string) => Promise<{ success: boolean; message: string; registration?: EventRegistration }>;
  
  assignRep: (clubId: string, userId: string, action: 'add' | 'remove') => Promise<boolean>;
  getUsers: () => Promise<any[]>;
  getClubMembers: (clubId: string) => Promise<ClubMember[]>;
  addClubMember: (clubId: string, memberData: Omit<ClubMember, 'id' | 'joinDate' | 'clubId'>) => Promise<ClubMember | null>;
  removeClubMember: (clubId: string, memberId: string) => Promise<boolean>;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<void>;
  // Announcement Actions
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<void>;
  // Registration Actions (admin)
  deleteRegistration: (id: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [contributions, setContributions] = useState<DepartmentContribution[]>([]);
  const [memories, setMemories] = useState<ProjectMemory[]>([]);
  const [notifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  const mapClub = useCallback((c: any): Club => ({
    id: c.id,
    name: c.name,
    department: c.department,
    description: c.description,
    shortDescription: c.short_description,
    status: c.status,
    logo: c.logo || '🏛️',
    coverImage: c.cover_image,
    memberCount: c.member_count || 0,
    tags: c.tags || [],
    createdAt: c.created_at,
    repIds: []
  }), []);
  
  const mapMember = useCallback((m: any): ClubMember => ({
    id: m.id,
    clubId: m.club_id,
    userId: m.user_id,
    name: m.profiles?.name || m.name || 'Anonymous Member',
    email: m.profiles?.email || m.email,
    role: m.role,
    joinDate: m.joined_at
  }), []);

  const mapEvent = useCallback((e: any): ClubEvent => ({
    id: e.id,
    clubId: e.club_id,
    title: e.title,
    description: e.description,
    shortDescription: e.short_description,
    date: e.event_date ? e.event_date.split('T')[0] : '',
    startTime: e.start_time,
    endTime: e.end_time,
    venue: e.venue,
    mode: e.mode,
    status: e.status,
    coverImage: e.cover_image,
    registrationLink: e.registration_link,
    tags: e.tags || [],
    capacity: e.capacity,
    createdBy: e.created_by,
    createdAt: e.created_at,
    updatedAt: e.updated_at
  }), []);

  const mapRegistration = useCallback((r: any): EventRegistration => ({
    id: r.id,
    eventId: r.event_id,
    userId: r.user_id,
    status: r.status,
    registeredAt: r.registered_at,
    userName: r.profiles?.name,
    userEmail: r.profiles?.email,
    userDepartment: r.profiles?.department,
    userSrn: r.profiles?.srn,
    userYear: r.profiles?.year,
    qrCodeId: r.qr_code_id,
    ticketId: r.qr_code_id,
    checkedIn: !!r.checked_in
  }), []);

  const mapHackathon = useCallback((h: any): Hackathon => ({
    id: h.id,
    title: h.title,
    organizer: h.organizer,
    description: h.description,
    deadline: h.deadline,
    startDate: h.start_date,
    endDate: h.end_date,
    venue: h.venue,
    mode: h.mode,
    applyLink: h.apply_link,
    coverImage: h.cover_image,
    tags: h.tags || [],
    teamFormationActive: h.team_formation_active
  }), []);

  const mapProject = useCallback((p: any): Project => ({
    id: p.id,
    title: p.title,
    description: p.description,
    department: p.department,
    stage: p.stage as ProjectStage,
    health: p.health as ProjectHealth,
    progress: p.progress,
    lead: p.lead,
    members: p.members,
    techStack: p.tech_stack,
    clubId: p.club_id,
    teamSize: p.team_size,
    startDate: p.start_date,
    expectedCompletion: p.expected_completion,
    updatedAt: p.updated_at
  }), []);

  const mapMemory = useCallback((m: any): ProjectMemory => ({
    id: m.id,
    projectId: m.project_id,
    projectName: m.project_name,
    department: m.department,
    teamMembers: m.team_members || [],
    teamPhoto: m.team_photo,
    demoVideoThumbnail: m.demo_video_thumbnail,
    techStack: m.tech_stack || [],
    funFact: m.fun_fact,
    completionDate: m.completion_date,
    impactScore: m.impact_score
  }), []);

  const mapNotification = useCallback((n: any): AppNotification => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    link: n.link,
    createdAt: n.created_at
  }), []);

  const mapWikiArticle = useCallback((w: any): WikiArticle => ({
    id: w.id,
    title: w.title,
    category: w.category,
    content: w.content,
    author: w.author,
    authorRole: w.author_role,
    tags: w.tags || [],
    viewCount: w.view_count || 0,
    lastUpdated: w.last_updated
  }), []);

  const mapAnnouncement = useCallback((a: any): Announcement => ({
    id: a.id,
    title: a.title,
    content: a.content,
    type: a.type as 'global' | 'club',
    clubId: a.club_id,
    authorId: a.author_id,
    createdAt: a.created_at,
    expiresAt: a.expires_at,
    authorName: a.profiles?.name,
    authorAvatar: a.profiles?.avatar
  }), []);

  const mapContribution = useCallback((c: any): DepartmentContribution => ({
    department: c.department,
    activity: c.activity,
    stats: {
      projects: c.projects_count || 0,
      events: c.events_count || 0,
      papers: c.papers_count || 0,
      totalPoints: c.total_points || 0
    }
  }), []);


  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          clubsRes, 
          eventsRes, 
          hackathonsRes, 
          projectsRes, 
          memoriesRes, 
          wikiRes, 
          contribRes,
          announcementsRes
        ] = await Promise.all([
          supabase.from('clubs').select('*'),
          supabase.from('events').select('*'),
          supabase.from('hackathons').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('project_memories').select('*'),
          supabase.from('wiki_articles').select('*'),
          supabase.from('contributions').select('*'),
          supabase.from('announcements').select('*, profiles:author_id(name, avatar)').order('created_at', { ascending: false })
        ]);

        if (announcementsRes.data) setAnnouncements(announcementsRes.data.map(mapAnnouncement));

        if (clubsRes.data) {
          const { data: allReps } = await supabase.from('club_reps').select('*');
          const mappedClubs = clubsRes.data.map(c => ({
            ...mapClub(c),
            repIds: allReps?.filter(r => r.club_id === c.id).map(r => r.user_id) || []
          }));
          setClubs(mappedClubs);
        }

        if (eventsRes.data) setEvents(eventsRes.data.map(mapEvent));
        if (hackathonsRes.data) setHackathons(hackathonsRes.data.map(mapHackathon));
        if (projectsRes.data) setProjects(projectsRes.data.map(mapProject));
        if (memoriesRes.data) setMemories(memoriesRes.data.map(mapMemory));
        if (wikiRes.data) setWikiArticles(wikiRes.data.map(mapWikiArticle));
        if (contribRes.data) setContributions(contribRes.data.map(mapContribution));

        if (user) {
          const [notifsRes, registrationsRes] = await Promise.all([
            supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('registrations').select(`*, profiles(name, email, department, srn, year)`).eq('user_id', user.id)
          ]);

          if (notifsRes.data) setAppNotifications(notifsRes.data.map(mapNotification));
          if (registrationsRes.data) setRegistrations(registrationsRes.data.map(mapRegistration));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Subscribe to Realtime Notifications
    if (user) {
      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Real-time notification received:', payload);
            const newNotif = mapNotification(payload.new);
            setAppNotifications((prev) => [newNotif, ...prev]);
            
            // Trigger a visual toast as well
            toast.info(newNotif.title, {
              description: newNotif.message,
              icon: <Bell size={16} className="text-primary" />
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setAppNotifications((prev) => 
              prev.map(n => n.id === payload.new.id ? mapNotification(payload.new) : n)
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, mapClub, mapEvent, mapHackathon, mapProject, mapMemory, mapWikiArticle, mapContribution, mapAnnouncement, mapNotification, mapRegistration]);

  const addClub = useCallback(async (data: ClubFormData): Promise<Club | null> => {
    try {
      const { data: newClub, error } = await supabase
        .from('clubs')
        .insert({
          name: data.name,
          department: data.department,
          description: data.description,
          short_description: data.shortDescription,
          tags: data.tags.split(',').map(t => t.trim()),
          logo: data.logo,
          cover_image: data.coverImage,
          status: 'approved'
        })
        .select()
        .single();

      if (error) throw error;
      const mapped = mapClub(newClub);
      setClubs(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Failed to create club:', err);
      return null;
    }
  }, [mapClub]);

  const updateClub = useCallback(async (id: string, updates: Partial<Club>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.shortDescription) dbUpdates.short_description = updates.shortDescription;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.logo) dbUpdates.logo = updates.logo;
      if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.tags) dbUpdates.tags = updates.tags;

      const { data: updated, error } = await supabase
        .from('clubs')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const mapped = mapClub(updated);
      setClubs(prev => prev.map(c => c.id === id ? { ...c, ...mapped } : c));
    } catch (err) {
      console.error('Failed to update club:', err);
    }
  }, [mapClub]);

  const approveClub = useCallback(async (id: string) => {
    await updateClub(id, { status: 'approved' });
  }, [updateClub]);

  const rejectClub = useCallback(async (id: string, reason: string) => {
    await updateClub(id, { status: 'rejected' });
  }, [updateClub]);

  const deleteClub = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('clubs').delete().eq('id', id);
      if (error) throw error;
      setClubs(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete club:', err);
    }
  }, []);


  const addEvent = useCallback(async (data: any): Promise<ClubEvent | null> => {
    try {
      const { data: newEvent, error } = await supabase
        .from('events')
        .insert({
          club_id: data.clubId,
          title: data.title,
          description: data.description,
          short_description: data.description.substring(0, 100),
          event_date: data.date,
          start_time: data.startTime,
          end_time: data.endTime,
          venue: data.venue,
          mode: data.mode,
          status: data.status || 'pending',
          capacity: data.capacity,
          registration_link: data.registrationLink,
          tags: typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags,
          cover_image: data.coverImage,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      const mapped = mapEvent(newEvent);
      setEvents(prev => [...prev, mapped]);

      // Notify Super Admins for approval if it's pending
      if (mapped.status === 'pending') {
        const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
        if (admins) {
          const clubName = clubs.find(c => c.id === data.clubId)?.name || 'a Club';
          await Promise.all(admins.map(admin => 
            supabase.from('notifications').insert({
              user_id: admin.id,
              title: 'New Mission Proposed',
              message: `${clubName} has proposed "${mapped.title}". Approval required.`,
              type: 'info',
              link: '/admin/events'
            })
          ));
        }
      }

      return mapped;
    } catch (err) {
      console.error('Failed to create event:', err);
      return null;
    }
  }, [user, mapEvent, clubs]);

  const updateEvent = useCallback(async (id: string, updates: Partial<ClubEvent>) => {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) {
        dbUpdates.description = updates.description;
        dbUpdates.short_description = updates.description.substring(0, 100);
      }
      if (updates.shortDescription) dbUpdates.short_description = updates.shortDescription;
      if (updates.date) dbUpdates.event_date = updates.date;
      if (updates.startTime) dbUpdates.start_time = updates.startTime;
      if (updates.endTime) dbUpdates.end_time = updates.endTime;
      if (updates.venue) dbUpdates.venue = updates.venue;
      if (updates.mode) dbUpdates.mode = updates.mode;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
      if (updates.registrationLink) dbUpdates.registration_link = updates.registrationLink;
      if (updates.tags) dbUpdates.tags = updates.tags;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;

      const { data: updated, error } = await supabase
        .from('events')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === id ? mapEvent(updated) : e));
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  }, [mapEvent]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  }, []);


  const approveEvent = useCallback(async (id: string) => {
    try {
      const event = events.find(e => e.id === id);
      await updateEvent(id, { status: 'approved' });
      
      if (event) {
        await supabase.from('notifications').insert({
          user_id: event.createdBy,
          title: 'Mission Authorized',
          message: `Your confluence "${event.title}" has been authorized by the Nexus.`,
          type: 'success',
          link: '/rep/events'
        });
      }
    } catch (err) {
      console.error('Failed to approve event:', err);
    }
  }, [updateEvent, events]);

  const rejectEvent = useCallback(async (id: string, reason: string) => {
    try {
      const event = events.find(e => e.id === id);
      await updateEvent(id, { status: 'rejected' });
      
      if (event) {
        await supabase.from('notifications').insert({
          user_id: event.createdBy,
          title: 'Initialization Rejected',
          message: `Mission "${event.title}" requires recalibration. Reason: ${reason}`,
          type: 'error',
          link: '/rep/events'
        });
      }
    } catch (err) {
      console.error('Failed to reject event:', err);
    }
  }, [updateEvent, events]);

  const submitForApproval = useCallback(async (id: string) => {
    await updateEvent(id, { status: 'pending' });
  }, [updateEvent]);

  const updateProjectStage = useCallback(async (id: string, stage: ProjectStage) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ stage, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === id ? { ...p, stage, updatedAt: new Date().toISOString() } : p));
    } catch (err) {
      console.error('Failed to update project stage:', err);
    }
  }, []);

  const updateProjectHealth = useCallback(async (id: string, health: ProjectHealth) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ health, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.map(p => p.id === id ? { ...p, health, updatedAt: new Date().toISOString() } : p));
    } catch (err) {
      console.error('Failed to update project health:', err);
    }
  }, []);

  const archiveProject = useCallback(async (id: string, funFact: string, teamPhoto: string) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;

      const newMemory = {
        project_id: project.id,
        project_name: project.title,
        department: project.department,
        team_members: project.members.map((m: any) => m.name),
        team_photo: teamPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        demo_video_thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
        tech_stack: project.techStack,
        fun_fact: funFact,
        completion_date: new Date().toISOString().split('T')[0],
        impact_score: Math.floor(project.progress * 0.9 + 5),
      };

      const [memRes, delRes] = await Promise.all([
        supabase.from('project_memories').insert(newMemory).select().single(),
        supabase.from('projects').delete().eq('id', id)
      ]);

      if (memRes.error) throw memRes.error;
      if (delRes.error) throw delRes.error;

      setMemories(prev => [mapMemory(memRes.data), ...prev]);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to archive project:', err);
    }
  }, [projects, mapMemory]);

  const addHackathon = useCallback(async (hackathonData: any) => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .insert({
          title: hackathonData.title,
          organizer: hackathonData.organizer,
          description: hackathonData.description,
          deadline: hackathonData.deadline,
          start_date: hackathonData.startDate,
          end_date: hackathonData.endDate,
          venue: hackathonData.venue,
          mode: hackathonData.mode,
          apply_link: hackathonData.applyLink,
          tags: hackathonData.tags,
          cover_image: hackathonData.coverImage,
          team_formation_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setHackathons(prev => [...prev, mapHackathon(data)]);
      return true;
    } catch (err) {
      console.error('Failed to deploy hackathon:', err);
      return false;
    }
  }, [mapHackathon]);

  const formTeam = useCallback((hackathonId: string) => {
    if (!user) return;
    const hackathon = hackathons.find(h => h.id === hackathonId);
    if (!hackathon) return;
    toast.success('Team Formation Activated', {
      description: `A signal has been sent to the Domain Leads for "${hackathon.title}".`
    });
  }, [hackathons, user]);

  const registerForEvent = useCallback(async (eventId: string): Promise<EventRegistration | null> => {
    if (!user) return null;
    try {
      // Step 1: INSERT only — no chained .select() to avoid RLS ambiguity
      const { error: insertError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered'
        });

      if (insertError) {
        // Duplicate key = user already registered; that's OK — proceed to fetch
        if (insertError.code !== '23505') {
          throw insertError;
        }
        console.info('User already registered — fetching existing registration.');
      }

      // Step 2: Fetch the registration row (new or existing) via explicit SELECT
      const { data, error: fetchError } = await supabase
        .from('registrations')
        .select(`*, profiles(name, email, department, srn, year)`)
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !data) {
        console.error('Failed to fetch registration after insert:', fetchError);
        return null;
      }

      const mapped = mapRegistration(data);
      // Upsert into local state
      setRegistrations(prev => {
        const exists = prev.find(r => r.id === mapped.id);
        return exists
          ? prev.map(r => r.id === mapped.id ? mapped : r)
          : [...prev, mapped];
      });
      return mapped;
    } catch (err) {
      console.error('Failed to register for event:', err);
      return null;
    }
  }, [user, mapRegistration]);

  const getRegistrations = useCallback(async (eventId?: string) => {
    try {
      let query = supabase.from('registrations').select(`*, profiles(name, email, department, srn, year)`);
      if (eventId) {
        query = query.eq('event_id', eventId);
      } else if (user) {
        query = query.eq('user_id', user.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      const mapped = data.map(mapRegistration);
      if (!eventId && user) setRegistrations(mapped);
      return mapped;
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      return [];
    }
  }, [user, mapRegistration]);

  const checkInStudent = useCallback(async (regId: string, eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'checked_in', checked_in: true })
        .eq('id', regId);
      if (error) throw error;

      // Log to attendance table (best-effort — non-blocking)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('attendance').insert({
          registration_id: regId,
          event_id: eventId,
          marked_by: session.user.id
        }).then(({ error: attErr }) => {
          if (attErr) console.warn('Attendance log failed (table may not exist yet):', attErr.message);
        });
      }

      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'checked_in', checkedIn: true } : r));
      return true;
    } catch (err) {
      console.error('Failed to check in student:', err);
      return false;
    }
  }, []);

  /**
   * Decode a QR payload JSON string, validate it against the current event,
   * prevent duplicate scans, and mark attendance.
   */
  const validateAndCheckIn = useCallback(async (
    qrPayload: string,
    eventId: string
  ): Promise<{ success: boolean; message: string; registration?: EventRegistration }> => {
    try {
      // 1. Decode payload
      let decoded: { ticket_id?: string; event_id?: string };
      try {
        decoded = JSON.parse(qrPayload);
      } catch {
        // Legacy plain-string QR (raw qr_code_id)
        decoded = { ticket_id: qrPayload, event_id: eventId };
      }

      // 2. Validate event match
      if (decoded.event_id && decoded.event_id !== eventId) {
        return { success: false, message: 'invalid_event' };
      }

      const ticketId = decoded.ticket_id;
      if (!ticketId) {
        return { success: false, message: 'invalid_format' };
      }

      // 3. Look up registration by qr_code_id
      const { data: reg, error: lookupErr } = await supabase
        .from('registrations')
        .select(`*, profiles(name, email, department, srn, year)`)
        .eq('qr_code_id', ticketId)
        .eq('event_id', eventId)
        .single();

      if (lookupErr || !reg) {
        return { success: false, message: 'not_found' };
      }

      // 4. Check if already scanned
      if (reg.checked_in || reg.status === 'checked_in') {
        const mapped = mapRegistration(reg);
        return { success: false, message: 'already_scanned', registration: mapped };
      }

      // 5. Mark attendance
      const checkedIn = await checkInStudent(reg.id, eventId);
      if (!checkedIn) {
        return { success: false, message: 'db_error' };
      }

      const mapped = mapRegistration({ ...reg, checked_in: true, status: 'checked_in' });
      return { success: true, message: 'success', registration: mapped };
    } catch (err) {
      console.error('validateAndCheckIn error:', err);
      return { success: false, message: 'db_error' };
    }
  }, [checkInStudent, mapRegistration]);

  const getUsers = useCallback(async () => {
    if (user?.role !== 'super_admin') {
      console.warn('Access Denied: Sector Directory access limited to Super Admins.');
      return [];
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      return [];
    }
  }, [user]);

  const getClubMembers = useCallback(async (clubId: string): Promise<ClubMember[]> => {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select(`*, profiles:user_id(name, email)`)
        .eq('club_id', clubId);
      if (error) throw error;
      return (data || []).map(mapMember);
    } catch (err) {
      console.error('Failed to get club members:', err);
      return [];
    }
  }, [mapMember]);

  const addClubMember = useCallback(async (clubId: string, memberData: any): Promise<ClubMember | null> => {
    try {
      let linkedUserId = memberData.userId;

      // Email Discovery: If no userId provided, attempt to resolve via email
      if (!linkedUserId && memberData.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('email', memberData.email)
          .single();
        if (profile) linkedUserId = profile.id;
      }

      const { data, error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: linkedUserId || null,
          name: memberData.name,
          email: memberData.email,
          role: memberData.role
        })
        .select(`*, profiles:user_id(name, email, role)`)
        .single();
      
      if (error) throw error;

      // Sync member count
      const { count: memberCount } = await supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('club_id', clubId);
      if (memberCount !== null) {
        await supabase.from('clubs').update({ member_count: memberCount }).eq('id', clubId);
        setClubs(prev => prev.map(c => c.id === clubId ? { ...c, memberCount: memberCount } : c));
      }

      if (memberData.role === 'Club Representative' && linkedUserId) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', linkedUserId).single();
        
        // PROTECTION: Only upgrade role if the user is a student. Never downgrade super_admin.
        const roleUpdatePromise = profile?.role === 'student' 
          ? supabase.from('profiles').update({ role: 'club_rep' }).eq('id', linkedUserId)
          : Promise.resolve();

        await Promise.all([
          supabase.from('club_reps').upsert({ club_id: clubId, user_id: linkedUserId }),
          roleUpdatePromise
        ]);
        
        const { data: allReps } = await supabase.from('club_reps').select('*');
        setClubs(prev => prev.map(c => ({
          ...c,
          repIds: allReps?.filter(r => r.club_id === c.id).map(r => r.user_id) || []
        })));
      }
      return mapMember(data);
    } catch (err) {
      console.error('Failed to add club member:', err);
      return null;
    }
  }, [mapMember, mapClub]);

  const removeClubMember = useCallback(async (clubId: string, memberId: string): Promise<boolean> => {
    try {
      const { data: member } = await supabase.from('club_members').select('*').eq('id', memberId).single();
      const { error } = await supabase.from('club_members').delete().eq('id', memberId);
      if (error) throw error;

      // Sync member count
      const { count: memberCount } = await supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('club_id', clubId);
      if (memberCount !== null) {
        await supabase.from('clubs').update({ member_count: memberCount }).eq('id', clubId);
        setClubs(prev => prev.map(c => c.id === clubId ? { ...c, memberCount: memberCount } : c));
      }

      if (member && member.role === 'Club Representative' && member.user_id) {
        await supabase.from('club_reps').delete().match({ club_id: clubId, user_id: member.user_id });
        const { count } = await supabase.from('club_reps').select('*', { count: 'exact', head: true }).eq('user_id', member.user_id);
        if (count === 0) {
          await supabase.from('profiles').update({ role: 'student' }).eq('id', member.user_id);
        }
        const { data: allReps } = await supabase.from('club_reps').select('*');
        setClubs(prev => prev.map(c => ({
          ...c,
          repIds: allReps?.filter(r => r.club_id === c.id).map(r => r.user_id) || []
        })));
      }
      return true;
    } catch (err) {
      console.error('Failed to remove club member:', err);
      return false;
    }
  }, []);

  const assignRep = useCallback(async (clubId: string, userId: string, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { data: profile } = await supabase.from('profiles').select('name, email, role').eq('id', userId).single();
        
        // PROTECTION: Only upgrade role if student
        const roleUpdatePromise = profile?.role === 'student'
          ? supabase.from('profiles').update({ role: 'club_rep' }).eq('id', userId)
          : Promise.resolve();

        await Promise.all([
          supabase.from('club_reps').upsert({ club_id: clubId, user_id: userId }),
          roleUpdatePromise,
          supabase.from('club_members').upsert({ 
            club_id: clubId, 
            user_id: userId, 
            role: 'Club Representative',
            name: profile?.name || 'Unknown',
            email: profile?.email
          })
        ]);
      } else {
        await Promise.all([
          supabase.from('club_reps').delete().match({ club_id: clubId, user_id: userId }),
          supabase.from('club_members').delete().match({ club_id: clubId, user_id: userId, role: 'Club Representative' })
        ]);
        const { count } = await supabase.from('club_reps').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        if (count === 0) {
          await supabase.from('profiles').update({ role: 'student' }).eq('id', userId);
        }
      }
      const { data: allReps } = await supabase.from('club_reps').select('*');
      
      // Sync member count
      const { count: memberCount } = await supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('club_id', clubId);
      if (memberCount !== null) {
        await supabase.from('clubs').update({ member_count: memberCount }).eq('id', clubId);
        setClubs(prev => prev.map(c => c.id === clubId ? { ...c, memberCount: memberCount, repIds: allReps?.filter(r => r.club_id === c.id).map(r => r.user_id) || [] } : {
          ...c,
          repIds: allReps?.filter(r => r.club_id === c.id).map(r => r.user_id) || []
        }));
      } else {
        setClubs(prev => prev.map(c => ({
          ...c,
          repIds: allReps?.filter(r => r.club_id === c.id).map(r => r.user_id) || []
        })));
      }
      return true;
    } catch (err) {
      console.error('Failed to assign rep:', err);
      return false;
    }
  }, []);

  const addNotification = useCallback(async (notif: Omit<AppNotification, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ ...notif, read: false })
        .select()
        .single();
      if (error) throw error;
      setAppNotifications(prev => [mapNotification(data), ...prev]);
    } catch (err) {
      console.error('Failed to add notification:', err);
    }
  }, [mapNotification]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setAppNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      setAppNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  }, [user]);

  const addAnnouncement = useCallback(async (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const { data: res, error } = await supabase
        .from('announcements')
        .insert({
          title: data.title,
          content: data.content,
          type: data.type,
          club_id: data.clubId || null,
          author_id: user?.id,
          expires_at: data.expiresAt || null
        })
        .select('*, profiles:author_id(name, avatar)')
        .single();

      if (error) throw error;
      setAnnouncements(prev => [mapAnnouncement(res), ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to add announcement:', err);
      return false;
    }
  }, [user, mapAnnouncement]);

  const updateAnnouncement = useCallback(async (id: string, data: Partial<Announcement>) => {
    try {
      const dbData: any = {};
      if (data.title !== undefined) dbData.title = data.title;
      if (data.content !== undefined) dbData.content = data.content;
      if (data.type !== undefined) dbData.type = data.type;
      if (data.clubId !== undefined) dbData.club_id = data.clubId || null;
      if (data.expiresAt !== undefined) dbData.expires_at = data.expiresAt || null;

      const { data: updated, error } = await supabase
        .from('announcements')
        .update(dbData)
        .eq('id', id)
        .select('*, profiles:author_id(name, avatar)')
        .single();

      if (error) throw error;
      setAnnouncements(prev => prev.map(a => a.id === id ? mapAnnouncement(updated) : a));
      return true;
    } catch (err) {
      console.error('Failed to update announcement:', err);
      return false;
    }
  }, [mapAnnouncement]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Broadcast Terminated', {
        description: 'The signal has been removed from the nexus.'
      });
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  }, []);

  const deleteRegistration = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (error) throw error;
      setRegistrations(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete registration:', err);
      return false;
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        isLoading,
        clubs,
        events,
        projects,
        hackathons,
        contributions,
        memories,
        notifications,
        wikiArticles,
        announcements,
        registrations,
        addClub,
        updateClub,
        approveClub,
        rejectClub,
        deleteClub,
        addEvent,
        updateEvent,
        deleteEvent,
        approveEvent,
        rejectEvent,
        submitForApproval,
        updateProjectStage,
        updateProjectHealth,
        archiveProject,
        addHackathon,
        formTeam,
        registerForEvent,
        getRegistrations,
        checkInStudent,
        validateAndCheckIn,
        getClubMembers,
        addClubMember,
        removeClubMember,
        markNotificationRead,
        markAllNotificationsRead,
        getUsers,
        assignRep,
        addNotification,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        deleteRegistration
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
