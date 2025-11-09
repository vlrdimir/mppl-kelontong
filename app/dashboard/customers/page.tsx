"use client";

import { useQuery } from "@tanstack/react-query";
import { CustomerList } from "@/components/customer-list";
import { AddCustomerDialog } from "@/components/add-customer-dialog";
import { usePaginationStore } from "@/lib/store/pagination-store";
import type { PaginatedCustomersResponse } from "@/lib/types";

async function fetchCustomers(
  page: number,
  limit: number
): Promise<PaginatedCustomersResponse> {
  const res = await fetch(`/api/customers?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export default function CustomersPageClient() {
  const { currentPage, itemsPerPage } = usePaginationStore(
    (state) => state.customerList
  );
  const { data, isLoading, error } = useQuery({
    queryKey: ["customers", currentPage, itemsPerPage],
    queryFn: () => fetchCustomers(currentPage, itemsPerPage),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat data pelanggan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data pelanggan</p>
      </div>
    );
  }

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Manajemen Pelanggan
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola data pelanggan (nama, no. HP, alamat)
              </p>
            </div>
            <AddCustomerDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <CustomerList customers={customers} pagination={pagination} />
      </main>
    </div>
  );
}
