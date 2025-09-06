'use server'

import { createClient } from '@/lib/supabase/server'

export interface EnhancedProject {
  id: string
  user_id: string
  organization_id: string
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
  team_members_count: number
  color_scheme?: any
  posting_schedule?: any
  settings?: any
  is_active: boolean
  last_activity_at: string
  created_at: string
  updated_at: string
}

export interface SocialAccountWithCredentials {
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
  account_name?: string
  username?: string
  // encrypted_password field exists but not exposed for security
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface CreateEnhancedProjectData {
  name: string
  description?: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  brand_guidelines?: string
  default_tone?: EnhancedProject['default_tone']
  default_content_type?: EnhancedProject['default_content_type']
  keywords?: string[]
  hashtag_strategy?: string
  website_url?: string
  logo_url?: string
  status?: EnhancedProject['status']
  priority?: EnhancedProject['priority']
  start_date?: string
  end_date?: string
  budget_allocated?: number
  color_scheme?: any
  posting_schedule?: any
  social_platforms?: Array<{
    platform: string
    account_name?: string
    username?: string
    password?: string
  }>
}

// ===================================
// ENHANCED PROJECT OPERATIONS
// ===================================

export async function getEnhancedUserProjects(): Promise<{ success: boolean; projects?: EnhancedProject[]; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user's projects with ALL fields
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
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

export async function getEnhancedProject(projectId: string): Promise<{ success: boolean; project?: EnhancedProject; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get specific project with ALL fields
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

export async function createEnhancedProject(data: CreateEnhancedProjectData): Promise<{ success: boolean; project?: EnhancedProject; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userProfile?.organization_id) {
      return { success: false, error: 'User organization not found' }
    }

    // Generate slug
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug is unique for this user
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .single()

    if (existing) {
      return { success: false, error: 'Project name already exists. Please choose a different name.' }
    }

    // Create project with ALL fields
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        organization_id: userProfile.organization_id,
        name: data.name,
        slug: slug,
        description: data.description || null,
        industry: data.industry || null,
        target_audience: data.target_audience || null,
        brand_voice: data.brand_voice || null,
        brand_guidelines: data.brand_guidelines || null,
        default_tone: data.default_tone || 'professional',
        default_content_type: data.default_content_type || 'post',
        keywords: data.keywords || [],
        hashtag_strategy: data.hashtag_strategy || null,
        website_url: data.website_url || null,
        logo_url: data.logo_url || null,
        status: data.status || 'active',
        priority: data.priority || 'medium',
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        budget_allocated: data.budget_allocated || null,
        budget_spent: 0,
        color_scheme: data.color_scheme || {},
        posting_schedule: data.posting_schedule || {},
        settings: {},
        content_count: 0,
        social_accounts_count: 0,
        total_followers: 0,
        total_posts: 0,
        team_members_count: 1,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating project:', error)
      return { success: false, error: error.message }
    }

    // Create social accounts with credentials if provided
    if (data.social_platforms && data.social_platforms.length > 0) {
      const socialAccountsData = []
      
      for (const platformData of data.social_platforms) {
        const accountData: any = {
          project_id: project.id,
          platform: platformData.platform,
          account_name: platformData.account_name || `${platformData.platform} Account`,
          username: platformData.username || null,
          is_active: true,
          is_connected: false,
          followers_count: 0,
          following_count: 0,
          posts_count: 0
        }

        // Encrypt password if provided
        if (platformData.password) {
          const { data: encryptedPassword } = await supabase.rpc('encrypt_password', {
            password_text: platformData.password
          })
          accountData.encrypted_password = encryptedPassword
        }

        socialAccountsData.push(accountData)
      }

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

export async function updateEnhancedProject(
  projectId: string, 
  data: Partial<CreateEnhancedProjectData>
): Promise<{ success: boolean; project?: EnhancedProject; error?: string }> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // First, verify the project exists and belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingProject) {
      console.error('❌ Project verification failed:', fetchError)
      return { success: false, error: 'Project not found or access denied' }
    }

    // Prepare update data with ALL possible fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only add fields that are actually provided
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.industry !== undefined) updateData.industry = data.industry
    if (data.target_audience !== undefined) updateData.target_audience = data.target_audience
    if (data.brand_voice !== undefined) updateData.brand_voice = data.brand_voice
    if (data.brand_guidelines !== undefined) updateData.brand_guidelines = data.brand_guidelines
    if (data.default_tone !== undefined) updateData.default_tone = data.default_tone
    if (data.default_content_type !== undefined) updateData.default_content_type = data.default_content_type
    if (data.keywords !== undefined) updateData.keywords = data.keywords
    if (data.hashtag_strategy !== undefined) updateData.hashtag_strategy = data.hashtag_strategy
    if (data.website_url !== undefined) updateData.website_url = data.website_url
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url
    if (data.status !== undefined) updateData.status = data.status
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.start_date !== undefined) updateData.start_date = data.start_date
    if (data.end_date !== undefined) updateData.end_date = data.end_date
    if (data.budget_allocated !== undefined) updateData.budget_allocated = data.budget_allocated
    if (data.color_scheme !== undefined) updateData.color_scheme = data.color_scheme
    if (data.posting_schedule !== undefined) updateData.posting_schedule = data.posting_schedule

    console.log('🔧 Updating project with data:', updateData)

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error updating project:', error)
      return { success: false, error: `Update failed: ${error.message}` }
    }

    if (!project) {
      return { success: false, error: 'Project not found after update' }
    }

    console.log('✅ Project updated successfully:', project)
    return { success: true, project }
  } catch (error) {
    console.error('❌ Error updating project:', error)
    return { success: false, error: 'Failed to update project - please check your permissions' }
  }
}

export async function getSocialAccountsWithCredentials(projectId: string): Promise<{ success: boolean; accounts?: SocialAccountWithCredentials[]; error?: string }> {
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

    // Get social accounts (without decrypted passwords for security)
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select(`
        id,
        project_id,
        platform,
        platform_username,
        platform_user_id,
        profile_url,
        followers_count,
        following_count,
        posts_count,
        is_active,
        is_connected,
        connection_error,
        account_name,
        username,
        last_sync,
        created_at,
        updated_at
      `)
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

export async function addSocialAccountWithCredentials(
  projectId: string,
  platform: string,
  accountName?: string,
  username?: string,
  password?: string
): Promise<{ success: boolean; account?: SocialAccountWithCredentials; error?: string }> {
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

    // Prepare account data
    const accountData: any = {
      project_id: projectId,
      platform,
      account_name: accountName || `${platform} Account`,
      username: username || null,
      is_active: true,
      is_connected: false,
      followers_count: 0,
      following_count: 0,
      posts_count: 0
    }

    // Encrypt password if provided
    if (password) {
      const { data: encryptedPassword } = await supabase.rpc('encrypt_password', {
        password_text: password
      })
      accountData.encrypted_password = encryptedPassword
    }

    // Create social account
    const { data: account, error } = await supabase
      .from('social_accounts')
      .insert(accountData)
      .select(`
        id,
        project_id,
        platform,
        platform_username,
        platform_user_id,
        profile_url,
        followers_count,
        following_count,
        posts_count,
        is_active,
        is_connected,
        connection_error,
        account_name,
        username,
        last_sync,
        created_at,
        updated_at
      `)
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