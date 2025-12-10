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
import { usePrintInvoice } from "@/lib/hooks/use-print-invoice";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { printInvoice } = usePrintInvoice();

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

  const formatInvoiceNumber = (invoiceCode: string | number) => {
    if (typeof invoiceCode === "string" && invoiceCode.trim().length > 0) {
      return invoiceCode;
    }
    const idString = String(invoiceCode);
    const padding = Math.max(4, idString.length);
    return `INV-${idString.padStart(padding, "0")}`;
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
                    <TableHead>Invoice</TableHead>
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
                      <TableCell className="font-semibold">
                        {formatInvoiceNumber(
                          transaction.invoiceCode ?? transaction.id
                        )}
                      </TableCell>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printInvoice(transaction)}
                            title="Cetak Invoice"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <EditTransactionDialog transaction={transaction} />
                        </div>
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
