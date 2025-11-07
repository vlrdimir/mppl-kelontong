"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PayDebtDialog } from "@/components/pay-debt-dialog"
import { DebtHistoryDialog } from "@/components/debt-history-dialog"
import { Pagination } from "@/components/ui/pagination"
import { usePaginationStore } from "@/lib/store/pagination-store"
import type { Debt } from "@/lib/types"

interface DebtListProps {
  debts: Debt[]
  title: string
  description: string
}

export function DebtList({ debts, title, description }: DebtListProps) {
  const { currentPage, itemsPerPage } = usePaginationStore((state) => state.debtList)
  const setCurrentPage = usePaginationStore((state) => state.setDebtListPage)
  const setItemsPerPage = usePaginationStore((state) => state.setDebtListItemsPerPage)

  const totalPages = Math.ceil(debts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDebts = debts.slice(startIndex, endIndex)

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      partial: "secondary",
      unpaid: "destructive",
    }

    const labels: Record<string, string> = {
      paid: "Lunas",
      partial: "Sebagian",
      unpaid: "Belum Bayar",
    }

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Total Hutang</TableHead>
                    <TableHead>Dibayar</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">{debt.customer?.name || "-"}</TableCell>
                      <TableCell>{formatDate(debt.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(debt.totalDebt)}</TableCell>
                      <TableCell className="text-emerald-600">{formatCurrency(debt.paidAmount)}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(debt.remainingDebt)}
                      </TableCell>
                      <TableCell>{getStatusBadge(debt.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DebtHistoryDialog debt={debt} />
                          {debt.status !== "paid" && <PayDebtDialog debt={debt} />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={debts.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
