'use client'

import { useEffect, useState } from 'react'
import { Globe, Plus, RefreshCw, Trash2, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { websitesApi, type Website } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

const STATUS_MAP = {
  online: { label: 'Online', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  slow: { label: 'Lento', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  offline: { label: 'Offline', classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  unknown: { label: 'Desconocido', classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

export default function VitalsPage() {
  const { user } = useAuth()
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', domain: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null)

  const load = () => {
    setLoading(true)
    websitesApi.getAll()
      .then((r) => setWebsites(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCheckAll = async () => {
    setChecking(true)
    try {
      await websitesApi.checkAll()
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await websitesApi.create({ name: form.name, domain: form.domain })
      setWebsites((prev) => [...prev, res.data])
      setAddOpen(false)
      setForm({ name: '', domain: '' })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await websitesApi.remove(deleteTarget.id).catch(console.error)
    setWebsites((prev) => prev.filter((w) => w.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const onlineCount = websites.filter((w) => w.statuses?.[0]?.frontendStatus === 'online').length
  const checkedAt = websites[0]?.statuses?.[0]?.checkedAt

  const getStatusBadge = (status: string | undefined) => {
    const key = (status ?? 'unknown') as keyof typeof STATUS_MAP
    const info = STATUS_MAP[key] ?? STATUS_MAP.unknown
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', info.classes)}>
        {info.label}
      </span>
    )
  }

  return (
    <DashboardLayout title="Web Vitals">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="size-6" /> Monitoreo Web
            </h1>
            <p className="text-muted-foreground text-sm">
              {onlineCount}/{websites.length} sitios online
              {checkedAt && <> · Último chequeo: {new Date(checkedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={checking} onClick={handleCheckAll}>
              <RefreshCw className={cn('size-4 mr-1', checking && 'animate-spin')} />
              {checking ? 'Chequeando...' : 'Chequear ahora'}
            </Button>
            {user?.role === 'admin' && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-4 mr-1" /> Agregar sitio
              </Button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(['online', 'slow', 'offline', 'unknown'] as const).map((s) => {
            const count = websites.filter((w) => (w.statuses?.[0]?.frontendStatus ?? 'unknown') === s).length
            const info = STATUS_MAP[s]
            return (
              <Card key={s}>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{info.label}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <span className="text-2xl font-bold">{count}</span>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Websites table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sitio</TableHead>
                  <TableHead>Dominio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tiempo resp.</TableHead>
                  {user?.role === 'admin' && <TableHead className="text-right">Acción</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                  ))
                  : websites.length === 0
                    ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No hay sitios configurados</TableCell></TableRow>
                    : websites.map((site) => {
                      const latest = site.statuses?.[0]
                      return (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">{site.name}</TableCell>
                          <TableCell>
                            <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                              {site.domain} <ExternalLink className="size-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground w-16">Frontend</span>
                                {getStatusBadge(latest?.frontendStatus)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground w-16">Backend</span>
                                {getStatusBadge(latest?.backendStatus)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {latest?.responseTime != null ? `${latest.responseTime} ms` : '—'}
                          </TableCell>
                          {user?.role === 'admin' && (
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(site)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add site dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agregar sitio web</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Panel de clientes" />
            </div>
            <div className="space-y-1.5">
              <Label>Dominio (sin https://)</Label>
              <Input required value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="app.tuempresa.com" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar sitio</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong>{deleteTarget?.name}</strong> del monitoreo?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
