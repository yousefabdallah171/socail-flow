"use client"

import { useState } from 'react'
import { 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  Share2,
  BarChart3,
  Clock,
  Target,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/projects/api'

interface ProjectCardProps {
  project: Project
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onToggleStatus: () => void
  onDelete: () => void
  onViewAnalytics?: () => void
}

export function ProjectCard({
  project,
  viewMode,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewAnalytics
}: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'No activity'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const calculateProgress = () => {
    // Simple progress calculation based on activity and status
    if (project.status === 'completed') return 100
    if (project.status === 'archived') return 100
    if (project.status === 'paused') return 60
    
    // For active projects, calculate based on content and activity
    const contentScore = Math.min((project.content_count || 0) * 5, 40)
    const socialScore = Math.min((project.social_accounts_count || 0) * 10, 30)
    const timeScore = project.start_date ? 30 : 0
    
    return Math.min(contentScore + socialScore + timeScore, 90)
  }

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      await onToggleStatus()
    } finally {
      setIsLoading(false)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Left side - Project info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={project.logo_url} alt={project.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {project.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold truncate">{project.name}</h3>
                  <Badge className={cn("text-xs", getStatusColor(project.status))}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(project.priority))}>
                    {project.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {project.industry && (
                    <span className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>{project.industry}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <FileText className="h-3 w-3" />
                    <span>{project.content_count || 0} content</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Share2 className="h-3 w-3" />
                    <span>{project.social_accounts_count || 0} accounts</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastActivity(project.last_activity_at)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onViewAnalytics}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
                    {project.status === 'active' ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Project
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Project
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={project.logo_url} alt={project.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {project.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
              {project.industry && (
                <CardDescription className="text-sm">
                  {project.industry}
                </CardDescription>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewAnalytics}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
                {project.status === 'active' ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Project
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume Project
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Priority badges */}
        <div className="flex items-center space-x-2">
          <Badge className={cn("text-xs", getStatusColor(project.status))}>
            {project.status}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", getPriorityColor(project.priority))}>
            {project.priority} priority
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Target Audience */}
        {project.target_audience && (
          <div className="flex items-center space-x-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium truncate">{project.target_audience}</span>
          </div>
        )}

        {/* AI Settings Preview */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground">Tone:</span>
            <Badge variant="secondary" className="text-xs">
              {project.default_tone}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="secondary" className="text-xs">
              {project.default_content_type}
            </Badge>
          </div>
        </div>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Keywords:</span>
            <div className="flex flex-wrap gap-1">
              {project.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {project.keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-muted-foreground">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{project.content_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="h-3 w-3" />
              <span>{project.social_accounts_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{project.total_followers || 0}</span>
            </div>
          </div>
          
          <div className="text-xs">
            {formatLastActivity(project.last_activity_at)}
          </div>
        </div>

        {/* Budget info */}
        {project.budget_allocated && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Budget</span>
            <div className="text-right">
              <div className="font-medium">
                ${(project.budget_spent || 0).toLocaleString()} / ${project.budget_allocated.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(((project.budget_spent || 0) / project.budget_allocated) * 100)}% used
              </div>
            </div>
          </div>
        )}

        {/* Website link */}
        {project.website_url && (
          <div className="flex items-center space-x-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={project.website_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              {project.website_url.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* Dates */}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}