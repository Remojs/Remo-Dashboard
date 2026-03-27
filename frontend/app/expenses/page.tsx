'use client'

import { useEffect, useState } from 'react'
import { Wallet, Plus, Trash2 } from 'lucide-react'
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
import { expensesApi, type Expense, type MonthlyExpenses } from '@/lib/api'
import { useTheme } from 'next-themes'

const MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const CATEGORIES = ['office', 'tools', 'marketing', 'salary', 'infrastructure', 'travel', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  office: 'Oficina', tools: 'Herramientas', marketing: 'Marketing',
  salary: 'Salario', infrastructure: 'Infraestructura', travel: 'Viáticos', other: 'Otro',
}

const EMPTY_FORM = { description: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0] }

export default function ExpensesPage() {
  const { theme } = useTheme()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [monthly, setMonthly] = useState<MonthlyExpenses | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const load = () => {
    setLoading(true)
    const params: Record<string, unknown> = { limit: 100 }
    if (categoryFilter !== 'all') params.category = categoryFilter
    Promise.all([
      expensesApi.getAll(params),
      expensesApi.getMonthly(),
    ])
      .then(([expRes, monthRes]) => {
        setExpenses(expRes.data)
        setMonthly(monthRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [categoryFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = monthly?.monthly?.map((m) => ({
    month: MONTH_ABBR[m.month - 1],
    gastos: m.total,
  })) ?? MONTH_ABBR.map((m) => ({ month: m, gastos: 0 }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await expensesApi.create({
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
      })
      setExpenses((prev) => [res.data, ...prev])
      setFormOpen(false)
      setForm(EMPTY_FORM)
      expensesApi.getMonthly().then((r) => setMonthly(r.data)).catch(console.error)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await expensesApi.remove(deleteTarget.id).catch(console.error)
    setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
    expensesApi.getMonthly().then((r) => setMonthly(r.data)).catch(console.error)
  }

  const totalYear = monthly?.total ?? 0

  return (
    <DashboardLayout title="Gastos">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wallet className="size-6" /> Gestión de Gastos
            </h1>
            <p className="text-muted-foreground text-sm">
              Total del año: <strong>${totalYear.toLocaleString('es-AR')}</strong>
            </p>
          </div>
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setFormOpen(true) }}>
            <Plus className="size-4 mr-1" /> Nuevo gasto
          </Button>
        </div>

        {/* Monthly chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Gastos mensuales</CardTitle>
            <CardDescription>Año {monthly?.year ?? new Date().getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const chartColor = theme === 'violet' ? '#a855f7' : theme === 'dark' ? '#8b5cf6' : '#7c3aed'
              return (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString('es-AR')}`, 'Gastos']} />
                <Area type="monotone" dataKey="gastos" stroke={chartColor} fill="url(#expGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
              )
            })()}
          </CardContent>
        </Card>

        {/* Filter + table */}
        <div className="space-y-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
            </SelectContent>
          </Select>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
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
                    : expenses.length === 0
                      ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No hay gastos registrados</TableCell></TableRow>
                      : expenses.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-medium">{exp.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{CATEGORY_LABELS[exp.category] ?? exp.category}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(exp.date).toLocaleDateString('es-AR')}
                          </TableCell>
                          <TableCell className="text-right font-mono">${Number(exp.amount).toLocaleString('es-AR')}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(exp)}>
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
          <DialogHeader><DialogTitle>Nuevo gasto</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Suscripción Figma..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Monto (USD)</Label>
                <Input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="150" />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
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
          <DialogHeader><DialogTitle>Eliminar gasto</DialogTitle></DialogHeader>
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
