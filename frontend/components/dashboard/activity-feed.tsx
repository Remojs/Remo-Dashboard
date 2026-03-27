'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/api'

const priorityColors: Record<string, string> = {
  high:   'bg-destructive/10 text-destructive',
  medium: 'bg-chart-2/10 text-chart-2',
  low:    'bg-emerald-500/10 text-emerald-500',
}

const statusLabel: Record<Task['status'], string> = {
  idea: 'Idea',
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  done: 'Hecho',
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora mismo'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} días`
}

interface Props {
  tasks?: Task[]
  loading?: boolean
}

export function ActivityFeed({ tasks = [], loading = false }: Props) {
  const { theme } = useTheme()

  return (
    <Card className={cn('h-full', theme === 'violet' && 'glass-card border-primary/20')}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span>Actividad Reciente</span>
          <Badge variant="secondary" className="text-xs font-normal">
            Tareas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay actividad aún.</p>
        ) : (
          tasks.map((task) => {
            const initials = task.assignee?.name
              ? task.assignee.name.slice(0, 2).toUpperCase()
              : '??'
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors',
                  theme === 'violet'
                    ? 'hover:bg-primary/5 border border-transparent hover:border-primary/10'
                    : 'hover:bg-muted/50'
                )}
              >
                <Avatar className="size-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{timeAgo(task.createdAt)}</span>
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                      priorityColors[task.priority]
                    )}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {statusLabel[task.status]}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

