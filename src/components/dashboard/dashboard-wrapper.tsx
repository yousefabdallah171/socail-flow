"use client"

import { useEffect, useState } from "react"
import { Zap, Users, BarChart3, Calendar, Plus, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// !!!!! DEVELOPMENT DASHBOARD WRAPPER !!!!!
// !!!!! THIS PREVENTS HOOKS ERRORS BY ENSURING STABLE RENDERING !!!!!

interface DashboardWrapperProps {
  user: {
    id: string
    name: string
    email: string
    organizations?: {
      name: string
    }
  }
}

export function DashboardWrapper({ user }: DashboardWrapperProps) {
  const [mounted, setMounted] = useState(false)

  // !!!!! DEV: Ensure component is mounted before rendering to prevent hydration issues !!!!!
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  console.log('🎨 DEV: Rendering dashboard with user:', user)

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl">SocialFlow</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              FREE
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* !!!!! DEV: Sign out button for easy testing !!!!! */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                const { signOut } = await import('@/lib/auth/actions')
                await signOut()
              }}
            >
              Sign Out
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.organizations?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto max-w-screen-2xl py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your social media campaigns with AI-powered tools, completely free.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Create Content</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">AI Generate</div>
              <p className="text-xs text-muted-foreground">
                Create engaging posts with AI
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schedule Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Posts scheduled this week
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Social media accounts
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Total engagement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Get Started with SocialFlow</CardTitle>
              <CardDescription>
                Complete these steps to start managing your social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Account created</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-sm">Connect your social media accounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-sm">Create your first AI-generated post</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-sm">Schedule your content</span>
              </div>
              <Button className="w-full mt-4">
                Connect Social Accounts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎉 You're in the FREE MVP!</CardTitle>
              <CardDescription>
                Help us build the best social media management tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">During our MVP phase, everything is completely free:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Unlimited AI content generation</li>
                  <li>All social media platforms</li>
                  <li>Advanced scheduling tools</li>
                  <li>Analytics & performance tracking</li>
                  <li>Team collaboration features</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full">
                Give Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
