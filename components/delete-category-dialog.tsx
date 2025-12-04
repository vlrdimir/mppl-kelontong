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
import { useDeleteCategory } from "@/lib/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";

interface DeleteCategoryDialogProps {
  category: Category;
}

export function DeleteCategoryDialog({ category }: DeleteCategoryDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const deleteCategory = useDeleteCategory();

  const handleDelete = async () => {
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        setOpen(false);
        toast({
          title: "Berhasil",
          description: "Kategori berhasil dihapus",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Gagal",
          description:
            error.message ||
            "Gagal menghapus kategori. Kategori mungkin masih digunakan oleh produk.",
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
          <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kategori{" "}
            <strong>{category.name}</strong>? Tindakan ini tidak dapat
            dibatalkan.
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Catatan: Kategori tidak dapat dihapus jika masih digunakan oleh
              produk.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteCategory.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
