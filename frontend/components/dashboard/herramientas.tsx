'use client'

import { useTheme } from 'next-themes'
import { Wrench, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TOOLS } from '@/lib/dashboard-config'

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

export function Herramientas() {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className={cn('size-5', theme === 'violet' ? 'text-primary' : 'text-foreground')} />
        <h2 className="text-lg font-semibold tracking-tight">Herramientas</h2>
        <span className="text-sm text-muted-foreground">— Accesos rápidos del equipo</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {TOOLS.length === 0 ? (
          <Card
            className={cn(
              'col-span-full',
              theme === 'violet' ? 'glass-card border-primary/20' : 'border-dashed'
            )}
          >
            <CardHeader>
              <CardTitle className="text-base">Sin herramientas cargadas</CardTitle>
              <CardDescription>
                Cuando quieras, agregalas en la configuración con nombre, URL, color y emoji custom.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          TOOLS.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card
                className={cn(
                  'h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                  theme === 'violet'
                    ? 'glass-card border-primary/20 hover:border-primary/40'
                    : 'hover:border-border/80'
                )}
              >
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl text-xl transition-colors duration-200',
                      colorBg[tool.color] ?? 'bg-primary/10 group-hover:bg-primary/20'
                    )}
                  >
                    {tool.emoji}
                  </div>
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        colorText[tool.color] ?? 'text-foreground'
                      )}
                    >
                      {tool.name}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight">{tool.description}</p>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </CardContent>
              </Card>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
