"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductList } from "@/components/product-list";
import { AddProductDialog } from "@/components/add-product-dialog";
import type { PaginatedProductsResponse } from "@/lib/types";

async function fetchProducts() {
  // Fetch all products for stats calculation
  const response = await fetch("/api/products?limit=20");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json() as Promise<PaginatedProductsResponse>;
}

export default function ProductsPageClient() {
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

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

  const products = productsData?.data || [];

  // Calculate total stock value
  const totalStockValue = products.reduce(
    (sum, product) => sum + product.stock * Number(product.purchasePrice),
    0
  );

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

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

        <ProductList products={products} />
      </main>
    </div>
  );
}
