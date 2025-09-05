"use client"

import { useState } from 'react'
import { Check, ChevronsUpDown, FolderOpen, Plus, Settings2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { CreateProjectDialog } from './create-project-dialog'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  slug: string
  industry?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  social_accounts_count: number
  content_count: number
  logo_url?: string
}

interface ProjectSwitcherProps {
  currentProject?: Project
  projects: Project[]
  onProjectSwitch: (projectId: string) => void
  className?: string
}

export function ProjectSwitcher({ 
  currentProject, 
  projects, 
  onProjectSwitch, 
  className 
}: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const activeProjects = projects.filter(p => p.status === 'active')

  const handleCreateProject = () => {
    setOpen(false)
    setCreateDialogOpen(true)
  }

  const handleProjectSettings = (projectId: string) => {
    window.location.href = `/projects/${projectId}/settings`
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[240px] justify-between", className)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium text-sm truncate">
                {currentProject?.name || "Select project..."}
              </span>
              {currentProject && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={cn("text-xs", getStatusColor(currentProject.status))}>
                    {currentProject.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {currentProject.social_accounts_count} accounts
                  </span>
                </div>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandEmpty>No projects found.</CommandEmpty>
          
          <CommandGroup heading="Projects">
            {activeProjects.map((project) => (
              <CommandItem
                key={project.id}
                value={project.id}
                onSelect={(value) => {
                  if (value !== currentProject?.id) {
                    onProjectSwitch(value)
                  }
                  setOpen(false)
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {project.logo_url ? (
                    <img 
                      src={project.logo_url} 
                      alt={project.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium truncate">
                        {project.name}
                      </span>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          currentProject?.id === project.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={cn("text-xs", getStatusColor(project.status))}>
                        {project.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.social_accounts_count} accounts • {project.content_count} posts
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleProjectSettings(project.id)}>
                      <Settings2 className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup>
            <CommandItem onSelect={handleCreateProject} className="text-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create new project
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>

    {/* Create Project Dialog */}
    <CreateProjectDialog 
      open={createDialogOpen} 
      onOpenChange={setCreateDialogOpen} 
    />
    </>
  )
}