"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronsUpDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Search } from "lucide-react";
import { TransactionItemRow } from "./transaction-item-row";
import { useCreateTransaction } from "@/lib/hooks/use-transactions";
import { useCustomers } from "@/lib/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/lib/types";

interface TransactionFormProps {
  products: {
    id: string;
    name: string;
    category: string;
    stock: number;
    purchasePrice: string;
    sellingPrice: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
  productSearch: string;
  isPopoverOpen: boolean;
}

export function TransactionForm({ products }: TransactionFormProps) {
  const { toast } = useToast();
  const { data: customersData } = useCustomers(false); // Fetch all
  const customers = customersData?.data || [];
  const [notes, setNotes] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<TransactionItem[]>([
    {
      productId: "",
      quantity: 1,
      price: 0,
      productSearch: "",
      isPopoverOpen: false,
    },
  ]);
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "paid" | "partial" | "unpaid"
  >("paid");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const createTransaction = useCreateTransaction();

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        price: 0,
        productSearch: "",
        isPopoverOpen: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof TransactionItem,
    value: any
  ) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };

    if (field === "quantity") {
      const product = products.find((p) => p.id === currentItem.productId);
      if (product && value > product.stock) {
        toast({
          title: "Stok tidak mencukupi",
          description: `Stok ${product.name} hanya tersisa ${product.stock}.`,
          variant: "default",
        });
        currentItem.quantity = product.stock;
      } else {
        currentItem.quantity = value;
      }
    } else {
      (currentItem as any)[field] = value;
    }

    newItems[index] = currentItem;

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].price = Number(product.sellingPrice) || 0;
        newItems[index].quantity = 1; // Reset quantity
        newItems[index].isPopoverOpen = false; // Close popover
        newItems[index].productSearch = ""; // Clear search
      }
    } else if (field === "productSearch") {
      newItems[index].isPopoverOpen = true;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalAmount = calculateTotal();
    const finalPaidAmount =
      paymentStatus === "paid"
        ? totalAmount
        : paymentStatus === "partial"
        ? paidAmount
        : 0;

    // Validasi: status "unpaid/partial" wajib pilih pelanggan
    if (
      (paymentStatus === "partial" || paymentStatus === "unpaid") &&
      !customerId
    ) {
      toast({
        title: "Pelanggan wajib dipilih",
        description: "Pilih pelanggan untuk transaksi belum/lunas sebagian.",
        variant: "default",
      });
      return;
    }

    createTransaction.mutate(
      {
        type: "sale",
        customerId: customerId || undefined,
        totalAmount: totalAmount.toString(),
        paymentStatus,
        paidAmount: finalPaidAmount.toString(),
        notes: notes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
          subtotal: (item.quantity * item.price).toString(),
        })),
      },
      {
        onSuccess: () => {
          // Reset form
          setNotes("");
          setCustomerId("");
          setItems([
            {
              productId: "",
              quantity: 1,
              price: 0,
              productSearch: "",
              isPopoverOpen: false,
            },
          ]);
          setPaymentStatus("paid");
          setPaidAmount(0);
          toast({
            title: "Berhasil",
            description: "Transaksi berhasil disimpan",
          });
        },
        onError: (error) => {
          console.error("Error creating transaction:", error);
          toast({
            title: "Gagal",
            description: error.message || "Gagal menyimpan transaksi",
            variant: "default",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catat Penjualan</CardTitle>
        <CardDescription>Tambahkan transaksi penjualan baru</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="payment-status">Status Pembayaran</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value: any) => {
                setPaymentStatus(value);
                if (value === "paid") {
                  setCustomerId("");
                  setPaidAmount(calculateTotal());
                }
                if (value === "unpaid") {
                  setPaidAmount(0);
                }
              }}
            >
              <SelectTrigger id="payment-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="partial">Sebagian</SelectItem>
                <SelectItem value="unpaid">Belum Bayar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(paymentStatus === "partial" || paymentStatus === "unpaid") && (
            <div className="space-y-2">
              <Label htmlFor="customer">Pelanggan</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {customerId
                      ? customers.find((c: Customer) => c.id === customerId)
                          ?.name
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
                              setCustomerId(c.id === customerId ? "" : c.id);
                              setOpen(false);
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Item Transaksi</Label>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>

            {items.map((item, index) => (
              <TransactionItemRow
                key={index}
                item={item}
                index={index}
                products={products}
                updateItem={updateItem}
                removeItem={removeItem}
                isOnlyItem={items.length === 1}
              />
            ))}
          </div>

          {paymentStatus === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="paid-amount">Jumlah Dibayar</Label>
              <Input
                id="paid-amount"
                type="number"
                min="0"
                max={calculateTotal()}
                value={paidAmount}
                onChange={(e) =>
                  setPaidAmount(Number.parseFloat(e.target.value) || 0)
                }
                placeholder="Masukkan jumlah yang dibayar"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan atau keterangan pelanggan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(calculateTotal())}
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={
                createTransaction.isPending || items.some((i) => !i.productId)
              }
            >
              {createTransaction.isPending
                ? "Menyimpan..."
                : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
