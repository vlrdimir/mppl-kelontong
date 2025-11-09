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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Pencil } from "lucide-react";
import { useUpdateTransaction } from "@/lib/hooks/use-transactions";
import { useCustomers } from "@/lib/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, Customer } from "@/lib/types";

interface EditTransactionDialogProps {
  transaction: Transaction;
}

export function EditTransactionDialog({
  transaction,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const { data: customersData } = useCustomers(false); // Fetch all customers
  const customers = customersData?.data || [];

  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [formData, setFormData] = useState({
    paymentStatus: transaction.paymentStatus || "unpaid",
    paidAmount: transaction.paidAmount?.toString() || "0",
    notes: transaction.notes || "",
    customerId: transaction.customerId || "",
  });

  const updateTransaction = useUpdateTransaction();

  const handleStatusChange = (newStatus: string) => {
    const newFormData = { ...formData, paymentStatus: newStatus };
    if (newStatus === "paid") {
      newFormData.customerId = ""; // Clear customer if paid
      newFormData.paidAmount = transaction.totalAmount.toString();
    } else {
      // If switching from paid to unpaid/partial, restore original customer
      if (transaction.customerId) {
        newFormData.customerId = transaction.customerId;
      }
    }
    if (newStatus === "unpaid") {
      newFormData.paidAmount = "0";
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentStatus !== "paid" && !formData.customerId) {
      toast({
        title: "Pelanggan Wajib Dipilih",
        description:
          "Untuk status 'Sebagian' atau 'Belum Bayar', pelanggan harus dipilih.",
        variant: "default",
      });
      return;
    }

    updateTransaction.mutate(
      {
        id: transaction.id,
        data: {
          paymentStatus: formData.paymentStatus,
          paidAmount: formData.paidAmount,
          notes: formData.notes || undefined,
          customerId: formData.customerId || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast({
            title: "Berhasil",
            description: "Transaksi berhasil diupdate",
          });
        },
        onError: (error) => {
          console.error("Error updating transaction:", error);
          toast({
            title: "Gagal",
            description: error.message,
          });
        },
      }
    );
  };

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

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
          <DialogDescription>
            Ubah status pembayaran, jumlah dibayar, atau catatan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-paymentStatus">Status Pembayaran</Label>
            <select
              id="edit-paymentStatus"
              className="w-full rounded-md border px-3 py-2 bg-background"
              value={formData.paymentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="paid">Lunas</option>
              <option value="partial">Sebagian</option>
              <option value="unpaid">Belum Bayar</option>
            </select>
          </div>

          {formData.paymentStatus !== "paid" && (
            <div className="space-y-2">
              <Label htmlFor="customer">Pelanggan</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                  >
                    {formData.customerId
                      ? customers.find(
                          (c: Customer) => c.id === formData.customerId
                        )?.name
                      : "Pilih pelanggan"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Cari pelanggan..."
                      value={customerSearch}
                      onValueChange={setCustomerSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {filteredCustomers.map((c: Customer) => (
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => {
                              setFormData({ ...formData, customerId: c.id });
                              setPopoverOpen(false);
                            }}
                          >
                            {c.name}
                            {c.phone ? ` - ${c.phone}` : ""}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-paidAmount">Jumlah Dibayar</Label>
            <Input
              id="edit-paidAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: e.target.value })
              }
              disabled={
                formData.paymentStatus === "unpaid" ||
                formData.paymentStatus === "paid"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Catatan</Label>
            <Input
              id="edit-notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
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
            <Button type="submit" disabled={updateTransaction.isPending}>
              {updateTransaction.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
