"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronsUpDown, Trash2 } from "lucide-react";
import type { TransactionItem } from "./transaction-form";

interface Product {
  id: number;
  name: string;
  stock: number;
  sellingPrice: string;
}

interface TransactionItemRowProps {
  item: TransactionItem;
  index: number;
  products: Product[];
  updateItem: (index: number, field: keyof TransactionItem, value: any) => void;
  removeItem: (index: number) => void;
  isOnlyItem: boolean;
}

export function TransactionItemRow({
  item,
  index,
  products,
  updateItem,
  removeItem,
  isOnlyItem,
}: TransactionItemRowProps) {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(item.productSearch.toLowerCase())
  );

  return (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] items-end border p-4 rounded-lg">
      <div className="space-y-2">
        <Label>Produk</Label>
        <Popover
          open={item.isPopoverOpen}
          onOpenChange={(isOpen) => updateItem(index, "isPopoverOpen", isOpen)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={item.isPopoverOpen}
              className="w-full justify-between"
            >
              {item.productId
                ? products.find((p) => p.id === item.productId)?.name
                : "Pilih produk"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Cari produk..."
                value={item.productSearch}
                onValueChange={(value: string) =>
                  updateItem(index, "productSearch", value)
                }
              />
              <CommandList>
                <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      disabled={product.stock === 0}
                      onSelect={() => {
                        if (product.stock === 0) return;
                        updateItem(index, "productId", product.id);
                      }}
                    >
                      {product.name} (Stok: {product.stock})
                      {product.stock === 0 && " - Habis"}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>Jumlah</Label>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) =>
            updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)
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
            updateItem(index, "price", Number.parseFloat(e.target.value) || 0)
          }
        />
      </div>
      {!isOnlyItem && (
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
  );
}
