import { db } from "@/lib/db";
import {
  transactions,
  transactionItems,
  products,
  debts,
} from "@/lib/db/schema";
import { and, asc, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const range = searchParams.get("range");

    let startDate: Date;
    let endDate: Date = new Date();

    if (range === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      // Default to this month if no start date is provided
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    if (endDateParam) {
      endDate = new Date(endDateParam);
    }

    // --- Main Date Range Filter ---
    const dateRangeFilter = and(
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    );

    // --- Today's Profit ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayTransactions = await db
      .select({
        purchasePrice: products.purchasePrice,
        price: transactionItems.price,
        quantity: transactionItems.quantity,
      })
      .from(transactions)
      .leftJoin(
        transactionItems,
        eq(transactions.id, transactionItems.transactionId)
      )
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(
        and(
          eq(transactions.type, "sale"),
          gte(transactions.transactionDate, todayStart),
          lte(transactions.transactionDate, todayEnd)
        )
      );

    const todayProfit = todayTransactions.reduce((total, item) => {
      if (!item.purchasePrice || !item.price || !item.quantity) return total;
      const profit =
        (Number(item.price) - Number(item.purchasePrice)) * item.quantity;
      return total + profit;
    }, 0);

    // --- Range Profit ---
    const rangeTransactionsData = await db
      .select({
        purchasePrice: products.purchasePrice,
        price: transactionItems.price,
        quantity: transactionItems.quantity,
        totalAmount: transactions.totalAmount,
      })
      .from(transactions)
      .leftJoin(
        transactionItems,
        eq(transactions.id, transactionItems.transactionId)
      )
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(and(eq(transactions.type, "sale"), dateRangeFilter));

    const rangeProfit = rangeTransactionsData.reduce((total, item) => {
      if (!item.purchasePrice || !item.price || !item.quantity) return total;
      const profit =
        (Number(item.price) - Number(item.purchasePrice)) * item.quantity;
      return total + profit;
    }, 0);

    const totalTransactions = await db
      .select({ count: sql`count(DISTINCT ${transactions.id})` })
      .from(transactions)
      .where(and(eq(transactions.type, "sale"), dateRangeFilter));

    // --- Total Products Sold ---
    const totalProductsSoldResult = await db
      .select({
        total: sum(transactionItems.quantity),
      })
      .from(transactionItems)
      .leftJoin(
        transactions,
        eq(transactionItems.transactionId, transactions.id)
      )
      .where(and(eq(transactions.type, "sale"), dateRangeFilter));

    // --- Total Debt ---
    const totalDebtResult = await db
      .select({
        total: sum(debts.remainingDebt),
      })
      .from(debts)
      .where(sql`${debts.status} != 'paid'`);

    // --- Sales Chart Data ---
    const salesByDate = await db
      .select({
        date: sql`DATE(${transactions.transactionDate})`,
        total: sum(transactions.totalAmount),
      })
      .from(transactions)
      .where(and(eq(transactions.type, "sale"), dateRangeFilter))
      .groupBy(sql`DATE(${transactions.transactionDate})`)
      .orderBy(asc(sql`DATE(${transactions.transactionDate})`));

    const salesChartData = salesByDate.map((row) => ({
      date: new Date(row.date as string).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),
      penjualan: Number(row.total),
    }));

    // --- Product Sales Chart Data ---
    const productSales = await db
      .select({
        productName: products.name,
        totalQuantity: sum(transactionItems.quantity),
      })
      .from(transactions)
      .leftJoin(
        transactionItems,
        eq(transactions.id, transactionItems.transactionId)
      )
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(and(eq(transactions.type, "sale"), dateRangeFilter))
      .groupBy(products.name)
      .orderBy(desc(sum(transactionItems.quantity)))
      .limit(8);

    const productSalesChartData = productSales.map((p) => ({
      product:
        p.productName!.length > 15
          ? p.productName!.substring(0, 15) + "..."
          : p.productName,
      terjual: Number(p.totalQuantity),
    }));

    // --- Recent Transactions ---
    const recentTransactions = await db.query.transactions.findMany({
      where: eq(transactions.type, "sale"),
      orderBy: [desc(transactions.transactionDate)],
      limit: 10,
      with: {
        transactionItems: true,
      },
    });

    return NextResponse.json({
      todayProfit,
      rangeProfit,
      totalProductsSold: Number(totalProductsSoldResult[0]?.total) || 0,
      totalTransactions: Number(totalTransactions[0]?.count) || 0,
      totalDebt: Number(totalDebtResult[0]?.total) || 0,
      salesChartData,
      productSalesChartData,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
