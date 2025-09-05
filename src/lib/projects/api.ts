'use server'

import { createClient } from '@/lib/supabase/server'

export interface Project {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website_url?: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  brand_guidelines?: string
  default_tone: 'professional' | 'casual' | 'funny' | 'inspiring' | 'promotional'
  default_content_type: 'post' | 'story' | 'reel' | 'thread'
  keywords?: string[]
  hashtag_strategy?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string
  end_date?: string
  budget_allocated?: number
  budget_spent?: number
  content_count: number
  social_accounts_count: number
  total_followers: number
  total_posts: number
  color_scheme?: any
  posting_schedule?: any
  settings?: any
  is_active: boolean
  last_activity_at: string
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: string
  project_id: string
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest'
  platform_username?: string
  platform_user_id?: string
  profile_url?: string
  followers_count: number
  following_count: number
  posts_count: number
  is_active: boolean
  is_connected: boolean
  connection_error?: string
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  slug: string
  description?: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  default_tone?: Project['default_tone']
  default_content_type?: Project['default_content_type']
  keywords?: string[]
  social_platforms?: string[] // Platforms to set up during creation
}

// ===================================
// PROJECT CRUD OPERATIONS
// ===================================

export async function getUserProjects(): Promise<{ success: boolean; projects?: Project[]; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user's projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        user_id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        industry,
        target_audience,
        brand_voice,
        brand_guidelines,
        default_tone,
        default_content_type,
        keywords,
        hashtag_strategy,
        status,
        priority,
        start_date,
        end_date,
        budget_allocated,
        budget_spent,
        content_count,
        social_accounts_count,
        total_followers,
        total_posts,
        color_scheme,
        posting_schedule,
        settings,
        is_active,
        last_activity_at,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching projects:', error)
      return { success: false, error: error.message }
    }

    return { success: true, projects: projects || [] }
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    return { success: false, error: 'Failed to fetch projects' }
  }
}

export async function getProject(projectId: string): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get specific project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('❌ Error fetching project:', error)
      return { success: false, error: error.message }
    }

    return { success: true, project }
  } catch (error) {
    console.error('❌ Error fetching project:', error)
    return { success: false, error: 'Failed to fetch project' }
  }
}

export async function createProject(data: CreateProjectData): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if slug is unique for this user
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', data.slug)
      .single()

    if (existing) {
      return { success: false, error: 'Project name already exists. Please choose a different name.' }
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        industry: data.industry,
        target_audience: data.target_audience,
        brand_voice: data.brand_voice,
        default_tone: data.default_tone || 'professional',
        default_content_type: data.default_content_type || 'post',
        keywords: data.keywords || [],
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating project:', error)
      return { success: false, error: error.message }
    }

    // Create social accounts for selected platforms
    if (data.social_platforms && data.social_platforms.length > 0) {
      const socialAccountsData = data.social_platforms.map(platform => ({
        project_id: project.id,
        platform: platform,
        is_active: true,
        is_connected: false
      }))

      const { error: socialError } = await supabase
        .from('social_accounts')
        .insert(socialAccountsData)

      if (socialError) {
        console.error('❌ Error creating social accounts:', socialError)
        // Don't fail the whole operation, just log the error
      }
    }

    return { success: true, project }
  } catch (error) {
    console.error('❌ Error creating project:', error)
    return { success: false, error: 'Failed to create project' }
  }
}

export async function updateProject(
  projectId: string, 
  data: Partial<CreateProjectData>
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating project:', error)
      return { success: false, error: error.message }
    }

    return { success: true, project }
  } catch (error) {
    console.error('❌ Error updating project:', error)
    return { success: false, error: 'Failed to update project' }
  }
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Soft delete - just mark as inactive
    const { error } = await supabase
      .from('projects')
      .update({ 
        is_active: false, 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Error deleting project:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Error deleting project:', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

// ===================================
// SOCIAL ACCOUNTS MANAGEMENT
// ===================================

export async function getProjectSocialAccounts(projectId: string): Promise<{ success: boolean; accounts?: SocialAccount[]; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify project belongs to user
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    // Get social accounts for project
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('platform')

    if (error) {
      console.error('❌ Error fetching social accounts:', error)
      return { success: false, error: error.message }
    }

    return { success: true, accounts: accounts || [] }
  } catch (error) {
    console.error('❌ Error fetching social accounts:', error)
    return { success: false, error: 'Failed to fetch social accounts' }
  }
}

export async function addSocialAccount(
  projectId: string, 
  platform: SocialAccount['platform']
): Promise<{ success: boolean; account?: SocialAccount; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify project belongs to user
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    // Check if platform already exists for this project
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('project_id', projectId)
      .eq('platform', platform)
      .single()

    if (existing) {
      return { success: false, error: `${platform} account already exists for this project` }
    }

    // Create social account
    const { data: account, error } = await supabase
      .from('social_accounts')
      .insert({
        project_id: projectId,
        platform,
        is_active: true,
        is_connected: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating social account:', error)
      return { success: false, error: error.message }
    }

    return { success: true, account }
  } catch (error) {
    console.error('❌ Error creating social account:', error)
    return { success: false, error: 'Failed to add social account' }
  }
}

export async function removeSocialAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify account belongs to user's project
    const { data: account } = await supabase
      .from('social_accounts')
      .select(`
        id,
        projects!inner(user_id)
      `)
      .eq('id', accountId)
      .single()

    if (!account || account.projects.user_id !== user.id) {
      return { success: false, error: 'Social account not found' }
    }

    // Soft delete
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId)

    if (error) {
      console.error('❌ Error removing social account:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Error removing social account:', error)
    return { success: false, error: 'Failed to remove social account' }
  }
}

// ===================================
// PROJECT ANALYTICS & STATS
// ===================================

export async function getProjectStats(projectId: string): Promise<{ 
  success: boolean; 
  stats?: {
    total_content: number;
    published_content: number;
    scheduled_content: number;
    total_followers: number;
    total_engagement: number;
    social_platforms: number;
  }; 
  error?: string 
}> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get project with counts
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('content_count, social_accounts_count, total_followers')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Project not found' }
    }

    // Get content stats
    const { data: contentStats, error: contentError } = await supabase
      .from('generated_content')
      .select('status')
      .eq('project_id', projectId)

    if (contentError) {
      console.error('❌ Error fetching content stats:', contentError)
    }

    const publishedContent = contentStats?.filter(c => c.status === 'published').length || 0
    const scheduledContent = contentStats?.filter(c => c.status === 'scheduled').length || 0

    return {
      success: true,
      stats: {
        total_content: project.content_count,
        published_content: publishedContent,
        scheduled_content: scheduledContent,
        total_followers: project.total_followers,
        total_engagement: 0, // TODO: Calculate from analytics
        social_platforms: project.social_accounts_count
      }
    }
  } catch (error) {
    console.error('❌ Error fetching project stats:', error)
    return { success: false, error: 'Failed to fetch project stats' }
  }
}