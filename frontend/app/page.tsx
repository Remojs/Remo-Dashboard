'use client'

import { useEffect, useState } from 'react'
import { ListChecks, DollarSign, Activity, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { tasksApi, expensesApi, type Task, type MonthlyExpenses } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [monthly, setMonthly] = useState<MonthlyExpenses | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      tasksApi.getAll({ limit: 50 }),
      expensesApi.getMonthly(),
    ])
      .then(([t, e]) => {
        if (t.status === 'fulfilled') setTasks(t.value.data)
        if (e.status === 'fulfilled') setMonthly(e.value.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const pendingTasks = tasks.filter((t) => !t.completed).length
  const doneTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const totalExpenses = monthly?.grandTotal ?? 0

  const stats = [
    {
      title: 'Tareas Totales',
      value: loading ? '...' : String(totalTasks),
      change: `${pendingTasks} pendientes`,
      changeType: 'neutral' as const,
      icon: ListChecks,
      description: 'registradas',
    },
    {
      title: 'Completadas',
      value: loading ? '...' : String(doneTasks),
      change: totalTasks > 0 ? `${Math.round((doneTasks / totalTasks) * 100)}% del total` : '—',
      changeType: doneTasks > 0 ? 'positive' as const : 'neutral' as const,
      icon: CheckCircle2,
      description: 'listas',
    },
    {
      title: 'Pendientes',
      value: loading ? '...' : String(pendingTasks),
      change: pendingTasks === 0 ? '¡Todo al día!' : `${pendingTasks} por hacer`,
      changeType: pendingTasks === 0 ? 'positive' as const : 'neutral' as const,
      icon: Activity,
      description: 'sin completar',
    },
    {
      title: 'Gastos del año',
      value: loading ? '...' : `$${totalExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`,
      change: 'acumulado',
      changeType: 'neutral' as const,
      icon: DollarSign,
      description: 'total año',
    },
  ]

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido{user ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted-foreground text-sm">
            Resumen de tu panel personal.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart monthlyData={monthly} />
          </div>
          <div className="space-y-6">
            <ActivityFeed tasks={tasks.slice(0, 8)} loading={loading} />
          </div>
        </div>

        <QuickActions />
      </div>
    </DashboardLayout>
  )
}

