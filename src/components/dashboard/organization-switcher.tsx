"use client"

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus, Building2, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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

interface OrganizationSwitcherProps {
  organizations: Organization[]
  currentOrgId?: string
  onOrganizationChange: (orgId: string) => void
  onCreateOrganization?: () => void
  className?: string
}

export function OrganizationSwitcher({ 
  organizations, 
  currentOrgId, 
  onOrganizationChange,
  onCreateOrganization,
  className 
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  const currentOrg = organizations.find(org => org.id === currentOrgId)
  
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'pro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'admin': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      case 'editor': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
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
            className={cn("w-[300px] justify-between h-12", className)}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={currentOrg?.logo_url} alt={currentOrg?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {currentOrg?.name?.charAt(0) || 'O'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-start min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {currentOrg?.name || 'Select organization'}
                  </span>
                  {currentOrg?.is_default && (
                    <Badge variant="outline" className="text-xs px-1 h-4">
                      Default
                    </Badge>
                  )}
                </div>
                {currentOrg && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {currentOrg.role}
                    </span>
                    <Badge className={cn("text-xs px-1 h-4", getTierBadgeColor(currentOrg.subscription_tier))}>
                      {currentOrg.subscription_tier.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[320px] p-0">
          <Command>
            <CommandInput placeholder="Search organizations..." />
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandList>
              <CommandGroup heading="Your Organizations">
                {organizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    value={org.id}
                    onSelect={() => {
                      onOrganizationChange(org.id)
                      setOpen(false)
                    }}
                    className="flex items-center space-x-3 p-3 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentOrgId === org.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={org.logo_url} alt={org.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {org.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium truncate">
                          {org.name}
                        </span>
                        {org.is_default && (
                          <Badge variant="outline" className="text-xs px-1 h-4">
                            Default
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={cn("text-xs px-1 h-4", getRoleBadgeColor(org.role))}>
                          {org.role}
                        </Badge>
                        <Badge className={cn("text-xs px-1 h-4", getTierBadgeColor(org.subscription_tier))}>
                          {org.subscription_tier}
                        </Badge>
                      </div>
                      
                      {(org.projects_count !== undefined || org.team_members_count !== undefined) && (
                        <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                          {org.projects_count !== undefined && (
                            <span>{org.projects_count} projects</span>
                          )}
                          {org.team_members_count !== undefined && (
                            <span>{org.team_members_count} members</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup>
                <CommandItem 
                  className="flex items-center space-x-3 p-3 cursor-pointer text-primary"
                  onSelect={() => {
                    setOpen(false)
                    if (onCreateOrganization) {
                      onCreateOrganization()
                    } else {
                      setShowCreateDialog(true)
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Create Organization</span>
                </CommandItem>
                
                {currentOrg && (
                  <CommandItem className="flex items-center space-x-3 p-3 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Organization Settings</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage client projects and team members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Organization creation functionality will be implemented in the next phase.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}