-- 1. Events Sovereignty
DROP POLICY IF EXISTS "Reps can manage their club events" ON events;
CREATE POLICY "Reps can manage their club events" ON events 
    FOR ALL
    USING (EXISTS (SELECT 1 FROM club_reps r WHERE r.club_id = events.club_id AND r.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM club_reps r WHERE r.club_id = events.club_id AND r.user_id = auth.uid()));

-- 2. Roster Sovereignty
DROP POLICY IF EXISTS "Club reps can manage their club members" ON club_members;
CREATE POLICY "Club reps can manage their club members" ON club_members 
    FOR ALL
    USING (EXISTS (SELECT 1 FROM club_reps r WHERE r.club_id = club_members.club_id AND r.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM club_reps r WHERE r.club_id = club_members.club_id AND r.user_id = auth.uid()));

-- 3. Cache Refresh
NOTIFY pgrst, 'reload schema';
