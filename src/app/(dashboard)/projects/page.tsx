"use client"

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search,
  Filter,
  Grid3X3,
  List,
  Building2,
  Target,
  Play,
  Pause,
  Archive,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

import { ProjectCard } from '@/components/projects/project-card'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { ProjectSettingsDialog } from '@/components/projects/project-settings-dialog'

import { getOrganizationProjects, toggleProjectStatus, deleteProject, type ProjectData } from '@/lib/projects/project-actions'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters and UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)

  // Mock current organization - replace with real context
  useEffect(() => {
    setCurrentOrganization({
      id: '1',
      name: 'Acme Marketing Agency',
      role: 'owner'
    })
  }, [])

  // Load projects
  useEffect(() => {
    if (currentOrganization?.id) {
      loadProjects()
    }
  }, [currentOrganization?.id])

  // Apply filters
  useEffect(() => {
    let filtered = projects

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.target_audience?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(project => project.industry === industryFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter)
    }

    // Sort by last activity
    filtered.sort((a, b) => 
      new Date(b.last_activity_at || 0).getTime() - new Date(a.last_activity_at || 0).getTime()
    )

    setFilteredProjects(filtered)
  }, [projects, searchQuery, statusFilter, industryFilter, priorityFilter])

  const loadProjects = async () => {
    if (!currentOrganization?.id) return

    try {
      setIsLoading(true)
      const result = await getOrganizationProjects(currentOrganization.id, {
        limit: 100 // Get all projects for now
      })
      
      if (result.error) {
        toast.error(`Failed to load projects: ${result.error}`)
        return
      }

      setProjects(result.data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (projectId: string) => {
    try {
      const result = await toggleProjectStatus(projectId)
      
      if (result.error) {
        toast.error(`Failed to update status: ${result.error}`)
        return
      }

      toast.success('Project status updated successfully')
      loadProjects()
    } catch (error) {
      console.error('Error toggling project status:', error)
      toast.error('Failed to update project status')
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteProject(projectId)
      
      if (result.error) {
        toast.error(`Failed to delete project: ${result.error}`)
        return
      }

      toast.success('Project deleted successfully')
      loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleEdit = (project: ProjectData) => {
    setSelectedProject(project)
    setShowSettingsDialog(true)
  }

  const handleProjectCreated = () => {
    setShowCreateDialog(false)
    loadProjects()
  }

  const handleProjectUpdated = () => {
    setShowSettingsDialog(false)
    setSelectedProject(null)
    loadProjects()
  }

  // Get unique industries from projects for filter
  const uniqueIndustries = Array.from(new Set(projects.map(p => p.industry).filter(Boolean)))

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            <p className="text-muted-foreground">
              Manage client projects with AI-powered content settings for {currentOrganization?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <Archive className="h-4 w-4 mr-2" />
            Archived Projects
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Projects</CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status === 'paused').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporarily stopped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueIndustries.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different sectors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects by name, industry, or target audience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">🟢 Active</SelectItem>
                  <SelectItem value="paused">🟡 Paused</SelectItem>
                  <SelectItem value="completed">🔵 Completed</SelectItem>
                  <SelectItem value="archived">⚫ Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="h-20 w-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery || statusFilter !== 'all' || industryFilter !== 'all' 
                  ? 'No projects match your filters' 
                  : 'No projects yet'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || industryFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Create your first project to start managing social media campaigns'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && industryFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onEdit={() => handleEdit(project)}
              onToggleStatus={() => handleToggleStatus(project.id!)}
              onDelete={() => handleDelete(project.id!)}
              onViewAnalytics={() => {
                // Navigate to project analytics
                window.location.href = `/projects/${project.id}/analytics`
              }}
            />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        organizationId={currentOrganization?.id}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Settings Dialog */}
      {selectedProject && (
        <ProjectSettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          project={selectedProject}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  )
}