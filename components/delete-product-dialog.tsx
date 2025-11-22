"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteProduct } from "@/lib/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface DeleteProductDialogProps {
  product: any;
}

export function DeleteProductDialog({ product }: DeleteProductDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const deleteProduct = useDeleteProduct();
  const router = useRouter();

  const handleDelete = async () => {
    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        setOpen(false);
        toast({
          title: "Berhasil",
          description: "Produk berhasil dihapus",
        });
      },
      onError: (error) => {
        console.error("Error deleting product:", error);
        toast({
          title: "Gagal",
          description:
            "Gagal menghapus produk. Produk mungkin masih digunakan dalam transaksi.",
          variant: "default",
        });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus produk{" "}
            <strong>{product.name}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteProduct.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
