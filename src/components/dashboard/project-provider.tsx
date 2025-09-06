"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Project } from '@/lib/projects/api'
import { createEnhancedProject, getEnhancedUserProjects } from '@/lib/projects/enhanced-api'

interface User {
  id: string
  name: string
  email: string
  avatar_url?: string | null
}

interface ProjectContextType {
  // User data
  user: User | null
  
  // Project data
  currentProject: Project | null
  projects: Project[]
  loading: boolean
  
  // Actions
  switchProject: (projectId: string) => void
  refreshProjects: () => Promise<void>
  createProject: (data: any) => Promise<void>
  
  // UI state
  sidebarOpen: boolean
  toggleSidebar: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

interface ProjectProviderProps {
  initialUser: User
  children: ReactNode
}

export function ProjectProvider({ initialUser, children }: ProjectProviderProps) {
  const [user] = useState<User>(initialUser)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load user's projects on mount
  useEffect(() => {
    refreshProjects()
  }, [])

  const refreshProjects = async () => {
    try {
      setLoading(true)
      
      const result = await getEnhancedUserProjects()
      
      if (result.success && result.projects) {
        setProjects(result.projects)
        
        // Set current project to first active project if none selected
        if (!currentProject && result.projects.length > 0) {
          const activeProject = result.projects.find(p => p.status === 'active') || result.projects[0]
          setCurrentProject(activeProject)
        }
      } else {
        console.error('Failed to load projects:', result.error)
        setProjects([])
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const switchProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      console.log('✅ Switched to project:', project.name)
      
      // Store current project in localStorage for persistence
      localStorage.setItem('currentProjectId', projectId)
    }
  }

  const createProject = async (data: any) => {
    try {
      const result = await createEnhancedProject(data)
      
      if (result.success && result.project) {
        // Refresh projects to include the new one
        await refreshProjects()
        
        // Switch to the new project
        setCurrentProject(result.project)
        localStorage.setItem('currentProjectId', result.project.id)
        
        console.log('✅ Created and switched to new project:', result.project.name)
      } else {
        console.error('Failed to create project:', result.error)
        throw new Error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('❌ Error creating project:', error)
      throw error
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Restore current project from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId')
    if (savedProjectId && projects.length > 0) {
      const savedProject = projects.find(p => p.id === savedProjectId)
      if (savedProject) {
        setCurrentProject(savedProject)
      }
    }
  }, [projects])

  const contextValue: ProjectContextType = {
    user,
    currentProject,
    projects,
    loading,
    switchProject,
    refreshProjects,
    createProject,
    sidebarOpen,
    toggleSidebar
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  )
}