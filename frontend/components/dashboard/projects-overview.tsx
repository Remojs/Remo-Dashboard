'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/api'

interface Props {
  tasks?: Task[]
  loading?: boolean
}

export function TasksSummary({ tasks = [], loading = false }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Tareas Recientes</CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href="/tasks"><ExternalLink className="size-4" /></Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay tareas aún.</p>
        ) : (
          tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all duration-200"
            >
              {task.completed
                ? <CheckCircle2 className="size-4 text-primary shrink-0" />
                : <Circle className="size-4 text-muted-foreground shrink-0" />
              }
              <span className={cn(
                'text-sm flex-1 truncate',
                task.completed && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
}

