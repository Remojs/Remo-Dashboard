'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Plus, Eye, EyeOff, Trash2, Copy, Check } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { passwordsApi, type PasswordRecord } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

export default function PasswordsPage() {
  const { theme } = useTheme()
  const [records, setRecords] = useState<PasswordRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ service: '', username: '', password: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    passwordsApi.getAll({ limit: 100 })
      .then((r) => setRecords(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleReveal = async (id: string) => {
    if (revealed[id]) {
      setRevealed((prev) => { const n = { ...prev }; delete n[id]; return n })
      return
    }
    const res = await passwordsApi.decrypt(id)
    setRevealed((prev) => ({ ...prev, [id]: res.data.password! }))
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await passwordsApi.create({
        service: form.service,
        username: form.username,
        password: form.password,
        notes: form.notes || undefined,
      })
      setRecords((prev) => [res.data, ...prev])
      setCreateOpen(false)
      setForm({ service: '', username: '', password: '', notes: '' })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await passwordsApi.remove(id).catch(console.error)
    setRecords((prev) => prev.filter((r) => r.id !== id))
    setDeleteId(null)
  }

  return (
    <DashboardLayout title="Passwords">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <KeyRound className="size-6" /> Gestor de Contraseñas
            </h1>
            <p className="text-muted-foreground text-sm">{records.length} entradas guardadas</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-1" /> Nueva
          </Button>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border overflow-hidden">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mx-0 rounded-none" />)
            : records.length === 0
              ? <p className="text-muted-foreground text-sm text-center py-12">No hay contraseñas guardadas.</p>
              : records.map((record) => (
                <div key={record.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                  {/* Icon */}
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="size-3.5" />
                  </div>
                  {/* Service + user */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{record.service}</p>
                    <p className="text-xs text-muted-foreground truncate">{record.username}</p>
                    {record.notes && (
                      <p className="text-xs text-muted-foreground/70 truncate italic">{record.notes}</p>
                    )}
                  </div>
                  {/* Password field */}
                  <div className="flex items-center gap-1 shrink-0">
                    <code className={cn('text-xs font-mono bg-muted text-foreground rounded px-2 py-1 w-28 text-center truncate', theme === 'violet' && 'bg-primary/10')}>
                      {revealed[record.id] ? revealed[record.id] : '••••••••••'}
                    </code>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => handleReveal(record.id)}>
                      {revealed[record.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </Button>
                    {revealed[record.id] && (
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => handleCopy(revealed[record.id], record.id)}>
                        {copied === record.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    )}
                  </div>
                  {/* Delete */}
                  <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive shrink-0" onClick={() => setDeleteId(record.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
          }
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Contraseña</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Servicio</Label>
              <Input required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="GitHub, AWS, Gmail..." />
            </div>
            <div className="space-y-1.5">
              <Label>Usuario / Email</Label>
              <Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="usuario@ejemplo.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña</Label>
              <Input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label>Notas (opcional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notas adicionales..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar contraseña</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
