'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/actions'
import { revalidatePath } from 'next/cache'

export interface ContentData {
  id?: string
  title: string
  content: string
  platforms: string[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at?: Date | null
  media_urls?: string[]
  hashtags?: string | string[]
  ai_generated?: boolean
  ai_provider?: string
  category?: string
  tone?: string
  contentType?: string
  industry?: string
  targetAudience?: string
  created_at?: Date
  updated_at?: Date
}

export async function createContent(contentData: Omit<ContentData, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  
  console.log('📝 Creating new content:', contentData.title)

  try {
    // Get current user
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Create content record
    const { data, error } = await supabase
      .from('content')
      .insert({
        title: contentData.title,
        content: contentData.content,
        platforms: contentData.platforms,
        status: contentData.status,
        scheduled_at: contentData.scheduled_at?.toISOString(),
        media_urls: contentData.media_urls || [],
        hashtags: contentData.hashtags || [],
        ai_generated: contentData.ai_generated || false,
        ai_provider: contentData.ai_provider,
        user_id: user.id,
        organization_id: user.organizations?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Content creation error:', error)
      return { error: 'Failed to create content' }
    }

    console.log('✅ Content created successfully:', data.id)
    
    // Revalidate content pages
    revalidatePath('/content')
    revalidatePath('/dashboard')

    return { success: true, data }

  } catch (error) {
    console.error('❌ Unexpected error creating content:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateContent(id: string, updates: Partial<ContentData>) {
  const supabase = createClient()
  
  console.log('🔄 Updating content:', id)

  try {
    // Get current user
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Update content
    const { data, error } = await supabase
      .from('content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the content
      .select()
      .single()

    if (error) {
      console.error('❌ Content update error:', error)
      return { error: 'Failed to update content' }
    }

    console.log('✅ Content updated successfully')
    
    revalidatePath('/content')
    revalidatePath('/dashboard')

    return { success: true, data }

  } catch (error) {
    console.error('❌ Unexpected error updating content:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteContent(id: string) {
  const supabase = createClient()
  
  console.log('🗑️ Deleting content:', id)

  try {
    // Get current user
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Delete content
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the content

    if (error) {
      console.error('❌ Content deletion error:', error)
      return { error: 'Failed to delete content' }
    }

    console.log('✅ Content deleted successfully')
    
    revalidatePath('/content')
    revalidatePath('/dashboard')

    return { success: true }

  } catch (error) {
    console.error('❌ Unexpected error deleting content:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getUserContent(limit: number = 20, offset: number = 0) {
  const supabase = createClient()
  
  console.log('📖 Fetching user content...')

  try {
    // Get current user
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Fetch user's content
    const { data, error, count } = await supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Content fetch error:', error)
      return { error: 'Failed to fetch content' }
    }

    console.log(`✅ Fetched ${data?.length || 0} content items`)
    
    return { 
      success: true, 
      data: data || [], 
      total: count || 0 
    }

  } catch (error) {
    console.error('❌ Unexpected error fetching content:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function scheduleContent(id: string, scheduledAt: Date) {
  const supabase = createClient()
  
  console.log('⏰ Scheduling content:', id, 'for', scheduledAt)

  try {
    // Get current user
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Update content with schedule
    const { data, error } = await supabase
      .from('content')
      .update({
        status: 'scheduled',
        scheduled_at: scheduledAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Content scheduling error:', error)
      return { error: 'Failed to schedule content' }
    }

    console.log('✅ Content scheduled successfully')
    
    revalidatePath('/content')
    revalidatePath('/dashboard')

    return { success: true, data }

  } catch (error) {
    console.error('❌ Unexpected error scheduling content:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function duplicateContent(id: string) {
  const supabase = createClient()
  
  console.log('📋 Duplicating content:', id)

  try {
    // Get current user
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Get original content
    const { data: originalContent, error: fetchError } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalContent) {
      return { error: 'Content not found' }
    }

    // Create duplicate
    const { data, error } = await supabase
      .from('content')
      .insert({
        title: `${originalContent.title} (Copy)`,
        content: originalContent.content,
        platforms: originalContent.platforms,
        status: 'draft',
        media_urls: originalContent.media_urls,
        hashtags: originalContent.hashtags,
        ai_generated: originalContent.ai_generated,
        ai_provider: originalContent.ai_provider,
        user_id: user.id,
        organization_id: user.organizations?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Content duplication error:', error)
      return { error: 'Failed to duplicate content' }
    }

    console.log('✅ Content duplicated successfully')
    
    revalidatePath('/content')
    revalidatePath('/dashboard')

    return { success: true, data }

  } catch (error) {
    console.error('❌ Unexpected error duplicating content:', error)
    return { error: 'An unexpected error occurred' }
  }
}