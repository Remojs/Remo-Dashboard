'use client'

import { useEffect, useState } from 'react'
import { ListChecks } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { tasksApi, type Task } from '@/lib/api'

export default function ExtraActividadRecientePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksApi
      .getAll({ limit: 25 })
      .then((response) => setTasks(response.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Actividad Reciente">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="size-5" />
          <h2 className="text-lg font-semibold tracking-tight">Actividad Reciente</h2>
        </div>

        <div className="max-w-3xl">
          <ActivityFeed tasks={tasks} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  )
}
