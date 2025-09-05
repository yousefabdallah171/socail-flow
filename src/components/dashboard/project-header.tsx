"use client"

import { useState } from 'react'
import { Bell, Search, Settings, Plus, FolderOpen, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProjectSwitcher } from './project-switcher'
import { UserMenu } from './user-menu'
import { useProjects } from './project-provider'

export function ProjectHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadNotifications] = useState(3)
  
  const { 
    user, 
    currentProject, 
    projects, 
    switchProject, 
    sidebarOpen,
    toggleSidebar 
  } = useProjects()

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Mobile menu + Logo + Search */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo (visible on mobile) */}
            <div className="flex items-center space-x-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FolderOpen className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg">SocialFlow</span>
            </div>

            {/* Search */}
            <div className="hidden sm:block relative max-w-sm flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, content..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Notifications + Project Switcher + User Menu */}
          <div className="flex items-center space-x-3">
            {/* Search (mobile) */}
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Project Switcher */}
            <ProjectSwitcher
              currentProject={currentProject}
              projects={projects}
              onProjectSwitch={switchProject}
            />

            {/* User Menu */}
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}