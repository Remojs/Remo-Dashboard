'use client'

import { useTheme } from 'next-themes'
import { Plus, FileText, Users, CreditCard, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const actions = [
  {
    label: 'Nuevo Proyecto',
    icon: Plus,
    variant: 'default' as const,
  },
  {
    label: 'Crear Tarea',
    icon: FileText,
    variant: 'outline' as const,
  },
  {
    label: 'Agregar Lead',
    icon: Users,
    variant: 'outline' as const,
  },
  {
    label: 'Registrar Pago',
    icon: CreditCard,
    variant: 'outline' as const,
  },
]

export function QuickActions() {
  const { theme } = useTheme()

  return (
    <Card className={cn(
      theme === 'violet' && "glass-card border-primary/20"
    )}>
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
              className={cn(
                "h-auto flex-col gap-2 py-4 transition-all duration-200",
                action.variant === 'default' && theme === 'violet' && "bg-primary hover:bg-primary/90 glow-effect",
                action.variant === 'outline' && theme === 'violet' && "border-primary/30 hover:border-primary/60 hover:bg-primary/10"
              )}
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
