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
import { History } from "lucide-react";
import { useDebtPayments } from "@/lib/hooks/use-debts";
import type { Debt } from "@/lib/types";

interface DebtHistoryDialogProps {
  debt: Debt;
}

function DebtHistoryContent({ debt }: { debt: Debt }) {
  const { data: payments = [], isLoading, error } = useDebtPayments(debt.id);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Riwayat Pembayaran</DialogTitle>
        <DialogDescription>
          Riwayat pembayaran piutang {debt.customer?.name}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 py-4 border-y">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Hutang:</span>
          <span className="font-semibold">
            {formatCurrency(debt.totalDebt)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sudah Dibayar:</span>
          <span className="font-semibold text-emerald-600">
            {formatCurrency(debt.paidAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sisa Hutang:</span>
          <span className="font-bold text-red-600">
            {formatCurrency(debt.remainingDebt)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Riwayat Pembayaran</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Memuat riwayat...
          </p>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">
            Gagal memuat riwayat pembayaran.
          </p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Belum ada pembayaran
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {payments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-start justify-between border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.paymentDate)}
                  </p>
                  {payment.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      {payment.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function DebtHistoryDialog({ debt }: DebtHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-1" />
          Riwayat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        {open && <DebtHistoryContent debt={debt} />}
      </DialogContent>
    </Dialog>
  );
}
