"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus } from "lucide-react"
import { useCreateCustomer } from "@/lib/hooks/use-customers"
import { useToast } from "@/hooks/use-toast"

export function AddCustomerDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })

  const createCustomer = useCreateCustomer()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    createCustomer.mutate(
      {
        name: formData.name,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            name: "",
            phone: "",
            address: "",
          })
          setOpen(false)
          toast({
            title: "Berhasil",
            description: "Pelanggan berhasil ditambahkan",
          })
        },
        onError: (error) => {
          console.error("Error adding customer:", error)
          toast({
            title: "Gagal",
            description: "Gagal menambahkan pelanggan",
            variant: "destructive",
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          <DialogDescription>Masukkan informasi pelanggan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nama Pelanggan *</Label>
            <Input
              id="customer-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone">Nomor Telepon</Label>
            <Input
              id="customer-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-address">Alamat</Label>
            <Textarea
              id="customer-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
