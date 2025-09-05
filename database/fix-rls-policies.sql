-- Fix RLS Policies to Prevent Infinite Recursion
-- Run this in your Supabase SQL editor to fix the authentication issues

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view projects in their organization" ON projects;
DROP POLICY IF EXISTS "Users can view social accounts in their organization" ON social_accounts;
DROP POLICY IF EXISTS "Users can view content in their organization" ON content;
DROP POLICY IF EXISTS "Users can create content in their organization" ON content;
DROP POLICY IF EXISTS "Users can view analytics in their organization" ON content_analytics;

-- Create a function to get user's organization ID without recursion
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM users 
    WHERE id = user_id 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the policies with the helper function to avoid recursion

-- Users policies (simplified to avoid recursion)
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects in their organization" ON projects
    FOR SELECT USING (
        organization_id = get_user_organization_id(auth.uid())
    );

CREATE POLICY "Admins can manage projects in their organization" ON projects
    FOR ALL USING (
        organization_id = get_user_organization_id(auth.uid())
    );

-- Social accounts policies
CREATE POLICY "Users can view social accounts in their organization" ON social_accounts
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id = get_user_organization_id(auth.uid())
        )
    );

-- Content policies
CREATE POLICY "Users can view content in their organization" ON content
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id = get_user_organization_id(auth.uid())
        )
    );

CREATE POLICY "Users can create content in their organization" ON content
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id = get_user_organization_id(auth.uid())
        )
    );

-- Content analytics policies
CREATE POLICY "Users can view analytics in their organization" ON content_analytics
    FOR SELECT USING (
        content_id IN (
            SELECT c.id FROM content c
            JOIN projects p ON c.project_id = p.id
            WHERE p.organization_id = get_user_organization_id(auth.uid())
        )
    );

-- Add a simple policy for users to insert their own record (for development)
CREATE POLICY "Users can insert their own record" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Add a simple policy for organizations to insert (for development)
CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add a simple policy for projects to insert (for development)
CREATE POLICY "Users can create projects in their organization" ON projects
    FOR INSERT WITH CHECK (
        organization_id = get_user_organization_id(auth.uid())
    );
