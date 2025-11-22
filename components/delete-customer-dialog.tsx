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
import { useDeleteCustomer } from "@/lib/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";

export function DeleteCustomerDialog({ customer }: { customer: any }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = async () => {
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Berhasil", description: "Pelanggan berhasil dihapus" });
      },
      onError: () => {
        toast({
          title: "Gagal",
          description: "Gagal menghapus pelanggan",
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
          <AlertDialogTitle>Hapus Pelanggan?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{customer.name}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
          >
            {deleteCustomer.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
