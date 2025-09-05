"use client"

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Copy, 
  Eye,
  Sparkles,
  Filter,
  Search,
  Grid3X3,
  List,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  SortAsc,
  SortDesc,
  Tag,
  Target,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContentCreator } from './content-creator'
import { ContentEditor } from './content-editor'
import { getUserContent, deleteContent, duplicateContent, ContentData } from '@/lib/content/content-actions'
import { toast } from 'sonner'

const statusIcons = {
  draft: <Edit3 className="h-4 w-4" />,
  scheduled: <Clock className="h-4 w-4" />,
  published: <CheckCircle className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700'
}

export function ContentManagement() {
  const [content, setContent] = useState<ContentData[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [toneFilter, setToneFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'platform'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedContent, setSelectedContent] = useState<ContentData | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  // Load content
  useEffect(() => {
    loadContent()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = content

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.industry && item.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.targetAudience && item.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.platforms.includes(platformFilter)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Tone filter
    if (toneFilter !== 'all') {
      filtered = filtered.filter(item => item.tone === toneFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'platform':
          return a.platforms[0]?.localeCompare(b.platforms[0] || '') || 0
        default:
          return 0
      }
    })

    setFilteredContent(filtered)
  }, [content, searchQuery, statusFilter, platformFilter, categoryFilter, toneFilter, sortBy])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      const result = await getUserContent(50, 0)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      setContent(result.data || [])
    } catch (error) {
      toast.error('Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const result = await deleteContent(id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Content deleted successfully')
      loadContent()
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateContent(id)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Content duplicated successfully')
      loadContent()
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
    loadContent()
  }

  const handleContentUpdated = () => {
    setShowEditor(false)
    setSelectedContent(null)
    loadContent()
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and schedule your social media content
          </p>
        </div>
        <Button onClick={() => setShowCreator(true)} className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>Create with AI</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(item => item.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(item => item.status === 'published').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter(item => item.ai_generated).length}
            </div>
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
                  placeholder="Search content, industry, or audience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters Row 1 */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'title' | 'platform')}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🕐 Newest First</SelectItem>
                  <SelectItem value="oldest">🕐 Oldest First</SelectItem>
                  <SelectItem value="title">🔤 By Title</SelectItem>
                  <SelectItem value="platform">🌐 By Platform</SelectItem>
                </SelectContent>
              </Select>

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
      {filteredContent.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="h-20 w-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Edit3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'No content matches your filters'
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
                    <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={statusColors[item.status]}
                      >
                        {statusIcons[item.status]}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </Badge>
                      
                      {item.ai_generated && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      
                      {item.tone && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.tone}
                        </Badge>
                      )}
                      
                      {item.contentType && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          {item.contentType}
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
                
                {/* Industry & Target Audience */}
                {(item.industry || item.targetAudience) && (
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {item.industry && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {item.industry}
                      </span>
                    )}
                    {item.targetAudience && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {item.targetAudience}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {item.platforms.map((platform) => (
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

                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(item.hashtags) ? item.hashtags : [item.hashtags]).slice(0, 3).map((tag) => (
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

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {item.scheduled_at ? 
                      `Scheduled: ${formatDate(item.scheduled_at.toString())}` :
                      `Created: ${formatDate(item.created_at!.toString())}`
                    }
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

      {/* Content Creator Dialog */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] xl:max-w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">Create New Content</DialogTitle>
              <DialogDescription className="text-base">
                Use AI to generate engaging content for your social media platforms
              </DialogDescription>
            </DialogHeader>
            <ContentCreator onContentCreated={handleContentCreated} />
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