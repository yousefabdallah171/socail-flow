'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/actions'
import { revalidatePath } from 'next/cache'

// =====================================================
// TYPES
// =====================================================

export interface ProjectData {
  id?: string
  name: string
  slug: string
  description?: string
  organization_id: string
  industry?: string
  target_audience?: string
  brand_voice?: string
  content_guidelines?: string
  default_tone: 'professional' | 'casual' | 'funny' | 'inspiring' | 'promotional'
  default_content_type: 'post' | 'story' | 'reel' | 'thread'
  keywords?: string[]
  hashtag_strategy?: string
  posting_schedule?: any
  color_scheme?: any
  logo_url?: string
  website_url?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string
  end_date?: string
  budget_allocated?: number
  budget_spent?: number
  team_members_count?: number
  content_count?: number
  social_accounts_count?: number
  settings?: any
  is_active: boolean
  created_at?: string
  updated_at?: string
  last_activity_at?: string
}

export interface CreateProjectData {
  name: string
  description?: string
  industry: string
  target_audience: string
  default_tone: 'professional' | 'casual' | 'funny' | 'inspiring' | 'promotional'
  default_content_type: 'post' | 'story' | 'reel' | 'thread'
  keywords?: string[]
  brand_voice?: string
  content_guidelines?: string
  hashtag_strategy?: string
  website_url?: string
  status?: 'active' | 'paused' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string
  end_date?: string
  budget_allocated?: number
}

export interface ProjectFilters {
  search?: string
  status?: 'all' | 'active' | 'paused' | 'completed' | 'archived'
  industry?: string
  priority?: string
  page?: number
  limit?: number
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function ensureUniqueSlug(supabase: any, slug: string, organizationId: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug
  let counter = 1
  
  while (true) {
    let query = supabase
      .from('projects')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('slug', uniqueSlug)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data } = await query.single()
    
    if (!data) break
    
    uniqueSlug = `${slug}-${counter}`
    counter++
  }
  
  return uniqueSlug
}

// =====================================================
// ORGANIZATION MANAGEMENT
// =====================================================

export async function getUserOrganizations() {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('user_organizations')
    .select(`
      id,
      role,
      is_default,
      joined_at,
      last_accessed,
      organizations:organization_id (
        id,
        name,
        slug,
        logo_url,
        website_url,
        industry,
        description,
        subscription_tier,
        subscription_status,
        team_size,
        projects_limit,
        is_active,
        timezone,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .eq('organizations.is_active', true)
    .order('is_default', { ascending: false })
    .order('last_accessed', { ascending: false })

  if (error) {
    console.error('Error fetching user organizations:', error)
    return { error: error.message, data: null }
  }

  const organizations = data?.map(item => {
    const org = Array.isArray(item.organizations) ? item.organizations[0] : item.organizations
    return {
      id: org?.id,
      name: org?.name,
      slug: org?.slug,
      logo_url: org?.logo_url,
      website_url: org?.website_url,
      industry: org?.industry,
      description: org?.description,
      role: item.role,
      is_default: item.is_default,
      subscription_tier: org?.subscription_tier,
      subscription_status: org?.subscription_status,
      team_size: org?.team_size,
      projects_limit: org?.projects_limit,
      joined_at: item.joined_at,
      created_at: org?.created_at,
      updated_at: org?.updated_at
    }
  }) || []

  return { error: null, data: organizations }
}

export async function switchOrganization(organizationId: string) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify user has access to this organization
  const { data: access } = await supabase
    .from('user_organizations')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single()

  if (!access) {
    return { error: 'Access denied to organization' }
  }

  // Update user's current organization
  const { error } = await supabase
    .from('users')
    .update({
      current_organization_id: organizationId,
      last_organization_switch: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error switching organization:', error)
    return { error: error.message }
  }

  // Update last accessed time
  await supabase
    .from('user_organizations')
    .update({ last_accessed: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)

  revalidatePath('/dashboard')
  return { error: null }
}

// =====================================================
// PROJECT MANAGEMENT
// =====================================================

export async function getOrganizationProjects(organizationId: string, filters?: ProjectFilters) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Verify user has access to this organization
  const { data: access } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single()

  if (!access) {
    return { error: 'Access denied to organization', data: null }
  }

  let query = supabase
    .from('projects')
    .select(`
      id,
      name,
      slug,
      description,
      industry,
      target_audience,
      brand_voice,
      default_tone,
      default_content_type,
      keywords,
      logo_url,
      website_url,
      status,
      priority,
      start_date,
      end_date,
      budget_allocated,
      budget_spent,
      team_members_count,
      content_count,
      social_accounts_count,
      last_activity_at,
      is_active,
      created_at,
      updated_at
    `)
    .eq('organization_id', organizationId)

  // Apply filters
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.industry) {
    query = query.eq('industry', filters.industry)
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  // Pagination
  const limit = filters?.limit || 20
  const offset = ((filters?.page || 1) - 1) * limit

  query = query
    .order('last_activity_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching organization projects:', error)
    return { error: error.message, data: null }
  }

  return {
    error: null,
    data: data || [],
    pagination: {
      page: filters?.page || 1,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

export async function getUserActiveProjects(limit: number = 10) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // First get user's organizations
  const { data: userOrgs } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)

  if (!userOrgs || userOrgs.length === 0) {
    return { error: null, data: [] }
  }

  const orgIds = userOrgs.map(org => org.organization_id)

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      slug,
      industry,
      status,
      last_activity_at,
      team_members_count,
      content_count,
      social_accounts_count,
      organization_id
    `)
    .in('organization_id', orgIds)
    .eq('status', 'active')
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user active projects:', error)
    return { error: error.message, data: null }
  }

  return { error: null, data: data || [] }
}

export async function createProject(organizationId: string, projectData: CreateProjectData) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Verify user has permission to create projects in this organization
  const { data: access } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single()

  if (!access || !['owner', 'admin', 'editor'].includes(access.role)) {
    return { error: 'Insufficient permissions to create projects', data: null }
  }

  // Generate unique slug
  const baseSlug = generateSlug(projectData.name)
  const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug, organizationId)

  // Prepare project data
  const newProject = {
    name: projectData.name,
    slug: uniqueSlug,
    description: projectData.description || '',
    organization_id: organizationId,
    industry: projectData.industry,
    target_audience: projectData.target_audience,
    brand_voice: projectData.brand_voice || '',
    content_guidelines: projectData.content_guidelines || '',
    default_tone: projectData.default_tone,
    default_content_type: projectData.default_content_type,
    keywords: projectData.keywords || [],
    hashtag_strategy: projectData.hashtag_strategy || '',
    website_url: projectData.website_url || '',
    status: projectData.status || 'active',
    priority: projectData.priority || 'medium',
    start_date: projectData.start_date || null,
    end_date: projectData.end_date || null,
    budget_allocated: projectData.budget_allocated || null,
    budget_spent: 0,
    team_members_count: 1,
    content_count: 0,
    social_accounts_count: 0,
    is_active: true,
    settings: {
      ai_settings: {
        industry: projectData.industry,
        target_audience: projectData.target_audience,
        default_tone: projectData.default_tone,
        default_content_type: projectData.default_content_type,
        keywords: projectData.keywords || [],
        brand_voice: projectData.brand_voice || ''
      }
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(newProject)
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message, data: null }
  }

  // Add creator as project manager
  await supabase
    .from('project_members')
    .insert({
      project_id: data.id,
      user_id: user.id,
      role: 'manager',
      added_by: user.id
    })

  revalidatePath('/projects')
  revalidatePath('/dashboard')

  return { error: null, data }
}

export async function updateProject(projectId: string, updates: Partial<ProjectData>) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Verify user has permission to update this project
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found', data: null }
  }

  const { data: access } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', project.organization_id)
    .single()

  if (!access || !['owner', 'admin', 'editor'].includes(access.role)) {
    return { error: 'Insufficient permissions to update project', data: null }
  }

  // Handle slug update
  if (updates.name) {
    const baseSlug = generateSlug(updates.name)
    updates.slug = await ensureUniqueSlug(supabase, baseSlug, project.organization_id, projectId)
  }

  // Remove undefined fields
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  )

  cleanUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return { error: error.message, data: null }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')

  return { error: null, data }
}

export async function deleteProject(projectId: string) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify user has permission to delete this project
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  const { data: access } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', project.organization_id)
    .single()

  if (!access || !['owner', 'admin'].includes(access.role)) {
    return { error: 'Insufficient permissions to delete project' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')

  return { error: null }
}

export async function toggleProjectStatus(projectId: string) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Get current project status
  const { data: project } = await supabase
    .from('projects')
    .select('status, organization_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found', data: null }
  }

  // Verify permissions
  const { data: access } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', project.organization_id)
    .single()

  if (!access || !['owner', 'admin', 'editor'].includes(access.role)) {
    return { error: 'Insufficient permissions', data: null }
  }

  // Toggle status
  const newStatus = project.status === 'active' ? 'paused' : 'active'

  const { data, error } = await supabase
    .from('projects')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error toggling project status:', error)
    return { error: error.message, data: null }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')

  return { error: null, data }
}

// =====================================================
// PROJECT ANALYTICS
// =====================================================

export async function getProjectAnalytics(projectId: string, days: number = 30) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Verify user has access to this project
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found', data: null }
  }

  const { data: access } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', project.organization_id)
    .single()

  if (!access) {
    return { error: 'Access denied to project', data: null }
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get content generation analytics
  const { data: contentData, error: contentError } = await supabase
    .from('generated_content')
    .select(`
      id,
      platform,
      content_type,
      tone,
      ai_provider,
      generation_success,
      created_at
    `)
    .eq('project_id', projectId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  // Get project activity
  const { data: activityData, error: activityError } = await supabase
    .from('project_activity')
    .select('*')
    .eq('project_id', projectId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  if (contentError && activityError) {
    console.error('Error fetching project analytics:', { contentError, activityError })
    return { 
      error: 'Failed to fetch analytics data', 
      data: {
        content: [],
        activity: [],
        summary: {
          totalContent: 0,
          successRate: 0,
          platformBreakdown: {},
          contentTypeBreakdown: {},
          recentActivity: []
        }
      }
    }
  }

  // Process analytics data
  const content = contentData || []
  const activity = activityData || []
  
  const summary = {
    totalContent: content.length,
    successfulGenerations: content.filter(c => c.generation_success).length,
    successRate: content.length ? Math.round((content.filter(c => c.generation_success).length / content.length) * 100) : 0,
    platformBreakdown: content.reduce((acc: Record<string, number>, curr) => {
      acc[curr.platform] = (acc[curr.platform] || 0) + 1
      return acc
    }, {}),
    contentTypeBreakdown: content.reduce((acc: Record<string, number>, curr) => {
      acc[curr.content_type] = (acc[curr.content_type] || 0) + 1
      return acc
    }, {}),
    toneBreakdown: content.reduce((acc: Record<string, number>, curr) => {
      acc[curr.tone] = (acc[curr.tone] || 0) + 1
      return acc
    }, {}),
    aiProviderStats: content.reduce((acc: Record<string, { count: number, success: number }>, curr) => {
      if (!acc[curr.ai_provider]) {
        acc[curr.ai_provider] = { count: 0, success: 0 }
      }
      acc[curr.ai_provider].count++
      if (curr.generation_success) {
        acc[curr.ai_provider].success++
      }
      return acc
    }, {}),
    recentActivity: activity.slice(0, 10)
  }

  return { 
    error: null, 
    data: {
      content,
      activity,
      summary
    }
  }
}

export async function getProjectPerformanceMetrics(projectId: string) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Mock performance data since we don't have engagement tracking yet
  const mockMetrics = {
    contentQuality: {
      current: 94,
      target: 90,
      trend: 'up' as const,
      change: 3
    },
    generationSpeed: {
      current: 87,
      target: 85,
      trend: 'up' as const,
      change: 5
    },
    platformCoverage: {
      current: 78,
      target: 80,
      trend: 'down' as const,
      change: -2
    },
    userSatisfaction: {
      current: 92,
      target: 88,
      trend: 'up' as const,
      change: 8
    }
  }

  return { error: null, data: mockMetrics }
}

export async function getProjectInsights(projectId: string) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  // Get project analytics for insights
  const { data: analytics } = await getProjectAnalytics(projectId, 30)
  
  if (!analytics) {
    return { error: 'Failed to fetch analytics', data: null }
  }

  // Generate insights based on data
  const insights = []
  
  // Content generation insights
  if (analytics.summary.successRate > 90) {
    insights.push({
      type: 'success',
      title: 'High AI Success Rate',
      description: `Your AI content generation has a ${analytics.summary.successRate}% success rate, well above average.`,
      action: 'Continue using your current settings for optimal results.'
    })
  } else if (analytics.summary.successRate < 70) {
    insights.push({
      type: 'warning',
      title: 'Low Success Rate',
      description: `Your AI success rate is ${analytics.summary.successRate}%. Consider adjusting your prompts or settings.`,
      action: 'Review your content guidelines and target audience settings.'
    })
  }

  // Platform distribution insights
  const platforms = Object.keys(analytics.summary.platformBreakdown)
  if (platforms.length < 3) {
    insights.push({
      type: 'opportunity',
      title: 'Platform Expansion',
      description: `You're currently using ${platforms.length} platform${platforms.length > 1 ? 's' : ''}. Consider expanding to reach more audiences.`,
      action: 'Try creating content for additional platforms like LinkedIn or TikTok.'
    })
  }

  // Content type diversity
  const contentTypes = Object.keys(analytics.summary.contentTypeBreakdown)
  if (contentTypes.length === 1) {
    insights.push({
      type: 'tip',
      title: 'Content Variety',
      description: 'You\'re creating only one type of content. Diversifying can improve engagement.',
      action: 'Experiment with stories, reels, and other content formats.'
    })
  }

  return { error: null, data: insights }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export async function getIndustries() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('industries')
    .select('name, description, icon')
    .order('name')

  if (error) {
    console.error('Error fetching industries:', error)
    // Return default industries if table doesn't exist
    return {
      error: null,
      data: [
        { name: 'Fashion & Apparel', description: 'Fashion, clothing, accessories', icon: '👗' },
        { name: 'Technology', description: 'Software, hardware, tech services', icon: '💻' },
        { name: 'Healthcare', description: 'Medical, pharmaceutical, wellness', icon: '🏥' },
        { name: 'Food & Beverage', description: 'Restaurants, food brands, beverages', icon: '🍕' },
        { name: 'Finance & Banking', description: 'Financial services, banking, fintech', icon: '💰' },
        { name: 'Education', description: 'Schools, learning, educational content', icon: '📚' },
        { name: 'Automotive', description: 'Cars, transportation, mobility', icon: '🚗' },
        { name: 'Real Estate', description: 'Property, real estate services', icon: '🏠' },
        { name: 'Travel & Tourism', description: 'Travel, hotels, tourism', icon: '✈️' },
        { name: 'Entertainment', description: 'Media, entertainment, gaming', icon: '🎬' },
        { name: 'Sports & Fitness', description: 'Sports, fitness, athletics', icon: '💪' },
        { name: 'Beauty & Cosmetics', description: 'Beauty, cosmetics, personal care', icon: '💄' }
      ]
    }
  }

  return { error: null, data: data || [] }
}

export async function switchProject(projectId: string) {
  const supabase = createClient()
  const { user } = await getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Update user's current project
  const { error } = await supabase
    .from('users')
    .update({
      current_project_id: projectId,
      last_project_switch: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error switching project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}