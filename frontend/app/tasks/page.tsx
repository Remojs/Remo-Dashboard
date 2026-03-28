'use client'

import { useEffect, useState } from 'react'
import { ListChecks, Plus, Trash2, Check, Terminal, Bot, Info } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { tasksApi, type Task } from '@/lib/api'
import { cn } from '@/lib/utils'

const EMPTY_FORM = { title: '', description: '' }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const load = () => {
    setLoading(true)
    tasksApi.getAll({ limit: 200 })
      .then((r) => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const pending = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)

  const handleToggle = async (task: Task) => {
    setToggling(task.id)
    try {
      const res = await tasksApi.update(task.id, { completed: !task.completed })
      setTasks((prev) => prev.map((t) => t.id === task.id ? res.data : t))
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await tasksApi.create({ title: form.title, description: form.description || undefined })
      setTasks((prev) => [res.data, ...prev])
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

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  const endpointDocs = [
    {
      method: 'GET',
      description: 'Listar todas las tareas',
      example: `curl -H "Authorization: Bearer TOKEN" \\\n  ${baseUrl}/tasks`,
    },
    {
      method: 'POST',
      description: 'Crear una nueva tarea',
      example: `curl -X POST -H "Authorization: Bearer TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title":"Mi tarea","description":"opcional"}' \\\n  ${baseUrl}/tasks`,
    },
    {
      method: 'PUT',
      description: 'Completar / descompletar',
      example: `curl -X PUT -H "Authorization: Bearer TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"completed":true}' \\\n  ${baseUrl}/tasks/ID`,
    },
    {
      method: 'DELETE',
      description: 'Eliminar una tarea',
      example: `curl -X DELETE -H "Authorization: Bearer TOKEN" \\\n  ${baseUrl}/tasks/ID`,
    },
  ]

  return (
    <DashboardLayout title="Tareas">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ListChecks className="size-6 text-primary" />
              Tareas
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''} · {done.length} completada{done.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setFormOpen(true) }}>
            <Plus className="size-4 mr-1" /> Nueva tarea
          </Button>
        </div>

        {/* Pending tasks */}
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendientes</h2>
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-4 flex-1 max-w-xs" />
                </div>
              ))
            ) : pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Check className="size-8 text-primary mb-2" />
                <p className="text-sm font-medium">¡Todo completado!</p>
                <p className="text-xs text-muted-foreground mt-0.5">No hay tareas pendientes.</p>
              </div>
            ) : (
              pending.map((task) => (
                <TaskRow key={task.id} task={task} toggling={toggling} onToggle={handleToggle} onDelete={setDeleteTarget} />
              ))
            )}
          </div>
        </div>

        {/* Completed tasks */}
        {done.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completadas</h2>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border opacity-60">
              {done.map((task) => (
                <TaskRow key={task.id} task={task} toggling={toggling} onToggle={handleToggle} onDelete={setDeleteTarget} />
              ))}
            </div>
          </div>
        )}

        {/* API docs for AI / Telegram bot */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="size-5 text-primary" />
              Integración con Agente IA / Telegram
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Endpoints REST para que tu bot agregue, complete o elimine tareas.
              Todos requieren el header{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono text-[11px]">Authorization: Bearer TOKEN</code>.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Login */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Info className="size-3.5 text-primary" />
                Paso 1 — Obtener token (login)
              </div>
              <pre className="text-[11px] text-foreground font-mono break-all whitespace-pre-wrap leading-relaxed">{`curl -X POST -H "Content-Type: application/json" \\\n  -d '{"email":"thiagozambonini24@gmail.com","password":"ThiagoZZZZ2003+"}' \\\n  ${baseUrl}/auth/login`}</pre>
            </div>

            {/* Endpoints grid */}
            <div className="grid gap-2 sm:grid-cols-2">
              {endpointDocs.map((doc, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] font-mono font-bold px-1.5',
                        doc.method === 'GET' && 'text-emerald-400 border-emerald-800',
                        doc.method === 'POST' && 'text-blue-400 border-blue-800',
                        doc.method === 'PUT' && 'text-yellow-400 border-yellow-800',
                        doc.method === 'DELETE' && 'text-red-400 border-red-800',
                      )}
                    >
                      {doc.method}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{doc.description}</span>
                  </div>
                  <div className="flex items-start gap-1.5 rounded bg-background/60 px-2 py-1.5">
                    <Terminal className="size-3 shrink-0 text-muted-foreground mt-0.5" />
                    <pre className="text-[10px] font-mono text-foreground break-all whitespace-pre-wrap leading-relaxed">{doc.example}</pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="¿Qué hay que hacer?" />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalles adicionales..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar tarea</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong className="text-foreground">"{deleteTarget?.title}"</strong>? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function TaskRow({
  task,
  toggling,
  onToggle,
  onDelete,
}: {
  task: Task
  toggling: string | null
  onToggle: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/20 transition-colors group">
      <button
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150',
          task.completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border hover:border-primary',
          toggling === task.id && 'opacity-50 cursor-not-allowed',
        )}
        disabled={toggling === task.id}
        onClick={() => onToggle(task)}
        aria-label={task.completed ? 'Marcar pendiente' : 'Marcar completada'}
      >
        {task.completed && <Check className="size-3" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => onDelete(task)}
        aria-label="Eliminar"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

