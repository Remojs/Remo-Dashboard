'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Plus, Trash2, Pencil, ChevronDown, ChevronUp, DollarSign } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { debtsApi, type Debt } from '@/lib/api'
import { cn } from '@/lib/utils'

const RATE_KEY = 'debt-usd-rate'

function fmtARS(usd: number, rate: number) {
  return (usd * rate).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function fmtUSD(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

function paidOf(debt: Debt) {
  return debt.payments.reduce((s, p) => s + p.amount, 0)
}

function pct(debt: Debt) {
  const paid = paidOf(debt)
  if (debt.totalAmount <= 0) return 0
  return Math.min(100, Math.round((paid / debt.totalAmount) * 100))
}

export default function DebtPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  // USD/ARS exchange rate
  const [usdRate, setUsdRate] = useState<number>(() => {
    if (typeof window === 'undefined') return 1200
    const saved = localStorage.getItem(RATE_KEY)
    return saved ? parseFloat(saved) : 1200
  })
  const [rateInput, setRateInput] = useState<string>(String(
    typeof window !== 'undefined' ? (localStorage.getItem(RATE_KEY) ?? '1200') : '1200'
  ))

  useEffect(() => {
    localStorage.setItem(RATE_KEY, String(usdRate))
  }, [usdRate])

  const handleRateChange = (val: string) => {
    setRateInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed) && parsed > 0) setUsdRate(parsed)
  }

  // Add debt dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', totalAmount: '' })
  const [addSaving, setAddSaving] = useState(false)

  // Edit debt dialog
  const [editTarget, setEditTarget] = useState<Debt | null>(null)
  const [editForm, setEditForm] = useState({ name: '', totalAmount: '' })
  const [editSaving, setEditSaving] = useState(false)

  // Delete debt
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null)

  // Add payment dialog
  const [payDebt, setPayDebt] = useState<Debt | null>(null)
  const [payForm, setPayForm] = useState({ amount: '', note: '' })
  const [paySaving, setPaySaving] = useState(false)

  const load = () => {
    setLoading(true)
    debtsApi.getAll()
      .then((r) => setDebts(r.data as Debt[]))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddSaving(true)
    try {
      const res = await debtsApi.create({ name: addForm.name, totalAmount: parseFloat(addForm.totalAmount) })
      setDebts((prev) => [res.data, ...prev])
      setAddOpen(false)
      setAddForm({ name: '', totalAmount: '' })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setAddSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditSaving(true)
    try {
      const res = await debtsApi.update(editTarget.id, {
        name: editForm.name,
        totalAmount: parseFloat(editForm.totalAmount),
      })
      setDebts((prev) => prev.map((d) => d.id === editTarget.id ? { ...res.data, payments: d.payments } : d))
      setEditTarget(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async () => {
    await debtsApi.remove(deleteTarget.id).catch(console.error)
    setDebts((prev) => prev.filter((d) => d.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaySaving(true)
    try {
      const res = await debtsApi.addPayment(payDebt.id, {
        amount: parseFloat(payForm.amount),
        note: payForm.note || undefined,
      })
      setDebts((prev) => prev.map((d) =>
        d.id === payDebt.id ? { ...d, payments: [res.data, ...d.payments] } : d
      ))
      setPayForm({ amount: '', note: '' })
      setPayDebt(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setPaySaving(false)
    }
  }

  const handleDeletePayment = async (debt: Debt, paymentId: string) => {
    await debtsApi.deletePayment(debt.id, paymentId).catch(console.error)
    setDebts((prev) => prev.map((d) =>
      d.id === debt.id ? { ...d, payments: d.payments.filter((p) => p.id !== paymentId) } : d
    ))
  }

  const totalDebt = debts.reduce((s, d) => s + d.totalAmount, 0)
  const totalPaid = debts.reduce((s, d) => s + paidOf(d), 0)
  const globalPct = totalDebt > 0 ? Math.round((totalPaid / totalDebt) * 100) : 0

  return (
    <DashboardLayout title="Tracker Deuda">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="size-6" /> Tracker de Deuda
            </h1>
            <p className="text-muted-foreground text-sm">
              {debts.length} deuda{debts.length !== 1 ? 's' : ''} · {fmtUSD(totalPaid)} pagado de {fmtUSD(totalDebt)}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4 mr-1" /> Nueva deuda
          </Button>
        </div>

        {/* Exchange rate */}
        <Card>
          <CardContent className="flex items-center gap-4 py-3">
            <DollarSign className="size-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <Label className="text-sm shrink-0 text-muted-foreground">Tipo de cambio USD →</Label>
              <Input
                type="number"
                min="1"
                step="1"
                className="w-32 h-8 text-sm"
                value={rateInput}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="1200"
              />
              <span className="text-sm text-muted-foreground">ARS/USD</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Total deuda: <strong className="text-foreground">{fmtARS(totalDebt, usdRate)}</strong>
            </span>
          </CardContent>
        </Card>

        {/* Global progress */}
        {debts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progreso total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{globalPct}%</span>
                <span className="text-sm text-muted-foreground">{fmtARS(totalDebt - totalPaid, usdRate)} restante</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: globalPct + '%' }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debt cards */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : debts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <CreditCard className="size-10 opacity-30" />
              <p>No hay deudas registradas</p>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>Agregar primera deuda</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => {
              const paid = paidOf(debt)
              const remaining = debt.totalAmount - paid
              const p = pct(debt)
              const isExpanded = expanded === debt.id
              return (
                <Card key={debt.id} className={cn('transition-all', isExpanded && 'border-primary/30')}>
                  <CardContent className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{debt.name}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">{p}%</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Total: <strong className="text-foreground">{fmtUSD(debt.totalAmount)}</strong> <span className="text-xs">({fmtARS(debt.totalAmount, usdRate)})</span></span>
                          <span>Pagado: <strong className="text-emerald-400">{fmtARS(paid, usdRate)}</strong></span>
                          <span>Restante: <strong className="text-primary">{fmtARS(remaining, usdRate)}</strong></span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: p + '%' }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setPayDebt(debt)}>
                          Registrar pago
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => {
                          setEditTarget(debt)
                          setEditForm({ name: debt.name, totalAmount: String(debt.totalAmount) })
                        }}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(debt)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setExpanded(isExpanded ? null : debt.id)}>
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Payment history */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Historial de pagos ({debt.payments.length})
                        </p>
                        {debt.payments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
                        ) : (
                          <div className="space-y-1.5">
                            {debt.payments.map((payment) => (
                              <div key={payment.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                                <div>
                                  <span className="text-sm font-medium text-emerald-400">{fmtARS(payment.amount, usdRate)}</span>
                                  <span className="text-xs text-muted-foreground ml-1">({fmtUSD(payment.amount)})</span>
                                  {payment.note && <span className="text-xs text-muted-foreground ml-2">{payment.note}</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(payment.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                  <Button
                                    variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive"
                                    onClick={() => handleDeletePayment(debt, payment.id)}
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add debt dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva deuda</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre / descripción</Label>
              <Input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Ej: Cuotas celular" />
            </div>
            <div className="space-y-1.5">
              <Label>Monto total (USD)</Label>
              <Input required type="number" min="0" step="0.01" value={addForm.totalAmount} onChange={(e) => setAddForm({ ...addForm, totalAmount: e.target.value })} placeholder="0.00" />
              {addForm.totalAmount && !isNaN(parseFloat(addForm.totalAmount)) && (
                <p className="text-xs text-muted-foreground">≈ {fmtARS(parseFloat(addForm.totalAmount), usdRate)}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={addSaving}>{addSaving ? 'Guardando...' : 'Crear deuda'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit debt dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar deuda</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Monto total (USD)</Label>
              <Input required type="number" min="0" step="0.01" value={editForm.totalAmount} onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })} />
              {editForm.totalAmount && !isNaN(parseFloat(editForm.totalAmount)) && (
                <p className="text-xs text-muted-foreground">≈ {fmtARS(parseFloat(editForm.totalAmount), usdRate)}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
              <Button type="submit" disabled={editSaving}>{editSaving ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete debt dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar deuda</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Eliminar <strong>{deleteTarget?.name}</strong> y todos sus pagos?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add payment dialog */}
      <Dialog open={!!payDebt} onOpenChange={() => setPayDebt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar pago — {payDebt?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Monto pagado (USD)</Label>
              <Input required type="number" min="0.01" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0.00" />
              {payForm.amount && !isNaN(parseFloat(payForm.amount)) && (
                <p className="text-xs text-muted-foreground">≈ {fmtARS(parseFloat(payForm.amount), usdRate)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Nota (opcional)</Label>
              <Input value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} placeholder="Ej: Cuota junio" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayDebt(null)}>Cancelar</Button>
              <Button type="submit" disabled={paySaving}>{paySaving ? 'Guardando...' : 'Registrar pago'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
