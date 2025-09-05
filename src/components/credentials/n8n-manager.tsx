"use client"

import { useState, useEffect } from 'react'
import { Plus, Webhook, MoreHorizontal, Edit, Trash2, Play, Pause, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { N8NWebhookConfig, N8NWebhookForm } from '@/types'
import { N8NWebhookForm as N8NWebhookFormComponent } from './n8n-webhook-form'
import { formatDistanceToNow } from 'date-fns'

interface N8NManagerProps {
  project_id: string
}

export function N8NManager({ project_id }: N8NManagerProps) {
  const [configs, setConfigs] = useState<N8NWebhookConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<N8NWebhookConfig | null>(null)
  const [deletingConfig, setDeletingConfig] = useState<N8NWebhookConfig | null>(null)

  // Fetch N8N webhook configurations
  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/n8n/webhook?project_id=${project_id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch N8N configurations')
      }
      
      setConfigs(data.configs || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (project_id) {
      fetchConfigs()
    }
  }, [project_id])

  const handleAddConfig = async (formData: N8NWebhookForm) => {
    try {
      const response = await fetch('/api/n8n/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create N8N webhook')
      }

      // Refresh configs list
      await fetchConfigs()
      setShowAddDialog(false)
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleEditConfig = async (formData: N8NWebhookForm) => {
    if (!editingConfig) return

    try {
      const response = await fetch('/api/n8n/webhook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingConfig.id,
          ...formData,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update N8N webhook')
      }

      // Refresh configs list
      await fetchConfigs()
      setEditingConfig(null)
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleDeleteConfig = async (config: N8NWebhookConfig) => {
    try {
      const response = await fetch(`/api/n8n/webhook?id=${config.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete N8N webhook')
      }

      // Refresh configs list
      await fetchConfigs()
      setDeletingConfig(null)
    } catch (err: any) {
      console.error('Failed to delete config:', err)
      setError(err.message)
    }
  }

  const handleToggleConfig = async (config: N8NWebhookConfig) => {
    try {
      const response = await fetch('/api/n8n/webhook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: config.id,
          is_active: !config.is_active,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle N8N webhook')
      }

      // Refresh configs list
      await fetchConfigs()
    } catch (err: any) {
      console.error('Failed to toggle config:', err)
      setError(err.message)
    }
  }

  const getAutomationTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      content_creation: { color: 'bg-blue-100 text-blue-800', label: 'Content Creation' },
      posting: { color: 'bg-green-100 text-green-800', label: 'Auto Posting' },
      analytics: { color: 'bg-purple-100 text-purple-800', label: 'Analytics' },
      monitoring: { color: 'bg-orange-100 text-orange-800', label: 'Monitoring' },
    }
    
    const variant = variants[type] || { color: 'bg-gray-100 text-gray-800', label: type }
    
    return (
      <Badge variant="secondary" className={variant.color}>
        {variant.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">N8N Automation</h2>
          <p className="text-muted-foreground">
            Configure webhook endpoints for automated workflows
          </p>
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Webhook className="h-4 w-4" />
        <AlertDescription>
          N8N webhooks enable real-time automation for content creation, posting, analytics, and monitoring. 
          Each webhook can be configured for specific triggers and platforms.
        </AlertDescription>
      </Alert>

      {/* Configurations List */}
      {configs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Webhook className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>N8N Webhook</span>
                        {getAutomationTypeBadge(config.automation_type)}
                        {config.is_active ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {config.n8n_workflow_id && (
                          <span>Workflow: {config.n8n_workflow_id} • </span>
                        )}
                        Created {formatDistanceToNow(new Date(config.created_at))} ago
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditingConfig(config)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Webhook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleConfig(config)}>
                        {config.is_active ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Enable
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={config.webhook_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open URL
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeletingConfig(config)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Webhook URL */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Webhook URL</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded truncate">
                      {config.webhook_url}
                    </p>
                  </div>

                  {/* Trigger Events */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trigger Events</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {config.trigger_events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Platform Filters */}
                  {config.platform_filters && config.platform_filters.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform Filters</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.platform_filters.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Usage Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <div>
                      <span className="font-medium">Triggers:</span> {config.trigger_count}
                    </div>
                    <div>
                      <span className="font-medium">Last Triggered:</span>{' '}
                      {config.last_triggered_at 
                        ? formatDistanceToNow(new Date(config.last_triggered_at)) + ' ago'
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No N8N Webhooks</h3>
            <p className="text-muted-foreground mb-4">
              Set up your first N8N webhook to enable automated workflows for social media management.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Webhook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Webhook Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add N8N Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint for automated workflows
            </DialogDescription>
          </DialogHeader>

          <N8NWebhookFormComponent
            project_id={project_id}
            onSubmit={handleAddConfig}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit N8N Webhook</DialogTitle>
            <DialogDescription>
              Update your webhook configuration
            </DialogDescription>
          </DialogHeader>

          {editingConfig && (
            <N8NWebhookFormComponent
              project_id={project_id}
              initialData={{
                webhook_url: editingConfig.webhook_url,
                webhook_secret: editingConfig.webhook_secret,
                n8n_workflow_id: editingConfig.n8n_workflow_id,
                automation_type: editingConfig.automation_type,
                trigger_events: editingConfig.trigger_events,
                platform_filters: editingConfig.platform_filters,
              }}
              onSubmit={handleEditConfig}
              onCancel={() => setEditingConfig(null)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingConfig} onOpenChange={() => setDeletingConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete N8N Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook configuration? 
              This will disable automated workflows that depend on this endpoint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingConfig && handleDeleteConfig(deletingConfig)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}