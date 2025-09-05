-- SocialFlow Profile Enhancement Migration
-- Run this script in your Supabase SQL editor to add professional fields

-- =====================================================
-- PHASE 1: ESSENTIAL PROFESSIONAL FIELDS
-- =====================================================

-- Add new professional fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add new professional fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_job_title ON users(job_title);
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);

-- Add constraints for data validation
ALTER TABLE users 
ADD CONSTRAINT chk_phone_format CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$'),
ADD CONSTRAINT chk_linkedin_url CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https://([a-z]{2,3}\.)?linkedin\.com/'),
ADD CONSTRAINT chk_timezone CHECK (timezone IS NULL OR length(timezone) <= 50);

ALTER TABLE organizations 
ADD CONSTRAINT chk_website_url CHECK (website IS NULL OR website ~ '^https?://'),
ADD CONSTRAINT chk_industry_length CHECK (industry IS NULL OR length(industry) <= 100);

-- Update RLS policies to include new fields (if RLS is enabled)
-- Note: These policies assume existing RLS structure

-- Allow users to read their own enhanced profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own enhanced profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow organization members to view organization details
DROP POLICY IF EXISTS "Organization members can view org" ON organizations;
CREATE POLICY "Organization members can view org" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Allow organization owners/admins to update organization
DROP POLICY IF EXISTS "Organization owners can update org" ON organizations;
CREATE POLICY "Organization owners can update org" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Create function to validate timezone
CREATE OR REPLACE FUNCTION validate_timezone(tz TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic timezone validation (you can expand this list)
    RETURN tz IN (
        'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
        'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
        'Australia/Sydney', 'Africa/Cairo', 'Africa/Lagos'
    ) OR tz ~ '^[A-Za-z_]+/[A-Za-z_]+$';
END;
$$ LANGUAGE plpgsql;

-- Create function to generate organization slug
CREATE OR REPLACE FUNCTION generate_org_slug(org_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(org_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update organization slug when name changes
CREATE OR REPLACE FUNCTION update_organization_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name IS DISTINCT FROM OLD.name THEN
        NEW.slug := generate_org_slug(NEW.name);
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_organization_slug ON organizations;
CREATE TRIGGER tr_update_organization_slug
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_slug();

-- Create trigger to auto-update user updated_at
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_user_updated_at ON users;
CREATE TRIGGER tr_update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_updated_at();

-- Insert default industry options (for reference)
-- You might want to create a separate industries table, but for now we'll use constraints

COMMENT ON COLUMN users.job_title IS 'Professional job title or position';
COMMENT ON COLUMN users.phone_number IS 'International phone number in E.164 format';
COMMENT ON COLUMN users.timezone IS 'User timezone for scheduling (e.g., America/New_York)';
COMMENT ON COLUMN users.bio IS 'Professional bio or description (max 500 characters)';
COMMENT ON COLUMN users.location IS 'User location (city, country)';
COMMENT ON COLUMN users.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN users.preferences IS 'User preferences in JSON format';

COMMENT ON COLUMN organizations.logo_url IS 'Organization logo URL';
COMMENT ON COLUMN organizations.website IS 'Organization website URL';
COMMENT ON COLUMN organizations.industry IS 'Industry category';
COMMENT ON COLUMN organizations.description IS 'Organization description';
COMMENT ON COLUMN organizations.brand_colors IS 'Brand colors in JSON format';

-- Verification query to check if migration was successful
-- Run this after the migration to verify
/*
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'organizations') 
    AND column_name IN (
        'job_title', 'phone_number', 'timezone', 'bio', 'location', 'linkedin_url', 'preferences',
        'logo_url', 'website', 'industry', 'description', 'brand_colors'
    )
ORDER BY table_name, ordinal_position;
*/