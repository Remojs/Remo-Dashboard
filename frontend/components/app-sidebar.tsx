'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  KeyRound,
  Lightbulb,
  DollarSign,
  Activity,
  ChevronDown,
  LogOut,
  Wrench,
  PanelsTopLeft,
  ListChecks,
  CreditCard,
  TrendingUp,
  Briefcase,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

const navigationItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Passwords', icon: KeyRound, href: '/passwords' },
  { title: 'Tareas', icon: ListChecks, href: '/tasks' },
  { title: 'Expenses', icon: DollarSign, href: '/expenses' },
  { title: 'Ingresos', icon: TrendingUp, href: '/income' },
  { title: 'Tracker Deuda', icon: CreditCard, href: '/debt' },
  { title: 'Web Vitals', icon: Activity, href: '/vitals' },
  { title: 'Herramientas', icon: Wrench, href: '/herramientas' },
  { title: 'Admin Dashboards', icon: PanelsTopLeft, href: '/admin-dashboards' },
  { title: 'Búsqueda Laboral', icon: Briefcase, href: '/busqueda-laboral' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : '??'

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base select-none">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">RemoDashboard</span>
            <span className="text-xs text-muted-foreground">Panel personal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "transition-all duration-200",
                      pathname === item.href && "bg-primary/10 text-primary border-l-2 border-primary"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-4">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <Avatar className="size-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-sm">
                <span className="font-medium">{user?.name ?? '—'}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role ?? 'user'}</span>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
