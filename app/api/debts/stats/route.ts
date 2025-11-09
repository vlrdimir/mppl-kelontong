import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debts } from "@/lib/db/schema";
import { sql, eq, count, not } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const totalOutstandingResult = await db
      .select({
        total: sql<number>`sum(CAST(${debts.remainingDebt} AS DECIMAL))`,
      })
      .from(debts)
      .where(not(eq(debts.status, "paid")));

    const totalUnpaidResult = await db
      .select({
        total: sql<number>`sum(CAST(${debts.remainingDebt} AS DECIMAL))`,
      })
      .from(debts)
      .where(not(eq(debts.status, "paid"))); // Includes 'unpaid' and 'partial'

    const totalPaidCountResult = await db
      .select({ value: count() })
      .from(debts)
      .where(eq(debts.status, "paid"));

    const stats = {
      totalOutstanding: totalOutstandingResult[0].total || 0,
      totalUnpaid: totalUnpaidResult[0].total || 0, // This is effectively the same as outstanding
      totalPaidCount: totalPaidCountResult[0].value || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching debt stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch debt stats" },
      { status: 500 }
    );
  }
}
