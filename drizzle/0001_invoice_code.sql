-- Tambah tabel sequence harian untuk invoice
CREATE TABLE IF NOT EXISTS "invoice_seq" (
  "period" text PRIMARY KEY NOT NULL,
  "last_seq" integer NOT NULL,
  "updated_at" timestamptz DEFAULT now()
);

-- Tambah kolom kode invoice pada transaksi (sementara nullable untuk migrasi aman)
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "invoice_code" text;

-- Isi kode invoice lama agar unik dengan pola dasar INV-YYYYMMDD-<id berpadding>
UPDATE "transactions"
SET "invoice_code" = CONCAT(
  'INV-',
  to_char(COALESCE("transaction_date", now()), 'YYYYMMDD'),
  '-',
  LPAD("id"::text, 5, '0')
)
WHERE "invoice_code" IS NULL;

-- Set not null dan unique index
ALTER TABLE "transactions" ALTER COLUMN "invoice_code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_invoice_code_unique" ON "transactions" ("invoice_code");

