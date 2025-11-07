"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, ShoppingCart, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardStatsProps {
  todayProfit: number
  rangeProfit: number
  totalProductsSold: number
  totalTransactions: number
  totalDebt: number
  dateRange: string
  onDateRangeChange: (range: string) => void
}

export function DashboardStats({
  todayProfit,
  rangeProfit,
  totalProductsSold,
  totalTransactions,
  totalDebt,
  dateRange,
  onDateRangeChange,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getRangeLabel = () => {
    switch (dateRange) {
      case "today":
        return "Hari Ini"
      case "this-month":
        return "Bulan Ini"
      case "last-month":
        return "Bulan Lalu"
      case "last-2-months":
        return "2 Bulan Terakhir"
      case "last-3-months":
        return "3 Bulan Terakhir"
      case "this-year":
        return "Tahun Ini"
      default:
        return "Periode"
    }
  }

  const getRangeDescription = () => {
    const now = new Date()
    switch (dateRange) {
      case "today":
        return "Dari penjualan hari ini"
      case "this-month":
        return `Total bulan ${now.toLocaleDateString("id-ID", { month: "long" })}`
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        return `Total bulan ${lastMonth.toLocaleDateString("id-ID", { month: "long" })}`
      case "last-2-months":
        return "Total 2 bulan terakhir"
      case "last-3-months":
        return "Total 3 bulan terakhir"
      case "this-year":
        return `Total tahun ${now.getFullYear()}`
      default:
        return "Pilih periode"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Filter Periode:</label>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="this-month">Bulan Ini</SelectItem>
            <SelectItem value="last-month">Bulan Lalu</SelectItem>
            <SelectItem value="last-2-months">2 Bulan Terakhir</SelectItem>
            <SelectItem value="last-3-months">3 Bulan Terakhir</SelectItem>
            <SelectItem value="this-year">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Keuntungan Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(todayProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">Dari penjualan hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Keuntungan {getRangeLabel()}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(rangeProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">{getRangeDescription()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Produk Terjual</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProductsSold}</div>
            <p className="text-xs text-muted-foreground mt-1">{getRangeLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Transaksi {getRangeLabel().toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Piutang</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalDebt)}</div>
            <p className="text-xs text-muted-foreground mt-1">Belum dibayar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
