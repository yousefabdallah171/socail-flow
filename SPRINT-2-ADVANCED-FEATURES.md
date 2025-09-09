# 🚀 Sprint 2: Advanced Business Features
**Duration**: 4 weeks  
**Priority**: High  
**Status**: Ready for Planning  

## 📋 Sprint Overview
Building on Sprint 1's foundation, Sprint 2 introduces advanced business management features that transform SocialFlow from a basic social media tool into a comprehensive business management platform. This sprint focuses on CRM capabilities, appointment booking, sales funnels, pipeline management, and multi-channel marketing campaigns.

## 🎯 Sprint Goals
1. ✅ **CRM & Customer Segmentation**: Complete customer relationship management system
2. ✅ **Calendar & Booking System**: Appointment scheduling and availability management
3. ✅ **Sales Funnels & Forms**: Marketing funnel builder with conversion tracking
4. ✅ **Pipeline Management**: Project and sales pipeline tracking
5. ✅ **Multi-channel Campaigns**: Email, SMS, and social media campaign orchestration

---

## 📊 Feature Breakdown

### 🔄 Phase 2.1: CRM & Customer Management (Week 1)

#### **Feature 1: Advanced CRM System**
**Estimated Time**: 8-10 days  
**Complexity**: High  

##### **Database Schema Design**
- [ ] **Task 1.1**: Create comprehensive contacts system
  ```sql
  CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    
    -- Contact source and attribution
    source VARCHAR(100), -- 'website', 'social_media', 'referral', 'import', 'manual'
    source_details JSONB, -- Platform-specific source data
    utm_data JSONB, -- UTM tracking parameters
    first_contact_date TIMESTAMP DEFAULT NOW(),
    
    -- Engagement data
    total_interactions INTEGER DEFAULT 0,
    last_interaction_date TIMESTAMP,
    engagement_score INTEGER DEFAULT 0, -- 0-100 based on interactions
    lifecycle_stage VARCHAR(50) DEFAULT 'lead', -- 'lead', 'prospect', 'customer', 'evangelist'
    
    -- Contact preferences
    email_subscribed BOOLEAN DEFAULT true,
    sms_subscribed BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT false,
    do_not_contact BOOLEAN DEFAULT false,
    
    -- Custom fields and tags
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[],
    notes TEXT,
    
    -- Relationship data
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 1.2**: Create customer segments table
  ```sql
  CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Segment criteria
    criteria JSONB NOT NULL, -- Complex filtering rules
    is_dynamic BOOLEAN DEFAULT true, -- Auto-update based on criteria
    
    -- Segment stats
    contact_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP,
    
    -- Campaign integration
    auto_add_to_campaigns BOOLEAN DEFAULT false,
    default_campaigns UUID[],
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 1.3**: Create contact interactions tracking
  ```sql
  CREATE TABLE contact_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    interaction_type VARCHAR(100) NOT NULL, -- 'email_open', 'email_click', 'website_visit', 'social_engagement', 'call', 'meeting'
    platform VARCHAR(50), -- 'email', 'sms', 'facebook', 'instagram', etc.
    
    -- Interaction details
    title VARCHAR(255),
    description TEXT,
    metadata JSONB, -- Platform-specific data
    
    -- Attribution
    campaign_id UUID, -- References campaigns when implemented
    content_id UUID REFERENCES content(id),
    
    -- Engagement metrics
    duration_seconds INTEGER,
    engagement_score INTEGER DEFAULT 0,
    
    occurred_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 1.4**: Create customer journey mapping
  ```sql
  CREATE TABLE customer_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    journey_stage VARCHAR(100), -- 'awareness', 'consideration', 'decision', 'retention', 'advocacy'
    stage_entered_at TIMESTAMP DEFAULT NOW(),
    stage_duration_days INTEGER,
    
    -- Journey triggers
    triggered_by VARCHAR(100), -- 'interaction', 'time', 'manual', 'automation'
    trigger_details JSONB,
    
    -- Journey outcomes
    next_stage VARCHAR(100),
    conversion_event VARCHAR(100),
    conversion_value DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

##### **Backend API Development**
- [ ] **Task 1.5**: Implement CRM service layer
  ```typescript
  // src/lib/crm/crm-service.ts
  export interface CRMService {
    // Contact management
    createContact(projectId: string, contactData: CreateContactRequest): Promise<Contact>
    updateContact(contactId: string, updates: UpdateContactRequest): Promise<Contact>
    getContacts(projectId: string, filters?: ContactFilters): Promise<PaginatedContacts>
    deleteContact(contactId: string): Promise<void>
    
    // Segmentation
    createSegment(projectId: string, segmentData: CreateSegmentRequest): Promise<Segment>
    calculateSegmentContacts(segmentId: string): Promise<Contact[]>
    getSegments(projectId: string): Promise<Segment[]>
    
    // Interaction tracking
    recordInteraction(contactId: string, interaction: InteractionData): Promise<void>
    getContactTimeline(contactId: string): Promise<ContactInteraction[]>
    getContactEngagementScore(contactId: string): Promise<number>
    
    // Journey mapping
    updateContactJourneyStage(contactId: string, stage: JourneyStage): Promise<void>
    getContactJourney(contactId: string): Promise<CustomerJourney[]>
  }
  ```

- [ ] **Task 1.6**: Create CRM API routes
  - `src/app/api/crm/contacts/route.ts` - Contact CRUD operations
  - `src/app/api/crm/contacts/[id]/route.ts` - Individual contact management
  - `src/app/api/crm/contacts/[id]/interactions/route.ts` - Contact interactions
  - `src/app/api/crm/segments/route.ts` - Customer segmentation
  - `src/app/api/crm/analytics/route.ts` - CRM analytics and reporting

##### **Frontend Components**
- [ ] **Task 1.7**: Build contacts dashboard
  ```typescript
  // src/components/crm/contacts-dashboard.tsx
  // - Contact list with advanced filtering
  // - Bulk operations (tag, segment, export)
  // - Quick contact creation
  // - Engagement score visualization
  ```

- [ ] **Task 1.8**: Create contact detail view
  ```typescript
  // src/components/crm/contact-detail.tsx
  // - Complete contact profile
  // - Interaction timeline
  // - Journey stage visualization
  // - Communication history
  // - Task and note management
  ```

- [ ] **Task 1.9**: Implement customer segmentation interface
  ```typescript
  // src/components/crm/segmentation-builder.tsx
  // - Visual segment builder
  // - Criteria selection (demographic, behavioral, engagement)
  // - Real-time segment preview
  // - Segment performance analytics
  ```

---

#### **Feature 2: Calendar & Booking System**
**Estimated Time**: 6-8 days  
**Complexity**: Medium-High  

##### **Database Schema**
- [ ] **Task 2.1**: Create calendar and booking system
  ```sql
  CREATE TABLE calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timezone VARCHAR(50) NOT NULL,
    
    -- Availability settings
    working_hours JSONB NOT NULL, -- { "monday": { "start": "09:00", "end": "17:00", "enabled": true }, ... }
    buffer_time_before INTEGER DEFAULT 0, -- minutes
    buffer_time_after INTEGER DEFAULT 0, -- minutes
    max_advance_booking_days INTEGER DEFAULT 30,
    min_advance_booking_hours INTEGER DEFAULT 2,
    
    -- Booking settings
    auto_confirm BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT false,
    confirmation_email_template UUID,
    reminder_email_template UUID,
    
    -- Integration settings
    external_calendar_sync BOOLEAN DEFAULT false,
    external_calendar_data JSONB,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 2.2**: Create appointment types and services
  ```sql
  CREATE TABLE appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    
    -- Booking settings
    max_bookings_per_day INTEGER,
    booking_form_fields JSONB, -- Custom form fields
    preparation_time_minutes INTEGER DEFAULT 0,
    
    -- Availability
    available_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
    available_times JSONB, -- Time slots per day
    
    -- Integration
    meeting_location VARCHAR(255),
    meeting_link TEXT,
    meeting_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'video_call', 'phone'
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 2.3**: Create appointments booking system
  ```sql
  CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_type_id UUID REFERENCES appointment_types(id) ON DELETE CASCADE,
    calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Appointment details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    
    -- Contact information (if no contact_id)
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    
    -- Booking details
    booking_form_data JSONB,
    price_paid DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'cancelled'
    
    -- Meeting details
    meeting_location VARCHAR(255),
    meeting_link TEXT,
    meeting_notes TEXT,
    
    -- Status management
    status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
    confirmation_sent_at TIMESTAMP,
    reminder_sent_at TIMESTAMP,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(50), -- 'customer', 'staff', 'system'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

##### **Backend Implementation**
- [ ] **Task 2.4**: Create calendar service
  ```typescript
  // src/lib/calendar/calendar-service.ts
  export interface CalendarService {
    // Calendar management
    createCalendar(projectId: string, userId: string, calendarData: CreateCalendarRequest): Promise<Calendar>
    getAvailableSlots(calendarId: string, dateRange: DateRange): Promise<TimeSlot[]>
    
    // Appointment types
    createAppointmentType(calendarId: string, typeData: CreateAppointmentTypeRequest): Promise<AppointmentType>
    getAppointmentTypes(calendarId: string): Promise<AppointmentType[]>
    
    // Booking management
    bookAppointment(appointmentData: BookAppointmentRequest): Promise<Appointment>
    cancelAppointment(appointmentId: string, reason: string): Promise<void>
    rescheduleAppointment(appointmentId: string, newDateTime: Date): Promise<Appointment>
    
    // Availability
    checkAvailability(calendarId: string, dateTime: Date, duration: number): Promise<boolean>
    blockTimeSlot(calendarId: string, dateTime: Date, duration: number, reason: string): Promise<void>
  }
  ```

- [ ] **Task 2.5**: Implement booking API routes
  - `src/app/api/calendar/route.ts` - Calendar management
  - `src/app/api/calendar/[id]/availability/route.ts` - Check availability
  - `src/app/api/calendar/[id]/book/route.ts` - Book appointments
  - `src/app/api/appointments/route.ts` - Appointment management
  - `src/app/api/appointments/[id]/route.ts` - Individual appointment operations

##### **Frontend Components**
- [ ] **Task 2.6**: Create calendar management interface
  ```typescript
  // src/components/calendar/calendar-manager.tsx
  // - Calendar creation and configuration
  // - Availability settings
  // - Working hours configuration
  // - Integration settings
  ```

- [ ] **Task 2.7**: Build appointment booking widget
  ```typescript
  // src/components/calendar/booking-widget.tsx
  // - Public booking interface
  // - Available time slot selection
  // - Guest information form
  // - Payment integration (if applicable)
  ```

- [ ] **Task 2.8**: Implement appointments dashboard
  ```typescript
  // src/components/calendar/appointments-dashboard.tsx
  // - Calendar view of appointments
  // - Appointment list with filtering
  // - Quick reschedule/cancel actions
  // - Customer communication
  ```

---

### 🔄 Phase 2.2: Sales & Marketing Systems (Week 2-3)

#### **Feature 3: Sales Funnels & Forms Builder**
**Estimated Time**: 10-12 days  
**Complexity**: High  

##### **Database Schema**
- [ ] **Task 3.1**: Create funnel system architecture
  ```sql
  CREATE TABLE funnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    funnel_type VARCHAR(100) DEFAULT 'lead_generation', -- 'lead_generation', 'sales', 'webinar', 'product_launch'
    
    -- Funnel configuration
    domain VARCHAR(255), -- Custom domain for funnel pages
    tracking_code TEXT, -- Analytics tracking
    conversion_tracking JSONB, -- Goals and events
    
    -- SEO and meta data
    meta_title VARCHAR(255),
    meta_description TEXT,
    og_image_url TEXT,
    
    -- Status and performance
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'paused', 'archived'
    total_visits INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- A/B testing
    is_ab_test BOOLEAN DEFAULT false,
    ab_test_config JSONB,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 3.2**: Create funnel pages system
  ```sql
  CREATE TABLE funnel_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    page_type VARCHAR(100), -- 'landing', 'thank_you', 'sales', 'checkout', 'upsell'
    
    -- Page content
    page_content JSONB NOT NULL, -- Drag-and-drop page builder content
    css_styles TEXT,
    custom_code TEXT,
    
    -- Page settings
    page_title VARCHAR(255),
    meta_description TEXT,
    canonical_url TEXT,
    
    -- Navigation
    step_order INTEGER DEFAULT 0,
    next_page_id UUID REFERENCES funnel_pages(id),
    
    -- Performance tracking
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_time_on_page INTEGER DEFAULT 0,
    
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 3.3**: Create forms builder system
  ```sql
  CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    funnel_page_id UUID REFERENCES funnel_pages(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    form_type VARCHAR(100) DEFAULT 'lead_capture', -- 'lead_capture', 'contact', 'survey', 'order'
    
    -- Form configuration
    form_fields JSONB NOT NULL, -- Field definitions
    validation_rules JSONB,
    success_message TEXT,
    redirect_url TEXT,
    
    -- Integration settings
    email_notifications BOOLEAN DEFAULT true,
    notification_emails TEXT[],
    webhook_url TEXT,
    crm_integration JSONB,
    
    -- Automation triggers
    automation_rules UUID[], -- References to automation rules
    segment_assignments UUID[], -- Auto-assign to segments
    
    -- Performance
    submission_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 3.4**: Create form submissions tracking
  ```sql
  CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Submission data
    form_data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    
    -- Attribution
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'error'
    processing_notes TEXT,
    
    submitted_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
  );
  ```

##### **Backend Implementation**
- [ ] **Task 3.5**: Create funnel builder service
  ```typescript
  // src/lib/funnels/funnel-service.ts
  export interface FunnelService {
    // Funnel management
    createFunnel(projectId: string, funnelData: CreateFunnelRequest): Promise<Funnel>
    duplicateFunnel(funnelId: string, newName: string): Promise<Funnel>
    publishFunnel(funnelId: string): Promise<void>
    
    // Page management
    createPage(funnelId: string, pageData: CreatePageRequest): Promise<FunnelPage>
    updatePageContent(pageId: string, content: PageContent): Promise<FunnelPage>
    reorderPages(funnelId: string, pageOrder: string[]): Promise<void>
    
    // Form management
    createForm(pageId: string, formData: CreateFormRequest): Promise<Form>
    processFormSubmission(formId: string, submissionData: FormSubmissionData): Promise<FormSubmission>
    
    // Analytics
    getFunnelAnalytics(funnelId: string, dateRange: DateRange): Promise<FunnelAnalytics>
    getConversionMetrics(funnelId: string): Promise<ConversionMetrics>
  }
  ```

- [ ] **Task 3.6**: Implement drag-and-drop page builder
  ```typescript
  // src/lib/funnels/page-builder.ts
  export interface PageBuilder {
    // Element management
    addElement(pageId: string, element: PageElement, position: Position): Promise<void>
    updateElement(pageId: string, elementId: string, updates: ElementUpdates): Promise<void>
    deleteElement(pageId: string, elementId: string): Promise<void>
    reorderElements(pageId: string, elementOrder: string[]): Promise<void>
    
    // Template system
    applyTemplate(pageId: string, templateId: string): Promise<void>
    saveAsTemplate(pageId: string, templateName: string): Promise<Template>
    
    // Content generation
    generatePageContent(pageId: string): Promise<string>
    optimizeForMobile(pageId: string): Promise<void>
  }
  ```

##### **Frontend Components**
- [ ] **Task 3.7**: Build funnel builder interface
  ```typescript
  // src/components/funnels/funnel-builder.tsx
  // - Drag-and-drop page builder
  // - Element library (text, images, forms, buttons)
  // - Template gallery
  // - Mobile preview
  // - Publishing controls
  ```

- [ ] **Task 3.8**: Create form builder component
  ```typescript
  // src/components/funnels/form-builder.tsx
  // - Dynamic form field creation
  // - Validation rules setup
  // - Integration configuration
  // - Form styling options
  ```

---

#### **Feature 4: Pipeline Management System**
**Estimated Time**: 6-8 days  
**Complexity**: Medium-High  

##### **Database Schema**
- [ ] **Task 4.1**: Create pipeline system
  ```sql
  CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pipeline_type VARCHAR(100) DEFAULT 'sales', -- 'sales', 'project', 'support', 'custom'
    
    -- Pipeline configuration
    stages JSONB NOT NULL, -- Array of stage definitions
    automation_rules JSONB, -- Stage transition rules
    
    -- Permissions and ownership
    owner_id UUID REFERENCES users(id),
    team_access JSONB, -- Team member permissions
    
    -- Performance tracking
    total_items INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_deal_size DECIMAL(10,2) DEFAULT 0,
    average_cycle_time_days DECIMAL(8,2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 4.2**: Create pipeline items (deals/projects)
  ```sql
  CREATE TABLE pipeline_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Current status
    current_stage VARCHAR(100) NOT NULL,
    stage_entered_at TIMESTAMP DEFAULT NOW(),
    probability INTEGER DEFAULT 50, -- 0-100 percentage
    
    -- Value tracking
    estimated_value DECIMAL(10,2) DEFAULT 0,
    actual_value DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Timeline
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Assignment and ownership
    assigned_to UUID REFERENCES users(id),
    team_members UUID[], -- Array of user IDs
    
    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    
    -- Activity tracking
    last_activity_at TIMESTAMP,
    next_follow_up_date TIMESTAMP,
    follow_up_notes TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'won', 'lost', 'archived'
    won_reason TEXT,
    lost_reason TEXT,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 4.3**: Create pipeline activities tracking
  ```sql
  CREATE TABLE pipeline_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_item_id UUID REFERENCES pipeline_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    activity_type VARCHAR(100) NOT NULL, -- 'stage_change', 'note_added', 'call', 'email', 'meeting', 'task'
    title VARCHAR(255),
    description TEXT,
    
    -- Activity details
    previous_stage VARCHAR(100),
    new_stage VARCHAR(100),
    duration_minutes INTEGER,
    
    -- Associated data
    related_contact_id UUID REFERENCES contacts(id),
    related_appointment_id UUID REFERENCES appointments(id),
    
    -- Activity metadata
    metadata JSONB,
    
    occurred_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

##### **Backend Implementation**
- [ ] **Task 4.4**: Create pipeline service
  ```typescript
  // src/lib/pipelines/pipeline-service.ts
  export interface PipelineService {
    // Pipeline management
    createPipeline(projectId: string, pipelineData: CreatePipelineRequest): Promise<Pipeline>
    updatePipelineStages(pipelineId: string, stages: PipelineStage[]): Promise<Pipeline>
    
    // Item management
    createItem(pipelineId: string, itemData: CreatePipelineItemRequest): Promise<PipelineItem>
    moveItemToStage(itemId: string, newStage: string, notes?: string): Promise<PipelineItem>
    updateItemValue(itemId: string, value: number): Promise<PipelineItem>
    
    // Activity tracking
    logActivity(itemId: string, activity: ActivityData): Promise<PipelineActivity>
    getItemActivities(itemId: string): Promise<PipelineActivity[]>
    
    // Analytics
    getPipelineMetrics(pipelineId: string, dateRange?: DateRange): Promise<PipelineMetrics>
    getForecast(pipelineId: string, period: ForecastPeriod): Promise<SalesForecast>
  }
  ```

##### **Frontend Components**
- [ ] **Task 4.5**: Build pipeline board interface
  ```typescript
  // src/components/pipelines/pipeline-board.tsx
  // - Kanban-style pipeline view
  // - Drag-and-drop stage transitions
  // - Quick item creation and editing
  // - Pipeline metrics dashboard
  ```

- [ ] **Task 4.6**: Create pipeline analytics dashboard
  ```typescript
  // src/components/pipelines/pipeline-analytics.tsx
  // - Conversion rate by stage
  // - Sales forecast charts
  // - Performance trends
  // - Team performance metrics
  ```

---

### 🔄 Phase 2.3: Multi-Channel Campaign System (Week 3-4)

#### **Feature 5: Multi-Channel Campaign Orchestration**
**Estimated Time**: 8-10 days  
**Complexity**: High  

##### **Database Schema**
- [ ] **Task 5.1**: Create campaign management system
  ```sql
  CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(100) DEFAULT 'marketing', -- 'marketing', 'nurture', 'onboarding', 'retention'
    
    -- Campaign configuration
    channels TEXT[] NOT NULL, -- 'email', 'sms', 'social_media', 'push'
    target_segments UUID[], -- References to customer_segments
    
    -- Scheduling
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Content and messaging
    campaign_content JSONB, -- Channel-specific content
    personalization_rules JSONB,
    
    -- Performance tracking
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    -- Budget and costs
    budget DECIMAL(10,2),
    cost_per_channel JSONB,
    roi DECIMAL(10,2),
    
    -- Status and automation
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'
    automation_enabled BOOLEAN DEFAULT false,
    trigger_conditions JSONB,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 5.2**: Create campaign messages and sequences
  ```sql
  CREATE TABLE campaign_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    message_name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'social'
    message_order INTEGER DEFAULT 0,
    
    -- Message content
    subject_line VARCHAR(255), -- For email
    message_content TEXT NOT NULL,
    html_content TEXT, -- For email
    media_attachments TEXT[],
    
    -- Sending configuration
    send_delay_hours INTEGER DEFAULT 0, -- Delay from previous message
    send_time_optimization BOOLEAN DEFAULT false,
    timezone_optimization BOOLEAN DEFAULT false,
    
    -- Personalization
    personalization_tokens JSONB,
    dynamic_content JSONB,
    
    -- A/B testing
    is_ab_test BOOLEAN DEFAULT false,
    ab_test_variants JSONB,
    
    -- Performance
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Task 5.3**: Create campaign execution tracking
  ```sql
  CREATE TABLE campaign_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    message_id UUID REFERENCES campaign_messages(id) ON DELETE CASCADE,
    
    -- Execution details
    channel VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    scheduled_for TIMESTAMP,
    
    -- Delivery status
    delivery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    delivery_attempt INTEGER DEFAULT 1,
    error_message TEXT,
    
    -- Engagement tracking
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    
    -- Attribution
    conversion_event VARCHAR(100),
    conversion_value DECIMAL(10,2),
    converted_at TIMESTAMP,
    
    -- Message metadata
    message_metadata JSONB,
    personalized_content TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

##### **n8n Workflow Implementation**
- [ ] **Task 5.4**: Create multi-channel campaign workflows
  ```typescript
  // n8n Workflow: Multi-Channel Campaign Orchestration
  
  // Workflow 1: Email Campaign Automation
  /*
  Trigger: Campaign Start → 
  Get Segment Contacts → 
  For Each Contact → 
    Personalize Content → 
    Send Email → 
    Track Delivery → 
    Update Campaign Stats
  */
  
  // Workflow 2: SMS Campaign Integration
  /*
  Trigger: SMS Campaign → 
  Check SMS Credits → 
  Format Message → 
  Send via SMS Provider → 
  Handle Delivery Status → 
  Update Contact Engagement
  */
  
  // Workflow 3: Social Media Campaign
  /*
  Trigger: Social Campaign → 
  Generate Platform Content → 
  Schedule Posts → 
  Monitor Engagement → 
  Respond to Interactions → 
  Track Conversions
  */
  ```

##### **Backend Implementation**
- [ ] **Task 5.5**: Create campaign orchestration service
  ```typescript
  // src/lib/campaigns/campaign-service.ts
  export interface CampaignService {
    // Campaign management
    createCampaign(projectId: string, campaignData: CreateCampaignRequest): Promise<Campaign>
    startCampaign(campaignId: string): Promise<void>
    pauseCampaign(campaignId: string): Promise<void>
    
    // Message management
    createMessage(campaignId: string, messageData: CreateMessageRequest): Promise<CampaignMessage>
    scheduleMessage(messageId: string, contacts: Contact[], sendTime: Date): Promise<void>
    
    // Execution
    processCampaignQueue(): Promise<void>
    sendMessage(executionId: string): Promise<MessageResult>
    trackEngagement(executionId: string, engagementType: string): Promise<void>
    
    // Analytics
    getCampaignMetrics(campaignId: string): Promise<CampaignMetrics>
    getChannelPerformance(campaignId: string): Promise<ChannelMetrics[]>
  }
  ```

- [ ] **Task 5.6**: Implement n8n email workflow integration
  ```typescript
  // src/lib/campaigns/n8n-email-service.ts
  export interface N8nEmailService {
    triggerEmailCampaign(campaignData: EmailCampaignData): Promise<void>
    handleEmailWebhook(emailResult: EmailWebhookData): Promise<void>
    trackEmailEngagement(executionId: string, engagementType: string): Promise<void>
  }
  
  // n8n Email Workflows:
  // 1. Free SMTP Email Sending (using Gmail SMTP, Outlook SMTP, etc.)
  // 2. Email template processing and personalization
  // 3. Email open/click tracking via pixel and redirect links
  // 4. Unsubscribe handling
  ```

- [ ] **Task 5.7**: Create n8n social media campaign workflows
  ```typescript
  // src/lib/campaigns/n8n-social-service.ts
  export interface N8nSocialService {
    triggerSocialCampaign(campaignData: SocialCampaignData): Promise<void>
    handleSocialWebhook(socialResult: SocialWebhookData): Promise<void>
    trackSocialEngagement(postId: string, engagementData: EngagementData): Promise<void>
  }
  
  // n8n Social Media Workflows:
  // 1. Multi-platform posting via free APIs
  // 2. Social media monitoring and engagement tracking
  // 3. Automated responses to comments/mentions
  // 4. Social media analytics collection
  ```

##### **Frontend Components**
- [ ] **Task 5.8**: Build campaign builder interface
  ```typescript
  // src/components/campaigns/campaign-builder.tsx
  // - Multi-step campaign creation wizard
  // - Channel selection and configuration
  // - Audience targeting
  // - Message sequence builder
  // - A/B testing setup
  ```

- [ ] **Task 5.9**: Create campaign analytics dashboard
  ```typescript
  // src/components/campaigns/campaign-analytics.tsx
  // - Real-time campaign performance
  // - Channel comparison metrics
  // - Engagement heatmaps
  // - ROI calculations
  // - Export reporting
  ```

---

## 🎯 Sprint 2 Success Criteria

### **Functional Requirements**
- [ ] ✅ Complete CRM system with contact management and segmentation
- [ ] ✅ Calendar system with public booking pages and automated confirmations
- [ ] ✅ Drag-and-drop funnel builder with form creation capabilities
- [ ] ✅ Pipeline management with visual kanban boards and activity tracking
- [ ] ✅ Multi-channel campaign orchestration across email, SMS, and social media

### **Technical Requirements**
- [ ] ✅ Database schema optimized for complex queries and reporting
- [ ] ✅ n8n workflows handling campaign automation and notifications
- [ ] ✅ API endpoints secured with proper rate limiting and validation
- [ ] ✅ Real-time updates for pipeline changes and campaign metrics
- [ ] ✅ Integration with external services (email providers, SMS gateways)

### **Performance Targets**
- [ ] ✅ CRM contact search results within 1 second
- [ ] ✅ Calendar availability checks within 500ms
- [ ] ✅ Funnel page load times under 2 seconds
- [ ] ✅ Pipeline updates reflected in real-time (under 1 second)
- [ ] ✅ Campaign message sending processes 1000+ messages per minute

---

## 🚀 Deployment & Integration Checklist

### **External Service Integrations (FREE/MINIMAL COST)**
- [ ] Email service: FREE SMTP (Gmail, Outlook, or self-hosted SMTP via n8n)
- [ ] Social media platforms: FREE API access (Facebook, Instagram, Twitter, LinkedIn)
- [ ] Calendar synchronization: FREE APIs (Google Calendar, Outlook via n8n)
- [ ] Video conferencing: FREE tiers (Google Meet, Zoom basic, or Jitsi Meet)
- [ ] Payment processing: FREE tiers (Stripe free transactions under limits)

### **n8n Workflow Deployment**
- [ ] Campaign automation workflows tested and deployed
- [ ] Email delivery and tracking workflows (using free SMTP)
- [ ] Social media posting and engagement workflows
- [ ] Appointment reminder and confirmation workflows (email-based)
- [ ] Pipeline stage change notification workflows
- [ ] CRM data synchronization workflows
- [ ] AI-powered lead qualification workflows

### **Data Migration & Testing**
- [ ] Existing contact data migration to new CRM structure
- [ ] Campaign template library setup
- [ ] Pipeline templates for different business types
- [ ] Load testing for concurrent campaign executions
- [ ] Integration testing with all external services

This comprehensive Sprint 2 plan transforms SocialFlow into a complete business management platform, providing advanced CRM, booking, sales funnel, and campaign management capabilities that rival dedicated solutions in each category.