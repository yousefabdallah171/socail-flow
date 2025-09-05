-- TEMPORARY: Disable RLS for Development Testing
-- !!!!! REMOVE THIS IN PRODUCTION - ENABLE RLS FOR SECURITY !!!!!

-- Disable RLS on all tables for development
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- This allows all operations during development
-- In production, you MUST re-enable RLS and use proper policies
