-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'club_rep', 'student');
CREATE TYPE club_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'student',
    department TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clubs Table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    status club_status DEFAULT 'approved',
    logo TEXT,
    cover_image TEXT,
    member_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Club Members Table (Mapping users to clubs with specific roles)
CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Member', -- e.g., 'President', 'Member', 'Treasurer'
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Club Reps Table (Explicitly for access control)
-- Note: A user in this table is a 'club_rep' and can manage the specific club
CREATE TABLE club_reps (
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (club_id, user_id)
);

-- 6. Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    start_time TEXT,
    end_time TEXT,
    venue TEXT,
    mode TEXT NOT NULL,
    status event_status DEFAULT 'pending',
    capacity INTEGER,
    tags TEXT[],
    cover_image TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 8. Hackathons Table
CREATE TABLE hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    mode TEXT NOT NULL,
    apply_link TEXT,
    cover_image TEXT,
    tags TEXT[],
    team_formation_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Clubs Policies
CREATE POLICY "Public read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Admins can manage clubs" ON clubs FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Club Members Policies
CREATE POLICY "Public read club members" ON club_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage club members" ON club_members FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Club reps can manage their club members" ON club_members FOR ALL
    USING (EXISTS (SELECT 1 FROM club_reps WHERE club_id = club_members.club_id AND user_id = auth.uid()));

-- Club Reps Policies
CREATE POLICY "Public read club reps" ON club_reps FOR SELECT USING (true);
CREATE POLICY "Admins can manage club reps" ON club_reps FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Events Policies
CREATE POLICY "Public read events" ON events FOR SELECT USING (status = 'approved');
CREATE POLICY "Reps and Admins can view all events" ON events FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin') OR
        EXISTS (SELECT 1 FROM club_reps WHERE club_id = events.club_id AND user_id = auth.uid()) OR
        created_by = auth.uid()
    );
CREATE POLICY "Reps can manage their club events" ON events FOR ALL
    USING (EXISTS (SELECT 1 FROM club_reps WHERE club_id = events.club_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all events" ON events FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Registrations Policies
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can register for events" ON registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Reps can view registrations for their events" ON registrations FOR SELECT 
    USING (EXISTS (SELECT 1 FROM club_reps r JOIN events e ON r.club_id = e.club_id WHERE e.id = registrations.event_id AND r.user_id = auth.uid()));

-- Hackathons Policies
CREATE POLICY "Public read hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Admins can manage hackathons" ON hackathons FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- 10. Trigger for Profile Creation
-- This function will be called when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, department)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        'student', -- Default role
        NEW.raw_user_meta_data->>'department'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    department TEXT NOT NULL,
    stage TEXT NOT NULL, -- P1-P5
    health TEXT NOT NULL, -- green, yellow, red
    progress INTEGER DEFAULT 0,
    lead TEXT NOT NULL,
    members JSONB DEFAULT '[]'::jsonb,
    tech_stack TEXT[] DEFAULT '{}',
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    team_size INTEGER DEFAULT 1,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expected_completion TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Project Memories Table
CREATE TABLE project_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    project_name TEXT NOT NULL,
    department TEXT NOT NULL,
    team_members TEXT[] DEFAULT '{}',
    team_photo TEXT,
    demo_video_thumbnail TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    fun_fact TEXT,
    completion_date TIMESTAMPTZ DEFAULT NOW(),
    impact_score INTEGER DEFAULT 0
);

-- 13. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Wiki Articles Table
CREATE TABLE wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT,
    author TEXT,
    author_role TEXT,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Contributions Table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department TEXT NOT NULL UNIQUE,
    activity JSONB DEFAULT '[]'::jsonb, -- Array of {date, count}
    projects_count INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    papers_count INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Additional RLS Policies

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Projects Policies
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON projects FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "Club reps can manage their club projects" ON projects FOR ALL
    USING (EXISTS (SELECT 1 FROM club_reps WHERE club_id = projects.club_id AND user_id = auth.uid()));

-- Project Memories Policies
CREATE POLICY "Public read memories" ON project_memories FOR SELECT USING (true);
CREATE POLICY "Admins can manage memories" ON project_memories FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Wiki Articles Policies
CREATE POLICY "Public read wiki" ON wiki_articles FOR SELECT USING (true);
CREATE POLICY "Admins and Reps can manage wiki" ON wiki_articles FOR ALL 
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'super_admin' OR role = 'club_rep'))
    );

-- 17. Announcements Table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'global',
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 18. Membership Requests Table
CREATE TABLE membership_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    UNIQUE(club_id, user_id)
);

-- 19. Update Registrations
ALTER TABLE registrations ADD COLUMN checked_in BOOLEAN DEFAULT FALSE;
ALTER TABLE registrations ADD COLUMN qr_code_id UUID DEFAULT gen_random_uuid();

-- 20. RLS for new tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage global announcements" ON announcements FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Users can see own requests" ON membership_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can submit requests" ON membership_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Reps can manage requests" ON membership_requests FOR ALL 
    USING (EXISTS (SELECT 1 FROM club_reps WHERE club_id = membership_requests.club_id AND user_id = auth.uid()));

