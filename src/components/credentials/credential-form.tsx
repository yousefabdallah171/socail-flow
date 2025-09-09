"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ExternalLink, Key, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SocialPlatform, type CredentialForm as CredentialFormType } from '@/types'
import { PLATFORM_CREDENTIAL_CONFIGS, PLATFORM_INFO, validatePlatformCredentials } from '@/lib/credentials/platform-configs'

// Validation schema
const credentialFormSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  credentials: z.record(z.string(), z.string().optional()),
  expires_at: z.string().optional(),
})

type CredentialFormData = z.infer<typeof credentialFormSchema>

interface CredentialFormProps {
  platform: SocialPlatform
  project_id: string
  social_account_id: string
  initialData?: Partial<CredentialForm>
  onSubmit: (data: CredentialForm) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function CredentialForm({
  platform,
  project_id,
  social_account_id,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}: CredentialFormProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const platformConfig = PLATFORM_CREDENTIAL_CONFIGS[platform]
  const platformInfo = PLATFORM_INFO[platform]

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      account_name: initialData?.account_name || '',
      credentials: initialData?.credentials || {},
      expires_at: initialData?.expires_at || '',
    }
  })

  const toggleSecretVisibility = (fieldName: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  const handleSubmit = async (data: CredentialFormData) => {
    setIsSubmitting(true)
    setValidationErrors([])

    try {
      // Validate platform credentials
      const validation = validatePlatformCredentials(platform, Object.fromEntries(
        Object.entries(data.credentials).filter(([_, value]) => value !== undefined) as [string, string][]
      ))
      
      if (!validation.isValid) {
        setValidationErrors([`Missing required fields: ${validation.missingFields.join(', ')}`])
        return
      }

      // Prepare form data
      const formData: CredentialForm = {
        project_id,
        social_account_id,
        platform,
        account_name: data.account_name,
        credentials: data.credentials,
        expires_at: data.expires_at || undefined,
      }

      await onSubmit(formData)
    } catch (error: any) {
      setValidationErrors([error.message || 'Failed to save credentials'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{platformInfo.icon}</div>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{isEditing ? 'Edit' : 'Add'} {platformInfo.name} Credentials</span>
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Encrypted
              </Badge>
            </CardTitle>
            <CardDescription>
              {platformInfo.setupGuide}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Help Alert */}
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            All credentials are encrypted with AES-256 encryption and stored securely. 
            <a 
              href={platformInfo.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 text-primary hover:underline inline-flex items-center"
            >
              View {platformInfo.name} API docs
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account_name">
              Account Name *
            </Label>
            <Input
              id="account_name"
              placeholder={`My ${platformInfo.name} Account`}
              {...form.register('account_name')}
            />
            <p className="text-sm text-muted-foreground">
              A friendly name to identify this account
            </p>
            {form.formState.errors.account_name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.account_name.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Platform-specific credential fields */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              API Credentials
            </h3>
            
            {platformConfig.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    type={field.type === 'password' && !showSecrets[field.name] ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    {...form.register(`credentials.${field.name}`)}
                  />
                  {field.type === 'password' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => toggleSecretVisibility(field.name)}
                    >
                      {showSecrets[field.name] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showSecrets[field.name] ? 'Hide' : 'Show'} {field.label}
                      </span>
                    </Button>
                  )}
                </div>
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Optional Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expires_at">
              Token Expiry Date (Optional)
            </Label>
            <Input
              id="expires_at"
              type="datetime-local"
              {...form.register('expires_at')}
            />
            <p className="text-sm text-muted-foreground">
              Set when your access tokens expire for automatic rotation reminders
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Credentials' : 'Add Credentials'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}