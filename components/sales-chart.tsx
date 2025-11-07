"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import type { Transaction } from "@/lib/types"

interface SalesChartProps {
  transactions: Transaction[]
}

export function SalesChart({ transactions }: SalesChartProps) {
  // Group transactions by date
  const salesByDate = transactions.reduce((acc: Record<string, number>, transaction) => {
    const date = new Date(transaction.transactionDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    })

    if (!acc[date]) {
      acc[date] = 0
    }

    acc[date] += Number(transaction.totalAmount)
    return acc
  }, {})

  const chartData = Object.entries(salesByDate)
    .map(([date, amount]) => ({
      date,
      penjualan: amount,
    }))
    .reverse()
    .slice(-14) // Last 14 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Penjualan</CardTitle>
        <CardDescription>Grafik penjualan 14 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: any) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
            <Line
              type="monotone"
              dataKey="penjualan"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
