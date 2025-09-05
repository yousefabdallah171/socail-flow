'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// !!!!! DEVELOPMENT AUTHENTICATION SYSTEM !!!!!
// !!!!! THIS IS SIMPLIFIED FOR DEV TESTING - REPLACE WITH PRODUCTION AUTH IN PROD !!!!!

// Sign up with email and password
export async function signUp(formData: {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
  organizationType: string
  teamSize: string
}) {
  const supabase = createClient()

  console.log('🚀 DEV: Starting registration process for:', formData.email)

  // !!!!! DEV: Disable email confirmation completely for easy testing !!!!!
  // !!!!! PRODUCTION: Remove emailRedirectTo or set to proper confirmation URL !!!!!
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: undefined, // !!!!! DEV: No email confirmation needed !!!!!
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
      }
    }
  })

  if (authError) {
    console.error('❌ DEV: Auth error during signup:', authError.message)
    return { error: authError.message }
  }

  console.log('✅ DEV: Auth user created:', authData.user?.id)

  // !!!!! DEV: Skip email confirmation check - always proceed to create organization !!!!!
  // !!!!! PRODUCTION: Check if user needs email confirmation first !!!!!
  if (authData.user) {
    try {
      console.log('🏢 DEV: Creating organization for user...')
      
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organizationName,
          slug: formData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          type: formData.organizationType,
          team_size: formData.teamSize,
        })
        .select()
        .single()

      if (orgError) {
        console.error('❌ DEV: Organization creation error:', orgError)
        return { error: 'Failed to create organization' }
      }

      console.log('✅ DEV: Organization created:', orgData.id)

      // Create user record (don't update, create new)
      const { error: userCreateError } = await supabase
        .from('users')
        .insert({ 
          id: authData.user.id,
          email: authData.user.email!,
          name: `${formData.firstName} ${formData.lastName}`,
          organization_id: orgData.id,
          role: 'owner'
        })

      if (userCreateError) {
        console.error('❌ DEV: User creation error:', userCreateError)
        return { error: `Database error saving new user: ${userCreateError.message}` }
      }

      console.log('✅ DEV: User linked to organization successfully!')
      console.log('🎉 DEV: Registration completed - redirecting to dashboard')

      return { 
        success: true, 
        message: 'Account created successfully! Welcome to SocialFlow!',
        redirectTo: '/dashboard'
      }
    } catch (error) {
      console.error('❌ DEV: Signup process error:', error)
      return { error: 'An unexpected error occurred during registration' }
    }
  }

  return { error: 'Registration failed - no user created' }
}

// Sign in with email and password  
export async function signIn(formData: { email: string; password: string }) {
  const supabase = createClient()

  console.log('🔐 DEV: Attempting login for:', formData.email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    console.error('❌ DEV: Login error:', error.message)
    return { error: error.message }
  }

  if (data.user) {
    console.log('✅ DEV: Login successful for user:', data.user.id)
    console.log('🔄 DEV: Revalidating paths and redirecting to dashboard...')
    
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  console.error('❌ DEV: Login failed - no user returned')
  return { error: 'Login failed - no user returned' }
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  
  console.log('🚪 DEV: Signing out user...')
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('❌ DEV: Signout error:', error.message)
    return { error: error.message }
  }
  
  console.log('✅ DEV: User signed out successfully')
  revalidatePath('/', 'layout')
  redirect('/')
}

// Reset password
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true,
    message: 'Password reset email sent. Please check your inbox.'
  }
}

// Update password
export async function updatePassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true,
    message: 'Password updated successfully'
  }
}

// Sign in with OAuth (Google, GitHub, etc.)
export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'OAuth signin failed' }
}

// Get current user
export async function getUser() {
  const supabase = createClient()
  
  console.log('👤 DEV: Getting current user...')
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('❌ DEV: Auth error getting user:', error.message)
    return { user: null, error: error.message }
  }

  if (!user) {
    console.log('❌ DEV: No authenticated user found')
    return { user: null, error: 'No authenticated user' }
  }

  console.log('✅ DEV: Found authenticated user:', user.id)

  // !!!!! DEV: Bypass RLS for development testing !!!!!
  // !!!!! PRODUCTION: Remove the .rpc() call and use normal query !!!!!
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      organizations (
        id,
        name,
        slug,
        type,
        team_size
      )
    `)
    .eq('id', user.id)
    .single()

  if (userError) {
    console.log('⚠️ DEV: User not found in users table, creating...')
    console.log('🔍 DEV: Error details:', userError)
    
    // !!!!! DEV: Auto-create missing user records for easy testing !!!!!
    // !!!!! PRODUCTION: This should not happen - users should be created during signup !!!!!
    if (userError.code === 'PGRST116' || userError.message.includes('infinite recursion')) {
      try {
        console.log('🏢 DEV: Creating default organization...')
        
        // Create a default organization for the user
        console.log('🏢 DEV: Attempting to create organization...')
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: 'My Organization',
            slug: 'my-organization',
            type: 'other',
            team_size: '1'
          })
          .select()
          .single()

        if (orgError) {
          console.error('❌ DEV: Failed to create organization:', orgError)
          console.error('❌ DEV: Organization error details:', JSON.stringify(orgError, null, 2))
          console.error('❌ DEV: This might be due to RLS policies. Please disable RLS in Supabase.')
          return { user: null, error: `Failed to create organization: ${orgError.message}` }
        }

        console.log('✅ DEV: Organization created:', orgData.id)

        // Create user record
        const { data: newUserData, error: newUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0],
            organization_id: orgData.id,
            role: 'owner'
          })
          .select(`
            *,
            organizations (
              id,
              name,
              slug,
              type,
              team_size
            )
          `)
          .single()

        if (newUserError) {
          console.error('❌ DEV: Failed to create user record:', newUserError)
          return { user: null, error: 'Failed to create user record' }
        }

        console.log('✅ DEV: User record created successfully!')
        return { user: newUserData, error: null }
      } catch (error) {
        console.error('❌ DEV: Error creating user record:', error)
        return { user: null, error: 'Failed to create user record' }
      }
    }
    
    console.error('❌ DEV: Database error getting user:', userError.message)
    return { user: null, error: userError.message }
  }

  console.log('✅ DEV: User data retrieved successfully:', userData.name)
  return { user: userData, error: null }
}

// !!!!! DEVELOPMENT HELPER FUNCTIONS !!!!!
// !!!!! REMOVE THESE IN PRODUCTION - FOR TESTING ONLY !!!!!

// DEV: Clear all user data for testing
export async function devClearUserData() {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'This function is only available in development' }
  }
  
  const supabase = createClient()
  
  console.log('🧹 DEV: Clearing all user data for testing...')
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No user to clear' }
    }
    
    // Delete user from users table
    await supabase.from('users').delete().eq('id', user.id)
    
    // Delete user's organizations
    await supabase.from('organizations').delete().eq('id', user.id)
    
    // Sign out
    await supabase.auth.signOut()
    
    console.log('✅ DEV: User data cleared successfully')
    return { success: true, message: 'User data cleared' }
  } catch (error) {
    console.error('❌ DEV: Error clearing user data:', error)
    return { error: 'Failed to clear user data' }
  }
}

// DEV: Get debug info about current user
export async function devGetUserDebugInfo() {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'This function is only available in development' }
  }
  
  const supabase = createClient()
  
  console.log('🔍 DEV: Getting user debug info...')
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return { error: authError.message }
    }
    
    if (!user) {
      return { error: 'No authenticated user' }
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Get organization data
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', userData?.organization_id)
      .single()
    
    return {
      authUser: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      userData: userData || null,
      organizationData: orgData || null,
      errors: {
        userError: userError?.message || null,
        orgError: orgError?.message || null
      }
    }
  } catch (error) {
    return { error: 'Failed to get debug info' }
  }
}