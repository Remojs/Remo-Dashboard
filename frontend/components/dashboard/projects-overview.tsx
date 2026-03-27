'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/api'

const statusMap: Record<Project['status'], { label: string; className: string }> = {
  in_progress: { label: 'En Progreso', className: 'bg-chart-1/10 text-chart-1 border-chart-1/30' },
  pending: { label: 'Pendiente', className: 'bg-muted text-muted-foreground border-border' },
  completed: { label: 'Completado', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
}

interface Props {
  projects?: Project[]
  loading?: boolean
}

export function ProjectsOverview({ projects = [], loading = false }: Props) {
  const { theme } = useTheme()

  return (
    <Card className={cn('h-full', theme === 'violet' && 'glass-card border-primary/20')}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Proyectos Activos</CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href="/sales"><ExternalLink className="size-4" /></Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay proyectos aún.</p>
        ) : (
          projects.map((project) => {
            const s = statusMap[project.status] ?? statusMap.pending
            return (
              <div
                key={project.id}
                className={cn(
                  'p-3 rounded-lg border transition-all duration-200',
                  theme === 'violet'
                    ? 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{project.clientName}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{project.type}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    ${parseFloat(project.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn('text-[10px] font-medium', s.className)}>
                    {s.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

