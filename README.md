# Sistem Informasi Inventaris dan Laporan Penjualan Warung Kelontong

Proyek ini adalah sistem informasi berbasis web yang dirancang untuk membantu pemilik warung kelontong dalam mengelola inventaris barang dan mencatat laporan penjualan harian. Aplikasi ini dibangun menggunakan Next.js dan berbagai teknologi modern lainnya untuk menyediakan antarmuka yang responsif dan fungsional.

**Proyek ini dikembangkan sebagai tugas akhir untuk mata kuliah Manajemen Proyek.**

## Fitur Utama

- **Dashboard Analitik**: Menampilkan ringkasan penjualan, produk terlaris, dan statistik penting lainnya.
- **Manajemen Produk**: Mengelola daftar produk, stok, harga beli, dan harga jual.
- **Pencatatan Transaksi**: Mencatat setiap transaksi penjualan secara detail.
- **Manajemen Pelanggan**: Menyimpan data pelanggan dan riwayat pembelian.
- **Catatan Utang**: Melacak utang pelanggan dan pembayaran yang telah dilakukan.
- **Otentikasi Pengguna**: Sistem login untuk mengamankan akses ke data.

## Struktur Folder

Berikut adalah struktur folder utama dari aplikasi ini:

```
/
├── app/                  # Direktori utama aplikasi (App Router)
│   ├── api/              # Rute API untuk backend
│   ├── dashboard/        # Halaman-halaman dashboard
│   ├── login/            # Halaman login
│   ├── globals.css       # File CSS global
│   └── layout.tsx        # Layout utama aplikasi
├── components/           # Komponen UI yang dapat digunakan kembali
├── lib/                  # Fungsi utilitas, hooks, dan konfigurasi database
│   ├── db/               # Skema Drizzle ORM dan koneksi database
│   ├── hooks/            # Custom hooks
│   └── ...
├── drizzle/              # File migrasi database
├── public/               # Aset statis (gambar, ikon, dll.)
├── server/               # Konfigurasi sisi server (misal: otentikasi)
├── package.json          # Daftar dependensi dan skrip proyek
└── ...
```

## Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Neon](https://neon.tech/) (PostgreSQL Serverless)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Otentikasi**: [NextAuth.js](https://next-auth.js.org/)
- **Manajemen State**: [Zustand](https://zustand-demo.pmnd.rs/), [React Query](https://tanstack.com/query/latest)
- **Formulir**: [React Hook Form](https://react-hook-form.com/)
- **Validasi Skema**: [Zod](https://zod.dev/)

## Skrip yang Tersedia

Dalam proyek ini, Anda dapat menjalankan beberapa skrip:

- `npm run dev`: Menjalankan server pengembangan.
- `npm run build`: Mem-build aplikasi untuk production.
- `npm run start`: Menjalankan build production.
- `npm run lint`: Menjalankan linter untuk memeriksa kualitas kode.
- `npm run db:generate`: Membuat file migrasi database berdasarkan skema.
- `npm run db:push`: Menerapkan perubahan skema ke database (untuk pengembangan).
- `npm run db:studio`: Membuka Drizzle Studio untuk melihat dan mengelola data.
