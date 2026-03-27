'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminDashboards } from '@/components/dashboard/admin-dashboards'

export default function AdminDashboardsPage() {
  return (
    <DashboardLayout title="Admin Dashboards">
      <AdminDashboards />
    </DashboardLayout>
  )
}
