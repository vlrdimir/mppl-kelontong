import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debts } from "@/lib/db/schema";
import { eq, desc, count, and, or, not } from "drizzle-orm";
import auth from "@/proxy";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // 'paid' or 'unpaid'
    const offset = (page - 1) * limit;

    let whereCondition;
    if (status === "paid") {
      whereCondition = eq(debts.status, "paid");
    } else if (status === "unpaid") {
      whereCondition = not(eq(debts.status, "paid"));
    }

    const totalCountQuery = db
      .select({ value: count() })
      .from(debts)
      .where(whereCondition);

    const debtsQuery = db.query.debts.findMany({
      with: {
        customer: true,
        transaction: {
          with: {
            transactionItems: {
              with: {
                product: true,
              },
            },
          },
        },
        debtPayments: true,
      },
      where: whereCondition,
      orderBy: [desc(debts.createdAt)],
      limit: limit,
      offset: offset,
    });

    const [[{ value: totalCount }], paginatedDebts] = await Promise.all([
      totalCountQuery,
      debtsQuery,
    ]);

    return NextResponse.json({
      data: paginatedDebts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      transactionId,
      totalDebt,
      paidAmount,
      remainingDebt,
      status,
    } = body;

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
      .returning();

    return NextResponse.json(newDebt[0], { status: 201 });
  } catch (error) {
    console.error("Error creating debt:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}
