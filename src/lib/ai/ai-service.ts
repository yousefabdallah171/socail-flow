'use server'

// Real AI APIs for content generation
// Using Hugging Face API with proper error handling

interface AIGenerationOptions {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok'
  contentType: 'post' | 'story' | 'reel' | 'thread'
  tone: 'professional' | 'casual' | 'funny' | 'inspiring' | 'promotional'
  industry: string
  targetAudience: string
  keywords?: string[]
  maxLength?: number
}

interface AIResponse {
  success: boolean
  content?: string
  hashtags?: string[]
  error?: string
  provider?: string
}

// Pre-made prompts for better AI results
const AI_PROMPTS = {
  professional: {
    post: "Write a professional social media post that provides valuable insights about {keywords} in the {industry} industry. Target audience: {targetAudience}. Keep it informative, credible, and engaging. Include a call-to-action.",
    story: "Create a professional story snippet about {keywords} in {industry}. Make it behind-the-scenes, authentic, and valuable for {targetAudience}.",
    reel: "Write a script for a professional reel about {keywords} in {industry}. Include hook, main points, and call-to-action for {targetAudience}.",
    thread: "Create a professional Twitter thread about {keywords} in {industry}. Start with a hook, provide 3-5 valuable points, and end with engagement question for {targetAudience}."
  },
  casual: {
    post: "Write a casual, friendly social media post about {keywords} in {industry}. Make it relatable and conversational for {targetAudience}. Use a warm, approachable tone.",
    story: "Create a casual story about {keywords} in {industry}. Make it personal, relatable, and authentic for {targetAudience}.",
    reel: "Write a casual reel script about {keywords} in {industry}. Make it fun, relatable, and engaging for {targetAudience}.",
    thread: "Create a casual Twitter thread about {keywords} in {industry}. Make it conversational and engaging for {targetAudience}."
  },
  funny: {
    post: "Write a humorous social media post about {keywords} in {industry}. Use appropriate humor, maybe a relatable situation or gentle joke that {targetAudience} would appreciate.",
    story: "Create a funny story about {keywords} in {industry}. Use humor that {targetAudience} would relate to and enjoy.",
    reel: "Write a funny reel script about {keywords} in {industry}. Make it entertaining and shareable for {targetAudience}.",
    thread: "Create a humorous Twitter thread about {keywords} in {industry}. Use wit and relatable humor for {targetAudience}."
  },
  inspiring: {
    post: "Write an inspiring social media post about {keywords} in {industry}. Motivate and uplift {targetAudience} with a positive message and actionable insight.",
    story: "Create an inspiring story about {keywords} in {industry}. Share motivation and encouragement for {targetAudience}.",
    reel: "Write an inspirational reel script about {keywords} in {industry}. Make it motivational and empowering for {targetAudience}.",
    thread: "Create an inspiring Twitter thread about {keywords} in {industry}. Share motivation and practical wisdom for {targetAudience}."
  },
  promotional: {
    post: "Write a promotional social media post about {keywords} in {industry}. Highlight benefits and value for {targetAudience} without being too salesy.",
    story: "Create a promotional story about {keywords} in {industry}. Showcase value and benefits for {targetAudience}.",
    reel: "Write a promotional reel script about {keywords} in {industry}. Highlight key benefits and include a clear call-to-action for {targetAudience}.",
    thread: "Create a promotional Twitter thread about {keywords} in {industry}. Build value first, then present the offer to {targetAudience}."
  }
}

// SIMPLE Hugging Face API configuration - ONE fast model only
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY

// Use only ONE fast model for now
const SIMPLE_MODEL = {
  url: 'https://api-inference.huggingface.co/models/gpt2',
  name: 'GPT-2',
  timeout: 20000 // 20 seconds max
}

// Generate hashtags based on content and options
function generateHashtags(options: AIGenerationOptions): string[] {
  const platformTags = {
    instagram: ['#instagram', '#insta', '#reels'],
    facebook: ['#facebook', '#social', '#community'],
    twitter: ['#twitter', '#tweet', '#engagement'],
    linkedin: ['#linkedin', '#professional', '#networking'],
    tiktok: ['#tiktok', '#fyp', '#viral', '#trending']
  }

  const baseTags = [
    `#${options.industry.replace(/\s+/g, '').toLowerCase()}`,
    '#socialmedia',
    '#content',
    '#marketing'
  ]

  const keywordTags = options.keywords?.map(keyword => 
    `#${keyword.replace(/\s+/g, '').toLowerCase()}`
  ) || []

  const toneTags = {
    professional: ['#business', '#growth', '#success', '#leadership'],
    casual: ['#lifestyle', '#daily', '#community', '#authentic'],
    funny: ['#humor', '#entertainment', '#relatable', '#fun'],
    inspiring: ['#motivation', '#inspiration', '#mindset', '#goals'],
    promotional: ['#offer', '#exclusive', '#limited', '#special']
  }

  return [
    ...baseTags,
    ...keywordTags.slice(0, 3),
    ...platformTags[options.platform] || [],
    ...toneTags[options.tone]
  ].slice(0, 12)
}

// Create optimized prompt
function createPrompt(options: AIGenerationOptions): string {
  const promptTemplate = AI_PROMPTS[options.tone][options.contentType]
  
  return promptTemplate
    .replace('{keywords}', options.keywords?.join(', ') || options.industry)
    .replace('{industry}', options.industry)
    .replace('{targetAudience}', options.targetAudience)
}


// SUPER SIMPLE function - just try GPT-2 once
async function simpleGeneration(prompt: string, options: AIGenerationOptions): Promise<AIResponse> {
  console.log(`🔄 Trying ${SIMPLE_MODEL.name}...`)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log(`⏰ Timeout after ${SIMPLE_MODEL.timeout}ms`)
    }, SIMPLE_MODEL.timeout)
    
    const response = await fetch(SIMPLE_MODEL.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          do_sample: true
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}`)
      return {
        success: false,
        error: `API error: ${response.status}. Try again in a few seconds.`,
        provider: 'error'
      }
    }

    const data = await response.json()
    
    if (data.error) {
      console.log(`❌ API error:`, data.error)
      return {
        success: false,
        error: `Model error: ${data.error}. Try again.`,
        provider: 'error'
      }
    }

    // Simple text extraction
    let content = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text
    } else if (data.generated_text) {
      content = data.generated_text
    }

    // Clean up content
    if (content.includes(prompt)) {
      content = content.replace(prompt, '').trim()
    }

    if (!content || content.length < 10) {
      return {
        success: false,
        error: 'Generated content too short. Try a different prompt.',
        provider: 'short_content'
      }
    }

    console.log(`✅ Success! Generated ${content.length} characters`)

    return {
      success: true,
      content: content,
      hashtags: generateHashtags(options),
      provider: SIMPLE_MODEL.name
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`⏰ Request timeout`)
      return {
        success: false,
        error: 'Request took too long. Try a shorter prompt.',
        provider: 'timeout'
      }
    }
    
    console.log(`❌ Error:`, error.message)
    return {
      success: false,
      error: 'Network error. Check your internet connection.',
      provider: 'network_error'
    }
  }
}

// REMOVED complex helper functions for simplicity

// SIMPLE AI content generation function
export async function generateAIContent(
  userPrompt: string,
  options: AIGenerationOptions
): Promise<AIResponse> {
  console.log('🎯 Starting SIMPLE AI generation')

  // Check API key
  if (!HUGGINGFACE_API_KEY) {
    return {
      success: false,
      error: 'API key missing. Check your .env file.',
      provider: 'no_key'
    }
  }

  // Check input
  if (!userPrompt.trim()) {
    return {
      success: false,
      error: 'Please enter a prompt.',
      provider: 'no_prompt'
    }
  }

  try {
    // SUPER SIMPLE prompt
    const simplePrompt = `Write a social media post about: ${userPrompt}`
    
    console.log('📝 Using simple prompt:', simplePrompt)
    
    // Call our simple function
    const result = await simpleGeneration(simplePrompt, options)
    
    return result

  } catch (error) {
    console.error('❌ Error:', error)
    
    return {
      success: false,
      error: 'Something went wrong. Try again.',
      provider: 'error'
    }
  }
}

// Content optimization for different platforms
export async function optimizeContentForPlatform(content: string, platform: string): Promise<string> {
  const platformLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
    linkedin: 1300,
    tiktok: 150
  }

  const limit = platformLimits[platform as keyof typeof platformLimits] || 500

  if (content.length <= limit) {
    return content
  }

  // Intelligently truncate at sentence or word boundary
  const truncated = content.substring(0, limit - 3)
  const lastSentence = truncated.lastIndexOf('.')
  const lastSpace = truncated.lastIndexOf(' ')
  
  const cutPoint = lastSentence > limit - 50 ? lastSentence + 1 : 
                   lastSpace > limit - 20 ? lastSpace : 
                   limit - 3

  return content.substring(0, cutPoint) + '...'
}

// Content ideas generator with enhanced AI integration
export async function generateContentIdeas(
  industry: string,
  targetAudience: string,
  count: number = 5
): Promise<string[]> {
  
  console.log(`💡 Generating ${count} content ideas for ${industry} targeting ${targetAudience}`)
  
  if (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY === 'hf_demo') {
    console.warn('⚠️ No API key configured, using fallback ideas')
    return generateFallbackIdeas(industry, targetAudience, count)
  }

  try {
    const prompt = `List ${count} engaging social media content ideas for ${industry} businesses targeting ${targetAudience}:

1.`

    const result = await simpleGeneration(prompt, {
      platform: 'instagram',
      contentType: 'post',
      tone: 'professional',
      industry,
      targetAudience,
      maxLength: 400
    })

    if (result.success && result.content) {
      // Parse the AI response into individual ideas
      const ideas = parseContentIdeas(result.content, count)
      
      if (ideas.length >= Math.min(count, 3)) {
        console.log(`✅ Generated ${ideas.length} AI ideas`)
        return ideas
      }
    }

    console.log('⚠️ AI generation failed, using fallback ideas')
    
  } catch (error) {
    console.error('❌ Content ideas generation failed:', error)
  }

  // Fallback to structured ideas
  return generateFallbackIdeas(industry, targetAudience, count)
}

// Parse AI-generated ideas from response
function parseContentIdeas(content: string, count: number): string[] {
  const ideas: string[] = []
  
  // Split by lines and clean up
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  for (const line of lines) {
    // Remove numbering and clean up
    let idea = line
      .replace(/^\d+[\.\)]\s*/, '') // Remove "1. " or "1) "
      .replace(/^[-\*]\s*/, '') // Remove "- " or "* "
      .trim()
    
    // Skip very short ideas
    if (idea.length < 15) continue
    
    // Capitalize first letter
    if (idea.length > 0) {
      idea = idea.charAt(0).toUpperCase() + idea.slice(1)
    }
    
    ideas.push(idea)
    
    if (ideas.length >= count) break
  }
  
  return ideas
}

// Generate fallback ideas when AI fails
function generateFallbackIdeas(industry: string, targetAudience: string, count: number): string[] {
  const ideaTemplates = [
    `Share behind-the-scenes insights from your ${industry} business`,
    `Top ${industry} trends that ${targetAudience} should know about`,
    `Common challenges ${targetAudience} face in ${industry} and how to solve them`,
    `Success tips for ${targetAudience} working in ${industry}`,
    `Future predictions and innovations coming to ${industry}`,
    `Day in the life of ${targetAudience} in ${industry}`,
    `Myths and misconceptions about ${industry} debunked`,
    `Essential tools and resources for ${targetAudience} in ${industry}`,
    `How ${industry} has evolved and what's next`,
    `Q&A session: Answering ${targetAudience}'s most common questions about ${industry}`
  ]
  
  return ideaTemplates.slice(0, count)
}