"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Save, 
  X, 
  Target, 
  Sparkles, 
  Calendar, 
  Settings2, 
  Globe,
  DollarSign,
  Users,
  Tag,
  FileText,
  Palette
} from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

import { updateProject, getIndustries, type ProjectData } from '@/lib/projects/project-actions'

const projectSettingsSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  industry: z.string().min(1, 'Industry is required'),
  target_audience: z.string().min(1, 'Target audience is required').max(200, 'Target audience too long'),
  brand_voice: z.string().max(1000, 'Brand voice description too long').optional(),
  content_guidelines: z.string().max(1000, 'Content guidelines too long').optional(),
  default_tone: z.enum(['professional', 'casual', 'funny', 'inspiring', 'promotional']),
  default_content_type: z.enum(['post', 'story', 'reel', 'thread']),
  keywords: z.string().optional(),
  hashtag_strategy: z.string().max(500, 'Hashtag strategy too long').optional(),
  website_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget_allocated: z.number().min(0, 'Budget must be positive').optional()
})

type ProjectSettingsForm = z.infer<typeof projectSettingsSchema>

interface ProjectSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectData
  onProjectUpdated: () => void
}

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  project,
  onProjectUpdated
}: ProjectSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [industries, setIndustries] = useState<any[]>([])
  const [keywordsList, setKeywordsList] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')

  const form = useForm<ProjectSettingsForm>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: project.name || '',
      description: project.description || '',
      industry: project.industry || '',
      target_audience: project.target_audience || '',
      brand_voice: project.brand_voice || '',
      content_guidelines: project.content_guidelines || '',
      default_tone: project.default_tone || 'professional',
      default_content_type: project.default_content_type || 'post',
      keywords: project.keywords?.join(', ') || '',
      hashtag_strategy: project.hashtag_strategy || '',
      website_url: project.website_url || '',
      status: project.status || 'active',
      priority: project.priority || 'medium',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget_allocated: project.budget_allocated || undefined
    }
  })

  // Load industries on mount
  useEffect(() => {
    const loadIndustries = async () => {
      const result = await getIndustries()
      if (result.data) {
        setIndustries(result.data)
      }
    }
    loadIndustries()
  }, [])

  // Initialize keywords list
  useEffect(() => {
    if (project.keywords) {
      setKeywordsList([...project.keywords])
    }
  }, [project.keywords])

  const onSubmit = async (data: ProjectSettingsForm) => {
    if (!project.id) return

    setIsLoading(true)
    try {
      // Convert keywords string to array
      const keywordsArray = data.keywords 
        ? data.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : []

      const updateData = {
        ...data,
        keywords: keywordsArray,
        website_url: data.website_url || undefined,
        budget_allocated: data.budget_allocated || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined
      }

      const result = await updateProject(project.id, updateData)
      
      if (result.error) {
        toast.error(`Failed to update project: ${result.error}`)
        return
      }

      toast.success('Project updated successfully')
      onProjectUpdated()
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    } finally {
      setIsLoading(false)
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !keywordsList.includes(newKeyword.trim())) {
      const updatedKeywords = [...keywordsList, newKeyword.trim()]
      setKeywordsList(updatedKeywords)
      form.setValue('keywords', updatedKeywords.join(', '))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywordsList.filter(k => k !== keyword)
    setKeywordsList(updatedKeywords)
    form.setValue('keywords', updatedKeywords.join(', '))
  }

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'professional': return '👔'
      case 'casual': return '😊'
      case 'funny': return '😄'
      case 'inspiring': return '✨'
      case 'promotional': return '🎯'
      default: return '💬'
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝'
      case 'story': return '📱'
      case 'reel': return '🎥'
      case 'thread': return '🧵'
      default: return '📄'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings2 className="h-5 w-5" />
            <span>Project Settings: {project.name}</span>
          </DialogTitle>
          <DialogDescription>
            Configure project details, AI content generation settings, and campaign parameters
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Nike Summer Campaign 2024" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry.name} value={industry.name}>
                                    <div className="flex items-center space-x-2">
                                      <span>{industry.icon}</span>
                                      <span>{industry.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Brief description of this project and its goals..."
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description to help team members understand the project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target_audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Young professionals aged 25-35 interested in sustainable fashion"
                            />
                          </FormControl>
                          <FormDescription>
                            Describe your ideal audience for better AI content generation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">🟢 Active</SelectItem>
                                <SelectItem value="paused">🟡 Paused</SelectItem>
                                <SelectItem value="completed">🔵 Completed</SelectItem>
                                <SelectItem value="archived">⚫ Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                                <SelectItem value="high">🟠 High</SelectItem>
                                <SelectItem value="medium">🟡 Medium</SelectItem>
                                <SelectItem value="low">🟢 Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Settings Tab */}
              <TabsContent value="ai-settings" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>AI Content Generation Settings</span>
                    </CardTitle>
                    <CardDescription>
                      These settings will be automatically applied when creating new content for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="default_tone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="professional">
                                  <div className="flex items-center space-x-2">
                                    <span>{getToneIcon('professional')}</span>
                                    <span>Professional & Authoritative</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="casual">
                                  <div className="flex items-center space-x-2">
                                    <span>{getToneIcon('casual')}</span>
                                    <span>Casual & Friendly</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="funny">
                                  <div className="flex items-center space-x-2">
                                    <span>{getToneIcon('funny')}</span>
                                    <span>Funny & Humorous</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="inspiring">
                                  <div className="flex items-center space-x-2">
                                    <span>{getToneIcon('inspiring')}</span>
                                    <span>Inspiring & Motivational</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="promotional">
                                  <div className="flex items-center space-x-2">
                                    <span>{getToneIcon('promotional')}</span>
                                    <span>Promotional & Sales-focused</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="default_content_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Content Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="post">
                                  <div className="flex items-center space-x-2">
                                    <span>{getContentTypeIcon('post')}</span>
                                    <span>Social Media Post</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="story">
                                  <div className="flex items-center space-x-2">
                                    <span>{getContentTypeIcon('story')}</span>
                                    <span>Story Content</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="reel">
                                  <div className="flex items-center space-x-2">
                                    <span>{getContentTypeIcon('reel')}</span>
                                    <span>Reel/Video Script</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="thread">
                                  <div className="flex items-center space-x-2">
                                    <span>{getContentTypeIcon('thread')}</span>
                                    <span>Twitter Thread</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="brand_voice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Voice & Personality</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe the brand's personality, voice, and communication style. E.g., 'Modern, eco-conscious, and approachable. Uses inclusive language and emphasizes sustainability...'"
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Help AI understand how this brand should communicate with its audience
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Keywords Management */}
                    <div className="space-y-3">
                      <Label>Project Keywords</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Add keyword..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addKeyword()
                            }
                          }}
                        />
                        <Button type="button" onClick={addKeyword} variant="outline">
                          <Tag className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {keywordsList.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {keywordsList.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeKeyword(keyword)}
                            >
                              {keyword}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormDescription>
                        Keywords help AI generate more relevant content and hashtags
                      </FormDescription>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Content Guidelines & Strategy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content_guidelines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Guidelines & Restrictions</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Any specific content guidelines, restrictions, or brand requirements. E.g., 'Always include accessibility descriptions for images, avoid political topics, maintain positive tone...'"
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Specific rules or guidelines for content creation that AI should follow
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hashtag_strategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hashtag Strategy</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Hashtag preferences, branded hashtags, limits. E.g., 'Always include #SustainableFashion #EcoFriendly, limit to 10 hashtags max, avoid trending hashtags unrelated to brand...'"
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Guidelines for hashtag usage and strategy
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Website</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="url"
                              placeholder="https://example.com"
                            />
                          </FormControl>
                          <FormDescription>
                            Main website or landing page for this project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Campaign Tab */}
              <TabsContent value="campaign" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Campaign Timeline & Budget</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="budget_allocated"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Allocated</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input 
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-9"
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Total budget allocated for this project (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Additional configuration options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Additional advanced settings will be available in future updates:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Custom AI model selection</li>
                        <li>Content approval workflows</li>
                        <li>Advanced scheduling rules</li>
                        <li>Integration settings</li>
                        <li>Custom fields and metadata</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}