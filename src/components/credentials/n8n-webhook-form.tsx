"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Webhook, Plus, Trash2, ExternalLink, Settings, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AutomationType, type N8NWebhookForm as N8NWebhookFormType } from '@/types'
import { PLATFORM_INFO } from '@/lib/credentials/platform-configs'

// Validation schema
const webhookFormSchema = z.object({
  webhook_url: z.string().url('Please enter a valid webhook URL'),
  webhook_secret: z.string().min(8, 'Webhook secret must be at least 8 characters'),
  n8n_workflow_id: z.string().optional(),
  automation_type: z.enum(['content_creation', 'posting', 'analytics', 'monitoring']),
  trigger_events: z.array(z.string()).min(1, 'Select at least one trigger event'),
  platform_filters: z.array(z.string()).optional(),
})

type WebhookFormData = z.infer<typeof webhookFormSchema>

interface N8NWebhookFormProps {
  project_id: string
  initialData?: Partial<N8NWebhookForm>
  onSubmit: (data: N8NWebhookForm) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

const AUTOMATION_TYPES: Array<{
  value: AutomationType
  label: string
  description: string
}> = [
  {
    value: 'content_creation',
    label: 'Content Creation',
    description: 'Trigger when new AI content is generated'
  },
  {
    value: 'posting',
    label: 'Automated Posting',
    description: 'Trigger when content is scheduled for posting'
  },
  {
    value: 'analytics',
    label: 'Analytics Collection',
    description: 'Trigger for collecting and processing analytics data'
  },
  {
    value: 'monitoring',
    label: 'Account Monitoring',
    description: 'Trigger for monitoring social media accounts'
  }
]

const TRIGGER_EVENTS = [
  { id: 'content_ready', label: 'Content Ready', description: 'When AI content is generated and ready' },
  { id: 'schedule_time', label: 'Schedule Time', description: 'When it\'s time to post scheduled content' },
  { id: 'engagement_alert', label: 'Engagement Alert', description: 'When engagement thresholds are met' },
  { id: 'mention_detected', label: 'Mention Detected', description: 'When brand mentions are detected' },
  { id: 'follower_milestone', label: 'Follower Milestone', description: 'When follower count milestones are reached' },
]

const PLATFORM_OPTIONS = Object.entries(PLATFORM_INFO).map(([key, info]) => ({
  id: key,
  label: info.name,
  icon: info.icon
}))

export function N8NWebhookForm({
  project_id,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}: N8NWebhookFormProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      webhook_url: initialData?.webhook_url || '',
      webhook_secret: initialData?.webhook_secret || '',
      n8n_workflow_id: initialData?.n8n_workflow_id || '',
      automation_type: initialData?.automation_type || 'content_creation',
      trigger_events: initialData?.trigger_events || ['content_ready'],
      platform_filters: initialData?.platform_filters || [],
    }
  })

  const handleSubmit = async (data: WebhookFormData) => {
    setIsSubmitting(true)

    try {
      const formData: N8NWebhookForm = {
        project_id,
        webhook_url: data.webhook_url,
        webhook_secret: data.webhook_secret,
        n8n_workflow_id: data.n8n_workflow_id || undefined,
        automation_type: data.automation_type,
        trigger_events: data.trigger_events,
        platform_filters: data.platform_filters?.length ? data.platform_filters : undefined,
      }

      await onSubmit(formData)
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateWebhookSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    form.setValue('webhook_secret', secret)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Webhook className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>
              {isEditing ? 'Edit' : 'Configure'} N8N Webhook
            </CardTitle>
            <CardDescription>
              Set up automated workflows for social media management
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Configure your N8N webhook to receive real-time events from SocialFlow. 
            Make sure your N8N instance is accessible and configured to handle these events.
            <a 
              href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 text-primary hover:underline inline-flex items-center"
            >
              View N8N webhook docs
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook_url">
              Webhook URL *
            </Label>
            <Input
              id="webhook_url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/socialflow"
              {...form.register('webhook_url')}
            />
            <p className="text-sm text-muted-foreground">
              The N8N webhook URL that will receive events from SocialFlow
            </p>
            {form.formState.errors.webhook_url && (
              <p className="text-sm text-red-600">
                {form.formState.errors.webhook_url.message}
              </p>
            )}
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="webhook_secret">
              Webhook Secret *
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="webhook_secret"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter a secure secret key"
                  {...form.register('webhook_secret')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showSecret ? 'Hide' : 'Show'} webhook secret
                  </span>
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generateWebhookSecret}
              >
                Generate
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Used to verify webhook authenticity. Keep this secret secure!
            </p>
            {form.formState.errors.webhook_secret && (
              <p className="text-sm text-red-600">
                {form.formState.errors.webhook_secret.message}
              </p>
            )}
          </div>

          {/* N8N Workflow ID */}
          <div className="space-y-2">
            <Label htmlFor="n8n_workflow_id">
              N8N Workflow ID (Optional)
            </Label>
            <Input
              id="n8n_workflow_id"
              placeholder="workflow-123"
              {...form.register('n8n_workflow_id')}
            />
            <p className="text-sm text-muted-foreground">
              Optional workflow ID for tracking and organization
            </p>
          </div>

          <Separator />

          {/* Automation Type */}
          <div className="space-y-3">
            <Label>
              Automation Type *
            </Label>
            <Select
              value={form.watch('automation_type')}
              onValueChange={(value: AutomationType) => form.setValue('automation_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select automation type" />
              </SelectTrigger>
              <SelectContent>
                {AUTOMATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="space-y-1">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trigger Events */}
          <div className="space-y-3">
            <Label>
              Trigger Events *
            </Label>
            <div className="space-y-2">
              {TRIGGER_EVENTS.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={event.id}
                    checked={form.watch('trigger_events').includes(event.id)}
                    onCheckedChange={(checked) => {
                      const currentEvents = form.watch('trigger_events')
                      if (checked) {
                        form.setValue('trigger_events', [...currentEvents, event.id])
                      } else {
                        form.setValue('trigger_events', currentEvents.filter(e => e !== event.id))
                      }
                    }}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={event.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {event.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {form.formState.errors.trigger_events && (
              <p className="text-sm text-red-600">
                {form.formState.errors.trigger_events.message}
              </p>
            )}
          </div>

          {/* Platform Filters */}
          <div className="space-y-3">
            <Label>
              Platform Filters (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Leave empty to receive events from all platforms, or select specific platforms
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORM_OPTIONS.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={form.watch('platform_filters')?.includes(platform.id) || false}
                    onCheckedChange={(checked) => {
                      const currentFilters = form.watch('platform_filters') || []
                      if (checked) {
                        form.setValue('platform_filters', [...currentFilters, platform.id])
                      } else {
                        form.setValue('platform_filters', currentFilters.filter(p => p !== platform.id))
                      }
                    }}
                  />
                  <Label
                    htmlFor={platform.id}
                    className="text-sm cursor-pointer flex items-center space-x-1"
                  >
                    <span>{platform.icon}</span>
                    <span>{platform.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Webhook className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Webhook' : 'Create Webhook'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}