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
  const [loading, setLoading] = useState(true)
  
  // Real data from database
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | undefined>()
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>()

  // Load data on mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        
        // Import the queries dynamically to avoid server/client issues
        const { getUserOrganizations, getUserProjects } = await import('@/lib/dashboard/queries')
        
        // Load organizations
        const orgs = await getUserOrganizations()
        setOrganizations(orgs)
        
        // Set current organization (first one for now)
        const currentOrg = orgs.find(org => org.is_default) || orgs[0]
        if (currentOrg) {
          setCurrentOrganization(currentOrg)
          
          // Load projects for current organization
          const projects = await getUserProjects(currentOrg.id)
          setActiveProjects(projects)
          
          // Set current project (first active one)
          const activeProject = projects.find(p => p.status === 'active')
          if (activeProject) {
            setCurrentProjectId(activeProject.id)
          }
        }
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error)
        // Fallback to empty arrays
        setOrganizations([])
        setActiveProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrganization(org)
      
      try {
        // Load projects for the new organization
        const { getUserProjects } = await import('@/lib/dashboard/queries')
        const projects = await getUserProjects(orgId)
        setActiveProjects(projects)
        
        // Set current project to first active one
        const activeProject = projects.find(p => p.status === 'active')
        setCurrentProjectId(activeProject?.id)
        
        console.log('✅ Switched to organization:', org.name)
      } catch (error) {
        console.error('❌ Error loading projects for organization:', error)
      }
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
      {children}
    </DashboardContext.Provider>
  )
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}