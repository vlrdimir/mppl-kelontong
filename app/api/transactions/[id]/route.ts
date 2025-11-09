import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, debts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: {
        transactionItems: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus, paidAmount, notes, customerId } = body as Partial<{
      paymentStatus: string;
      paidAmount: string;
      notes: string;
      customerId: string;
    }>;

    // Ambil transaksi saat ini untuk validasi
    const current = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
    });
    if (!current) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Calon nilai baru
    const newStatus =
      typeof paymentStatus !== "undefined"
        ? paymentStatus
        : (current.paymentStatus as string);
    const newPaid =
      typeof paidAmount !== "undefined"
        ? Number(paidAmount)
        : Number(current.paidAmount ?? 0);
    const total = Number(current.totalAmount ?? 0);

    // Validasi
    if (!Number.isFinite(newPaid) || newPaid < 0) {
      return NextResponse.json(
        { error: "Paid amount tidak valid" },
        { status: 400 }
      );
    }
    if (newPaid > total) {
      return NextResponse.json(
        { error: "Paid amount tidak boleh melebihi total" },
        { status: 400 }
      );
    }
    if (newStatus === "paid" && newPaid !== total) {
      return NextResponse.json(
        { error: "Status Lunas mengharuskan jumlah bayar = total" },
        { status: 400 }
      );
    }
    if (newStatus === "unpaid" && newPaid !== 0) {
      return NextResponse.json(
        { error: "Status Belum Bayar mengharuskan jumlah bayar = 0" },
        { status: 400 }
      );
    }
    if (newStatus === "partial" && (newPaid <= 0 || newPaid >= total)) {
      return NextResponse.json(
        { error: "Status Sebagian mengharuskan 0 < jumlah bayar < total" },
        { status: 400 }
      );
    }
    if (newStatus !== "paid" && !customerId) {
      return NextResponse.json(
        { error: "Pelanggan wajib diisi untuk status selain lunas" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    updates.paymentStatus = newStatus;
    updates.paidAmount = String(newPaid);
    if (typeof notes !== "undefined") updates.notes = notes;
    if (typeof customerId !== "undefined") {
      updates.customerId = customerId || null;
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updates as any)
      .where(eq(transactions.id, id))
      .returning();

    if (!updatedTransaction.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const trx = updatedTransaction[0];

    // Sinkronisasi piutang terkait transaksi ini
    if (trx) {
      const total = Number(trx.totalAmount ?? 0);
      const paid = Number(trx.paidAmount ?? 0);
      const remaining = Math.max(total - paid, 0);
      const debtStatus =
        remaining <= 0 ? "paid" : paid > 0 ? "partial" : "unpaid";

      const existingDebt = await db.query.debts.findFirst({
        where: eq(debts.transactionId, id),
      });

      if (remaining > 0 && trx.customerId) {
        // Jika ada sisa piutang DAN pelanggan terhubung
        if (existingDebt) {
          await db
            .update(debts)
            .set({
              customerId: trx.customerId, // Update customerId in debt
              paidAmount: String(paid),
              remainingDebt: String(remaining),
              status: debtStatus,
              updatedAt: new Date(),
            })
            .where(eq(debts.id, existingDebt.id));
        } else {
          await db.insert(debts).values({
            customerId: trx.customerId,
            transactionId: trx.id,
            totalDebt: trx.totalAmount,
            paidAmount: String(paid),
            remainingDebt: String(remaining),
            status: debtStatus,
          });
        }
      } else if (existingDebt) {
        // Jika tidak ada sisa, tandai piutang lunas atau hapus
        // Dalam kasus ini, kita set lunas
        await db
          .update(debts)
          .set({
            paidAmount: String(paid),
            remainingDebt: "0",
            status: "paid",
            updatedAt: new Date(),
          })
          .where(eq(debts.id, existingDebt.id));
      }
    }

    return NextResponse.json(trx);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedTransaction = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();

    if (!deletedTransaction.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
