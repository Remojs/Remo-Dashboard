'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Herramientas } from '@/components/dashboard/herramientas'

export default function HerramientasPage() {
  return (
    <DashboardLayout title="Herramientas">
      <Herramientas />
    </DashboardLayout>
  )
}
