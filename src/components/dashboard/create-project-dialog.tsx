"use client"

import { useState } from 'react'
import { Plus, Check, FolderPlus, Sparkles, Target, Palette, Hash, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, TrendingUp } from 'lucide-react'
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

interface CreateProjectDialogProps {
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

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { createProject } = useProjects()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    industry: '',
    
    // Brand Details
    target_audience: '',
    brand_voice: '',
    keywords: '',
    
    // AI Settings
    default_tone: 'professional' as const,
    default_content_type: 'post' as const,
    
    // Social Platforms
    selectedPlatforms: [] as string[]
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      target_audience: '',
      brand_voice: '',
      keywords: '',
      default_tone: 'professional',
      default_content_type: 'post',
      selectedPlatforms: []
    })
    setCurrentStep(1)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
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
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    if (formData.selectedPlatforms.length === 0) {
      toast.error('Please select at least one social media platform')
      return
    }

    setIsCreating(true)
    
    try {
      const projectData = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name.trim()),
        description: formData.description.trim() || undefined,
        industry: formData.industry || undefined,
        target_audience: formData.target_audience.trim() || undefined,
        brand_voice: formData.brand_voice.trim() || undefined,
        default_tone: formData.default_tone,
        default_content_type: formData.default_content_type,
        keywords: formData.keywords.trim().split(',').map(k => k.trim()).filter(k => k) || undefined,
        social_platforms: formData.selectedPlatforms
      }

      await createProject(projectData)
      
      toast.success(`Project "${formData.name}" created successfully!`)
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
    setFormData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(id => id !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }))
  }

  const stepTitles = {
    1: 'Project Details',
    2: 'Brand & Audience',
    3: 'Social Platforms'
  }

  const stepDescriptions = {
    1: 'Basic information about your project',
    2: 'Define your brand voice and target audience',
    3: 'Choose social media platforms to connect'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderPlus className="mr-2 h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a new project to manage your social media campaigns
          </DialogDescription>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
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
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Nike Summer Campaign, Tesla Launch"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  This will be the main identifier for your project
                </p>
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
          )}

          {/* Step 2: Brand & Audience */}
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
                <Label htmlFor="keywords" className="flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Keywords & Topics
                </Label>
                <Input
                  id="keywords"
                  placeholder="e.g., sustainability, innovation, technology, eco-friendly"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Separate keywords with commas
                </p>
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

          {/* Step 3: Social Platforms */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Globe className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-medium">Choose Your Platforms</h3>
                <p className="text-sm text-muted-foreground">
                  Select the social media platforms you want to manage for this project
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  const isSelected = formData.selectedPlatforms.includes(platform.id)
                  
                  return (
                    <Card 
                      key={platform.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handlePlatformToggle(platform.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full ${platform.color} flex items-center justify-center mx-auto mb-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-medium">{platform.name}</h4>
                        {isSelected && (
                          <Badge className="mt-2" variant="secondary">
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {formData.selectedPlatforms.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium">Selected Platforms</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedPlatforms.map((platformId) => {
                      const platform = platforms.find(p => p.id === platformId)
                      return platform ? (
                        <Badge key={platformId} variant="secondary">
                          {platform.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can connect these accounts later in project settings
                  </p>
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
            {currentStep < 3 ? (
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