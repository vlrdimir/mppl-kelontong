"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PayDebtDialog } from "@/components/pay-debt-dialog";
import { DebtHistoryDialog } from "@/components/debt-history-dialog";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationStore } from "@/lib/store/pagination-store";
import { usePrintDebtInvoice } from "@/lib/hooks/use-print-debt-invoice";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Debt, PaginationMeta } from "@/lib/types";

interface DebtListProps {
  debts: Debt[];
  pagination?: PaginationMeta;
  title: string;
  description: string;
  type: "active" | "paid";
}

export function DebtList({
  debts,
  pagination,
  title,
  description,
  type,
}: DebtListProps) {
  const { currentPage, itemsPerPage } = usePaginationStore((state) =>
    type === "active" ? state.activeDebtsList : state.paidDebtsList
  );
  const setCurrentPage = usePaginationStore((state) =>
    type === "active"
      ? state.setActiveDebtsListPage
      : state.setPaidDebtsListPage
  );
  const setItemsPerPage = usePaginationStore((state) =>
    type === "active"
      ? state.setActiveDebtsListItemsPerPage
      : state.setPaidDebtsListItemsPerPage
  );
  const { printDebtInvoice } = usePrintDebtInvoice();

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
    });
  };

  const formatInvoiceNumber = (id: number) => {
    const idString = String(id);
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada data
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Invoice</TableHead>
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
                  {debts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-semibold">
                        {debt?.transactionId
                          ? formatInvoiceNumber(debt.transactionId)
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {debt.customer?.name || "-"}
                      </TableCell>
                      <TableCell>{formatDate(debt.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(debt.totalDebt)}</TableCell>
                      <TableCell className="text-emerald-600">
                        {formatCurrency(debt.paidAmount)}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(debt.remainingDebt)}
                      </TableCell>
                      <TableCell>{getStatusBadge(debt.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {debt.status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => printDebtInvoice(debt)}
                              title="Cetak Bukti Pelunasan"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          )}
                          <DebtHistoryDialog debt={debt} />
                          {debt.status !== "paid" && (
                            <PayDebtDialog debt={debt} />
                          )}
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
