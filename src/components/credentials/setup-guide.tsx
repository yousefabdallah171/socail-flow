"use client"

import { ExternalLink, Key, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { SocialPlatform } from '@/types'
import { PLATFORM_INFO } from '@/lib/credentials/platform-configs'

interface CredentialSetupGuideProps {
  platform: SocialPlatform
  onClose?: () => void
}

const PLATFORM_GUIDES: Record<SocialPlatform, {
  steps: string[]
  apiUrl: string
  requirements: string[]
  tips: string[]
}> = {
  facebook: {
    steps: [
      'Go to Facebook Developers Console',
      'Create a new Facebook App',
      'Add the "Pages" product to your app',
      'Generate a Page Access Token',
      'Copy your App ID, App Secret, and Page Access Token'
    ],
    apiUrl: 'https://developers.facebook.com/apps/',
    requirements: ['Facebook Page', 'Facebook Developer Account'],
    tips: [
      'Use long-lived page access tokens for production',
      'Enable required permissions: pages_manage_posts, pages_read_engagement',
      'Test your credentials with the Graph API Explorer'
    ]
  },
  instagram: {
    steps: [
      'Set up Instagram Basic Display or Instagram for Business',
      'Create a Facebook App and add Instagram product',
      'Configure OAuth redirect URIs',
      'Generate Access Token through OAuth flow',
      'For business accounts, get Business Account ID'
    ],
    apiUrl: 'https://developers.facebook.com/docs/instagram-api',
    requirements: ['Instagram Account', 'Facebook Developer Account'],
    tips: [
      'Business accounts have more API capabilities',
      'Personal accounts use Instagram Basic Display API',
      'Test permissions with Instagram Graph API'
    ]
  },
  twitter: {
    steps: [
      'Apply for Twitter Developer Account',
      'Create a new Twitter App in Developer Portal',
      'Generate API Key and Secret',
      'Generate Access Token and Token Secret',
      'Enable OAuth 1.0a or OAuth 2.0 as needed'
    ],
    apiUrl: 'https://developer.twitter.com/en/portal/dashboard',
    requirements: ['Twitter Account', 'Approved Developer Account'],
    tips: [
      'Twitter API v2 is recommended for new integrations',
      'Free tier has rate limits - consider paid plans for high volume',
      'Test with Twitter API v2 playground'
    ]
  },
  linkedin: {
    steps: [
      'Create LinkedIn Developer Application',
      'Request marketing developer platform access',
      'Set up OAuth 2.0 application',
      'Generate Client ID and Client Secret',
      'Obtain access token through OAuth flow'
    ],
    apiUrl: 'https://www.linkedin.com/developers/apps',
    requirements: ['LinkedIn Account', 'LinkedIn Page or Company Page'],
    tips: [
      'Marketing API access requires approval',
      'Use LinkedIn Share API for posting',
      'Test with LinkedIn API Console'
    ]
  },
  tiktok: {
    steps: [
      'Register for TikTok for Developers',
      'Create a TikTok for Business App',
      'Apply for Content Posting API access',
      'Generate Client Key and Client Secret',
      'Implement OAuth 2.0 authorization flow'
    ],
    apiUrl: 'https://developers.tiktok.com/apps/',
    requirements: ['TikTok Business Account', 'Approved Developer Account'],
    tips: [
      'Content Posting API requires approval process',
      'Review TikTok Community Guidelines',
      'Test with TikTok API Playground'
    ]
  },
  youtube: {
    steps: [
      'Enable YouTube Data API in Google Cloud Console',
      'Create OAuth 2.0 credentials',
      'Configure authorized redirect URIs',
      'Generate Client ID and Client Secret',
      'Implement OAuth flow for access tokens'
    ],
    apiUrl: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com',
    requirements: ['Google Account', 'YouTube Channel', 'Google Cloud Project'],
    tips: [
      'YouTube API has quota limits',
      'Requires OAuth consent screen setup',
      'Test with YouTube API Explorer'
    ]
  },
  pinterest: {
    steps: [
      'Create Pinterest Developer Account',
      'Create a Pinterest App',
      'Generate App ID and App Secret',
      'Set up OAuth 2.0 redirect URIs',
      'Obtain access token through OAuth flow'
    ],
    apiUrl: 'https://developers.pinterest.com/apps/',
    requirements: ['Pinterest Business Account', 'Pinterest Developer Account'],
    tips: [
      'Business account required for API access',
      'Review Pinterest API rate limits',
      'Test with Pinterest API documentation'
    ]
  }
}

export function CredentialSetupGuide({ platform, onClose }: CredentialSetupGuideProps) {
  const platformInfo = PLATFORM_INFO[platform]
  const guide = PLATFORM_GUIDES[platform]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">{platformInfo.icon}</div>
        <h2 className="text-2xl font-bold">{platformInfo.name} API Setup</h2>
        <p className="text-muted-foreground">
          Follow this guide to get your {platformInfo.name} API credentials
        </p>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All credentials are encrypted and stored securely. Never share your API keys publicly.
        </AlertDescription>
      </Alert>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {guide.requirements.map((requirement, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Steps</CardTitle>
          <CardDescription>
            Follow these steps to get your API credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {guide.steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {guide.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" asChild>
          <a href={guide.apiUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open {platformInfo.name} Console
          </a>
        </Button>
        
        {onClose && (
          <Button onClick={onClose}>
            I'm Ready to Add Credentials
          </Button>
        )}
      </div>
    </div>
  )
}