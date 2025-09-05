"use client"

import { useState } from 'react'
import { X, Settings, Circle, Plus, FolderOpen, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  slug: string
  industry?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  unread_notifications?: number
  last_activity?: string
  team_members_count?: number
  content_count?: number
  social_accounts_count?: number
}

interface ProjectTabsProps {
  projects: Project[]
  currentProjectId?: string
  organizationId: string
  maxTabs?: number
  onProjectSwitch?: (projectId: string) => void
  onProjectClose?: (projectId: string) => void
  onAddProject?: () => void
  className?: string
}

export function ProjectTabs({
  projects = [],
  currentProjectId,
  organizationId,
  maxTabs = 5,
  onProjectSwitch,
  onProjectClose,
  onAddProject,
  className
}: ProjectTabsProps) {
  const [closingProjectId, setClosingProjectId] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 fill-green-500'
      case 'paused': return 'text-yellow-500 fill-yellow-500'
      case 'completed': return 'text-blue-500 fill-blue-500'
      case 'archived': return 'text-gray-400 fill-gray-400'
      default: return 'text-gray-400 fill-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'paused': return 'Paused'
      case 'completed': return 'Completed'
      case 'archived': return 'Archived'
      default: return 'Unknown'
    }
  }

  const handleProjectClose = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setClosingProjectId(projectId)
    
    // Animate close
    setTimeout(() => {
      onProjectClose?.(projectId)
      setClosingProjectId(null)
    }, 150)
  }

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  // Show only first maxTabs projects, rest in overflow
  const visibleProjects = projects.slice(0, maxTabs)
  const overflowProjects = projects.slice(maxTabs)

  return (
    <TooltipProvider>
      <div className={cn("flex items-center space-x-2 flex-1 overflow-hidden", className)}>
        {/* Project Tabs */}
        {visibleProjects.length > 0 ? (
          <Tabs value={currentProjectId} className="flex-1 min-w-0">
            <TabsList className="h-11 bg-transparent p-0 space-x-1 min-w-0 overflow-x-auto">
              {visibleProjects.map((project) => (
                <Tooltip key={project.id}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={project.id}
                      className={cn(
                        "relative h-10 px-4 py-2 rounded-lg border border-transparent min-w-0 max-w-[250px]",
                        "hover:bg-accent hover:text-accent-foreground",
                        "data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm",
                        "transition-all duration-200 group",
                        closingProjectId === project.id && "animate-out slide-out-to-right-2 duration-150"
                      )}
                      onClick={() => onProjectSwitch?.(project.id)}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Circle className={cn("h-2 w-2", getStatusColor(project.status))} />
                        
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="text-sm font-medium truncate max-w-[140px]">
                            {project.name}
                          </span>
                          {project.industry && (
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {project.industry}
                            </span>
                          )}
                        </div>

                        {/* Notifications Badge */}
                        {project.unread_notifications && project.unread_notifications > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                            {project.unread_notifications > 9 ? '9+' : project.unread_notifications}
                          </Badge>
                        )}

                        {/* Close Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                          onClick={(e) => handleProjectClose(project.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-medium">{project.name}</div>
                      {project.industry && (
                        <div className="text-sm text-muted-foreground">Industry: {project.industry}</div>
                      )}
                      <div className="flex items-center space-x-2 text-sm">
                        <Circle className={cn("h-2 w-2", getStatusColor(project.status))} />
                        <span>{getStatusLabel(project.status)}</span>
                      </div>
                      {project.last_activity && (
                        <div className="text-sm text-muted-foreground">
                          Last activity: {formatLastActivity(project.last_activity)}
                        </div>
                      )}
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        {project.content_count !== undefined && (
                          <span>{project.content_count} content</span>
                        )}
                        {project.social_accounts_count !== undefined && (
                          <span>{project.social_accounts_count} accounts</span>
                        )}
                        {project.team_members_count !== undefined && (
                          <span>{project.team_members_count} members</span>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsList>
          </Tabs>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <span>No active projects</span>
          </div>
        )}

        {/* Overflow Indicator */}
        {overflowProjects.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 px-3 shrink-0">
                +{overflowProjects.length}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-medium">More Projects:</div>
                {overflowProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="text-sm">
                    {project.name}
                  </div>
                ))}
                {overflowProjects.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    and {overflowProjects.length - 5} more...
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Add Project Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
              onClick={onAddProject}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Add Project</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}