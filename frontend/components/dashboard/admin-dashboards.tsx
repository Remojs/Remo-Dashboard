'use client'

import { useTheme } from 'next-themes'
import { LayoutDashboard, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ADMIN_DASHBOARDS } from '@/lib/dashboard-config'

const colorBg: Record<string, string> = {
  violet: 'bg-violet-500/10 group-hover:bg-violet-500/20',
  sky: 'bg-sky-500/10 group-hover:bg-sky-500/20',
  emerald: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
  amber: 'bg-amber-500/10 group-hover:bg-amber-500/20',
  rose: 'bg-rose-500/10 group-hover:bg-rose-500/20',
  orange: 'bg-orange-500/10 group-hover:bg-orange-500/20',
  teal: 'bg-teal-500/10 group-hover:bg-teal-500/20',
  indigo: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
}

const colorText: Record<string, string> = {
  violet: 'text-violet-400',
  sky: 'text-sky-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  orange: 'text-orange-400',
  teal: 'text-teal-400',
  indigo: 'text-indigo-400',
}

const colorBorder: Record<string, string> = {
  violet: 'hover:border-violet-500/40',
  sky: 'hover:border-sky-500/40',
  emerald: 'hover:border-emerald-500/40',
  amber: 'hover:border-amber-500/40',
  rose: 'hover:border-rose-500/40',
  orange: 'hover:border-orange-500/40',
  teal: 'hover:border-teal-500/40',
  indigo: 'hover:border-indigo-500/40',
}

export function AdminDashboards() {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutDashboard
          className={cn('size-5', theme === 'violet' ? 'text-primary' : 'text-foreground')}
        />
        <h2 className="text-lg font-semibold tracking-tight">Admin Dashboards</h2>
        <span className="text-sm text-muted-foreground">— Paneles de gestión</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {ADMIN_DASHBOARDS.length === 0 ? (
          <Card
            className={cn(
              'col-span-full',
              theme === 'violet' ? 'glass-card border-primary/20' : 'border-dashed'
            )}
          >
            <CardHeader>
              <CardTitle className="text-base">Sin dashboards cargados</CardTitle>
              <CardDescription>
                Agregalos cuando quieras con URL, color y emoji custom desde la configuración.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          ADMIN_DASHBOARDS.map((dashboard) => (
            <a
              key={dashboard.id}
              href={dashboard.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card
                className={cn(
                  'h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                  theme === 'violet'
                    ? 'glass-card border-primary/20 hover:border-primary/40'
                    : cn('hover:border-border', colorBorder[dashboard.color])
                )}
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <div
                    className={cn(
                      'flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-colors duration-200',
                      colorBg[dashboard.color] ?? 'bg-primary/10 group-hover:bg-primary/20'
                    )}
                  >
                    {dashboard.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          'font-semibold text-sm truncate',
                          colorText[dashboard.color] ?? 'text-foreground'
                        )}
                      >
                        {dashboard.name}
                      </p>
                      <ExternalLink className="size-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {dashboard.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
