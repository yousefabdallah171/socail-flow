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
  Globe
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
import { generateAIContent, generateContentIdeas } from '@/lib/ai/ai-service'
import { createContent } from '@/lib/content/content-actions'
import { toast } from 'sonner'

interface ContentCreatorProps {
  onContentCreated: () => void
}


export function ContentCreator({ onContentCreated }: ContentCreatorProps) {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    prompt: '',
    industry: '',
    targetAudience: '',
    keywords: '',
    tone: 'professional',
    contentType: 'post',
    platform: 'facebook'
  })
  
  // Generated Content
  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    content: '',
    hashtags: [] as string[],
    platforms: ['facebook']
  })
  
  
  // UI Options
  const toneOptions = [
    { value: 'professional', label: '👔 Professional' },
    { value: 'casual', label: '😊 Casual & Friendly' },
    { value: 'funny', label: '😄 Funny & Humorous' },
    { value: 'inspiring', label: '✨ Inspiring & Motivational' },
    { value: 'promotional', label: '🎯 Promotional' },
  ]

  const contentTypeOptions = [
    { value: 'post', label: '📝 Social Post' },
    { value: 'story', label: '📱 Story' },
    { value: 'reel', label: '🎬 Reel/Video' },
    { value: 'thread', label: '🧵 Thread' },
  ]

  const platformOptions = [
    { value: 'facebook', label: '📘 Facebook' },
    { value: 'instagram', label: '📷 Instagram' },
    { value: 'twitter', label: '🐦 Twitter/X' },
    { value: 'linkedin', label: '💼 LinkedIn' },
    { value: 'tiktok', label: '🎵 TikTok' },
  ]

  // Enhanced prompt creation function
  const createEnhancedPrompt = (userPrompt: string, options: {
    contentType: string,
    tone: string,
    platform: string,
    industry: string,
    targetAudience: string,
    keywords?: string
  }) => {
    // Platform-specific instructions
    const platformInstructions = {
      facebook: "Create engaging Facebook content that encourages likes, comments, and shares. Use a conversational tone and include a call-to-action.",
      instagram: "Write Instagram-optimized content that's visually appealing and hashtag-friendly. Keep it engaging and story-driven.",
      twitter: "Create Twitter/X content that's concise, engaging, and shareable. Keep under 280 characters with trending hashtags.",
      linkedin: "Write professional LinkedIn content that provides value to professionals. Focus on insights, tips, or industry knowledge.",
      tiktok: "Create TikTok content that's trendy, entertaining, and scroll-stopping. Use current trends and engaging hooks."
    }

    // Content type instructions
    const contentTypeInstructions = {
      post: "Write a complete social media post",
      story: "Create a story-format content that's personal and engaging",
      reel: "Write a reel/video script with a hook, content, and call-to-action",
      thread: "Create a thread-style content with multiple connected points"
    }

    // Tone instructions
    const toneInstructions = {
      professional: "Use a professional, authoritative tone that builds trust and credibility",
      casual: "Use a casual, friendly tone that feels approachable and relatable",
      funny: "Use humor and wit to make the content entertaining and shareable",
      inspiring: "Use an inspiring, motivational tone that uplifts and encourages action",
      promotional: "Use a persuasive tone that highlights benefits while staying authentic"
    }

    // Build enhanced prompt with stronger instructions
    const enhancedPrompt = `
SOCIAL MEDIA CONTENT CREATION TASK:

Platform: ${options.platform.toUpperCase()}
Content Type: ${options.contentType}
Tone: ${options.tone}
Industry: ${options.industry}
Target Audience: ${options.targetAudience}
${options.keywords ? `Keywords to include: ${options.keywords}` : ''}

PLATFORM REQUIREMENTS:
${platformInstructions[options.platform as keyof typeof platformInstructions]}

CONTENT TYPE:
${contentTypeInstructions[options.contentType as keyof typeof contentTypeInstructions]}

TONE REQUIREMENTS:
${toneInstructions[options.tone as keyof typeof toneInstructions]}

USER REQUEST:
"${userPrompt}"

MANDATORY CONTENT STRUCTURE REQUIREMENTS:
You MUST create a complete, professional social media post that includes ALL of the following elements:

1. POWERFUL HOOK (First Line):
   - Start with an attention-grabbing opening that stops scrolling
   - Use curiosity, surprise, or bold statements
   - Examples: "This changed everything...", "Most people don't know...", "Here's what nobody tells you..."

2. MAIN CONTENT:
   - Expand on the user's request with valuable, specific information
   - Include 3-5 key points or benefits
   - Use storytelling techniques when appropriate
   - Add credibility with facts, statistics, or examples

3. STRONG CALL-TO-ACTION (CTA):
   - End with a compelling action for users to take
   - Be specific and actionable
   - Examples: "Share this with someone who needs to see it", "Comment your experience below", "Save this for later", "Try this today and let us know how it goes"

4. RELEVANT HASHTAGS:
   - Include 5-10 strategic hashtags
   - Mix popular and niche hashtags
   - Include industry-specific tags
   - Add trending hashtags when relevant

5. VISUAL CONTENT SUGGESTIONS:
   At the end, provide specific suggestions for images/graphics that would complement this post:
   - Describe the ideal image composition
   - Suggest colors, style, and visual elements
   - Recommend design type (photo, graphic, carousel, video thumbnail)

INSTRUCTIONS:
- Even if the user gives a simple prompt like "talk about our product", create a comprehensive, engaging post
- Make it scroll-stopping and shareable
- Focus on value and engagement
- Be creative and think like a social media marketing expert
- Target specifically ${options.targetAudience} in ${options.industry}
- Optimize for ${options.platform} best practices
- Use ${options.tone} tone throughout but make it compelling

FORMAT YOUR RESPONSE AS:
[MAIN POST CONTENT]

---
HASHTAGS: [hashtags here]

---
VISUAL SUGGESTIONS: [specific design recommendations]

Generate the complete content now:
`.trim()

    return enhancedPrompt
  }


  const [loadingStage, setLoadingStage] = useState<string>('')

  const handleGenerateContent = async () => {
    if (!aiForm.prompt.trim()) {
      toast.error('Please enter a content prompt')
      return
    }

    if (!aiForm.industry.trim()) {
      toast.error('Please enter your industry')
      return
    }

    if (!aiForm.targetAudience.trim()) {
      toast.error('Please enter your target audience')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setLoadingStage('Initializing AI generation...')
    
    try {
      console.log('🚀 Starting AI content generation...')
      
      setLoadingStage('Creating simple prompt...')
      
      // SIMPLE prompt - no complex instructions
      const simplePrompt = aiForm.prompt
      
      console.log('📝 Using simple prompt:', simplePrompt)
      
      setLoadingStage('Connecting to AI models...')
      
      // Simple timeout for generation (30 seconds total)
      const generationTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout. Try a shorter prompt.'))
        }, 30000)
      })

      const generationPromise = generateAIContent(simplePrompt, {
        platform: aiForm.platform as any,
        contentType: aiForm.contentType as any,
        tone: aiForm.tone as any,
        industry: aiForm.industry,
        targetAudience: aiForm.targetAudience,
        keywords: aiForm.keywords ? aiForm.keywords.split(',').map(k => k.trim()) : undefined,
        maxLength: 200
      })

      // Update loading stage periodically
      const stageUpdater = setInterval(() => {
        setLoadingStage(prev => {
          if (prev.includes('Trying model')) return prev
          const stages = [
            'Analyzing your requirements...',
            'Processing with AI models...',
            'Generating content...',
            'Optimizing for platform...',
            'Almost ready...'
          ]
          const currentIndex = stages.findIndex(s => s === prev)
          const nextIndex = (currentIndex + 1) % stages.length
          return stages[nextIndex]
        })
      }, 3000)

      const result = await Promise.race([generationPromise, generationTimeout])
      
      clearInterval(stageUpdater)
      setLoadingStage('Finalizing content...')

      if (result.success && result.content) {
        setGeneratedContent({
          title: `${aiForm.tone} ${aiForm.contentType} for ${aiForm.industry}`,
          content: result.content,
          hashtags: result.hashtags || [],
          platforms: [aiForm.platform]
        })
        
        setStep(2)
        toast.success(`Content generated successfully with ${result.provider}! 🎉`, {
          description: 'Review and edit your content before saving.',
          duration: 4000
        })
      } else {
        const errorMsg = result.error || 'Failed to generate content'
        setGenerationError(errorMsg)
        toast.error('Content generation failed', {
          description: errorMsg,
          duration: 6000
        })
      }
    } catch (error: any) {
      const errorMessage = error.message?.includes('timeout') 
        ? 'Generation took too long. Please try with a shorter, simpler prompt.'
        : error.message || 'Failed to generate content. Please try again.'
      
      setGenerationError(errorMessage)
      toast.error('Generation Error', {
        description: errorMessage,
        duration: 6000
      })
      console.error('Content generation error:', error)
    } finally {
      setIsGenerating(false)
      setLoadingStage('')
    }
  }

  const handleSaveContent = async () => {
    if (!generatedContent.content.trim()) {
      toast.error('Content cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      // Create categories based on content type and tone
      const category = `${aiForm.tone}-${aiForm.contentType}`
      
      console.log('🔄 Saving content to database...', {
        title: generatedContent.title,
        category: category,
        platforms: generatedContent.platforms
      })
      
      await createContent({
        title: generatedContent.title,
        content: generatedContent.content,
        hashtags: generatedContent.hashtags.join(' '),
        platforms: generatedContent.platforms,
        status: 'draft',
        category: category,
        tone: aiForm.tone,
        contentType: aiForm.contentType,
        industry: aiForm.industry,
        targetAudience: aiForm.targetAudience,
        ai_generated: true,
        ai_provider: 'huggingface'
      })
      
      console.log('✅ Content saved successfully!')
      toast.success('Content saved to your library! 🎉', {
        description: 'You can find it in the Content Management page.',
        duration: 5000
      })
      
      // Close dialog and refresh content list
      onContentCreated()
    } catch (error: any) {
      console.error('❌ Failed to save content:', error)
      toast.error(error.message || 'Failed to save content')
    }
    setIsSaving(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (step === 1) {
    return (
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">AI Content Generator</h2>
          </div>
          <p className="text-muted-foreground">
            Create engaging social media content with AI in seconds
          </p>
        </div>

        {/* Main Form */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Send className="h-5 w-5 text-primary" />
              Content Details
            </CardTitle>
            <CardDescription className="text-base">
              Tell us about your content requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Custom Prompt */}
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-base font-medium flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                What would you like to create? *
              </Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Write about the benefits of remote work for small businesses, create a post about our new product launch, share tips for productivity..."
                className="min-h-[120px] text-base resize-none"
                value={aiForm.prompt}
                onChange={(e) => setAiForm({ ...aiForm, prompt: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Be specific about what you want to create for better AI results
              </p>
            </div>

            {/* Industry & Audience - Better spacing */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="industry" className="text-base font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Industry *
                </Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Healthcare, Marketing, E-commerce"
                  value={aiForm.industry}
                  onChange={(e) => setAiForm({ ...aiForm, industry: e.target.value })}
                  className="text-base h-11"
                />
                <p className="text-sm text-muted-foreground">
                  What industry or field is this content for?
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="targetAudience" className="text-base font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  Target Audience *
                </Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Small business owners, Millennials, Tech professionals"
                  value={aiForm.targetAudience}
                  onChange={(e) => setAiForm({ ...aiForm, targetAudience: e.target.value })}
                  className="text-base h-11"
                />
                <p className="text-sm text-muted-foreground">
                  Who is your target audience?
                </p>
              </div>
            </div>

            {/* Keywords - Better spacing */}
            <div className="space-y-3">
              <Label htmlFor="keywords" className="text-base font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-500" />
                Keywords (optional)
              </Label>
              <Input
                id="keywords"
                placeholder="e.g., productivity, remote work, efficiency, growth"
                value={aiForm.keywords}
                onChange={(e) => setAiForm({ ...aiForm, keywords: e.target.value })}
                className="text-base h-11"
              />
              <p className="text-sm text-muted-foreground">
                Separate keywords with commas to focus your content
              </p>
            </div>

            {/* Settings - Better layout and spacing */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-base font-medium">Tone</Label>
                <Select value={aiForm.tone} onValueChange={(value) => setAiForm({ ...aiForm, tone: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the voice and style
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Content Type</Label>
                <Select value={aiForm.contentType} onValueChange={(value) => setAiForm({ ...aiForm, contentType: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Type of content to create
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Primary Platform</Label>
                <Select value={aiForm.platform} onValueChange={(value) => setAiForm({ ...aiForm, platform: value })}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Platform to optimize for
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Error Display */}
        {generationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {generationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Generate Button with Enhanced Loading States */}
        <div className="flex justify-center pt-4">
          <div className="text-center space-y-3">
            {isGenerating && loadingStage && (
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingStage}
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleGenerateContent}
              disabled={isGenerating || !aiForm.prompt.trim() || !aiForm.industry.trim() || !aiForm.targetAudience.trim()}
              size="lg"
              className="px-12 py-3 text-lg h-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-6 w-6" />
                  Generate Content with AI
                </>
              )}
            </Button>
            
            {isGenerating && (
              <p className="text-xs text-muted-foreground max-w-md">
                This should take 10-20 seconds. Using simple GPT-2 model.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Review Generated Content
  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Your Content</h2>
          <p className="text-muted-foreground">
            Edit your AI-generated content before saving
          </p>
        </div>
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit
        </Button>
      </div>

      {/* Generated Content */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Content
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-medium">Content Title</Label>
            <Input
              id="title"
              value={generatedContent.title}
              onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
              className="text-base h-11"
            />
            <p className="text-sm text-muted-foreground">
              Give your content a descriptive title
            </p>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-base font-medium">Generated Content</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedContent.content)}
                className="h-8"
              >
                <Copy className="mr-1 h-3 w-3" />
                Copy Content
              </Button>
            </div>
            <Textarea
              id="content"
              value={generatedContent.content}
              onChange={(e) => setGeneratedContent({ ...generatedContent, content: e.target.value })}
              className="min-h-[250px] text-base resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Edit the content as needed before saving
            </p>
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Generated Hashtags</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedContent.hashtags.join(' '))}
                className="h-8"
              >
                <Copy className="mr-1 h-3 w-3" />
                Copy Hashtags
              </Button>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {generatedContent.hashtags.map((hashtag, index) => (
                  <Badge key={index} variant="outline" className="text-sm px-2 py-1">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Hashtags optimized for your chosen platform
            </p>
          </div>

          {/* Platform Info */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Target Platform</Label>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Badge variant="secondary" className="text-base px-3 py-2">
                {platformOptions.find(p => p.value === aiForm.platform)?.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Content optimized for this platform's requirements
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Made more prominent */}
      <div className="border-t pt-8 mt-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            size="lg"
            className="px-8 py-4 text-base h-auto border-2 hover:border-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Generate New Content
          </Button>
          <Button 
            onClick={handleSaveContent}
            disabled={isSaving || !generatedContent.content.trim()}
            size="lg"
            className="px-16 py-4 text-xl h-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                Saving Content...
              </>
            ) : (
              <>
                <CheckCircle className="mr-3 h-7 w-7" />
                💾 Save Content to Library
              </>
            )}
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Click "Save Content to Library" to add this content to your content management page
        </p>
      </div>
    </div>
  )
}