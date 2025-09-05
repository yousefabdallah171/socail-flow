"use client"

import { X, Sparkles, Zap } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface FreeBannerProps {
  className?: string
  dismissible?: boolean
}

export function FreeBanner({ className, dismissible = true }: FreeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r from-primary via-accent to-secondary text-white",
        "animate-fade-in",
        className
      )}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative px-4 py-3 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-center space-x-4 max-w-screen-2xl">
          {/* Animated sparkles */}
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 animate-pulse-slow" />
            <Zap className="h-4 w-4 animate-bounce-slow" />
          </div>
          
          {/* Main message */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 text-center sm:text-left flex-1">
            <span className="text-sm sm:text-base font-semibold">
              🎉 SocialFlow is 100% FREE during MVP!
            </span>
            <span className="text-xs sm:text-sm opacity-90 hidden sm:block">
              AI-powered social media management • Unlimited everything • No credit card required
            </span>
          </div>

          {/* CTA */}
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex bg-white text-primary hover:bg-gray-100 font-medium"
          >
            Get Started Free
          </Button>

          {/* Dismiss button */}
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="ml-auto p-1 rounded-md hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Mobile CTA */}
        <div className="mt-2 flex justify-center sm:hidden">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-primary hover:bg-gray-100 font-medium"
          >
            Get Started Free
          </Button>
        </div>
      </div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0s'}} />
        <div className="absolute top-2 right-1/3 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '1.5s'}} />
      </div>
    </div>
  )
}

interface StickyFreeBannerProps extends FreeBannerProps {
  show?: boolean
}

export function StickyFreeBanner({ show = true, ...props }: StickyFreeBannerProps) {
  if (!show) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-in">
      <FreeBanner {...props} />
    </div>
  )
}

export function InlineFreeBanner(props: FreeBannerProps) {
  return <FreeBanner {...props} />
}

// Mini version for dashboard
export function MiniFreeBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-primary to-accent text-white px-3 py-2 rounded-lg text-xs font-medium text-center",
        "animate-fade-in",
        className
      )}
    >
      <span className="flex items-center justify-center space-x-1">
        <Sparkles className="h-3 w-3" />
        <span>100% FREE MVP</span>
        <Sparkles className="h-3 w-3" />
      </span>
    </div>
  )
}