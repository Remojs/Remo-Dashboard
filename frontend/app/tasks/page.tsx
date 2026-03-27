'use client'

import { useEffect, useState } from 'react'
import { ListChecks, Lightbulb, Plus, ChevronRight, ChevronLeft, Trash2, User2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { tasksApi, type Task } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

// Kanban columns only — ideas are shown separately below
const KANBAN_COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'pending', label: 'Pendiente' },
  { key: 'in_progress', label: 'En progreso' },
  { key: 'done', label: 'Hecho' },
]

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const PRIORITY_COLORS_VIOLET: Record<Task['priority'], string> = {
  low: 'bg-slate-800/60 text-slate-300',
  medium: 'bg-yellow-900/30 text-yellow-400',
  high: 'bg-red-900/30 text-red-400',
}

const KANBAN_STATUS_ORDER: Task['status'][] = ['pending', 'in_progress', 'done']

const EMPTY_FORM = { title: '', description: '', priority: 'medium' as Task['priority'], status: 'pending' as Task['status'] }

export default function TasksPage() {
  const { theme } = useTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [moving, setMoving] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    tasksApi.getAll({ limit: 200 })
      .then((r) => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const getColumn = (colKey: Task['status']) => tasks.filter((t) => t.status === colKey)
  const ideas = tasks.filter((t) => t.status === 'idea')

  const moveTask = async (task: Task, direction: 'forward' | 'back') => {
    const idx = KANBAN_STATUS_ORDER.indexOf(task.status)
    const newStatus = KANBAN_STATUS_ORDER[direction === 'forward' ? idx + 1 : idx - 1]
    if (!newStatus) return
    setMoving(task.id)
    try {
      const res = await tasksApi.update(task.id, { status: newStatus })
      setTasks((prev) => prev.map((t) => t.id === task.id ? res.data : t))
    } catch (err) {
      console.error(err)
    } finally {
      setMoving(null)
    }
  }

  const promoteIdea = async (task: Task) => {
    setMoving(task.id)
    try {
      const res = await tasksApi.update(task.id, { status: 'pending' })
      setTasks((prev) => prev.map((t) => t.id === task.id ? res.data : t))
    } catch (err) {
      console.error(err)
    } finally {
      setMoving(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await tasksApi.create({ title: form.title, description: form.description || undefined, priority: form.priority, status: form.status })
      setTasks((prev) => [...prev, res.data])
      setFormOpen(false)
      setForm(EMPTY_FORM)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await tasksApi.remove(deleteTarget.id).catch(console.error)
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // Column background classes — violet theme uses primary tints
  const getColBg = (key: Task['status']) => {
    if (theme === 'violet') {
      const map: Record<string, string> = {
        pending: 'bg-primary/5 border border-primary/10',
        in_progress: 'bg-blue-950/20 border border-blue-500/10',
        done: 'bg-emerald-950/20 border border-emerald-500/10',
      }
      return map[key] ?? 'bg-primary/5'
    }
    const map: Record<string, string> = {
      pending: 'bg-yellow-50 dark:bg-yellow-950/30',
      in_progress: 'bg-blue-50 dark:bg-blue-950/30',
      done: 'bg-emerald-50 dark:bg-emerald-950/30',
    }
    return map[key] ?? 'bg-muted'
  }

  const priorityClasses = theme === 'violet' ? PRIORITY_COLORS_VIOLET : PRIORITY_COLORS

  return (
    <DashboardLayout title="Tareas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ListChecks className="size-6" /> Tablero de Tareas
            </h1>
            <p className="text-muted-foreground text-sm">{tasks.length} tareas en total</p>
          </div>
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setFormOpen(true) }}>
            <Plus className="size-4 mr-1" /> Nueva tarea
          </Button>
        </div>

        {/* Kanban board — pending / in_progress / done */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = getColumn(col.key)
            const colIdx = KANBAN_STATUS_ORDER.indexOf(col.key)
            return (
              <div key={col.key} className={cn('rounded-xl p-3 min-h-[180px]', getColBg(col.key))}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">{col.label}</h2>
                  <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {loading
                    ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
                    : colTasks.length === 0
                      ? <p className="text-xs text-muted-foreground text-center py-4">Sin tareas</p>
                      : colTasks.map((task) => (
                        <Card key={task.id} className={cn(
                          'shadow-sm',
                          theme === 'violet' ? 'bg-background/60 backdrop-blur-sm' : 'bg-background/80 backdrop-blur-sm'
                        )}>
                          <CardHeader className="p-3 pb-1">
                            <div className="flex items-start justify-between gap-1">
                              <CardTitle className="text-xs font-medium leading-snug">{task.title}</CardTitle>
                              <Button variant="ghost" size="icon" className="size-5 shrink-0 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(task)}>
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="px-3 pb-3 pt-0 space-y-2">
                            {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
                            {task.assignee && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User2 className="size-3" />
                                <span className="truncate">{task.assignee.name}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium capitalize', priorityClasses[task.priority])}>
                                {task.priority === 'low' ? 'Baja' : task.priority === 'medium' ? 'Media' : 'Alta'}
                              </span>
                              <div className="flex gap-0.5">
                                {colIdx > 0 && (
                                  <Button variant="ghost" size="icon" className="size-6" disabled={moving === task.id} onClick={() => moveTask(task, 'back')}>
                                    <ChevronLeft className="size-3" />
                                  </Button>
                                )}
                                {colIdx < KANBAN_STATUS_ORDER.length - 1 && (
                                  <Button variant="ghost" size="icon" className="size-6" disabled={moving === task.id} onClick={() => moveTask(task, 'forward')}>
                                    <ChevronRight className="size-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  }
                </div>
              </div>
            )
          })}
        </div>

        {/* Ideas section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-yellow-500" />
            <h2 className="text-base font-semibold">Ideas</h2>
            <Badge variant="secondary" className="text-xs">{ideas.length}</Badge>
          </div>
          <div className={cn('rounded-xl border p-3 min-h-[60px] space-y-2',
            theme === 'violet' ? 'bg-primary/5 border-primary/10' : 'bg-muted/40'
          )}>
            {loading
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
              : ideas.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-3">Sin ideas aún. ¡Agregá una!</p>
                : ideas.map((task) => (
                  <div key={task.id} className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2',
                    theme === 'violet' ? 'bg-background/60 backdrop-blur-sm' : 'bg-background',
                    'border border-border'
                  )}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
                      {task.assignee && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <User2 className="size-3" />
                          <span>{task.assignee.name}</span>
                        </div>
                      )}
                    </div>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 capitalize', priorityClasses[task.priority])}>
                      {task.priority === 'low' ? 'Baja' : task.priority === 'medium' ? 'Media' : 'Alta'}
                    </span>
                    <Button variant="outline" size="sm" className="text-xs h-7 shrink-0" disabled={moving === task.id} onClick={() => promoteIdea(task)}>
                      Promover
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(task)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nombre de la tarea" />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Columna inicial</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Task['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="done">Hecho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar tarea</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong>{deleteTarget?.title}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
