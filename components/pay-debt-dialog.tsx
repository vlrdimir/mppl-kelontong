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
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";
import { useCreateDebtPayment } from "@/lib/hooks/use-debts";
import { useToast } from "@/hooks/use-toast";

interface PayDebtDialogProps {
  debt: any;
}

export function PayDebtDialog({ debt }: PayDebtDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const createPayment = useCreateDebtPayment();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentAmount = Number.parseFloat(amount);
    const remainingDebt = Number(
      debt.remainingDebt || debt.remaining_debt || 0
    );

    if (paymentAmount <= 0 || paymentAmount > remainingDebt) {
      toast({
        title: "Gagal",
        description: "Jumlah pembayaran tidak valid",
        variant: "destructive",
      });
      return;
    }

    createPayment.mutate(
      {
        debtId: debt.id,
        amount: amount,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setAmount("");
          setNotes("");
          setOpen(false);
          toast({
            title: "Berhasil",
            description: "Pembayaran berhasil dicatat",
          });
        },
        onError: (error) => {
          console.error("Error recording payment:", error);
          toast({
            title: "Gagal",
            description: "Gagal mencatat pembayaran",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handlePayFull = () => {
    const remainingDebt = debt.remainingDebt || debt.remaining_debt || 0;
    setAmount(remainingDebt.toString());
  };

  const totalDebt = Number(debt.totalDebt || debt.total_debt || 0);
  const paidAmount = Number(debt.paidAmount || debt.paid_amount || 0);
  const remainingDebt = Number(debt.remainingDebt || debt.remaining_debt || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <DollarSign className="h-4 w-4 mr-1" />
          Bayar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran</DialogTitle>
          <DialogDescription>
            Catat pembayaran piutang dari {debt.customer?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4 border-y">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Hutang:</span>
            <span className="font-semibold">{formatCurrency(totalDebt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sudah Dibayar:</span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(paidAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sisa Hutang:</span>
            <span className="font-bold text-red-600">
              {formatCurrency(remainingDebt)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran *</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                min="0"
                max={remainingDebt}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
              <Button type="button" variant="outline" onClick={handlePayFull}>
                Lunas
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maksimal: {formatCurrency(remainingDebt)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan pembayaran..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
