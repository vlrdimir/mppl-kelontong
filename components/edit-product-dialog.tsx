"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { useUpdateProduct } from "@/lib/hooks/use-products"
import { useToast } from "@/hooks/use-toast"

interface EditProductDialogProps {
  product: any
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category || "",
    stock: product.stock.toString(),
    purchasePrice: product.purchasePrice?.toString() || product.purchase_price?.toString() || "",
    sellingPrice: product.sellingPrice?.toString() || product.selling_price?.toString() || "",
  })

  const updateProduct = useUpdateProduct()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateProduct.mutate(
      {
        id: product.id,
        data: {
          name: formData.name,
          category: formData.category || undefined,
          stock: Number.parseInt(formData.stock),
          purchasePrice: formData.purchasePrice,
          sellingPrice: formData.sellingPrice,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          toast({
            title: "Berhasil",
            description: "Produk berhasil diupdate",
          })
        },
        onError: (error) => {
          console.error("Error updating product:", error)
          toast({
            title: "Gagal",
            description: "Gagal mengupdate produk",
            variant: "destructive",
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <DialogDescription>Ubah informasi produk</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Produk *</Label>
            <Input
              id="edit-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategori</Label>
            <Input
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-stock">Stok *</Label>
            <Input
              id="edit-stock"
              type="number"
              min="0"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-purchasePrice">Harga Beli *</Label>
            <Input
              id="edit-purchasePrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-sellingPrice">Harga Jual *</Label>
            <Input
              id="edit-sellingPrice"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
