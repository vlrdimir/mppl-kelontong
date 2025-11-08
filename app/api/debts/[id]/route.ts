import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { debts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const debt = await db.query.debts.findFirst({
      where: eq(debts.id, id),
      with: {
        customer: true,
        transaction: true,
        debtPayments: true,
      },
    })

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 })
    }

    return NextResponse.json(debt)
  } catch (error) {
    console.error("Error fetching debt:", error)
    return NextResponse.json({ error: "Failed to fetch debt" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { paidAmount, remainingDebt, status } = body

    const updatedDebt = await db
      .update(debts)
      .set({
        paidAmount,
        remainingDebt,
        status,
        updatedAt: new Date(),
      })
      .where(eq(debts.id, id))
      .returning()

    if (!updatedDebt.length) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 })
    }

    return NextResponse.json(updatedDebt[0])
  } catch (error) {
    console.error("Error updating debt:", error)
    return NextResponse.json({ error: "Failed to update debt" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deletedDebt = await db.delete(debts).where(eq(debts.id, id)).returning()

    if (!deletedDebt.length) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Debt deleted successfully" })
  } catch (error) {
    console.error("Error deleting debt:", error)
    return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 })
  }
}
