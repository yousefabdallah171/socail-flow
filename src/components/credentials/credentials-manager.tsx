"use client"

import { useState, useEffect } from 'react'
import { Plus, Shield, Key, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SocialPlatform, SocialMediaCredential, CredentialForm } from '@/types'
import { CredentialForm as CredentialFormComponent } from './credential-form'
import { CredentialCard } from './credential-card'
import { PLATFORM_INFO } from '@/lib/credentials/platform-configs'

interface CredentialsManagerProps {
  project_id: string
  social_accounts: Array<{
    id: string
    platform: SocialPlatform
    account_name: string
  }>
}

export function CredentialsManager({ project_id, social_accounts }: CredentialsManagerProps) {
  const [credentials, setCredentials] = useState<SocialMediaCredential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | ''>('')
  const [editingCredential, setEditingCredential] = useState<SocialMediaCredential | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  // Fetch credentials for the project
  const fetchCredentials = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/credentials?project_id=${project_id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch credentials')
      }
      
      setCredentials(data.credentials || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (project_id) {
      fetchCredentials()
    }
  }, [project_id])

  const handleAddCredential = async (formData: CredentialForm) => {
    try {
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add credential')
      }

      // Refresh credentials list
      await fetchCredentials()
      setShowAddDialog(false)
      setSelectedPlatform('')
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleEditCredential = async (formData: CredentialForm) => {
    if (!editingCredential) return

    try {
      const response = await fetch('/api/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingCredential.id,
          account_name: formData.account_name,
          credentials: formData.credentials,
          expires_at: formData.expires_at,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update credential')
      }

      // Refresh credentials list
      await fetchCredentials()
      setEditingCredential(null)
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleDeleteCredential = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/credentials?id=${credentialId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete credential')
      }

      // Refresh credentials list
      await fetchCredentials()
    } catch (err: any) {
      console.error('Failed to delete credential:', err)
      throw err
    }
  }

  const handleVerifyCredential = async (credentialId: string) => {
    try {
      setVerifyingId(credentialId)
      const response = await fetch('/api/credentials/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential_id: credentialId }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify credential')
      }

      // Refresh credentials list to get updated verification status
      await fetchCredentials()
    } catch (err: any) {
      console.error('Failed to verify credential:', err)
    } finally {
      setVerifyingId(null)
    }
  }

  const getAvailableSocialAccount = (platform: SocialPlatform) => {
    return social_accounts.find(account => account.platform === platform)
  }

  const getAvailablePlatforms = () => {
    // Show platforms that have social accounts but no credentials yet
    return social_accounts
      .filter(account => 
        !credentials.some(cred => 
          cred.platform === account.platform && cred.social_account_id === account.id
        )
      )
      .map(account => account.platform)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const availablePlatforms = getAvailablePlatforms()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Social Media Credentials</h2>
          <p className="text-muted-foreground">
            Manage secure API credentials for automated social media posting
          </p>
        </div>
        
        {availablePlatforms.length > 0 && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credentials
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All credentials are encrypted using AES-256 encryption and stored securely. 
          Only you and your N8N workflows can access these credentials.
        </AlertDescription>
      </Alert>

      {/* No Social Accounts Warning */}
      {social_accounts.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to add social media accounts to your project before you can configure credentials.
            Go to the Social Accounts section to connect your platforms.
          </AlertDescription>
        </Alert>
      )}

      {/* Credentials Grid */}
      {credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onEdit={setEditingCredential}
              onDelete={handleDeleteCredential}
              onVerify={handleVerifyCredential}
              isVerifying={verifyingId === credential.id}
            />
          ))}
        </div>
      ) : social_accounts.length > 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Credentials Added</h3>
            <p className="text-muted-foreground mb-4">
              Add secure API credentials to enable automated posting and N8N integration.
            </p>
            {availablePlatforms.length > 0 && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Credential
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* All Platforms Configured */}
      {social_accounts.length > 0 && availablePlatforms.length === 0 && credentials.length === social_accounts.length && (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Accounts Configured</h3>
            <p className="text-muted-foreground">
              You've added credentials for all your social media accounts. 
              Your N8N workflows can now securely access these platforms.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Credential Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Social Media Credentials</DialogTitle>
            <DialogDescription>
              Choose a platform and add your API credentials for secure automation
            </DialogDescription>
          </DialogHeader>

          {!selectedPlatform ? (
            <div className="space-y-4">
              <h3 className="font-medium">Select Platform</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availablePlatforms.map((platform) => {
                  const platformInfo = PLATFORM_INFO[platform]
                  return (
                    <Button
                      key={platform}
                      variant="outline"
                      className="h-20 flex-col space-y-2 hover:bg-muted"
                      onClick={() => setSelectedPlatform(platform)}
                    >
                      <div className="text-2xl">{platformInfo.icon}</div>
                      <span className="text-sm">{platformInfo.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          ) : (
            <CredentialFormComponent
              platform={selectedPlatform}
              project_id={project_id}
              social_account_id={getAvailableSocialAccount(selectedPlatform)?.id || ''}
              onSubmit={handleAddCredential}
              onCancel={() => {
                setSelectedPlatform('')
                setShowAddDialog(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Credential Dialog */}
      <Dialog open={!!editingCredential} onOpenChange={(open) => !open && setEditingCredential(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Credentials</DialogTitle>
            <DialogDescription>
              Update your API credentials for secure automation
            </DialogDescription>
          </DialogHeader>

          {editingCredential && (
            <CredentialFormComponent
              platform={editingCredential.platform}
              project_id={project_id}
              social_account_id={editingCredential.social_account_id}
              initialData={{
                account_name: editingCredential.account_name,
                expires_at: editingCredential.expires_at || undefined,
                // Note: We don't pass the actual credentials for security
                credentials: {}
              }}
              onSubmit={handleEditCredential}
              onCancel={() => setEditingCredential(null)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}