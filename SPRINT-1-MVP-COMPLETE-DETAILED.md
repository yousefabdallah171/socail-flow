# 🚀 Sprint 1: MVP Foundation Features - COMPLETE DETAILED PLAN
**Duration**: 4 weeks  
**Status**: 100% FREE MVP - No Paid Services  
**Target**: Fully functional social media management platform with AI automation

---

## 📋 SPRINT 1 OVERVIEW

### **🎯 Main Objectives**
1. **100% FREE Implementation** - Zero recurring costs for MVP
2. **Core Social Media Management** - Complete inbox and scheduling system
3. **AI-Powered Content Creation** - Using free AI models via n8n
4. **Basic Automation** - Essential automated responses and workflows
5. **Scalable Foundation** - Architecture ready for Sprint 2 expansion

### **💰 Cost Breakdown: $0-30/month**
- **SocialFlow Main App**: FREE (Vercel/Netlify hosting)
- **Database**: FREE (Supabase free tier - 500MB)
- **n8n Instance**: $10-20/month (basic VPS)
- **Domain**: $10/year (optional)
- **All APIs**: FREE tiers only

---

## 🔄 PHASE 1.1: DATABASE & API FOUNDATION (Week 1)

### **🤖 AI AGENT (Claude) TASKS - Week 1**

#### **Task 1.1-AI: Create Complete Database Schema**
**Estimated Time**: 12 hours  
**Complexity**: High  
**Priority**: Critical

**Detailed Implementation:**
```sql
-- =====================================
-- SOCIALFLOW MVP DATABASE SCHEMA v1.0
-- 100% Free Tier Compatible
-- =====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- 1. INBOX & CONVERSATIONS SYSTEM
-- =====================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Platform identification
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'email', 'manual')),
    external_conversation_id VARCHAR(255), -- Platform-specific ID
    
    -- Participant information
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    participant_phone VARCHAR(255),
    participant_avatar_url TEXT,
    participant_profile_url TEXT,
    
    -- Conversation metadata
    conversation_type VARCHAR(50) DEFAULT 'direct', -- 'direct', 'comment', 'mention', 'review'
    subject VARCHAR(500), -- For email conversations
    
    -- Status and priority
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'archived')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Assignment and tagging
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Interaction tracking
    last_message_at TIMESTAMP DEFAULT NOW(),
    last_message_preview TEXT,
    unread_count INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    
    -- Engagement metrics
    response_time_minutes INTEGER,
    customer_satisfaction_score INTEGER CHECK (customer_satisfaction_score BETWEEN 1 AND 5),
    
    -- Automation flags
    auto_reply_enabled BOOLEAN DEFAULT true,
    requires_human_review BOOLEAN DEFAULT false,
    
    -- Timestamps
    first_message_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_platform_conversation UNIQUE(platform, external_conversation_id)
);

-- Create indexes for conversations
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX idx_conversations_priority ON conversations(priority);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message identification
    external_message_id VARCHAR(255), -- Platform-specific ID
    message_thread_id VARCHAR(255), -- For threaded conversations
    
    -- Sender information
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system', 'bot')),
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    sender_avatar_url TEXT,
    sender_platform_id VARCHAR(255), -- Platform user ID
    
    -- Message content
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'file', 'audio', 'link', 'emoji')),
    html_content TEXT, -- For rich content
    
    -- Media attachments
    media_urls TEXT[] DEFAULT '{}',
    media_metadata JSONB DEFAULT '{}', -- File sizes, dimensions, etc.
    
    -- Message metadata
    platform_data JSONB DEFAULT '{}', -- Platform-specific data
    mentions TEXT[] DEFAULT '{}', -- @mentions in the message
    hashtags TEXT[] DEFAULT '{}', -- #hashtags in the message
    links TEXT[] DEFAULT '{}', -- URLs in the message
    
    -- Status and flags
    is_read BOOLEAN DEFAULT false,
    is_internal BOOLEAN DEFAULT false, -- Internal notes
    is_automated BOOLEAN DEFAULT false, -- Bot/system generated
    requires_response BOOLEAN DEFAULT false,
    
    -- Sentiment and AI analysis
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
    intent VARCHAR(100), -- 'support_request', 'sales_inquiry', 'complaint', etc.
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Performance index
    CONSTRAINT unique_platform_message UNIQUE(external_message_id, conversation_id)
);

-- Create indexes for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_sender_type ON messages(sender_type);
CREATE INDEX idx_messages_content_type ON messages(content_type);
CREATE INDEX idx_messages_sentiment ON messages(sentiment);

-- =====================================
-- 2. CONTENT & SCHEDULING SYSTEM
-- =====================================

-- Extend existing content table
ALTER TABLE content ADD COLUMN IF NOT EXISTS scheduled_for_platforms JSONB DEFAULT '{}';
ALTER TABLE content ADD COLUMN IF NOT EXISTS recurring_schedule JSONB;
ALTER TABLE content ADD COLUMN IF NOT EXISTS auto_post_enabled BOOLEAN DEFAULT false;
ALTER TABLE content ADD COLUMN IF NOT EXISTS best_time_posting BOOLEAN DEFAULT false;
ALTER TABLE content ADD COLUMN IF NOT EXISTS post_analytics JSONB DEFAULT '{}';
ALTER TABLE content ADD COLUMN IF NOT EXISTS content_template_id UUID;
ALTER TABLE content ADD COLUMN IF NOT EXISTS ai_generation_prompt TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS ai_optimization_notes TEXT;

CREATE TABLE scheduled_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Scheduling details
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube')),
    scheduled_at TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Post configuration
    post_type VARCHAR(50) DEFAULT 'post' CHECK (post_type IN ('post', 'story', 'reel', 'video', 'carousel')),
    platform_specific_data JSONB DEFAULT '{}', -- Platform-specific formatting
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posting', 'posted', 'failed', 'cancelled')),
    platform_post_id VARCHAR(255), -- ID from platform after posting
    platform_post_url TEXT, -- Direct link to post
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    
    -- Performance tracking
    posted_at TIMESTAMP,
    initial_engagement JSONB DEFAULT '{}', -- Likes, shares, comments in first hour
    
    -- Automation metadata
    scheduled_by_automation BOOLEAN DEFAULT false,
    automation_rule_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for scheduled_posts
CREATE INDEX idx_scheduled_posts_content_id ON scheduled_posts(content_id);
CREATE INDEX idx_scheduled_posts_project_id ON scheduled_posts(project_id);
CREATE INDEX idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);

-- =====================================
-- 3. AI & AUTOMATION SYSTEM
-- =====================================

CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Rule identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general', -- 'customer_service', 'sales', 'marketing', 'general'
    
    -- Trigger configuration
    trigger_type VARCHAR(100) NOT NULL CHECK (trigger_type IN ('new_message', 'mention', 'keyword', 'sentiment', 'time_based', 'manual')),
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    
    -- Example trigger_conditions structures:
    -- For 'keyword': {"keywords": ["help", "support"], "match_type": "any"}
    -- For 'sentiment': {"sentiment": "negative", "confidence": 0.8}
    -- For 'time_based': {"schedule": "0 9 * * MON", "timezone": "UTC"}
    
    -- Action configuration
    actions JSONB NOT NULL DEFAULT '[]',
    
    -- Example actions structure:
    -- [{"type": "send_reply", "template": "Thank you for contacting us..."},
    --  {"type": "assign_to_agent", "agent_id": "uuid"},
    --  {"type": "add_tag", "tag": "urgent"}]
    
    -- AI configuration
    ai_enabled BOOLEAN DEFAULT false,
    ai_model VARCHAR(100) DEFAULT 'llama2', -- 'llama2', 'codellama', 'mistral'
    ai_prompt_template TEXT,
    ai_confidence_threshold DECIMAL(3,2) DEFAULT 0.70,
    
    -- Execution settings
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 50, -- 1-100, higher = more priority
    cooldown_minutes INTEGER DEFAULT 0, -- Prevent spam
    
    -- Performance tracking
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    average_execution_time_ms INTEGER,
    
    -- Human oversight
    requires_approval BOOLEAN DEFAULT false,
    approval_required_for TEXT[] DEFAULT '{}', -- Which actions need approval
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for automation_rules
CREATE INDEX idx_automation_rules_project_id ON automation_rules(project_id);
CREATE INDEX idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX idx_automation_rules_priority ON automation_rules(priority DESC);

CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    
    -- Execution context
    trigger_data JSONB DEFAULT '{}', -- What triggered the rule
    execution_context JSONB DEFAULT '{}', -- Context at time of execution
    
    -- Execution details
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'requires_approval')),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    execution_time_ms INTEGER,
    
    -- Actions performed
    actions_planned JSONB DEFAULT '[]',
    actions_completed JSONB DEFAULT '[]',
    actions_failed JSONB DEFAULT '[]',
    current_action_index INTEGER DEFAULT 0,
    
    -- Results and outputs
    execution_results JSONB DEFAULT '{}',
    generated_content TEXT, -- If AI generated content
    ai_confidence_score DECIMAL(3,2),
    
    -- Error handling
    error_messages TEXT[] DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    
    -- Human approval
    approval_status VARCHAR(50) CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for automation_executions
CREATE INDEX idx_automation_executions_rule_id ON automation_executions(rule_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(status);
CREATE INDEX idx_automation_executions_started_at ON automation_executions(started_at DESC);
CREATE INDEX idx_automation_executions_approval_status ON automation_executions(approval_status);

-- =====================================
-- 4. CONTENT TEMPLATES SYSTEM
-- =====================================

CREATE TABLE content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Template identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'social_post', 'email', 'response', 'campaign'
    template_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'mixed'
    
    -- Template content
    template_content TEXT NOT NULL,
    html_template TEXT,
    
    -- Variables and customization
    variables JSONB DEFAULT '[]', -- [{"name": "customer_name", "type": "text", "required": true}]
    default_values JSONB DEFAULT '{}', -- {"company_name": "SocialFlow"}
    
    -- Platform compatibility
    supported_platforms TEXT[] DEFAULT '{}',
    platform_variations JSONB DEFAULT '{}', -- Platform-specific versions
    
    -- Usage and performance
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    average_engagement_score DECIMAL(5,2),
    
    -- Template settings
    is_public BOOLEAN DEFAULT false,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_generation_prompt TEXT,
    
    -- Sharing and collaboration
    shared_with_projects UUID[] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for content_templates
CREATE INDEX idx_content_templates_project_id ON content_templates(project_id);
CREATE INDEX idx_content_templates_category ON content_templates(category);
CREATE INDEX idx_content_templates_is_public ON content_templates(is_public);

-- =====================================
-- 5. ANALYTICS & TRACKING SYSTEM
-- =====================================

CREATE TABLE platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE SET NULL,
    scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,
    
    -- Platform and timing
    platform VARCHAR(50) NOT NULL,
    analytics_date DATE NOT NULL,
    collected_at TIMESTAMP DEFAULT NOW(),
    
    -- Engagement metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    
    -- Advanced metrics
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    cost_per_engagement DECIMAL(10,2) DEFAULT 0,
    
    -- Audience insights
    audience_demographics JSONB DEFAULT '{}',
    top_locations JSONB DEFAULT '{}',
    optimal_posting_times JSONB DEFAULT '{}',
    
    -- Platform-specific metrics
    platform_specific_metrics JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one record per platform per date per content
    CONSTRAINT unique_analytics_record UNIQUE(project_id, platform, analytics_date, COALESCE(content_id, scheduled_post_id::UUID))
);

-- Create indexes for platform_analytics
CREATE INDEX idx_platform_analytics_project_id ON platform_analytics(project_id);
CREATE INDEX idx_platform_analytics_platform ON platform_analytics(platform);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(analytics_date DESC);
CREATE INDEX idx_platform_analytics_content_id ON platform_analytics(content_id);

-- =====================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their project's conversations" ON conversations
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid() 
            OR id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can only access their project's messages" ON messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE project_id IN (
                SELECT id FROM projects 
                WHERE user_id = auth.uid()
                OR id IN (
                    SELECT project_id FROM project_members 
                    WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can only access their project's scheduled_posts" ON scheduled_posts
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
            OR id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can only access their project's automation_rules" ON automation_rules
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
            OR id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can only access their project's content_templates" ON content_templates
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
            OR id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
        OR is_public = true
    );

CREATE POLICY "Users can only access their project's platform_analytics" ON platform_analytics
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid()
            OR id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================
-- 7. TRIGGERS AND FUNCTIONS
-- =====================================

-- Function to update conversation metadata when message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message_at = NEW.sent_at,
        last_message_preview = LEFT(NEW.content, 100),
        total_messages = total_messages + 1,
        unread_count = CASE 
            WHEN NEW.sender_type = 'customer' THEN unread_count + 1 
            ELSE unread_count 
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Function to update automation rule statistics
CREATE OR REPLACE FUNCTION update_automation_rule_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE automation_rules 
        SET 
            execution_count = execution_count + 1,
            success_count = success_count + 1,
            last_executed_at = NEW.completed_at,
            average_execution_time_ms = (
                COALESCE(average_execution_time_ms, 0) + NEW.execution_time_ms
            ) / 2
        WHERE id = NEW.rule_id;
    ELSIF NEW.status = 'failed' THEN
        UPDATE automation_rules 
        SET 
            execution_count = execution_count + 1,
            failure_count = failure_count + 1
        WHERE id = NEW.rule_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automation stats
CREATE TRIGGER trigger_update_automation_rule_stats
    AFTER UPDATE ON automation_executions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_automation_rule_stats();

-- =====================================
-- 8. INITIAL DATA SEEDING
-- =====================================

-- Insert default content templates
INSERT INTO content_templates (id, project_id, name, description, category, template_content, variables, supported_platforms) VALUES
(uuid_generate_v4(), NULL, 'Welcome Message', 'Standard welcome message for new followers', 'response', 
 'Hi {{customer_name}}! 👋 Thanks for reaching out to {{company_name}}. How can we help you today?', 
 '[{"name": "customer_name", "type": "text", "required": true}, {"name": "company_name", "type": "text", "required": false}]',
 ARRAY['facebook', 'instagram', 'twitter', 'linkedin']
),
(uuid_generate_v4(), NULL, 'Thank You Post', 'Thank you post template', 'social_post',
 'Thank you {{customer_name}} for choosing {{company_name}}! 🙏 Your support means the world to us. #grateful #customers',
 '[{"name": "customer_name", "type": "text", "required": true}, {"name": "company_name", "type": "text", "required": true}]',
 ARRAY['facebook', 'instagram', 'twitter', 'linkedin']
),
(uuid_generate_v4(), NULL, 'Product Launch', 'Product launch announcement template', 'social_post',
 '🚀 Exciting news! We''re launching {{product_name}}! {{description}} Get yours now: {{link}} #launch #newproduct',
 '[{"name": "product_name", "type": "text", "required": true}, {"name": "description", "type": "text", "required": true}, {"name": "link", "type": "url", "required": false}]',
 ARRAY['facebook', 'instagram', 'twitter', 'linkedin']
);

-- Make templates public
UPDATE content_templates SET is_public = true WHERE project_id IS NULL;

COMMIT;
```

**Expected Output:**
- Complete database schema with all tables created
- RLS policies implemented for security
- Triggers for automatic data updates
- Default templates seeded
- All indexes created for performance

**Testing Checklist:**
- [ ] All tables created without errors
- [ ] Foreign key constraints working
- [ ] RLS policies preventing unauthorized access
- [ ] Triggers firing correctly on data changes
- [ ] Default data seeded successfully

#### **Task 1.2-AI: Create Inbox Management API**
**Estimated Time**: 8 hours  
**Complexity**: Medium-High  
**Priority**: Critical

**File Structure:**
```
src/app/api/
├── conversations/
│   ├── route.ts                    # GET /api/conversations, POST /api/conversations
│   ├── [id]/
│   │   ├── route.ts               # GET, PUT, DELETE /api/conversations/[id]
│   │   ├── messages/
│   │   │   └── route.ts           # GET, POST /api/conversations/[id]/messages
│   │   ├── assign/
│   │   │   └── route.ts           # POST /api/conversations/[id]/assign
│   │   └── close/
│   │       └── route.ts           # POST /api/conversations/[id]/close
├── messages/
│   ├── route.ts                   # GET /api/messages (with filters)
│   ├── [id]/
│   │   ├── route.ts              # GET, PUT /api/messages/[id]
│   │   └── mark-read/
│   │       └── route.ts          # POST /api/messages/[id]/mark-read
├── n8n/
│   └── messages/
│       ├── ingest/
│       │   └── route.ts          # POST /api/n8n/messages/ingest
│       ├── send-reply/
│       │   └── route.ts          # POST /api/n8n/messages/send-reply
│       └── status/
│           └── route.ts          # POST /api/n8n/messages/status
```

**Detailed Implementation:**

**`src/app/api/conversations/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createConversationSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'email', 'manual']),
  external_conversation_id: z.string().optional(),
  participant_name: z.string().min(1, 'Participant name is required'),
  participant_email: z.string().email().optional(),
  participant_phone: z.string().optional(),
  participant_avatar_url: z.string().url().optional(),
  conversation_type: z.enum(['direct', 'comment', 'mention', 'review']).default('direct'),
  subject: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z.array(z.string()).default([])
})

const listConversationsSchema = z.object({
  project_id: z.string().uuid(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['open', 'pending', 'closed', 'archived']).optional(),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'email', 'manual']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'last_message_at', 'priority']).default('last_message_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    
    // Validate query parameters
    const validatedParams = listConversationsSchema.parse(params)
    
    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('conversations')
      .select(`
        *,
        assigned_user:assigned_to(id, name, email),
        project:projects(id, name),
        message_count:messages(count),
        latest_message:messages(id, content, sent_at, sender_type)
      `)
      .eq('project_id', validatedParams.project_id)

    // Apply filters
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status)
    }
    if (validatedParams.platform) {
      query = query.eq('platform', validatedParams.platform)
    }
    if (validatedParams.priority) {
      query = query.eq('priority', validatedParams.priority)
    }
    if (validatedParams.assigned_to) {
      query = query.eq('assigned_to', validatedParams.assigned_to)
    }
    if (validatedParams.search) {
      query = query.or(`participant_name.ilike.%${validatedParams.search}%,subject.ilike.%${validatedParams.search}%,last_message_preview.ilike.%${validatedParams.search}%`)
    }

    // Apply sorting
    query = query.order(validatedParams.sort_by, { ascending: validatedParams.sort_order === 'asc' })

    // Apply pagination
    const offset = (validatedParams.page - 1) * validatedParams.limit
    query = query.range(offset, offset + validatedParams.limit - 1)

    const { data: conversations, error, count } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedParams.limit)
    
    return NextResponse.json({
      conversations,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        totalPages,
        hasNextPage: validatedParams.page < totalPages,
        hasPreviousPage: validatedParams.page > 1
      },
      filters: {
        status: validatedParams.status,
        platform: validatedParams.platform,
        priority: validatedParams.priority,
        assigned_to: validatedParams.assigned_to,
        search: validatedParams.search
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error in conversations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createConversationSchema.parse(body)

    // Create conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        ...validatedData,
        first_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        assigned_user:assigned_to(id, name, email),
        project:projects(id, name)
      `)
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Log activity
    console.log(`New conversation created: ${conversation.id} for project: ${conversation.project_id}`)

    return NextResponse.json({ 
      conversation,
      message: 'Conversation created successfully' 
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error in create conversation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Expected Output:**
- RESTful API endpoints for conversation management
- Comprehensive validation using Zod
- Pagination and filtering capabilities
- Error handling and logging
- Type-safe responses

**Testing Checklist:**
- [ ] GET conversations with various filters works
- [ ] POST conversation creates with validation
- [ ] Pagination calculations correct
- [ ] RLS policies enforced
- [ ] Error responses properly formatted

#### **Task 1.3-AI: Implement Conversation Service Layer**
**Estimated Time**: 6 hours  
**Complexity**: Medium  
**Priority**: High

**File: `src/lib/inbox/conversation-service.ts`**
```typescript
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type Conversation = Tables['conversations']['Row']
type Message = Tables['messages']['Row']
type ConversationInsert = Tables['conversations']['Insert']
type MessageInsert = Tables['messages']['Insert']

export interface ConversationFilters {
  status?: 'open' | 'pending' | 'closed' | 'archived'
  platform?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  search?: string
  tags?: string[]
}

export interface ConversationWithDetails extends Conversation {
  messages?: Message[]
  message_count?: number
  latest_message?: Message
  assigned_user?: { id: string; name: string; email: string }
}

export interface MessageWithSender extends Message {
  sender_info?: {
    name: string
    avatar_url?: string
    platform_id?: string
  }
}

export class ConversationService {
  private supabase = createClient()

  /**
   * Get conversations with filtering and pagination
   */
  async getConversations(
    projectId: string, 
    filters: ConversationFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: ConversationWithDetails[]
    total: number
    hasMore: boolean
  }> {
    try {
      let query = this.supabase
        .from('conversations')
        .select(`
          *,
          messages:messages(count),
          latest_message:messages(
            id, content, sent_at, sender_type, sender_name
          ),
          assigned_user:users!assigned_to(
            id, name, email
          )
        `)
        .eq('project_id', projectId)

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }
      if (filters.search) {
        query = query.or(`
          participant_name.ilike.%${filters.search}%,
          subject.ilike.%${filters.search}%,
          last_message_preview.ilike.%${filters.search}%
        `)
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      // Order by last message time (most recent first)
      query = query.order('last_message_at', { ascending: false })

      // Get total count
      const { count } = await this.supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      // Apply pagination
      const offset = (page - 1) * limit
      const { data: conversations, error } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error(`Failed to fetch conversations: ${error.message}`)
      }

      return {
        conversations: conversations || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }

    } catch (error) {
      console.error('Error in getConversations:', error)
      throw error
    }
  }

  /**
   * Get a single conversation with full message history
   */
  async getConversation(conversationId: string): Promise<ConversationWithDetails | null> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          messages:messages(*),
          assigned_user:users!assigned_to(
            id, name, email, avatar_url
          ),
          project:projects(id, name)
        `)
        .eq('id', conversationId)
        .order('sent_at', { ascending: true, referencedTable: 'messages' })
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Conversation not found
        }
        throw new Error(`Failed to fetch conversation: ${error.message}`)
      }

      // Mark messages as read
      await this.markMessagesAsRead(conversationId)

      return conversation

    } catch (error) {
      console.error('Error in getConversation:', error)
      throw error
    }
  }

  /**
   * Create a new message in a conversation
   */
  async createMessage(
    conversationId: string, 
    messageData: {
      content: string
      sender_type: 'customer' | 'agent' | 'system' | 'bot'
      sender_name?: string
      sender_email?: string
      content_type?: string
      media_urls?: string[]
      is_internal?: boolean
    }
  ): Promise<Message> {
    try {
      // Verify conversation exists
      const conversation = await this.getConversation(conversationId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: messageData.content,
          sender_type: messageData.sender_type,
          sender_name: messageData.sender_name || 'Unknown',
          sender_email: messageData.sender_email,
          content_type: messageData.content_type || 'text',
          media_urls: messageData.media_urls || [],
          is_internal: messageData.is_internal || false,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create message: ${error.message}`)
      }

      // Update conversation status if it was closed
      if (conversation.status === 'closed' && messageData.sender_type === 'customer') {
        await this.updateConversationStatus(conversationId, 'open')
      }

      return message

    } catch (error) {
      console.error('Error in createMessage:', error)
      throw error
    }
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(
    conversationId: string, 
    status: 'open' | 'pending' | 'closed' | 'archived'
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      // Set closed_at timestamp when closing
      if (status === 'closed') {
        updateData.closed_at = new Date().toISOString()
      } else if (status === 'open') {
        updateData.closed_at = null
      }

      const { error } = await this.supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)

      if (error) {
        throw new Error(`Failed to update conversation status: ${error.message}`)
      }

    } catch (error) {
      console.error('Error in updateConversationStatus:', error)
      throw error
    }
  }

  /**
   * Assign conversation to a user
   */
  async assignConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({
          assigned_to: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) {
        throw new Error(`Failed to assign conversation: ${error.message}`)
      }

    } catch (error) {
      console.error('Error in assignConversation:', error)
      throw error
    }
  }

  /**
   * Add tags to conversation
   */
  async addTags(conversationId: string, tags: string[]): Promise<void> {
    try {
      // Get current tags
      const { data: conversation } = await this.supabase
        .from('conversations')
        .select('tags')
        .eq('id', conversationId)
        .single()

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Merge with new tags and remove duplicates
      const currentTags = conversation.tags || []
      const updatedTags = [...new Set([...currentTags, ...tags])]

      const { error } = await this.supabase
        .from('conversations')
        .update({
          tags: updatedTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) {
        throw new Error(`Failed to add tags: ${error.message}`)
      }

    } catch (error) {
      console.error('Error in addTags:', error)
      throw error
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)

      if (error) {
        throw new Error(`Failed to mark messages as read: ${error.message}`)
      }

      // Reset unread count on conversation
      await this.supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)

    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
      throw error
    }
  }

  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(projectId: string, dateRange?: { start: Date; end: Date }) {
    try {
      let query = this.supabase
        .from('conversations')
        .select('status, platform, priority, response_time_minutes, customer_satisfaction_score, created_at')
        .eq('project_id', projectId)

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString())
      }

      const { data: conversations, error } = await query

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`)
      }

      // Calculate metrics
      const total = conversations?.length || 0
      const byStatus = conversations?.reduce((acc: any, conv) => {
        acc[conv.status] = (acc[conv.status] || 0) + 1
        return acc
      }, {}) || {}

      const byPlatform = conversations?.reduce((acc: any, conv) => {
        acc[conv.platform] = (acc[conv.platform] || 0) + 1
        return acc
      }, {}) || {}

      const avgResponseTime = conversations?.reduce((sum, conv) => {
        return sum + (conv.response_time_minutes || 0)
      }, 0) / Math.max(total, 1) || 0

      const avgSatisfaction = conversations?.reduce((sum, conv) => {
        return sum + (conv.customer_satisfaction_score || 0)
      }, 0) / Math.max(total, 1) || 0

      return {
        total,
        byStatus,
        byPlatform,
        avgResponseTime: Math.round(avgResponseTime),
        avgSatisfaction: Math.round(avgSatisfaction * 100) / 100
      }

    } catch (error) {
      console.error('Error in getConversationAnalytics:', error)
      throw error
    }
  }

  /**
   * Search conversations and messages
   */
  async searchConversations(
    projectId: string, 
    query: string, 
    filters: ConversationFilters = {}
  ): Promise<ConversationWithDetails[]> {
    try {
      // Search in conversations and messages
      let searchQuery = this.supabase
        .from('conversations')
        .select(`
          *,
          messages:messages(
            id, content, sent_at, sender_type, sender_name
          ),
          assigned_user:users!assigned_to(
            id, name, email
          )
        `)
        .eq('project_id', projectId)
        .or(`
          participant_name.ilike.%${query}%,
          subject.ilike.%${query}%,
          tags.cs.{${query}}
        `)

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'search') {
          searchQuery = searchQuery.eq(key, value)
        }
      })

      const { data: conversations, error } = await searchQuery
        .order('last_message_at', { ascending: false })
        .limit(50)

      if (error) {
        throw new Error(`Search failed: ${error.message}`)
      }

      // Also search in message content
      const { data: messageMatches } = await this.supabase
        .from('messages')
        .select(`
          conversation_id,
          conversations:conversation_id (
            *,
            assigned_user:users!assigned_to(
              id, name, email
            )
          )
        `)
        .ilike('content', `%${query}%`)
        .eq('conversations.project_id', projectId)

      // Combine and deduplicate results
      const allResults = [...(conversations || []), ...(messageMatches?.map(m => m.conversations).filter(Boolean) || [])]
      const uniqueResults = allResults.filter((conv, index, self) => 
        index === self.findIndex(c => c?.id === conv?.id)
      )

      return uniqueResults.filter(Boolean) as ConversationWithDetails[]

    } catch (error) {
      console.error('Error in searchConversations:', error)
      throw error
    }
  }
}

// Export singleton instance
export const conversationService = new ConversationService()
```

**Expected Output:**
- Comprehensive service layer for conversation management
- Type-safe methods with error handling
- Analytics and search capabilities
- Real-time updates support
- Optimized database queries

**Testing Checklist:**
- [ ] All service methods work correctly
- [ ] Proper error handling and logging
- [ ] Type safety maintained throughout
- [ ] Performance optimized queries
- [ ] RLS policies respected

---

### **👨‍💻 DEVELOPER (Yousef) TASKS - Week 1**

#### **Task 1.1-DEV: n8n Infrastructure Setup**
**Estimated Time**: 4 hours  
**Complexity**: Medium  
**Priority**: Critical

**Detailed Setup Process:**

**1. VPS Setup and Docker Installation:**
```bash
# Connect to your VPS (DigitalOcean, Linode, etc.)
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create n8n directory
mkdir /opt/n8n-socialflow
cd /opt/n8n-socialflow
```

**2. Docker Compose Configuration:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: socialflow-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Basic Auth (for security)
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password_here
      
      # Database connection
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_secure_password
      
      # n8n Configuration
      - N8N_HOST=your-n8n-domain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your-n8n-domain.com/
      
      # Security
      - N8N_JWT_AUTH_ACTIVE=true
      - N8N_JWT_AUTH_HEADER=authorization
      - N8N_JWT_AUTH_HEADER_VALUE_PREFIX=Bearer
      
      # SocialFlow Integration
      - SOCIALFLOW_API_URL=https://your-socialflow-domain.com
      - SOCIALFLOW_WEBHOOK_SECRET=your_webhook_secret_here
      
      # Social Media APIs (Free Tiers)
      - FACEBOOK_APP_ID=your_facebook_app_id
      - FACEBOOK_APP_SECRET=your_facebook_app_secret
      - INSTAGRAM_APP_ID=your_instagram_app_id
      - INSTAGRAM_APP_SECRET=your_instagram_app_secret
      - TWITTER_API_KEY=your_twitter_api_key
      - TWITTER_API_SECRET=your_twitter_api_secret
      - TWITTER_BEARER_TOKEN=your_twitter_bearer_token
      - LINKEDIN_CLIENT_ID=your_linkedin_client_id
      - LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
      
      # AI Services (Free)
      - OLLAMA_BASE_URL=http://ollama:11434
      - HUGGINGFACE_API_KEY=your_free_huggingface_key
      
      # Email SMTP (Free Gmail SMTP)
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_SECURE=false
      - SMTP_AUTH_USER=your-email@gmail.com
      - SMTP_AUTH_PASS=your_app_specific_password
      
    volumes:
      - n8n_data:/home/node/.n8n
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    depends_on:
      - postgres
      - ollama
    networks:
      - n8n-network

  postgres:
    image: postgres:15
    container_name: socialflow-n8n-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_secure_password
      - POSTGRES_NON_ROOT_USER=n8n
      - POSTGRES_NON_ROOT_PASSWORD=n8n_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -h localhost -U n8n -d n8n']
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - n8n-network

  ollama:
    image: ollama/ollama:latest
    container_name: socialflow-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    networks:
      - n8n-network

  nginx:
    image: nginx:alpine
    container_name: socialflow-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - n8n
    networks:
      - n8n-network

volumes:
  n8n_data:
    driver: local
  postgres_data:
    driver: local
  ollama_data:
    driver: local

networks:
  n8n-network:
    driver: bridge
```

**3. Nginx Configuration for SSL:**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream n8n {
        server n8n:5678;
    }

    server {
        listen 80;
        server_name your-n8n-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-n8n-domain.com;

        ssl_certificate /etc/ssl/certs/cert.pem;
        ssl_certificate_key /etc/ssl/certs/key.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        location / {
            proxy_pass http://n8n;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Increase timeout for long-running workflows
            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }
    }
}
```

**4. Deployment Script:**
```bash
#!/bin/bash
# deploy-n8n.sh

echo "🚀 Deploying SocialFlow n8n Instance..."

# Create SSL certificates (using Let's Encrypt)
echo "📜 Setting up SSL certificates..."
apt install -y certbot
certbot certonly --standalone -d your-n8n-domain.com

# Copy certificates to nginx directory
mkdir -p ./ssl
cp /etc/letsencrypt/live/your-n8n-domain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/your-n8n-domain.com/privkey.pem ./ssl/key.pem

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Pull AI models
echo "🤖 Pulling AI models..."
docker exec socialflow-ollama ollama pull llama2
docker exec socialflow-ollama ollama pull codellama:7b
docker exec socialflow-ollama ollama pull mistral

# Test services
echo "🧪 Testing services..."
curl -f http://localhost:5678 && echo "✅ n8n is running"
curl -f http://localhost:11434/api/tags && echo "✅ Ollama is running"

echo "🎉 n8n deployment completed!"
echo "Access n8n at: https://your-n8n-domain.com"
echo "Login: admin / your_secure_password_here"
```

**Expected Output:**
- Fully functional n8n instance with SSL
- PostgreSQL database for workflow storage  
- Ollama AI models running locally
- Nginx reverse proxy with security headers
- All services auto-restart on failure

**Testing Checklist:**
- [ ] n8n accessible via HTTPS
- [ ] Authentication working
- [ ] Database connection established
- [ ] Ollama models downloaded and working
- [ ] SSL certificates valid
- [ ] Auto-restart functionality working

#### **Task 1.2-DEV: Social Media Message Ingestion Workflow**
**Estimated Time**: 6 hours  
**Complexity**: High  
**Priority**: Critical

**Workflow Name**: `SocialFlow - Message Ingestion`  
**Trigger Type**: Webhook  
**Expected Input**: Social media platform webhooks  
**Expected Output**: Normalized message data sent to SocialFlow

**Complete n8n Workflow JSON:**
```json
{
  "name": "SocialFlow - Message Ingestion v1.0",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "path": "socialflow-messages",
        "options": {}
      },
      "name": "Platform Webhook Receiver",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "socialflow-messages-webhook",
      "id": "webhook-receiver-001"
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "all": [
                  {
                    "property": "platform",
                    "type": "string",
                    "operation": "equal",
                    "value": "facebook"
                  }
                ]
              },
              "renameOutput": true,
              "outputKey": "facebook"
            },
            {
              "conditions": {
                "all": [
                  {
                    "property": "platform",
                    "type": "string", 
                    "operation": "equal",
                    "value": "instagram"
                  }
                ]
              },
              "renameOutput": true,
              "outputKey": "instagram"
            },
            {
              "conditions": {
                "all": [
                  {
                    "property": "platform",
                    "type": "string",
                    "operation": "equal", 
                    "value": "twitter"
                  }
                ]
              },
              "renameOutput": true,
              "outputKey": "twitter"
            },
            {
              "conditions": {
                "all": [
                  {
                    "property": "platform",
                    "type": "string",
                    "operation": "equal",
                    "value": "linkedin"
                  }
                ]
              },
              "renameOutput": true,
              "outputKey": "linkedin"
            }
          ]
        }
      },
      "name": "Platform Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [460, 300],
      "id": "platform-router-001"
    },
    {
      "parameters": {
        "functionCode": "// Facebook Message Processing\nconst webhookData = items[0].json;\n\ntry {\n  // Facebook webhook structure varies by type\n  const entry = webhookData.entry?.[0];\n  const messaging = entry?.messaging?.[0];\n  const changes = entry?.changes?.[0];\n  \n  let normalizedMessage = {\n    platform: 'facebook',\n    webhook_type: webhookData.object,\n    timestamp: new Date().toISOString()\n  };\n  \n  // Handle different Facebook webhook types\n  if (messaging) {\n    // Direct message\n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: 'direct_message',\n      external_conversation_id: messaging.sender.id + '_' + messaging.recipient.id,\n      external_message_id: messaging.message?.mid,\n      sender: {\n        id: messaging.sender.id,\n        name: 'Facebook User', // Need to fetch from Graph API\n        type: 'customer'\n      },\n      recipient: {\n        id: messaging.recipient.id\n      },\n      message: {\n        text: messaging.message?.text || '',\n        attachments: messaging.message?.attachments || [],\n        quick_reply: messaging.message?.quick_reply,\n        timestamp: messaging.timestamp\n      },\n      conversation_type: 'direct'\n    };\n  } else if (changes) {\n    // Comment, mention, or post interaction\n    const value = changes.value;\n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: changes.field, // 'feed', 'mention', etc.\n      external_conversation_id: value.post_id || value.comment_id,\n      external_message_id: value.comment_id || value.post_id,\n      sender: {\n        id: value.from?.id,\n        name: value.from?.name || 'Facebook User',\n        type: 'customer'\n      },\n      message: {\n        text: value.message || value.story || '',\n        created_time: value.created_time,\n        parent_id: value.parent_id\n      },\n      conversation_type: changes.field === 'mention' ? 'mention' : 'comment'\n    };\n  }\n  \n  // Add metadata\n  normalizedMessage.raw_webhook_data = webhookData;\n  normalizedMessage.processing_timestamp = new Date().toISOString();\n  normalizedMessage.requires_response = true;\n  \n  return [{ json: normalizedMessage }];\n  \n} catch (error) {\n  console.error('Facebook processing error:', error);\n  return [{\n    json: {\n      platform: 'facebook',\n      error: true,\n      error_message: error.message,\n      raw_data: webhookData,\n      timestamp: new Date().toISOString()\n    }\n  }];\n}"
      },
      "name": "Process Facebook Message",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 200],
      "id": "facebook-processor-001"
    },
    {
      "parameters": {
        "functionCode": "// Instagram Message Processing\nconst webhookData = items[0].json;\n\ntry {\n  const entry = webhookData.entry?.[0];\n  const messaging = entry?.messaging?.[0];\n  const changes = entry?.changes?.[0];\n  \n  let normalizedMessage = {\n    platform: 'instagram',\n    webhook_type: webhookData.object,\n    timestamp: new Date().toISOString()\n  };\n  \n  if (messaging) {\n    // Instagram Direct Message\n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: 'direct_message',\n      external_conversation_id: messaging.sender.id + '_' + messaging.recipient.id,\n      external_message_id: messaging.message?.mid,\n      sender: {\n        id: messaging.sender.id,\n        name: 'Instagram User',\n        type: 'customer'\n      },\n      recipient: {\n        id: messaging.recipient.id\n      },\n      message: {\n        text: messaging.message?.text || '',\n        attachments: messaging.message?.attachments || [],\n        story_mention: messaging.message?.story_mention,\n        timestamp: messaging.timestamp\n      },\n      conversation_type: 'direct'\n    };\n  } else if (changes) {\n    // Comment or mention\n    const value = changes.value;\n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: changes.field,\n      external_conversation_id: value.media_id || value.comment_id,\n      external_message_id: value.comment_id || value.id,\n      sender: {\n        id: value.from?.id,\n        name: value.from?.username || 'Instagram User',\n        type: 'customer'\n      },\n      message: {\n        text: value.text || '',\n        media_type: value.media_type,\n        media_url: value.media_url,\n        timestamp: value.timestamp\n      },\n      conversation_type: changes.field === 'story_mentions' ? 'mention' : 'comment'\n    };\n  }\n  \n  normalizedMessage.raw_webhook_data = webhookData;\n  normalizedMessage.processing_timestamp = new Date().toISOString();\n  normalizedMessage.requires_response = true;\n  \n  return [{ json: normalizedMessage }];\n  \n} catch (error) {\n  console.error('Instagram processing error:', error);\n  return [{\n    json: {\n      platform: 'instagram',\n      error: true,\n      error_message: error.message,\n      raw_data: webhookData,\n      timestamp: new Date().toISOString()\n    }\n  }];\n}"
      },
      "name": "Process Instagram Message", 
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 300],
      "id": "instagram-processor-001"
    },
    {
      "parameters": {
        "functionCode": "// Twitter Message Processing\nconst webhookData = items[0].json;\n\ntry {\n  // Twitter webhook can be DM, mention, or tweet\n  let normalizedMessage = {\n    platform: 'twitter',\n    timestamp: new Date().toISOString()\n  };\n  \n  if (webhookData.direct_message_events) {\n    // Direct Message\n    const dm = webhookData.direct_message_events[0];\n    const user = webhookData.users[dm.message_create.sender_id];\n    \n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: 'direct_message',\n      external_conversation_id: dm.id,\n      external_message_id: dm.id,\n      sender: {\n        id: dm.message_create.sender_id,\n        name: user?.name || user?.screen_name || 'Twitter User',\n        screen_name: user?.screen_name,\n        type: 'customer'\n      },\n      message: {\n        text: dm.message_create.message_data.text,\n        entities: dm.message_create.message_data.entities,\n        attachment: dm.message_create.message_data.attachment,\n        timestamp: dm.created_timestamp\n      },\n      conversation_type: 'direct'\n    };\n  } else if (webhookData.tweet_create_events) {\n    // Mention or Reply\n    const tweet = webhookData.tweet_create_events[0];\n    \n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: 'mention',\n      external_conversation_id: tweet.in_reply_to_status_id_str || tweet.id_str,\n      external_message_id: tweet.id_str,\n      sender: {\n        id: tweet.user.id_str,\n        name: tweet.user.name,\n        screen_name: tweet.user.screen_name,\n        profile_image: tweet.user.profile_image_url_https,\n        type: 'customer'\n      },\n      message: {\n        text: tweet.text,\n        entities: tweet.entities,\n        in_reply_to: tweet.in_reply_to_status_id_str,\n        timestamp: tweet.created_at\n      },\n      conversation_type: tweet.in_reply_to_status_id_str ? 'reply' : 'mention'\n    };\n  }\n  \n  normalizedMessage.raw_webhook_data = webhookData;\n  normalizedMessage.processing_timestamp = new Date().toISOString();\n  normalizedMessage.requires_response = true;\n  \n  return [{ json: normalizedMessage }];\n  \n} catch (error) {\n  console.error('Twitter processing error:', error);\n  return [{\n    json: {\n      platform: 'twitter',\n      error: true,\n      error_message: error.message,\n      raw_data: webhookData,\n      timestamp: new Date().toISOString()\n    }\n  }];\n}"
      },
      "name": "Process Twitter Message",\n      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 400],
      "id": "twitter-processor-001"
    },
    {
      "parameters": {
        "functionCode": "// LinkedIn Message Processing\nconst webhookData = items[0].json;\n\ntry {\n  let normalizedMessage = {\n    platform: 'linkedin',\n    timestamp: new Date().toISOString()\n  };\n  \n  if (webhookData.eventType === 'CONVERSATION_MESSAGE_EVENT') {\n    // LinkedIn messaging\n    const messageEvent = webhookData.eventBody;\n    \n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: 'direct_message',\n      external_conversation_id: messageEvent.conversationId,\n      external_message_id: messageEvent.messageId,\n      sender: {\n        id: messageEvent.from,\n        name: 'LinkedIn User', // Need to fetch from API\n        type: 'customer'\n      },\n      message: {\n        text: messageEvent.messageBody?.text || '',\n        timestamp: messageEvent.createdAt\n      },\n      conversation_type: 'direct'\n    };\n  } else if (webhookData.eventType === 'COMMENT_EVENT') {\n    // LinkedIn comment\n    const commentEvent = webhookData.eventBody;\n    \n    normalizedMessage = {\n      ...normalizedMessage,\n      message_type: 'comment',\n      external_conversation_id: commentEvent.parentCommentId || commentEvent.postId,\n      external_message_id: commentEvent.commentId,\n      sender: {\n        id: commentEvent.author,\n        name: 'LinkedIn User',\n        type: 'customer'\n      },\n      message: {\n        text: commentEvent.text,\n        timestamp: commentEvent.createdAt\n      },\n      conversation_type: 'comment'\n    };\n  }\n  \n  normalizedMessage.raw_webhook_data = webhookData;\n  normalizedMessage.processing_timestamp = new Date().toISOString();\n  normalizedMessage.requires_response = true;\n  \n  return [{ json: normalizedMessage }];\n  \n} catch (error) {\n  console.error('LinkedIn processing error:', error);\n  return [{\n    json: {\n      platform: 'linkedin',\n      error: true,\n      error_message: error.message,\n      raw_data: webhookData,\n      timestamp: new Date().toISOString()\n    }\n  }];\n}"
      },
      "name": "Process LinkedIn Message",
      "type": "n8n-nodes-base.function", 
      "typeVersion": 1,
      "position": [680, 500],
      "id": "linkedin-processor-001"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/messages/ingest",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "httpHeaderAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
        },
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "={{ $json }}",
        "options": {
          "timeout": 30000,
          "retry": {
            "enabled": true,
            "maxTries": 3
          }
        }
      },
      "name": "Send to SocialFlow",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [900, 300],
      "id": "socialflow-sender-001"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.error}}",
              "operation": "equal",
              "value2": "true"
            }
          ]
        }
      },
      "name": "Check for Errors",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1120, 300],
      "id": "error-checker-001"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/messages/error",
        "authentication": "genericCredentialType", 
        "genericAuthType": "httpHeaderAuth",
        "httpHeaderAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
        },
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "={{ $json }}",
        "options": {}
      },
      "name": "Log Error",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1340, 200],
      "id": "error-logger-001"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/messages/success",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth", 
        "httpHeaderAuth": {
          "name": "Authorization",
          "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
        },
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "={{ $json }}",
        "options": {}
      },
      "name": "Log Success",
      "type": "n8n-nodes-base.httpRequest", 
      "typeVersion": 3,
      "position": [1340, 400],
      "id": "success-logger-001"
    }
  ],
  "connections": {
    "Platform Webhook Receiver": {
      "main": [
        [
          {
            "node": "Platform Router",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Platform Router": {
      "main": [
        [
          {
            "node": "Process Facebook Message",
            "type": "main", 
            "index": 0
          }
        ],
        [
          {
            "node": "Process Instagram Message",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Process Twitter Message", 
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Process LinkedIn Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Facebook Message": {
      "main": [
        [
          {
            "node": "Send to SocialFlow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Instagram Message": {
      "main": [
        [
          {
            "node": "Send to SocialFlow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Twitter Message": {
      "main": [
        [
          {
            "node": "Send to SocialFlow",
            "type": "main", 
            "index": 0
          }
        ]
      ]
    },
    "Process LinkedIn Message": {
      "main": [
        [
          {
            "node": "Send to SocialFlow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send to SocialFlow": {
      "main": [
        [
          {
            "node": "Check for Errors",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check for Errors": {
      "main": [
        [
          {
            "node": "Log Error",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Log Success", 
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": ["socialflow", "messaging", "ingestion"],
  "triggerCount": 0,
  "meta": {
    "instanceId": "socialflow-n8n-instance"
  }
}
```

**Expected Output:**
- Standardized message format across all platforms
- Proper error handling and logging
- Conversation threading and deduplication
- Real-time message ingestion
- Webhook URL: `https://your-n8n-domain.com/webhook/socialflow-messages`

**Testing Checklist:**
- [ ] Facebook webhook processing working
- [ ] Instagram webhook processing working  
- [ ] Twitter webhook processing working
- [ ] LinkedIn webhook processing working
- [ ] Error handling and logging functional
- [ ] Message normalization accurate
- [ ] SocialFlow API integration working

---

## 🧪 COMPREHENSIVE TESTING PLAN - Week 1

### **🤖 AI Agent Testing Tasks**

#### **Database Testing:**
```sql
-- Test Scripts for Database Schema
-- File: test-database-schema.sql

-- 1. Test table creation and constraints
INSERT INTO conversations (project_id, platform, participant_name, participant_email) 
VALUES ('test-project-id', 'facebook', 'Test User', 'test@example.com');

-- 2. Test foreign key constraints
INSERT INTO messages (conversation_id, sender_type, content) 
VALUES ('invalid-id', 'customer', 'Test message'); -- Should fail

-- 3. Test RLS policies
SET role authenticated;
SELECT * FROM conversations; -- Should only return user's data

-- 4. Test triggers
INSERT INTO messages (conversation_id, sender_type, content, sent_at)
VALUES ('valid-conversation-id', 'customer', 'Test message', NOW());
-- Check if conversation.last_message_at updated

-- 5. Test performance
EXPLAIN ANALYZE SELECT * FROM conversations WHERE project_id = 'test-id' AND status = 'open';
-- Should use indexes efficiently
```

#### **API Testing:**
```typescript
// File: tests/api/conversations.test.ts
import { describe, test, expect } from '@jest/globals'
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/app/api/conversations/route'

describe('/api/conversations', () => {
  test('GET conversations with pagination', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          url: '/api/conversations?project_id=test-id&page=1&limit=10'
        })
        
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toHaveProperty('conversations')
        expect(data).toHaveProperty('pagination')
        expect(data.conversations).toBeInstanceOf(Array)
        expect(data.pagination.page).toBe(1)
        expect(data.pagination.limit).toBe(10)
      }
    })
  })

  test('POST conversation creation', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const conversationData = {
          platform: 'facebook',
          participant_name: 'Test User',
          participant_email: 'test@example.com',
          project_id: 'test-project-id'
        }

        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(conversationData)
        })
        
        expect(res.status).toBe(201)
        const data = await res.json()
        expect(data.conversation).toHaveProperty('id')
        expect(data.conversation.platform).toBe('facebook')
      }
    })
  })

  test('Validation errors', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const invalidData = {
          platform: 'invalid-platform',
          participant_name: ''
        }

        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidData)
        })
        
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Validation failed')
      }
    })
  })
})
```

#### **Service Layer Testing:**
```typescript
// File: tests/services/conversation.test.ts
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { conversationService } from '@/lib/inbox/conversation-service'

describe('ConversationService', () => {
  let testProjectId: string
  let testConversationId: string

  beforeEach(async () => {
    // Setup test data
    testProjectId = 'test-project-' + Date.now()
    // Create test conversation
  })

  afterEach(async () => {
    // Cleanup test data
  })

  test('getConversations with filters', async () => {
    const result = await conversationService.getConversations(
      testProjectId,
      { status: 'open', platform: 'facebook' },
      1,
      10
    )

    expect(result).toHaveProperty('conversations')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('hasMore')
    expect(result.conversations).toBeInstanceOf(Array)
  })

  test('createMessage in conversation', async () => {
    const messageData = {
      content: 'Test message content',
      sender_type: 'customer' as const,
      sender_name: 'Test User'
    }

    const message = await conversationService.createMessage(testConversationId, messageData)
    
    expect(message).toHaveProperty('id')
    expect(message.content).toBe(messageData.content)
    expect(message.sender_type).toBe(messageData.sender_type)
  })

  test('conversation analytics', async () => {
    const analytics = await conversationService.getConversationAnalytics(testProjectId)
    
    expect(analytics).toHaveProperty('total')
    expect(analytics).toHaveProperty('byStatus')
    expect(analytics).toHaveProperty('byPlatform')
    expect(analytics).toHaveProperty('avgResponseTime')
    expect(analytics).toHaveProperty('avgSatisfaction')
  })
})
```

### **👨‍💻 Developer Testing Tasks**

#### **n8n Workflow Testing:**
```bash
#!/bin/bash
# File: test-n8n-workflows.sh

echo "🧪 Testing n8n Workflows..."

# Test webhook endpoint
echo "Testing webhook endpoint..."
curl -X POST https://your-n8n-domain.com/webhook/socialflow-messages \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "facebook",
    "entry": [{
      "messaging": [{
        "sender": {"id": "123"},
        "recipient": {"id": "456"},
        "message": {
          "mid": "msg_123",
          "text": "Hello from Facebook"
        },
        "timestamp": 1234567890
      }]
    }]
  }'

# Test AI model availability
echo "Testing AI models..."
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Test prompt",
    "stream": false
  }'

# Test workflow execution
echo "Testing workflow execution via n8n API..."
curl -X POST https://your-n8n-domain.com/api/v1/workflows/run \
  -H "Authorization: Bearer YOUR_N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "socialflow-message-ingestion"
  }'

echo "✅ Workflow testing completed!"
```

#### **Integration Testing:**
```typescript
// File: tests/integration/n8n-integration.test.ts
import { describe, test, expect } from '@jest/globals'

describe('n8n Integration Tests', () => {
  test('message ingestion workflow', async () => {
    // Send test message to n8n webhook
    const webhookUrl = 'https://your-n8n-domain.com/webhook/socialflow-messages'
    const testMessage = {
      platform: 'facebook',
      entry: [{
        messaging: [{
          sender: { id: 'test-sender' },
          recipient: { id: 'test-recipient' },
          message: {
            mid: 'test-message-id',
            text: 'Test integration message'
          },
          timestamp: Date.now()
        }]
      }]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    })

    expect(response.ok).toBe(true)

    // Verify message was processed and sent to SocialFlow
    // Check database for the processed message
    // This requires waiting for async processing
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Query SocialFlow API to verify message was ingested
    const conversationsResponse = await fetch('/api/conversations?project_id=test-project')
    const conversationsData = await conversationsResponse.json()
    
    expect(conversationsData.conversations).toContainEqual(
      expect.objectContaining({
        platform: 'facebook',
        last_message_preview: expect.stringContaining('Test integration message')
      })
    )
  })

  test('AI content generation workflow', async () => {
    const contentRequest = {
      topic: 'Test content generation',
      platform: 'facebook',
      tone: 'professional',
      industry: 'technology'
    }

    const response = await fetch('https://your-n8n-domain.com/webhook/socialflow-ai-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentRequest)
    })

    expect(response.ok).toBe(true)

    // Wait for AI processing
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Check if generated content was returned
    // This would typically be verified through a callback or polling
  })
})
```

---

## 📊 WEEK 1 EXPECTED OUTPUTS & DELIVERABLES

### **🤖 AI Agent Deliverables**

1. **Complete Database Schema** (`schema.sql`)
   - 7 main tables with proper relationships
   - RLS policies implemented
   - Triggers and functions created
   - Initial data seeded
   - Performance indexes applied

2. **Inbox Management API** (`/api/conversations/*`)
   - 8 API endpoints fully implemented
   - Zod validation schemas
   - Comprehensive error handling
   - Pagination and filtering
   - Real-time capabilities

3. **Service Layer** (`/lib/inbox/conversation-service.ts`)
   - Type-safe conversation management
   - Advanced search and analytics
   - Optimized database queries
   - Error handling and logging

4. **Test Suite** (`/tests/*`)
   - Unit tests for all services
   - API endpoint tests
   - Integration tests
   - Database schema tests
   - 90%+ code coverage

### **👨‍💻 Developer Deliverables**

1. **n8n Infrastructure**
   - Docker-compose setup with SSL
   - PostgreSQL database configured
   - Ollama AI models installed
   - Nginx reverse proxy
   - Auto-restart and monitoring

2. **Message Ingestion Workflow**
   - Complete n8n workflow JSON
   - Multi-platform message processing
   - Error handling and logging
   - Webhook endpoints secured
   - Real-time message normalization

3. **Testing Scripts**
   - Workflow testing automation
   - Integration test suite  
   - Performance monitoring
   - Error alerting system

### **🔗 Integration Points**

1. **Webhook Communication**
   - SocialFlow → n8n webhooks secured
   - n8n → SocialFlow API endpoints
   - Real-time data synchronization
   - Error handling and retries

2. **Authentication & Security**
   - JWT tokens for API access
   - Webhook signature verification
   - RLS policies enforced
   - SSL/TLS everywhere

3. **Monitoring & Logging**
   - Comprehensive error logging
   - Performance metrics collection
   - Real-time status monitoring
   - Automated alerting system

---

## 💰 COST ANALYSIS - Week 1

### **Actual Costs**
- **VPS Hosting**: $10-20/month (n8n instance)
- **Domain Registration**: $10/year (optional)
- **SSL Certificates**: FREE (Let's Encrypt)
- **Total Week 1**: $10-20/month

### **Free Services Used**
- **Supabase**: Free tier (500MB database)
- **Vercel/Netlify**: Free hosting for SocialFlow
- **Social Media APIs**: All free tiers
- **AI Models**: Free via Ollama
- **Email**: Free SMTP (Gmail)
- **CDN**: Cloudflare free tier

### **Savings Compared to Paid Solutions**
- **Database**: $200/month saved (vs managed PostgreSQL)
- **AI Services**: $500/month saved (vs OpenAI/Claude APIs)
- **Email Services**: $100/month saved (vs SendGrid)
- **Social Media APIs**: $300/month saved (vs paid services)
- **Total Savings**: $1,100/month

---

# 🚀 Week 2: Core Features Implementation
**Focus**: Inbox UI + Enhanced Scheduling System + Social Media Posting Workflows

## 📋 Week 2 Task Breakdown

### **🤖 Claude AI Tasks - Week 2**

#### **Task 2.1-AI: Inbox UI Development**
**Estimated Time**: 8 hours  
**Priority**: Critical  
**Dependencies**: Week 1 database schema

**Complete Implementation:**
```typescript
// src/components/inbox/inbox-layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Archive, Star, Reply } from 'lucide-react';

interface Conversation {
  id: string;
  platform: string;
  platform_user_id: string;
  platform_username: string;
  platform_user_avatar?: string;
  last_message_at: string;
  unread_count: number;
  is_archived: boolean;
  is_priority: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  conversation_id: string;
  platform_message_id: string;
  content: string;
  message_type: 'incoming' | 'outgoing';
  sent_at: string;
  is_read: boolean;
  sender_name?: string;
  metadata: any;
}

export function InboxLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'priority'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadConversations();
    setupRealtimeSubscription();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            message_type,
            sent_at,
            is_read,
            sender_name,
            metadata
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('inbox_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        () => loadConversations()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => loadConversations()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.platform_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterStatus === 'unread') return matchesSearch && conv.unread_count > 0;
    if (filterStatus === 'priority') return matchesSearch && conv.is_priority;
    return matchesSearch;
  });

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      loadConversations();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading conversations...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-4">
            <h1 className="text-xl font-semibold">Inbox</h1>
            <Badge variant="secondary">{conversations.length}</Badge>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2">
            {(['all', 'unread', 'priority'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedConversation(conversation);
                if (conversation.unread_count > 0) {
                  markAsRead(conversation.id);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.platform_user_avatar} />
                  <AvatarFallback>
                    {conversation.platform_username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.platform_username}
                    </p>
                    <div className="flex items-center space-x-1">
                      {conversation.is_priority && (
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {conversation.platform}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.messages[0]?.content || 'No messages'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </p>
                    {conversation.unread_count > 0 && (
                      <Badge className="h-5 w-5 p-0 text-xs rounded-full">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.platform_user_avatar} />
                  <AvatarFallback>
                    {selectedConversation.platform_username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{selectedConversation.platform_username}</h2>
                  <p className="text-sm text-gray-500">{selectedConversation.platform}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages
                  .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
                  .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.message_type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.message_type === 'outgoing'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.message_type === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.sent_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input placeholder="Type your reply..." className="flex-1" />
                <Button>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
```

**Testing Commands:**
```bash
# Install required dependencies
npm install react-big-calendar moment @types/react-big-calendar

# Run component tests
npm test -- --testPathPattern=inbox-layout.test.tsx

# Test real-time functionality
npm run dev
# Open browser and test message updates
```

**Expected Output:**
- Fully functional inbox interface with real-time updates
- Message filtering and search capabilities
- Conversation management with read/unread states
- Platform-specific message handling
- Responsive design for all screen sizes

#### **Task 2.2-AI: Enhanced Content Scheduler API**
**Estimated Time**: 6 hours  
**Priority**: High  
**Dependencies**: Content table from Week 1

**Complete API Implementation:**
```typescript
// src/app/api/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');

    let query = supabase
      .from('scheduled_posts')
      .select(`
        *,
        content (
          id,
          text,
          media_urls,
          hashtags,
          content_type
        )
      `);

    if (startDate && endDate) {
      query = query
        .gte('scheduled_for', startDate)
        .lte('scheduled_for', endDate);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('scheduled_for', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { content, platforms, scheduled_for, user_id } = body;

    // Validate required fields
    if (!content?.text || !platforms?.length || !scheduled_for) {
      return NextResponse.json(
        { error: 'Missing required fields: content.text, platforms, scheduled_for' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(scheduled_for);
    if (scheduledTime <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Create content record
    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .insert({
        text: content.text,
        media_urls: content.media_urls || [],
        hashtags: content.hashtags || [],
        content_type: content.content_type || 'text',
        status: 'scheduled',
        user_id
      })
      .select()
      .single();

    if (contentError) {
      console.error('Content creation error:', contentError);
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    }

    // Create scheduled post record
    const { data: scheduledData, error: scheduledError } = await supabase
      .from('scheduled_posts')
      .insert({
        content_id: contentData.id,
        platforms: platforms,
        scheduled_for: scheduled_for,
        status: 'scheduled',
        user_id
      })
      .select()
      .single();

    if (scheduledError) {
      console.error('Scheduled post creation error:', scheduledError);
      // Cleanup: delete the content record
      await supabase.from('content').delete().eq('id', contentData.id);
      
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      );
    }

    // Trigger n8n workflow for scheduling
    try {
      const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/social-posting/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
        },
        body: JSON.stringify({
          post_id: scheduledData.id,
          content: {
            text: content.text,
            media_urls: content.media_urls || [],
            hashtags: content.hashtags || [],
            content_type: content.content_type || 'text'
          },
          platforms: platforms,
          scheduled_for: scheduled_for
        })
      });

      if (!n8nResponse.ok) {
        console.error('n8n webhook failed:', await n8nResponse.text());
        // Don't fail the API call, just log the error
      }
    } catch (n8nError) {
      console.error('n8n webhook error:', n8nError);
      // Don't fail the API call, just log the error
    }

    return NextResponse.json({
      success: true,
      data: {
        ...scheduledData,
        content: contentData
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// src/app/api/schedule/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { id } = params;

    const { content, platforms, scheduled_for, status } = body;

    // Update scheduled post
    const updates: any = {};
    if (platforms) updates.platforms = platforms;
    if (scheduled_for) updates.scheduled_for = scheduled_for;
    if (status) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('scheduled_posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        content (*)
      `)
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update scheduled post' },
        { status: 500 }
      );
    }

    // Update content if provided
    if (content && data.content) {
      const contentUpdates: any = {};
      if (content.text) contentUpdates.text = content.text;
      if (content.media_urls) contentUpdates.media_urls = content.media_urls;
      if (content.hashtags) contentUpdates.hashtags = content.hashtags;
      if (content.content_type) contentUpdates.content_type = content.content_type;
      contentUpdates.updated_at = new Date().toISOString();

      await supabase
        .from('content')
        .update(contentUpdates)
        .eq('id', data.content.id);
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get scheduled post first
    const { data: scheduledPost, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('content_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !scheduledPost) {
      return NextResponse.json(
        { error: 'Scheduled post not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of scheduled posts (not published ones)
    if (scheduledPost.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Can only delete scheduled posts' },
        { status: 400 }
      );
    }

    // Delete scheduled post
    const { error: deleteError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete scheduled post' },
        { status: 500 }
      );
    }

    // Delete associated content
    await supabase
      .from('content')
      .delete()
      .eq('id', scheduledPost.content_id);

    return NextResponse.json({
      success: true,
      message: 'Scheduled post deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Testing Commands:**
```bash
# Test scheduling API
curl -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "Test scheduled post",
      "content_type": "text",
      "hashtags": ["#test"]
    },
    "platforms": ["facebook", "twitter"],
    "scheduled_for": "2024-01-20T15:00:00Z"
  }'

# Test getting scheduled posts
curl http://localhost:3000/api/schedule?status=scheduled

# Test updating scheduled post
curl -X PUT http://localhost:3000/api/schedule/POST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "Updated post content"
    }
  }'

# Test deleting scheduled post
curl -X DELETE http://localhost:3000/api/schedule/POST_ID
```

### **👨‍💻 Yousef Tasks - Week 2**

#### **Task 2.1-DEV: Social Media Posting n8n Workflows**
**Estimated Time**: 12 hours  
**Priority**: Critical  
**Dependencies**: n8n setup from Week 1

**Complete n8n Workflow JSON:**
```json
{
  "name": "Social Media Content Posting v2.0",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "/social-posting/schedule",
        "responseMode": "onReceived",
        "authentication": "headerAuth"
      },
      "id": "webhook-trigger",
      "name": "Schedule Post Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "webhook-auth",
          "name": "SocialFlow Webhook Auth"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "// Extract and validate posting data\nconst postData = items[0].json;\n\n// Validate required fields\nif (!postData.post_id || !postData.content || !postData.platforms || !postData.scheduled_for) {\n  throw new Error('Missing required fields: post_id, content, platforms, scheduled_for');\n}\n\n// Calculate delay until scheduled time\nconst scheduledTime = new Date(postData.scheduled_for);\nconst now = new Date();\nconst delayMs = scheduledTime.getTime() - now.getTime();\n\nreturn [\n  {\n    json: {\n      post_id: postData.post_id,\n      content: {\n        text: postData.content.text,\n        media_urls: postData.content.media_urls || [],\n        hashtags: postData.content.hashtags || [],\n        content_type: postData.content.content_type || 'text'\n      },\n      platforms: postData.platforms,\n      scheduled_for: postData.scheduled_for,\n      delay_ms: Math.max(0, delayMs),\n      should_post_now: delayMs <= 60000, // Post if within 1 minute\n      timestamp: new Date().toISOString(),\n      formatted_content: {}\n    }\n  }\n];"
      },
      "id": "data-processor",
      "name": "Process Post Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.should_post_now}}",
              "operation": "equal",
              "value2": true
            }
          ]
        }
      },
      "id": "timing-check",
      "name": "Check If Ready to Post",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "amount": "={{Math.ceil($json.delay_ms / 1000)}}",
        "unit": "seconds"
      },
      "id": "wait-node",
      "name": "Wait Until Scheduled Time",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [680, 480]
    },
    {
      "parameters": {
        "functionCode": "// Format content for each platform\nconst data = items[0].json;\nconst content = data.content;\nconst platforms = data.platforms;\n\nconst platformContent = {};\n\nfor (const platform of platforms) {\n  switch (platform.toLowerCase()) {\n    case 'facebook':\n      platformContent[platform] = {\n        message: content.text,\n        link: content.link || '',\n        picture: content.media_urls[0] || ''\n      };\n      break;\n      \n    case 'instagram':\n      platformContent[platform] = {\n        caption: content.text + '\\n\\n' + (content.hashtags?.join(' ') || ''),\n        image_url: content.media_urls[0] || '',\n        media_type: content.content_type === 'video' ? 'VIDEO' : 'IMAGE'\n      };\n      break;\n      \n    case 'twitter':\n      let tweetText = content.text;\n      if (content.hashtags?.length) {\n        const hashtagText = content.hashtags.join(' ');\n        if ((tweetText + ' ' + hashtagText).length <= 280) {\n          tweetText += ' ' + hashtagText;\n        }\n      }\n      platformContent[platform] = {\n        text: tweetText.substring(0, 280),\n        media_ids: content.media_urls || []\n      };\n      break;\n      \n    case 'linkedin':\n      platformContent[platform] = {\n        text: content.text,\n        visibility: 'PUBLIC',\n        content_entities: content.media_urls?.length ? [{\n          entity: content.media_urls[0],\n          entityLocation: content.media_urls[0]\n        }] : []\n      };\n      break;\n  }\n}\n\nreturn [\n  {\n    json: {\n      ...data,\n      formatted_content: platformContent\n    }\n  }\n];"
      },
      "id": "content-formatter",
      "name": "Format Content for Platforms",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.platforms}}",
              "operation": "contains",
              "value2": "facebook"
            }
          ]
        }
      },
      "id": "facebook-check",
      "name": "Facebook Platform Check",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1120, 200]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.platforms}}",
              "operation": "contains",
              "value2": "instagram"
            }
          ]
        }
      },
      "id": "instagram-check", 
      "name": "Instagram Platform Check",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.platforms}}",
              "operation": "contains",
              "value2": "twitter"
            }
          ]
        }
      },
      "id": "twitter-check",
      "name": "Twitter Platform Check", 
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1120, 400]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.platforms}}",
              "operation": "contains", 
              "value2": "linkedin"
            }
          ]
        }
      },
      "id": "linkedin-check",
      "name": "LinkedIn Platform Check",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1120, 500]
    },
    {
      "parameters": {
        "resource": "post",
        "operation": "create",
        "pageId": "={{$env.FACEBOOK_PAGE_ID}}",
        "message": "={{$json.formatted_content.facebook.message}}",
        "additionalFields": {
          "link": "={{$json.formatted_content.facebook.link}}",
          "picture": "={{$json.formatted_content.facebook.picture}}"
        }
      },
      "id": "facebook-post",
      "name": "Post to Facebook",
      "type": "n8n-nodes-base.facebookGraphApi",
      "typeVersion": 1,
      "position": [1340, 140],
      "credentials": {
        "facebookGraphApi": {
          "id": "facebook-credentials",
          "name": "Facebook Business Account"
        }
      }
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "caption": "={{$json.formatted_content.instagram.caption}}",
        "mediaUrl": "={{$json.formatted_content.instagram.image_url}}",
        "additionalFields": {
          "mediaType": "={{$json.formatted_content.instagram.media_type}}"
        }
      },
      "id": "instagram-post",
      "name": "Post to Instagram",
      "type": "n8n-nodes-base.instagram",
      "typeVersion": 1,
      "position": [1340, 240],
      "credentials": {
        "instagramOAuth2Api": {
          "id": "instagram-credentials",
          "name": "Instagram Business Account"
        }
      }
    },
    {
      "parameters": {
        "resource": "tweet",
        "operation": "create",
        "text": "={{$json.formatted_content.twitter.text}}",
        "additionalFields": {
          "media_ids": "={{$json.formatted_content.twitter.media_ids}}"
        }
      },
      "id": "twitter-post", 
      "name": "Post to Twitter",
      "type": "n8n-nodes-base.twitter",
      "typeVersion": 2,
      "position": [1340, 340],
      "credentials": {
        "twitterOAuth2Api": {
          "id": "twitter-credentials",
          "name": "Twitter Developer Account"
        }
      }
    },
    {
      "parameters": {
        "resource": "post",
        "operation": "create",
        "text": "={{$json.formatted_content.linkedin.text}}",
        "additionalFields": {
          "visibility": "={{$json.formatted_content.linkedin.visibility}}"
        }
      },
      "id": "linkedin-post",
      "name": "Post to LinkedIn",
      "type": "n8n-nodes-base.linkedIn",
      "typeVersion": 1,
      "position": [1340, 440],
      "credentials": {
        "linkedInOAuth2Api": {
          "id": "linkedin-credentials", 
          "name": "LinkedIn Company Page"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "// Aggregate all posting results\nconst results = [];\nconst originalData = $('Format Content for Platforms').first().json;\nconst errors = [];\n\n// Process each platform result\nconst platforms = originalData.platforms;\n\nfor (const platform of platforms) {\n  let result = {\n    platform: platform,\n    success: false,\n    post_id: null,\n    platform_url: null,\n    error: null,\n    posted_at: new Date().toISOString()\n  };\n  \n  try {\n    switch (platform.toLowerCase()) {\n      case 'facebook':\n        const fbResult = $('Post to Facebook').first();\n        if (fbResult?.json?.id) {\n          result.success = true;\n          result.post_id = fbResult.json.id;\n          result.platform_url = `https://facebook.com/${fbResult.json.id}`;\n        } else if (fbResult?.error) {\n          result.error = fbResult.error.message || 'Facebook posting failed';\n        }\n        break;\n        \n      case 'instagram':\n        const igResult = $('Post to Instagram').first();\n        if (igResult?.json?.id) {\n          result.success = true;\n          result.post_id = igResult.json.id;\n          result.platform_url = `https://instagram.com/p/${igResult.json.shortcode || ''}`;\n        } else if (igResult?.error) {\n          result.error = igResult.error.message || 'Instagram posting failed';\n        }\n        break;\n        \n      case 'twitter':\n        const twitterResult = $('Post to Twitter').first();\n        if (twitterResult?.json?.data?.id) {\n          result.success = true;\n          result.post_id = twitterResult.json.data.id;\n          result.platform_url = `https://twitter.com/user/status/${twitterResult.json.data.id}`;\n        } else if (twitterResult?.error) {\n          result.error = twitterResult.error.message || 'Twitter posting failed';\n        }\n        break;\n        \n      case 'linkedin':\n        const linkedinResult = $('Post to LinkedIn').first();\n        if (linkedinResult?.json?.id) {\n          result.success = true;\n          result.post_id = linkedinResult.json.id;\n          result.platform_url = linkedinResult.json.permalink || null;\n        } else if (linkedinResult?.error) {\n          result.error = linkedinResult.error.message || 'LinkedIn posting failed';\n        }\n        break;\n    }\n  } catch (error) {\n    result.error = error.message || `Error processing ${platform} result`;\n  }\n  \n  results.push(result);\n  \n  if (!result.success) {\n    errors.push(`${platform}: ${result.error}`);\n  }\n}\n\nconst overallSuccess = results.every(r => r.success);\nconst successCount = results.filter(r => r.success).length;\n\nreturn [\n  {\n    json: {\n      original_post_id: originalData.post_id,\n      platforms_results: results,\n      overall_success: overallSuccess,\n      success_count: successCount,\n      total_platforms: platforms.length,\n      errors: errors,\n      completion_time: new Date().toISOString(),\n      execution_id: $execution.id\n    }\n  }\n];"
      },
      "id": "result-aggregator",
      "name": "Aggregate Results",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1560, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/social-posting/result",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization", 
              "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "jsonBody": "={{ JSON.stringify($json) }}"
      },
      "id": "result-webhook",
      "name": "Send Results to SocialFlow",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1780, 300]
    },
    {
      "parameters": {
        "mode": "schedule",
        "hour": "*",
        "minute": "*/5"
      },
      "id": "schedule-trigger",
      "name": "Check Scheduled Posts",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [240, 600]
    },
    {
      "parameters": {
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/social-posting/check-scheduled",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
            }
          ]
        }
      },
      "id": "check-scheduled",
      "name": "Get Scheduled Posts",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [460, 600]
    },
    {
      "parameters": {
        "functionCode": "// Process scheduled posts that are ready to publish\nconst response = items[0].json;\nconst scheduledPosts = response.posts || [];\nconst now = new Date();\nconst readyPosts = [];\n\nfor (const post of scheduledPosts) {\n  const scheduledTime = new Date(post.scheduled_for);\n  const timeDiff = scheduledTime.getTime() - now.getTime();\n  \n  // Post if scheduled time has passed or is within 5 minutes\n  if (timeDiff <= 300000 && post.status === 'scheduled') {\n    readyPosts.push({\n      json: {\n        post_id: post.id,\n        content: post.content,\n        platforms: post.platforms,\n        scheduled_for: post.scheduled_for,\n        should_post_now: true\n      }\n    });\n  }\n}\n\nreturn readyPosts;"
      },
      "id": "scheduled-processor",
      "name": "Process Ready Posts",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 600]
    }
  ],
  "connections": {
    "Schedule Post Webhook": {
      "main": [
        [
          {
            "node": "Process Post Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Post Data": {
      "main": [
        [
          {
            "node": "Check If Ready to Post",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check If Ready to Post": {
      "main": [
        [
          {
            "node": "Format Content for Platforms",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Wait Until Scheduled Time",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait Until Scheduled Time": {
      "main": [
        [
          {
            "node": "Format Content for Platforms",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Format Content for Platforms": {
      "main": [
        [
          {
            "node": "Facebook Platform Check",
            "type": "main",
            "index": 0
          },
          {
            "node": "Instagram Platform Check", 
            "type": "main",
            "index": 0
          },
          {
            "node": "Twitter Platform Check",
            "type": "main",
            "index": 0
          },
          {
            "node": "LinkedIn Platform Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Facebook Platform Check": {
      "main": [
        [
          {
            "node": "Post to Facebook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Instagram Platform Check": {
      "main": [
        [
          {
            "node": "Post to Instagram",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Twitter Platform Check": {
      "main": [
        [
          {
            "node": "Post to Twitter",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "LinkedIn Platform Check": {
      "main": [
        [
          {
            "node": "Post to LinkedIn",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Post to Facebook": {
      "main": [
        [
          {
            "node": "Aggregate Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Post to Instagram": {
      "main": [
        [
          {
            "node": "Aggregate Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Post to Twitter": {
      "main": [
        [
          {
            "node": "Aggregate Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Post to LinkedIn": {
      "main": [
        [
          {
            "node": "Aggregate Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aggregate Results": {
      "main": [
        [
          {
            "node": "Send Results to SocialFlow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Scheduled Posts": {
      "main": [
        [
          {
            "node": "Get Scheduled Posts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Scheduled Posts": {
      "main": [
        [
          {
            "node": "Process Ready Posts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Ready Posts": {
      "main": [
        [
          {
            "node": "Process Post Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "saveDataSuccessExecution": "all",
    "saveDataErrorExecution": "all",
    "saveDataProgressExecution": true
  },
  "staticData": {},
  "tags": ["social-media", "posting", "automation"]
}
```

**Testing Commands:**
```bash
# Test the complete workflow
curl -X POST http://your-n8n-domain.com/webhook/social-posting/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_webhook_secret" \
  -d '{
    "post_id": "test_123",
    "content": {
      "text": "Test post from n8n workflow! 🚀",
      "hashtags": ["#automation", "#socialmedia"],
      "content_type": "text"
    },
    "platforms": ["facebook", "twitter"],
    "scheduled_for": "2024-01-20T15:00:00Z"
  }'

# Check workflow execution status
curl http://your-n8n-domain.com/api/v1/executions \
  -H "Authorization: Bearer your_api_key"

# Test scheduled posts check
curl http://your-n8n-domain.com/webhook/check-scheduled \
  -H "Authorization: Bearer your_webhook_secret"
```

**Expected Output:**
- Automated posting to all selected platforms
- Real-time status updates sent back to SocialFlow
- Error handling and retry mechanisms
- Platform-specific content formatting
- Scheduled post monitoring every 5 minutes
- Comprehensive logging and execution tracking

## 📋 Week 2 Testing Plans

### **🧪 Comprehensive Testing Suite**

#### **Test 2.1: Inbox Integration Testing**
```typescript
// tests/integration/inbox-realtime.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { InboxLayout } from '@/components/inbox/inbox-layout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

describe('Inbox Real-time Integration', () => {
  test('processes incoming messages from n8n', async () => {
    // Mock incoming message from n8n webhook
    const mockMessage = {
      platform: 'facebook',
      platform_user_id: 'fb_user_123',
      platform_username: 'john_doe',
      content: 'New customer inquiry from Facebook',
      message_type: 'incoming',
      platform_message_id: 'fb_msg_456'
    };

    // Simulate n8n webhook call
    const response = await fetch('/api/n8n/messages/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockMessage)
    });

    expect(response.ok).toBe(true);

    // Verify message appears in inbox
    render(<InboxLayout />);
    
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.getByText('New customer inquiry from Facebook')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});

// Test command: npm test -- --testNamePattern="Inbox Real-time"
```

#### **Test 2.2: Scheduler API Testing**
```bash
#!/bin/bash
# tests/api/scheduler-api-test.sh

echo "🧪 Testing Content Scheduler API"

# Test 1: Create scheduled post
echo "Test 1: Creating scheduled post..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "Automated test post via API",
      "content_type": "text",
      "hashtags": ["#test", "#api"]
    },
    "platforms": ["facebook", "twitter"],
    "scheduled_for": "'$(date -d '+1 hour' -Iseconds)'"
  }')

POST_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')

if [[ $POST_ID != "null" && $POST_ID != "" ]]; then
  echo "✅ Created scheduled post: $POST_ID"
else
  echo "❌ Failed to create scheduled post"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

# Test 2: Get scheduled posts
echo "Test 2: Fetching scheduled posts..."
GET_RESPONSE=$(curl -s http://localhost:3000/api/schedule?status=scheduled)
COUNT=$(echo $GET_RESPONSE | jq -r '.count')

if [[ $COUNT -gt 0 ]]; then
  echo "✅ Retrieved $COUNT scheduled posts"
else
  echo "❌ No scheduled posts found"
fi

# Test 3: Update scheduled post
echo "Test 3: Updating scheduled post..."
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3000/api/schedule/$POST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "Updated test post content"
    }
  }')

if [[ $UPDATE_RESPONSE == *"success"* ]]; then
  echo "✅ Successfully updated scheduled post"
else
  echo "❌ Failed to update scheduled post"
fi

# Test 4: Delete scheduled post
echo "Test 4: Deleting scheduled post..."
DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:3000/api/schedule/$POST_ID)

if [[ $DELETE_RESPONSE == *"success"* ]]; then
  echo "✅ Successfully deleted scheduled post"
else
  echo "❌ Failed to delete scheduled post"
fi

echo "🧪 Scheduler API tests completed"
```

#### **Test 2.3: End-to-End Workflow Testing**
```bash
#!/bin/bash
# tests/e2e/week2-workflow-test.sh

echo "🧪 End-to-End Week 2 Workflow Testing"

# Test 1: Complete scheduling flow
echo "Test 1: Complete scheduling workflow..."

# Create post via SocialFlow API
SCHEDULED_POST=$(curl -s -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "text": "E2E test: This post should appear on social media! 🚀",
      "hashtags": ["#e2etest", "#automation"],
      "content_type": "text"
    },
    "platforms": ["facebook", "twitter"],
    "scheduled_for": "'$(date -d '+2 minutes' -Iseconds)'"
  }')

POST_ID=$(echo $SCHEDULED_POST | jq -r '.data.id')
echo "Created scheduled post: $POST_ID"

# Wait for n8n to process
echo "Waiting for n8n workflow to process..."
sleep 150

# Check if post was published
RESULT_CHECK=$(curl -s http://localhost:3000/api/schedule/$POST_ID)
STATUS=$(echo $RESULT_CHECK | jq -r '.data.status')

if [[ $STATUS == "published" ]]; then
  echo "✅ Post successfully published via n8n"
else
  echo "❌ Post was not published. Status: $STATUS"
fi

# Test 2: Inbox message processing
echo "Test 2: Testing inbox message processing..."

# Simulate incoming message via n8n
INBOX_MESSAGE=$(curl -s -X POST http://localhost:3000/api/n8n/messages/receive \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $N8N_WEBHOOK_SECRET" \
  -d '{
    "platform": "facebook",
    "platform_user_id": "test_user_123",
    "platform_username": "e2e_tester",
    "content": "This is an E2E test message",
    "message_type": "incoming",
    "platform_message_id": "test_msg_' $(date +%s) '"
  }')

if [[ $INBOX_MESSAGE == *"success"* ]]; then
  echo "✅ Message successfully processed into inbox"
else
  echo "❌ Message processing failed"
fi

# Test 3: Real-time updates
echo "Test 3: Testing real-time updates..."
echo "✅ Real-time functionality requires manual browser testing"

echo "🧪 E2E Week 2 tests completed"
```

## 📊 Week 2 Performance Metrics

### **📈 Expected Performance Benchmarks**
- **Inbox Load Time**: < 2 seconds for 100 conversations
- **Message Processing**: < 500ms per message
- **Scheduling API Response**: < 300ms for create/update operations
- **n8n Workflow Execution**: < 30 seconds for multi-platform posting
- **Real-time Updates**: < 1 second message propagation

### **📱 Browser Compatibility Testing**
```bash
# Cross-browser testing checklist
echo "Cross-browser testing:"
echo "[ ] Chrome 120+ - Inbox UI and real-time updates"
echo "[ ] Firefox 121+ - Scheduling calendar interface"  
echo "[ ] Safari 17+ - Mobile responsive design"
echo "[ ] Edge 120+ - All functionality"
```

## 💰 Week 2 Cost Analysis

**Week 2 Total Infrastructure Cost: $10-20/month**
- n8n hosting: $10-20/month
- All other services: FREE

**Savings vs Paid Solutions:**
- Social media management tools: $299/month saved
- Real-time messaging platform: $200/month saved
- Scheduling automation: $150/month saved
- **Total Week 2 Savings: $649/month**

---

# 🚀 Week 3: AI & Automation Implementation
**Focus**: AI Content Creation + Automation Rules + AI Agent Response System

## 📋 Week 3 Task Breakdown

### **🤖 Claude AI Tasks - Week 3**

#### **Task 3.1-AI: AI Content Creation System**
**Estimated Time**: 10 hours  
**Priority**: Critical  
**Dependencies**: Week 1 content database, n8n AI workflows

**Complete AI Content API Implementation:**
```typescript
// src/app/api/n8n/ai/generate-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Validate webhook authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      content_request_id,
      generated_content,
      content_type,
      platforms,
      hashtags,
      media_suggestions,
      optimization_score,
      execution_id 
    } = body;

    // Update content request with generated results
    const { data, error } = await supabase
      .from('content')
      .update({
        text: generated_content.text,
        media_urls: media_suggestions || [],
        hashtags: hashtags || [],
        content_type: content_type || 'text',
        status: 'generated',
        ai_metadata: {
          optimization_score: optimization_score || 0,
          execution_id: execution_id,
          generation_timestamp: new Date().toISOString(),
          platforms_optimized: platforms || [],
          suggestions: generated_content.suggestions || []
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', content_request_id)
      .select()
      .single();

    if (error) {
      console.error('Content update error:', error);
      return NextResponse.json(
        { error: 'Failed to update generated content' },
        { status: 500 }
      );
    }

    // Create content variations for different platforms
    if (platforms && platforms.length > 1) {
      const variations = [];
      for (const platform of platforms) {
        if (generated_content.variations?.[platform]) {
          variations.push({
            original_content_id: content_request_id,
            platform: platform,
            text: generated_content.variations[platform].text,
            hashtags: generated_content.variations[platform].hashtags || hashtags,
            optimization_notes: generated_content.variations[platform].notes || '',
            created_at: new Date().toISOString()
          });
        }
      }

      if (variations.length > 0) {
        await supabase
          .from('content_variations')
          .insert(variations);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        content_id: content_request_id,
        generated_at: new Date().toISOString(),
        optimization_score: optimization_score,
        platforms_count: platforms?.length || 0,
        variations_created: generated_content.variations ? Object.keys(generated_content.variations).length : 0
      }
    });

  } catch (error) {
    console.error('AI content generation webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// src/app/api/content/generate/route.ts
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { 
      prompt, 
      content_type = 'text', 
      platforms = [], 
      tone = 'professional',
      target_audience = 'general',
      include_hashtags = true,
      include_call_to_action = true,
      user_id 
    } = body;

    // Validate required fields
    if (!prompt || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, user_id' },
        { status: 400 }
      );
    }

    // Create initial content record
    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .insert({
        text: `AI Generation Request: ${prompt}`,
        content_type: content_type,
        status: 'generating',
        user_id: user_id,
        ai_metadata: {
          prompt: prompt,
          tone: tone,
          target_audience: target_audience,
          platforms_requested: platforms,
          include_hashtags: include_hashtags,
          include_call_to_action: include_call_to_action,
          request_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (contentError) {
      console.error('Content creation error:', contentError);
      return NextResponse.json(
        { error: 'Failed to create content request' },
        { status: 500 }
      );
    }

    // Trigger n8n AI content generation workflow
    try {
      const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/ai-content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
        },
        body: JSON.stringify({
          content_request_id: contentData.id,
          prompt: prompt,
          content_type: content_type,
          platforms: platforms,
          tone: tone,
          target_audience: target_audience,
          options: {
            include_hashtags: include_hashtags,
            include_call_to_action: include_call_to_action,
            max_length: content_type === 'twitter' ? 280 : 2000,
            generate_variations: platforms.length > 1
          }
        })
      });

      if (!n8nResponse.ok) {
        throw new Error(`n8n workflow failed: ${await n8nResponse.text()}`);
      }

    } catch (n8nError) {
      console.error('n8n AI generation error:', n8nError);
      
      // Update content status to failed
      await supabase
        .from('content')
        .update({ 
          status: 'failed',
          ai_metadata: {
            ...contentData.ai_metadata,
            error: n8nError.message,
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', contentData.id);
      
      return NextResponse.json(
        { error: 'AI content generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content_id: contentData.id,
        status: 'generating',
        estimated_completion: new Date(Date.now() + 30000).toISOString(), // 30 seconds
        message: 'AI content generation started'
      }
    });

  } catch (error) {
    console.error('Content generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('content_id');
    const status = searchParams.get('status');

    if (contentId) {
      // Get specific content generation result
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          content_variations (
            platform,
            text,
            hashtags,
            optimization_notes
          )
        `)
        .eq('id', contentId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data });
    } else {
      // Get all generated content
      let query = supabase
        .from('content')
        .select('*')
        .in('status', ['generating', 'generated', 'failed'])
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Query error:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: data || [] });
    }

  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**AI Content Creator Component:**
```typescript
// src/components/content/ai-content-creator.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  Loader2, 
  Copy, 
  Download, 
  RefreshCw, 
  Target, 
  TrendingUp,
  MessageSquare,
  Hash,
  Users
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GeneratedContent {
  id: string;
  text: string;
  content_type: string;
  status: string;
  ai_metadata: {
    prompt: string;
    tone: string;
    target_audience: string;
    optimization_score: number;
    platforms_requested: string[];
    suggestions: string[];
  };
  content_variations: Array<{
    platform: string;
    text: string;
    hashtags: string[];
    optimization_notes: string;
  }>;
  created_at: string;
}

export function AIContentCreator() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('text');
  const [platforms, setPlatforms] = useState<string[]>(['facebook']);
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('general');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadGeneratedContent();
  }, []);

  const loadGeneratedContent = async () => {
    try {
      const response = await fetch('/api/content/generate');
      const result = await response.json();
      
      if (result.success) {
        setGeneratedContent(result.data);
      }
    } catch (error) {
      console.error('Error loading generated content:', error);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for content generation.',
        variant: 'destructive'
      });
      return;
    }

    if (platforms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one platform.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          content_type: contentType,
          platforms,
          tone,
          target_audience: targetAudience,
          include_hashtags: includeHashtags,
          include_call_to_action: includeCTA,
          user_id: 'current_user_id' // Get from auth context
        })
      });

      const result = await response.json();

      if (result.success) {
        const contentId = result.data.content_id;
        
        // Start polling for completion
        const pollInterval = setInterval(async () => {
          setGenerationProgress(prev => Math.min(prev + 10, 90));
          
          const statusResponse = await fetch(`/api/content/generate?content_id=${contentId}`);
          const statusResult = await statusResponse.json();
          
          if (statusResult.success) {
            const content = statusResult.data;
            
            if (content.status === 'generated') {
              clearInterval(pollInterval);
              setGenerationProgress(100);
              setIsGenerating(false);
              setSelectedContent(content);
              loadGeneratedContent();
              
              toast({
                title: 'Success',
                description: 'AI content generated successfully!',
              });
              
              // Reset form
              setPrompt('');
            } else if (content.status === 'failed') {
              clearInterval(pollInterval);
              setIsGenerating(false);
              setGenerationProgress(0);
              
              toast({
                title: 'Generation Failed',
                description: 'AI content generation failed. Please try again.',
                variant: 'destructive'
              });
            }
          }
        }, 2000);

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isGenerating) {
            setIsGenerating(false);
            setGenerationProgress(0);
            toast({
              title: 'Timeout',
              description: 'Content generation is taking longer than expected.',
              variant: 'destructive'
            });
          }
        }, 60000);

      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Content generation error:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
      
      toast({
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard',
    });
  };

  const scheduleContent = async (content: GeneratedContent) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            text: content.text,
            content_type: content.content_type,
            hashtags: content.ai_metadata?.suggestions || []
          },
          platforms: content.ai_metadata?.platforms_requested || platforms,
          scheduled_for: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          user_id: 'current_user_id'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Scheduled',
          description: 'Content scheduled for posting!',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule content.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            AI Content Creator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Content Prompt */}
            <div>
              <Label htmlFor="prompt">Content Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the content you want to create... (e.g., 'Write a promotional post about our new product launch')"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Configuration Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Post</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="entertaining">Entertaining</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Audience</SelectItem>
                    <SelectItem value="millennials">Millennials</SelectItem>
                    <SelectItem value="gen-z">Gen Z</SelectItem>
                    <SelectItem value="professionals">Professionals</SelectItem>
                    <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                    <SelectItem value="small-business">Small Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <Label>Target Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['facebook', 'instagram', 'twitter', 'linkedin'].map(platform => (
                  <Button
                    key={platform}
                    variant={platforms.includes(platform) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformToggle(platform)}
                    className="capitalize"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hashtags"
                  checked={includeHashtags}
                  onCheckedChange={setIncludeHashtags}
                />
                <Label htmlFor="hashtags" className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  Include Hashtags
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="cta"
                  checked={includeCTA}
                  onCheckedChange={setIncludeCTA}
                />
                <Label htmlFor="cta" className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Include Call-to-Action
                </Label>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating content...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={generateContent} 
              disabled={isGenerating}
              className="w-full"
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

      {/* Generated Content Results */}
      {selectedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Content
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Score: {selectedContent.ai_metadata?.optimization_score || 0}/100
                </Badge>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedContent.text)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" onClick={() => scheduleContent(selectedContent)}>
                  Schedule
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Main Content</TabsTrigger>
                <TabsTrigger value="variations">Platform Variations</TabsTrigger>
                <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedContent.text}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Generated: {new Date(selectedContent.created_at).toLocaleString()}</span>
                  <span>Type: {selectedContent.content_type}</span>
                </div>
              </TabsContent>
              
              <TabsContent value="variations" className="space-y-4">
                {selectedContent.content_variations?.length > 0 ? (
                  selectedContent.content_variations.map((variation, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm capitalize flex items-center justify-between">
                          {variation.platform}
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(variation.text)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm mb-2">{variation.text}</p>
                        {variation.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {variation.hashtags.map(hashtag => (
                              <Badge key={hashtag} variant="secondary" className="text-xs">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {variation.optimization_notes && (
                          <p className="text-xs text-gray-500 mt-2">{variation.optimization_notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No platform variations generated</p>
                )}
              </TabsContent>
              
              <TabsContent value="suggestions" className="space-y-4">
                {selectedContent.ai_metadata?.suggestions?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedContent.ai_metadata.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No AI suggestions available</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Recent Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Generated Content
            <Button variant="outline" size="sm" onClick={loadGeneratedContent}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedContent.length > 0 ? (
              generatedContent.map(content => (
                <Card key={content.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedContent(content)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {content.ai_metadata?.prompt || 'Generated Content'}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {content.text}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {content.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {content.ai_metadata?.tone || 'professional'}
                          </Badge>
                          {content.ai_metadata?.optimization_score && (
                            <Badge variant="outline" className="text-xs">
                              Score: {content.ai_metadata.optimization_score}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(content.text);
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          scheduleContent(content);
                        }}>
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No generated content yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### **👨‍💻 Yousef Tasks - Week 3**

#### **Task 3.1-DEV: AI Content Generation n8n Workflow**
**Estimated Time**: 8 hours  
**Priority**: Critical  

**Complete n8n AI Content Generation Workflow:**
```json
{
  "name": "AI Content Generation v3.0",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "/ai-content/generate",
        "responseMode": "onReceived",
        "authentication": "headerAuth"
      },
      "id": "content-webhook",
      "name": "AI Content Request",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "webhook-auth",
          "name": "SocialFlow Webhook Auth"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "// Process AI content generation request\nconst requestData = items[0].json;\n\n// Validate required fields\nif (!requestData.content_request_id || !requestData.prompt) {\n  throw new Error('Missing required fields: content_request_id, prompt');\n}\n\n// Build AI prompt based on request\nconst platforms = requestData.platforms || ['general'];\nconst tone = requestData.tone || 'professional';\nconst targetAudience = requestData.target_audience || 'general';\nconst options = requestData.options || {};\n\n// Create comprehensive prompt for AI\nlet aiPrompt = `Create ${requestData.content_type || 'social media'} content with the following requirements:\n\nTopic: ${requestData.prompt}\nTone: ${tone}\nTarget Audience: ${targetAudience}\nPlatforms: ${platforms.join(', ')}\n`;\n\nif (options.include_hashtags) {\n  aiPrompt += '\\nInclude relevant hashtags';\n}\n\nif (options.include_call_to_action) {\n  aiPrompt += '\\nInclude a compelling call-to-action';\n}\n\nif (options.max_length) {\n  aiPrompt += `\\nKeep content under ${options.max_length} characters`;\n}\n\nif (options.generate_variations && platforms.length > 1) {\n  aiPrompt += `\\nCreate variations optimized for each platform: ${platforms.join(', ')}`;\n}\n\naiPrompt += '\\n\\nProvide the response in JSON format with: main_content, hashtags, call_to_action, platform_variations (if requested), optimization_tips';\n\nreturn [\n  {\n    json: {\n      content_request_id: requestData.content_request_id,\n      ai_prompt: aiPrompt,\n      original_request: requestData,\n      timestamp: new Date().toISOString()\n    }\n  }\n];"
      },
      "id": "prompt-processor",
      "name": "Process AI Prompt",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "model": "llama3.1:latest",
        "prompt": "={{$json.ai_prompt}}",
        "options": {
          "temperature": 0.7,
          "top_p": 0.9,
          "max_tokens": 2000
        }
      },
      "id": "ollama-generate",
      "name": "Generate with Ollama",
      "type": "n8n-nodes-base.ollama",
      "typeVersion": 1,
      "position": [680, 240],
      "credentials": {
        "ollamaApi": {
          "id": "ollama-local",
          "name": "Local Ollama"
        }
      }
    },
    {
      "parameters": {
        "url": "https://api.openai.com/v1/chat/completions",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.OPENAI_API_KEY}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "jsonBody": "={\n  \"model\": \"gpt-3.5-turbo\",\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"You are a professional social media content creator. Generate engaging, platform-optimized content.\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"{{$json.ai_prompt}}\"\n    }\n  ],\n  \"max_tokens\": 2000,\n  \"temperature\": 0.7\n}"
      },
      "id": "openai-generate",
      "name": "Generate with OpenAI",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [680, 360]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$env.AI_PROVIDER}}",
              "operation": "equal",
              "value2": "ollama"
            }
          ]
        }
      },
      "id": "ai-provider-switch",
      "name": "AI Provider Switch",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [500, 300]
    },
    {
      "parameters": {
        "functionCode": "// Process AI response and format output\nconst originalRequest = $('Process AI Prompt').first().json;\nconst aiProvider = process.env.AI_PROVIDER || 'ollama';\n\nlet aiResponse;\nif (aiProvider === 'ollama') {\n  const ollamaResult = $('Generate with Ollama').first().json;\n  aiResponse = ollamaResult.response || ollamaResult.text || '';\n} else {\n  const openaiResult = $('Generate with OpenAI').first().json;\n  aiResponse = openaiResult.choices?.[0]?.message?.content || '';\n}\n\nif (!aiResponse) {\n  throw new Error('No response from AI provider');\n}\n\n// Try to parse JSON response, fallback to plain text processing\nlet parsedContent;\ntry {\n  // Look for JSON in the response\n  const jsonMatch = aiResponse.match(/\\{[\\s\\S]*\\}/);\n  if (jsonMatch) {\n    parsedContent = JSON.parse(jsonMatch[0]);\n  } else {\n    throw new Error('No JSON found');\n  }\n} catch (error) {\n  // Fallback: extract content manually\n  const lines = aiResponse.split('\\n').filter(line => line.trim());\n  parsedContent = {\n    main_content: lines[0] || aiResponse.substring(0, 500),\n    hashtags: [],\n    call_to_action: '',\n    platform_variations: {},\n    optimization_tips: []\n  };\n  \n  // Extract hashtags\n  const hashtagMatches = aiResponse.match(/#\\w+/g);\n  if (hashtagMatches) {\n    parsedContent.hashtags = hashtagMatches;\n  }\n}\n\n// Calculate optimization score based on content quality\nconst content = parsedContent.main_content || '';\nlet optimizationScore = 50; // Base score\n\n// Scoring factors\nif (content.length > 50) optimizationScore += 10;\nif (content.length < 2000) optimizationScore += 10;\nif (parsedContent.hashtags?.length > 0) optimizationScore += 15;\nif (parsedContent.call_to_action) optimizationScore += 15;\nif (content.includes('?') || content.includes('!')) optimizationScore += 5; // Engagement\nif (originalRequest.original_request.platforms?.length > 1 && parsedContent.platform_variations) {\n  optimizationScore += 10;\n}\n\n// Generate platform-specific variations if not provided\nconst platforms = originalRequest.original_request.platforms || [];\nconst variations = parsedContent.platform_variations || {};\n\nfor (const platform of platforms) {\n  if (!variations[platform] && platforms.length > 1) {\n    let platformContent = content;\n    let platformHashtags = parsedContent.hashtags || [];\n    \n    switch (platform.toLowerCase()) {\n      case 'twitter':\n        // Limit to 280 characters\n        if (platformContent.length > 220) {\n          platformContent = platformContent.substring(0, 220) + '...';\n        }\n        break;\n      case 'linkedin':\n        // More professional tone\n        platformContent = content;\n        platformHashtags = platformHashtags.slice(0, 3); // LinkedIn prefers fewer hashtags\n        break;\n      case 'instagram':\n        // Add more hashtags\n        platformHashtags = [...platformHashtags, ...['#instagood', '#photooftheday']];\n        break;\n      case 'facebook':\n        // Longer form content allowed\n        break;\n    }\n    \n    variations[platform] = {\n      text: platformContent,\n      hashtags: platformHashtags,\n      notes: `Optimized for ${platform}`\n    };\n  }\n}\n\nconst suggestions = [\n  'Consider adding emojis for better engagement',\n  'Test posting at peak hours for your audience',\n  'Monitor comments and respond promptly',\n  ...(parsedContent.optimization_tips || [])\n];\n\nreturn [\n  {\n    json: {\n      content_request_id: originalRequest.content_request_id,\n      generated_content: {\n        text: parsedContent.main_content || content,\n        variations: variations,\n        suggestions: suggestions\n      },\n      content_type: originalRequest.original_request.content_type || 'text',\n      platforms: platforms,\n      hashtags: parsedContent.hashtags || [],\n      media_suggestions: [], // Could be enhanced with image generation\n      optimization_score: Math.min(optimizationScore, 100),\n      execution_id: $execution.id,\n      generation_timestamp: new Date().toISOString(),\n      ai_provider: aiProvider,\n      raw_ai_response: aiResponse.substring(0, 1000) // Store first 1000 chars for debugging\n    }\n  }\n];"
      },
      "id": "content-formatter",
      "name": "Format AI Content",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/ai/generate-content",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "jsonBody": "={{ JSON.stringify($json) }}"
      },
      "id": "content-webhook-result",
      "name": "Send Result to SocialFlow",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "functionCode": "// Handle errors and send failure notification\nconst error = $input.all()[0];\nconst originalRequest = $('Process AI Prompt').first()?.json;\n\nreturn [\n  {\n    json: {\n      content_request_id: originalRequest?.content_request_id || 'unknown',\n      error: true,\n      error_message: error.message || 'AI content generation failed',\n      error_details: {\n        timestamp: new Date().toISOString(),\n        execution_id: $execution.id,\n        node_error: error.node || 'unknown'\n      }\n    }\n  }\n];"
      },
      "id": "error-handler",
      "name": "Handle Generation Error",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 500]
    },
    {
      "parameters": {
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/ai/generate-content",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "jsonBody": "={{ JSON.stringify($json) }}"
      },
      "id": "error-webhook",
      "name": "Send Error to SocialFlow",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1120, 500]
    }
  ],
  "connections": {
    "AI Content Request": {
      "main": [
        [
          {
            "node": "Process AI Prompt",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process AI Prompt": {
      "main": [
        [
          {
            "node": "AI Provider Switch",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Provider Switch": {
      "main": [
        [
          {
            "node": "Generate with Ollama",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Generate with OpenAI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate with Ollama": {
      "main": [
        [
          {
            "node": "Format AI Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate with OpenAI": {
      "main": [
        [
          {
            "node": "Format AI Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Format AI Content": {
      "main": [
        [
          {
            "node": "Send Result to SocialFlow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "staticData": {},
  "tags": ["ai", "content-generation", "automation"]
}
```

**Expected Week 3 Outputs:**
- Fully functional AI content generation system
- Multiple AI provider support (Ollama local + OpenAI fallback)
- Platform-specific content optimization
- Content variation generation
- Optimization scoring and suggestions
- Seamless integration with scheduling system

## 📊 Week 3 Cost Analysis

**Week 3 Total Cost: $10-30/month**
- n8n hosting: $10-20/month
- OpenAI API (optional): $0-10/month (pay per use)
- Local Ollama: FREE

**Savings vs Paid AI Services:**
- AI content generation tools: $500/month saved
- Content optimization services: $200/month saved  
- Platform-specific formatting: $150/month saved
- **Total Week 3 Savings: $850/month**

---

# 🚀 Week 4: Integration & Testing
**Focus**: Automation Rules + End-to-End Testing + System Integration + Performance Optimization

## 📋 Week 4 Task Breakdown

### **🤖 Claude AI Tasks - Week 4**

#### **Task 4.1-AI: Automation Rules System**
**Estimated Time**: 8 hours  
**Priority**: High  

**Automation Rules Engine Implementation:**
```typescript
// src/app/api/automation/rules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface AutomationRule {
  name: string;
  description: string;
  trigger_type: 'message_received' | 'keyword_mention' | 'scheduled' | 'engagement_threshold';
  trigger_conditions: {
    platform?: string[];
    keywords?: string[];
    sender_criteria?: any;
    engagement_type?: string;
    threshold_value?: number;
    schedule?: string;
  };
  actions: Array<{
    type: 'auto_reply' | 'tag_conversation' | 'create_task' | 'send_notification' | 'generate_content';
    parameters: any;
    delay_minutes?: number;
  }>;
  is_active: boolean;
  priority: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    let query = supabase
      .from('automation_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch automation rules' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const rule: AutomationRule = {
      name: body.name,
      description: body.description || '',
      trigger_type: body.trigger_type,
      trigger_conditions: body.trigger_conditions || {},
      actions: body.actions || [],
      is_active: body.is_active ?? true,
      priority: body.priority || 1
    };

    // Validate rule structure
    if (!rule.name || !rule.trigger_type || !rule.actions.length) {
      return NextResponse.json(
        { error: 'Missing required fields: name, trigger_type, actions' },
        { status: 400 }
      );
    }

    // Validate trigger conditions based on type
    const validationError = validateTriggerConditions(rule.trigger_type, rule.trigger_conditions);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Validate actions
    const actionValidationError = validateActions(rule.actions);
    if (actionValidationError) {
      return NextResponse.json({ error: actionValidationError }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('automation_rules')
      .insert({
        ...rule,
        user_id: 'current_user_id', // Get from auth context
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create automation rule' }, { status: 500 });
    }

    // Register rule with n8n
    try {
      await registerRuleWithN8N(data);
    } catch (n8nError) {
      console.error('n8n registration error:', n8nError);
      // Don't fail the API call, just log the error
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function validateTriggerConditions(triggerType: string, conditions: any): string | null {
  switch (triggerType) {
    case 'message_received':
      if (!conditions.platform && !conditions.keywords) {
        return 'Message trigger requires platform or keywords';
      }
      break;
    case 'keyword_mention':
      if (!conditions.keywords || !Array.isArray(conditions.keywords) || conditions.keywords.length === 0) {
        return 'Keyword trigger requires at least one keyword';
      }
      break;
    case 'scheduled':
      if (!conditions.schedule) {
        return 'Scheduled trigger requires schedule configuration';
      }
      break;
    case 'engagement_threshold':
      if (!conditions.engagement_type || !conditions.threshold_value) {
        return 'Engagement trigger requires type and threshold value';
      }
      break;
    default:
      return 'Invalid trigger type';
  }
  return null;
}

function validateActions(actions: any[]): string | null {
  for (const action of actions) {
    if (!action.type) {
      return 'All actions must have a type';
    }

    switch (action.type) {
      case 'auto_reply':
        if (!action.parameters?.reply_text) {
          return 'Auto reply action requires reply_text parameter';
        }
        break;
      case 'tag_conversation':
        if (!action.parameters?.tag) {
          return 'Tag conversation action requires tag parameter';
        }
        break;
      case 'create_task':
        if (!action.parameters?.task_title) {
          return 'Create task action requires task_title parameter';
        }
        break;
      case 'send_notification':
        if (!action.parameters?.notification_text) {
          return 'Send notification action requires notification_text parameter';
        }
        break;
      case 'generate_content':
        if (!action.parameters?.content_prompt) {
          return 'Generate content action requires content_prompt parameter';
        }
        break;
      default:
        return `Invalid action type: ${action.type}`;
    }
  }
  return null;
}

async function registerRuleWithN8N(rule: any) {
  const response = await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/automation-rules/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      rule_id: rule.id,
      trigger_type: rule.trigger_type,
      trigger_conditions: rule.trigger_conditions,
      actions: rule.actions,
      priority: rule.priority
    })
  });

  if (!response.ok) {
    throw new Error(`n8n registration failed: ${await response.text()}`);
  }
}

// src/app/api/automation/execute/route.ts - Webhook for n8n to trigger rule execution
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Validate webhook authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      rule_id,
      trigger_data,
      execution_id,
      actions_executed
    } = body;

    // Log automation execution
    const { error: logError } = await supabase
      .from('automation_executions')
      .insert({
        rule_id: rule_id,
        trigger_data: trigger_data,
        execution_id: execution_id,
        actions_executed: actions_executed,
        executed_at: new Date().toISOString(),
        status: 'completed'
      });

    if (logError) {
      console.error('Execution logging error:', logError);
    }

    // Update rule statistics
    await supabase
      .from('automation_rules')
      .update({
        execution_count: supabase.raw('execution_count + 1'),
        last_executed_at: new Date().toISOString()
      })
      .eq('id', rule_id);

    return NextResponse.json({
      success: true,
      message: 'Automation execution logged'
    });

  } catch (error) {
    console.error('Automation execution webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Automation Rules UI Component:**
```typescript
// src/components/automation/automation-rules.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  MessageSquare, 
  Hash, 
  Clock, 
  TrendingUp,
  Settings,
  Activity
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  is_active: boolean;
  priority: number;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
}

export function AutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'message_received',
    trigger_conditions: {},
    actions: [],
    is_active: true,
    priority: 1
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/automation/rules');
      const result = await response.json();
      
      if (result.success) {
        setRules(result.data);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation rules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    try {
      const response = await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Automation rule created successfully'
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadRules();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create automation rule',
        variant: 'destructive'
      });
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/automation/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Rule ${!isActive ? 'activated' : 'deactivated'}`
        });
        loadRules();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/automation/rules/${ruleId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Automation rule deleted'
        });
        loadRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'message_received',
      trigger_conditions: {},
      actions: [],
      is_active: true,
      priority: 1
    });
    setEditingRule(null);
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'message_received': return <MessageSquare className="h-4 w-4" />;
      case 'keyword_mention': return <Hash className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'engagement_threshold': return <TrendingUp className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getTriggerDescription = (rule: AutomationRule) => {
    switch (rule.trigger_type) {
      case 'message_received':
        const platforms = rule.trigger_conditions.platform;
        return `When message received${platforms ? ` on ${platforms.join(', ')}` : ''}`;
      case 'keyword_mention':
        const keywords = rule.trigger_conditions.keywords;
        return `When keywords mentioned: ${keywords?.join(', ') || 'none'}`;
      case 'scheduled':
        return `Scheduled: ${rule.trigger_conditions.schedule || 'not set'}`;
      case 'engagement_threshold':
        return `When ${rule.trigger_conditions.engagement_type} exceeds ${rule.trigger_conditions.threshold_value}`;
      default:
        return 'Unknown trigger';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading automation rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Automation Rules</h1>
          <p className="text-gray-600">Automate responses and actions based on triggers</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Auto-reply to inquiries"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does..."
                />
              </div>
              
              <div>
                <Label>Trigger Type</Label>
                <Select 
                  value={formData.trigger_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value, trigger_conditions: {} }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message_received">Message Received</SelectItem>
                    <SelectItem value="keyword_mention">Keyword Mention</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="engagement_threshold">Engagement Threshold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Dynamic trigger conditions based on type */}
              {formData.trigger_type === 'keyword_mention' && (
                <div>
                  <Label>Keywords (comma separated)</Label>
                  <Input
                    placeholder="support, help, question"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger_conditions: {
                        ...prev.trigger_conditions,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    }))}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Rule is active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createRule}>
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="grid gap-6">
        {rules.length > 0 ? (
          rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTriggerIcon(rule.trigger_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{getTriggerDescription(rule)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Priority: {rule.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>Executed: {rule.execution_count} times</span>
                    </div>
                    {rule.last_executed_at && (
                      <span>
                        Last: {new Date(rule.last_executed_at).toLocaleString()}
                      </span>
                    )}
                    <span>{rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRule(rule.id, rule.is_active)}
                    >
                      {rule.is_active ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRule(rule)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this rule?')) {
                          deleteRule(rule.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Automation Rules</h3>
              <p className="text-gray-500 mb-4">Create your first rule to automate responses and actions</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

### **👨‍💻 Yousef Tasks - Week 4**

#### **Task 4.1-DEV: Automated Response n8n Workflow**
**Complete n8n Automated Response Workflow:**
```json
{
  "name": "Automated Message Response v4.0",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "/automated-response/trigger",
        "responseMode": "onReceived"
      },
      "id": "message-webhook",
      "name": "New Message Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "// Analyze incoming message for automation triggers\nconst messageData = items[0].json;\n\n// Extract message details\nconst {\n  platform,\n  platform_user_id,\n  platform_username,\n  content,\n  message_type,\n  conversation_id\n} = messageData;\n\n// Only process incoming messages\nif (message_type !== 'incoming') {\n  return [];\n}\n\n// Normalize content for analysis\nconst normalizedContent = content.toLowerCase().trim();\nconst words = normalizedContent.split(/\\s+/);\n\n// Detect intent and keywords\nconst supportKeywords = ['help', 'support', 'issue', 'problem', 'question', 'assist'];\nconst pricingKeywords = ['price', 'cost', 'pricing', 'how much', 'payment'];\nconst businessKeywords = ['hours', 'location', 'contact', 'info', 'business'];\nconst urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'now'];\n\nconst intents = [];\nif (supportKeywords.some(keyword => normalizedContent.includes(keyword))) {\n  intents.push('support');\n}\nif (pricingKeywords.some(keyword => normalizedContent.includes(keyword))) {\n  intents.push('pricing');\n}\nif (businessKeywords.some(keyword => normalizedContent.includes(keyword))) {\n  intents.push('business_info');\n}\nif (urgentKeywords.some(keyword => normalizedContent.includes(keyword))) {\n  intents.push('urgent');\n}\n\n// Determine priority\nlet priority = 'normal';\nif (intents.includes('urgent')) priority = 'high';\nif (intents.includes('support')) priority = 'medium';\n\n// Check for question patterns\nconst isQuestion = content.includes('?') || \n                  normalizedContent.startsWith('how') || \n                  normalizedContent.startsWith('what') || \n                  normalizedContent.startsWith('when') || \n                  normalizedContent.startsWith('where') || \n                  normalizedContent.startsWith('why');\n\n// Sentiment analysis (basic)\nconst positiveWords = ['thank', 'thanks', 'great', 'good', 'excellent', 'love'];\nconst negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'complaint'];\n\nlet sentiment = 'neutral';\nif (positiveWords.some(word => normalizedContent.includes(word))) {\n  sentiment = 'positive';\n} else if (negativeWords.some(word => normalizedContent.includes(word))) {\n  sentiment = 'negative';\n}\n\nreturn [\n  {\n    json: {\n      ...messageData,\n      analysis: {\n        intents: intents,\n        priority: priority,\n        is_question: isQuestion,\n        sentiment: sentiment,\n        word_count: words.length,\n        normalized_content: normalizedContent\n      },\n      should_auto_respond: intents.length > 0 || isQuestion,\n      processing_timestamp: new Date().toISOString()\n    }\n  }\n];"
      },
      "id": "message-analyzer",
      "name": "Analyze Message Content",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.should_auto_respond}}",
              "operation": "equal",
              "value2": true
            }
          ]
        }
      },
      "id": "response-filter",
      "name": "Should Auto Respond?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "functionCode": "// Generate appropriate auto response based on analysis\nconst data = items[0].json;\nconst { analysis, platform, platform_username, content } = data;\n\nlet responseText = '';\nlet responseType = 'automated';\n\n// Generate response based on primary intent\nif (analysis.intents.includes('support')) {\n  responseText = `Hi ${platform_username}! 👋 Thanks for reaching out. I've received your support request and will get back to you within 2 hours. For immediate assistance, you can check our FAQ at [link] or call us at [phone].`;\n  responseType = 'support_acknowledgment';\n} else if (analysis.intents.includes('pricing')) {\n  responseText = `Hello ${platform_username}! Thanks for your interest in our pricing. You can find our current rates at [pricing_link]. I'll also send you a detailed quote shortly. Is there a specific package you're interested in?`;\n  responseType = 'pricing_info';\n} else if (analysis.intents.includes('business_info')) {\n  responseText = `Hi ${platform_username}! Here's our business information:\\n\\n🏢 Address: [Business Address]\\n⏰ Hours: Mon-Fri 9AM-6PM\\n📞 Phone: [Phone Number]\\n📧 Email: [Email]\\n\\nWhat else would you like to know?`;\n  responseType = 'business_info';\n} else if (analysis.is_question) {\n  responseText = `Hi ${platform_username}! Thanks for your question. I'll make sure to get you a detailed answer soon. In the meantime, you might find helpful information on our website [link].`;\n  responseType = 'general_question';\n} else if (analysis.sentiment === 'negative') {\n  responseText = `Hi ${platform_username}, I'm sorry to hear about your concern. Your feedback is important to us and I want to make sure we address this properly. I'll have someone from our team reach out to you personally within the hour.`;\n  responseType = 'complaint_handling';\n} else if (analysis.sentiment === 'positive') {\n  responseText = `Hi ${platform_username}! Thank you so much for the kind words! 🙏 We really appreciate customers like you. Is there anything else we can help you with today?`;\n  responseType = 'positive_acknowledgment';\n} else {\n  responseText = `Hi ${platform_username}! Thanks for your message. I've received it and will get back to you soon. How can I best help you today?`;\n  responseType = 'general_acknowledgment';\n}\n\n// Add platform-specific formatting\nif (platform === 'instagram' || platform === 'facebook') {\n  responseText += '\\n\\n#CustomerService #WeAreHere';\n}\n\n// Add delay based on priority\nlet delayMinutes = 0;\nif (analysis.priority === 'high') {\n  delayMinutes = 1; // Respond immediately for urgent\n} else if (analysis.priority === 'medium') {\n  delayMinutes = 5; // 5 minute delay for medium priority\n} else {\n  delayMinutes = 15; // 15 minute delay for normal priority\n}\n\nreturn [\n  {\n    json: {\n      ...data,\n      auto_response: {\n        text: responseText,\n        type: responseType,\n        delay_minutes: delayMinutes,\n        generated_at: new Date().toISOString()\n      }\n    }\n  }\n];"
      },
      "id": "response-generator",
      "name": "Generate Auto Response",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 240]
    },
    {
      "parameters": {
        "amount": "={{$json.auto_response.delay_minutes}}",
        "unit": "minutes"
      },
      "id": "response-delay",
      "name": "Wait Before Responding",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [1120, 240]
    },
    {
      "parameters": {
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/messages/send-reply",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "jsonBody": "={\n  \"conversation_id\": \"{{$json.conversation_id}}\",\n  \"platform\": \"{{$json.platform}}\",\n  \"platform_user_id\": \"{{$json.platform_user_id}}\",\n  \"reply_text\": \"{{$json.auto_response.text}}\",\n  \"response_type\": \"{{$json.auto_response.type}}\",\n  \"original_message_id\": \"{{$json.platform_message_id}}\",\n  \"automation_data\": {\n    \"intents\": {{JSON.stringify($json.analysis.intents)}},\n    \"priority\": \"{{$json.analysis.priority}}\",\n    \"sentiment\": \"{{$json.analysis.sentiment}}\"\n  }\n}"
      },
      "id": "send-reply",
      "name": "Send Auto Reply",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1340, 240]
    },
    {
      "parameters": {
        "functionCode": "// Create notification for high priority messages\nconst data = items[0].json;\n\nif (data.analysis.priority === 'high' || data.analysis.sentiment === 'negative') {\n  return [\n    {\n      json: {\n        notification_type: 'urgent_message',\n        title: `${data.analysis.priority.toUpperCase()} Priority Message`,\n        message: `New ${data.analysis.priority} priority message from ${data.platform_username} on ${data.platform}`,\n        data: {\n          conversation_id: data.conversation_id,\n          platform: data.platform,\n          user: data.platform_username,\n          content_preview: data.content.substring(0, 100),\n          intents: data.analysis.intents,\n          priority: data.analysis.priority,\n          sentiment: data.analysis.sentiment\n        },\n        timestamp: new Date().toISOString()\n      }\n    }\n  ];\n}\n\nreturn [];"
      },
      "id": "notification-filter",
      "name": "Check if Notification Needed",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 400]
    },
    {
      "parameters": {
        "url": "={{$env.SOCIALFLOW_API_URL}}/api/n8n/notifications/send",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "jsonBody": "={{ JSON.stringify($json) }}"
      },
      "id": "send-notification",
      "name": "Send Priority Notification",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1120, 400]
    },
    {
      "parameters": {
        "functionCode": "// Log automation execution\nconst originalData = $('Analyze Message Content').first().json;\nconst responseData = $('Send Auto Reply').first()?.json;\n\nreturn [\n  {\n    json: {\n      automation_type: 'auto_response',\n      message_id: originalData.platform_message_id,\n      conversation_id: originalData.conversation_id,\n      platform: originalData.platform,\n      analysis_results: originalData.analysis,\n      response_sent: responseData ? true : false,\n      response_type: originalData.auto_response?.type,\n      execution_time: new Date().toISOString(),\n      execution_id: $execution.id\n    }\n  }\n];"
      },
      "id": "execution-logger",
      "name": "Log Automation Execution",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1560, 300]
    }
  ],
  "connections": {
    "New Message Trigger": {
      "main": [
        [
          {
            "node": "Analyze Message Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analyze Message Content": {
      "main": [
        [
          {
            "node": "Should Auto Respond?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Should Auto Respond?": {
      "main": [
        [
          {
            "node": "Generate Auto Response",
            "type": "main",
            "index": 0
          },
          {
            "node": "Check if Notification Needed",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Auto Response": {
      "main": [
        [
          {
            "node": "Wait Before Responding",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait Before Responding": {
      "main": [
        [
          {
            "node": "Send Auto Reply",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send Auto Reply": {
      "main": [
        [
          {
            "node": "Log Automation Execution",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check if Notification Needed": {
      "main": [
        [
          {
            "node": "Send Priority Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send Priority Notification": {
      "main": [
        [
          {
            "node": "Log Automation Execution",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {},
  "staticData": {},
  "tags": ["automation", "messaging", "ai-response"]
}
```

## 📊 Week 4 Comprehensive Testing Suite

### **🧪 End-to-End Integration Tests**

**Complete Integration Test Suite:**
```bash
#!/bin/bash
# tests/e2e/sprint1-complete-integration.sh

echo "🚀 SPRINT 1 MVP - COMPLETE INTEGRATION TESTING"
echo "=============================================="

# Set test environment variables
export TEST_API_BASE="http://localhost:3000"
export TEST_N8N_BASE="http://localhost:5678"
export TEST_USER_ID="test_user_$(date +%s)"
export RESULTS_FILE="/tmp/sprint1_test_results.json"

# Initialize results
echo '{"tests": [], "summary": {"total": 0, "passed": 0, "failed": 0}}' > $RESULTS_FILE

function log_test_result() {
  local test_name="$1"
  local status="$2"
  local details="$3"
  local timestamp=$(date -Iseconds)
  
  # Update results file
  jq --arg name "$test_name" --arg status "$status" --arg details "$details" --arg time "$timestamp" \
     '.tests += [{"name": $name, "status": $status, "details": $details, "timestamp": $time}] | 
      .summary.total += 1 | 
      if $status == "PASSED" then .summary.passed += 1 else .summary.failed += 1 end' \
     $RESULTS_FILE > /tmp/temp_results.json && mv /tmp/temp_results.json $RESULTS_FILE

  if [ "$status" = "PASSED" ]; then
    echo "✅ $test_name"
  else
    echo "❌ $test_name - $details"
  fi
}

# Test 1: Database Schema Validation
echo "🗄️ Testing Database Schema..."
TEST_SCHEMA=$(curl -s $TEST_API_BASE/api/test/schema-validation)
if [[ $TEST_SCHEMA == *"conversations"* && $TEST_SCHEMA == *"messages"* && $TEST_SCHEMA == *"content"* && $TEST_SCHEMA == *"scheduled_posts"* ]]; then
  log_test_result "Database Schema Validation" "PASSED" "All required tables present"
else
  log_test_result "Database Schema Validation" "FAILED" "Missing required database tables"
fi

# Test 2: Authentication & User Management
echo "🔐 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST $TEST_API_BASE/api/auth/test \
  -H "Content-Type: application/json" \
  -d '{"test_user_id": "'$TEST_USER_ID'"}')

if [[ $AUTH_RESPONSE == *"success"* ]]; then
  log_test_result "Authentication System" "PASSED" "User authentication working"
  TEST_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')
else
  log_test_result "Authentication System" "FAILED" "Authentication not working"
  TEST_TOKEN="test_token"
fi

# Test 3: Message Ingestion Workflow
echo "📥 Testing Message Ingestion..."
MESSAGE_TEST=$(curl -s -X POST $TEST_N8N_BASE/webhook/socialflow-messages \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "facebook",
    "platform_user_id": "test_user_123",
    "platform_username": "e2e_tester",
    "content": "Hello, this is an integration test message",
    "message_type": "incoming",
    "platform_message_id": "test_msg_'$(date +%s)'"
  }')

sleep 3 # Wait for processing

# Check if message appeared in database
INBOX_CHECK=$(curl -s "$TEST_API_BASE/api/conversations?recent=true")
if [[ $INBOX_CHECK == *"e2e_tester"* ]]; then
  log_test_result "Message Ingestion Workflow" "PASSED" "Messages processed into inbox"
else
  log_test_result "Message Ingestion Workflow" "FAILED" "Message ingestion not working"
fi

# Test 4: AI Content Generation
echo "🤖 Testing AI Content Generation..."
CONTENT_GEN=$(curl -s -X POST $TEST_API_BASE/api/content/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "prompt": "Create a test post about integration testing",
    "content_type": "text",
    "platforms": ["facebook"],
    "tone": "professional",
    "user_id": "'$TEST_USER_ID'"
  }')

CONTENT_ID=$(echo $CONTENT_GEN | jq -r '.data.content_id')

if [[ $CONTENT_ID != "null" && $CONTENT_ID != "" ]]; then
  # Wait for AI processing
  sleep 30
  
  # Check generation result
  CONTENT_RESULT=$(curl -s "$TEST_API_BASE/api/content/generate?content_id=$CONTENT_ID")
  STATUS=$(echo $CONTENT_RESULT | jq -r '.data.status')
  
  if [[ $STATUS == "generated" ]]; then
    log_test_result "AI Content Generation" "PASSED" "AI content generated successfully"
  else
    log_test_result "AI Content Generation" "FAILED" "AI generation incomplete: $STATUS"
  fi
else
  log_test_result "AI Content Generation" "FAILED" "Failed to initiate AI generation"
fi

# Test 5: Content Scheduling
echo "📅 Testing Content Scheduling..."
FUTURE_DATE=$(date -d '+1 hour' -Iseconds)
SCHEDULE_TEST=$(curl -s -X POST $TEST_API_BASE/api/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "content": {
      "text": "Integration test scheduled post",
      "content_type": "text",
      "hashtags": ["#integrationtest"]
    },
    "platforms": ["facebook"],
    "scheduled_for": "'$FUTURE_DATE'",
    "user_id": "'$TEST_USER_ID'"
  }')

SCHEDULE_ID=$(echo $SCHEDULE_TEST | jq -r '.data.id')

if [[ $SCHEDULE_ID != "null" && $SCHEDULE_ID != "" ]]; then
  log_test_result "Content Scheduling" "PASSED" "Content scheduled successfully"
  
  # Test scheduling update
  UPDATE_TEST=$(curl -s -X PUT $TEST_API_BASE/api/schedule/$SCHEDULE_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEST_TOKEN" \
    -d '{"content": {"text": "Updated integration test post"}}')
  
  if [[ $UPDATE_TEST == *"success"* ]]; then
    log_test_result "Schedule Updates" "PASSED" "Schedule updates working"
  else
    log_test_result "Schedule Updates" "FAILED" "Schedule updates not working"
  fi
else
  log_test_result "Content Scheduling" "FAILED" "Content scheduling not working"
fi

# Test 6: Social Media Posting Workflow
echo "📤 Testing Social Media Posting..."
# Create immediate post for testing
IMMEDIATE_POST=$(curl -s -X POST $TEST_API_BASE/api/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "content": {
      "text": "Immediate integration test post",
      "content_type": "text"
    },
    "platforms": ["facebook"],
    "scheduled_for": "'$(date -Iseconds)'",
    "user_id": "'$TEST_USER_ID'"
  }')

POST_ID=$(echo $IMMEDIATE_POST | jq -r '.data.id')

if [[ $POST_ID != "null" && $POST_ID != "" ]]; then
  # Wait for n8n processing
  sleep 45
  
  # Check posting results
  POST_RESULT=$(curl -s "$TEST_API_BASE/api/schedule/$POST_ID")
  POST_STATUS=$(echo $POST_RESULT | jq -r '.data.status')
  
  if [[ $POST_STATUS == "published" || $POST_STATUS == "processing" ]]; then
    log_test_result "Social Media Posting" "PASSED" "Posting workflow executed"
  else
    log_test_result "Social Media Posting" "FAILED" "Posting workflow failed: $POST_STATUS"
  fi
else
  log_test_result "Social Media Posting" "FAILED" "Failed to create test post"
fi

# Test 7: Automation Rules
echo "⚡ Testing Automation Rules..."
RULE_CREATE=$(curl -s -X POST $TEST_API_BASE/api/automation/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "name": "Integration Test Rule",
    "description": "Auto-reply to test messages",
    "trigger_type": "keyword_mention",
    "trigger_conditions": {
      "keywords": ["test", "integration"]
    },
    "actions": [{
      "type": "auto_reply",
      "parameters": {
        "reply_text": "Thanks for your test message!"
      }
    }],
    "is_active": true,
    "priority": 5
  }')

RULE_ID=$(echo $RULE_CREATE | jq -r '.data.id')

if [[ $RULE_ID != "null" && $RULE_ID != "" ]]; then
  log_test_result "Automation Rules Creation" "PASSED" "Automation rule created"
  
  # Test rule execution by sending trigger message
  TRIGGER_MESSAGE=$(curl -s -X POST $TEST_N8N_BASE/webhook/automated-response/trigger \
    -H "Content-Type: application/json" \
    -d '{
      "platform": "facebook",
      "platform_user_id": "rule_test_user",
      "platform_username": "rule_tester",
      "content": "This is an integration test message",
      "message_type": "incoming",
      "conversation_id": "test_conv_123"
    }')
  
  sleep 10 # Wait for automation processing
  
  # Check if auto-reply was sent
  AUTOMATION_LOG=$(curl -s "$TEST_API_BASE/api/automation/executions?recent=true")
  if [[ $AUTOMATION_LOG == *"rule_tester"* ]]; then
    log_test_result "Automation Rules Execution" "PASSED" "Automation rules executing"
  else
    log_test_result "Automation Rules Execution" "FAILED" "Automation not executing"
  fi
else
  log_test_result "Automation Rules Creation" "FAILED" "Failed to create automation rule"
fi

# Test 8: Real-time Updates
echo "⚡ Testing Real-time Updates..."
# This would typically require WebSocket testing
# For now, we'll test the API responsiveness
REALTIME_TEST=$(curl -s -w "%{time_total}" $TEST_API_BASE/api/conversations)
RESPONSE_TIME=$(echo $REALTIME_TEST | tail -c 6)

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
  log_test_result "Real-time Performance" "PASSED" "API response time: ${RESPONSE_TIME}s"
else
  log_test_result "Real-time Performance" "FAILED" "Slow API response: ${RESPONSE_TIME}s"
fi

# Test 9: n8n Workflow Health
echo "🔄 Testing n8n Workflows..."
N8N_HEALTH=$(curl -s $TEST_N8N_BASE/healthz)
if [[ $N8N_HEALTH == *"ok"* ]]; then
  # Test workflow status
  WORKFLOWS_STATUS=$(curl -s -H "Authorization: Bearer $N8N_API_KEY" \
    $TEST_N8N_BASE/api/v1/workflows)
  
  if [[ $WORKFLOWS_STATUS == *"active"* ]]; then
    log_test_result "n8n Workflows Health" "PASSED" "All workflows active and healthy"
  else
    log_test_result "n8n Workflows Health" "FAILED" "Some workflows inactive"
  fi
else
  log_test_result "n8n Workflows Health" "FAILED" "n8n instance not healthy"
fi

# Test 10: Data Consistency & Cleanup
echo "🧹 Testing Data Consistency..."
CONSISTENCY_CHECK=$(curl -s $TEST_API_BASE/api/test/data-consistency)
if [[ $CONSISTENCY_CHECK == *"consistent"* ]]; then
  log_test_result "Data Consistency" "PASSED" "Database relationships intact"
else
  log_test_result "Data Consistency" "FAILED" "Data consistency issues found"
fi

# Cleanup test data
CLEANUP_RESULT=$(curl -s -X DELETE $TEST_API_BASE/api/test/cleanup \
  -H "Content-Type: application/json" \
  -d '{"test_user_id": "'$TEST_USER_ID'"}')

if [[ $CLEANUP_RESULT == *"success"* ]]; then
  log_test_result "Test Data Cleanup" "PASSED" "Test data cleaned up"
else
  log_test_result "Test Data Cleanup" "FAILED" "Cleanup issues"
fi

# Generate Final Report
echo ""
echo "📊 INTEGRATION TEST SUMMARY"
echo "==========================="

TOTAL_TESTS=$(jq '.summary.total' $RESULTS_FILE)
PASSED_TESTS=$(jq '.summary.passed' $RESULTS_FILE)
FAILED_TESTS=$(jq '.summary.failed' $RESULTS_FILE)
PASS_RATE=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)

echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Pass Rate: ${PASS_RATE}%"

if [ $FAILED_TESTS -eq 0 ]; then
  echo ""
  echo "🎉 ALL TESTS PASSED! Sprint 1 MVP is ready for deployment."
  exit 0
else
  echo ""
  echo "⚠️  Some tests failed. Review the results before deployment."
  echo "Detailed results: $RESULTS_FILE"
  exit 1
fi
```

## 💰 Week 4 Final Cost Analysis

**Sprint 1 Complete Cost: $10-20/month**
- n8n hosting: $10-20/month
- All other services: FREE (Supabase, Vercel, Social APIs, AI via Ollama)

**Total Sprint 1 Savings vs Paid Solutions: $2,500+/month**
- Social media management: $299/month saved
- AI content generation: $500/month saved  
- Automation & workflows: $800/month saved
- Customer service automation: $400/month saved
- Analytics & reporting: $300/month saved
- Real-time messaging: $200/month saved

---
