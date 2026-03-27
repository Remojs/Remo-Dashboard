'use client'

import { useEffect, useState } from 'react'
import { Users, FolderKanban, ListTodo, DollarSign, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { ProjectsOverview } from '@/components/dashboard/projects-overview'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { IncomeChart } from '@/components/dashboard/income-chart'
import { projectsApi, tasksApi, expensesApi, type Project, type Task, type MonthlyExpenses } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [monthly, setMonthly] = useState<MonthlyExpenses | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyExpenses | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      projectsApi.getAll({ limit: 200 }),
      tasksApi.getAll({ limit: 50 }),
      expensesApi.getMonthly(),
      projectsApi.getMonthlyRevenue(),
    ])
      .then(([p, t, e, r]) => {
        setProjects(p.data)
        setTasks(t.data)
        setMonthly(e.data)
        setMonthlyRevenue(r.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const activeProjects = projects.filter((p) => p.status === 'in_progress').length
  const completedProjects = projects.filter((p) => p.status === 'completed').length
  const totalProjects = projects.length
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const totalRevenue = projects
    .filter((p) => p.status === 'completed')
    .reduce((acc, p) => acc + parseFloat(p.price), 0)

  const activeProjectsList = projects.filter((p) => p.status === 'in_progress').slice(0, 5)

  const stats = [
    {
      title: 'Total Proyectos',
      value: loading ? '...' : String(totalProjects),
      change: `${activeProjects} activos`,
      changeType: 'positive' as const,
      icon: Users,
      description: 'registrados',
    },
    {
      title: 'Proyectos Activos',
      value: loading ? '...' : String(activeProjects),
      change: `de ${totalProjects} totales`,
      changeType: 'positive' as const,
      icon: FolderKanban,
      description: 'en progreso',
    },
    {
      title: 'Proyectos Terminados',
      value: loading ? '...' : String(completedProjects),
      change: completedProjects > 0 ? `$${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} generados` : 'sin ingresos aún',
      changeType: completedProjects > 0 ? 'positive' as const : 'neutral' as const,
      icon: CheckCircle2,
      description: 'completados',
    },
    {
      title: 'Tareas',
      value: loading ? '...' : String(pendingTasks),
      change: `${doneTasks} completadas`,
      changeType: doneTasks > pendingTasks ? 'positive' : 'neutral' as const,
      icon: ListTodo,
      description: 'pendientes',
    },
    {
      title: 'Ingresos',
      value: loading ? '...' : `$${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      change: `${monthly?.grandTotal ? `$${monthly.grandTotal.toFixed(0)} gastos` : '—'}`,
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'proyectos completados',
    },
  ]

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido de vuelta{user ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de lo que está pasando con tu agencia.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeChart monthlyData={monthlyRevenue} />
          <RevenueChart monthlyData={monthly} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProjectsOverview projects={activeProjectsList} loading={loading} />
          </div>
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

