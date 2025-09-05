"use client"

import { useState, useRef, useEffect } from 'react'
import { Camera, Save, User, Mail, Building, Key, Eye, EyeOff, Phone, Clock, MapPin, Linkedin, Globe, Briefcase, FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PhoneInput } from '@/components/ui/phone-input'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { ProfileProgress, generateProfileFields } from '@/components/ui/profile-progress'
import { updateProfile, updateOrganization, uploadAvatar, uploadOrganizationLogo, changePassword } from '@/lib/auth/profile-actions'
import { validatePhoneNumber, validateLinkedInURL, validateWebsiteURL } from '@/lib/validation/profile-validation'
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

const industries = [
  'Marketing Agency',
  'Digital Agency',
  'Advertising',
  'Technology',
  'Software Development',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Non-profit',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Consulting',
  'Media & Entertainment',
  'Travel & Hospitality',
  'Food & Beverage',
  'Fashion',
  'Automotive',
  'Construction',
  'Other'
]

export function ProfileSettingsEnhanced() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const orgLogoInputRef = useRef<HTMLInputElement>(null)
  
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
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }

      setSelectedFile(file)
      
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
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setSelectedOrgLogo(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setOrgLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
        toast.error('Please enter a valid phone number')
        setIsLoading(false)
        return
      }

      if (formData.linkedin_url && !validateLinkedInURL(formData.linkedin_url)) {
        toast.error('Please enter a valid LinkedIn URL')
        setIsLoading(false)
        return
      }

      if (formData.organization_website && !validateWebsiteURL(formData.organization_website)) {
        toast.error('Please enter a valid website URL')
        setIsLoading(false)
        return
      }

      let avatar_url = userData?.avatar_url
      let org_logo_url = userData?.organizations?.logo_url

      // Upload avatar if new one selected
      if (selectedFile) {
        const result = await uploadAvatar(selectedFile)
        if (result.error) {
          toast.error(result.error)
          setIsLoading(false)
          return
        }
        avatar_url = result.avatar_url
      }

      // Upload organization logo if new one selected
      if (selectedOrgLogo) {
        const result = await uploadOrganizationLogo(selectedOrgLogo)
        if (result.error) {
          toast.error(result.error)
          setIsLoading(false)
          return
        }
        org_logo_url = result.logo_url
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
        setIsLoading(false)
        return
      }

      // Update organization if there are changes
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
          setIsLoading(false)
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

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      setIsPasswordLoading(false)
      return
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.error) {
        toast.error(result.error)
        setIsPasswordLoading(false)
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            FREE MVP ACCOUNT
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Complete your professional profile to unlock all SocialFlow features
        </p>
      </div>

      {/* Profile Progress */}
      <ProfileProgress 
        fields={generateProfileFields(userData)} 
        className="mb-6" 
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Your professional details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={avatarPreview || userData.avatar_url || ''} 
                        alt={userData.name} 
                      />
                      <AvatarFallback className="text-xl">
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
                  <div className="text-center">
                    <p className="text-sm font-medium">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG max 2MB
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="e.g., Marketing Manager"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={userData.email}
                        disabled
                        className="bg-muted pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>

                  <PhoneInput
                    value={formData.phone_number}
                    onChange={(value) => setFormData({ ...formData, phone_number: value })}
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Separator />

              {/* Professional Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., New York, USA"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <TimezoneSelect
                  value={formData.timezone}
                  onChange={(value) => setFormData({ ...formData, timezone: value })}
                  label="Timezone"
                  disabled={isLoading}
                />

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself and your professional background..."
                    rows={3}
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              <Separator />

              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Organization Information</span>
                </h3>

                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Organization Logo */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        {orgLogoPreview || userData.organizations?.logo_url ? (
                          <img
                            src={orgLogoPreview || userData.organizations?.logo_url || ''}
                            alt="Organization Logo"
                            className="h-full w-full object-contain rounded-lg"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={() => orgLogoInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <input
                        ref={orgLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleOrgLogoChange}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Organization Logo</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG max 5MB
                      </p>
                    </div>
                  </div>

                  {/* Organization Details */}
                  <div className="flex-1 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization Name *</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Enter organization name"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization_industry">Industry</Label>
                      <Select
                        value={formData.organization_industry}
                        onValueChange={(value) => setFormData({ ...formData, organization_industry: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="organization_website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization_website"
                          value={formData.organization_website}
                          onChange={(e) => setFormData({ ...formData, organization_website: e.target.value })}
                          placeholder="https://yourcompany.com"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="organization_description">Organization Description</Label>
                      <Textarea
                        id="organization_description"
                        value={formData.organization_description}
                        onChange={(e) => setFormData({ ...formData, organization_description: e.target.value })}
                        placeholder="Describe what your organization does..."
                        rows={3}
                        disabled={isLoading}
                        maxLength={300}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.organization_description.length}/300 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} size="lg">
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
        <Card className="lg:col-span-2">
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
                          minLength={8}
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
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters long
                      </p>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
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