// SocialFlow MVP Type Definitions

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: UserRole
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          role?: UserRole
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: UserRole
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          slug: string
          organization_id: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          organization_id: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          organization_id?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          platform: SocialPlatform
          account_name: string
          account_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          project_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: SocialPlatform
          account_name: string
          account_id: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          project_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: SocialPlatform
          account_name?: string
          account_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          project_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          title: string | null
          content: string
          media_urls: string[]
          platforms: SocialPlatform[]
          status: ContentStatus
          scheduled_at: string | null
          published_at: string | null
          project_id: string
          created_by: string
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content: string
          media_urls?: string[]
          platforms?: SocialPlatform[]
          status?: ContentStatus
          scheduled_at?: string | null
          published_at?: string | null
          project_id: string
          created_by: string
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string
          media_urls?: string[]
          platforms?: SocialPlatform[]
          status?: ContentStatus
          scheduled_at?: string | null
          published_at?: string | null
          project_id?: string
          created_by?: string
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content_analytics: {
        Row: {
          id: string
          content_id: string
          platform: SocialPlatform
          platform_post_id: string | null
          impressions: number
          clicks: number
          likes: number
          shares: number
          comments: number
          engagement_rate: number
          synced_at: string
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          platform: SocialPlatform
          platform_post_id?: string | null
          impressions?: number
          clicks?: number
          likes?: number
          shares?: number
          comments?: number
          engagement_rate?: number
          synced_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          platform?: SocialPlatform
          platform_post_id?: string | null
          impressions?: number
          clicks?: number
          likes?: number
          shares?: number
          comments?: number
          engagement_rate?: number
          synced_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Enums
export type UserRole = 'owner' | 'admin' | 'editor' | 'member' | 'viewer'
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest'
export type AutomationType = 'content_creation' | 'posting' | 'analytics' | 'monitoring'

// Utility types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Application specific types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: UserRole
  organization_id: string
  organization?: Organization
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  settings: Json
  projects?: Project[]
  users?: User[]
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  slug: string
  organization_id: string
  settings: Json
  is_active: boolean
  social_accounts?: SocialAccount[]
  content?: Content[]
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  account_name: string
  account_id: string
  access_token: string
  refresh_token?: string
  expires_at?: string
  project_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  title?: string
  content: string
  media_urls: string[]
  platforms: SocialPlatform[]
  status: ContentStatus
  scheduled_at?: string
  published_at?: string
  project_id: string
  created_by: string
  ai_generated: boolean
  analytics?: ContentAnalytics[]
  created_at: string
  updated_at: string
}

export interface ContentAnalytics {
  id: string
  content_id: string
  platform: SocialPlatform
  platform_post_id?: string
  impressions: number
  clicks: number
  likes: number
  shares: number
  comments: number
  engagement_rate: number
  synced_at: string
  created_at: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  organizationName: string
}

export interface CreateProjectForm {
  name: string
  description?: string
}

export interface CreateContentForm {
  title?: string
  content: string
  platforms: SocialPlatform[]
  scheduledAt?: Date
  mediaUrls?: string[]
}

export interface AIGenerateForm {
  prompt: string
  tone: 'professional' | 'casual' | 'friendly' | 'funny' | 'urgent'
  platform: SocialPlatform
  includeHashtags: boolean
  includeEmojis: boolean
}

// AI Service types
export interface AIGenerateRequest {
  prompt: string
  tone: string
  platform: string
  options?: {
    includeHashtags?: boolean
    includeEmojis?: boolean
    maxLength?: number
  }
}

export interface AIGenerateResponse {
  content: string
  hashtags?: string[]
  confidence: number
  tokensUsed: number
}

// Social Media API types
export interface SocialMediaPostRequest {
  content: string
  mediaUrls?: string[]
  platform: SocialPlatform
  accountId: string
  scheduledAt?: string
}

export interface SocialMediaPostResponse {
  success: boolean
  postId?: string
  url?: string
  error?: string
}

// Analytics types
export interface AnalyticsFilter {
  startDate: string
  endDate: string
  platforms?: SocialPlatform[]
  projectIds?: string[]
}

export interface AnalyticsSummary {
  totalPosts: number
  totalImpressions: number
  totalEngagements: number
  avgEngagementRate: number
  topPerformingPost?: Content
  platformBreakdown: {
    platform: SocialPlatform
    posts: number
    impressions: number
    engagements: number
  }[]
}

// Theme types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
}

export interface OrganizationSettings {
  branding: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
  }
  features: {
    aiGeneration: boolean
    advancedAnalytics: boolean
    teamCollaboration: boolean
  }
  limits: {
    monthlyPosts: number
    socialAccounts: number
    teamMembers: number
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string
  children?: NavItem[]
}

// Component prop types
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

export interface CardProps {
  className?: string
  children: React.ReactNode
}

// Hook types
export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  removeValue: () => void
}

export interface UseDebounceReturn<T> {
  debouncedValue: T
  isDebouncing: boolean
}

// State management types (Zustand)
export interface AuthState {
  user: User | null
  organization: Organization | null
  currentProject: Project | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchProject: (projectId: string) => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  isLoading: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
}

export interface ContentState {
  contents: Content[]
  filters: {
    status?: ContentStatus
    platform?: SocialPlatform
    dateRange?: [Date, Date]
  }
  isLoading: boolean
  fetchContents: (projectId: string) => Promise<void>
  createContent: (content: CreateContentForm) => Promise<void>
  updateContent: (id: string, updates: Partial<Content>) => Promise<void>
  deleteContent: (id: string) => Promise<void>
  setFilters: (filters: ContentState['filters']) => void
}

// External API types
export interface FacebookPageInfo {
  id: string
  name: string
  access_token: string
}

export interface TwitterUserInfo {
  id: string
  username: string
  name: string
}

export interface LinkedInPageInfo {
  id: string
  name: string
  localizedName: string
}

// Social Media Credentials types
export interface SocialMediaCredential {
  id: string
  project_id: string
  social_account_id: string
  platform: SocialPlatform
  account_name: string
  is_active: boolean
  is_verified: boolean
  last_verified_at?: string
  verification_error?: string
  last_used_at?: string
  usage_count: number
  rate_limit_remaining?: number
  rate_limit_reset_at?: string
  expires_at?: string
  rotation_scheduled_at?: string
  created_at: string
  updated_at: string
}

export interface CredentialForm {
  project_id: string
  social_account_id: string
  platform: SocialPlatform
  account_name: string
  credentials: {
    api_key?: string
    api_secret?: string
    access_token?: string
    refresh_token?: string
    app_id?: string
    client_id?: string
    client_secret?: string
    webhook_secret?: string
    page_token?: string
    business_account_id?: string
  }
  expires_at?: string
}

export interface N8NWebhookConfig {
  id: string
  project_id: string
  webhook_url: string
  webhook_secret: string
  n8n_workflow_id?: string
  automation_type: AutomationType
  is_active: boolean
  trigger_events: string[]
  platform_filters?: string[]
  last_triggered_at?: string
  trigger_count: number
  created_at: string
  updated_at: string
}

export interface N8NWebhookForm {
  project_id: string
  webhook_url: string
  webhook_secret: string
  n8n_workflow_id?: string
  automation_type: AutomationType
  trigger_events: string[]
  platform_filters?: string[]
}

export interface PlatformCredentialField {
  name: keyof CredentialForm['credentials']
  label: string
  type: 'text' | 'password' | 'url'
  placeholder: string
  required: boolean
  description?: string
}