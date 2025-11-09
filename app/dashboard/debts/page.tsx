"use client"

import { useQuery } from "@tanstack/react-query"
import { DebtList } from "@/components/debt-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

async function fetchDebts() {
  const response = await fetch("/api/debts")
  if (!response.ok) {
    throw new Error("Failed to fetch debts")
  }
  return response.json()
}

export default function DebtsPageClient() {
  const { data: debts, isLoading, error } = useQuery({
    queryKey: ["debts"],
    queryFn: fetchDebts,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat data piutang...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data piutang</p>
      </div>
    )
  }

  // Calculate statistics
  const totalUnpaid =
    debts?.filter((d: any) => d.status === "unpaid").reduce((sum: number, d: any) => sum + Number(d.remainingDebt), 0) || 0
  const totalPartial =
    debts?.filter((d: any) => d.status === "partial").reduce((sum: number, d: any) => sum + Number(d.remainingDebt), 0) || 0
  const totalPaid = debts?.filter((d: any) => d.status === "paid").length || 0
  const totalOutstanding = totalUnpaid + totalPartial

  const unpaidDebts = debts?.filter((d: any) => d.status !== "paid") || []
  const paidDebts = debts?.filter((d: any) => d.status === "paid") || []

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Manajemen Piutang</h1>
          <p className="text-sm text-muted-foreground">Kelola piutang pelanggan dan pembayaran</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Piutang</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Belum lunas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Belum Dibayar</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalUnpaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Status: Belum bayar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lunas</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalPaid}</div>
              <p className="text-xs text-muted-foreground mt-1">Piutang lunas</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <DebtList debts={unpaidDebts} title="Piutang Aktif" description="Piutang yang belum lunas" />
          <DebtList debts={paidDebts} title="Riwayat Lunas" description="Piutang yang sudah dibayar lunas" />
        </div>
      </main>
    </div>
  )
}
