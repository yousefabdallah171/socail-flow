'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
  name: string
  avatar_url?: string | null
  job_title?: string
  phone_number?: string
  timezone?: string
  bio?: string
  location?: string
  linkedin_url?: string
}) {
  const supabase = createClient()
  
  console.log('🔄 Updating user profile...', formData)
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError?.message)
      return { error: 'Authentication required' }
    }

    // Update auth user metadata
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        full_name: formData.name,
        name: formData.name,
        avatar_url: formData.avatar_url
      }
    })

    if (authUpdateError) {
      console.error('❌ Auth update error:', authUpdateError)
      return { error: 'Failed to update authentication profile' }
    }

    // Update user record in database
    const { data: updatedUser, error: dbError } = await supabase
      .from('users')
      .update({
        name: formData.name,
        avatar_url: formData.avatar_url,
        job_title: formData.job_title,
        phone_number: formData.phone_number,
        timezone: formData.timezone,
        bio: formData.bio,
        location: formData.location,
        linkedin_url: formData.linkedin_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select(`
        *,
        organizations (
          id,
          name,
          slug,
          type,
          team_size,
          logo_url,
          website,
          industry,
          description
        )
      `)
      .single()

    if (dbError) {
      console.error('❌ Database update error:', dbError)
      return { error: 'Failed to update profile in database' }
    }

    console.log('✅ Profile updated successfully')
    
    // Revalidate pages that depend on user data
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    revalidatePath('/(dashboard)', 'layout')

    return { 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    }

  } catch (error) {
    console.error('❌ Unexpected error updating profile:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateOrganization(orgData: {
  name: string
  type?: string
  logo_url?: string
  website?: string
  industry?: string
  description?: string
}) {
  const supabase = createClient()
  
  console.log('🏢 Updating organization...', orgData)
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData.organization_id) {
      return { error: 'Organization not found' }
    }

    // Update organization
    const { data: updatedOrg, error: orgError } = await supabase
      .from('organizations')
      .update({
        name: orgData.name,
        slug: orgData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        type: orgData.type || 'other',
        logo_url: orgData.logo_url,
        website: orgData.website,
        industry: orgData.industry,
        description: orgData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.organization_id)
      .select()
      .single()

    if (orgError) {
      console.error('❌ Organization update error:', orgError)
      return { error: 'Failed to update organization' }
    }

    console.log('✅ Organization updated successfully')
    
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    revalidatePath('/(dashboard)', 'layout')

    return { 
      success: true, 
      message: 'Organization updated successfully',
      organization: updatedOrg 
    }

  } catch (error) {
    console.error('❌ Unexpected error updating organization:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function uploadAvatar(file: File) {
  const supabase = createClient()
  
  console.log('📸 Uploading avatar...', file.name)
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { error: 'File must be an image' }
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      return { error: 'File size must be less than 2MB' }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatar_url = urlData.publicUrl

    console.log('✅ Avatar uploaded successfully:', avatar_url)
    
    return { 
      success: true, 
      avatar_url,
      message: 'Avatar uploaded successfully' 
    }

  } catch (error) {
    console.error('❌ Unexpected error uploading avatar:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClient()
  
  console.log('🔐 Changing password...')
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Verify current password by trying to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (verifyError) {
      return { error: 'Current password is incorrect' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('❌ Password update error:', updateError)
      return { error: 'Failed to update password' }
    }

    console.log('✅ Password changed successfully')
    
    return { 
      success: true, 
      message: 'Password updated successfully' 
    }

  } catch (error) {
    console.error('❌ Unexpected error changing password:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function uploadOrganizationLogo(file: File) {
  const supabase = createClient()
  
  console.log('🏢 Uploading organization logo...', file.name)
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Authentication required' }
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData.organization_id) {
      return { error: 'Organization not found' }
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { error: 'File must be an image' }
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for logos
      return { error: 'File size must be less than 5MB' }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userData.organization_id}-${Date.now()}.${fileExt}`
    const filePath = `organization-logos/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars') // Reusing avatars bucket for now
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return { error: 'Failed to upload logo' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const logo_url = urlData.publicUrl

    console.log('✅ Organization logo uploaded successfully:', logo_url)
    
    return { 
      success: true, 
      logo_url,
      message: 'Organization logo uploaded successfully' 
    }

  } catch (error) {
    console.error('❌ Unexpected error uploading logo:', error)
    return { error: 'An unexpected error occurred' }
  }
}

