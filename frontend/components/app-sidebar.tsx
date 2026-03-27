'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  KeyRound,
  ShoppingCart,
  Lightbulb,
  DollarSign,
  Activity,
  Settings,
  ChevronDown,
  LogOut,
  Wrench,
  PanelsTopLeft,
  Megaphone,
} from 'lucide-react'
import logo from '@/assets/logo.png'
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
  { title: 'Mail', icon: Mail, href: '/mail' },
  { title: 'Passwords', icon: KeyRound, href: '/passwords' },
  { title: 'Sales / Projects', icon: ShoppingCart, href: '/sales' },
  { title: 'Ideas & Tasks', icon: Lightbulb, href: '/tasks' },
  { title: 'Expenses', icon: DollarSign, href: '/expenses' },
  { title: 'Web Vitals', icon: Activity, href: '/vitals' },
  { title: 'Herramientas', icon: Wrench, href: '/herramientas' },
  { title: 'Admin Dashboards', icon: PanelsTopLeft, href: '/admin-dashboards' },
  { title: 'Promociones', icon: Megaphone, href: '/promociones' },
  { title: 'Settings', icon: Settings, href: '/settings' },
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
          <Image src={logo} alt="Interaktive" width={36} height={36} className="rounded-lg" />
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">Interaktive</span>
            <span className="text-xs text-muted-foreground">Admin Dashboard</span>
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
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="size-4" />
                <span>Configuración</span>
              </Link>
            </DropdownMenuItem>
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
