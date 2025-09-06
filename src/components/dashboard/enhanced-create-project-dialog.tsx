"use client"

import { useState } from 'react'
import { Plus, Check, FolderPlus, Sparkles, Target, Palette, Hash, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, TrendingUp, Eye, EyeOff, User, Lock, Calendar, DollarSign, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useProjects } from './project-provider'

interface EnhancedCreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const industries = [
  'Marketing Agency',
  'E-commerce',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Food & Beverage',
  'Fashion & Beauty',
  'Real Estate',
  'Travel & Tourism',
  'Sports & Fitness',
  'Entertainment',
  'Non-profit',
  'Consulting',
  'Manufacturing',
  'Other'
]

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-500' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500' },
  { id: 'tiktok', name: 'TikTok', icon: TrendingUp, color: 'bg-black' },
]

export function EnhancedCreateProjectDialog({ open, onOpenChange }: EnhancedCreateProjectDialogProps) {
  const { createProject } = useProjects()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    industry: '',
    website_url: '',
    
    // Brand Details
    target_audience: '',
    brand_voice: '',
    brand_guidelines: '',
    keywords: '',
    hashtag_strategy: '',
    
    // AI Settings
    default_tone: 'professional' as const,
    default_content_type: 'post' as const,
    
    // Project Management
    status: 'active' as const,
    priority: 'medium' as const,
    start_date: '',
    end_date: '',
    budget_allocated: '',
    
    // Social Platforms with credentials
    selectedPlatforms: [] as Array<{
      platform: string
      account_name: string
      username: string
      password: string
    }>
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      website_url: '',
      target_audience: '',
      brand_voice: '',
      brand_guidelines: '',
      keywords: '',
      hashtag_strategy: '',
      default_tone: 'professional',
      default_content_type: 'post',
      status: 'active',
      priority: 'medium',
      start_date: '',
      end_date: '',
      budget_allocated: '',
      selectedPlatforms: []
    })
    setCurrentStep(1)
    setShowPasswords({})
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Please enter a project name')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(4)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    if (formData.selectedPlatforms.length === 0) {
      toast.error('Please add at least one social media platform')
      return
    }

    setIsCreating(true)
    
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        industry: formData.industry || undefined,
        website_url: formData.website_url.trim() || undefined,
        target_audience: formData.target_audience.trim() || undefined,
        brand_voice: formData.brand_voice.trim() || undefined,
        brand_guidelines: formData.brand_guidelines.trim() || undefined,
        default_tone: formData.default_tone,
        default_content_type: formData.default_content_type,
        keywords: formData.keywords.trim().split(',').map(k => k.trim()).filter(k => k) || undefined,
        hashtag_strategy: formData.hashtag_strategy.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        budget_allocated: formData.budget_allocated ? parseFloat(formData.budget_allocated) : undefined,
        social_platforms: formData.selectedPlatforms
      }

      await createProject(projectData)
      
      toast.success(`Project "${formData.name}" created successfully with ${formData.selectedPlatforms.length} social accounts!`)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error((error as Error).message || 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePlatformToggle = (platformId: string) => {
    const isSelected = formData.selectedPlatforms.some(p => p.platform === platformId)
    
    if (isSelected) {
      // Remove platform
      setFormData(prev => ({
        ...prev,
        selectedPlatforms: prev.selectedPlatforms.filter(p => p.platform !== platformId)
      }))
    } else {
      // Add platform
      const platform = platforms.find(p => p.id === platformId)
      if (platform) {
        setFormData(prev => ({
          ...prev,
          selectedPlatforms: [...prev.selectedPlatforms, {
            platform: platformId,
            account_name: `${platform.name} Account`,
            username: '',
            password: ''
          }]
        }))
      }
    }
  }

  const updatePlatformCredential = (platformId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.map(p => 
        p.platform === platformId ? { ...p, [field]: value } : p
      )
    }))
  }

  const togglePasswordVisibility = (platformId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }))
  }

  const stepTitles = {
    1: 'Project Details',
    2: 'Brand & Strategy',
    3: 'Project Management',
    4: 'Social Media Setup'
  }

  const stepDescriptions = {
    1: 'Basic information about your project',
    2: 'Define your brand voice and content strategy',
    3: 'Set timeline, budget and project settings',
    4: 'Add social platforms with login credentials'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderPlus className="mr-2 h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a comprehensive project with social media management and credential storage
          </DialogDescription>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center pt-2">
            <h3 className="text-lg font-semibold">{stepTitles[currentStep as keyof typeof stepTitles]}</h3>
            <p className="text-sm text-muted-foreground">{stepDescriptions[currentStep as keyof typeof stepDescriptions]}</p>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Nike Summer Campaign"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Brief description of this project..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 2: Brand & Strategy */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  Target Audience
                </Label>
                <Textarea
                  id="targetAudience"
                  placeholder="e.g., Tech-savvy millennials aged 25-35 interested in sustainable products"
                  rows={2}
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandVoice" className="flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  Brand Voice & Personality
                </Label>
                <Textarea
                  id="brandVoice"
                  placeholder="e.g., Professional yet approachable, innovative, environmentally conscious"
                  rows={2}
                  value={formData.brand_voice}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_voice: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
                <Textarea
                  id="brandGuidelines"
                  placeholder="Specific brand guidelines, do's and don'ts, style preferences..."
                  rows={3}
                  value={formData.brand_guidelines}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_guidelines: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="flex items-center">
                    <Hash className="mr-2 h-4 w-4" />
                    Keywords & Topics
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="sustainability, innovation, technology"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hashtags">Hashtag Strategy</Label>
                  <Input
                    id="hashtags"
                    placeholder="e.g., Always include brand hashtag + trending topics"
                    value={formData.hashtag_strategy}
                    onChange={(e) => setFormData(prev => ({ ...prev, hashtag_strategy: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Tone</Label>
                  <Select value={formData.default_tone} onValueChange={(value: any) => setFormData(prev => ({ ...prev, default_tone: value }))}>
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
                  <Select value={formData.default_content_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, default_content_type: value }))}>
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
            </div>
          )}

          {/* Step 3: Project Management */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Project Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Budget Allocated
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="10000"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_allocated: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 4: Social Media Setup */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Globe className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-medium">Configure Social Media Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Select platforms and add login credentials for secure automation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  const isSelected = formData.selectedPlatforms.some(p => p.platform === platform.id)
                  const platformData = formData.selectedPlatforms.find(p => p.platform === platform.id)
                  
                  return (
                    <Card 
                      key={platform.id}
                      className={`transition-all ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{platform.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handlePlatformToggle(platform.id)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {isSelected ? 'Selected' : 'Add to project'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isSelected && platformData && (
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Account Name</Label>
                            <Input
                              placeholder={`${platform.name} Account`}
                              value={platformData.account_name}
                              onChange={(e) => updatePlatformCredential(platform.id, 'account_name', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              Username/Email
                            </Label>
                            <Input
                              placeholder="username or email"
                              value={platformData.username}
                              onChange={(e) => updatePlatformCredential(platform.id, 'username', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs flex items-center">
                              <Lock className="h-3 w-3 mr-1" />
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                type={showPasswords[platform.id] ? 'text' : 'password'}
                                placeholder="password"
                                value={platformData.password}
                                onChange={(e) => updatePlatformCredential(platform.id, 'password', e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => togglePasswordVisibility(platform.id)}
                              >
                                {showPasswords[platform.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            🔒 Credentials are encrypted and stored securely
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>

              {formData.selectedPlatforms.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">Selected Platforms ({formData.selectedPlatforms.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedPlatforms.map((platform) => {
                      const platformInfo = platforms.find(p => p.id === platform.platform)
                      return platformInfo ? (
                        <Badge key={platform.platform} variant="secondary">
                          {platformInfo.name}
                          {platform.username && ` (${platform.username})`}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          <div>
            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}