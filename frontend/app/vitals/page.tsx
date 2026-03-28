'use client'

import { useEffect, useState } from 'react'
import { Globe, Plus, RefreshCw, Trash2, Pencil } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { websitesApi, type Website } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS_MAP = {
  online: { label: 'Online', classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  slow: { label: 'Lento', classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  offline: { label: 'Offline', classes: 'bg-red-500/20 text-red-400 border-red-500/30' },
  unknown: { label: 'Desconocido', classes: 'bg-muted text-muted-foreground border-border' },
}

const EMPTY_FORM = { name: '', domain: '', type: 'frontend' as 'frontend' | 'backend' }

export default function VitalsPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null)
  const [editTarget, setEditTarget] = useState<Website | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

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
      const res = await websitesApi.create(form)
      setWebsites((prev) => [...prev, res.data])
      setAddOpen(false)
      setForm(EMPTY_FORM)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await websitesApi.remove(deleteTarget.id).catch(console.error)
    setWebsites((prev) => prev.filter((w) => w.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const openEdit = (site: Website) => {
    setEditTarget(site)
    setEditForm({ name: site.name, domain: site.domain, type: site.type })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await websitesApi.update(editTarget.id, editForm)
      setWebsites((prev) => prev.map((w) => w.id === editTarget.id ? { ...w, ...res.data } : w))
      setEditTarget(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const getStatus = (site: Website) => {
    const latest = site.statuses?.[0]
    const raw = site.type === 'backend' ? latest?.backendStatus : latest?.frontendStatus
    return (raw ?? 'unknown') as keyof typeof STATUS_MAP
  }

  const getStatusBadge = (site: Website) => {
    const key = getStatus(site)
    const info = STATUS_MAP[key]
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', info.classes)}>
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
              {websites.length} sitio{websites.length !== 1 ? 's' : ''} configurado{websites.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={checking} onClick={handleCheckAll}>
              <RefreshCw className={cn('size-4 mr-1', checking && 'animate-spin')} />
              {checking ? 'Chequeando...' : 'Chequear ahora'}
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-1" /> Agregar sitio
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Página</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                  : websites.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                          No hay sitios configurados
                        </TableCell>
                      </TableRow>
                    )
                    : websites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{site.name}</p>
                            <p className="text-xs text-muted-foreground">{site.domain}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={site.type === 'backend' ? 'border-primary/50 text-primary' : 'border-border text-muted-foreground'}>
                            {site.type === 'backend' ? 'Backend' : 'Frontend'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(site)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(site)}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(site)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add dialog */}
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
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'frontend' | 'backend' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={npm install n8n -gdeleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar sitio</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong>{deleteTarget?.name}</strong> del monitoreo?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={npm install n8n -geditTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar sitio web</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Dominio (sin https://)</Label>
              <Input required value={editForm.domain} onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v as 'frontend' | 'backend' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
