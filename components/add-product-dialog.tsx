"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProduct } from "@/lib/hooks/use-products";
import { useCategories } from "@/lib/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";

export function AddProductDialog() {
  const { toast } = useToast();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
  });

  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createProduct.mutate(
      {
        name: formData.name,
        categoryId: formData.categoryId
          ? Number.parseInt(formData.categoryId)
          : undefined,
        stock: Number.parseInt(formData.stock),
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
      },
      {
        onSuccess: () => {
          setFormData({
            name: "",
            categoryId: "",
            stock: "",
            purchasePrice: "",
            sellingPrice: "",
          });
          setOpen(false);
          toast({
            title: "Berhasil",
            description: "Produk berhasil ditambahkan",
          });
        },
        onError: (error) => {
          console.error("Error adding product:", error);
          toast({
            title: "Gagal",
            description: "Gagal menambahkan produk",
            type: "background",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi produk yang akan ditambahkan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategori</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Pilih kategori (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stok Awal *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Harga Beli *</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Harga Jual *</Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({ ...formData, sellingPrice: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
