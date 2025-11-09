"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { usePaginationStore } from "@/lib/store/pagination-store";
import type { Transaction, PaginationMeta } from "@/lib/types";

interface TransactionListProps {
  transactions: Transaction[];
  pagination?: PaginationMeta;
}

export function TransactionList({
  transactions,
  pagination,
}: TransactionListProps) {
  const { currentPage, itemsPerPage } = usePaginationStore(
    (state) => state.transactionList
  );
  const setCurrentPage = usePaginationStore(
    (state) => state.setTransactionListPage
  );
  const setItemsPerPage = usePaginationStore(
    (state) => state.setTransactionListItemsPerPage
  );

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      partial: "secondary",
      unpaid: "destructive",
    };

    const labels: Record<string, string> = {
      paid: "Lunas",
      partial: "Sebagian",
      unpaid: "Belum Bayar",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Penjualan</CardTitle>
        <CardDescription>
          Daftar transaksi penjualan yang telah dicatat
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Belum ada transaksi penjualan
          </p>
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
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(transaction.transactionDate)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.transactionItems?.map((item) => (
                            <div key={item.id} className="text-sm">
                              {item.product?.name} ({item.quantity}x)
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.totalAmount)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.paidAmount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.paymentStatus)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <EditTransactionDialog transaction={transaction} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {pagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={pagination.total}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
