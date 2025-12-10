## Ringkasan Halaman (bahasa santai)

- Login: masuk dulu biar data aman.
- Dashboard: lihat cepat profit, penjualan, stok terjual, transaksi, piutang, grafik, dan transaksi terbaru.
- Produk: kelola daftar barang & stok; harga beli/jual kepake buat hitung margin.
- Kategori: biar produk rapi dan gampang dicari.
- Pelanggan: simpan data buyer buat transaksi & piutang.
- Transaksi (Penjualan): input jualan multi-item, cek stok, set status bayar, cetak invoice, ekspor data.
- Piutang: pantau hutang, bayar cicil/lunas, cetak bukti pelunasan.
- Statistik (API/Dashboard): profit = (jual - beli) × qty; ada grafik penjualan harian & top produk.
- Ekspor & Cetak: ekspor transaksi (Excel/CSV/JSON), cetak invoice & bukti pelunasan.

## Alur Presentasi Cepat

1. Login singkat → tunjukin akses aman.
2. Dashboard → sorot angka kunci & grafik (profit harian/bulanan, penjualan, transaksi, piutang, recent).
3. Produk & Kategori → demo tambah/edit; tekankan stok + harga beli/jual buat margin.
4. Pelanggan → contoh tambah pelanggan.
5. Transaksi → bikin penjualan multi-item, lihat validasi stok & status bayar, cetak invoice.
6. Piutang → contoh transaksi kredit, bayar sebagian/penuh, cetak bukti pelunasan.
7. Ekspor → unduh transaksi (Excel/CSV/JSON).

## Catatan Teknis Ringkas

- Profit di dashboard = (harga jual - harga beli) × qty, dijumlah per periode.
- Nomor invoice: `INV-<2YYMMDD>-<seq 5 digit>`, reset per bulan.
- Stok otomatis berkurang saat penjualan; bisa ditambah lagi via transaksi purchase (kalau diaktifkan).
- API `/api/stats` nyuplai kartu & grafik dashboard; default filter bulan berjalan, bisa `range=today` untuk harian.
