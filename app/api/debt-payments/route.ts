import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { debtPayments, debts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { debtId, amount, notes } = body

    // Use a transaction to update both debt_payments and debts
    const result = await db.transaction(async (tx) => {
      // Insert payment record
      const [payment] = await tx
        .insert(debtPayments)
        .values({
          debtId,
          amount,
          notes,
        })
        .returning()

      // Get current debt info
      const debt = await tx.query.debts.findFirst({
        where: eq(debts.id, debtId),
      })

      if (!debt) {
        throw new Error("Debt not found")
      }

      // Calculate new paid amount and remaining debt
      const newPaidAmount = Number(debt.paidAmount) + Number(amount)
      const newRemainingDebt = Number(debt.totalDebt) - newPaidAmount

      // Determine new status
      let newStatus: "unpaid" | "partial" | "paid" = "partial"
      if (newRemainingDebt <= 0) {
        newStatus = "paid"
      } else if (newPaidAmount === 0) {
        newStatus = "unpaid"
      }

      // Update debt record
      const [updatedDebt] = await tx
        .update(debts)
        .set({
          paidAmount: newPaidAmount.toString(),
          remainingDebt: Math.max(0, newRemainingDebt).toString(),
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(debts.id, debtId))
        .returning()

      return { payment, debt: updatedDebt }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating debt payment:", error)
    return NextResponse.json({ error: "Failed to create debt payment" }, { status: 500 })
  }
}
