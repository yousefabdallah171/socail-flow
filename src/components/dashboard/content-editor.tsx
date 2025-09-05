"use client"

import { useState } from 'react'
import { Save, Calendar, Hash, Image, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { updateContent, scheduleContent, ContentData } from '@/lib/content/content-actions'
import { toast } from 'sonner'

interface ContentEditorProps {
  content: ContentData
  onContentUpdated: () => void
}

export function ContentEditor({ content, onContentUpdated }: ContentEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: content.title,
    content: content.content,
    platforms: content.platforms,
    hashtags: content.hashtags || [],
    scheduledAt: content.scheduled_at 
      ? new Date(content.scheduled_at).toISOString().slice(0, 16)
      : '',
    status: content.status
  })

  const platformOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' }
  ]

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Content cannot be empty')
      return
    }

    if (formData.platforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setIsLoading(true)

    try {
      const updates: Partial<ContentData> = {
        title: formData.title,
        content: formData.content,
        platforms: formData.platforms,
        hashtags: formData.hashtags,
        status: formData.status
      }

      // If scheduling, include scheduled date
      if (formData.status === 'scheduled') {
        if (!formData.scheduledAt) {
          toast.error('Please select a scheduled date and time')
          setIsLoading(false)
          return
        }
        updates.scheduled_at = new Date(formData.scheduledAt)
      }

      const result = await updateContent(content.id!, updates)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Content updated successfully!')
      onContentUpdated()
    } catch (error) {
      toast.error('Failed to update content')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, platform]
      })
    } else {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter(p => p !== platform)
      })
    }
  }

  const handleHashtagsChange = (value: string) => {
    const hashtags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    
    setFormData({
      ...formData,
      hashtags
    })
  }

  return (
    <div className="space-y-6">
      {/* Content Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Edit your content information and settings
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              {content.ai_generated && (
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Hash className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={
                  content.status === 'published' ? 'bg-green-100 text-green-700' :
                  content.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  content.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }
              >
                {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter content title"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your content"
              rows={8}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length} characters
            </p>
          </div>

          <div>
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={(Array.isArray(formData.hashtags) ? formData.hashtags : [formData.hashtags || '']).join(', ').replace(/#/g, '')}
              onChange={(e) => handleHashtagsChange(e.target.value)}
              placeholder="Enter hashtags separated by commas"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Don't include # symbols - they'll be added automatically
            </p>
            
            {formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(Array.isArray(formData.hashtags) ? formData.hashtags : [formData.hashtags]).filter(tag => tag).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-blue-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Publishing Platforms</CardTitle>
            <CardDescription>Select platforms to publish this content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformOptions.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${platform.value}`}
                    checked={formData.platforms.includes(platform.value)}
                    onCheckedChange={(checked) => handlePlatformChange(platform.value, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`edit-${platform.value}`}>{platform.label}</Label>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <p className="text-xs text-muted-foreground">
              Selected platforms: {formData.platforms.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Settings</CardTitle>
            <CardDescription>Manage content scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule-edit"
                checked={formData.status === 'scheduled'}
                onCheckedChange={(checked) => {
                  setFormData({
                    ...formData,
                    status: checked ? 'scheduled' : 'draft'
                  })
                }}
                disabled={isLoading}
              />
              <Label htmlFor="schedule-edit">Schedule for later</Label>
            </div>

            {formData.status === 'scheduled' && (
              <div>
                <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduledAt: e.target.value
                  })}
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={isLoading}
                />
              </div>
            )}

            {content.scheduled_at && (
              <div className="text-xs text-muted-foreground">
                <p>Originally scheduled for:</p>
                <p>{new Date(content.scheduled_at).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      {content.created_at && (
        <Card>
          <CardHeader>
            <CardTitle>Content Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <Label className="font-medium">Created</Label>
                <p className="text-muted-foreground">
                  {new Date(content.created_at).toLocaleString()}
                </p>
              </div>
              
              {content.updated_at && (
                <div>
                  <Label className="font-medium">Last Updated</Label>
                  <p className="text-muted-foreground">
                    {new Date(content.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
              
              {content.ai_provider && (
                <div>
                  <Label className="font-medium">AI Provider</Label>
                  <p className="text-muted-foreground">
                    {content.ai_provider}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="font-medium">Content ID</Label>
                <p className="text-xs text-muted-foreground font-mono">
                  {content.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onContentUpdated} disabled={isLoading}>
          Cancel
        </Button>
        
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}