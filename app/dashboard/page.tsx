"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/components/dashboard-stats";
import { SalesChart } from "@/components/sales-chart";
import { ProductSalesChart } from "@/components/product-sales-chart";
import { RecentTransactions } from "@/components/recent-transactions";
import type { DateRangeOption } from "@/lib/types";
import { getDateRange } from "@/lib/utils";

async function fetchDashboardStats(
  dateRange: DateRangeOption,
  customRange?: { start: string; end: string }
) {
  const { start, end } = customRange || getDateRange(dateRange);

  const response = await fetch(`/api/stats?startDate=${start}&endDate=${end}`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  return response.json();
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeOption>("this-month");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats", dateRange],
    queryFn: () => fetchDashboardStats(dateRange),
  });

  if (isLoading) {
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
          todayProfit={stats?.todayProfit || 0}
          rangeProfit={stats?.rangeProfit || 0}
          totalProductsSold={stats?.totalProductsSold || 0}
          totalTransactions={stats?.totalTransactions || 0}
          totalDebt={stats?.totalDebt || 0}
          dateRange={dateRange}
          onDateRangeChange={(range: string) =>
            setDateRange(range as DateRangeOption)
          }
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SalesChart data={stats?.salesChartData || []} />
          <ProductSalesChart data={stats?.productSalesChartData || []} />
        </div>

        <div className="mt-6">
          <RecentTransactions transactions={stats?.recentTransactions || []} />
        </div>
      </main>
    </div>
  );
}
