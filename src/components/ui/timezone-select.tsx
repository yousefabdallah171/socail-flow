"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const timezones = [
  // Popular/Common timezones first
  { value: "UTC", label: "UTC - Coordinated Universal Time", offset: "+00:00", region: "Universal" },
  
  // Americas
  { value: "America/New_York", label: "Eastern Time (New York)", offset: "-05:00", region: "Americas" },
  { value: "America/Chicago", label: "Central Time (Chicago)", offset: "-06:00", region: "Americas" },
  { value: "America/Denver", label: "Mountain Time (Denver)", offset: "-07:00", region: "Americas" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)", offset: "-08:00", region: "Americas" },
  { value: "America/Toronto", label: "Eastern Time (Toronto)", offset: "-05:00", region: "Americas" },
  { value: "America/Vancouver", label: "Pacific Time (Vancouver)", offset: "-08:00", region: "Americas" },
  { value: "America/Mexico_City", label: "Central Time (Mexico City)", offset: "-06:00", region: "Americas" },
  { value: "America/Sao_Paulo", label: "Brasília Time (São Paulo)", offset: "-03:00", region: "Americas" },
  { value: "America/Buenos_Aires", label: "Argentina Time (Buenos Aires)", offset: "-03:00", region: "Americas" },
  
  // Europe
  { value: "Europe/London", label: "Greenwich Mean Time (London)", offset: "+00:00", region: "Europe" },
  { value: "Europe/Paris", label: "Central European Time (Paris)", offset: "+01:00", region: "Europe" },
  { value: "Europe/Berlin", label: "Central European Time (Berlin)", offset: "+01:00", region: "Europe" },
  { value: "Europe/Rome", label: "Central European Time (Rome)", offset: "+01:00", region: "Europe" },
  { value: "Europe/Madrid", label: "Central European Time (Madrid)", offset: "+01:00", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Central European Time (Amsterdam)", offset: "+01:00", region: "Europe" },
  { value: "Europe/Stockholm", label: "Central European Time (Stockholm)", offset: "+01:00", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow Standard Time", offset: "+03:00", region: "Europe" },
  { value: "Europe/Istanbul", label: "Turkey Time (Istanbul)", offset: "+03:00", region: "Europe" },
  
  // Asia
  { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai)", offset: "+04:00", region: "Asia" },
  { value: "Asia/Kolkata", label: "India Standard Time (Mumbai)", offset: "+05:30", region: "Asia" },
  { value: "Asia/Shanghai", label: "China Standard Time (Shanghai)", offset: "+08:00", region: "Asia" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)", offset: "+09:00", region: "Asia" },
  { value: "Asia/Seoul", label: "Korea Standard Time (Seoul)", offset: "+09:00", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore Standard Time", offset: "+08:00", region: "Asia" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time", offset: "+08:00", region: "Asia" },
  { value: "Asia/Bangkok", label: "Indochina Time (Bangkok)", offset: "+07:00", region: "Asia" },
  { value: "Asia/Jakarta", label: "Western Indonesia Time (Jakarta)", offset: "+07:00", region: "Asia" },
  
  // Africa & Middle East
  { value: "Africa/Cairo", label: "Eastern European Time (Cairo)", offset: "+02:00", region: "Africa" },
  { value: "Africa/Lagos", label: "West Africa Time (Lagos)", offset: "+01:00", region: "Africa" },
  { value: "Africa/Johannesburg", label: "South Africa Standard Time", offset: "+02:00", region: "Africa" },
  { value: "Africa/Casablanca", label: "Western European Time (Casablanca)", offset: "+01:00", region: "Africa" },
  
  // Oceania
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)", offset: "+10:00", region: "Oceania" },
  { value: "Australia/Melbourne", label: "Australian Eastern Time (Melbourne)", offset: "+10:00", region: "Oceania" },
  { value: "Australia/Perth", label: "Australian Western Time (Perth)", offset: "+08:00", region: "Oceania" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (Auckland)", offset: "+12:00", region: "Oceania" },
]

interface TimezoneSelectProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  className?: string
  label?: string
  error?: string
}

export function TimezoneSelect({
  id,
  value = "UTC",
  onChange,
  disabled = false,
  required = false,
  className,
  label,
  error,
}: TimezoneSelectProps) {
  const [open, setOpen] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState(
    timezones.find(tz => tz.value === value) || timezones[0]
  )
  const [currentTime, setCurrentTime] = useState("")

  // Update selected timezone when value changes
  useEffect(() => {
    const timezone = timezones.find(tz => tz.value === value)
    if (timezone) {
      setSelectedTimezone(timezone)
    }
  }, [value])

  // Update current time display every second
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', {
          timeZone: selectedTimezone.value,
          hour12: true,
          hour: 'numeric',
          minute: '2-digit',
        })
        setCurrentTime(timeString)
      } catch {
        setCurrentTime("")
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [selectedTimezone])

  const handleTimezoneSelect = (timezone: typeof timezones[0]) => {
    setSelectedTimezone(timezone)
    setOpen(false)
    onChange?.(timezone.value)
  }

  // Auto-detect user's timezone
  const detectTimezone = () => {
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const timezone = timezones.find(tz => tz.value === detectedTz)
      if (timezone) {
        handleTimezoneSelect(timezone)
      }
    } catch {
      // Fallback to UTC if detection fails
      handleTimezoneSelect(timezones[0])
    }
  }

  // Group timezones by region
  const groupedTimezones = timezones.reduce((groups, timezone) => {
    const region = timezone.region
    if (!groups[region]) {
      groups[region] = []
    }
    groups[region].push(timezone)
    return groups
  }, {} as Record<string, typeof timezones>)

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{label}</span>
            {required && <span className="text-destructive">*</span>}
          </Label>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={detectTimezone}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Auto-detect
          </Button>
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-destructive"
            )}
            disabled={disabled}
          >
            <div className="flex items-center space-x-2 truncate">
              <Clock className="h-4 w-4 shrink-0" />
              <div className="truncate text-left">
                <div className="font-medium">{selectedTimezone.label}</div>
                {currentTime && (
                  <div className="text-xs text-muted-foreground">
                    Current time: {currentTime}
                  </div>
                )}
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search timezone..." />
            <CommandEmpty>No timezone found.</CommandEmpty>
            
            <div className="max-h-[300px] overflow-y-auto">
              {Object.entries(groupedTimezones).map(([region, tzList]) => (
                <CommandGroup key={region} heading={region}>
                  {tzList.map((timezone) => (
                    <CommandItem
                      key={timezone.value}
                      onSelect={() => handleTimezoneSelect(timezone)}
                      className="flex items-center space-x-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedTimezone.value === timezone.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{timezone.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {timezone.value} ({timezone.offset})
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Current time display */}
      {selectedTimezone && !error && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{selectedTimezone.value}</span>
          {currentTime && (
            <span>Current time: {currentTime}</span>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}