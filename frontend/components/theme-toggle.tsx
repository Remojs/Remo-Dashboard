'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-8">
        <Sun className="size-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "size-8 transition-all duration-200",
            theme === 'violet' && "text-primary hover:text-primary"
          )}
        >
          {theme === 'light' && <Sun className="size-4" />}
          {theme === 'dark' && <Moon className="size-4" />}
          {theme === 'violet' && <Sparkles className="size-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === 'light' && "bg-accent"
          )}
        >
          <Sun className="size-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === 'dark' && "bg-accent"
          )}
        >
          <Moon className="size-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('violet')}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === 'violet' && "bg-accent"
          )}
        >
          <Sparkles className="size-4" />
          <span>Violeta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
