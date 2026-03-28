'use client'

import { useState } from 'react'
import { MapPin, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PROMOCIONES_OWNERS, PROMOCIONES_RUBROS, type PromocionOwnerColor } from '@/lib/dashboard-config'

const ownerDotColor: Record<PromocionOwnerColor, string> = {
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
}

const ownerTextColor: Record<PromocionOwnerColor, string> = {
  blue: 'text-sky-400',
  green: 'text-emerald-400',
  yellow: 'text-amber-400',
}

export function Promociones() {
  const [rubros, setRubros] = useState<string[]>(() => {
    if (typeof window === 'undefined') return PROMOCIONES_RUBROS
    try {
      const saved = localStorage.getItem('promociones-rubros')
      return saved ? JSON.parse(saved) : PROMOCIONES_RUBROS
    } catch {
      return PROMOCIONES_RUBROS
    }
  })
  const [newRubro, setNewRubro] = useState('')

  const handleAddRubro = () => {
    const value = newRubro.trim()
    if (!value) return
    const updated = [...rubros, value]
    setRubros(updated)
    localStorage.setItem('promociones-rubros', JSON.stringify(updated))
    setNewRubro('')
  }

  const handleRemoveRubro = (index: number) => {
    const updated = rubros.filter((_, i) => i !== index)
    setRubros(updated)
    localStorage.setItem('promociones-rubros', JSON.stringify(updated))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">Promociones</h2>
        <span className="text-sm text-muted-foreground">— Mapa, responsables y rubros</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mapa</CardTitle>
            <CardDescription>Referencia visual de zonas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-[55%] flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 h-40 text-sm text-muted-foreground">
              Sin mapa cargado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Responsables por color</CardTitle>
            <CardDescription>Santino azul, Thiago verde, Lucas amarillo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROMOCIONES_OWNERS.map((owner) => (
              <div
                key={owner.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('size-2.5 rounded-full', ownerDotColor[owner.color])} />
                  <span className={cn('font-medium', ownerTextColor[owner.color])}>{owner.nombre}</span>
                </div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{owner.color}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rubros</CardTitle>
          <CardDescription>
            Agregá o quitá rubros manualmente desde esta lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={newRubro}
              onChange={(event) => setNewRubro(event.target.value)}
              placeholder="Escribí un rubro..."
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleAddRubro()
                }
              }}
            />
            <Button type="button" onClick={handleAddRubro} className="sm:w-auto">
              <Plus className="mr-1 size-4" />
              Agregar
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rubros.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No hay rubros cargados todavía.
              </div>
            ) : (
              rubros.map((rubro, index) => (
                <div
                  key={`${rubro}-${index}`}
                  className="flex h-10 items-center justify-between rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <span className="truncate pr-2">{rubro}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRubro(index)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Quitar ${rubro}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
