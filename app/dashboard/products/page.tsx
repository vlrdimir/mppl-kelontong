"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductList } from "@/components/product-list";
import { AddProductDialog } from "@/components/add-product-dialog";
import { usePaginationStore } from "@/lib/store/pagination-store";
import type { PaginatedProductsResponse } from "@/lib/types";

// Fetch for the paginated list
async function fetchPaginatedProducts(
  page: number,
  limit: number
): Promise<PaginatedProductsResponse> {
  const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch paginated products");
  }
  return response.json();
}

// Fetch all products for stats calculation
async function fetchAllProducts(): Promise<PaginatedProductsResponse> {
  const response = await fetch("/api/products?limit=1000"); // High limit to get all
  if (!response.ok) {
    throw new Error("Failed to fetch all products for stats");
  }
  return response.json();
}

export default function ProductsPageClient() {
  const { currentPage, itemsPerPage } = usePaginationStore(
    (state) => state.productList
  );

  const {
    data: paginatedProductsData,
    isLoading: isLoadingPaginated,
    error: errorPaginated,
  } = useQuery({
    queryKey: ["products", currentPage, itemsPerPage],
    queryFn: () => fetchPaginatedProducts(currentPage, itemsPerPage),
  });

  const {
    data: allProductsData,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: ["allProducts"],
    queryFn: fetchAllProducts,
  });

  const isLoading = isLoadingPaginated || isLoadingAll;
  const error = errorPaginated || errorAll;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat data produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data produk</p>
      </div>
    );
  }

  const products = paginatedProductsData?.data || [];
  const pagination = paginatedProductsData?.pagination;
  const allProducts = allProductsData?.data || [];

  // Calculate total stock value from all products
  const totalStockValue = allProducts.reduce(
    (sum, product) => sum + product.stock * Number(product.purchasePrice),
    0
  );

  const totalProducts = allProducts.length;
  const lowStockProducts = allProducts.filter((p) => p.stock < 10).length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Manajemen Produk
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola daftar produk dan stok barang
              </p>
            </div>
            <AddProductDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Produk</p>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Nilai Stok</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(totalStockValue)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Stok Menipis</p>
            <p className="text-2xl font-bold text-destructive">
              {lowStockProducts}
            </p>
          </div>
        </div>

        <ProductList products={products} pagination={pagination} />
      </main>
    </div>
  );
}
