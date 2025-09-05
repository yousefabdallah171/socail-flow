'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Globe,
  MessageSquare
} from 'lucide-react'

interface ProjectAnalyticsProps {
  projectId: string
  projectName: string
}

interface AnalyticsData {
  contentGenerated: number
  totalPosts: number
  platformDistribution: { platform: string; count: number; color: string }[]
  contentTypes: { type: string; count: number }[]
  aiUsageStats: { metric: string; value: number; change: number }[]
  recentActivity: { action: string; date: string; details: string }[]
  performance: { metric: string; current: number; target: number; trend: 'up' | 'down' | 'stable' }[]
}

// Mock data - in real implementation, this would come from API
const mockAnalyticsData: AnalyticsData = {
  contentGenerated: 247,
  totalPosts: 189,
  platformDistribution: [
    { platform: 'Instagram', count: 45, color: '#E1306C' },
    { platform: 'Facebook', count: 38, color: '#1877F2' },
    { platform: 'Twitter', count: 32, color: '#1DA1F2' },
    { platform: 'LinkedIn', count: 28, color: '#0A66C2' },
    { platform: 'TikTok', count: 46, color: '#000000' }
  ],
  contentTypes: [
    { type: 'Posts', count: 89 },
    { type: 'Stories', count: 56 },
    { type: 'Reels', count: 34 },
    { type: 'Threads', count: 10 }
  ],
  aiUsageStats: [
    { metric: 'AI Generations', value: 247, change: 15 },
    { metric: 'Success Rate', value: 94, change: 3 },
    { metric: 'Avg Time Saved', value: 8.5, change: 12 }
  ],
  recentActivity: [
    { action: 'Content Generated', date: '2 hours ago', details: 'Instagram post for product launch' },
    { action: 'Project Updated', date: '1 day ago', details: 'Changed target audience settings' },
    { action: 'Bulk Generation', date: '2 days ago', details: '15 posts created for week campaign' },
    { action: 'Settings Modified', date: '3 days ago', details: 'Updated AI tone to professional' }
  ],
  performance: [
    { metric: 'Content Quality', current: 94, target: 90, trend: 'up' },
    { metric: 'Generation Speed', current: 87, target: 85, trend: 'up' },
    { metric: 'Platform Coverage', current: 78, target: 80, trend: 'down' },
    { metric: 'User Engagement', current: 92, target: 88, trend: 'up' }
  ]
}

export function ProjectAnalytics({ projectId, projectName }: ProjectAnalyticsProps) {
  const data = mockAnalyticsData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Analytics</h2>
          <p className="text-muted-foreground">
            Performance insights for <span className="font-medium">{projectName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.contentGenerated}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Published</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> avg per week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Platform Distribution
                </CardTitle>
                <CardDescription>
                  Content distribution across social platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.platformDistribution.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm font-medium">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{platform.count} posts</span>
                      <Badge variant="secondary">
                        {Math.round((platform.count / data.totalPosts) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Content Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Content Types
                </CardTitle>
                <CardDescription>
                  Breakdown of content formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.contentTypes.map((type) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type.type}</span>
                      <span className="text-sm text-muted-foreground">{type.count}</span>
                    </div>
                    <Progress 
                      value={(type.count / data.totalPosts) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Performance
              </CardTitle>
              <CardDescription>
                Detailed analytics for each social media platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.platformDistribution.map((platform) => (
                  <div key={platform.platform} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: platform.color }}
                      />
                      <h3 className="font-semibold">{platform.platform}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Posts</span>
                        <span className="font-medium">{platform.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Engagement</span>
                        <span className="font-medium">
                          {Math.round(Math.random() * 20 + 80)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reach</span>
                        <span className="font-medium">
                          {(Math.random() * 50 + 25).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Track key performance indicators and goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.performance.map((metric) => (
                <div key={metric.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{metric.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {metric.current}% / {metric.target}%
                      </span>
                      <Badge 
                        variant={metric.current >= metric.target ? "default" : "secondary"}
                      >
                        {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'}
                        {metric.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={metric.current} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {metric.current}%</span>
                    <span>Target: {metric.target}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest project activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="mt-1">
                      {activity.action === 'Content Generated' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.action === 'Project Updated' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {activity.action === 'Bulk Generation' && <Zap className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'Settings Modified' && <Target className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-sm text-muted-foreground">{activity.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}