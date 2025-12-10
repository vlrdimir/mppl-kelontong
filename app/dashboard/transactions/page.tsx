"use client";

import { useQuery } from "@tanstack/react-query";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { ExportTransactionsButton } from "@/components/export-transactions-button";
import { usePaginationStore } from "@/lib/store/pagination-store";
import type {
  PaginatedProductsResponse,
  PaginatedTransactionsResponse,
} from "@/lib/types";

async function fetchProducts() {
  // Fetch all products for the form dropdown
  const response = await fetch("/api/products?limit=1000"); // High limit
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json() as Promise<PaginatedProductsResponse>;
}

async function fetchTransactions(
  page: number,
  limit: number
): Promise<PaginatedTransactionsResponse> {
  // Fetch sale transactions for the list
  const response = await fetch(
    `/api/transactions?type=sale&page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}

export default function TransactionsPageClient() {
  const { currentPage, itemsPerPage } = usePaginationStore(
    (state) => state.transactionList
  );

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["allProductsForForm"], // Use a different key
    queryFn: fetchProducts,
  });

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["transactions", currentPage, itemsPerPage],
    queryFn: () => fetchTransactions(currentPage, itemsPerPage),
  });

  if (productsLoading || transactionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  if (productsError || transactionsError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data</p>
      </div>
    );
  }

  const products = productsData?.data || [];
  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Transaksi Penjualan
              </h1>
              <p className="text-sm text-muted-foreground">
                Catat transaksi penjualan barang
              </p>
            </div>
            <ExportTransactionsButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <TransactionForm products={products} />
        <TransactionList transactions={transactions} pagination={pagination} />
      </main>
    </div>
  );
}
