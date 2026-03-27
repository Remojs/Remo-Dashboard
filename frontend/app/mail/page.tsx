'use client'

import { Mail, Construction } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function MailPage() {
  return (
    <DashboardLayout title="Mail">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Bandeja de entrada</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Construction className="size-4" />
            <p className="text-base">Próximamente</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            El módulo de correo está en desarrollo. Pronto podrás gestionar todos tus mensajes desde aquí.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
