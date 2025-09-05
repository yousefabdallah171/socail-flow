'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { getProjectInsights } from '@/lib/projects/project-actions'

interface ProjectInsightsProps {
  projectId: string
  projectName: string
}

interface Insight {
  type: 'success' | 'warning' | 'opportunity' | 'tip'
  title: string
  description: string
  action: string
}

export function ProjectInsights({ projectId, projectName }: ProjectInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getProjectInsights(projectId)
      
      if (result.error) {
        setError(result.error)
      } else {
        setInsights(result.data || [])
      }
    } catch (err) {
      setError('Failed to fetch insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [projectId])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-purple-600" />
      default:
        return <Target className="h-5 w-5 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'opportunity':
        return 'border-blue-200 bg-blue-50'
      case 'tip':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'warning':
        return 'destructive'
      case 'success':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Analyzing your project data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchInsights}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations for <span className="font-medium">{projectName}</span>
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No insights available yet. Generate some content to see personalized recommendations.
            </p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-colors ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{insight.title}</h3>
                    <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-medium text-gray-700">
                      Recommended action:
                    </span>
                    <span className="text-xs text-gray-600">
                      {insight.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {insights.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Insights updated based on last 30 days of activity
              </p>
              <Button variant="ghost" size="sm">
                View All Reports
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}