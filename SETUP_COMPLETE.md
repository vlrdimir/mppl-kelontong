# Setup Lengkap - Warung Sales Dashboard

## ✅ Yang Sudah Selesai

### 1. **Migrasi Database: Supabase → Drizzle ORM + Neon**
   - ✅ Install dependencies (drizzle-orm, @neondatabase/serverless, drizzle-kit)
   - ✅ Schema Drizzle lengkap dengan relasi ([lib/db/schema.ts](lib/db/schema.ts))
   - ✅ Database connection ([lib/db/index.ts](lib/db/index.ts))
   - ✅ Drizzle config ([drizzle.config.ts](drizzle.config.ts))
   - ✅ Seed script dengan data dummy ([lib/db/seed.ts](lib/db/seed.ts))

### 2. **API Routes Lengkap**
   - ✅ `/api/products` - GET, POST
   - ✅ `/api/products/[id]` - GET, PATCH, DELETE
   - ✅ `/api/customers` - GET, POST
   - ✅ `/api/customers/[id]` - GET, PATCH, DELETE
   - ✅ `/api/transactions` - GET, POST (with items)
   - ✅ `/api/transactions/[id]` - GET, PATCH, DELETE
   - ✅ `/api/debts` - GET, POST
   - ✅ `/api/debts/[id]` - GET, PATCH, DELETE
   - ✅ `/api/debt-payments` - POST (with automatic debt update)

### 3. **TanStack Query Integration**
   - ✅ QueryProvider setup ([components/providers/query-provider.tsx](components/providers/query-provider.tsx))
   - ✅ Custom hooks untuk mutations:
     - [lib/hooks/use-products.ts](lib/hooks/use-products.ts)
     - [lib/hooks/use-customers.ts](lib/hooks/use-customers.ts)
     - [lib/hooks/use-transactions.ts](lib/hooks/use-transactions.ts)
     - [lib/hooks/use-debts.ts](lib/hooks/use-debts.ts)

### 4. **Pages dengan TanStack Query**
   - ✅ [app/debts/page-client.tsx](app/debts/page-client.tsx)
   - ✅ [app/products/page-client.tsx](app/products/page-client.tsx)
   - ✅ [app/transactions/page-client.tsx](app/transactions/page-client.tsx)

### 5. **Components Updated** (Supabase client removed)
   - ✅ [components/add-customer-dialog.tsx](components/add-customer-dialog.tsx) - useCreateCustomer()
   - ✅ [components/add-product-dialog.tsx](components/add-product-dialog.tsx) - useCreateProduct()
   - ✅ [components/delete-product-dialog.tsx](components/delete-product-dialog.tsx) - useDeleteProduct()
   - ✅ [components/edit-product-dialog.tsx](components/edit-product-dialog.tsx) - useUpdateProduct()

## ⚠️ Perlu Update Manual

Dua file berikut masih menggunakan Supabase client dan perlu diupdate manual:

### 1. **components/pay-debt-dialog.tsx**
Ganti dengan:
```tsx
import { useCreateDebtPayment } from "@/lib/hooks/use-debts"
import { useToast } from "@/hooks/use-toast"

// Di dalam component:
const { toast } = useToast()
const createPayment = useCreateDebtPayment()

// Di handleSubmit:
createPayment.mutate(
  {
    debtId: debt.id,
    amount: amount,
    notes: notes || undefined,
  },
  {
    onSuccess: () => {
      setAmount("")
      setNotes("")
      setOpen(false)
      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil dicatat",
      })
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: "Gagal mencatat pembayaran",
        variant: "destructive",
      })
    },
  }
)
```

### 2. **components/transaction-form.tsx**
Ganti dengan:
```tsx
import { useCreateTransaction } from "@/lib/hooks/use-transactions"
import { useToast } from "@/hooks/use-toast"

// Di dalam component:
const { toast } = useToast()
const createTransaction = useCreateTransaction()

// Di handleSubmit:
const totalAmount = calculateTotal()
const finalPaidAmount = paymentStatus === "paid" ? totalAmount : paymentStatus === "partial" ? paidAmount : 0

createTransaction.mutate(
  {
    type: "sale",
    totalAmount: totalAmount.toString(),
    paymentStatus,
    paidAmount: finalPaidAmount.toString(),
    notes,
    items: items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price.toString(),
      subtotal: (item.quantity * item.price).toString(),
    })),
  },
  {
    onSuccess: () => {
      setNotes("")
      setItems([{ productId: "", quantity: 1, price: 0 }])
      setProductSearch("")
      setPaymentStatus("paid")
      setPaidAmount(0)
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil disimpan",
      })
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: "Gagal membuat transaksi",
        variant: "destructive",
      })
    },
  }
)
```

### 3. **app/page.tsx**
Perlu diubah dari server component yang fetch data dari Supabase menjadi client component dengan TanStack Query

## 📝 Cara Setup

### 1. Setup Neon Database
```bash
# Buat database di https://console.neon.tech/
# Copy connection string ke .env

DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
```

### 2. Push Schema ke Database
```bash
npm run db:push
```

### 3. Seed Database dengan Data Dummy
```bash
npm run db:seed
```

### 4. Jalankan Development Server
```bash
npm run dev
```

## 🎯 NPM Scripts Tersedia

```json
{
  "db:generate": "drizzle-kit generate",  // Generate migrations
  "db:migrate": "drizzle-kit migrate",    // Run migrations
  "db:push": "drizzle-kit push",          // Push schema to DB
  "db:studio": "drizzle-kit studio",      // Open Drizzle Studio GUI
  "db:seed": "tsx lib/db/seed.ts"         // Seed dummy data
}
```

## 📊 Data Dummy yang Tersedia

Seed script akan membuat:
- **20 produk** (Indomie, Aqua, Beras, dll)
- **8 pelanggan**
- **7 transaksi** dengan items
- **3 piutang** (2 belum lunas, 1 dengan partial payment)

## 🔄 Perubahan Arsitektur

### Sebelum:
```
Page (Server Component) → Supabase Direct Query → UI
```

### Sesudah:
```
Page (Client Component) → TanStack Query → API Route → Drizzle ORM → Neon DB → UI
```

## 🎨 Benefits

1. **Type Safety** - Full TypeScript support dengan Drizzle ORM
2. **Caching** - Automatic caching dengan TanStack Query
3. **Loading States** - Built-in loading & error states
4. **Optimistic Updates** - Siap untuk optimistic UI updates
5. **Scalability** - Clean separation dengan API routes
6. **Developer Experience** - Drizzle Studio untuk database GUI

## 🚀 Next Steps (Opsional)

1. Install React Query DevTools untuk debugging
2. Implement optimistic updates untuk better UX
3. Add pagination untuk large datasets
4. Add search & filtering di API routes
5. Implement authentication
6. Deploy ke Vercel + Neon

## 📚 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Neon Database Docs](https://neon.tech/docs/introduction)
