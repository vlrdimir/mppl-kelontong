import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transactions, transactionItems } from "@/lib/db/schema"
import { eq, desc, count, and } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Build where clause
    const whereClause = type ? eq(transactions.type, type) : undefined

    // Get total count
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(transactions)
      .where(whereClause)

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
    })

    return NextResponse.json({
      data: allTransactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, customerId, totalAmount, paymentStatus, paidAmount, notes, items } = body

    // Start a transaction
    const newTransaction = await db.transaction(async (tx) => {
      // Insert transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          type,
          customerId,
          totalAmount,
          paymentStatus,
          paidAmount: paidAmount || "0",
          notes,
        })
        .returning()

      // Insert transaction items
      if (items && items.length > 0) {
        await tx.insert(transactionItems).values(
          items.map((item: any) => ({
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          }))
        )
      }

      return transaction
    })

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
