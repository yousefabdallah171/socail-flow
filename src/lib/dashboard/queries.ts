'use server'

import { createClient } from '@/lib/supabase/server'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  role: 'owner' | 'admin' | 'editor' | 'member'
  is_default: boolean
  subscription_tier: 'free' | 'pro' | 'enterprise'
  projects_count?: number
  team_members_count?: number
  created_at: string
}

export interface Project {
  id: string
  name: string
  slug: string
  industry?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  unread_notifications?: number
  last_activity?: string
  team_members_count?: number
  content_count?: number
  social_accounts_count?: number
}

export async function getUserOrganizations(): Promise<Organization[]> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Auth error:', userError)
      return []
    }

    // Get user's organization (simplified for current single-org structure)
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations (
          id,
          name,
          slug,
          logo_url,
          subscription_tier,
          team_size,
          created_at
        )
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return []
    }

    if (!userData || !userData.organizations) {
      return []
    }

    // Transform to match Organization interface
    const org = userData.organizations
    return [{
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo_url: org.logo_url,
      role: userData.role || 'owner',
      is_default: true,
      subscription_tier: org.subscription_tier || 'free',
      projects_count: 0, // Will be populated separately
      team_members_count: parseInt(org.team_size) || 1,
      created_at: org.created_at
    }]
  } catch (error) {
    console.error('❌ Error fetching organizations:', error)
    return []
  }
}

export async function getUserProjects(organizationId?: string): Promise<Project[]> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return []
    }

    // Get user's organization if not provided
    let orgId = organizationId
    if (!orgId) {
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      
      orgId = userData?.organization_id
    }

    if (!orgId) {
      return []
    }

    // Get projects for this organization
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        slug,
        industry,
        status,
        team_members_count,
        content_count,
        social_accounts_count,
        last_activity_at
      `)
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false })

    if (error) {
      console.error('❌ Database error fetching projects:', error)
      return []
    }

    // Transform to match Project interface
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      industry: project.industry,
      status: project.status as Project['status'],
      unread_notifications: 0, // TODO: Implement notifications
      last_activity: project.last_activity_at,
      team_members_count: project.team_members_count || 1,
      content_count: project.content_count || 0,
      social_accounts_count: project.social_accounts_count || 0
    }))
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    return []
  }
}

export async function createProject(data: {
  name: string
  slug: string
  industry?: string
  description?: string
}): Promise<{ success: boolean; error?: string; project?: Project }> {
  try {
    const supabase = createClient()
    
    // Get current user and organization
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return { success: false, error: 'Organization not found' }
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        slug: data.slug,
        industry: data.industry,
        description: data.description,
        organization_id: userData.organization_id,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating project:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        industry: project.industry,
        status: project.status,
        team_members_count: 1,
        content_count: 0,
        social_accounts_count: 0
      }
    }
  } catch (error) {
    console.error('❌ Error creating project:', error)
    return { success: false, error: 'Failed to create project' }
  }
}