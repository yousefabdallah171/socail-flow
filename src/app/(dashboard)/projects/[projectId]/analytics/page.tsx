'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProjectAnalytics } from '@/components/dashboard/project-analytics'
import { ProjectInsights } from '@/components/dashboard/project-insights'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, BarChart3, Lightbulb, Share2, Download, RefreshCw } from 'lucide-react'
import { getOrganizationProjects, type ProjectData } from '@/lib/projects/project-actions'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProjectAnalyticsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<ProjectData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Mock organization ID - in real implementation, get from context
      const mockOrgId = '1'
      
      const result = await getOrganizationProjects(mockOrgId)
      
      if (result.error) {
        setError(result.error)
        return
      }

      const foundProject = result.data?.find(p => p.id === projectId)
      
      if (!foundProject) {
        setError('Project not found')
        return
      }

      setProject(foundProject)
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="w-48 h-6 bg-gray-200 rounded"></div>
              <div className="w-64 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadProject}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/projects">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span>{project.industry}</span>
                  <span>•</span>
                  <span>{project.target_audience}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority} priority
              </Badge>
              <Badge variant="outline">
                {project.default_tone} tone
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {project.description && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Analytics Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectAnalytics 
            projectId={project.id!} 
            projectName={project.name}
          />
        </div>
        
        <div className="space-y-6">
          <ProjectInsights 
            projectId={project.id!} 
            projectName={project.name}
          />
          
          {/* Project Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
              <CardDescription>Project overview metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Content Created</span>
                <span className="font-semibold">{project.content_count || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Team Members</span>
                <span className="font-semibold">{project.team_members_count || 1}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Social Accounts</span>
                <span className="font-semibold">{project.social_accounts_count || 0}</span>
              </div>
              
              {project.budget_allocated && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="font-semibold">${project.budget_allocated.toLocaleString()}</span>
                </div>
              )}
              
              {project.start_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="font-semibold">
                    {new Date(project.start_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Activity</span>
                <span className="font-semibold">
                  {project.last_activity_at 
                    ? new Date(project.last_activity_at).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}