"use client"

import { useEffect, useState } from "react"
import { Zap, Users, BarChart3, Calendar, Plus, Bell, TrendingUp, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DashboardOverview() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your social media campaigns today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Posts this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Total interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Pending responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <span>Create Content</span>
            </CardTitle>
            <CardDescription>
              Generate AI-powered posts for your social media
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Start Creating
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span>Connect Accounts</span>
            </CardTitle>
            <CardDescription>
              Link your social media platforms to start posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Connect Now
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <span>Schedule Posts</span>
            </CardTitle>
            <CardDescription>
              Plan your content calendar for the week ahead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Open Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Quick Setup</span>
            </CardTitle>
            <CardDescription>
              Get started with SocialFlow in 3 easy steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-white font-medium">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Connect Social Accounts</p>
                <p className="text-xs text-muted-foreground">
                  Link Facebook, Instagram, Twitter, and LinkedIn
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Create Your First Post</p>
                <p className="text-xs text-muted-foreground">
                  Use AI to generate engaging content
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">3</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Schedule & Publish</p>
                <p className="text-xs text-muted-foreground">
                  Set up your content calendar
                </p>
              </div>
            </div>

            <Button className="w-full mt-4">
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎉</span>
              <span>Free MVP Access</span>
            </CardTitle>
            <CardDescription>
              Everything unlocked during our launch phase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
                <span className="text-sm">Unlimited AI content generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
                <span className="text-sm">All social media platforms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
                <span className="text-sm">Advanced scheduling tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">FREE</Badge>
                <span className="text-sm">Analytics & insights</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full">
                Give Feedback
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Help us improve SocialFlow during MVP phase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}