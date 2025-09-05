-- ===================================
-- SOCIALFLOW - PROJECT-CENTRIC DATABASE SCHEMA
-- ===================================
-- 
-- Simplified architecture where PROJECTS are the main entity
-- Each user can have multiple projects
-- Each project has its own social media accounts and data
-- 
-- Run this in Supabase SQL Editor to update your database
-- ===================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up old organization-based structure
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();
DROP TABLE IF EXISTS content_analytics CASCADE;
DROP TABLE IF EXISTS content_schedule CASCADE;
DROP TABLE IF EXISTS project_activity CASCADE;
DROP TABLE IF EXISTS generated_content CASCADE;
DROP TABLE IF EXISTS social_accounts CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS user_organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ===================================
-- CORE TABLES - PROJECT-CENTRIC
-- ===================================

-- Users table (simplified - no organization dependency)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  job_title VARCHAR(255),
  phone_number VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  bio TEXT,
  location VARCHAR(255),
  linkedin_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (main entity - replaces organizations)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Project Basic Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  
  -- Business Details
  industry VARCHAR(100),
  target_audience TEXT,
  brand_voice TEXT,
  brand_guidelines TEXT,
  
  -- AI Content Settings
  default_tone VARCHAR(20) DEFAULT 'professional' CHECK (default_tone IN ('professional', 'casual', 'funny', 'inspiring', 'promotional')),
  default_content_type VARCHAR(20) DEFAULT 'post' CHECK (default_content_type IN ('post', 'story', 'reel', 'thread')),
  keywords TEXT[],
  hashtag_strategy TEXT,
  
  -- Project Management
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  
  -- Budget (if needed)
  budget_allocated DECIMAL(12,2),
  budget_spent DECIMAL(12,2) DEFAULT 0,
  
  -- Metrics (auto-calculated)
  content_count INTEGER DEFAULT 0,
  social_accounts_count INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  
  -- Visual Settings
  color_scheme JSONB DEFAULT '{}',
  posting_schedule JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, slug)
);

-- Social media accounts per project
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Platform Info
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest')),
  platform_username VARCHAR(255),
  platform_user_id VARCHAR(255),
  profile_url TEXT,
  
  -- Authentication (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Account Stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_connected BOOLEAN DEFAULT false,
  connection_error TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(project_id, platform, platform_user_id)
);

-- Content generated for projects
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content Data
  title VARCHAR(500),
  content TEXT NOT NULL,
  hashtags TEXT[],
  target_platforms TEXT[] NOT NULL DEFAULT ARRAY['facebook'],
  content_type VARCHAR(50) DEFAULT 'post',
  tone VARCHAR(50) DEFAULT 'professional',
  
  -- Media
  media_urls TEXT[],
  media_type VARCHAR(20), -- 'image', 'video', 'gif', 'document'
  
  -- AI Generation Info
  ai_generated BOOLEAN DEFAULT false,
  ai_provider VARCHAR(50),
  ai_model VARCHAR(100),
  generation_prompt TEXT,
  generation_success BOOLEAN DEFAULT true,
  ai_settings JSONB DEFAULT '{}',
  
  -- Publishing
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics (aggregated from all platforms)
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content publishing schedule
CREATE TABLE content_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  
  -- Platform Response
  platform_post_id VARCHAR(255),
  platform_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Analytics for this specific post
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project activity log
CREATE TABLE project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity Details
  action VARCHAR(100) NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  
  -- Related entities (optional)
  content_id UUID REFERENCES generated_content(id) ON DELETE SET NULL,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content analytics (detailed metrics per platform)
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
  
  -- Metrics
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint per content per platform per day
  UNIQUE(content_id, social_account_id, metric_date)
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_social_accounts_project_id ON social_accounts(project_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_generated_content_project_id ON generated_content(project_id);
CREATE INDEX idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_content_schedule_content_id ON content_schedule(content_id);
CREATE INDEX idx_content_schedule_social_account_id ON content_schedule(social_account_id);
CREATE INDEX idx_content_schedule_scheduled_for ON content_schedule(scheduled_for);
CREATE INDEX idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_date ON content_analytics(metric_date);

-- ===================================
-- FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_content_schedule_updated_at BEFORE UPDATE ON content_schedule FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to update project metrics when social accounts change
CREATE OR REPLACE FUNCTION update_project_social_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET social_accounts_count = social_accounts_count + 1 WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET social_accounts_count = social_accounts_count - 1 WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_social_count_trigger
  AFTER INSERT OR DELETE ON social_accounts
  FOR EACH ROW EXECUTE PROCEDURE update_project_social_count();

-- Function to update project content count
CREATE OR REPLACE FUNCTION update_project_content_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects SET content_count = content_count + 1, last_activity_at = NOW() WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects SET content_count = content_count - 1 WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_content_count_trigger
  AFTER INSERT OR DELETE ON generated_content
  FOR EACH ROW EXECUTE PROCEDURE update_project_content_count();

-- ===================================
-- AUTOMATIC USER CREATION
-- ===================================

-- Function to create user profile on signup (no organization needed)
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (
    id, 
    email, 
    name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for automatic user creation
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_user_profile();

-- ===================================
-- PERMISSIONS AND SECURITY
-- ===================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- For MVP: DISABLE Row Level Security for easy development
-- Enable these in production with proper user-based policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;

-- ===================================
-- SUCCESS MESSAGE
-- ===================================

SELECT '🎉 Project-Centric SocialFlow schema created successfully!' as message,
       '✅ Users can create multiple projects' as feature1,
       '✅ Each project has its own social accounts' as feature2,
       '✅ Complete data isolation per project' as feature3,
       '✅ Analytics and content per project' as feature4,
       '🚀 Ready for project-based architecture!' as status;