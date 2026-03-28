'use client'

import { CheckSquare, KeyRound, Globe, DollarSign, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  { label: 'Nueva Tarea', icon: CheckSquare, href: '/tasks', variant: 'default' as const },
  { label: 'Contraseñas', icon: KeyRound, href: '/passwords', variant: 'outline' as const },
  { label: 'Web Vitals', icon: Globe, href: '/vitals', variant: 'outline' as const },
  { label: 'Gastos', icon: DollarSign, href: '/expenses', variant: 'outline' as const },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <span>Acciones Rápidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto flex-col gap-2 py-4 transition-all duration-200"
              onClick={() => router.push(action.href)}
            >
              <action.icon className="size-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
