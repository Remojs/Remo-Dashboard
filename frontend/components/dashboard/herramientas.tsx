'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Wrench, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toolsApi, type ToolItem } from '@/lib/api'

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

const EMPTY_FORM = {
  name: '',
  description: '',
  url: '',
  color: 'violet',
  emoji: '🧰',
}

export function Herramientas() {
  const { theme } = useTheme()
  const [tools, setTools] = useState<ToolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    toolsApi
      .getAll({ limit: 100 })
      .then((response) => setTools(response.data))
      .catch((error: unknown) => {
        alert(error instanceof Error ? error.message : 'No se pudieron cargar las herramientas.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await toolsApi.create(form)
      setTools((prev) => [response.data, ...prev])
      setForm(EMPTY_FORM)
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'No se pudo guardar la herramienta.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await toolsApi.remove(id)
      setTools((prev) => prev.filter((tool) => tool.id !== id))
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'No se pudo borrar la herramienta.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className={cn('size-5', theme === 'violet' ? 'text-primary' : 'text-foreground')} />
        <h2 className="text-lg font-semibold tracking-tight">Herramientas</h2>
        <span className="text-sm text-muted-foreground">— Accesos rápidos del equipo</span>
      </div>

      <Card className={cn(theme === 'violet' && 'glass-card border-primary/20')}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Agregar herramienta</CardTitle>
          <CardDescription>Se guarda en backend automáticamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="tool-name">Nombre</Label>
              <Input
                id="tool-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Canva"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tool-url">URL</Label>
              <Input
                id="tool-url"
                required
                value={form.url}
                onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tool-color">Color</Label>
              <Input
                id="tool-color"
                required
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                placeholder="violet"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tool-emoji">Emoji</Label>
              <Input
                id="tool-emoji"
                required
                value={form.emoji}
                onChange={(event) => setForm((prev) => ({ ...prev, emoji: event.target.value }))}
                placeholder="🧰"
              />
            </div>
            <div className="space-y-1.5 xl:col-span-1">
              <Label htmlFor="tool-description">Descripción</Label>
              <Input
                id="tool-description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Uso interno"
              />
            </div>

            <div className="md:col-span-2 xl:col-span-5">
              <Button type="submit" disabled={saving}>
                <Plus className="mr-1 size-4" />
                {saving ? 'Guardando...' : 'Agregar herramienta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-base">Cargando herramientas...</CardTitle>
            </CardHeader>
          </Card>
        ) : tools.length === 0 ? (
          <Card
            className={cn(
              'col-span-full',
              theme === 'violet' ? 'glass-card border-primary/20' : 'border-dashed'
            )}
          >
            <CardHeader>
              <CardTitle className="text-base">Sin herramientas cargadas</CardTitle>
              <CardDescription>
                Agregá la primera herramienta desde el formulario de arriba.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          tools.map((tool) => (
            <Card
              key={tool.id}
              className={cn(
                'h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                theme === 'violet'
                  ? 'glass-card border-primary/20 hover:border-primary/40'
                  : 'hover:border-border/80'
              )}
            >
              <CardContent className="flex h-full flex-col items-center gap-2 p-4 text-center">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl text-xl transition-colors duration-200',
                    colorBg[tool.color] ?? 'bg-primary/10'
                  )}
                >
                  {tool.emoji}
                </div>
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      colorText[tool.color] ?? 'text-foreground'
                    )}
                  >
                    {tool.name}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">{tool.description}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3" />
                    Abrir
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(tool.id)}
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
