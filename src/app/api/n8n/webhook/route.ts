import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const webhookConfigSchema = z.object({
  project_id: z.string().uuid(),
  webhook_url: z.string().url(),
  webhook_secret: z.string().min(1),
  n8n_workflow_id: z.string().optional(),
  automation_type: z.enum(['content_creation', 'posting', 'analytics', 'monitoring']),
  trigger_events: z.array(z.string()).default(['content_ready', 'schedule_time']),
  platform_filters: z.array(z.string()).optional(),
})

const triggerWebhookSchema = z.object({
  project_id: z.string().uuid(),
  automation_type: z.enum(['content_creation', 'posting', 'analytics', 'monitoring']),
  event_data: z.object({
    event_type: z.string(),
    content_id: z.string().uuid().optional(),
    scheduled_time: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
})

// GET - Fetch N8N webhook configurations for a project
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

    // Get user for authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch webhook configurations
    const { data: configs, error } = await supabase
      .from('n8n_webhook_configs')
      .select(`
        id,
        webhook_url,
        n8n_workflow_id,
        automation_type,
        is_active,
        trigger_events,
        platform_filters,
        last_triggered_at,
        trigger_count,
        created_at,
        updated_at
      `)
      .eq('project_id', project_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching N8N configs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch webhook configurations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ configs: configs || [] })
  } catch (error) {
    console.error('N8N webhook GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create N8N webhook configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Check if this is a webhook trigger request or config creation
    if (body.event_data) {
      return await triggerWebhook(request, body)
    }

    // Validate webhook configuration request
    const validatedData = webhookConfigSchema.parse(body)
    const { 
      project_id, 
      webhook_url, 
      webhook_secret, 
      n8n_workflow_id,
      automation_type, 
      trigger_events, 
      platform_filters 
    } = validatedData

    // Get user for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create webhook configuration
    const { data: newConfig, error } = await supabase
      .from('n8n_webhook_configs')
      .insert([{
        project_id,
        webhook_url,
        webhook_secret,
        n8n_workflow_id,
        automation_type,
        trigger_events,
        platform_filters,
        created_by: user.id,
      }])
      .select(`
        id,
        webhook_url,
        n8n_workflow_id,
        automation_type,
        trigger_events,
        platform_filters,
        is_active,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error creating N8N config:', error)
      return NextResponse.json(
        { error: 'Failed to create webhook configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      config: newConfig,
      message: 'N8N webhook configuration created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('N8N webhook POST error:', error)
    
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

// Function to trigger N8N webhook
async function triggerWebhook(request: NextRequest, body: any) {
  try {
    const supabase = createClient()
    
    // Validate trigger request
    const validatedData = triggerWebhookSchema.parse(body)
    const { project_id, automation_type, event_data } = validatedData

    // Get user for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use the database function to trigger N8N automation
    const { data: success, error } = await supabase
      .rpc('trigger_n8n_automation', {
        p_project_id: project_id,
        p_automation_type: automation_type,
        p_event_data: event_data
      })

    if (error) {
      console.error('Error triggering N8N automation:', error)
      return NextResponse.json(
        { error: 'Failed to trigger automation' },
        { status: 500 }
      )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'No active webhook configuration found for this automation type' },
        { status: 404 }
      )
    }

    // In a real implementation, you would also make the actual HTTP request to N8N:
    /*
    const { data: configs } = await supabase
      .from('n8n_webhook_configs')
      .select('webhook_url, webhook_secret')
      .eq('project_id', project_id)
      .eq('automation_type', automation_type)
      .eq('is_active', true)
      .single()

    if (configs) {
      const { data: credentials } = await supabase
        .rpc('prepare_n8n_credentials', { p_project_id: project_id })

      const payload = {
        project_id,
        automation_type,
        event_data,
        credentials,
        timestamp: new Date().toISOString(),
        webhook_secret: configs.webhook_secret
      }

      // Make HTTP request to N8N webhook
      const response = await fetch(configs.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': configs.webhook_secret,
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.statusText}`)
      }
    }
    */

    return NextResponse.json({
      success: true,
      message: 'N8N automation triggered successfully',
      project_id,
      automation_type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('N8N webhook trigger error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid trigger data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to trigger automation' },
      { status: 500 }
    )
  }
}

// PUT - Update N8N webhook configuration
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id, webhook_url, webhook_secret, n8n_workflow_id, automation_type, trigger_events, platform_filters, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
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

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (webhook_url !== undefined) updateData.webhook_url = webhook_url
    if (webhook_secret !== undefined) updateData.webhook_secret = webhook_secret
    if (n8n_workflow_id !== undefined) updateData.n8n_workflow_id = n8n_workflow_id
    if (automation_type !== undefined) updateData.automation_type = automation_type
    if (trigger_events !== undefined) updateData.trigger_events = trigger_events
    if (platform_filters !== undefined) updateData.platform_filters = platform_filters
    if (is_active !== undefined) updateData.is_active = is_active

    // Update configuration
    const { data: updatedConfig, error } = await supabase
      .from('n8n_webhook_configs')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        webhook_url,
        n8n_workflow_id,
        automation_type,
        trigger_events,
        platform_filters,
        is_active,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Error updating N8N config:', error)
      return NextResponse.json(
        { error: 'Failed to update webhook configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      config: updatedConfig,
      message: 'N8N webhook configuration updated successfully'
    })

  } catch (error) {
    console.error('N8N webhook PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove N8N webhook configuration
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
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
      .from('n8n_webhook_configs')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting N8N config:', error)
      return NextResponse.json(
        { error: 'Failed to delete webhook configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'N8N webhook configuration deleted successfully'
    })

  } catch (error) {
    console.error('N8N webhook DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}