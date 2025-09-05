"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeaderEnhanced } from './dashboard-header-enhanced'

interface User {
  id: string
  name: string
  email: string
  avatar_url?: string | null
}

interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  role: 'owner' | 'admin' | 'editor' | 'member'
  is_default: boolean
  subscription_tier: 'free' | 'pro' | 'enterprise'
  projects_count?: number
  team_members_count?: number
  created_at: string
}

interface Project {
  id: string
  name: string
  slug: string
  industry?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  unread_notifications?: number
  last_activity?: string
  team_members_count?: number
  content_count?: number
  social_accounts_count?: number
}

interface DashboardContextType {
  user: User
  currentOrganization?: Organization
  organizations: Organization[]
  activeProjects: Project[]
  currentProjectId?: string
  sidebarOpen: boolean
  switchOrganization: (orgId: string) => void
  switchProject: (projectId: string) => void
  closeProject: (projectId: string) => void
  addProject: () => void
  createOrganization: () => void
  toggleSidebar: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

interface DashboardProviderProps {
  initialUser: User
  children: ReactNode
}

export function DashboardProvider({ initialUser, children }: DashboardProviderProps) {
  const [user] = useState<User>(initialUser)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Mock data - replace with real API calls
  const [organizations] = useState<Organization[]>([
    {
      id: '1',
      name: 'Acme Marketing Agency',
      slug: 'acme-marketing',
      logo_url: '',
      role: 'owner',
      is_default: true,
      subscription_tier: 'free',
      projects_count: 5,
      team_members_count: 3,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Creative Studio Inc',
      slug: 'creative-studio',
      role: 'admin',
      is_default: false,
      subscription_tier: 'pro',
      projects_count: 8,
      team_members_count: 12,
      created_at: new Date().toISOString()
    }
  ])
  
  const [currentOrganization, setCurrentOrganization] = useState<Organization>(
    organizations.find(org => org.is_default) || organizations[0]
  )
  
  const [activeProjects, setActiveProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Nike Summer Campaign',
      slug: 'nike-summer-campaign',
      industry: 'Fashion & Apparel',
      status: 'active',
      unread_notifications: 2,
      last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content_count: 24,
      social_accounts_count: 4,
      team_members_count: 3
    },
    {
      id: '2',
      name: 'Tesla Model Y Launch',
      slug: 'tesla-model-y',
      industry: 'Automotive',
      status: 'active',
      last_activity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      content_count: 12,
      social_accounts_count: 3,
      team_members_count: 2
    },
    {
      id: '3',
      name: 'Starbucks Holiday Menu',
      slug: 'starbucks-holiday',
      industry: 'Food & Beverage',
      status: 'paused',
      last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      content_count: 8,
      social_accounts_count: 2,
      team_members_count: 1
    }
  ])
  
  const [currentProjectId, setCurrentProjectId] = useState<string>('1')

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrganization(org)
      // In real app, fetch projects for this organization
      console.log('Switched to organization:', org.name)
    }
  }

  const switchProject = (projectId: string) => {
    setCurrentProjectId(projectId)
    console.log('Switched to project:', projectId)
  }

  const closeProject = (projectId: string) => {
    setActiveProjects(prev => prev.filter(p => p.id !== projectId))
    if (currentProjectId === projectId && activeProjects.length > 1) {
      const remainingProjects = activeProjects.filter(p => p.id !== projectId)
      setCurrentProjectId(remainingProjects[0]?.id)
    }
    console.log('Closed project:', projectId)
  }

  const addProject = () => {
    console.log('Add new project')
    // Will implement project creation dialog
  }

  const createOrganization = () => {
    console.log('Create new organization')
    // Will implement organization creation dialog
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const contextValue: DashboardContextType = {
    user,
    currentOrganization,
    organizations,
    activeProjects,
    currentProjectId,
    sidebarOpen,
    switchOrganization,
    switchProject,
    closeProject,
    addProject,
    createOrganization,
    toggleSidebar
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeaderEnhanced
            user={user}
            currentOrganization={currentOrganization}
            organizations={organizations}
            activeProjects={activeProjects}
            currentProjectId={currentProjectId}
            onOrganizationChange={switchOrganization}
            onProjectSwitch={switchProject}
            onProjectClose={closeProject}
            onAddProject={addProject}
            onCreateOrganization={createOrganization}
            onMobileMenuToggle={toggleSidebar}
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}