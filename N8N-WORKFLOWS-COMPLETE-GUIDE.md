# 🔄 Complete n8n Workflows Guide for SocialFlow
**External Hosting**: Self-hosted n8n instance (separate from main app)  
**Developer Responsibility**: Yousef  
**Total Workflows**: 17 comprehensive automation workflows  

---

## 🏗️ n8n Infrastructure Setup

### **Initial Setup Requirements**
```bash
# Docker deployment of n8n
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or via docker-compose for production
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
```

### **Environment Variables**
```env
# SocialFlow Integration
SOCIALFLOW_API_URL=https://your-socialflow-domain.com
SOCIALFLOW_WEBHOOK_SECRET=your-webhook-secret

# Social Media APIs
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# AI Services (Free/Open Source)
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_COMPATIBLE_API_URL=your-free-openai-compatible-api
HUGGINGFACE_API_KEY=your-free-huggingface-key

# Email Services (Free SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 📋 Sprint 1 Workflows (5 Workflows)

### **Workflow 1: Social Media Message Ingestion**
```json
{
  "name": "SocialFlow - Message Ingestion",
  "nodes": [
    {
      "type": "webhook",
      "name": "Platform Webhook",
      "webhook": {
        "method": "POST",
        "path": "socialflow-messages"
      }
    },
    {
      "type": "switch",
      "name": "Platform Router",
      "rules": [
        {"platform": "facebook"},
        {"platform": "instagram"},
        {"platform": "twitter"},
        {"platform": "linkedin"}
      ]
    },
    {
      "type": "function",
      "name": "Normalize Message Data",
      "code": `
        // Extract and normalize message data
        const platform = items[0].json.platform;
        const messageData = items[0].json;
        
        return [{
          json: {
            platform: platform,
            external_message_id: messageData.id,
            sender_name: messageData.from?.name,
            content: messageData.message || messageData.text,
            timestamp: messageData.created_time,
            conversation_id: messageData.conversation_id,
            message_type: messageData.attachments ? 'media' : 'text'
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Send to SocialFlow",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/messages/ingest",
      "headers": {
        "Authorization": "Bearer {{$env.SOCIALFLOW_WEBHOOK_SECRET}}"
      }
    }
  ]
}
```

### **Workflow 2: Social Media Content Posting**
```json
{
  "name": "SocialFlow - Content Posting",
  "nodes": [
    {
      "type": "webhook", 
      "name": "Post Request",
      "webhook": {
        "method": "POST",
        "path": "socialflow-post"
      }
    },
    {
      "type": "switch",
      "name": "Platform Switch",
      "rules": [
        {"platform": "facebook"},
        {"platform": "instagram"}, 
        {"platform": "twitter"},
        {"platform": "linkedin"}
      ]
    },
    {
      "type": "facebook",
      "name": "Post to Facebook",
      "credentials": "facebookApi",
      "operation": "create",
      "resource": "post"
    },
    {
      "type": "instagram", 
      "name": "Post to Instagram",
      "credentials": "instagramApi",
      "operation": "create",
      "resource": "media"
    },
    {
      "type": "twitter",
      "name": "Post to Twitter", 
      "credentials": "twitterApi",
      "operation": "tweet"
    },
    {
      "type": "linkedin",
      "name": "Post to LinkedIn",
      "credentials": "linkedInApi", 
      "operation": "create",
      "resource": "post"
    },
    {
      "type": "http",
      "name": "Update SocialFlow Status",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/posts/status"
    }
  ]
}
```

### **Workflow 3: AI Content Generation**
```json
{
  "name": "SocialFlow - AI Content Generation",
  "nodes": [
    {
      "type": "webhook",
      "name": "Content Request", 
      "webhook": {
        "method": "POST",
        "path": "socialflow-ai-content"
      }
    },
    {
      "type": "ollama",
      "name": "Generate Content",
      "credentials": "ollamaApi",
      "model": "llama2",
      "prompt": "Create engaging social media content for {{$json.industry}} targeting {{$json.target_audience}}. Topic: {{$json.topic}}. Tone: {{$json.tone}}. Platform: {{$json.platform}}."
    },
    {
      "type": "function",
      "name": "Format Content",
      "code": `
        const content = items[0].json.response;
        const platform = items[0].json.platform;
        
        // Platform-specific formatting
        let formattedContent = content;
        let hashtags = [];
        
        if (platform === 'twitter') {
          // Ensure under 280 characters
          formattedContent = content.substring(0, 250);
        } else if (platform === 'linkedin') {
          // Professional formatting
          formattedContent = content + '\\n\\n#business #professional';
        }
        
        // Extract hashtags
        hashtags = content.match(/#\\w+/g) || [];
        
        return [{
          json: {
            content: formattedContent,
            hashtags: hashtags,
            platform: platform,
            char_count: formattedContent.length
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Return to SocialFlow",
      "method": "POST", 
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/ai/content-response"
    }
  ]
}
```

### **Workflow 4: Automated Message Responses**
```json
{
  "name": "SocialFlow - Auto Responses",
  "nodes": [
    {
      "type": "webhook",
      "name": "New Message",
      "webhook": {
        "method": "POST", 
        "path": "socialflow-auto-reply"
      }
    },
    {
      "type": "ollama",
      "name": "Classify Message",
      "credentials": "ollamaApi",
      "model": "llama2",
      "prompt": "Classify this customer message into one of these categories: support, sales, general. Message: '{{$json.message}}'. Respond with only the category name."
    },
    {
      "type": "switch",
      "name": "Route by Classification",
      "rules": [
        {"classification": "support"},
        {"classification": "sales"},
        {"classification": "general"}
      ]
    },
    {
      "type": "ollama",
      "name": "Generate Support Response",
      "credentials": "ollamaApi", 
      "model": "llama2",
      "prompt": "Generate a helpful customer support response to this message: '{{$json.message}}'. Be professional and solution-oriented."
    },
    {
      "type": "ollama",
      "name": "Generate Sales Response",
      "credentials": "ollamaApi",
      "model": "llama2", 
      "prompt": "Generate a friendly sales response to this inquiry: '{{$json.message}}'. Be helpful and not pushy."
    },
    {
      "type": "function",
      "name": "Route Response",
      "code": `
        const platform = items[0].json.platform;
        const response = items[0].json.response;
        const conversationId = items[0].json.conversation_id;
        
        return [{
          json: {
            platform: platform,
            conversation_id: conversationId,
            response: response,
            timestamp: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Send Response",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/messages/send-reply"
    }
  ]
}
```

### **Workflow 5: Analytics and Monitoring**
```json
{
  "name": "SocialFlow - Analytics Collection", 
  "nodes": [
    {
      "type": "schedule",
      "name": "Hourly Trigger",
      "rule": {
        "interval": [{"field": "hour", "rule": "*/1"}]
      }
    },
    {
      "type": "facebook",
      "name": "Collect Facebook Analytics",
      "credentials": "facebookApi",
      "operation": "get",
      "resource": "insights"
    },
    {
      "type": "instagram",
      "name": "Collect Instagram Analytics",
      "credentials": "instagramApi", 
      "operation": "get",
      "resource": "insights"
    },
    {
      "type": "twitter",
      "name": "Collect Twitter Analytics",
      "credentials": "twitterApi",
      "operation": "get",
      "resource": "analytics"
    },
    {
      "type": "function",
      "name": "Aggregate Analytics",
      "code": `
        const facebookData = items[0].json;
        const instagramData = items[1].json;
        const twitterData = items[2].json;
        
        return [{
          json: {
            timestamp: new Date().toISOString(),
            facebook: {
              reach: facebookData.reach,
              engagement: facebookData.engagement,
              followers: facebookData.followers
            },
            instagram: {
              reach: instagramData.reach,
              engagement: instagramData.engagement, 
              followers: instagramData.followers
            },
            twitter: {
              impressions: twitterData.impressions,
              engagement: twitterData.engagement,
              followers: twitterData.followers
            }
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Send Analytics to SocialFlow",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/analytics/update"
    }
  ]
}
```

---

## 📋 Sprint 2 Workflows (6 Workflows)

### **Workflow 6: Advanced CRM Automation**
```json
{
  "name": "SocialFlow - CRM Automation",
  "nodes": [
    {
      "type": "webhook",
      "name": "Contact Activity",
      "webhook": {
        "method": "POST",
        "path": "socialflow-crm-activity"
      }
    },
    {
      "type": "function",
      "name": "Calculate Lead Score", 
      "code": `
        const activity = items[0].json;
        let score = 0;
        
        // Scoring algorithm
        if (activity.type === 'email_open') score += 5;
        if (activity.type === 'link_click') score += 10;
        if (activity.type === 'form_submission') score += 25;
        if (activity.type === 'website_visit') score += 3;
        if (activity.type === 'social_engagement') score += 8;
        
        return [{
          json: {
            contact_id: activity.contact_id,
            score_increase: score,
            activity_type: activity.type,
            timestamp: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Update Contact Score",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/crm/update-score"
    },
    {
      "type": "switch",
      "name": "Score-Based Routing",
      "rules": [
        {"score": "> 80", "action": "hot_lead"},
        {"score": "> 50", "action": "warm_lead"}, 
        {"score": "> 20", "action": "cold_lead"}
      ]
    },
    {
      "type": "http",
      "name": "Assign to Sales Rep",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/crm/assign-lead"
    },
    {
      "type": "email",
      "name": "Send Lead Alert",
      "credentials": "smtpEmail",
      "subject": "New Hot Lead: {{$json.contact_name}}",
      "text": "A new hot lead has been identified. Lead score: {{$json.total_score}}"
    }
  ]
}
```

### **Workflow 7: Calendar and Appointment Automation**
```json
{
  "name": "SocialFlow - Calendar Automation",
  "nodes": [
    {
      "type": "webhook",
      "name": "Appointment Event",
      "webhook": {
        "method": "POST",
        "path": "socialflow-appointment"
      }
    },
    {
      "type": "switch", 
      "name": "Event Type Switch",
      "rules": [
        {"event": "booked"},
        {"event": "cancelled"},
        {"event": "completed"}
      ]
    },
    {
      "type": "googleCalendar",
      "name": "Sync to Google Calendar",
      "credentials": "googleCalendarApi",
      "operation": "create",
      "resource": "event"
    },
    {
      "type": "email",
      "name": "Send Confirmation",
      "credentials": "smtpEmail",
      "subject": "Appointment Confirmed - {{$json.appointment_date}}",
      "html": `
        <h2>Appointment Confirmation</h2>
        <p>Your appointment has been confirmed for {{$json.appointment_date}} at {{$json.appointment_time}}.</p>
        <p>Meeting link: {{$json.meeting_link}}</p>
      `
    },
    {
      "type": "schedule",
      "name": "24 Hour Reminder",
      "rule": {
        "dateTime": "{{$json.appointment_date - 1 day}}"
      }
    },
    {
      "type": "email",
      "name": "Send Reminder",
      "credentials": "smtpEmail",
      "subject": "Appointment Reminder - Tomorrow",
      "text": "This is a reminder that you have an appointment tomorrow at {{$json.appointment_time}}."
    },
    {
      "type": "delay",
      "name": "Wait for Completion",
      "amount": "{{$json.appointment_duration}}"
    },
    {
      "type": "email",
      "name": "Send Follow-up Survey",
      "credentials": "smtpEmail",
      "subject": "How was your appointment?",
      "text": "Please rate your experience: {{$json.survey_link}}"
    }
  ]
}
```

### **Workflow 8: Sales Funnel Automation**
```json
{
  "name": "SocialFlow - Funnel Automation",
  "nodes": [
    {
      "type": "webhook",
      "name": "Form Submission",
      "webhook": {
        "method": "POST",
        "path": "socialflow-form-submit"
      }
    },
    {
      "type": "function",
      "name": "Process Form Data",
      "code": `
        const formData = items[0].json;
        
        return [{
          json: {
            email: formData.email,
            name: formData.first_name + ' ' + formData.last_name,
            phone: formData.phone,
            company: formData.company,
            source: formData.utm_source,
            funnel_id: formData.funnel_id,
            page_id: formData.page_id
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Create Contact in CRM",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/crm/create-contact"
    },
    {
      "type": "switch",
      "name": "Lead Source Routing",
      "rules": [
        {"source": "facebook", "sequence": "social_media_nurture"},
        {"source": "google", "sequence": "search_nurture"},
        {"source": "direct", "sequence": "direct_nurture"}
      ]
    },
    {
      "type": "email",
      "name": "Welcome Email",
      "credentials": "smtpEmail",
      "subject": "Welcome to {{$json.company_name}}!",
      "html": "Welcome email template here"
    },
    {
      "type": "delay",
      "name": "Wait 2 Days",
      "amount": "2 days"
    },
    {
      "type": "email", 
      "name": "Educational Email 1",
      "credentials": "smtpEmail",
      "subject": "Here's how we can help your business",
      "html": "Educational email template"
    },
    {
      "type": "delay",
      "name": "Wait 3 Days",
      "amount": "3 days"
    },
    {
      "type": "email",
      "name": "Case Study Email",
      "credentials": "smtpEmail", 
      "subject": "See how we helped [Similar Company]",
      "html": "Case study email template"
    }
  ]
}
```

### **Workflow 9: Pipeline Management Automation**
```json
{
  "name": "SocialFlow - Pipeline Automation",
  "nodes": [
    {
      "type": "webhook",
      "name": "Pipeline Stage Change",
      "webhook": {
        "method": "POST",
        "path": "socialflow-pipeline-update"
      }
    },
    {
      "type": "switch",
      "name": "Stage Switch",
      "rules": [
        {"stage": "qualified"},
        {"stage": "proposal"},
        {"stage": "negotiation"},
        {"stage": "won"},
        {"stage": "lost"}
      ]
    },
    {
      "type": "http",
      "name": "Update Deal Probability",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/pipeline/update-probability",
      "body": {
        "deal_id": "{{$json.deal_id}}",
        "probability": "{{$json.stage_probability}}"
      }
    },
    {
      "type": "function",
      "name": "Create Follow-up Tasks",
      "code": `
        const stage = items[0].json.stage;
        const dealId = items[0].json.deal_id;
        
        let tasks = [];
        
        switch(stage) {
          case 'qualified':
            tasks.push({
              title: 'Send proposal',
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high'
            });
            break;
          case 'proposal':
            tasks.push({
              title: 'Follow up on proposal',
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'medium'
            });
            break;
        }
        
        return tasks.map(task => ({
          json: {
            ...task,
            deal_id: dealId
          }
        }));
      `
    },
    {
      "type": "http",
      "name": "Create Tasks",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/pipeline/create-tasks"
    },
    {
      "type": "email",
      "name": "Notify Sales Rep",
      "credentials": "smtpEmail",
      "subject": "Deal Update: {{$json.deal_name}}",
      "text": "Deal {{$json.deal_name}} has moved to {{$json.stage}} stage."
    }
  ]
}
```

### **Workflow 10: Multi-Channel Campaign Execution**
```json
{
  "name": "SocialFlow - Campaign Execution",
  "nodes": [
    {
      "type": "webhook",
      "name": "Campaign Launch",
      "webhook": {
        "method": "POST",
        "path": "socialflow-campaign-launch"
      }
    },
    {
      "type": "http",
      "name": "Get Campaign Audience",
      "method": "GET",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/campaigns/{{$json.campaign_id}}/audience"
    },
    {
      "type": "function",
      "name": "Split by Channel Preference",
      "code": `
        const contacts = items[0].json.contacts;
        
        return contacts.map(contact => ({
          json: {
            contact_id: contact.id,
            email: contact.email,
            phone: contact.phone,
            preferred_channel: contact.preferred_channel,
            campaign_id: items[0].json.campaign_id,
            message_content: items[0].json.message_content
          }
        }));
      `
    },
    {
      "type": "switch",
      "name": "Channel Router",
      "rules": [
        {"preferred_channel": "email"},
        {"preferred_channel": "sms"},
        {"preferred_channel": "social"}
      ]
    },
    {
      "type": "email",
      "name": "Send Email",
      "credentials": "smtpEmail",
      "to": "{{$json.email}}",
      "subject": "{{$json.campaign_subject}}",
      "html": "{{$json.message_content}}"
    },
    {
      "type": "function",
      "name": "Track Email Sending",
      "code": `
        return [{
          json: {
            campaign_id: items[0].json.campaign_id,
            contact_id: items[0].json.contact_id,
            channel: 'email',
            status: 'sent',
            timestamp: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Update Campaign Stats",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/campaigns/track-delivery"
    }
  ]
}
```

### **Workflow 11: AI-Powered Business Intelligence**
```json
{
  "name": "SocialFlow - Business Intelligence",
  "nodes": [
    {
      "type": "schedule",
      "name": "Daily BI Run",
      "rule": {
        "interval": [{"field": "hour", "rule": "9"}]
      }
    },
    {
      "type": "http",
      "name": "Collect All Platform Data",
      "method": "GET",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/analytics/all-data"
    },
    {
      "type": "ollama",
      "name": "Analyze Business Data",
      "credentials": "ollamaApi",
      "model": "llama2",
      "prompt": `
        Analyze this business data and provide insights:
        
        Data: {{$json.business_data}}
        
        Please provide:
        1. Key performance trends
        2. Areas of concern
        3. Growth opportunities  
        4. Actionable recommendations
        
        Format as JSON with these keys: trends, concerns, opportunities, recommendations
      `
    },
    {
      "type": "function",
      "name": "Parse AI Insights",
      "code": `
        const aiResponse = items[0].json.response;
        let insights;
        
        try {
          insights = JSON.parse(aiResponse);
        } catch (e) {
          // Fallback parsing if AI doesn't return valid JSON
          insights = {
            trends: ["AI analysis parsing error"],
            concerns: ["Unable to parse AI insights"],
            opportunities: ["Review data analysis setup"],
            recommendations: ["Check AI model configuration"]
          };
        }
        
        return [{
          json: {
            date: new Date().toISOString().split('T')[0],
            insights: insights,
            raw_data: items[0].json.business_data
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Save Business Insights", 
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/analytics/save-insights"
    },
    {
      "type": "email",
      "name": "Send Daily Report",
      "credentials": "smtpEmail",
      "subject": "Daily Business Intelligence Report - {{$json.date}}",
      "html": `
        <h2>Daily Business Intelligence Report</h2>
        <h3>Key Trends:</h3>
        <ul>{{#each $json.insights.trends}}<li>{{this}}</li>{{/each}}</ul>
        
        <h3>Areas of Concern:</h3>
        <ul>{{#each $json.insights.concerns}}<li>{{this}}</li>{{/each}}</ul>
        
        <h3>Opportunities:</h3>
        <ul>{{#each $json.insights.opportunities}}<li>{{this}}</li>{{/each}}</ul>
        
        <h3>Recommendations:</h3>
        <ul>{{#each $json.insights.recommendations}}<li>{{this}}</li>{{/each}}</ul>
      `
    }
  ]
}
```

---

## 📋 Sprint 3 Workflows (6 Workflows)

### **Workflow 12: Website Builder & Deployment Automation**
```json
{
  "name": "SocialFlow - Website Deployment",
  "nodes": [
    {
      "type": "webhook",
      "name": "Website Publish Request",
      "webhook": {
        "method": "POST",
        "path": "socialflow-website-deploy"
      }
    },
    {
      "type": "http",
      "name": "Get Website Data",
      "method": "GET",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/websites/{{$json.website_id}}/export"
    },
    {
      "type": "function",
      "name": "Generate Static Files",
      "code": `
        const websiteData = items[0].json;
        const pages = websiteData.pages;
        
        let staticFiles = {};
        
        // Generate HTML files
        pages.forEach(page => {
          const html = generateHTML(page);
          staticFiles[page.slug + '.html'] = html;
        });
        
        // Generate CSS
        staticFiles['styles.css'] = generateCSS(websiteData.theme);
        
        // Generate sitemap
        staticFiles['sitemap.xml'] = generateSitemap(pages);
        
        function generateHTML(page) {
          return \`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>\${page.meta_title}</title>
              <meta name="description" content="\${page.meta_description}">
              <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
              \${renderPageContent(page.content)}
            </body>
            </html>
          \`;
        }
        
        function renderPageContent(content) {
          // Convert page builder JSON to HTML
          return content.map(element => {
            switch(element.type) {
              case 'heading':
                return \`<h\${element.level}>\${element.text}</h\${element.level}>\`;
              case 'paragraph':
                return \`<p>\${element.text}</p>\`;
              case 'image':
                return \`<img src="\${element.src}" alt="\${element.alt}">\`;
              default:
                return '';
            }
          }).join('');
        }
        
        function generateCSS(theme) {
          return \`
            body { 
              font-family: \${theme.font_family}; 
              color: \${theme.text_color}; 
              background: \${theme.background_color}; 
            }
            h1, h2, h3, h4, h5, h6 { 
              color: \${theme.heading_color}; 
            }
          \`;
        }
        
        function generateSitemap(pages) {
          const urls = pages.map(page => 
            \`<url><loc>\${websiteData.domain}/\${page.slug}</loc></url>\`
          ).join('');
          
          return \`<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              \${urls}
            </urlset>\`;
        }
        
        return [{
          json: {
            website_id: websiteData.id,
            domain: websiteData.domain,
            files: staticFiles
          }
        }];
      `
    },
    {
      "type": "github",
      "name": "Deploy to GitHub Pages",
      "credentials": "githubApi",
      "operation": "create",
      "resource": "repository"
    },
    {
      "type": "function",
      "name": "Configure Custom Domain",
      "code": `
        // Configure custom domain with Cloudflare or Vercel
        const domain = items[0].json.domain;
        const deploymentUrl = items[0].json.deployment_url;
        
        return [{
          json: {
            domain: domain,
            deployment_url: deploymentUrl,
            ssl_status: 'enabled',
            cdn_status: 'enabled'
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Update Website Status",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/websites/deployment-complete",
      "body": {
        "website_id": "{{$json.website_id}}",
        "deployment_url": "{{$json.deployment_url}}",
        "status": "published"
      }
    }
  ]
}
```

### **Workflow 13: Advanced AI Agent Orchestration**
```json
{
  "name": "SocialFlow - AI Agent Orchestration", 
  "nodes": [
    {
      "type": "webhook",
      "name": "AI Agent Request",
      "webhook": {
        "method": "POST",
        "path": "socialflow-ai-agent"
      }
    },
    {
      "type": "http",
      "name": "Get Conversation Context",
      "method": "GET", 
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/conversations/{{$json.conversation_id}}/context"
    },
    {
      "type": "function",
      "name": "Determine AI Model",
      "code": `
        const request = items[0].json;
        const context = items[1].json;
        
        let selectedModel = 'llama2'; // Default
        
        // Choose model based on complexity
        if (request.complexity === 'high' || context.conversation_length > 10) {
          selectedModel = 'llama2:13b'; // More capable model
        } else if (request.type === 'creative') {
          selectedModel = 'codellama'; // For code/creative tasks
        }
        
        return [{
          json: {
            model: selectedModel,
            conversation_context: context.messages.slice(-5), // Last 5 messages
            user_message: request.message,
            user_preferences: context.user_preferences,
            business_context: context.business_context
          }
        }];
      `
    },
    {
      "type": "ollama",
      "name": "Process with AI",
      "credentials": "ollamaApi",
      "model": "{{$json.model}}",
      "prompt": `
        You are a helpful business assistant for SocialFlow. Here's the conversation context:
        
        Previous messages: {{$json.conversation_context}}
        User preferences: {{$json.user_preferences}}
        Business context: {{$json.business_context}}
        
        Current user message: "{{$json.user_message}}"
        
        Provide a helpful, contextually appropriate response. If the user is asking about business operations, reference their specific business context. If they need technical help, provide step-by-step guidance.
      `
    },
    {
      "type": "function",
      "name": "Post-process Response",
      "code": `
        const response = items[0].json.response;
        const originalRequest = items[0].json;
        
        // Extract any action items from the response
        const actionItems = extractActionItems(response);
        
        // Check if response requires follow-up
        const needsFollowUp = response.toLowerCase().includes('follow up') || 
                             response.toLowerCase().includes('remind me') ||
                             response.toLowerCase().includes('schedule');
        
        function extractActionItems(text) {
          const actionRegex = /(create|schedule|send|update|delete|add|remove)\s+([^.!?]+)/gi;
          const matches = [];
          let match;
          
          while ((match = actionRegex.exec(text)) !== null) {
            matches.push({
              action: match[1].toLowerCase(),
              object: match[2].trim()
            });
          }
          
          return matches;
        }
        
        return [{
          json: {
            conversation_id: originalRequest.conversation_id,
            ai_response: response,
            action_items: actionItems,
            needs_follow_up: needsFollowUp,
            response_type: actionItems.length > 0 ? 'actionable' : 'informational',
            timestamp: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "switch",
      "name": "Action Required?",
      "rules": [
        {"response_type": "actionable"},
        {"response_type": "informational"}
      ]
    },
    {
      "type": "function",
      "name": "Execute Actions",
      "code": `
        const actionItems = items[0].json.action_items;
        const results = [];
        
        actionItems.forEach(action => {
          switch(action.action) {
            case 'create':
              results.push(executeCreateAction(action.object));
              break;
            case 'schedule':
              results.push(executeScheduleAction(action.object));
              break;
            case 'send':
              results.push(executeSendAction(action.object));
              break;
            default:
              results.push({action: action.action, status: 'not_implemented'});
          }
        });
        
        function executeCreateAction(object) {
          // Trigger appropriate creation workflows
          return {action: 'create', object: object, status: 'queued'};
        }
        
        function executeScheduleAction(object) {
          // Trigger scheduling workflows  
          return {action: 'schedule', object: object, status: 'queued'};
        }
        
        function executeSendAction(object) {
          // Trigger sending workflows
          return {action: 'send', object: object, status: 'queued'};
        }
        
        return [{
          json: {
            conversation_id: items[0].json.conversation_id,
            ai_response: items[0].json.ai_response,
            executed_actions: results,
            timestamp: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Send Response to SocialFlow",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/ai-agent/response"
    },
    {
      "type": "http",
      "name": "Log Conversation",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/ai-agent/log-interaction"
    }
  ]
}
```

### **Workflow 14: Learning Management Automation**
```json
{
  "name": "SocialFlow - Learning Management",
  "nodes": [
    {
      "type": "webhook",
      "name": "Learning Event",
      "webhook": {
        "method": "POST",
        "path": "socialflow-learning"
      }
    },
    {
      "type": "switch",
      "name": "Event Type Switch",
      "rules": [
        {"event": "enrollment"},
        {"event": "lesson_completion"},
        {"event": "course_completion"},
        {"event": "quiz_submission"}
      ]
    },
    {
      "type": "http",
      "name": "Update Student Progress",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/courses/update-progress"
    },
    {
      "type": "function",
      "name": "Check Unlock Conditions",
      "code": `
        const studentProgress = items[0].json;
        const courseStructure = items[1].json;
        
        let unlockedContent = [];
        
        courseStructure.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            if (lesson.unlock_condition) {
              const conditionMet = checkUnlockCondition(
                lesson.unlock_condition, 
                studentProgress
              );
              
              if (conditionMet && !studentProgress.unlocked_lessons.includes(lesson.id)) {
                unlockedContent.push({
                  type: 'lesson',
                  id: lesson.id,
                  title: lesson.title,
                  module: module.title
                });
              }
            }
          });
        });
        
        function checkUnlockCondition(condition, progress) {
          switch(condition.type) {
            case 'previous_lesson':
              return progress.completed_lessons.includes(condition.lesson_id);
            case 'quiz_score':
              const quizScore = progress.quiz_scores[condition.quiz_id];
              return quizScore && quizScore >= condition.minimum_score;
            case 'time_elapsed':
              const enrollmentDate = new Date(progress.enrolled_at);
              const daysSinceEnrollment = (Date.now() - enrollmentDate) / (1000 * 60 * 60 * 24);
              return daysSinceEnrollment >= condition.days;
            default:
              return false;
          }
        }
        
        return [{
          json: {
            student_id: studentProgress.student_id,
            course_id: studentProgress.course_id,
            unlocked_content: unlockedContent,
            progress_percentage: calculateProgressPercentage(studentProgress, courseStructure)
          }
        }];
      `
    },
    {
      "type": "email",
      "name": "Send Progress Notification",
      "credentials": "smtpEmail",
      "to": "{{$json.student_email}}",
      "subject": "New content unlocked in {{$json.course_title}}!",
      "html": `
        <h2>Congratulations on your progress!</h2>
        <p>You've unlocked new content in {{$json.course_title}}:</p>
        <ul>
          {{#each $json.unlocked_content}}
          <li>{{this.title}} ({{this.module}})</li>
          {{/each}}
        </ul>
        <p>Your progress: {{$json.progress_percentage}}%</p>
        <a href="{{$json.course_url}}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Continue Learning</a>
      `
    },
    {
      "type": "function",
      "name": "Generate Personalized Recommendations",
      "code": `
        const studentData = items[0].json;
        const learningAnalytics = items[1].json;
        
        let recommendations = [];
        
        // Analyze learning patterns
        const averageTimePerLesson = learningAnalytics.total_time_spent / learningAnalytics.completed_lessons_count;
        const preferredLearningTime = identifyPreferredLearningTime(learningAnalytics.session_times);
        const strongTopics = identifyStrongTopics(learningAnalytics.quiz_scores);
        const weakTopics = identifyWeakTopics(learningAnalytics.quiz_scores);
        
        // Generate recommendations
        if (averageTimePerLesson > 30) {
          recommendations.push({
            type: 'pacing',
            message: 'Consider breaking study sessions into shorter segments for better retention'
          });
        }
        
        if (weakTopics.length > 0) {
          recommendations.push({
            type: 'review',
            message: \`Consider reviewing these topics: \${weakTopics.join(', ')}\`,
            suggested_content: getReviewContent(weakTopics)
          });
        }
        
        if (strongTopics.length > 0) {
          recommendations.push({
            type: 'advancement',
            message: \`You're excelling at \${strongTopics.join(', ')}. Ready for advanced content?\`,
            suggested_content: getAdvancedContent(strongTopics)
          });
        }
        
        function identifyPreferredLearningTime(sessionTimes) {
          const hourCounts = {};
          sessionTimes.forEach(time => {
            const hour = new Date(time).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          });
          
          return Object.keys(hourCounts).reduce((a, b) => 
            hourCounts[a] > hourCounts[b] ? a : b
          );
        }
        
        function identifyStrongTopics(quizScores) {
          return Object.entries(quizScores)
            .filter(([topic, score]) => score >= 85)
            .map(([topic, score]) => topic);
        }
        
        function identifyWeakTopics(quizScores) {
          return Object.entries(quizScores)
            .filter(([topic, score]) => score < 70)
            .map(([topic, score]) => topic);
        }
        
        return [{
          json: {
            student_id: studentData.student_id,
            recommendations: recommendations,
            preferred_learning_time: preferredLearningTime,
            next_suggested_session: getNextSuggestedSession(preferredLearningTime)
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Save Learning Analytics",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/learning/save-analytics"
    }
  ]
}
```

### **Workflow 15: Enterprise Reporting & Business Intelligence**
```json
{
  "name": "SocialFlow - Enterprise Reporting",
  "nodes": [
    {
      "type": "schedule",
      "name": "Weekly Report Generation",
      "rule": {
        "interval": [{"field": "weekday", "rule": "1"}], // Monday
        "time": "09:00"
      }
    },
    {
      "type": "http",
      "name": "Collect All Business Data",
      "method": "GET",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/reports/comprehensive-data"
    },
    {
      "type": "function",
      "name": "Process Enterprise Metrics",
      "code": `
        const businessData = items[0].json;
        
        // Calculate KPIs
        const kpis = {
          // Sales metrics
          revenue: businessData.sales.total_revenue,
          deals_won: businessData.sales.deals_won,
          conversion_rate: businessData.sales.deals_won / businessData.sales.total_leads * 100,
          average_deal_size: businessData.sales.total_revenue / businessData.sales.deals_won,
          sales_cycle_length: businessData.sales.average_cycle_days,
          
          // Marketing metrics  
          total_leads: businessData.marketing.leads_generated,
          cost_per_lead: businessData.marketing.total_spend / businessData.marketing.leads_generated,
          email_open_rate: businessData.marketing.emails_opened / businessData.marketing.emails_sent * 100,
          social_engagement: businessData.social.total_engagements,
          website_traffic: businessData.website.unique_visitors,
          
          // Customer metrics
          customer_acquisition_cost: businessData.marketing.total_spend / businessData.customers.new_customers,
          customer_lifetime_value: businessData.customers.average_lifetime_value,
          churn_rate: businessData.customers.churned / businessData.customers.total * 100,
          satisfaction_score: businessData.customers.average_satisfaction,
          
          // Operations metrics
          project_completion_rate: businessData.projects.completed / businessData.projects.total * 100,
          team_productivity: businessData.team.tasks_completed / businessData.team.total_hours,
          support_resolution_time: businessData.support.average_resolution_hours
        };
        
        // Calculate trends (compared to previous period)
        const trends = calculateTrends(kpis, businessData.previous_period);
        
        // Identify areas of focus
        const insights = generateInsights(kpis, trends);
        
        function calculateTrends(current, previous) {
          const trends = {};
          Object.keys(current).forEach(key => {
            if (previous[key] && previous[key] !== 0) {
              trends[key] = ((current[key] - previous[key]) / previous[key] * 100).toFixed(1);
            } else {
              trends[key] = 'N/A';
            }
          });
          return trends;
        }
        
        function generateInsights(kpis, trends) {
          const insights = [];
          
          if (parseFloat(trends.conversion_rate) < -5) {
            insights.push({
              type: 'concern',
              metric: 'conversion_rate',
              message: 'Conversion rate has decreased significantly',
              recommendation: 'Review lead qualification process and sales training'
            });
          }
          
          if (parseFloat(trends.customer_acquisition_cost) > 10) {
            insights.push({
              type: 'concern', 
              metric: 'customer_acquisition_cost',
              message: 'Customer acquisition costs are rising',
              recommendation: 'Optimize marketing channels and improve conversion funnels'
            });
          }
          
          if (parseFloat(trends.revenue) > 15) {
            insights.push({
              type: 'success',
              metric: 'revenue',
              message: 'Revenue growth is strong',
              recommendation: 'Consider scaling successful channels and expanding team'
            });
          }
          
          return insights;
        }
        
        return [{
          json: {
            report_date: new Date().toISOString().split('T')[0],
            kpis: kpis,
            trends: trends,
            insights: insights,
            executive_summary: generateExecutiveSummary(kpis, trends, insights)
          }
        }];
      `
    },
    {
      "type": "ollama",
      "name": "Generate AI Analysis",
      "credentials": "ollamaApi",
      "model": "llama2",
      "prompt": `
        Analyze this business performance data and provide executive-level insights:
        
        KPIs: {{$json.kpis}}
        Trends: {{$json.trends}}  
        Current Insights: {{$json.insights}}
        
        Please provide:
        1. Overall business health assessment
        2. Top 3 priorities for next quarter
        3. Potential risks and mitigation strategies
        4. Growth opportunities
        
        Format as professional executive summary.
      `
    },
    {
      "type": "function",
      "name": "Generate Report Visualizations",
      "code": `
        const reportData = items[0].json;
        const aiAnalysis = items[1].json.response;
        
        // Generate chart configurations for frontend
        const chartConfigs = {
          revenue_trend: {
            type: 'line',
            data: reportData.revenue_history,
            title: 'Revenue Trend',
            color: '#2ecc71'
          },
          conversion_funnel: {
            type: 'funnel',
            data: [
              {label: 'Leads', value: reportData.kpis.total_leads},
              {label: 'Qualified', value: reportData.kpis.total_leads * 0.6},
              {label: 'Proposals', value: reportData.kpis.total_leads * 0.3},
              {label: 'Closed Won', value: reportData.kpis.deals_won}
            ],
            title: 'Sales Funnel'
          },
          channel_performance: {
            type: 'pie',
            data: reportData.marketing_channels,
            title: 'Marketing Channel Performance'
          },
          team_productivity: {
            type: 'bar',
            data: reportData.team_metrics,
            title: 'Team Productivity'
          }
        };
        
        return [{
          json: {
            report_id: generateReportId(),
            report_date: reportData.report_date,
            kpis: reportData.kpis,
            trends: reportData.trends,
            insights: reportData.insights,
            ai_analysis: aiAnalysis,
            visualizations: chartConfigs,
            executive_summary: reportData.executive_summary
          }
        }];
        
        function generateReportId() {
          return 'RPT_' + Date.now().toString(36).toUpperCase();
        }
      `
    },
    {
      "type": "http",
      "name": "Save Enterprise Report",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/reports/save-enterprise-report"
    },
    {
      "type": "email",
      "name": "Send Executive Summary",
      "credentials": "smtpEmail",
      "to": "executives@company.com",
      "subject": "Weekly Executive Report - {{$json.report_date}}",
      "html": `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            Executive Business Report - {{$json.report_date}}
          </h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50;">Key Performance Indicators</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
              <div style="text-align: center; padding: 15px; background: white; border-radius: 5px;">
                <h3 style="margin: 0; color: #27ae60;">\${{$json.kpis.revenue}}</h3>
                <p style="margin: 5px 0; color: #7f8c8d;">Revenue</p>
                <small style="color: {{$json.trends.revenue > 0 ? '#27ae60' : '#e74c3c'}};">
                  {{$json.trends.revenue}}% vs last period
                </small>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 5px;">
                <h3 style="margin: 0; color: #3498db;">{{$json.kpis.deals_won}}</h3>
                <p style="margin: 5px 0; color: #7f8c8d;">Deals Won</p>
                <small style="color: {{$json.trends.deals_won > 0 ? '#27ae60' : '#e74c3c'}};">
                  {{$json.trends.deals_won}}% vs last period
                </small>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 5px;">
                <h3 style="margin: 0; color: #9b59b6;">{{$json.kpis.conversion_rate}}%</h3>
                <p style="margin: 5px 0; color: #7f8c8d;">Conversion Rate</p>
                <small style="color: {{$json.trends.conversion_rate > 0 ? '#27ae60' : '#e74c3c'}};">
                  {{$json.trends.conversion_rate}}% vs last period
                </small>
              </div>
            </div>
          </div>
          
          <div style="margin: 20px 0;">
            <h2 style="color: #2c3e50;">AI Analysis & Insights</h2>
            <div style="background: white; padding: 20px; border-left: 4px solid #3498db;">
              {{$json.ai_analysis}}
            </div>
          </div>
          
          <div style="margin: 20px 0;">
            <h2 style="color: #2c3e50;">Key Insights</h2>
            {{#each $json.insights}}
            <div style="margin: 10px 0; padding: 15px; border-radius: 5px; 
                        background: {{#if (eq this.type 'concern')}}#fdf2f2{{else}}#f0f9ff{{/if}}; 
                        border-left: 4px solid {{#if (eq this.type 'concern')}}#ef4444{{else}}#22c55e{{/if}};">
              <strong>{{this.message}}</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">{{this.recommendation}}</p>
            </div>
            {{/each}}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{$env.SOCIALFLOW_API_URL}}/reports/{{$json.report_id}}" 
               style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              View Full Report
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280;">
            <small>Generated automatically by SocialFlow Business Intelligence</small>
          </div>
        </div>
      `
    }
  ]
}
```

### **Workflow 16: Universal Tool Automation**
```json
{
  "name": "SocialFlow - Universal Tools",
  "nodes": [
    {
      "type": "webhook",
      "name": "Universal Tool Request",
      "webhook": {
        "method": "POST",
        "path": "socialflow-universal-tools"
      }
    },
    {
      "type": "switch",
      "name": "Tool Type Switch",
      "rules": [
        {"tool": "qr_code"},
        {"tool": "template"},
        {"tool": "integration_sync"},
        {"tool": "bulk_action"}
      ]
    },
    {
      "type": "function",
      "name": "Generate QR Code",
      "code": `
        const qrRequest = items[0].json;
        
        // QR Code generation logic
        const qrData = {
          text: qrRequest.data,
          size: qrRequest.size || 200,
          error_correction: qrRequest.error_correction || 'M',
          format: qrRequest.format || 'PNG'
        };
        
        // Generate QR code (using external library or service)
        const qrCodeUrl = generateQRCode(qrData);
        
        function generateQRCode(data) {
          // Integration with QR code generation service
          // Return URL to generated QR code
          return \`https://api.qrserver.com/v1/create-qr-code/?size=\${data.size}x\${data.size}&data=\${encodeURIComponent(data.text)}\`;
        }
        
        return [{
          json: {
            qr_id: 'QR_' + Date.now().toString(36).toUpperCase(),
            qr_url: qrCodeUrl,
            data: qrRequest.data,
            size: qrData.size,
            created_at: new Date().toISOString(),
            tracking_enabled: qrRequest.tracking || false
          }
        }];
      `
    },
    {
      "type": "function",
      "name": "Process Template Request",
      "code": `
        const templateRequest = items[0].json;
        
        const templateProcessing = {
          template_id: templateRequest.template_id,
          variables: templateRequest.variables,
          output_format: templateRequest.format || 'html'
        };
        
        // Load template
        const template = loadTemplate(templateProcessing.template_id);
        
        // Replace variables
        let processedContent = template.content;
        Object.keys(templateProcessing.variables).forEach(key => {
          const placeholder = new RegExp(\`{{\\s*\${key}\\s*}}\`, 'g');
          processedContent = processedContent.replace(placeholder, templateProcessing.variables[key]);
        });
        
        function loadTemplate(templateId) {
          // Load from template library
          // This would typically fetch from database
          return {
            id: templateId,
            name: 'Sample Template',
            content: \`
              <div>
                <h1>{{ title }}</h1>
                <p>{{ content }}</p>
                <footer>{{ company_name }}</footer>
              </div>
            \`
          };
        }
        
        return [{
          json: {
            template_id: templateProcessing.template_id,
            processed_content: processedContent,
            output_format: templateProcessing.output_format,
            variables_used: Object.keys(templateProcessing.variables),
            processing_time: Date.now() - items[0].json.request_time
          }
        }];
      `
    },
    {
      "type": "function", 
      "name": "Execute Integration Sync",
      "code": `
        const syncRequest = items[0].json;
        
        const syncResults = [];
        
        // Process each integration
        syncRequest.integrations.forEach(integration => {
          try {
            const result = syncIntegration(integration);
            syncResults.push(result);
          } catch (error) {
            syncResults.push({
              integration: integration.name,
              status: 'error',
              error: error.message
            });
          }
        });
        
        function syncIntegration(integration) {
          switch(integration.type) {
            case 'crm':
              return syncCRM(integration);
            case 'email':
              return syncEmail(integration);
            case 'social':
              return syncSocial(integration);
            default:
              throw new Error(\`Unsupported integration type: \${integration.type}\`);
          }
        }
        
        function syncCRM(integration) {
          // CRM sync logic
          return {
            integration: integration.name,
            status: 'success',
            records_synced: 150,
            last_sync: new Date().toISOString()
          };
        }
        
        function syncEmail(integration) {
          // Email sync logic
          return {
            integration: integration.name,
            status: 'success',
            emails_processed: 75,
            last_sync: new Date().toISOString()
          };
        }
        
        function syncSocial(integration) {
          // Social media sync logic
          return {
            integration: integration.name,
            status: 'success',
            posts_synced: 25,
            last_sync: new Date().toISOString()
          };
        }
        
        return [{
          json: {
            sync_id: 'SYNC_' + Date.now().toString(36).toUpperCase(),
            sync_results: syncResults,
            total_integrations: syncRequest.integrations.length,
            successful_syncs: syncResults.filter(r => r.status === 'success').length,
            failed_syncs: syncResults.filter(r => r.status === 'error').length,
            completed_at: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Save Tool Results",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/universal-tools/save-results"
    },
    {
      "type": "function",
      "name": "Generate Usage Analytics",
      "code": `
        const toolResult = items[0].json;
        
        return [{
          json: {
            tool_type: toolResult.tool_type,
            usage_count: 1,
            success: toolResult.status === 'success',
            processing_time: toolResult.processing_time || 0,
            timestamp: new Date().toISOString(),
            user_id: toolResult.user_id
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Update Usage Statistics",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/analytics/tool-usage"
    }
  ]
}
```

### **Workflow 17: Enterprise Performance Optimization**
```json
{
  "name": "SocialFlow - Performance Optimization",
  "nodes": [
    {
      "type": "schedule",
      "name": "Performance Check",
      "rule": {
        "interval": [{"field": "hour", "rule": "*/6"}] // Every 6 hours
      }
    },
    {
      "type": "http",
      "name": "Check System Health",
      "method": "GET",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/system/health-check"
    },
    {
      "type": "function",
      "name": "Analyze Performance Metrics",
      "code": `
        const healthData = items[0].json;
        
        const analysis = {
          database: analyzeDatabase(healthData.database),
          api: analyzeAPI(healthData.api),
          frontend: analyzeFrontend(healthData.frontend),
          integrations: analyzeIntegrations(healthData.integrations)
        };
        
        const overallScore = calculateOverallScore(analysis);
        const recommendations = generateRecommendations(analysis);
        
        function analyzeDatabase(dbMetrics) {
          return {
            query_performance: dbMetrics.avg_query_time < 100 ? 'good' : 'needs_optimization',
            connection_count: dbMetrics.active_connections,
            cache_hit_ratio: dbMetrics.cache_hit_ratio,
            slow_queries: dbMetrics.slow_queries || []
          };
        }
        
        function analyzeAPI(apiMetrics) {
          return {
            response_time: apiMetrics.avg_response_time,
            error_rate: apiMetrics.error_rate,
            requests_per_minute: apiMetrics.requests_per_minute,
            status: apiMetrics.avg_response_time < 200 ? 'good' : 'needs_optimization'
          };
        }
        
        function analyzeFrontend(frontendMetrics) {
          return {
            page_load_time: frontendMetrics.avg_page_load,
            bundle_size: frontendMetrics.bundle_size,
            lighthouse_score: frontendMetrics.lighthouse_score,
            status: frontendMetrics.lighthouse_score > 80 ? 'good' : 'needs_optimization'
          };
        }
        
        function analyzeIntegrations(integrationMetrics) {
          const integrationHealth = {};
          integrationMetrics.forEach(integration => {
            integrationHealth[integration.name] = {
              status: integration.status,
              response_time: integration.avg_response_time,
              success_rate: integration.success_rate
            };
          });
          return integrationHealth;
        }
        
        function calculateOverallScore(analysis) {
          let score = 100;
          
          if (analysis.database.query_performance === 'needs_optimization') score -= 20;
          if (analysis.api.status === 'needs_optimization') score -= 20;
          if (analysis.frontend.status === 'needs_optimization') score -= 20;
          
          Object.values(analysis.integrations).forEach(integration => {
            if (integration.success_rate < 95) score -= 10;
          });
          
          return Math.max(score, 0);
        }
        
        function generateRecommendations(analysis) {
          const recommendations = [];
          
          if (analysis.database.query_performance === 'needs_optimization') {
            recommendations.push({
              category: 'database',
              priority: 'high',
              action: 'optimize_queries',
              description: 'Add indexes to slow queries',
              slow_queries: analysis.database.slow_queries
            });
          }
          
          if (analysis.api.response_time > 300) {
            recommendations.push({
              category: 'api',
              priority: 'medium',
              action: 'optimize_api_performance',
              description: 'Implement caching and optimize heavy endpoints'
            });
          }
          
          if (analysis.frontend.page_load_time > 3000) {
            recommendations.push({
              category: 'frontend',
              priority: 'medium', 
              action: 'optimize_frontend',
              description: 'Reduce bundle size and implement code splitting'
            });
          }
          
          return recommendations;
        }
        
        return [{
          json: {
            timestamp: new Date().toISOString(),
            overall_score: overallScore,
            performance_analysis: analysis,
            recommendations: recommendations,
            requires_immediate_attention: overallScore < 70
          }
        }];
      `
    },
    {
      "type": "switch",
      "name": "Performance Status",
      "rules": [
        {"overall_score": "> 80", "status": "healthy"},
        {"overall_score": "> 60", "status": "warning"},
        {"overall_score": "< 60", "status": "critical"}
      ]
    },
    {
      "type": "function",
      "name": "Execute Auto-Optimizations",
      "code": `
        const performanceData = items[0].json;
        const optimizations = [];
        
        performanceData.recommendations.forEach(rec => {
          if (rec.priority === 'high' && canAutoOptimize(rec.action)) {
            const result = executeOptimization(rec);
            optimizations.push(result);
          }
        });
        
        function canAutoOptimize(action) {
          const autoOptimizable = [
            'cache_clear',
            'restart_services',
            'cleanup_temp_files',
            'compress_logs'
          ];
          return autoOptimizable.includes(action);
        }
        
        function executeOptimization(recommendation) {
          switch(recommendation.action) {
            case 'cache_clear':
              return {
                action: 'cache_clear',
                status: 'executed',
                result: 'Cache cleared successfully'
              };
            case 'restart_services':
              return {
                action: 'restart_services', 
                status: 'executed',
                result: 'Background services restarted'
              };
            default:
              return {
                action: recommendation.action,
                status: 'manual_required',
                result: 'Requires manual intervention'
              };
          }
        }
        
        return [{
          json: {
            performance_score: performanceData.overall_score,
            auto_optimizations: optimizations,
            manual_recommendations: performanceData.recommendations.filter(rec => 
              !canAutoOptimize(rec.action)
            ),
            optimization_timestamp: new Date().toISOString()
          }
        }];
      `
    },
    {
      "type": "http",
      "name": "Apply Optimizations",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/system/apply-optimizations"
    },
    {
      "type": "email",
      "name": "Send Performance Alert",
      "condition": "{{$json.requires_immediate_attention}}",
      "credentials": "smtpEmail",
      "to": "admin@company.com",
      "subject": "🚨 SocialFlow Performance Alert - Score: {{$json.overall_score}}",
      "html": `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: {{$json.overall_score < 60 ? '#fee2e2' : '#fef3c7'}}; 
                      color: {{$json.overall_score < 60 ? '#dc2626' : '#d97706'}}; 
                      padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin: 0;">Performance Alert</h2>
            <p>Overall Performance Score: {{$json.overall_score}}/100</p>
          </div>
          
          <h3>Performance Analysis:</h3>
          <ul>
            <li>Database: {{$json.performance_analysis.database.query_performance}}</li>
            <li>API: {{$json.performance_analysis.api.status}}</li>
            <li>Frontend: {{$json.performance_analysis.frontend.status}}</li>
          </ul>
          
          <h3>Immediate Actions Required:</h3>
          {{#each $json.manual_recommendations}}
          <div style="border-left: 4px solid #dc2626; padding: 10px; margin: 10px 0; background: #fef2f2;">
            <strong>{{this.category}}:</strong> {{this.description}}
          </div>
          {{/each}}
          
          <h3>Auto-Optimizations Applied:</h3>
          {{#each $json.auto_optimizations}}
          <div style="border-left: 4px solid #16a34a; padding: 10px; margin: 10px 0; background: #f0fdf4;">
            <strong>{{this.action}}:</strong> {{this.result}}
          </div>
          {{/each}}
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{$env.SOCIALFLOW_API_URL}}/admin/performance" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Performance Dashboard
            </a>
          </div>
        </div>
      `
    },
    {
      "type": "http",
      "name": "Log Performance Report",
      "method": "POST",
      "url": "{{$env.SOCIALFLOW_API_URL}}/api/n8n/system/log-performance-report"
    }
  ]
}
```

---

## 🚀 Deployment Instructions

### **1. n8n Instance Setup**
```bash
# Create n8n directory
mkdir socialflow-n8n && cd socialflow-n8n

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: socialflow-n8n
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_password
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    container_name: socialflow-n8n-db
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
EOF

# Start n8n
docker-compose up -d
```

### **2. Import Workflows**
1. Access n8n at `http://your-server:5678`
2. Login with credentials
3. Import each workflow JSON
4. Configure credentials for each service
5. Test webhook endpoints
6. Activate all workflows

### **3. Configure Webhook URLs**
Update SocialFlow with webhook URLs:
```typescript
// In SocialFlow environment variables
N8N_BASE_URL=https://your-n8n-instance.com
N8N_WEBHOOK_BASE=https://your-n8n-instance.com/webhook
```

This comprehensive n8n setup provides all the automation infrastructure needed to transform SocialFlow into a complete enterprise platform while keeping costs minimal and maintaining full control over the automation logic.