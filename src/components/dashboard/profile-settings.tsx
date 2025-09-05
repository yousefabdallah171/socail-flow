"use client"

import { useState, useRef, useEffect } from 'react'
import { Camera, Save, User, Mail, Building, Key, Eye, EyeOff, Phone, Clock, MapPin, Linkedin, Globe, Briefcase, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { ProfileProgress, generateProfileFields } from '@/components/ui/profile-progress'
import { updateProfile, updateOrganization, uploadAvatar, uploadOrganizationLogo, changePassword } from '@/lib/auth/profile-actions'
import { getUser } from '@/lib/auth/actions'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  job_title?: string
  phone_number?: string
  timezone?: string
  bio?: string
  location?: string
  linkedin_url?: string
  organizations: {
    id: string
    name: string
    type: string
    team_size: string
    logo_url?: string
    website?: string
    industry?: string
    description?: string
  } | null
}

export function ProfileSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [userData, setUserData] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    phone_number: '',
    timezone: 'UTC',
    bio: '',
    location: '',
    linkedin_url: '',
    organization: '',
    organization_website: '',
    organization_industry: '',
    organization_description: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null)
  const [selectedOrgLogo, setSelectedOrgLogo] = useState<File | null>(null)
  const orgLogoInputRef = useRef<HTMLInputElement>(null)

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user, error } = await getUser()
        if (error) {
          toast.error('Failed to load user data')
          return
        }
        
        if (user) {
          setUserData(user)
          setFormData({
            name: user.name || '',
            job_title: user.job_title || '',
            phone_number: user.phone_number || '',
            timezone: user.timezone || 'UTC',
            bio: user.bio || '',
            location: user.location || '',
            linkedin_url: user.linkedin_url || '',
            organization: user.organizations?.name || '',
            organization_website: user.organizations?.website || '',
            organization_industry: user.organizations?.industry || '',
            organization_description: user.organizations?.description || ''
          })
        }
      } catch (error) {
        toast.error('Failed to load user data')
      }
    }

    loadUserData()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOrgLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setSelectedOrgLogo(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setOrgLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return null

    const result = await uploadAvatar(selectedFile)
    
    if (result.error) {
      toast.error(result.error)
      return null
    }

    return result.avatar_url
  }

  const handleOrgLogoUpload = async () => {
    if (!selectedOrgLogo) return null

    const result = await uploadOrganizationLogo(selectedOrgLogo)
    
    if (result.error) {
      toast.error(result.error)
      return null
    }

    return result.logo_url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (formData.phone_number && formData.phone_number.length < 10) {
        toast.error('Please enter a valid phone number')
        setIsLoading(false)
        return
      }

      if (formData.linkedin_url && !formData.linkedin_url.includes('linkedin.com')) {
        toast.error('Please enter a valid LinkedIn URL')
        setIsLoading(false)
        return
      }

      if (userData?.organizations?.website && !userData.organizations.website.includes('.')) {
        toast.error('Please enter a valid website URL')
        setIsLoading(false)
        return
      }

      let avatar_url = userData?.avatar_url
      let org_logo_url = userData?.organizations?.logo_url

      // Upload avatar if new one selected
      if (selectedFile) {
        avatar_url = await handleAvatarUpload()
        if (!avatar_url) {
          setIsLoading(false)
          return
        }
      }

      // Upload organization logo if new one selected
      if (selectedOrgLogo) {
        org_logo_url = await handleOrgLogoUpload() || undefined
        if (!org_logo_url) {
          setIsLoading(false)
          return
        }
      }

      // Update profile with all new fields
      const profileResult = await updateProfile({
        name: formData.name,
        avatar_url,
        job_title: formData.job_title,
        phone_number: formData.phone_number,
        timezone: formData.timezone,
        bio: formData.bio,
        location: formData.location,
        linkedin_url: formData.linkedin_url
      })

      if (profileResult.error) {
        toast.error(profileResult.error)
        return
      }

      // Update organization with all new fields
      const hasOrgChanges = (
        formData.organization !== userData?.organizations?.name ||
        formData.organization_website !== userData?.organizations?.website ||
        formData.organization_industry !== userData?.organizations?.industry ||
        formData.organization_description !== userData?.organizations?.description ||
        org_logo_url !== userData?.organizations?.logo_url
      )

      if (hasOrgChanges) {
        const orgResult = await updateOrganization({
          name: formData.organization,
          type: userData?.organizations?.type || 'other',
          logo_url: org_logo_url,
          website: formData.organization_website,
          industry: formData.organization_industry,
          description: formData.organization_description
        })

        if (orgResult.error) {
          toast.error(orgResult.error)
          return
        }
      }

      // Reload user data
      const { user: updatedUser } = await getUser()
      if (updatedUser) {
        setUserData(updatedUser)
      }

      // Clear previews and selected files
      setAvatarPreview(null)
      setSelectedFile(null)
      setOrgLogoPreview(null)
      setSelectedOrgLogo(null)
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPasswordLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      setIsPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      setIsPasswordLoading(false)
      return
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  if (!userData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            FREE MVP ACCOUNT
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={avatarPreview || userData.avatar_url || ''} 
                      alt={userData.name} 
                    />
                    <AvatarFallback className="text-lg">
                      {userData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the camera icon to update your avatar. 
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-green-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={userData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter your organization name"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Account Security</span>
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          disabled={isPasswordLoading}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          disabled={isPasswordLoading}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          disabled={isPasswordLoading}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="submit" disabled={isPasswordLoading}>
                        {isPasswordLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>Updating...</span>
                          </div>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Type</Label>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700">FREE MVP</Badge>
                  <span className="text-sm text-muted-foreground">
                    All features unlocked
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Organization</Label>
                <p className="text-sm">{userData.organizations?.name || 'No Organization'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Team Size</Label>
                <p className="text-sm">{userData.organizations?.team_size || 'Unknown'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-xs text-muted-foreground font-mono">{userData.id}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}