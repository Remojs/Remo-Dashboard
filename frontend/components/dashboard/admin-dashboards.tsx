'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { LayoutDashboard, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { adminDashboardsApi, type AdminDashboardItem } from '@/lib/api'

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

const colorBorder: Record<string, string> = {
  violet: 'hover:border-violet-500/40',
  sky: 'hover:border-sky-500/40',
  emerald: 'hover:border-emerald-500/40',
  amber: 'hover:border-amber-500/40',
  rose: 'hover:border-rose-500/40',
  orange: 'hover:border-orange-500/40',
  teal: 'hover:border-teal-500/40',
  indigo: 'hover:border-indigo-500/40',
}

const EMPTY_FORM = {
  name: '',
  description: '',
  url: '',
  color: 'sky',
  emoji: '📊',
}

export function AdminDashboards() {
  const { theme } = useTheme()
  const [dashboards, setDashboards] = useState<AdminDashboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    adminDashboardsApi
      .getAll({ limit: 100 })
      .then((response) => setDashboards(response.data))
      .catch((error: unknown) => {
        alert(error instanceof Error ? error.message : 'No se pudieron cargar los dashboards.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await adminDashboardsApi.create(form)
      setDashboards((prev) => [response.data, ...prev])
      setForm(EMPTY_FORM)
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'No se pudo guardar el dashboard.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await adminDashboardsApi.remove(id)
      setDashboards((prev) => prev.filter((dashboard) => dashboard.id !== id))
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'No se pudo borrar el dashboard.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutDashboard
          className={cn('size-5', theme === 'violet' ? 'text-primary' : 'text-foreground')}
        />
        <h2 className="text-lg font-semibold tracking-tight">Admin Dashboards</h2>
        <span className="text-sm text-muted-foreground">— Paneles de gestión</span>
      </div>

      <Card className={cn(theme === 'violet' && 'glass-card border-primary/20')}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Agregar dashboard</CardTitle>
          <CardDescription>Se guarda en backend automáticamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-name">Nombre</Label>
              <Input
                id="dashboard-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Meta Ads"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-url">URL</Label>
              <Input
                id="dashboard-url"
                required
                value={form.url}
                onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-color">Color</Label>
              <Input
                id="dashboard-color"
                required
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                placeholder="sky"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-emoji">Emoji</Label>
              <Input
                id="dashboard-emoji"
                required
                value={form.emoji}
                onChange={(event) => setForm((prev) => ({ ...prev, emoji: event.target.value }))}
                placeholder="📊"
              />
            </div>
            <div className="space-y-1.5 xl:col-span-1">
              <Label htmlFor="dashboard-description">Descripción</Label>
              <Input
                id="dashboard-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Panel de anuncios"
              />
            </div>

            <div className="md:col-span-2 xl:col-span-5">
              <Button type="submit" disabled={saving}>
                <Plus className="mr-1 size-4" />
                {saving ? 'Guardando...' : 'Agregar dashboard'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {loading ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-base">Cargando dashboards...</CardTitle>
            </CardHeader>
          </Card>
        ) : dashboards.length === 0 ? (
          <Card
            className={cn(
              'col-span-full',
              theme === 'violet' ? 'glass-card border-primary/20' : 'border-dashed'
            )}
          >
            <CardHeader>
              <CardTitle className="text-base">Sin dashboards cargados</CardTitle>
              <CardDescription>
                Agregá el primero desde el formulario de arriba.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          dashboards.map((dashboard) => (
            <Card
              key={dashboard.id}
              className={cn(
                'h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                theme === 'violet'
                  ? 'glass-card border-primary/20 hover:border-primary/40'
                  : cn('hover:border-border', colorBorder[dashboard.color])
              )}
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-colors duration-200',
                      colorBg[dashboard.color] ?? 'bg-primary/10'
                    )}
                  >
                    {dashboard.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-semibold text-sm truncate',
                        colorText[dashboard.color] ?? 'text-foreground'
                      )}
                    >
                      {dashboard.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {dashboard.description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <a
                    href={dashboard.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                    Abrir
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(dashboard.id)}
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:opacity-80"
                  >
                    <Trash2 className="size-3" />
                    Quitar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
