"use client"

import { ThemeProvider } from "./theme-provider"
import { QueryProvider } from "./query-provider"
import { ToasterProvider } from "./toaster-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {children}
        <ToasterProvider />
      </QueryProvider>
    </ThemeProvider>
  )
}

export { ThemeProvider } from "./theme-provider"
export { QueryProvider } from "./query-provider" 
export { ToasterProvider } from "./toaster-provider"