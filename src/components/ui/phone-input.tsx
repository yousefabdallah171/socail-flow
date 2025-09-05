"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const countries = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
]

interface PhoneInputProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  label?: string
  error?: string
}

export function PhoneInput({
  id,
  value = "",
  onChange,
  placeholder = "Enter your phone number",
  disabled = false,
  required = false,
  className,
  label,
  error,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Try to detect country from the phone number
      const detectedCountry = countries.find(country => 
        value.startsWith(country.dialCode)
      )
      
      if (detectedCountry) {
        setSelectedCountry(detectedCountry)
        setPhoneNumber(value.slice(detectedCountry.dialCode.length).trim())
      } else {
        setPhoneNumber(value)
      }
    }
  }, [value])

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country)
    setOpen(false)
    
    // Update the full phone number
    const fullNumber = phoneNumber ? `${country.dialCode} ${phoneNumber}` : country.dialCode
    onChange?.(fullNumber)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Remove non-numeric characters (except spaces and hyphens for formatting)
    const cleanNumber = inputValue.replace(/[^\d\s-]/g, '')
    setPhoneNumber(cleanNumber)
    
    // Create full phone number
    const fullNumber = cleanNumber ? `${selectedCountry.dialCode} ${cleanNumber}` : selectedCountry.dialCode
    onChange?.(fullNumber)
  }

  const formatPhoneNumber = (number: string) => {
    // Basic formatting for common patterns
    const digits = number.replace(/\D/g, '')
    
    if (selectedCountry.code === 'US' || selectedCountry.code === 'CA') {
      // Format: (XXX) XXX-XXXX
      if (digits.length >= 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
      } else if (digits.length >= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      } else if (digits.length >= 3) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      }
    }
    
    return number
  }

  const isValidPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // Basic validation - phone should have 7-15 digits (international standard)
    return digits.length >= 7 && digits.length <= 15
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center space-x-2">
          <Phone className="h-4 w-4" />
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="flex space-x-2">
        {/* Country Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[140px] justify-between"
              disabled={disabled}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    onSelect={() => handleCountrySelect(country)}
                    className="flex items-center space-x-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <div className="flex-1">
          <Input
            id={id}
            type="tel"
            placeholder={placeholder}
            value={formatPhoneNumber(phoneNumber)}
            onChange={handlePhoneChange}
            disabled={disabled}
            required={required}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
      </div>

      {/* Validation Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {/* Format Helper */}
      {phoneNumber && !error && (
        <p className="text-xs text-muted-foreground">
          Full number: {selectedCountry.dialCode} {phoneNumber}
          {phoneNumber && !isValidPhoneNumber(`${selectedCountry.dialCode}${phoneNumber}`) && (
            <span className="text-amber-600 ml-2">⚠️ Check number format</span>
          )}
        </p>
      )}
    </div>
  )
}