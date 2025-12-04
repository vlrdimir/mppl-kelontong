"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoryList } from "@/components/category-list";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import type { Category } from "@/lib/types";

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export default function CategoriesPageClient() {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat data kategori...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Gagal memuat data kategori</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Manajemen Kategori
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola kategori produk di warung
              </p>
            </div>
            <AddCategoryDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <CategoryList categories={categories || []} />
      </main>
    </div>
  );
}
