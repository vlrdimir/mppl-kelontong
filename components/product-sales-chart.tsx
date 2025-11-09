"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ProductSalesChartProps {
  data: { product: string; terjual: number }[];
}

export function ProductSalesChart({ data: chartData }: ProductSalesChartProps) {
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
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "black",
              }}
              formatter={(value: any) => [`${value} unit`, "Terjual"]}
            />
            <Bar
              dataKey="terjual"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
