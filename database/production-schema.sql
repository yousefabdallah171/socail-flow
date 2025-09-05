-- Production-ready database schema for SocialFlow
-- Execute this script in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  industry VARCHAR(100),
  description TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
  team_size INTEGER DEFAULT 1,
  projects_limit INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User organizations junction table (many-to-many)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'member', 'viewer')),
  is_default BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Enhanced projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- AI and Content Settings
  industry VARCHAR(100),
  target_audience TEXT,
  brand_voice TEXT,
  content_guidelines TEXT,
  default_tone VARCHAR(20) DEFAULT 'professional' CHECK (default_tone IN ('professional', 'casual', 'funny', 'inspiring', 'promotional')),
  default_content_type VARCHAR(20) DEFAULT 'post' CHECK (default_content_type IN ('post', 'story', 'reel', 'thread')),
  keywords TEXT[],
  hashtag_strategy TEXT,
  
  -- Project Management
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  
  -- Budget and Resources
  budget_allocated DECIMAL(12,2),
  budget_spent DECIMAL(12,2) DEFAULT 0,
  
  -- Metrics
  team_members_count INTEGER DEFAULT 1,
  content_count INTEGER DEFAULT 0,
  social_accounts_count INTEGER DEFAULT 0,
  
  -- Visual and Technical Settings
  color_scheme JSONB,
  logo_url TEXT,
  website_url TEXT,
  posting_schedule JSONB,
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization_id, slug)
);

-- Project members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('manager', 'editor', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  added_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enhanced content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Content Data
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[],
  platforms TEXT[],
  
  -- AI Generation Info
  ai_generated BOOLEAN DEFAULT false,
  ai_provider VARCHAR(50),
  generation_success BOOLEAN DEFAULT true,
  ai_settings JSONB DEFAULT '{}',
  
  -- Content Management
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project activity log
CREATE TABLE IF NOT EXISTS project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube')),
  account_name VARCHAR(255),
  account_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, platform, account_id)
);

-- Content scheduling
CREATE TABLE IF NOT EXISTS content_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  platform_post_id VARCHAR(255),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content analytics
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_content_project_id ON generated_content(project_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_project_id ON social_accounts(project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- User organizations policies
CREATE POLICY "Users can view their organization memberships" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects in their organizations" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert projects in their organizations" ON projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can update projects in their organizations" ON projects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Users can delete projects in their organizations" ON projects
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Content policies
CREATE POLICY "Users can view content in their organization projects" ON generated_content
  FOR SELECT USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN user_organizations uo ON p.organization_id = uo.organization_id
      WHERE uo.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create content in their organization projects" ON generated_content
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN user_organizations uo ON p.organization_id = uo.organization_id
      WHERE uo.user_id = auth.uid() AND uo.role IN ('owner', 'admin', 'editor', 'member')
    )
  );

CREATE POLICY "Users can update content they created or in their orgs" ON generated_content
  FOR UPDATE USING (
    created_by = auth.uid() OR
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN user_organizations uo ON p.organization_id = uo.organization_id
      WHERE uo.user_id = auth.uid() AND uo.role IN ('owner', 'admin', 'editor')
    )
  );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_content_schedule_updated_at BEFORE UPDATE ON content_schedule FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION create_default_organization_for_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create a default organization
  INSERT INTO organizations (name, slug, industry, description)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', 'My Organization'), 
    COALESCE(NEW.raw_user_meta_data->>'name', 'user-' || NEW.id::text),
    'General',
    'Default organization for ' || COALESCE(NEW.email, 'user')
  )
  RETURNING id INTO org_id;
  
  -- Add user as owner
  INSERT INTO user_organizations (user_id, organization_id, role, is_default)
  VALUES (NEW.id, org_id, 'owner', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default organization
CREATE TRIGGER create_default_org_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_default_organization_for_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Sample data for testing (optional)
-- INSERT INTO organizations (name, slug, industry, description) VALUES 
-- ('Acme Marketing Agency', 'acme-marketing', 'Marketing', 'Full-service digital marketing agency');

COMMIT;