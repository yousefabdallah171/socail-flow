"use client"

import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  RefreshCw, 
  Copy, 
  Calendar,
  Image,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Target,
  Globe,
  Building2,
  Settings,
  FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { generateAIContent, generateContentIdeas } from '@/lib/ai/ai-service'
import { createContent } from '@/lib/content/content-actions'
import { getUserActiveProjects, type ProjectData } from '@/lib/projects/project-actions'
import { toast } from 'sonner'

interface EnhancedContentCreatorProps {
  onContentCreated: () => void
  initialProjectId?: string
}

interface ProjectSettings {
  industry?: string
  target_audience?: string
  default_tone: string
  default_content_type: string
  keywords?: string[]
  brand_voice?: string
  content_guidelines?: string
  hashtag_strategy?: string
}

export function EnhancedContentCreator({ onContentCreated, initialProjectId }: EnhancedContentCreatorProps) {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  
  // Project Management
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [useProjectSettings, setUseProjectSettings] = useState(true)
  
  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    prompt: '',
    industry: '',
    targetAudience: '',
    keywords: '',
    tone: 'professional' as const,
    contentType: 'post' as const,
    platform: 'facebook' as const,
    useAI: true,
    includeHashtags: true,
    includeEmojis: false
  })
  
  // Generated Content
  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    content: '',
    hashtags: [] as string[],
    platforms: ['facebook'] as string[],
    scheduledAt: ''
  })
  
  // Content Ideas
  const [contentIdeas, setContentIdeas] = useState<string[]>([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  // Load user's active projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true)
        const result = await getUserActiveProjects(20)
        
        if (result.error) {
          console.error('Error loading projects:', result.error)
          return
        }

        setProjects(result.data || [])
        
        // Auto-select project if provided or select first active project
        if (initialProjectId) {
          const project = result.data?.find(p => p.id === initialProjectId)
          if (project) {
            setSelectedProject(project)
            applyProjectSettings(project)
          }
        } else if (result.data && result.data.length > 0) {
          setSelectedProject(result.data[0])
          applyProjectSettings(result.data[0])
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [initialProjectId])

  // Apply project settings to form
  const applyProjectSettings = (project: ProjectData) => {
    if (!useProjectSettings) return

    setAiForm(prev => ({
      ...prev,
      industry: project.industry || '',
      targetAudience: project.target_audience || '',
      keywords: project.keywords?.join(', ') || '',
      tone: project.default_tone || 'professional',
      contentType: project.default_content_type || 'post'
    }))
  }

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      if (useProjectSettings) {
        applyProjectSettings(project)
      }
    }
  }

  // Toggle project settings usage
  const handleToggleProjectSettings = (enabled: boolean) => {
    setUseProjectSettings(enabled)
    if (enabled && selectedProject) {
      applyProjectSettings(selectedProject)
    } else {
      // Reset to defaults
      setAiForm(prev => ({
        ...prev,
        industry: '',
        targetAudience: '',
        keywords: '',
        tone: 'professional',
        contentType: 'post'
      }))
    }
  }

  // Generate content ideas
  const generateIdeas = async () => {
    if (!aiForm.industry || !aiForm.targetAudience) {
      toast.error('Please select a project or fill in industry and target audience')
      return
    }

    try {
      setLoadingIdeas(true)
      const ideas = await generateContentIdeas(aiForm.industry, aiForm.targetAudience, 5)
      setContentIdeas(ideas)
    } catch (error) {
      console.error('Error generating ideas:', error)
      toast.error('Failed to generate content ideas')
    } finally {
      setLoadingIdeas(false)
    }
  }

  // Generate AI content
  const handleGenerate = async () => {
    if (!aiForm.prompt.trim()) {
      toast.error('Please enter a content prompt')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const keywords = aiForm.keywords 
        ? aiForm.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : []

      const result = await generateAIContent(aiForm.prompt, {
        platform: aiForm.platform as any,
        contentType: aiForm.contentType as any,
        tone: aiForm.tone as any,
        industry: aiForm.industry,
        targetAudience: aiForm.targetAudience,
        keywords,
        maxLength: getMaxLengthForPlatform(aiForm.platform)
      })

      if (result.success) {
        setGeneratedContent({
          title: `${aiForm.contentType} for ${aiForm.platform}`,
          content: result.content || '',
          hashtags: result.hashtags || [],
          platforms: [aiForm.platform],
          scheduledAt: ''
        })
        setStep(2)
        toast.success('Content generated successfully!')
      } else {
        setGenerationError(result.error || 'Failed to generate content')
        toast.error(result.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      setGenerationError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  // Save content
  const handleSave = async () => {
    if (!generatedContent.content.trim()) {
      toast.error('Content cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const contentData = {
        title: generatedContent.title,
        content: generatedContent.content,
        platforms: generatedContent.platforms,
        hashtags: generatedContent.hashtags,
        status: 'draft' as const,
        ai_generated: aiForm.useAI,
        scheduled_at: generatedContent.scheduledAt ? new Date(generatedContent.scheduledAt) : null,
        ai_settings: {
          prompt: aiForm.prompt,
          tone: aiForm.tone,
          contentType: aiForm.contentType,
          platform: aiForm.platform,
          industry: aiForm.industry,
          targetAudience: aiForm.targetAudience,
          keywords: aiForm.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
          projectId: selectedProject?.id,
          projectName: selectedProject?.name,
          usedProjectSettings: useProjectSettings
        }
      }

      const result = await createContent(contentData)
      
      if (result.error) {
        toast.error(`Failed to save content: ${result.error}`)
        return
      }

      toast.success('Content saved successfully!')
      onContentCreated()
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  const getMaxLengthForPlatform = (platform: string): number => {
    const limits = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 1300,
      tiktok: 150
    }
    return limits[platform as keyof typeof limits] || 1000
  }

  // UI Options
  const toneOptions = [
    { value: 'professional', label: '👔 Professional', desc: 'Authoritative and credible' },
    { value: 'casual', label: '😊 Casual', desc: 'Friendly and approachable' },
    { value: 'funny', label: '😄 Funny', desc: 'Humorous and entertaining' },
    { value: 'inspiring', label: '✨ Inspiring', desc: 'Motivational and uplifting' },
    { value: 'promotional', label: '🎯 Promotional', desc: 'Sales-focused with clear CTA' },
  ]

  const contentTypeOptions = [
    { value: 'post', label: '📝 Social Post', desc: 'Regular social media post' },
    { value: 'story', label: '📱 Story', desc: 'Short-form story content' },
    { value: 'reel', label: '🎬 Reel/Video', desc: 'Video script or reel content' },
    { value: 'thread', label: '🧵 Thread', desc: 'Multi-part thread content' },
  ]

  const platformOptions = [
    { value: 'facebook', label: '📘 Facebook', limit: '63K chars' },
    { value: 'instagram', label: '📷 Instagram', limit: '2.2K chars' },
    { value: 'twitter', label: '🐦 Twitter/X', limit: '280 chars' },
    { value: 'linkedin', label: '💼 LinkedIn', limit: '1.3K chars' },
    { value: 'tiktok', label: '🎵 TikTok', limit: '150 chars' },
  ]

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2">Loading projects...</span>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Project Context</span>
            </CardTitle>
            <CardDescription>
              Select a project to use its AI settings, or create content manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Select Project</Label>
                  <Select 
                    value={selectedProject?.id || ''} 
                    onValueChange={handleProjectSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id!}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {project.industry} • {project.status}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-project-settings"
                    checked={useProjectSettings}
                    onCheckedChange={handleToggleProjectSettings}
                  />
                  <Label htmlFor="use-project-settings" className="text-sm">
                    Use project's AI settings (recommended)
                  </Label>
                </div>

                {selectedProject && useProjectSettings && (
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div><strong>Industry:</strong> {selectedProject.industry}</div>
                        <div><strong>Audience:</strong> {selectedProject.target_audience}</div>
                        <div><strong>Tone:</strong> {selectedProject.default_tone}</div>
                        <div><strong>Content Type:</strong> {selectedProject.default_content_type}</div>
                        {selectedProject.keywords && selectedProject.keywords.length > 0 && (
                          <div><strong>Keywords:</strong> {selectedProject.keywords.join(', ')}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active projects found. Create a project first to use pre-configured AI settings,
                  or continue with manual settings below.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* AI Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI Content Generation</span>
            </CardTitle>
            <CardDescription>
              Configure settings for AI-powered content creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Content Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to create. E.g., 'A post about sustainable fashion trends for spring, highlighting eco-friendly materials and ethical brands...'"
                value={aiForm.prompt}
                onChange={(e) => setAiForm({ ...aiForm, prompt: e.target.value })}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Be specific about your content goals and key messages
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateIdeas}
                  disabled={loadingIdeas || !aiForm.industry || !aiForm.targetAudience}
                >
                  {loadingIdeas ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  Get Ideas
                </Button>
              </div>
            </div>

            {/* Content Ideas */}
            {contentIdeas.length > 0 && (
              <div className="space-y-2">
                <Label>Content Ideas</Label>
                <div className="grid gap-2 max-h-32 overflow-y-auto">
                  {contentIdeas.map((idea, index) => (
                    <button
                      key={index}
                      onClick={() => setAiForm({ ...aiForm, prompt: idea })}
                      className="text-left p-2 text-sm bg-muted rounded hover:bg-accent transition-colors"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Platform and Content Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select value={aiForm.platform} onValueChange={(value) => setAiForm({ ...aiForm, platform: value as 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {option.limit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Content Type *</Label>
                <Select value={aiForm.contentType} onValueChange={(value) => setAiForm({ ...aiForm, contentType: value as 'post' | 'story' | 'reel' | 'thread' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.desc}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label>Tone & Style *</Label>
              <Select value={aiForm.tone} onValueChange={(value) => setAiForm({ ...aiForm, tone: value as 'professional' | 'casual' | 'funny' | 'inspiring' | 'promotional' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div>{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.desc}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manual Settings (only if not using project settings) */}
            {!useProjectSettings && (
              <>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      placeholder="e.g., Fashion & Apparel"
                      value={aiForm.industry}
                      onChange={(e) => setAiForm({ ...aiForm, industry: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input
                      placeholder="e.g., Young professionals aged 25-35"
                      value={aiForm.targetAudience}
                      onChange={(e) => setAiForm({ ...aiForm, targetAudience: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="sustainable, eco-friendly, trendy, affordable"
                    value={aiForm.keywords}
                    onChange={(e) => setAiForm({ ...aiForm, keywords: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Comma-separated keywords to include in content and hashtags
                  </p>
                </div>
              </>
            )}

            {/* Generation Options */}
            <Separator />
            <div className="space-y-3">
              <Label>Generation Options</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-hashtags"
                    checked={aiForm.includeHashtags}
                    onCheckedChange={(checked) => 
                      setAiForm({ ...aiForm, includeHashtags: !!checked })
                    }
                  />
                  <Label htmlFor="include-hashtags" className="text-sm">
                    Include hashtags
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-emojis"
                    checked={aiForm.includeEmojis}
                    onCheckedChange={(checked) => 
                      setAiForm({ ...aiForm, includeEmojis: !!checked })
                    }
                  />
                  <Label htmlFor="include-emojis" className="text-sm">
                    Include emojis
                  </Label>
                </div>
              </div>
            </div>

            {/* Generation Error */}
            {generationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generationError}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !aiForm.prompt.trim()}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Review and Edit Generated Content
  return (
    <div className="space-y-6">
      {/* Generated Content Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle>Generated Content</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {aiForm.platform} • {aiForm.contentType}
              </Badge>
              <Badge variant="outline">
                {aiForm.tone}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Review and edit your AI-generated content before saving
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Title */}
          <div className="space-y-2">
            <Label>Content Title</Label>
            <Input
              value={generatedContent.title}
              onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
              placeholder="Enter content title..."
            />
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {generatedContent.content.length} / {getMaxLengthForPlatform(aiForm.platform)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(generatedContent.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={generatedContent.content}
              onChange={(e) => setGeneratedContent({ ...generatedContent, content: e.target.value })}
              rows={8}
              className="resize-none font-mono"
            />
          </div>

          {/* Hashtags */}
          {generatedContent.hashtags.length > 0 && (
            <div className="space-y-2">
              <Label>Hashtags</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                {generatedContent.hashtags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-blue-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling */}
          <div className="space-y-2">
            <Label>Schedule (Optional)</Label>
            <Input
              type="datetime-local"
              value={generatedContent.scheduledAt}
              onChange={(e) => setGeneratedContent({ ...generatedContent, scheduledAt: e.target.value })}
            />
          </div>

          {/* Project Context */}
          {selectedProject && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>This content will be saved to: <strong>{selectedProject.name}</strong></span>
                  <Badge variant="outline">{selectedProject.industry}</Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerate
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}