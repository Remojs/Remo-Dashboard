'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

const ACCENT_COLOR = '#e05c45'

interface Props {
  monthlyData?: MonthlyExpenses | null
}

export function RevenueChart({ monthlyData }: Props) {
  const chartData = monthlyData
    ? monthlyData.monthly.map((m) => ({
        month: MONTH_ABBR[m.month - 1],
        expenses: m.total,
      }))
    : fallbackData

  return (
    <Card className="col-span-full">
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
                  <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f0a0a',
                  border: '1px solid rgba(224,92,69,0.4)',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="expenses" name="Gastos" stroke={ACCENT_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

