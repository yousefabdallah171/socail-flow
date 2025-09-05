'use client'

import { createClient } from '@/lib/supabase/client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { data, error } = await supabase.from('organizations').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { 
        success: false, 
        error: error.message,
        details: 'Database connection failed. Check environment variables.'
      }
    }
    
    return { 
      success: true, 
      message: 'Supabase connection successful' 
    }
  } catch (error: any) {
    console.error('Connection test error:', error)
    return { 
      success: false, 
      error: error.message,
      details: 'Failed to initialize Supabase client. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }
  }
}

export async function clientSignIn(email: string, password: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.status 
      }
    }
    
    return { 
      success: true, 
      user: data.user 
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: 'Authentication service error. Please check your internet connection and try again.',
      details: error.message 
    }
  }
}