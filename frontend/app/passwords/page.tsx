'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Plus, Eye, EyeOff, Trash2, Copy, Check, FolderPlus, Folder, FolderOpen, Pencil, X, Lock, Unlock, ShieldCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { passwordsApi, passwordGroupsApi, type PasswordRecord, type PasswordGroup } from '@/lib/api'
import { cn } from '@/lib/utils'

const EMPTY_FORM = { service: '', username: '', password: '', notes: '', groupId: '' }

const VAULT_HASH_KEY = 'remo_vault_hash'

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key + '||remo-vault-v1')
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function PasswordsPage() {
  const [records, setRecords] = useState<PasswordRecord[]>([])
  const [groups, setGroups] = useState<PasswordGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null) // null = all
  const [createOpen, setCreateOpen] = useState(false)
  const [groupFormOpen, setGroupFormOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<PasswordGroup | null>(null)
  const [groupName, setGroupName] = useState('')
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [vaultUnlocked, setVaultUnlocked] = useState(false)
  const [unlockOpen, setUnlockOpen] = useState(false)
  const [unlockInput, setUnlockInput] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null)
  const isFirstSetup = typeof window !== 'undefined' && !localStorage.getItem(VAULT_HASH_KEY)

  const load = async () => {
    setLoading(true)
    try {
      const [recs, grps] = await Promise.all([
        passwordsApi.getAll({ limit: 200 }),
        passwordGroupsApi.getAll(),
      ])
      setRecords(recs.data)
      setGroups(grps.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visibleRecords = selectedGroup === null
    ? records
    : selectedGroup === '__ungrouped__'
      ? records.filter((r) => !r.groupId)
      : records.filter((r) => r.groupId === selectedGroup)

  const doReveal = async (id: string) => {
    const res = await passwordsApi.decrypt(id)
    setRevealed((prev) => ({ ...prev, [id]: res.data.password! }))
  }

  const handleReveal = async (id: string) => {
    if (revealed[id]) {
      setRevealed((prev) => { const n = { ...prev }; delete n[id]; return n })
      return
    }
    if (!vaultUnlocked) {
      setPendingRevealId(id)
      setUnlockOpen(true)
      return
    }
    await doReveal(id)
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlockInput.trim()) return
    setUnlocking(true)
    setUnlockError('')
    try {
      const hash = await hashKey(unlockInput)
      const stored = localStorage.getItem(VAULT_HASH_KEY)
      if (!stored) {
        localStorage.setItem(VAULT_HASH_KEY, hash)
      } else if (hash !== stored) {
        setUnlockError('Clave incorrecta. Intentá de nuevo.')
        setUnlocking(false)
        return
      }
      setVaultUnlocked(true)
      setUnlockOpen(false)
      setUnlockInput('')
      if (pendingRevealId) {
        await doReveal(pendingRevealId)
        setPendingRevealId(null)
      }
    } catch {
      setUnlockError('Error al verificar la clave.')
    } finally {
      setUnlocking(false)
    }
  }

  const handleLock = () => {
    setVaultUnlocked(false)
    setRevealed({})
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
        groupId: form.groupId || undefined,
      })
      setRecords((prev) => [res.data, ...prev])
      setCreateOpen(false)
      setForm(EMPTY_FORM)
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

  const openGroupForm = (group?: PasswordGroup) => {
    setEditGroup(group ?? null)
    setGroupName(group?.name ?? '')
    setGroupFormOpen(true)
  }

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingGroup(true)
    try {
      if (editGroup) {
        const res = await passwordGroupsApi.update(editGroup.id, { name: groupName })
        setGroups((prev) => prev.map((g) => g.id === editGroup.id ? res.data : g))
      } else {
        const res = await passwordGroupsApi.create({ name: groupName })
        setGroups((prev) => [...prev, res.data])
      }
      setGroupFormOpen(false)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSavingGroup(false)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    await passwordGroupsApi.remove(id).catch(console.error)
    setGroups((prev) => prev.filter((g) => g.id !== id))
    if (selectedGroup === id) setSelectedGroup(null)
    // Passwords in that group become ungrouped
    setRecords((prev) => prev.map((r) => r.groupId === id ? { ...r, groupId: null } : r))
    setDeleteGroupId(null)
  }

  const groupName_ = (id: string | null) => {
    if (!id) return null
    return groups.find((g) => g.id === id)?.name ?? null
  }

  return (
    <DashboardLayout title="Passwords">
      <div className="flex gap-4 h-[calc(100vh-8rem)]">

        {/* Sidebar — groups */}
        <aside className="w-52 shrink-0 flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grupos</span>
            <Button variant="ghost" size="icon" className="size-6" onClick={() => openGroupForm()}>
              <FolderPlus className="size-3.5" />
            </Button>
          </div>

          {/* All */}
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm w-full text-left transition-colors',
              selectedGroup === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30 text-muted-foreground',
            )}
          >
            <KeyRound className="size-3.5 shrink-0" />
            <span className="flex-1 truncate">Todas</span>
            <Badge variant="secondary" className="text-xs ml-auto">{records.length}</Badge>
          </button>

          {/* Ungrouped */}
          {records.some((r) => !r.groupId) && (
            <button
              onClick={() => setSelectedGroup('__ungrouped__')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm w-full text-left transition-colors',
                selectedGroup === '__ungrouped__' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30 text-muted-foreground',
              )}
            >
              <Folder className="size-3.5 shrink-0" />
              <span className="flex-1 truncate">Sin grupo</span>
              <Badge variant="secondary" className="text-xs ml-auto">{records.filter((r) => !r.groupId).length}</Badge>
            </button>
          )}

          {/* Group list */}
          {groups.map((group) => {
            const count = records.filter((r) => r.groupId === group.id).length
            const active = selectedGroup === group.id
            return (
              <div key={group.id} className="group/item relative flex items-center">
                <button
                  onClick={() => setSelectedGroup(group.id)}
                  className={cn(
                    'flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30 text-muted-foreground',
                  )}
                >
                  {active ? <FolderOpen className="size-3.5 shrink-0" /> : <Folder className="size-3.5 shrink-0" />}
                  <span className="flex-1 truncate">{group.name}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">{count}</Badge>
                </button>
                <div className="absolute right-1 hidden group-hover/item:flex gap-0.5">
                  <Button variant="ghost" size="icon" className="size-5" onClick={() => openGroupForm(group)}>
                    <Pencil className="size-2.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-5 text-destructive hover:text-destructive" onClick={() => setDeleteGroupId(group.id)}>
                    <X className="size-2.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <KeyRound className="size-6 text-primary" />
                Gestor de Contraseñas
              </h1>
              <p className="text-muted-foreground text-sm">
                {visibleRecords.length} entrada{visibleRecords.length !== 1 ? 's' : ''}
                {selectedGroup && selectedGroup !== '__ungrouped__' && ` · ${groupName_(selectedGroup)}`}
                {selectedGroup === '__ungrouped__' && ' · Sin grupo'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {vaultUnlocked ? (
                <Button variant="outline" size="sm" onClick={handleLock} className="text-emerald-500 border-emerald-500/30 hover:text-emerald-400">
                  <ShieldCheck className="size-4 mr-1" /> Bóveda abierta
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setUnlockOpen(true)}>
                  <Lock className="size-4 mr-1" /> Desbloquear
                </Button>
              )}
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4 mr-1" /> Nueva
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-border divide-y divide-border">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mx-0 rounded-none" />)
              : visibleRecords.length === 0
                ? (
                  <p className="text-muted-foreground text-sm text-center py-12">
                    {selectedGroup ? 'No hay contraseñas en este grupo.' : 'No hay contraseñas guardadas.'}
                  </p>
                )
                : visibleRecords.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <KeyRound className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{record.service}</p>
                        {record.groupId && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary shrink-0">
                            {groupName_(record.groupId)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{record.username}</p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground/70 truncate italic">{record.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <code className="text-xs font-mono bg-muted text-foreground rounded px-2 py-1 w-28 text-center truncate">
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
                    <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive shrink-0" onClick={() => setDeleteId(record.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Create password dialog */}
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
              <Label>Grupo (opcional)</Label>
              <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v === '__none__' ? '' : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin grupo</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Group create/edit dialog */}
      <Dialog open={groupFormOpen} onOpenChange={setGroupFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editGroup ? 'Editar grupo' : 'Nuevo grupo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGroup} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input required autoFocus value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ej. Trabajo, Personal, Servidores..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGroupFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={savingGroup}>{savingGroup ? 'Guardando...' : editGroup ? 'Actualizar' : 'Crear'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete password confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar contraseña</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vault unlock dialog */}
      <Dialog open={unlockOpen} onOpenChange={(o) => { if (!o) { setUnlockOpen(false); setUnlockInput(''); setUnlockError(''); setPendingRevealId(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              {isFirstSetup ? 'Configurar clave de bóveda' : 'Desbloquear bóveda'}
            </DialogTitle>
          </DialogHeader>
          {isFirstSetup && (
            <p className="text-sm text-muted-foreground">
              Primera vez: ingresá tu <code className="font-mono bg-muted px-1 rounded">ENCRYPTION_KEY</code> del servidor. Se guardará un hash local para verificaciones futuras.
            </p>
          )}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Clave de cifrado</Label>
              <Input
                type="password"
                autoFocus
                placeholder="Tu ENCRYPTION_KEY del servidor"
                value={unlockInput}
                onChange={(e) => { setUnlockInput(e.target.value); setUnlockError('') }}
              />
              {unlockError && <p className="text-xs text-destructive">{unlockError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setUnlockOpen(false); setUnlockInput(''); setUnlockError(''); setPendingRevealId(null) }}>Cancelar</Button>
              <Button type="submit" disabled={unlocking || !unlockInput.trim()}>
                <Unlock className="size-4 mr-1" />
                {unlocking ? 'Verificando...' : isFirstSetup ? 'Guardar y abrir' : 'Desbloquear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete group confirm */}
      <Dialog open={!!deleteGroupId} onOpenChange={(o) => { if (!o) setDeleteGroupId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar grupo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Las contraseñas del grupo quedarán sin grupo. ¿Continuar?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteGroupId && handleDeleteGroup(deleteGroupId)}>Eliminar grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

