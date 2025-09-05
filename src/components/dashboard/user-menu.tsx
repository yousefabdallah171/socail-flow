"use client"

import { useState } from 'react'
import { LogOut, User, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/actions'

interface UserMenuProps {
  user: {
    id: string
    name: string
    email: string
    avatar_url?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-2 hover:bg-accent">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ''} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none truncate max-w-[120px]">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Account Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & Support
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}