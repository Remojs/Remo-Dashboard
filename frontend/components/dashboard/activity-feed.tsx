'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/api'

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
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span>Tareas Recientes</span>
          <Badge variant="secondary" className="text-xs font-normal">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay tareas aún.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded border-2',
                task.completed ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
              )}>
                {task.completed && <Check className="size-3" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', task.completed && 'line-through text-muted-foreground')}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">{timeAgo(task.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
