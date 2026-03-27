'use client'

import { useState, useEffect } from 'react'
import { Mail, Plus, Pencil, Trash2, Eye, EyeOff, Copy, Check, ChevronDown, ChevronUp, ExternalLink, Server, KeyRound, Globe } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

const STORAGE_KEY = 'mail-configs'

export interface MailConfig {
  id: string
  label: string
  // Credenciales
  usuario: string
  password: string
  // Entrante
  imapServer: string
  imapPort: string
  pop3Port: string
  imapSsl: boolean
  // Saliente
  smtpServer: string
  smtpSsl: boolean
  smtpPort: string
  // DNS
  registroA: string
  registroMX: string
  registroTXT: string
  registroDMARC: string
}

const EMPTY_FORM: Omit<MailConfig, 'id'> = {
  label: '',
  usuario: '',
  password: '',
  imapServer: '',
  imapPort: '993',
  pop3Port: '995',
  imapSsl: true,
  smtpServer: '',
  smtpSsl: true,
  smtpPort: '465',
  registroA: '',
  registroMX: '',
  registroTXT: '',
  registroDMARC: '',
}

function loadConfigs(): MailConfig[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveConfigs(configs: MailConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  )
}

function Field({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const { theme } = useTheme()
  if (!value) return null
  const display = secret && !revealed ? '••••••••••' : value
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/50 px-3 py-2">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <code className={cn('text-xs font-mono flex-1 truncate', theme === 'violet' && 'text-primary')}>{display}</code>
      <div className="flex items-center gap-0.5 shrink-0">
        {secret && (
          <Button variant="ghost" size="icon" className="size-6" onClick={() => setRevealed((v) => !v)}>
            {revealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          </Button>
        )}
        {(!secret || revealed) && <CopyBtn text={value} />}
      </div>
    </div>
  )
}

function MailCard({ config, onEdit, onDelete }: { config: MailConfig; onEdit: () => void; onDelete: () => void }) {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <Card className={cn(theme === 'violet' && 'glass-card border-primary/20')}>
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-3.5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-semibold truncate">{config.label}</CardTitle>
                <CardDescription className="text-xs truncate">{config.usuario}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="size-7" onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <Pencil className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                <Trash2 className="size-3.5" />
              </Button>
              {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="px-4 pb-4 space-y-4">
          {/* Credenciales */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Credenciales</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utiliza estos datos para configurar tu cliente de correo preferido.{' '}
              <a
                href="https://soporte.donweb.com/hc/es/categories/18334267932052"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                Tutorial de configuración <ExternalLink className="size-3" />
              </a>
            </p>
            <div className="space-y-1">
              <Field label="Usuario" value={config.usuario} />
              <Field label="Contraseña" value={config.password} secret />
            </div>
          </div>

          {/* Correo entrante */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Server className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Correo entrante</span>
            </div>
            <div className="space-y-1">
              <Field label="Servidor" value={config.imapServer} />
              <Field label="IMAP port" value={config.imapPort} />
              <Field label="POP3 port" value={config.pop3Port} />
              <Field label="SSL" value={config.imapSsl ? 'Sí' : 'No'} />
            </div>
          </div>

          {/* Correo saliente */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Server className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Correo saliente</span>
            </div>
            <div className="space-y-1">
              <Field label="Servidor" value={config.smtpServer} />
              <Field label="SSL" value={config.smtpSsl ? 'Sí' : 'No'} />
              <Field label="SMTP port" value={config.smtpPort} />
            </div>
          </div>

          {/* DNS */}
          {(config.registroA || config.registroMX || config.registroTXT || config.registroDMARC) && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Globe className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Configuración avanzada (DNS)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utiliza estos registros DNS en tu proveedor externo para configurar tu correo, autenticar tu dominio y mejorar la seguridad y entrega de mensajes.
              </p>
              <div className="space-y-1">
                <Field label="Registro A" value={config.registroA} />
                <Field label="Registro MX" value={config.registroMX} />
                <Field label="Registro TXT" value={config.registroTXT} />
                <Field label="Registro DMARC" value={config.registroDMARC} />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function MailPage() {
  const [configs, setConfigs] = useState<MailConfig[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MailConfig | null>(null)
  const [form, setForm] = useState<Omit<MailConfig, 'id'>>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<MailConfig | null>(null)

  useEffect(() => {
    setConfigs(loadConfigs())
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (config: MailConfig) => {
    setEditing(config)
    setForm({ ...config })
    setFormOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    let updated: MailConfig[]
    if (editing) {
      updated = configs.map((c) => c.id === editing.id ? { ...form, id: editing.id } : c)
    } else {
      updated = [...configs, { ...form, id: crypto.randomUUID() }]
    }
    saveConfigs(updated)
    setConfigs(updated)
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const updated = configs.filter((c) => c.id !== deleteTarget.id)
    saveConfigs(updated)
    setConfigs(updated)
    setDeleteTarget(null)
  }

  const f = (field: keyof Omit<MailConfig, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <DashboardLayout title="Mail">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="size-6" /> Configuración de correo
            </h1>
            <p className="text-muted-foreground text-sm">{configs.length} configuración{configs.length !== 1 ? 'es' : ''} guardada{configs.length !== 1 ? 's' : ''}</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 mr-1" /> Nueva config
          </Button>
        </div>

        {configs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No hay configuraciones guardadas. Hacé clic en <strong>Nueva config</strong> para agregar una.
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map((c) => (
              <MailCard key={c.id} config={c} onEdit={() => openEdit(c)} onDelete={() => setDeleteTarget(c)} />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar configuración' : 'Nueva configuración de correo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Etiqueta / nombre</Label>
              <Input required value={form.label} onChange={f('label')} placeholder="ej: Correo empresa, Info DonWeb..." />
            </div>

            {/* Credenciales */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="size-3.5" /> Credenciales
              </p>
              <div className="space-y-1.5">
                <Label>Usuario</Label>
                <Input value={form.usuario} onChange={f('usuario')} placeholder="usuario@dominio.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Contraseña</Label>
                <Input type="password" value={form.password} onChange={f('password')} placeholder="••••••••" />
              </div>
            </div>

            {/* Entrante */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Server className="size-3.5" /> Correo entrante
              </p>
              <div className="space-y-1.5">
                <Label>Servidor</Label>
                <Input value={form.imapServer} onChange={f('imapServer')} placeholder="mail.tudominio.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>IMAP port</Label>
                  <Input value={form.imapPort} onChange={f('imapPort')} placeholder="993" />
                </div>
                <div className="space-y-1.5">
                  <Label>POP3 port</Label>
                  <Input value={form.pop3Port} onChange={f('pop3Port')} placeholder="995" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="imapSsl"
                  checked={form.imapSsl}
                  onChange={(e) => setForm((p) => ({ ...p, imapSsl: e.target.checked }))}
                  className="size-4 accent-primary"
                />
                <Label htmlFor="imapSsl" className="cursor-pointer">SSL activado</Label>
              </div>
            </div>

            {/* Saliente */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Server className="size-3.5" /> Correo saliente
              </p>
              <div className="space-y-1.5">
                <Label>Servidor</Label>
                <Input value={form.smtpServer} onChange={f('smtpServer')} placeholder="mail.tudominio.com" />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP port</Label>
                <Input value={form.smtpPort} onChange={f('smtpPort')} placeholder="465" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smtpSsl"
                  checked={form.smtpSsl}
                  onChange={(e) => setForm((p) => ({ ...p, smtpSsl: e.target.checked }))}
                  className="size-4 accent-primary"
                />
                <Label htmlFor="smtpSsl" className="cursor-pointer">SSL activado</Label>
              </div>
            </div>

            {/* DNS */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Globe className="size-3.5" /> Configuración avanzada (DNS)
              </p>
              <p className="text-xs text-muted-foreground">Opcional — registros para proveedor externo.</p>
              <div className="space-y-1.5">
                <Label>Registro A</Label>
                <Input value={form.registroA} onChange={f('registroA')} placeholder="190.0.0.1" />
              </div>
              <div className="space-y-1.5">
                <Label>Registro MX</Label>
                <Input value={form.registroMX} onChange={f('registroMX')} placeholder="mail.tudominio.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Registro TXT (SPF)</Label>
                <Input value={form.registroTXT} onChange={f('registroTXT')} placeholder="v=spf1 include:..." />
              </div>
              <div className="space-y-1.5">
                <Label>Registro DMARC</Label>
                <Input value={form.registroDMARC} onChange={f('registroDMARC')} placeholder="v=DMARC1; p=none; ..." />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? 'Guardar cambios' : 'Guardar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar configuración</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong>{deleteTarget?.label}</strong>? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
