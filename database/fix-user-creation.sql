-- Fix user creation issues in production
-- Run this in your Supabase SQL editor

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_default_org_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_default_organization_for_user();

-- Create a simpler trigger function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Create a default organization first
    INSERT INTO public.organizations (name, slug, industry, description)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'name', 'My Organization'), 
      'org-' || NEW.id::text,
      'General',
      'Default organization for ' || COALESCE(NEW.email, 'user')
    )
    RETURNING id INTO org_id;
    
    -- Create user profile
    INSERT INTO public.users (
      id, 
      email, 
      name, 
      organization_id, 
      role
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      org_id,
      'owner'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make sure RLS is still disabled for easy testing
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content DISABLE ROW LEVEL SECURITY;

SELECT 'User creation trigger updated successfully! 🎉' AS message;