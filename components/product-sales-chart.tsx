"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import type { Transaction } from "@/lib/types"

interface ProductSalesChartProps {
  transactions: Transaction[]
}

export function ProductSalesChart({ transactions }: ProductSalesChartProps) {
  // Group sales by product
  const salesByProduct = transactions.reduce((acc: Record<string, number>, transaction) => {
    transaction.transactionItems?.forEach((item) => {
      const productName = item.product?.name || "Unknown"

      if (!acc[productName]) {
        acc[productName] = 0
      }

      acc[productName] += item.quantity
    })
    return acc
  }, {})

  const chartData = Object.entries(salesByProduct)
    .map(([product, quantity]) => ({
      product: product.length > 15 ? product.substring(0, 15) + "..." : product,
      terjual: quantity,
    }))
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 8) // Top 8 products

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
        <CardDescription>8 produk dengan penjualan tertinggi</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="product"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: any) => [`${value} unit`, "Terjual"]}
            />
            <Bar dataKey="terjual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
