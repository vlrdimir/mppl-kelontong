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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Search } from "lucide-react";
import { useCreateTransaction } from "@/lib/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  products: any[];
}

interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
}

export function TransactionForm({ products }: TransactionFormProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<TransactionItem[]>([
    { productId: "", quantity: 1, price: 0 },
  ]);
  const [productSearch, setProductSearch] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<
    "paid" | "partial" | "unpaid"
  >("paid");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const createTransaction = useCreateTransaction();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
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
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        // Support both camelCase and snake_case
        newItems[index].price =
          product.sellingPrice || product.selling_price || 0;
      }
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

    createTransaction.mutate(
      {
        type: "sale",
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
          setItems([{ productId: "", quantity: 1, price: 0 }]);
          setProductSearch("");
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
            description: "Gagal membuat transaksi",
            variant: "destructive",
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Item Transaksi</Label>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg">
                <div className="space-y-2">
                  <Label>Cari Produk</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ketik nama produk..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] items-end">
                  <div className="space-y-2">
                    <Label>Produk</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value: string) =>
                        updateItem(index, "productId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Produk tidak ditemukan
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Stok: {product.stock})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          Number.parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Harga</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "price",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-status">Status Pembayaran</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value: any) => setPaymentStatus(value)}
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
