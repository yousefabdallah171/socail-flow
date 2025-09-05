-- =====================================================
-- SocialFlow Phase 2: Enhanced Project Management Schema
-- =====================================================
-- This script creates the enhanced project management system
-- that supports multi-organization, AI-configured projects

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER-ORGANIZATION RELATIONSHIPS
-- =====================================================
-- Support multiple organizations per user (marketing agencies managing multiple clients)

CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'member', 'viewer')),
  is_default BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}', -- Custom permissions per organization
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- =====================================================
-- 2. ENHANCED ORGANIZATIONS TABLE
-- =====================================================
-- Add organization management and subscription features

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS projects_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS social_accounts_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS monthly_content_limit INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- =====================================================
-- 3. ENHANCED PROJECTS TABLE  
-- =====================================================
-- Add comprehensive project settings for AI content generation

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS brand_voice TEXT,
ADD COLUMN IF NOT EXISTS content_guidelines TEXT,
ADD COLUMN IF NOT EXISTS default_tone VARCHAR(50) DEFAULT 'professional' CHECK (default_tone IN ('professional', 'casual', 'funny', 'inspiring', 'promotional')),
ADD COLUMN IF NOT EXISTS default_content_type VARCHAR(50) DEFAULT 'post' CHECK (default_content_type IN ('post', 'story', 'reel', 'thread')),
ADD COLUMN IF NOT EXISTS keywords TEXT[], -- Array of keywords
ADD COLUMN IF NOT EXISTS hashtag_strategy TEXT,
ADD COLUMN IF NOT EXISTS posting_schedule JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS color_scheme JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS budget_allocated DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS budget_spent DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_members_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_accounts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 4. PROJECT TEAM MEMBERS
-- =====================================================
-- Manage who has access to each project

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('manager', 'editor', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  added_by UUID REFERENCES users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

-- =====================================================
-- 5. PROJECT ANALYTICS
-- =====================================================
-- Track project performance and metrics

CREATE TABLE IF NOT EXISTS project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_posts INTEGER DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  total_engagements BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
  top_performing_platform VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, date)
);

-- =====================================================
-- 6. ENHANCED USERS TABLE
-- =====================================================
-- Add user preferences and current context

ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS current_project_id UUID REFERENCES projects(id),
ADD COLUMN IF NOT EXISTS last_organization_switch TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_project_switch TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- =====================================================
-- 7. CONTENT ENHANCEMENTS
-- =====================================================
-- Link content to projects and add AI generation tracking

ALTER TABLE content
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id),
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{}', -- Store AI generation settings used
ADD COLUMN IF NOT EXISTS performance_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost DECIMAL(8,2) DEFAULT 0;

-- =====================================================
-- 8. SOCIAL ACCOUNTS ENHANCEMENTS  
-- =====================================================
-- Link social accounts to organizations instead of just projects

ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'business' CHECK (account_type IN ('personal', 'business', 'creator')),
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'pending')),
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'connected' CHECK (sync_status IN ('connected', 'disconnected', 'error', 'expired'));

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- User-Organization relationships
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_default ON user_organizations(user_id, is_default) WHERE is_default = true;

-- Enhanced users
CREATE INDEX IF NOT EXISTS idx_users_current_org ON users(current_organization_id);
CREATE INDEX IF NOT EXISTS idx_users_current_project ON users(current_project_id);

-- Enhanced projects
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_industry ON projects(industry);
CREATE INDEX IF NOT EXISTS idx_projects_last_activity ON projects(last_activity_at DESC);

-- Project members
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Project analytics
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_date ON project_analytics(project_id, date DESC);

-- Content enhancements
CREATE INDEX IF NOT EXISTS idx_content_project ON content(project_id);
CREATE INDEX IF NOT EXISTS idx_content_performance ON content(performance_score DESC);

-- Social accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_org ON social_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_sync ON social_accounts(sync_status);

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;

-- User-Organization access policy
CREATE POLICY "Users can manage their organization memberships" ON user_organizations
  FOR ALL USING (user_id = auth.uid());

-- Project members access policy  
CREATE POLICY "Users can see project members for their projects" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN user_organizations uo ON p.organization_id = uo.organization_id
      WHERE uo.user_id = auth.uid()
    )
  );

-- Project analytics access policy
CREATE POLICY "Users can see analytics for their organization projects" ON project_analytics
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN user_organizations uo ON p.organization_id = uo.organization_id
      WHERE uo.user_id = auth.uid()
    )
  );

-- =====================================================
-- 11. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update project activity timestamp
CREATE OR REPLACE FUNCTION update_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects 
  SET last_activity_at = NOW(),
      updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for content changes
DROP TRIGGER IF EXISTS trigger_update_project_activity_content ON content;
CREATE TRIGGER trigger_update_project_activity_content
  AFTER INSERT OR UPDATE OR DELETE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_project_activity();

-- Function to auto-set organization owner
CREATE OR REPLACE FUNCTION set_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the creator as owner
  NEW.owner_id := auth.uid();
  
  -- Insert user as owner in user_organizations
  INSERT INTO user_organizations (user_id, organization_id, role, is_default)
  VALUES (auth.uid(), NEW.id, 'owner', true)
  ON CONFLICT (user_id, organization_id) DO UPDATE SET
    role = 'owner',
    is_default = EXCLUDED.is_default;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new organizations
DROP TRIGGER IF EXISTS trigger_set_organization_owner ON organizations;
CREATE TRIGGER trigger_set_organization_owner
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_owner();

-- Function to update organization stats
CREATE OR REPLACE FUNCTION update_organization_stats()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization ID from the affected project
  org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  
  -- Update organization stats
  UPDATE organizations SET
    updated_at = NOW()
  WHERE id = org_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for project changes
DROP TRIGGER IF EXISTS trigger_update_organization_stats ON projects;
CREATE TRIGGER trigger_update_organization_stats
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_stats();

-- =====================================================
-- 12. DEFAULT DATA MIGRATION
-- =====================================================

-- Migrate existing users to have default organization relationship
DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
BEGIN
  FOR user_record IN SELECT id, organization_id FROM users WHERE organization_id IS NOT NULL
  LOOP
    -- Check if relationship already exists
    IF NOT EXISTS (
      SELECT 1 FROM user_organizations 
      WHERE user_id = user_record.id AND organization_id = user_record.organization_id
    ) THEN
      -- Insert user-organization relationship
      INSERT INTO user_organizations (user_id, organization_id, role, is_default)
      VALUES (user_record.id, user_record.organization_id, 'owner', true)
      ON CONFLICT (user_id, organization_id) DO NOTHING;
      
      -- Set as current organization
      UPDATE users 
      SET current_organization_id = user_record.organization_id
      WHERE id = user_record.id;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 13. SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Insert sample industries for dropdown
CREATE TABLE IF NOT EXISTS industries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO industries (name, description, icon) VALUES
('Fashion & Apparel', 'Fashion, clothing, accessories, and style brands', '👗'),
('Technology', 'Software, hardware, tech startups, and digital services', '💻'),
('Healthcare', 'Medical, pharmaceutical, wellness, and health services', '🏥'),
('Food & Beverage', 'Restaurants, food brands, beverages, and culinary', '🍕'),
('Finance & Banking', 'Financial services, banking, insurance, and fintech', '💰'),
('Education', 'Schools, online learning, courses, and educational content', '📚'),
('Automotive', 'Cars, transportation, automotive services, and mobility', '🚗'),
('Real Estate', 'Property, real estate services, and home improvement', '🏠'),
('Travel & Tourism', 'Travel agencies, hotels, tourism, and hospitality', '✈️'),
('Entertainment', 'Media, entertainment, gaming, and creative industries', '🎬'),
('Sports & Fitness', 'Sports brands, fitness, athletics, and wellness', '💪'),
('Beauty & Cosmetics', 'Beauty products, cosmetics, skincare, and personal care', '💄')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SCHEMA COMPLETE ✅
-- =====================================================
-- This schema provides:
-- ✅ Multi-organization support (agencies managing multiple clients)
-- ✅ Enhanced project management with AI configuration
-- ✅ Project team collaboration
-- ✅ Performance analytics and tracking
-- ✅ Flexible user permissions
-- ✅ Content linking to projects
-- ✅ Organization-level social account management
-- ✅ Comprehensive indexing for performance
-- ✅ Row-level security for data isolation
-- ✅ Automated triggers for data consistency
-- ✅ Industry classification system