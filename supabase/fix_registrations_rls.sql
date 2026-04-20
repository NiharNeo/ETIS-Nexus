-- Fix: Restore all RLS policies for the registrations table
-- Run this in Supabase SQL Editor OR via psql

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Users can register for events" ON registrations;
DROP POLICY IF EXISTS "Reps can view registrations for their events" ON registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Reps can update registrations for their events" ON registrations;

-- Re-create all policies cleanly
-- 1. Students/anyone can SELECT their own registrations
CREATE POLICY "Users can view own registrations"
ON registrations FOR SELECT
USING (user_id = auth.uid());

-- 2. Club Reps can SELECT all registrations for their events
CREATE POLICY "Reps can view registrations for their events"
ON registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM club_reps r
    JOIN events e ON r.club_id = e.club_id
    WHERE e.id = registrations.event_id AND r.user_id = auth.uid()
  )
);

-- 3. Super admins can SELECT all registrations
CREATE POLICY "Admins can view all registrations"
ON registrations FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- 4. Any authenticated user can INSERT their own registration
CREATE POLICY "Users can register for events"
ON registrations FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 5. Reps can UPDATE (check-in) registrations for their events
CREATE POLICY "Reps can update registrations for their events"
ON registrations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM club_reps r
    JOIN events e ON r.club_id = e.club_id
    WHERE e.id = registrations.event_id AND r.user_id = auth.uid()
  )
);

-- 6. Admins can UPDATE any registration
CREATE POLICY "Admins can update all registrations"
ON registrations FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
