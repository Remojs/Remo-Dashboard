'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Search, Bell } from 'lucide-react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="h-8 w-[200px] pl-8 lg:w-[280px] bg-secondary/50 border-border"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative size-8">
              <Bell className="size-4" />
              <Badge 
                className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground"
              >
                3
              </Badge>
              <span className="sr-only">Notificaciones</span>
            </Button>
            
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
