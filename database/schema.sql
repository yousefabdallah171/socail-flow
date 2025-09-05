-- SocialFlow Database Schema
-- Run this script in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE organization_type AS ENUM ('marketing-agency', 'digital-agency', 'freelancer', 'startup', 'small-business', 'enterprise', 'other');
CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
CREATE TYPE social_platform AS ENUM ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube');

-- Organizations table (multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type organization_type DEFAULT 'other',
    team_size VARCHAR(20),
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'member',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (for agencies managing multiple clients)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- Social media accounts
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform social_platform NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content management
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500),
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    platforms social_platform[] DEFAULT '{}',
    status content_status DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content analytics
CREATE TABLE content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    platform_post_id VARCHAR(255),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0.0000,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team invitations
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role user_role DEFAULT 'member',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_slug ON projects(organization_id, slug);
CREATE INDEX idx_content_project ON content(project_id);
CREATE INDEX idx_content_status_scheduled ON content(status, scheduled_at);
CREATE INDEX idx_content_created_by ON content(created_by);
CREATE INDEX idx_social_accounts_project ON social_accounts(project_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_analytics_content ON content_analytics(content_id);
CREATE INDEX idx_analytics_platform ON content_analytics(platform);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_organization ON invitations(organization_id);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users policies
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects in their organization" ON projects
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage projects in their organization" ON projects
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

-- Social accounts policies
CREATE POLICY "Users can view social accounts in their organization" ON social_accounts
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.organization_id = u.organization_id
            WHERE u.id = auth.uid()
        )
    );

-- Content policies
CREATE POLICY "Users can view content in their organization" ON content
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.organization_id = u.organization_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Users can create content in their organization" ON content
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.organization_id = u.organization_id
            WHERE u.id = auth.uid()
        )
    );

-- Content analytics policies
CREATE POLICY "Users can view analytics in their organization" ON content_analytics
    FOR SELECT USING (
        content_id IN (
            SELECT c.id FROM content c
            JOIN projects p ON c.project_id = p.id
            JOIN users u ON p.organization_id = u.organization_id
            WHERE u.id = auth.uid()
        )
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create first project when organization is created
CREATE OR REPLACE FUNCTION create_default_project()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO projects (name, slug, organization_id)
    VALUES ('Default Project', 'default', NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_default_project_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_default_project();

-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some sample data for development (optional)
-- You can remove this section for production

-- Sample organization
INSERT INTO organizations (name, slug, type, team_size) 
VALUES ('Demo Agency', 'demo-agency', 'marketing-agency', '2-5');

-- Get the organization ID for sample data
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'demo-agency';
    
    -- Sample projects
    INSERT INTO projects (name, slug, organization_id) VALUES 
    ('Client A Campaign', 'client-a', org_id),
    ('Client B Social Media', 'client-b', org_id);
END $$;

COMMENT ON TABLE organizations IS 'Multi-tenant organizations (agencies)';
COMMENT ON TABLE users IS 'Users belong to organizations';
COMMENT ON TABLE projects IS 'Projects within organizations (for client management)';
COMMENT ON TABLE social_accounts IS 'Connected social media accounts per project';
COMMENT ON TABLE content IS 'Content posts with scheduling and AI generation';
COMMENT ON TABLE content_analytics IS 'Social media performance analytics';
COMMENT ON TABLE invitations IS 'Team member invitations';