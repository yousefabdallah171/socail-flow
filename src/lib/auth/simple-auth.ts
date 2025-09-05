'use client'

import { createClient } from '@/lib/supabase/client'

export async function simpleSignUp(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
  organizationType: string
  teamSize: string
}) {
  try {
    const supabase = createClient()
    
    console.log('🚀 Starting simplified registration...')
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
          organization_name: data.organizationName,
          organization_type: data.organizationType,
          team_size: data.teamSize
        }
      }
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      return { 
        success: false, 
        error: authError.message 
      }
    }

    if (!authData.user) {
      return { 
        success: false, 
        error: 'No user created' 
      }
    }

    console.log('✅ Auth user created:', authData.user.id)
    
    // The database trigger should handle creating the user profile automatically
    // If not, we can create it manually here
    
    return {
      success: true,
      message: 'Account created successfully! Welcome to SocialFlow!',
      user: authData.user
    }
    
  } catch (error: any) {
    console.error('❌ Registration error:', error)
    return {
      success: false,
      error: error.message || 'Registration failed'
    }
  }
}

export async function simpleSignIn(email: string, password: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    if (!data.user) {
      return {
        success: false,
        error: 'No user returned'
      }
    }
    
    return {
      success: true,
      user: data.user
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed'
    }
  }
}