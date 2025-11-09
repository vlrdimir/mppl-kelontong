"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/components/dashboard-stats";
import { SalesChart } from "@/components/sales-chart";
import { ProductSalesChart } from "@/components/product-sales-chart";
import { RecentTransactions } from "@/components/recent-transactions";
import type {
  TransactionsResponse,
  DebtsResponse,
  DateRangeOption,
} from "@/lib/types";

async function fetchTransactions(): Promise<TransactionsResponse> {
  const response = await fetch("/api/transactions?type=sale");
  if (!response.ok) throw new Error("Failed to fetch transactions");
  const body = await response.json();
  return Array.isArray(body) ? body : body?.data ?? [];
}

async function fetchDebts(): Promise<DebtsResponse> {
  const response = await fetch("/api/debts");
  if (!response.ok) throw new Error("Failed to fetch debts");
  return response.json();
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeOption>("this-month");

  const { data: allTransactions = [], isLoading: transactionsLoading } =
    useQuery({
      queryKey: ["transactions", "sale"],
      queryFn: fetchTransactions,
    });

  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ["debts"],
    queryFn: fetchDebts,
  });

  // PERUBAHAN: Menambahkan tipe eksplisit pada parameter `item` untuk menghindari TS7006 (implicit any).
  // Versi baru memberi tipe minimal yang diperlukan.
  const calculateProfit = (transactions: TransactionsResponse): number => {
    const list = transactions;
    if (!list) return 0;
    return list.reduce((total: number, transaction: any) => {
      const transactionProfit =
        transaction.transactionItems?.reduce(
          (
            sum: number,
            item: {
              product?: { purchasePrice?: number };
              price: number;
              quantity: number;
            }
          ) => {
            const purchasePrice = Number(item.product?.purchasePrice ?? 0);
            const sellingPrice = Number(item.price);
            const profit = (sellingPrice - purchasePrice) * item.quantity;
            return sum + profit;
          },
          0
        ) ?? 0;
      return total + transactionProfit;
    }, 0);
  };

  const getDateRange = (
    option: DateRangeOption
  ): { start: Date; end: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let start = new Date();

    switch (option) {
      case "today":
        start = new Date(today);
        break;
      case "this-month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "last-month":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case "last-2-months":
        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        break;
      case "last-3-months":
        start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        break;
      case "this-year":
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    return { start, end };
  };

  const filterTransactionsByDate = (
    transactions: TransactionsResponse,
    start: Date,
    end: Date
  ): TransactionsResponse => {
    return transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.transactionDate);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const normalizedAll = allTransactions as any[];
    const todayTransactions = filterTransactionsByDate(
      normalizedAll,
      today,
      endOfToday
    );
    const { start, end } = getDateRange(dateRange);
    const rangeTransactions = filterTransactionsByDate(
      normalizedAll,
      start,
      end
    );

    const todayProfit = calculateProfit(todayTransactions);
    const rangeProfit = calculateProfit(rangeTransactions);

    const totalProductsSold = rangeTransactions.reduce((total, transaction) => {
      return (
        total +
        (transaction.transactionItems?.reduce(
          (sum: number, item) => sum + item.quantity,
          0
        ) || 0)
      );
    }, 0);

    const totalTransactions = rangeTransactions.length;

    const totalDebt = debts
      .filter((debt) => debt.status !== "paid")
      .reduce((sum: number, debt) => sum + Number(debt.remainingDebt), 0);

    return {
      todayProfit,
      rangeProfit,
      totalProductsSold,
      totalTransactions,
      totalDebt,
    };
  }, [allTransactions, debts, dateRange]);

  if (transactionsLoading || debtsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-6">
        <DashboardStats
          todayProfit={stats.todayProfit}
          rangeProfit={stats.rangeProfit}
          totalProductsSold={stats.totalProductsSold}
          totalTransactions={stats.totalTransactions}
          totalDebt={stats.totalDebt}
          dateRange={dateRange}
          onDateRangeChange={(range: string) =>
            setDateRange(range as DateRangeOption)
          }
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SalesChart transactions={allTransactions || []} />
          <ProductSalesChart transactions={allTransactions || []} />
        </div>

        <div className="mt-6">
          <RecentTransactions
            transactions={(allTransactions as any[]).slice(0, 10)}
          />
        </div>
      </main>
    </div>
  );
}
