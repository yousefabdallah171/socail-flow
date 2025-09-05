"use client"

import { useState } from 'react'
import { Bell, Search, Settings, Plus, Building2, FolderOpen, Zap, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OrganizationSwitcher } from './organization-switcher'
import { ProjectTabs } from './project-tabs'
import { UserMenu } from './user-menu'
import { useDashboard } from './dashboard-provider'

export function DashboardHeaderEnhanced() {
  const {
    user,
    currentOrganization,
    organizations,
    activeProjects,
    currentProjectId,
    switchOrganization,
    switchProject,
    closeProject,
    addProject,
    createOrganization,
    toggleSidebar
  } = useDashboard()
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadNotifications] = useState(3)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 lg:px-6">
        {/* Top Row - Main Header */}
        <div className="flex h-16 items-center justify-between">
          {/* Left: Mobile menu + Brand */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Brand (visible on mobile) */}
            <div className="flex items-center space-x-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg">SocialFlow</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                FREE
              </Badge>
            </div>

            {/* Organization Switcher (desktop) */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Organization:</span>
                <OrganizationSwitcher
                  organizations={organizations}
                  currentOrgId={currentOrganization?.id}
                  onOrganizationChange={switchOrganization}
                  onCreateOrganization={createOrganization}
                />
              </div>
            </div>
          </div>

          {/* Center: Search (desktop) */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search across all projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4"
              />
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center space-x-2">
            {/* New Project Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={addProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>

            {/* Mobile New Project */}
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              onClick={addProject}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <UserMenu user={user} />
          </div>
        </div>

        {/* Mobile Organization Switcher Row */}
        <div className="lg:hidden pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <OrganizationSwitcher
              organizations={organizations}
              currentOrgId={currentOrganization?.id}
              onOrganizationChange={switchOrganization}
              onCreateOrganization={createOrganization}
              className="w-full"
            />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search across all projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
            />
          </div>
        </div>

        {/* Organization & Projects Row */}
        <div className="flex h-12 items-center justify-between border-t border-border/20 mt-2">
          <div className="flex items-center space-x-6 flex-1 min-w-0">
            {/* My Organization Section */}
            <div className="flex items-center space-x-3 shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">My Organization:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{currentOrganization?.name || 'No Organization'}</span>
                <Badge variant="outline" className="text-xs px-2 h-5">
                  {currentOrganization?.role || 'member'}
                </Badge>
                {currentOrganization && (
                  <Badge className="text-xs px-2 h-5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {currentOrganization.subscription_tier.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border hidden lg:block" />

            {/* Active Projects */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex items-center space-x-2 shrink-0">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm hidden sm:block">Active Projects:</span>
                <span className="font-medium text-sm sm:hidden">Projects:</span>
              </div>
              
              <ProjectTabs
                projects={activeProjects}
                currentProjectId={currentProjectId}
                organizationId={currentOrganization?.id || ''}
                onProjectSwitch={switchProject}
                onProjectClose={closeProject}
                onAddProject={addProject}
                className="flex-1 min-w-0"
              />
            </div>
          </div>

          {/* Right side info */}
          <div className="flex items-center space-x-3 shrink-0">
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {activeProjects.length} projects open
            </Badge>
            
            {currentOrganization && (
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <Settings className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Org Settings</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}