"use client"

import * as React from "react"
import { CheckCircle, Circle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ProfileField {
  id: string
  label: string
  completed: boolean
  required: boolean
}

interface ProfileProgressProps {
  fields: ProfileField[]
  className?: string
  showDetails?: boolean
}

export function ProfileProgress({ 
  fields, 
  className,
  showDetails = true 
}: ProfileProgressProps) {
  const requiredFields = fields.filter(f => f.required)
  const completedRequired = requiredFields.filter(f => f.completed).length
  const totalRequired = requiredFields.length
  
  const allFields = fields
  const completedAll = allFields.filter(f => f.completed).length
  const totalAll = allFields.length
  
  const requiredProgress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 100
  const overallProgress = totalAll > 0 ? (completedAll / totalAll) * 100 : 100
  
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600"
    if (progress >= 70) return "text-blue-600" 
    if (progress >= 50) return "text-amber-600"
    return "text-red-600"
  }
  
  const getProgressBadgeVariant = (progress: number) => {
    if (progress >= 90) return "default" // Green
    if (progress >= 70) return "secondary" // Blue
    if (progress >= 50) return "outline" // Amber
    return "destructive" // Red
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <User className="h-5 w-5" />
          <span>Profile Completion</span>
          <Badge variant={getProgressBadgeVariant(overallProgress)}>
            {Math.round(overallProgress)}%
          </Badge>
        </CardTitle>
        <CardDescription>
          Complete your profile to get the most out of SocialFlow
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className={cn("font-bold", getProgressColor(overallProgress))}>
              {completedAll}/{totalAll} completed
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Required Fields Progress */}
        {totalRequired > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Required Fields</span>
              <span className={cn("font-bold", getProgressColor(requiredProgress))}>
                {completedRequired}/{totalRequired} completed
              </span>
            </div>
            <Progress value={requiredProgress} className="h-2" />
          </div>
        )}

        {/* Field Details */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Missing Fields</h4>
            <div className="space-y-1">
              {fields
                .filter(field => !field.completed)
                .slice(0, 5) // Show max 5 missing fields
                .map((field) => (
                  <div key={field.id} className="flex items-center space-x-2 text-sm">
                    <Circle className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                      field.required ? "font-medium" : "text-muted-foreground"
                    )}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </div>
                ))}
              
              {fields.filter(f => !f.completed).length > 5 && (
                <div className="text-xs text-muted-foreground">
                  +{fields.filter(f => !f.completed).length - 5} more fields
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed Fields (show a few recent ones) */}
        {showDetails && completedAll > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
            <div className="space-y-1">
              {fields
                .filter(field => field.completed)
                .slice(-3) // Show last 3 completed
                .map((field) => (
                  <div key={field.id} className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{field.label}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Completion Status */}
        {requiredProgress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium text-sm">Profile Complete!</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              All required fields are filled. Your profile is ready for professional use.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to generate profile fields status
export function generateProfileFields(userData: any): ProfileField[] {
  return [
    {
      id: "name",
      label: "Full Name",
      completed: Boolean(userData?.name),
      required: true
    },
    {
      id: "email",
      label: "Email Address",
      completed: Boolean(userData?.email),
      required: true
    },
    {
      id: "job_title",
      label: "Job Title",
      completed: Boolean(userData?.job_title),
      required: true
    },
    {
      id: "phone_number",
      label: "Phone Number",
      completed: Boolean(userData?.phone_number),
      required: true
    },
    {
      id: "timezone",
      label: "Timezone",
      completed: Boolean(userData?.timezone && userData.timezone !== 'UTC'),
      required: true
    },
    {
      id: "organization",
      label: "Organization",
      completed: Boolean(userData?.organizations?.name),
      required: true
    },
    {
      id: "avatar",
      label: "Profile Picture",
      completed: Boolean(userData?.avatar_url),
      required: false
    },
    {
      id: "bio",
      label: "Professional Bio",
      completed: Boolean(userData?.bio),
      required: false
    },
    {
      id: "location",
      label: "Location",
      completed: Boolean(userData?.location),
      required: false
    },
    {
      id: "linkedin",
      label: "LinkedIn Profile",
      completed: Boolean(userData?.linkedin_url),
      required: false
    },
    {
      id: "org_logo",
      label: "Organization Logo",
      completed: Boolean(userData?.organizations?.logo_url),
      required: false
    },
    {
      id: "org_website",
      label: "Company Website",
      completed: Boolean(userData?.organizations?.website),
      required: false
    },
    {
      id: "org_industry",
      label: "Industry",
      completed: Boolean(userData?.organizations?.industry),
      required: false
    }
  ]
}