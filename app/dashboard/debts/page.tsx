"use client";

import { useQuery } from "@tanstack/react-query";
import { DebtList } from "@/components/debt-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { usePaginationStore } from "@/lib/store/pagination-store";
import type { PaginatedDebtsResponse } from "@/lib/types";

async function fetchDebts(
  page: number,
  limit: number,
  status: "paid" | "unpaid"
): Promise<PaginatedDebtsResponse> {
  const response = await fetch(
    `/api/debts?page=${page}&limit=${limit}&status=${status}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch debts");
  }
  return response.json();
}

// NOTE: We are assuming an API endpoint /api/debts/stats exists
// to get the overall statistics, since pagination prevents calculating
// from the fetched list.
async function fetchDebtStats() {
  const response = await fetch("/api/debts/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch debt stats");
  }
  return response.json();
}

export default function DebtsPageClient() {
  const { currentPage: activeCurrentPage, itemsPerPage: activeItemsPerPage } =
    usePaginationStore((state) => state.activeDebtsList);
  const { currentPage: paidCurrentPage, itemsPerPage: paidItemsPerPage } =
    usePaginationStore((state) => state.paidDebtsList);

  const {
    data: activeDebtsData,
    isLoading: isLoadingActive,
    error: errorActive,
  } = useQuery({
    queryKey: ["debts", "active", activeCurrentPage, activeItemsPerPage],
    queryFn: () => fetchDebts(activeCurrentPage, activeItemsPerPage, "unpaid"),
  });

  const {
    data: paidDebtsData,
    isLoading: isLoadingPaid,
    error: errorPaid,
  } = useQuery({
    queryKey: ["debts", "paid", paidCurrentPage, paidItemsPerPage],
    queryFn: () => fetchDebts(paidCurrentPage, paidItemsPerPage, "paid"),
  });

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: errorStats,
  } = useQuery({
    queryKey: ["debtStats"],
    queryFn: fetchDebtStats,
  });

  const isLoading = isLoadingActive || isLoadingPaid || isLoadingStats;
  const error = errorActive || errorPaid || errorStats;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat data piutang...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data piutang</p>
      </div>
    );
  }

  const activeDebts = activeDebtsData?.data || [];
  const activePagination = activeDebtsData?.pagination;
  const paidDebts = paidDebtsData?.data || [];
  const paidPagination = paidDebtsData?.pagination;

  const totalOutstanding = statsData?.totalOutstanding || 0;
  const totalUnpaid = statsData?.totalUnpaid || 0;
  const totalPaidCount = statsData?.totalPaidCount || 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            Manajemen Piutang
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola piutang pelanggan dan pembayaran
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Piutang
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Belum Dibayar
              </CardTitle>
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
              <p className="text-xs text-muted-foreground mt-1">
                Status: Belum bayar & Sebagian
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lunas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalPaidCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Piutang lunas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <DebtList
            debts={activeDebts}
            pagination={activePagination}
            title="Piutang Aktif"
            description="Piutang yang belum lunas"
            type="active"
          />
          <DebtList
            debts={paidDebts}
            pagination={paidPagination}
            title="Riwayat Lunas"
            description="Piutang yang sudah dibayar lunas"
            type="paid"
          />
        </div>
      </main>
    </div>
  );
}
