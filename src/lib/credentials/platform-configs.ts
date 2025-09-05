import { SocialPlatform, PlatformCredentialField } from '@/types'

// Platform-specific credential field configurations
export const PLATFORM_CREDENTIAL_CONFIGS: Record<SocialPlatform, PlatformCredentialField[]> = {
  facebook: [
    {
      name: 'app_id',
      label: 'Facebook App ID',
      type: 'text',
      placeholder: '1234567890123456',
      required: true,
      description: 'Your Facebook App ID from the Facebook Developer Console'
    },
    {
      name: 'client_secret',
      label: 'App Secret',
      type: 'password',
      placeholder: 'abcdef1234567890abcdef1234567890',
      required: true,
      description: 'Your Facebook App Secret (keep this secure!)'
    },
    {
      name: 'access_token',
      label: 'Page Access Token',
      type: 'password',
      placeholder: 'EAABwzLixnjYBOxxxxxxxxxxxxx',
      required: true,
      description: 'Long-lived page access token for your Facebook Page'
    },
    {
      name: 'page_token',
      label: 'Page ID',
      type: 'text',
      placeholder: '123456789012345',
      required: false,
      description: 'Optional: Specific Facebook Page ID to post to'
    }
  ],
  
  instagram: [
    {
      name: 'client_id',
      label: 'Instagram Client ID',
      type: 'text',
      placeholder: '1234567890123456',
      required: true,
      description: 'Instagram Basic Display Client ID'
    },
    {
      name: 'client_secret',
      label: 'Client Secret',
      type: 'password',
      placeholder: 'abcdef1234567890abcdef1234567890',
      required: true,
      description: 'Instagram Basic Display Client Secret'
    },
    {
      name: 'access_token',
      label: 'Access Token',
      type: 'password',
      placeholder: 'IGQVJ...',
      required: true,
      description: 'Instagram User Access Token'
    },
    {
      name: 'business_account_id',
      label: 'Business Account ID',
      type: 'text',
      placeholder: '17841400455970028',
      required: false,
      description: 'Instagram Business Account ID (for business accounts)'
    }
  ],
  
  twitter: [
    {
      name: 'api_key',
      label: 'API Key',
      type: 'text',
      placeholder: 'abcdefghijklmnopqrstuvwxyz',
      required: true,
      description: 'Twitter API Key from the Developer Portal'
    },
    {
      name: 'api_secret',
      label: 'API Secret',
      type: 'password',
      placeholder: 'abcdefghijklmnopqrstuvwxyz1234567890abcdefgh',
      required: true,
      description: 'Twitter API Secret Key'
    },
    {
      name: 'access_token',
      label: 'Access Token',
      type: 'password',
      placeholder: '1234567890123456789-abcdefghijklmnopqrstuvwxyz123456',
      required: true,
      description: 'Twitter Access Token for your account'
    },
    {
      name: 'refresh_token',
      label: 'Access Token Secret',
      type: 'password',
      placeholder: 'abcdefghijklmnopqrstuvwxyz1234567890abcdefgh',
      required: true,
      description: 'Twitter Access Token Secret'
    }
  ],
  
  linkedin: [
    {
      name: 'client_id',
      label: 'LinkedIn Client ID',
      type: 'text',
      placeholder: '1234567890',
      required: true,
      description: 'LinkedIn App Client ID'
    },
    {
      name: 'client_secret',
      label: 'Client Secret',
      type: 'password',
      placeholder: 'abcdefghijklmnop',
      required: true,
      description: 'LinkedIn App Client Secret'
    },
    {
      name: 'access_token',
      label: 'Access Token',
      type: 'password',
      placeholder: 'AQV...',
      required: true,
      description: 'LinkedIn Access Token for posting content'
    },
    {
      name: 'refresh_token',
      label: 'Refresh Token',
      type: 'password',
      placeholder: 'AQV...',
      required: false,
      description: 'LinkedIn Refresh Token (optional)'
    }
  ],
  
  tiktok: [
    {
      name: 'client_key',
      label: 'Client Key',
      type: 'text',
      placeholder: 'aw1234567890abcdef',
      required: true,
      description: 'TikTok for Business Client Key'
    },
    {
      name: 'client_secret',
      label: 'Client Secret', 
      type: 'password',
      placeholder: 'abcdef1234567890abcdef1234567890abcdef12',
      required: true,
      description: 'TikTok for Business Client Secret'
    },
    {
      name: 'access_token',
      label: 'Access Token',
      type: 'password',
      placeholder: 'act.example12345Example12345Example',
      required: true,
      description: 'TikTok Access Token for content posting'
    }
  ],
  
  youtube: [
    {
      name: 'client_id',
      label: 'Google Client ID',
      type: 'text',
      placeholder: '123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
      required: true,
      description: 'Google Cloud Console OAuth 2.0 Client ID'
    },
    {
      name: 'client_secret',
      label: 'Client Secret',
      type: 'password',
      placeholder: 'GOCSPX-abcdefghijklmnopqrstuvwxyz',
      required: true,
      description: 'Google Cloud Console OAuth 2.0 Client Secret'
    },
    {
      name: 'access_token',
      label: 'Access Token',
      type: 'password',
      placeholder: 'ya29.a0AfH6SMC...',
      required: true,
      description: 'YouTube Data API Access Token'
    },
    {
      name: 'refresh_token',
      label: 'Refresh Token',
      type: 'password',
      placeholder: '1//0GWGWGaWGaWGaWGaWGaWGaWGaWGaWGaWGaWGaW',
      required: true,
      description: 'YouTube API Refresh Token'
    }
  ],
  
  pinterest: [
    {
      name: 'app_id',
      label: 'Pinterest App ID',
      type: 'text',
      placeholder: '1234567',
      required: true,
      description: 'Pinterest App ID from Pinterest Developers'
    },
    {
      name: 'client_secret',
      label: 'App Secret',
      type: 'password',
      placeholder: 'abcdefghijklmnopqrstuvwxyz1234567890abcdef',
      required: true,
      description: 'Pinterest App Secret'
    },
    {
      name: 'access_token',
      label: 'Access Token',
      type: 'password',
      placeholder: 'pina_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      required: true,
      description: 'Pinterest Access Token for API access'
    },
    {
      name: 'refresh_token',
      label: 'Refresh Token',
      type: 'password',
      placeholder: 'pinr_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      required: false,
      description: 'Pinterest Refresh Token (optional)'
    }
  ]
}

// Platform display information
export const PLATFORM_INFO: Record<SocialPlatform, {
  name: string
  color: string
  icon: string
  docsUrl: string
  setupGuide: string
}> = {
  facebook: {
    name: 'Facebook',
    color: '#1877f2',
    icon: '📘',
    docsUrl: 'https://developers.facebook.com/docs/pages-api',
    setupGuide: 'Create a Facebook App and generate a Page Access Token'
  },
  instagram: {
    name: 'Instagram',
    color: '#e4405f',
    icon: '📷',
    docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api',
    setupGuide: 'Set up Instagram Basic Display API or Business API'
  },
  twitter: {
    name: 'Twitter',
    color: '#1da1f2',
    icon: '🐦',
    docsUrl: 'https://developer.twitter.com/en/docs/twitter-api',
    setupGuide: 'Create a Twitter Developer account and generate API keys'
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077b5',
    icon: '💼',
    docsUrl: 'https://docs.microsoft.com/en-us/linkedin/',
    setupGuide: 'Create a LinkedIn Developer app and request API access'
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    icon: '🎵',
    docsUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
    setupGuide: 'Register for TikTok for Developers and create an app'
  },
  youtube: {
    name: 'YouTube',
    color: '#ff0000',
    icon: '📹',
    docsUrl: 'https://developers.google.com/youtube/v3',
    setupGuide: 'Enable YouTube Data API in Google Cloud Console'
  },
  pinterest: {
    name: 'Pinterest',
    color: '#bd081c',
    icon: '📌',
    docsUrl: 'https://developers.pinterest.com/docs/api/v5/',
    setupGuide: 'Create a Pinterest Developer app and get API access'
  }
}

// Helper function to get required fields for a platform
export function getRequiredFields(platform: SocialPlatform): string[] {
  return PLATFORM_CREDENTIAL_CONFIGS[platform]
    .filter(field => field.required)
    .map(field => field.name)
}

// Helper function to validate credentials for a platform
export function validatePlatformCredentials(
  platform: SocialPlatform, 
  credentials: Record<string, string>
): { isValid: boolean; missingFields: string[] } {
  const requiredFields = getRequiredFields(platform)
  const missingFields = requiredFields.filter(field => !credentials[field]?.trim())
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}