# 🚀 SocialFlow - AI-Powered Social Media Management Platform

> **100% FREE MVP Version** - Complete AI-powered social media management platform for marketing agencies and businesses

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai)](https://openai.com/)

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Technical Architecture](#️-technical-architecture)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [📁 Project Structure](#-project-structure)
- [🔧 Development Status](#-development-status)
- [🛠️ Tech Stack](#️-tech-stack)
- [📊 Database Schema](#-database-schema)
- [🤖 AI Integration](#-ai-integration)
- [🎨 UI/UX Features](#-uiux-features)
- [🔐 Authentication](#-authentication)
- [📱 Responsive Design](#-responsive-design)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Project Overview

**SocialFlow** is a comprehensive, AI-powered social media management platform designed specifically for marketing agencies and businesses. Built with modern web technologies, it provides an all-in-one solution for content creation, project management, and social media automation.

### 🎯 **Target Audience**
- Marketing Agencies
- Small to Medium Businesses
- Content Creators
- Social Media Managers
- Digital Marketing Professionals

### 💡 **Core Value Proposition**
- **100% Free MVP** - No credit card required, all features unlocked
- **AI-Powered Content Generation** - Create engaging content with advanced AI
- **Project-Centric Approach** - Organize campaigns by projects for better management
- **Multi-Platform Support** - Manage Facebook, Instagram, Twitter, LinkedIn, TikTok
- **Professional UI/UX** - Modern, intuitive interface with dark/light themes

## ✨ Key Features

### 🎯 **Project Management**
- ✅ **Project Creation & Management** - Create and organize social media campaigns
- ✅ **Project Settings** - Configure industry, target audience, brand voice
- ✅ **Project Switching** - Easy project context switching
- ✅ **Project Analytics** - Track project performance and metrics
- ✅ **Project Status Management** - Active, Paused, Completed, Archived states

### 🤖 **AI Content Generation**
- ✅ **Advanced AI Integration** - Hugging Face API with GPT-2 model
- ✅ **Content Ideas Generation** - AI-powered content suggestions
- ✅ **Multi-Platform Optimization** - Platform-specific content formatting
- ✅ **Tone & Style Control** - Professional, Casual, Funny, Inspiring, Promotional
- ✅ **Content Types** - Posts, Stories, Reels, Threads
- ✅ **Hashtag Generation** - Automatic hashtag suggestions
- ✅ **Content Length Optimization** - Platform-specific character limits

### 📝 **Content Management**
- ✅ **Content Creation** - AI-powered and manual content creation
- ✅ **Content Editor** - Rich text editing with preview
- ✅ **Content Scheduling** - Schedule posts for optimal times
- ✅ **Content Library** - Organize and manage all content
- ✅ **Content Duplication** - Clone and modify existing content
- ✅ **Content Status Tracking** - Draft, Scheduled, Published, Failed
- ✅ **Content Filtering & Search** - Advanced filtering by platform, tone, status

### 🔐 **Authentication & Security**
- ✅ **Email/Password Authentication** - Secure user registration and login
- ✅ **OAuth Integration** - Google and GitHub social login
- ✅ **User Management** - Profile management and settings
- ✅ **Session Management** - Secure session handling
- ✅ **Password Reset** - Email-based password recovery

### 🎨 **User Interface**
- ✅ **Modern Design System** - Custom design system with Tailwind CSS
- ✅ **Dark/Light Theme** - Automatic theme switching with system preference
- ✅ **Responsive Design** - Mobile-first, fully responsive layout
- ✅ **Component Library** - Reusable UI components
- ✅ **Animations** - Smooth transitions and micro-interactions
- ✅ **Accessibility** - WCAG compliant, keyboard navigation

### 📊 **Dashboard & Analytics**
- ✅ **Project Overview** - Comprehensive project dashboard
- ✅ **Content Statistics** - Content creation and publishing metrics
- ✅ **Project Statistics** - Project performance tracking
- ✅ **Real-time Updates** - Live data updates
- ✅ **Visual Charts** - Data visualization components

### 🔧 **Settings & Configuration**
- ✅ **User Profile** - Personal information and preferences
- ✅ **Project Settings** - Detailed project configuration
- ✅ **AI Settings** - Customize AI generation parameters
- ✅ **Theme Settings** - Personalize appearance
- ✅ **Notification Settings** - Configure alerts and notifications

## 🏗️ Technical Architecture

### **Frontend Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                    │
├─────────────────────────────────────────────────────────────┤
│  Pages & Layouts  │  Components  │  Hooks  │  Utils        │
│  ├─ (auth)/       │  ├─ ui/      │  ├─ useProjects │  ├─ lib/ │
│  ├─ (dashboard)/  │  ├─ dashboard│  ├─ useAuth     │  ├─ types│
│  └─ api/          │  └─ forms/   │  └─ useTheme    │  └─ utils│
└─────────────────────────────────────────────────────────────┘
```

### **Backend Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Database  │  Auth  │  Storage  │  Edge Functions          │
│  ├─ PostgreSQL │  ├─ Auth UI  │  ├─ File Storage │  ├─ AI API │
│  ├─ RLS Policies│  ├─ OAuth    │  ├─ Images      │  └─ Webhooks│
│  └─ Triggers   │  └─ Sessions  │  └─ Documents   │           │
└─────────────────────────────────────────────────────────────┘
```

### **AI Integration**
```
┌─────────────────────────────────────────────────────────────┐
│                    AI Content Generation                    │
├─────────────────────────────────────────────────────────────┤
│  Hugging Face API  │  Content Processing  │  Optimization   │
│  ├─ GPT-2 Model   │  ├─ Prompt Engineering│  ├─ Platform Limits│
│  ├─ Text Generation│  ├─ Tone Control     │  ├─ Length Control│
│  └─ Error Handling│  └─ Hashtag Gen      │  └─ Quality Check│
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start Guide

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Hugging Face API key (optional)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/socialflow.git
cd socialflow
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Environment Setup**
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration (Optional)
HUGGINGFACE_API_KEY=your_huggingface_api_key
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **4. Database Setup**
1. Create a new Supabase project
2. Run the SQL schema from `database/PROJECT-CENTRIC-SCHEMA.sql`
3. Enable Row Level Security (RLS)
4. Configure authentication providers

### **5. Start Development Server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
socialflow/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (auth)/            # Authentication pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── 📁 (dashboard)/       # Dashboard pages
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── content/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── 📁 components/            # React components
│   │   ├── 📁 ui/                # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── 📁 dashboard/         # Dashboard components
│   │   │   ├── dashboard-overview.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── project-header.tsx
│   │   │   ├── project-provider.tsx
│   │   │   ├── create-project-dialog.tsx
│   │   │   ├── enhanced-content-creator.tsx
│   │   │   └── content-management.tsx
│   │   ├── 📁 projects/          # Project components
│   │   │   ├── project-card.tsx
│   │   │   └── project-settings-dialog.tsx
│   │   ├── 📁 landing/           # Landing page components
│   │   │   └── landing-page.tsx
│   │   └── providers.tsx         # Context providers
│   ├── 📁 lib/                   # Utility libraries
│   │   ├── 📁 auth/              # Authentication
│   │   │   ├── actions.ts
│   │   │   └── simple-auth.ts
│   │   ├── 📁 supabase/          # Supabase client
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── 📁 projects/          # Project management
│   │   │   ├── api.ts
│   │   │   └── project-actions.ts
│   │   ├── 📁 content/           # Content management
│   │   │   └── content-actions.ts
│   │   ├── 📁 ai/                # AI integration
│   │   │   └── ai-service.ts
│   │   └── utils.ts              # Utility functions
│   └── 📁 types/                 # TypeScript types
│       └── index.ts
├── 📁 database/                  # Database schema
│   └── PROJECT-CENTRIC-SCHEMA.sql
├── 📁 public/                    # Static assets
├── 📄 package.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
└── 📄 README.md
```

## 🔧 Development Status

### **✅ Completed Features (95%)**

#### **Core Platform (100%)**
- ✅ Project management system
- ✅ User authentication & authorization
- ✅ Database schema & API
- ✅ Responsive UI/UX design
- ✅ Theme system (dark/light)

#### **AI Content Generation (90%)**
- ✅ Hugging Face API integration
- ✅ Content generation with GPT-2
- ✅ Multi-platform optimization
- ✅ Tone and style control
- ✅ Hashtag generation
- ✅ Content ideas generation
- ⚠️ Error handling improvements needed

#### **Content Management (95%)**
- ✅ Content creation & editing
- ✅ Content library & organization
- ✅ Content scheduling
- ✅ Content filtering & search
- ✅ Content duplication
- ⚠️ Publishing to social platforms (pending)

#### **Project Management (100%)**
- ✅ Project creation & configuration
- ✅ Project switching & context
- ✅ Project settings & customization
- ✅ Project analytics & statistics
- ✅ Project status management

#### **User Interface (100%)**
- ✅ Modern design system
- ✅ Component library
- ✅ Responsive design
- ✅ Animations & transitions
- ✅ Accessibility features

### **🚧 In Progress (5%)**
- 🔄 Social media platform publishing
- 🔄 Advanced analytics dashboard
- 🔄 Team collaboration features
- 🔄 Advanced AI models integration

### **📋 Planned Features**
- 📅 Social media API integrations
- 📅 Advanced analytics & reporting
- 📅 Team management & collaboration
- 📅 Content calendar view
- 📅 Automated posting
- 📅 Performance tracking
- 📅 A/B testing
- 📅 White-label options

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.0
- **UI Components**: Custom component library
- **State Management**: React Context + useState
- **Icons**: Lucide React
- **Animations**: CSS animations + Framer Motion
- **Theme**: next-themes

### **Backend**
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase REST API
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### **AI & External Services**
- **AI Provider**: Hugging Face API
- **AI Model**: GPT-2
- **Content Generation**: Custom AI service
- **Error Handling**: Comprehensive error management

### **Development Tools**
- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git

## 📊 Database Schema

### **Core Tables**

#### **Users Table**
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  organization_id UUID REFERENCES organizations(id),
  role VARCHAR DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### **Organizations Table**
```sql
organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  type VARCHAR,
  team_size VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### **Projects Table**
```sql
projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  description TEXT,
  industry VARCHAR,
  target_audience TEXT,
  brand_voice TEXT,
  default_tone VARCHAR DEFAULT 'professional',
  default_content_type VARCHAR DEFAULT 'post',
  keywords TEXT[],
  status VARCHAR DEFAULT 'active',
  priority VARCHAR DEFAULT 'medium',
  content_count INTEGER DEFAULT 0,
  social_accounts_count INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### **Content Table**
```sql
content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  status VARCHAR DEFAULT 'draft',
  scheduled_at TIMESTAMP,
  media_urls TEXT[],
  hashtags TEXT[],
  ai_generated BOOLEAN DEFAULT false,
  ai_provider VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### **Social Accounts Table**
```sql
social_accounts (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  platform VARCHAR NOT NULL,
  platform_username VARCHAR,
  platform_user_id VARCHAR,
  profile_url VARCHAR,
  followers_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 🤖 AI Integration

### **AI Service Architecture**
```typescript
// AI Content Generation
interface AIGenerationOptions {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok'
  contentType: 'post' | 'story' | 'reel' | 'thread'
  tone: 'professional' | 'casual' | 'funny' | 'inspiring' | 'promotional'
  industry: string
  targetAudience: string
  keywords?: string[]
  maxLength?: number
}
```

### **Supported AI Features**
- ✅ **Content Generation** - AI-powered content creation
- ✅ **Content Ideas** - Automated content suggestions
- ✅ **Hashtag Generation** - Platform-specific hashtags
- ✅ **Tone Control** - Multiple tone options
- ✅ **Platform Optimization** - Character limits and formatting
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Fallback Content** - Backup content when AI fails

### **AI Models Used**
- **Primary**: GPT-2 (Hugging Face)
- **Fallback**: Template-based content generation
- **Future**: GPT-3.5, GPT-4, Claude integration

## 🎨 UI/UX Features

### **Design System**
- **Color Palette**: Custom SocialFlow brand colors
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Components**: 50+ reusable components
- **Icons**: Lucide React icon library

### **Theme Support**
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy-on-eyes dark mode
- **System Theme**: Automatic theme switching
- **Custom Colors**: Brand-specific color schemes

### **Responsive Design**
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop**: Full desktop experience
- **Breakpoints**: Tailwind CSS responsive breakpoints

### **Accessibility**
- **WCAG Compliant**: Accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Color Contrast**: High contrast ratios
- **Focus Management**: Clear focus indicators

## 🔐 Authentication

### **Authentication Methods**
- ✅ **Email/Password** - Traditional authentication
- ✅ **OAuth Providers** - Google, GitHub
- ✅ **Session Management** - Secure session handling
- ✅ **Password Reset** - Email-based recovery

### **Security Features**
- ✅ **Row Level Security** - Database-level security
- ✅ **JWT Tokens** - Secure token-based auth
- ✅ **CSRF Protection** - Cross-site request forgery protection
- ✅ **Input Validation** - Server-side validation
- ✅ **Error Handling** - Secure error messages

## 📱 Responsive Design

### **Breakpoints**
```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### **Component Responsiveness**
- ✅ **Navigation** - Collapsible mobile menu
- ✅ **Dashboard** - Responsive grid layouts
- ✅ **Forms** - Mobile-optimized form inputs
- ✅ **Tables** - Horizontal scrolling on mobile
- ✅ **Modals** - Full-screen on mobile

## 🚀 Deployment

### **Environment Variables**
```env
# Production Environment
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
HUGGINGFACE_API_KEY=your_production_huggingface_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **Deployment Platforms**
- **Vercel** (Recommended)
- **Netlify**
- **Railway**
- **DigitalOcean**
- **AWS**

### **Build Commands**
```bash
# Development
npm run dev

# Production Build
npm run build

# Start Production
npm start

# Lint & Type Check
npm run lint
npm run type-check
```

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- **TypeScript** - Strict type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message format

### **Pull Request Process**
1. Ensure all tests pass
2. Update documentation
3. Add screenshots for UI changes
4. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [API Documentation](docs/api.md)
- [Component Library](docs/components.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guide](docs/contributing.md)

### **Community**
- [GitHub Issues](https://github.com/your-username/socialflow/issues)
- [Discord Community](https://discord.gg/socialflow)
- [Email Support](mailto:support@socialflow.app)

### **FAQ**
- **Q: Is this really free?** A: Yes, the MVP version is 100% free with all features unlocked.
- **Q: Do I need a credit card?** A: No, no credit card required for the MVP.
- **Q: Can I use this for commercial purposes?** A: Yes, commercial use is allowed.
- **Q: How do I get support?** A: Use GitHub issues or join our Discord community.

---

## 🎉 **Ready to Get Started?**

1. **Clone the repository**
2. **Set up your environment**
3. **Start building amazing social media campaigns**

**SocialFlow** - Where AI meets social media management! 🚀✨

---

*Built with ❤️ by the SocialFlow Team*
