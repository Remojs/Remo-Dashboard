'use client'

import { useEffect, useState } from 'react'
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Pencil,
  X,
  Check,
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  jobSearchApi,
  type JobBoard,
  type JobApplication,
  type ApplicationStatus,
} from '@/lib/api'
import { cn } from '@/lib/utils'

// ── Color helpers (same palette as herramientas) ──────────────────────────────
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

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'applied',    label: 'Postulado',   color: 'bg-blue-500/15 text-blue-400' },
  { value: 'interview',  label: 'Entrevista',  color: 'bg-yellow-500/15 text-yellow-400' },
  { value: 'technical',  label: 'Técnica',     color: 'bg-purple-500/15 text-purple-400' },
  { value: 'offer',      label: 'Oferta',      color: 'bg-emerald-500/15 text-emerald-400' },
  { value: 'accepted',   label: 'Aceptado',    color: 'bg-green-500/15 text-green-400' },
  { value: 'rejected',   label: 'Rechazado',   color: 'bg-red-500/15 text-red-400' },
]

const statusMap = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]))

// ── Empty forms ───────────────────────────────────────────────────────────────
const EMPTY_BOARD = { name: '', url: '', description: '', color: 'violet', emoji: '💼' }
const EMPTY_APP = {
  company: '',
  position: '',
  url: '',
  status: 'applied' as ApplicationStatus,
  date: new Date().toISOString().split('T')[0],
  notes: '',
  salary: '',
}

export default function BusquedaLaboralPage() {
  // ── boards state ──
  const [boards, setBoards] = useState<JobBoard[]>([])
  const [boardsLoading, setBoardsLoading] = useState(true)
  const [boardForm, setBoardForm] = useState(EMPTY_BOARD)
  const [savingBoard, setSavingBoard] = useState(false)

  // ── applications state ──
  const [apps, setApps] = useState<JobApplication[]>([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [appDialogOpen, setAppDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<JobApplication | null>(null)
  const [appForm, setAppForm] = useState(EMPTY_APP)
  const [savingApp, setSavingApp] = useState(false)
  const [deleteAppTarget, setDeleteAppTarget] = useState<JobApplication | null>(null)

  // ── load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    jobSearchApi
      .getBoards()
      .then((r) => setBoards(r.data))
      .catch(console.error)
      .finally(() => setBoardsLoading(false))

    jobSearchApi
      .getApplications()
      .then((r) => setApps(r.data))
      .catch(console.error)
      .finally(() => setAppsLoading(false))
  }, [])

  // ── boards handlers ───────────────────────────────────────────────────────
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBoard(true)
    try {
      const r = await jobSearchApi.createBoard(boardForm)
      setBoards((prev) => [r.data, ...prev])
      setBoardForm(EMPTY_BOARD)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar bolsa')
    } finally {
      setSavingBoard(false)
    }
  }

  const handleRemoveBoard = async (id: string) => {
    try {
      await jobSearchApi.removeBoard(id)
      setBoards((prev) => prev.filter((b) => b.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al borrar bolsa')
    }
  }

  // ── apps handlers ─────────────────────────────────────────────────────────
  const openCreateApp = () => {
    setEditTarget(null)
    setAppForm(EMPTY_APP)
    setAppDialogOpen(true)
  }

  const openEditApp = (app: JobApplication) => {
    setEditTarget(app)
    setAppForm({
      company: app.company,
      position: app.position,
      url: app.url ?? '',
      status: app.status,
      date: app.date.split('T')[0],
      notes: app.notes ?? '',
      salary: app.salary ?? '',
    })
    setAppDialogOpen(true)
  }

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingApp(true)
    try {
      const payload = {
        ...appForm,
        url: appForm.url || undefined,
        notes: appForm.notes || undefined,
        salary: appForm.salary || undefined,
      }
      if (editTarget) {
        const r = await jobSearchApi.updateApplication(editTarget.id, payload)
        setApps((prev) => prev.map((a) => (a.id === editTarget.id ? r.data : a)))
      } else {
        const r = await jobSearchApi.createApplication(payload)
        setApps((prev) => [r.data, ...prev])
      }
      setAppDialogOpen(false)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar vacante')
    } finally {
      setSavingApp(false)
    }
  }

  const handleDeleteApp = async () => {
    if (!deleteAppTarget) return
    try {
      await jobSearchApi.removeApplication(deleteAppTarget.id)
      setApps((prev) => prev.filter((a) => a.id !== deleteAppTarget.id))
      setDeleteAppTarget(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al borrar vacante')
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Búsqueda Laboral">
      <div className="space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Briefcase className="size-5 text-foreground" />
          <h2 className="text-lg font-semibold tracking-tight">Búsqueda Laboral</h2>
          <span className="text-sm text-muted-foreground">— Bolsas de trabajo y vacantes</span>
        </div>

        {/* ── Section 1: Job Boards ────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bolsas de trabajo</CardTitle>
            <CardDescription>Portales de empleo — hacé click para abrirlos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Add board form */}
            <form onSubmit={handleCreateBoard} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="space-y-1.5">
                <Label htmlFor="board-name">Nombre</Label>
                <Input
                  id="board-name"
                  required
                  value={boardForm.name}
                  onChange={(e) => setBoardForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="LinkedIn"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="board-url">URL</Label>
                <Input
                  id="board-url"
                  required
                  value={boardForm.url}
                  onChange={(e) => setBoardForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://linkedin.com/jobs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="board-color">Color</Label>
                <Input
                  id="board-color"
                  value={boardForm.color}
                  onChange={(e) => setBoardForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="violet"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="board-emoji">Emoji</Label>
                <Input
                  id="board-emoji"
                  value={boardForm.emoji}
                  onChange={(e) => setBoardForm((p) => ({ ...p, emoji: e.target.value }))}
                  placeholder="💼"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={savingBoard} className="w-full gap-2">
                  <Plus className="size-4" />
                  {savingBoard ? 'Guardando…' : 'Agregar'}
                </Button>
              </div>
            </form>

            {/* Mosaic grid */}
            {boardsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay bolsas de trabajo guardadas.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {boards.map((board) => (
                  <div key={board.id} className="group relative">
                    <a
                      href={board.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex flex-col gap-2 rounded-xl border border-border p-4 transition-all duration-200 cursor-pointer',
                        colorBg[board.color] ?? 'bg-muted/40 group-hover:bg-muted/60'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{board.emoji}</span>
                        <ExternalLink
                          className={cn('size-3.5 opacity-60', colorText[board.color] ?? 'text-muted-foreground')}
                        />
                      </div>
                      <div>
                        <p className={cn('text-sm font-semibold', colorText[board.color] ?? 'text-foreground')}>
                          {board.name}
                        </p>
                        {board.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{board.description}</p>
                        )}
                      </div>
                    </a>
                    <button
                      onClick={() => handleRemoveBoard(board.id)}
                      className="absolute -top-1.5 -right-1.5 hidden group-hover:flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section 2: Applications CRUD ─────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Vacantes postuladas</CardTitle>
                <CardDescription>Registrá cada posición a la que te postulaste.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={openCreateApp}>
                <Plus className="size-4" />
                Nueva vacante
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : apps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No hay vacantes registradas todavía.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Posición</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Salario</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="w-20 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.company}</TableCell>
                        <TableCell>{app.position}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', statusMap[app.status]?.color ?? '')}
                          >
                            {statusMap[app.status]?.label ?? app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(app.date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {app.salary ?? '—'}
                        </TableCell>
                        <TableCell>
                          {app.url ? (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              Ver
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                          {app.notes ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditApp(app)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteAppTarget(app)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Dialog: create / edit application ──────────────────────────────── */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar vacante' : 'Nueva vacante'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveApp} className="space-y-4 pt-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="app-company">Empresa *</Label>
                <Input
                  id="app-company"
                  required
                  value={appForm.company}
                  onChange={(e) => setAppForm((p) => ({ ...p, company: e.target.value }))}
                  placeholder="Google"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-position">Posición *</Label>
                <Input
                  id="app-position"
                  required
                  value={appForm.position}
                  onChange={(e) => setAppForm((p) => ({ ...p, position: e.target.value }))}
                  placeholder="Frontend Developer"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-status">Estado</Label>
                <Select
                  value={appForm.status}
                  onValueChange={(v) => setAppForm((p) => ({ ...p, status: v as ApplicationStatus }))}
                >
                  <SelectTrigger id="app-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-date">Fecha</Label>
                <Input
                  id="app-date"
                  type="date"
                  value={appForm.date}
                  onChange={(e) => setAppForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-url">Link de la oferta</Label>
                <Input
                  id="app-url"
                  value={appForm.url}
                  onChange={(e) => setAppForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-salary">Salario / Rango</Label>
                <Input
                  id="app-salary"
                  value={appForm.salary}
                  onChange={(e) => setAppForm((p) => ({ ...p, salary: e.target.value }))}
                  placeholder="$800k – $1.2M"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-notes">Notas</Label>
              <Textarea
                id="app-notes"
                rows={3}
                value={appForm.notes}
                onChange={(e) => setAppForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Referido por Juan, proceso de 3 etapas…"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAppDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingApp} className="gap-2">
                <Check className="size-4" />
                {savingApp ? 'Guardando…' : editTarget ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: confirm delete ──────────────────────────────────────────── */}
      <Dialog open={!!deleteAppTarget} onOpenChange={() => setDeleteAppTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar vacante?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se eliminará <span className="font-medium text-foreground">{deleteAppTarget?.position}</span> en{' '}
            <span className="font-medium text-foreground">{deleteAppTarget?.company}</span>. Esta acción no se puede
            deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAppTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDeleteApp}>
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
