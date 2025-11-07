"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { usePaginationStore } from "@/lib/store/pagination-store"
import type { Transaction } from "@/lib/types"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { currentPage, itemsPerPage } = usePaginationStore((state) => state.transactionList)
  const setCurrentPage = usePaginationStore((state) => state.setTransactionListPage)
  const setItemsPerPage = usePaginationStore((state) => state.setTransactionListItemsPerPage)

  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions.slice(startIndex, endIndex)

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
      hour: "2-digit",
      minute: "2-digit",
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
        <CardTitle>Riwayat Penjualan</CardTitle>
        <CardDescription>Daftar transaksi penjualan yang telah dicatat</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada transaksi penjualan</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Dibayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.transactionItems?.map((item) => (
                            <div key={item.id} className="text-sm">
                              {item.product?.name} ({item.quantity}x)
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(transaction.totalAmount)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(transaction.paidAmount)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.paymentStatus)}</TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={transactions.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
