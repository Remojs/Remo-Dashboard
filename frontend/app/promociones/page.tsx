'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Promociones } from '@/components/dashboard/promociones'

export default function PromocionesPage() {
  return (
    <DashboardLayout title="Promociones">
      <Promociones />
    </DashboardLayout>
  )
}
