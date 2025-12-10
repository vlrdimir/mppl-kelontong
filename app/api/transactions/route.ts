import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  transactions,
  transactionItems,
  debts,
  debtPayments,
  products,
  invoiceSequences,
} from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import auth from "@/proxy";

const formatDateStr = (date: Date) => {
  const yy = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // Format khusus: 2 + YYMMDD, contoh 2025-12-10 => 2251210
  return `2${yy}${month}${day}`;
};

// Periode bulanan (YYYYMM01) dipakai sebagai kunci reset sequence
const getMonthPeriod = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}01`;
};

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = type ? eq(transactions.type, type) : undefined;

    // Get total count
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(transactions)
      .where(whereClause);

    // Get paginated transactions
    const allTransactions = await db.query.transactions.findMany({
      where: whereClause,
      with: {
        customer: true,
        transactionItems: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(transactions.transactionDate)],
      limit: limit,
      offset: offset,
    });

    const normalized = allTransactions.map((trx: any) => ({
      ...trx,
      // Pastikan tanggal berupa string ISO
      transactionDate: trx.transactionDate
        ? new Date(trx.transactionDate).toISOString()
        : null,
      // Pastikan numeric-like menjadi number
      totalAmount: Number(trx.totalAmount ?? 0),
      paidAmount: Number(trx.paidAmount ?? 0),
      // transactionItems selalu array dan tiap item dinormalisasi
      transactionItems: Array.isArray(trx.transactionItems)
        ? trx.transactionItems.map((it: any) => ({
            ...it,
            quantity: Number(it.quantity ?? 0),
            price: Number(it.price ?? 0),
            subtotal: Number(it.subtotal ?? 0),
            product: it.product
              ? {
                  ...it.product,
                  purchasePrice: Number(it.product.purchasePrice ?? 0),
                }
              : undefined,
          }))
        : [],
    }));

    return NextResponse.json({
      data: normalized,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      type,
      customerId,
      totalAmount,
      paymentStatus,
      paidAmount,
      notes,
      items,
    } = body;

    // Validasi input dasar
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Item transaksi tidak boleh kosong" },
        { status: 400 }
      );
    }
    const totalNum = Number(totalAmount);
    const paidNum = Number(paidAmount ?? 0);
    if (!Number.isFinite(totalNum) || totalNum < 0) {
      return NextResponse.json(
        { error: "Total amount tidak valid" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(paidNum) || paidNum < 0) {
      return NextResponse.json(
        { error: "Paid amount tidak valid" },
        { status: 400 }
      );
    }
    if (paidNum > totalNum) {
      return NextResponse.json(
        { error: "Paid amount tidak boleh melebihi total" },
        { status: 400 }
      );
    }
    if (paymentStatus === "paid" && paidNum !== totalNum) {
      return NextResponse.json(
        { error: "Status Lunas mengharuskan jumlah bayar = total" },
        { status: 400 }
      );
    }
    if (paymentStatus === "unpaid" && paidNum !== 0) {
      return NextResponse.json(
        { error: "Status Belum Bayar mengharuskan jumlah bayar = 0" },
        { status: 400 }
      );
    }
    if (paymentStatus === "partial") {
      if (paidNum <= 0 || paidNum >= totalNum) {
        return NextResponse.json(
          { error: "Status Sebagian mengharuskan 0 < jumlah bayar < total" },
          { status: 400 }
        );
      }
    }
    if (
      (paymentStatus === "partial" || paymentStatus === "unpaid") &&
      !customerId
    ) {
      return NextResponse.json(
        { error: "Pelanggan wajib diisi untuk transaksi belum/lunas sebagian" },
        { status: 400 }
      );
    }

    // Backend stock validation
    for (const item of items) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId),
      });

      if (!product) {
        return NextResponse.json(
          { error: `Produk dengan ID ${item.productId} tidak ditemukan` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stok untuk ${product.name} tidak mencukupi. Sisa stok: ${product.stock}`,
          },
          { status: 400 }
        );
      }
    }

    // 1) Ambil nomor invoice bulanan (reset tiap awal bulan) dengan padding 5 digit
    const now = new Date();
    const period = getMonthPeriod(now); // contoh: 20251201 untuk Des 2025
    const dateStr = formatDateStr(now); // tanggal aktual untuk ditampilkan

    const [seq] = await db
      .insert(invoiceSequences)
      .values({ period, lastSeq: 1 })
      .onConflictDoUpdate({
        target: invoiceSequences.period,
        set: { lastSeq: sql`${invoiceSequences.lastSeq} + 1` },
      })
      .returning({ lastSeq: invoiceSequences.lastSeq });

    const invoiceCode = `INV-${dateStr}-${String(seq.lastSeq).padStart(
      5,
      "0"
    )}`;

    const [transaction] = await db
      .insert(transactions)
      .values({
        invoiceCode,
        type,
        customerId,
        totalAmount,
        paymentStatus,
        paidAmount: paidAmount || "0",
        notes,
      })
      .returning();

    try {
      if (items && items.length > 0) {
        // 1) Simpan item transaksi
        await db.insert(transactionItems).values(
          items.map((item: any) => ({
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          }))
        );

        // 2) Update stok produk
        //   - Jika type === 'sale' kurangi stok
        //   - Jika type === 'purchase' tambah stok (jika nanti dibutuhkan)
        await Promise.all(
          items.map(async (item: any) => {
            const prod = await db.query.products.findFirst({
              where: eq(products.id, item.productId),
            });
            if (!prod) return;
            const qty = Number(item.quantity ?? 0);
            const current = Number(prod.stock ?? 0);
            const newStock =
              transaction.type === "sale"
                ? Math.max(0, current - qty)
                : current + qty;
            await db
              .update(products)
              .set({ stock: newStock, updatedAt: new Date() })
              .where(eq(products.id, prod.id));
          })
        );
      }

      // Sinkronisasi piutang (debts) berdasarkan status pembayaran
      const total = Number(transaction.totalAmount ?? 0);
      const paid = Number(transaction.paidAmount ?? 0);
      const remaining = Math.max(total - paid, 0);
      const debtStatus =
        remaining <= 0 ? "paid" : paid > 0 ? "partial" : "unpaid";

      if (remaining > 0 || debtStatus === "paid") {
        // Jika remaining > 0 buat piutang; jika paid, kita tidak buat piutang, namun pola ini menjaga konsistensi jika UI ingin menampilkan status
        if (remaining > 0) {
          const [newDebt] = await db
            .insert(debts)
            .values({
              customerId: transaction.customerId!,
              transactionId: transaction.id,
              totalDebt: transaction.totalAmount,
              paidAmount: transaction.paidAmount ?? "0",
              remainingDebt: String(remaining),
              status: debtStatus,
            })
            .returning();

          // Jika status adalah partial atau paid dan ada pembayaran, buat debt payment entry
          if (
            newDebt &&
            (debtStatus === "partial" || debtStatus === "paid") &&
            paid > 0
          ) {
            await db.insert(debtPayments).values({
              debtId: newDebt.id,
              amount: String(paid),
              paymentDate: transaction.transactionDate || new Date(),
              notes: transaction.notes || "-",
            });
          }
        }
      }
    } catch (itemsError) {
      // Best-effort rollback: hapus transaksi jika insert items gagal
      try {
        await db
          .delete(transactions)
          .where(eq(transactions.id, transaction.id));
      } catch (_) {
        // ignore cleanup failure
      }
      throw itemsError;
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
