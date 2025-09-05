# 🔐 SocialFlow Secure Credentials Management System

## Overview

The SocialFlow Credentials Management System provides enterprise-grade security for storing and managing social media API credentials. It supports all major social platforms with end-to-end encryption, audit logging, and seamless N8N automation integration.

## ✨ Features

### 🔒 Security Features
- **AES-256 Encryption**: All credentials encrypted with project-specific keys
- **Audit Logging**: Complete activity tracking for compliance
- **Access Control**: Per-project credential isolation
- **Secure Storage**: PGP encryption in database layer
- **Auto-Rotation**: Token expiry tracking and rotation reminders

### 🚀 Platform Support
- **Facebook**: Pages API with access tokens
- **Instagram**: Business and Basic Display APIs
- **Twitter**: API v2 with OAuth 1.0a/2.0
- **LinkedIn**: Marketing API with OAuth 2.0
- **TikTok**: Business API with content posting
- **YouTube**: Data API v3 with OAuth 2.0
- **Pinterest**: Business API with OAuth 2.0

### 🤖 N8N Integration
- **Webhook Automation**: Real-time event triggers
- **Secure Payloads**: Encrypted credential delivery
- **Multi-Trigger Support**: Content creation, posting, analytics, monitoring
- **Platform Filtering**: Selective automation by social platform

## 🏗️ Architecture

### Database Schema
```sql
-- Encrypted credentials storage
social_media_credentials
├── encrypted_api_key (PGP)
├── encrypted_api_secret (PGP)
├── encrypted_access_token (PGP)
├── verification_status
└── usage_tracking

-- Audit logging
credential_audit_log
├── action_type
├── user_context
├── ip_address
└── success_status

-- N8N webhook configs
n8n_webhook_configs
├── automation_type
├── trigger_events[]
├── platform_filters[]
└── webhook_security
```

### API Endpoints
- `POST /api/credentials` - Add encrypted credentials
- `PUT /api/credentials` - Update existing credentials
- `GET /api/credentials` - Fetch credential metadata
- `DELETE /api/credentials` - Soft delete credentials
- `POST /api/credentials/verify` - Test credential validity
- `POST /api/n8n/webhook` - Create/trigger N8N webhooks

### Components

#### Core Components
- `CredentialsManager` - Main credentials dashboard
- `CredentialForm` - Platform-specific input forms
- `CredentialCard` - Credential display and management
- `N8NManager` - Webhook automation configuration
- `N8NWebhookForm` - Webhook setup forms
- `CredentialSetupGuide` - Platform API setup guides

#### Platform Configurations
- `PLATFORM_CREDENTIAL_CONFIGS` - Field definitions per platform
- `PLATFORM_INFO` - Display information and documentation links
- `validatePlatformCredentials()` - Client-side validation

## 🚀 Getting Started

### 1. Database Setup
Run the SQL migration to enable credential management:
```bash
# Execute in Supabase SQL Editor
./database/SOCIAL-CREDENTIALS-SECURITY.sql
```

### 2. Project Configuration
Navigate to Project Settings → Credentials tab:
1. Select social platform
2. Follow platform-specific setup guide
3. Enter API credentials (auto-encrypted)
4. Test connection

### 3. N8N Integration
Configure automation webhooks:
1. Go to Project Settings → Automation tab
2. Add N8N webhook URL
3. Select automation type and triggers
4. Configure platform filters (optional)

## 🔧 Usage Examples

### Adding Facebook Credentials
```typescript
const credentialData = {
  project_id: 'uuid',
  social_account_id: 'uuid',
  platform: 'facebook',
  account_name: 'My Facebook Page',
  credentials: {
    app_id: 'your-facebook-app-id',
    client_secret: 'your-app-secret',
    access_token: 'your-page-access-token'
  }
}

// Automatically encrypted and stored securely
await fetch('/api/credentials', {
  method: 'POST',
  body: JSON.stringify(credentialData)
})
```

### Setting Up N8N Webhook
```typescript
const webhookConfig = {
  project_id: 'uuid',
  webhook_url: 'https://your-n8n.com/webhook/socialflow',
  webhook_secret: 'secure-secret',
  automation_type: 'content_creation',
  trigger_events: ['content_ready', 'schedule_time'],
  platform_filters: ['facebook', 'instagram']
}

await fetch('/api/n8n/webhook', {
  method: 'POST',
  body: JSON.stringify(webhookConfig)
})
```

### N8N Webhook Payload Structure
```json
{
  "project_id": "uuid",
  "automation_type": "content_creation",
  "event_data": {
    "event_type": "content_ready",
    "content_id": "uuid",
    "platforms": ["facebook", "instagram"]
  },
  "credentials": {
    "facebook": {
      "account_name": "My Page",
      "credentials": {
        "api_key": "decrypted-securely",
        "access_token": "decrypted-securely"
      },
      "account_info": {
        "is_verified": true,
        "rate_limit_remaining": 100
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "webhook_secret": "for-verification"
}
```

## 🛡️ Security Best Practices

### Credential Storage
- All sensitive data encrypted with AES-256
- Project-specific encryption keys
- No plaintext storage anywhere
- Automatic credential rotation alerts

### Access Control
- Project-level credential isolation
- Comprehensive audit logging
- IP address and user agent tracking
- Failed access attempt monitoring

### API Security
- HMAC webhook verification
- Rate limiting and quota management
- Secure credential transmission
- Regular security audits

## 🔍 Monitoring & Analytics

### Audit Dashboard
- Real-time credential access monitoring
- Usage statistics and trends
- Security event alerting
- Compliance reporting

### Performance Tracking
- API call success rates
- Rate limit utilization
- Credential verification status
- N8N webhook trigger analytics

## 🚨 Troubleshooting

### Common Issues

**Credential Verification Failed**
- Check API key validity
- Verify required permissions
- Test with platform's API explorer
- Review rate limits

**N8N Webhook Not Triggering**
- Confirm webhook URL accessibility
- Verify webhook secret matches
- Check trigger event configuration
- Review N8N workflow status

**Encryption/Decryption Errors**
- Ensure database functions are deployed
- Verify project permissions
- Check encryption key integrity

### Support
For technical support or security concerns, create an issue in the repository with:
- Detailed error description
- Steps to reproduce
- Relevant log entries (redacted)
- System configuration details

## 📈 Roadmap

- [ ] OAuth 2.0 flow automation
- [ ] Credential health monitoring
- [ ] Advanced N8N workflow templates
- [ ] Multi-factor authentication for credential access
- [ ] Automated credential rotation
- [ ] Platform-specific analytics integration
- [ ] Bulk credential import/export
- [ ] Team collaboration features

## 🤝 Contributing

When contributing to the credentials system:
1. Follow security-first principles
2. Test with all supported platforms
3. Update documentation
4. Add comprehensive error handling
5. Include audit logging for new features

---

**⚡ Your social media automation is now secured with enterprise-grade credential management!**