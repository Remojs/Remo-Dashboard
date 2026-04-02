'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { incomeApi, type Income, type MonthlyIncomes } from '@/lib/api'
import { useTheme } from 'next-themes'

const MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const SOURCES = ['freelance', 'salary', 'investment', 'sale', 'other']
const SOURCE_LABELS: Record<string, string> = {
  freelance: 'Freelance',
  salary: 'Salario',
  investment: 'Inversión',
  sale: 'Venta',
  other: 'Otro',
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  source: 'other',
  date: new Date().toISOString().split('T')[0],
}

export default function IncomePage() {
  const { theme } = useTheme()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [monthly, setMonthly] = useState<MonthlyIncomes | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const load = () => {
    setLoading(true)
    const params: Record<string, unknown> = { limit: 100 }
    if (sourceFilter !== 'all') params.source = sourceFilter
    Promise.all([
      incomeApi.getAll(params as Record<string, string | number>),
      incomeApi.getMonthly(),
    ])
      .then(([incRes, monthRes]) => {
        setIncomes(incRes.data)
        setMonthly(monthRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [sourceFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = monthly?.monthly?.map((m) => ({
    month: MONTH_ABBR[m.month - 1],
    ingresos: m.total,
  })) ?? MONTH_ABBR.map((m) => ({ month: m, ingresos: 0 }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await incomeApi.create({
        description: form.description,
        amount: parseFloat(form.amount),
        source: form.source,
        date: form.date,
      })
      setIncomes((prev) => [res.data, ...prev])
      setFormOpen(false)
      setForm(EMPTY_FORM)
      incomeApi.getMonthly().then((r) => setMonthly(r.data)).catch(console.error)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await incomeApi.remove(deleteTarget.id).catch(console.error)
    setIncomes((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    setDeleteTarget(null)
    incomeApi.getMonthly().then((r) => setMonthly(r.data)).catch(console.error)
  }

  const totalYear = monthly?.grandTotal ?? 0

  return (
    <DashboardLayout title="Ingresos">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="size-6" /> Gestión de Ingresos
            </h1>
            <p className="text-muted-foreground text-sm">
              Total del año: <strong>${totalYear.toLocaleString('es-AR')}</strong>
            </p>
          </div>
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setFormOpen(true) }}>
            <Plus className="size-4 mr-1" /> Nuevo ingreso
          </Button>
        </div>

        {/* Monthly chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ingresos mensuales</CardTitle>
            <CardDescription>Año {monthly?.year ?? new Date().getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const chartColor = theme === 'violet' ? '#10b981' : '#10b981'
              return (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString('es-AR')}`, 'Ingresos']} />
                    <Area type="monotone" dataKey="ingresos" stroke={chartColor} fill="url(#incGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )
            })()}
          </CardContent>
        </Card>

        {/* Filter + table */}
        <div className="space-y-3">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Fuente" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              {SOURCES.map((s) => <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                    ))
                    : incomes.length === 0
                      ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No hay ingresos registrados</TableCell></TableRow>
                      : incomes.map((inc) => (
                        <TableRow key={inc.id}>
                          <TableCell className="font-medium">{inc.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              {SOURCE_LABELS[inc.source] ?? inc.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(inc.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-400">
                            ${Number(inc.amount).toLocaleString('es-AR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(inc)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo ingreso</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Proyecto web cliente X..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monto ($)</Label>
                <Input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Fuente</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar ingreso</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong>{deleteTarget?.description}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
