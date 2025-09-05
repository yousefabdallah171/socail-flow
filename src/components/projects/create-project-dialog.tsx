"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Target, 
  Sparkles, 
  Rocket,
  Building2,
  Users,
  Tag,
  MessageSquare,
  FileText,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

import { createProject, getIndustries, type CreateProjectData } from '@/lib/projects/project-actions'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  industry: z.string().min(1, 'Industry is required'),
  target_audience: z.string().min(1, 'Target audience is required').max(200, 'Target audience too long'),
  default_tone: z.enum(['professional', 'casual', 'funny', 'inspiring', 'promotional']),
  default_content_type: z.enum(['post', 'story', 'reel', 'thread']),
  keywords: z.string().optional(),
  brand_voice: z.string().max(1000, 'Brand voice too long').optional(),
  content_guidelines: z.string().max(1000, 'Content guidelines too long').optional(),
  hashtag_strategy: z.string().max(500, 'Hashtag strategy too long').optional(),
  website_url: z.string().url('Invalid URL').or(z.literal('')).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget_allocated: z.number().min(0, 'Budget must be positive').optional()
})

type CreateProjectForm = z.infer<typeof createProjectSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  onProjectCreated: () => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  organizationId,
  onProjectCreated
}: CreateProjectDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [industries, setIndustries] = useState<any[]>([])
  const totalSteps = 4

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      target_audience: '',
      default_tone: 'professional',
      default_content_type: 'post',
      keywords: '',
      brand_voice: '',
      content_guidelines: '',
      hashtag_strategy: '',
      website_url: '',
      priority: 'medium'
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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      form.reset()
    }
  }, [open, form])

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate as any)
    return isValid
  }

  const getFieldsForStep = (step: number): (keyof CreateProjectForm)[] => {
    switch (step) {
      case 1: return ['name', 'description', 'industry']
      case 2: return ['target_audience', 'default_tone', 'default_content_type']
      case 3: return ['keywords', 'brand_voice', 'content_guidelines']
      case 4: return ['website_url', 'priority', 'start_date', 'end_date', 'budget_allocated']
      default: return []
    }
  }

  const onSubmit = async (data: CreateProjectForm) => {
    if (!organizationId) {
      toast.error('No organization selected')
      return
    }

    setIsLoading(true)
    try {
      // Convert keywords string to array
      const keywordsArray = data.keywords 
        ? data.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : []

      const projectData: CreateProjectData = {
        name: data.name,
        description: data.description || '',
        industry: data.industry,
        target_audience: data.target_audience,
        default_tone: data.default_tone,
        default_content_type: data.default_content_type,
        keywords: keywordsArray,
        brand_voice: data.brand_voice || '',
        content_guidelines: data.content_guidelines || '',
        hashtag_strategy: data.hashtag_strategy || '',
        website_url: data.website_url || '',
        priority: data.priority || 'medium',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        budget_allocated: data.budget_allocated
      }

      const result = await createProject(organizationId, projectData)
      
      if (result.error) {
        toast.error(`Failed to create project: ${result.error}`)
        return
      }

      toast.success('Project created successfully!')
      onProjectCreated()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return Building2
      case 2: return Users
      case 3: return Sparkles
      case 4: return Rocket
      default: return Target
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Project Basics'
      case 2: return 'Target & AI Settings'
      case 3: return 'Content Strategy'
      case 4: return 'Campaign Details'
      default: return 'Step'
    }
  }

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Set up the basic information for your project'
      case 2: return 'Define your audience and AI content preferences'
      case 3: return 'Configure content guidelines and brand voice'
      case 4: return 'Add campaign timeline and budget information'
      default: return ''
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Project Basics</h3>
              <p className="text-muted-foreground">
                Let's start with the fundamental information about your project
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Nike Summer Campaign 2024"
                        className="text-lg"
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a clear, descriptive name for your project
                    </FormDescription>
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
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.name} value={industry.name}>
                            <div className="flex items-center space-x-2">
                              <span>{industry.icon}</span>
                              <div>
                                <div className="font-medium">{industry.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {industry.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Brief description of this project's goals and objectives..."
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Help your team understand what this project is about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Target Audience & AI Settings</h3>
              <p className="text-muted-foreground">
                Define who you're targeting and set AI content preferences
              </p>
            </div>

            <div className="space-y-4">
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
                      Be specific about demographics, interests, and behaviors
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="default_tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">👔 Professional</SelectItem>
                          <SelectItem value="casual">😊 Casual & Friendly</SelectItem>
                          <SelectItem value="funny">😄 Funny & Humorous</SelectItem>
                          <SelectItem value="inspiring">✨ Inspiring</SelectItem>
                          <SelectItem value="promotional">🎯 Promotional</SelectItem>
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
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="post">📝 Social Media Posts</SelectItem>
                          <SelectItem value="story">📱 Story Content</SelectItem>
                          <SelectItem value="reel">🎥 Reels/Videos</SelectItem>
                          <SelectItem value="thread">🧵 Twitter Threads</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">AI Content Generation</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        These settings will be automatically used when creating new content for this project, 
                        helping you maintain consistency across all your social media posts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <MessageSquare className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Content Strategy</h3>
              <p className="text-muted-foreground">
                Define your brand voice and content guidelines
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Keywords</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="sustainable fashion, eco-friendly, trendy, affordable"
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated keywords that represent this project (helps with AI generation and hashtags)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand_voice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Voice & Personality</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the brand's personality, communication style, and values. E.g., 'Modern, eco-conscious, and approachable. Uses inclusive language and emphasizes sustainability...'"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Help AI understand how this brand should communicate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content_guidelines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Guidelines</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Any specific rules, restrictions, or requirements. E.g., 'Always include accessibility descriptions, avoid political topics, maintain positive tone...'"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Specific guidelines for content creation
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
                        placeholder="Hashtag preferences and limits. E.g., 'Always include #SustainableFashion, limit to 10 hashtags, avoid trending hashtags unrelated to brand...'"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Rocket className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Campaign Details</h3>
              <p className="text-muted-foreground">
                Add timeline, budget, and other campaign information
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Website</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          {...field}
                          type="url"
                          placeholder="https://example.com"
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Main website or landing page for this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                        <SelectItem value="high">🟠 High Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      Total budget for this project (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Project</span>
          </DialogTitle>
          <DialogDescription>
            Set up a new project with AI-powered content generation settings
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between py-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1
            const StepIcon = getStepIcon(stepNum)
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep
            
            return (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                  ${isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'border-primary text-primary' 
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                {stepNum < totalSteps && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Content */}
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}