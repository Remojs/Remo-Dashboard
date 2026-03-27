'use client'

import { useTheme } from 'next-themes'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  description?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: StatsCardProps) {
  const { theme } = useTheme()

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      theme === 'violet' && "glass-card border-primary/20 hover:border-primary/40"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          theme === 'violet' ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
        )}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {changeType === 'positive' && (
            <TrendingUp className="size-3 text-emerald-500" />
          )}
          {changeType === 'negative' && (
            <TrendingDown className="size-3 text-destructive" />
          )}
          <span className={cn(
            "text-xs font-medium",
            changeType === 'positive' && "text-emerald-500",
            changeType === 'negative' && "text-destructive",
            changeType === 'neutral' && "text-muted-foreground"
          )}>
            {change}
          </span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </CardContent>
      
      {/* Decorative gradient for violet theme */}
      {theme === 'violet' && (
        <div className="absolute -right-4 -top-4 size-20 rounded-full bg-primary/10 blur-2xl" />
      )}
    </Card>
  )
}
