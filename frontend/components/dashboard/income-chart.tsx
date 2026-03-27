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

const fallbackData = MONTH_ABBR.map((month) => ({ month, income: 0 }))

interface Props {
  monthlyData?: MonthlyExpenses | null
}

export function IncomeChart({ monthlyData }: Props) {
  const { theme } = useTheme()

  const chartData = monthlyData
    ? monthlyData.monthly.map((m) => ({
        month: MONTH_ABBR[m.month - 1],
        income: m.total,
      }))
    : fallbackData

  const primaryColor = theme === 'violet'
    ? '#a855f7'
    : theme === 'dark'
      ? '#8b5cf6'
      : '#7c3aed'

  return (
    <Card className={cn('col-span-full', theme === 'violet' && 'glass-card border-primary/20')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Ingresos Mensuales</CardTitle>
        <CardDescription>
          {monthlyData
            ? `Total ${monthlyData.year}: $${monthlyData.grandTotal.toLocaleString()}`
            : 'Ingresos de proyectos completados'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
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
              <Area type="monotone" dataKey="income" name="Ingresos" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-sm text-muted-foreground">Ingresos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
