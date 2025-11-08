"use client";

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
import { Pencil } from "lucide-react";
import { useUpdateTransaction } from "@/lib/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";

interface EditTransactionDialogProps {
  transaction: any;
}

export function EditTransactionDialog({ transaction }: EditTransactionDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    paymentStatus: transaction.paymentStatus || "unpaid",
    paidAmount: transaction.paidAmount?.toString() || "0",
    notes: transaction.notes || "",
  });

  const updateTransaction = useUpdateTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateTransaction.mutate(
      {
        id: transaction.id,
        data: {
          paymentStatus: formData.paymentStatus,
          paidAmount: formData.paidAmount,
          notes: formData.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast({ title: "Berhasil", description: "Transaksi berhasil diupdate" });
        },
        onError: (error) => {
          console.error("Error updating transaction:", error);
          toast({ title: "Gagal", description: "Gagal mengupdate transaksi", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <DialogDescription>Ubah status pembayaran, jumlah dibayar, atau catatan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-paymentStatus">Status Pembayaran</Label>
            <select
              id="edit-paymentStatus"
              className="w-full rounded-md border px-3 py-2 bg-background"
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
            >
              <option value="paid">Lunas</option>
              <option value="partial">Sebagian</option>
              <option value="unpaid">Belum Bayar</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-paidAmount">Jumlah Dibayar</Label>
            <Input
              id="edit-paidAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Catatan</Label>
            <Input
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={updateTransaction.isPending}>
              {updateTransaction.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


