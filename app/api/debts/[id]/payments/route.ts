import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debtPayments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import auth from "@/proxy";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/debts/[id]/payments">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: debtId } = await ctx.params;

    if (!debtId) {
      return NextResponse.json(
        { error: "Debt ID is required" },
        { status: 400 }
      );
    }

    const payments = await db.query.debtPayments.findMany({
      where: eq(debtPayments.debtId, debtId),
      orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching debt payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch debt payments" },
      { status: 500 }
    );
  }
}
