import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createCredentialSchema = z.object({
  project_id: z.string().uuid(),
  social_account_id: z.string().uuid(),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest']),
  account_name: z.string().min(1),
  credentials: z.object({
    api_key: z.string().optional(),
    api_secret: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    app_id: z.string().optional(),
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    webhook_secret: z.string().optional(),
    page_token: z.string().optional(),
    business_account_id: z.string().optional(),
  }),
  expires_at: z.string().optional(),
})

const updateCredentialSchema = z.object({
  id: z.string().uuid(),
  account_name: z.string().optional(),
  credentials: z.object({
    api_key: z.string().optional(),
    api_secret: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    app_id: z.string().optional(),
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    webhook_secret: z.string().optional(),
    page_token: z.string().optional(),
    business_account_id: z.string().optional(),
  }).optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().optional(),
})

// GET - Fetch credentials for a project
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const project_id = searchParams.get('project_id')

    if (!project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get user for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch credentials (without decrypted values for security)
    const { data: credentials, error } = await supabase
      .from('social_media_credentials')
      .select(`
        id,
        platform,
        account_name,
        is_active,
        is_verified,
        last_verified_at,
        verification_error,
        last_used_at,
        usage_count,
        rate_limit_remaining,
        rate_limit_reset_at,
        expires_at,
        rotation_scheduled_at,
        created_at,
        updated_at
      `)
      .eq('project_id', project_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching credentials:', error)
      return NextResponse.json(
        { error: 'Failed to fetch credentials' },
        { status: 500 }
      )
    }

    return NextResponse.json({ credentials: credentials || [] })
  } catch (error) {
    console.error('Credentials GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new encrypted credentials
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Validate request
    const validatedData = createCredentialSchema.parse(body)
    const { project_id, social_account_id, platform, account_name, credentials, expires_at } = validatedData

    // Get user for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prepare encrypted credential data
    const credentialData: any = {
      project_id,
      social_account_id,
      platform,
      account_name,
      created_by: user.id,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
    }

    // Encrypt each credential field if provided
    if (credentials.api_key) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.api_key,
        project_id
      })
      credentialData.encrypted_api_key = encrypted
    }

    if (credentials.api_secret) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.api_secret,
        project_id
      })
      credentialData.encrypted_api_secret = encrypted
    }

    if (credentials.access_token) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.access_token,
        project_id
      })
      credentialData.encrypted_access_token = encrypted
    }

    if (credentials.refresh_token) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.refresh_token,
        project_id
      })
      credentialData.encrypted_refresh_token = encrypted
    }

    if (credentials.app_id) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.app_id,
        project_id
      })
      credentialData.encrypted_app_id = encrypted
    }

    if (credentials.client_id) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.client_id,
        project_id
      })
      credentialData.encrypted_client_id = encrypted
    }

    if (credentials.client_secret) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.client_secret,
        project_id
      })
      credentialData.encrypted_client_secret = encrypted
    }

    if (credentials.webhook_secret) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.webhook_secret,
        project_id
      })
      credentialData.encrypted_webhook_secret = encrypted
    }

    if (credentials.page_token) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.page_token,
        project_id
      })
      credentialData.encrypted_page_token = encrypted
    }

    if (credentials.business_account_id) {
      const { data: encrypted } = await supabase.rpc('encrypt_credential', {
        credential_text: credentials.business_account_id,
        project_id
      })
      credentialData.encrypted_business_account_id = encrypted
    }

    // Insert encrypted credentials
    const { data: newCredential, error } = await supabase
      .from('social_media_credentials')
      .insert([credentialData])
      .select(`
        id,
        platform,
        account_name,
        is_active,
        is_verified,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error creating credential:', error)
      return NextResponse.json(
        { error: 'Failed to create credential' },
        { status: 500 }
      )
    }

    // Log credential creation for audit
    await supabase.rpc('log_credential_access', {
      p_credential_id: newCredential.id,
      p_action: 'created',
      p_user_id: user.id,
      p_access_method: 'dashboard'
    })

    return NextResponse.json({ 
      credential: newCredential,
      message: 'Credential created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Credentials POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update existing credentials
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Validate request
    const validatedData = updateCredentialSchema.parse(body)
    const { id, account_name, credentials, expires_at, is_active } = validatedData

    // Get user for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get existing credential to get project_id for encryption
    const { data: existingCredential, error: fetchError } = await supabase
      .from('social_media_credentials')
      .select('project_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingCredential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    const project_id = existingCredential.project_id

    // Prepare update data
    const updateData: any = {}

    if (account_name !== undefined) {
      updateData.account_name = account_name
    }

    if (expires_at !== undefined) {
      updateData.expires_at = expires_at ? new Date(expires_at).toISOString() : null
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active
    }

    // Encrypt credential fields if provided
    if (credentials) {
      for (const [key, value] of Object.entries(credentials)) {
        if (value) {
          const { data: encrypted } = await supabase.rpc('encrypt_credential', {
            credential_text: value as string,
            project_id
          })
          updateData[`encrypted_${key}`] = encrypted
        }
      }
    }

    updateData.updated_at = new Date().toISOString()

    // Update credentials
    const { data: updatedCredential, error } = await supabase
      .from('social_media_credentials')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        platform,
        account_name,
        is_active,
        is_verified,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Error updating credential:', error)
      return NextResponse.json(
        { error: 'Failed to update credential' },
        { status: 500 }
      )
    }

    // Log credential update for audit
    await supabase.rpc('log_credential_access', {
      p_credential_id: id,
      p_action: 'updated',
      p_user_id: user.id,
      p_access_method: 'dashboard'
    })

    return NextResponse.json({ 
      credential: updatedCredential,
      message: 'Credential updated successfully'
    })

  } catch (error) {
    console.error('Credentials PUT error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete credential
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      )
    }

    // Get user for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('social_media_credentials')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting credential:', error)
      return NextResponse.json(
        { error: 'Failed to delete credential' },
        { status: 500 }
      )
    }

    // Log credential deletion for audit
    await supabase.rpc('log_credential_access', {
      p_credential_id: id,
      p_action: 'deleted',
      p_user_id: user.id,
      p_access_method: 'dashboard'
    })

    return NextResponse.json({ 
      message: 'Credential deleted successfully'
    })

  } catch (error) {
    console.error('Credentials DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}