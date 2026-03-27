'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyExpenses } from '@/lib/api'

const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const fallbackData = [
  { month: 'Ene', expenses: 0 }, { month: 'Feb', expenses: 0 }, { month: 'Mar', expenses: 0 },
  { month: 'Abr', expenses: 0 }, { month: 'May', expenses: 0 }, { month: 'Jun', expenses: 0 },
  { month: 'Jul', expenses: 0 }, { month: 'Ago', expenses: 0 }, { month: 'Sep', expenses: 0 },
  { month: 'Oct', expenses: 0 }, { month: 'Nov', expenses: 0 }, { month: 'Dic', expenses: 0 },
]

interface Props {
  monthlyData?: MonthlyExpenses | null
}

export function RevenueChart({ monthlyData }: Props) {
  const { theme } = useTheme()

  const chartData = monthlyData
    ? monthlyData.monthly.map((m) => ({
        month: MONTH_ABBR[m.month - 1],
        expenses: m.total,
      }))
    : fallbackData

  const primaryColor = theme === 'violet'
    ? '#a855f7'
    : theme === 'dark'
      ? '#8b5cf6'
      : '#7c3aed'

  const accentColor = theme === 'violet'
    ? '#38bdf8'
    : theme === 'dark'
      ? '#60a5fa'
      : '#0ea5e9'

  return (
    <Card className={cn('col-span-full', theme === 'violet' && 'glass-card border-primary/20')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Gastos Mensuales</CardTitle>
        <CardDescription>
          {monthlyData
            ? `Total ${monthlyData.year}: $${monthlyData.grandTotal.toLocaleString()}`
            : 'Resumen financiero del año'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'violet' ? 'rgba(139,92,246,0.2)' : 'rgba(128,128,128,0.15)'}
                vertical={false}
              />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' || theme === 'violet' ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' || theme === 'violet' ? '#9ca3af' : '#6b7280', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'violet' ? '#1a0a2e' : theme === 'dark' ? '#1e1b2e' : '#ffffff',
                  border: `1px solid ${theme === 'violet' ? 'rgba(139,92,246,0.4)' : theme === 'dark' ? 'rgba(139,92,246,0.3)' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: theme === 'light' ? '#111827' : '#f3f4f6',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="expenses" name="Gastos" stroke={accentColor} strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

