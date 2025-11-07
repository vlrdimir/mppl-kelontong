import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { debts, customers, transactions, debtPayments } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const allDebts = await db.query.debts.findMany({
      with: {
        customer: true,
        transaction: true,
        debtPayments: true,
      },
      orderBy: [desc(debts.createdAt)],
    })

    return NextResponse.json(allDebts)
  } catch (error) {
    console.error("Error fetching debts:", error)
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, transactionId, totalDebt, paidAmount, remainingDebt, status } = body

    const newDebt = await db
      .insert(debts)
      .values({
        customerId,
        transactionId,
        totalDebt,
        paidAmount: paidAmount || "0",
        remainingDebt,
        status,
      })
      .returning()

    return NextResponse.json(newDebt[0], { status: 201 })
  } catch (error) {
    console.error("Error creating debt:", error)
    return NextResponse.json({ error: "Failed to create debt" }, { status: 500 })
  }
}
