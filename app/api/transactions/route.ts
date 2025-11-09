import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  transactions,
  transactionItems,
  debts,
  products,
} from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import auth from "@/proxy";

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

    const [transaction] = await db
      .insert(transactions)
      .values({
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
          await db.insert(debts).values({
            customerId: transaction.customerId!,
            transactionId: transaction.id,
            totalDebt: transaction.totalAmount,
            paidAmount: transaction.paidAmount ?? "0",
            remainingDebt: String(remaining),
            status: debtStatus,
          });
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
