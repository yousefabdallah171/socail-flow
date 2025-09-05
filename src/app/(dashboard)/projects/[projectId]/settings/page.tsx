'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Save, Plus, Trash2, Settings2, Palette, Target, Hash, Globe, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useProjects } from '@/components/dashboard/project-provider'
import type { Project, SocialAccount } from '@/lib/projects/api'
import { Facebook, Instagram, Twitter, Linkedin, Youtube, TrendingUp } from 'lucide-react'

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: TrendingUp,
  pinterest: Globe
}

const platformColors = {
  facebook: 'bg-blue-500',
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-600',
  youtube: 'bg-red-500',
  tiktok: 'bg-black',
  pinterest: 'bg-red-600'
}

export default function ProjectSettingsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { currentProject, refreshProjects } = useProjects()
  
  const [project, setProject] = useState<Project | null>(null)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    target_audience: '',
    brand_voice: '',
    brand_guidelines: '',
    default_tone: 'professional' as const,
    default_content_type: 'post' as const,
    keywords: [] as string[],
    hashtag_strategy: '',
    website_url: ''
  })

  // Load project data
  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setIsLoading(true)
      
      // Load project details
      const { getProject, getProjectSocialAccounts } = await import('@/lib/projects/api')
      
      const projectResult = await getProject(projectId)
      if (projectResult.success && projectResult.project) {
        const proj = projectResult.project
        setProject(proj)
        
        // Update form data
        setFormData({
          name: proj.name,
          description: proj.description || '',
          industry: proj.industry || '',
          target_audience: proj.target_audience || '',
          brand_voice: proj.brand_voice || '',
          brand_guidelines: proj.brand_guidelines || '',
          default_tone: proj.default_tone,
          default_content_type: proj.default_content_type,
          keywords: proj.keywords || [],
          hashtag_strategy: proj.hashtag_strategy || '',
          website_url: proj.website_url || ''
        })
      }

      // Load social accounts
      const socialResult = await getProjectSocialAccounts(projectId)
      if (socialResult.success && socialResult.accounts) {
        setSocialAccounts(socialResult.accounts)
      }
    } catch (error) {
      console.error('Error loading project data:', error)
      toast.error('Failed to load project data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const { updateProject } = await import('@/lib/projects/api')
      
      const result = await updateProject(projectId, {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        target_audience: formData.target_audience,
        brand_voice: formData.brand_voice,
        default_tone: formData.default_tone,
        default_content_type: formData.default_content_type,
        keywords: formData.keywords
      })

      if (result.success) {
        toast.success('Project settings saved successfully')
        refreshProjects() // Refresh the projects list
      } else {
        toast.error(result.error || 'Failed to save project settings')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to save project settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSocialAccount = async (platform: string) => {
    try {
      const { addSocialAccount } = await import('@/lib/projects/api')
      
      const result = await addSocialAccount(projectId, platform as any)
      
      if (result.success) {
        toast.success(`${platform} account added successfully`)
        loadProjectData() // Reload to get updated data
      } else {
        toast.error(result.error || 'Failed to add social account')
      }
    } catch (error) {
      console.error('Error adding social account:', error)
      toast.error('Failed to add social account')
    }
  }

  const handleRemoveSocialAccount = async (accountId: string) => {
    try {
      const { removeSocialAccount } = await import('@/lib/projects/api')
      
      const result = await removeSocialAccount(accountId)
      
      if (result.success) {
        toast.success('Social account removed successfully')
        loadProjectData() // Reload to get updated data
      } else {
        toast.error(result.error || 'Failed to remove social account')
      }
    } catch (error) {
      console.error('Error removing social account:', error)
      toast.error('Failed to remove social account')
    }
  }

  const availablePlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest']
  const connectedPlatforms = socialAccounts.map(account => account.platform)
  const unconnectedPlatforms = availablePlatforms.filter(platform => !connectedPlatforms.includes(platform as any))

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">Project not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">
            Manage your project details and social media accounts
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="brand">Brand & Content</TabsTrigger>
          <TabsTrigger value="social">Social Accounts</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings2 className="mr-2 h-5 w-5" />
                Project Details
              </CardTitle>
              <CardDescription>
                Basic information about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing Agency">Marketing Agency</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this project..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand & Content Settings */}
        <TabsContent value="brand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Target Audience & Brand Voice
              </CardTitle>
              <CardDescription>
                Define your brand personality and target audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  rows={2}
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="Describe your target audience..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice</Label>
                <Textarea
                  id="brandVoice"
                  rows={2}
                  value={formData.brand_voice}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_voice: e.target.value }))}
                  placeholder="Describe your brand personality and tone..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
                <Textarea
                  id="brandGuidelines"
                  rows={3}
                  value={formData.brand_guidelines}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_guidelines: e.target.value }))}
                  placeholder="Additional brand guidelines and requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Tone</Label>
                  <Select 
                    value={formData.default_tone} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, default_tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="funny">Funny</SelectItem>
                      <SelectItem value="inspiring">Inspiring</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Content Type</Label>
                  <Select 
                    value={formData.default_content_type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, default_content_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="thread">Thread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Accounts */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                Manage your social media accounts for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {socialAccounts.length > 0 ? (
                <div className="space-y-4">
                  {socialAccounts.map((account) => {
                    const Icon = platformIcons[account.platform as keyof typeof platformIcons]
                    const colorClass = platformColors[account.platform as keyof typeof platformColors]
                    
                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium capitalize">{account.platform}</h4>
                              <Badge variant={account.is_connected ? "default" : "secondary"}>
                                {account.is_connected ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Connected
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Not Connected
                                  </>
                                )}
                              </Badge>
                            </div>
                            {account.platform_username && (
                              <p className="text-sm text-muted-foreground">
                                @{account.platform_username}
                              </p>
                            )}
                            {account.followers_count > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {account.followers_count.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!account.is_connected && (
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Connect
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveSocialAccount(account.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No social accounts connected</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add social media accounts to start publishing content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Platform */}
          {unconnectedPlatforms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Platform
                </CardTitle>
                <CardDescription>
                  Connect additional social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unconnectedPlatforms.map((platform) => {
                    const Icon = platformIcons[platform as keyof typeof platformIcons]
                    const colorClass = platformColors[platform as keyof typeof platformColors]
                    
                    return (
                      <Button
                        key={platform}
                        variant="outline"
                        className="h-auto p-4 flex-col space-y-2"
                        onClick={() => handleAddSocialAccount(platform)}
                      >
                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="capitalize text-sm">{platform}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}