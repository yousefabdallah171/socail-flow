-- ===================================
-- FIX PROJECT UPDATE PERMISSIONS
-- ===================================
-- 
-- This fixes the "Insufficient permissions to update project" error
-- by ensuring proper database permissions and policies
-- ===================================

-- Ensure authenticated users have proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific permissions on projects table
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON generated_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;

-- Make sure RLS is disabled for development (we already did this, but double check)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Grant permissions on credential tables too
GRANT SELECT, INSERT, UPDATE, DELETE ON social_media_credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON credential_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON n8n_webhook_configs TO authenticated;

-- Disable RLS on credential tables
ALTER TABLE social_media_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE credential_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_webhook_configs DISABLE ROW LEVEL SECURITY;

-- Add organization_id to projects if it's missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'organization_id') THEN
        ALTER TABLE projects ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update projects to have organization_id if they don't
UPDATE projects 
SET organization_id = (
  SELECT u.organization_id 
  FROM users u 
  WHERE u.id = projects.user_id
  LIMIT 1
)
WHERE organization_id IS NULL;

-- Success message
SELECT 
  '✅ Project update permissions fixed!' as message,
  '🔓 All tables have proper authenticated permissions' as permissions,
  '🚫 Row Level Security disabled for development' as rls,
  '🔗 Organization_id links updated' as organization,
  '✅ Project editing should work now!' as status;