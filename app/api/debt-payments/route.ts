import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debtPayments, debts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import auth from "@/proxy";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { debtId, amount, notes } = body as {
      debtId: string;
      amount: string;
      notes?: string;
    };

    // PERUBAHAN: Neon HTTP driver tidak mendukung db.transaction.
    // Lakukan langkah berurutan dan cleanup manual jika update debt gagal.

    // 1) Insert payment record
    const [payment] = await db
      .insert(debtPayments)
      .values({ debtId, amount, notes })
      .returning();

    try {
      // 2) Ambil data debt saat ini
      const currentDebt = await db.query.debts.findFirst({
        where: eq(debts.id, debtId),
      });
      if (!currentDebt) {
        // Hapus payment jika debt tidak ditemukan (best-effort cleanup)
        try {
          await db.delete(debtPayments).where(eq(debtPayments.id, payment.id));
        } catch {}
        return NextResponse.json({ error: "Debt not found" }, { status: 404 });
      }

      // 3) Validasi dan hitung nilai baru
      const amt = Number(amount ?? 0);
      if (!Number.isFinite(amt) || amt <= 0) {
        // Cleanup payment karena input tidak valid
        try {
          await db.delete(debtPayments).where(eq(debtPayments.id, payment.id));
        } catch {}
        return NextResponse.json(
          { error: "Jumlah pembayaran harus lebih dari 0" },
          { status: 400 }
        );
      }
      const remainingBefore = Math.max(
        0,
        Number(currentDebt.remainingDebt ?? 0)
      );
      if (amt > remainingBefore) {
        // Cleanup payment karena melebihi sisa hutang
        try {
          await db.delete(debtPayments).where(eq(debtPayments.id, payment.id));
        } catch {}
        return NextResponse.json(
          { error: "Jumlah pembayaran melebihi sisa hutang" },
          { status: 400 }
        );
      }

      const newPaidAmount = Number(currentDebt.paidAmount ?? 0) + amt;
      const newRemainingDebt =
        Number(currentDebt.totalDebt ?? 0) - newPaidAmount;
      const newStatus: "unpaid" | "partial" | "paid" =
        newRemainingDebt <= 0
          ? "paid"
          : newPaidAmount > 0
          ? "partial"
          : "unpaid";

      // 4) Update record debt
      const [updatedDebt] = await db
        .update(debts)
        .set({
          paidAmount: String(newPaidAmount),
          remainingDebt: String(Math.max(0, newRemainingDebt)),
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(debts.id, debtId))
        .returning();

      return NextResponse.json({ payment, debt: updatedDebt }, { status: 201 });
    } catch (updateError) {
      // Cleanup: hapus payment jika update debt gagal
      try {
        await db.delete(debtPayments).where(eq(debtPayments.id, payment.id));
      } catch {}
      throw updateError;
    }
  } catch (error) {
    console.error("Error creating debt payment:", error);
    return NextResponse.json(
      { error: "Failed to create debt payment" },
      { status: 500 }
    );
  }
}
