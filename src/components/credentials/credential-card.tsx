"use client"

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Shield, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SocialMediaCredential } from '@/types'
import { PLATFORM_INFO } from '@/lib/credentials/platform-configs'
import { formatDistanceToNow } from 'date-fns'

interface CredentialCardProps {
  credential: SocialMediaCredential
  onEdit: (credential: SocialMediaCredential) => void
  onDelete: (credentialId: string) => Promise<void>
  onVerify: (credentialId: string) => Promise<void>
  isVerifying?: boolean
}

export function CredentialCard({
  credential,
  onEdit,
  onDelete,
  onVerify,
  isVerifying = false
}: CredentialCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const platformInfo = PLATFORM_INFO[credential.platform]

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(credential.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete credential:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = () => {
    if (!credential.is_active) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (credential.is_verified) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    }
    
    if (credential.verification_error) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const isExpiringSoon = () => {
    if (!credential.expires_at) return false
    const expiryDate = new Date(credential.expires_at)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = () => {
    if (!credential.expires_at) return false
    return new Date(credential.expires_at) < new Date()
  }

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="text-2xl p-2 rounded-lg"
                style={{ backgroundColor: platformInfo.color + '10' }}
              >
                {platformInfo.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{credential.account_name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>{platformInfo.name}</span>
                  <span>•</span>
                  <span>Added {formatDistanceToNow(new Date(credential.created_at))} ago</span>
                </CardDescription>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(credential)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Credentials
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onVerify(credential.id)}
                  disabled={isVerifying}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isVerifying ? 'Verifying...' : 'Test Connection'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Status and Badges */}
            <div className="flex items-center flex-wrap gap-2">
              {getStatusBadge()}
              
              {isExpired() && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
              
              {isExpiringSoon() && !isExpired() && (
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Expires Soon
                </Badge>
              )}
            </div>

            {/* Verification Error */}
            {credential.verification_error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                {credential.verification_error}
              </div>
            )}

            {/* Usage Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Usage Count:</span> {credential.usage_count}
              </div>
              <div>
                <span className="font-medium">Last Used:</span>{' '}
                {credential.last_used_at 
                  ? formatDistanceToNow(new Date(credential.last_used_at)) + ' ago'
                  : 'Never'
                }
              </div>
            </div>

            {/* Rate Limiting Info */}
            {credential.rate_limit_remaining !== null && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Rate Limit:</span> {credential.rate_limit_remaining} requests remaining
                {credential.rate_limit_reset_at && (
                  <span className="ml-2">
                    (resets {formatDistanceToNow(new Date(credential.rate_limit_reset_at))} from now)
                  </span>
                )}
              </div>
            )}

            {/* Expiry Info */}
            {credential.expires_at && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Expires:</span>{' '}
                {formatDistanceToNow(new Date(credential.expires_at))} from now
              </div>
            )}

            {/* Last Verification */}
            {credential.last_verified_at && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Last Verified:</span>{' '}
                {formatDistanceToNow(new Date(credential.last_verified_at))} ago
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {platformInfo.name} Credentials</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the credentials for "{credential.account_name}"? 
              This action cannot be undone and will disable any automated posting to this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Credentials'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}