"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { EditCustomerDialog } from "@/components/edit-customer-dialog";
import { DeleteCustomerDialog } from "@/components/delete-customer-dialog";
import { usePaginationStore } from "@/lib/store/pagination-store";
import type { Customer, PaginationMeta } from "@/lib/types";

interface CustomerListProps {
  customers: Customer[];
  pagination?: PaginationMeta;
}

export function CustomerList({ customers, pagination }: CustomerListProps) {
  const [search, setSearch] = useState("");
  const { currentPage, itemsPerPage } = usePaginationStore(
    (state) => state.customerList
  );
  const setCurrentPage = usePaginationStore(
    (state) => state.setCustomerListPage
  );
  const setItemsPerPage = usePaginationStore(
    (state) => state.setCustomerListItemsPerPage
  );

  // Note: Search is now client-side on the current page's data.
  // For full server-side search, the API would need to handle a search query.
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pelanggan</CardTitle>
        <CardDescription>Kelola data pelanggan</CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Cari nama/HP/alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search ? "Tidak ada yang cocok" : "Belum ada pelanggan"}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone || "-"}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {c.address || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditCustomerDialog customer={c} />
                          <DeleteCustomerDialog customer={c} />
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
