"use client"

import { useState, useEffect } from 'react'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Copy,
  Eye,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Target,
  Globe,
  Building2,
  FolderOpen,
  Tag,
  BarChart3,
  Share2,
  Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

import { EnhancedContentCreator } from './enhanced-content-creator'
import { ContentEditor } from './content-editor'
import { getUserContent, deleteContent, duplicateContent, type ContentData } from '@/lib/content/content-actions'
import { getUserActiveProjects, type ProjectData } from '@/lib/projects/project-actions'

interface ProjectContentLibraryProps {
  className?: string
}

export function ProjectContentLibrary({ className }: ProjectContentLibraryProps) {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [content, setContent] = useState<ContentData[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [toneFilter, setToneFilter] = useState<string>('all')
  const [aiFilter, setAiFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedContent, setSelectedContent] = useState<ContentData | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  // Load user's active projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true)
        const result = await getUserActiveProjects(50)
        
        if (result.error) {
          console.error('Error loading projects:', result.error)
          return
        }

        setProjects(result.data || [])
        
        // Auto-select first project if available
        if (result.data && result.data.length > 0) {
          setSelectedProject(result.data[0])
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()
  }, [])

  // Load content when project changes
  useEffect(() => {
    if (selectedProject) {
      loadProjectContent()
    } else {
      loadAllContent()
    }
  }, [selectedProject])

  // Apply filters
  useEffect(() => {
    let filtered = content

    // Project filter (if specific project selected)
    if (selectedProject) {
      filtered = filtered.filter(item => item.project_id === selectedProject.id)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetAudience?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.platforms?.includes(platformFilter)
      )
    }

    // Content type filter  
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.contentType === contentTypeFilter)
    }

    // Tone filter
    if (toneFilter !== 'all') {
      filtered = filtered.filter(item => item.tone === toneFilter)
    }

    // AI filter
    if (aiFilter === 'ai') {
      filtered = filtered.filter(item => item.ai_generated)
    } else if (aiFilter === 'manual') {
      filtered = filtered.filter(item => !item.ai_generated)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(item => 
            new Date(item.created_at!).getTime() >= filterDate.getTime()
          )
          break
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7)
          filtered = filtered.filter(item => 
            new Date(item.created_at!).getTime() >= filterDate.getTime()
          )
          break
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1)
          filtered = filtered.filter(item => 
            new Date(item.created_at!).getTime() >= filterDate.getTime()
          )
          break
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )

    setFilteredContent(filtered)
  }, [content, selectedProject, searchQuery, statusFilter, platformFilter, contentTypeFilter, toneFilter, aiFilter, dateFilter])

  const loadProjectContent = async () => {
    if (!selectedProject?.id) return

    try {
      setIsLoading(true)
      const result = await getUserContent(100, 0, { project_id: selectedProject.id })
      
      if (result.error) {
        toast.error(`Failed to load content: ${result.error}`)
        return
      }

      setContent(result.data || [])
    } catch (error) {
      console.error('Error loading project content:', error)
      toast.error('Failed to load project content')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllContent = async () => {
    try {
      setIsLoading(true)
      const result = await getUserContent(100, 0)
      
      if (result.error) {
        toast.error(`Failed to load content: ${result.error}`)
        return
      }

      setContent(result.data || [])
    } catch (error) {
      console.error('Error loading content:', error)
      toast.error('Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    if (projectId === 'all') {
      setSelectedProject(null)
    } else {
      const project = projects.find(p => p.id === projectId)
      setSelectedProject(project || null)
    }
  }

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const result = await deleteContent(contentId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Content deleted successfully')
      if (selectedProject) {
        loadProjectContent()
      } else {
        loadAllContent()
      }
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const handleDuplicate = async (contentId: string) => {
    try {
      const result = await duplicateContent(contentId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Content duplicated successfully')
      if (selectedProject) {
        loadProjectContent()
      } else {
        loadAllContent()
      }
    } catch (error) {
      toast.error('Failed to duplicate content')
    }
  }

  const handleEdit = (contentItem: ContentData) => {
    setSelectedContent(contentItem)
    setShowEditor(true)
  }

  const handleContentCreated = () => {
    setShowCreator(false)
    if (selectedProject) {
      loadProjectContent()
    } else {
      loadAllContent()
    }
  }

  const handleContentUpdated = () => {
    setShowEditor(false)
    setSelectedContent(null)
    if (selectedProject) {
      loadProjectContent()
    } else {
      loadAllContent()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loadingProjects) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
            <p className="text-muted-foreground">
              {selectedProject 
                ? `Manage content for ${selectedProject.name}`
                : 'Manage content across all projects'
              }
            </p>
          </div>
        </div>
        
        <Button onClick={() => setShowCreator(true)} className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>Create Content</span>
        </Button>
      </div>

      {/* Project Selection & Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Project Selector */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Project Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedProject?.id || 'all'} 
              onValueChange={handleProjectSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>All Projects</span>
                  </div>
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id!}>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.industry} • {project.content_count || 0} content
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredContent.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedProject ? 'in this project' : 'across all projects'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredContent.filter(item => item.ai_generated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((filteredContent.filter(item => item.ai_generated).length / Math.max(filteredContent.length, 1)) * 100)}% of content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search content, hashtags, industry, or audience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">📝 Draft</SelectItem>
                  <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
                  <SelectItem value="published">✅ Published</SelectItem>
                  <SelectItem value="failed">❌ Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="instagram">📷 Instagram</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                </SelectContent>
              </Select>

              <Select value={toneFilter} onValueChange={setToneFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tones</SelectItem>
                  <SelectItem value="professional">👔 Professional</SelectItem>
                  <SelectItem value="casual">😊 Casual</SelectItem>
                  <SelectItem value="funny">😄 Funny</SelectItem>
                  <SelectItem value="inspiring">✨ Inspiring</SelectItem>
                  <SelectItem value="promotional">🎯 Promotional</SelectItem>
                </SelectContent>
              </Select>

              <Select value={aiFilter} onValueChange={setAiFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="ai">🤖 AI Generated</SelectItem>
                  <SelectItem value="manual">✍️ Manual</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
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

      {/* Content Grid/List */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="h-20 w-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Edit3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'No content matches your filters'
                  : selectedProject 
                    ? `No content in ${selectedProject.name} yet`
                    : 'No content yet'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by creating your first piece of content'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && platformFilter === 'all' && (
                <Button onClick={() => setShowCreator(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Content
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {filteredContent.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{item.title || 'Untitled'}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      
                      {item.ai_generated && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      
                      {item.tone && (
                        <Badge variant="outline" className="text-xs">
                          {item.tone}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(item.id!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.content}
                </p>
                
                {/* Platforms */}
                <div className="flex flex-wrap gap-1">
                  {item.platforms?.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {{
                        facebook: '📘 Facebook',
                        instagram: '📷 Instagram',
                        twitter: '🐦 Twitter',
                        linkedin: '💼 LinkedIn',
                        tiktok: '🎵 TikTok'
                      }[platform] || platform}
                    </Badge>
                  ))}
                </div>

                {/* Hashtags */}
                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.hashtags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-blue-600">
                        {tag}
                      </span>
                    ))}
                    {item.hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{item.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                  <span>
                    {formatDate(item.created_at!)}
                  </span>
                  {item.ai_provider && (
                    <span className="text-purple-600">
                      via {item.ai_provider}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enhanced Content Creator Dialog */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] xl:max-w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">Create New Content</DialogTitle>
              <DialogDescription className="text-base">
                Use AI to generate engaging content with project-specific settings
              </DialogDescription>
            </DialogHeader>
            <EnhancedContentCreator 
              onContentCreated={handleContentCreated}
              initialProjectId={selectedProject?.id}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update your content and settings
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <ContentEditor 
              content={selectedContent}
              onContentUpdated={handleContentUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}