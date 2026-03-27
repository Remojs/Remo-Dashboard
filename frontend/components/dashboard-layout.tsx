'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={cn(
        "relative min-h-screen",
        mounted && theme === 'violet' && "grid-background"
      )}>
        {/* Scan lines overlay for violet theme */}
        {mounted && theme === 'violet' && (
          <div className="scan-lines pointer-events-none absolute inset-0 z-0" />
        )}
        
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          
          {title && (
            <h1 className="text-lg font-semibold hidden sm:block">{title}</h1>
          )}
          
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>
        
        {/* Main Content */}
        <main className="relative z-10 flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
