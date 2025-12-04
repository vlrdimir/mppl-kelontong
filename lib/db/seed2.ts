import { products, customers, transactions, transactionItems } from "./schema";
import { eq, inArray } from "drizzle-orm";
import { db } from ".";

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

async function seed() {
  console.log("🌱 Starting advanced database seeding for charts...");
  console.log(
    "📝 Note: products.id and transactions.id are now integers (serial)"
  );

  try {
    const allProducts = await db.select().from(products);
    const allCustomers = await db.select().from(customers);

    if (allProducts.length === 0 || allCustomers.length === 0) {
      console.error(
        "❌ Products or customers not found. Please run the initial seed script first."
      );
      return;
    }

    console.log(
      `📦 Found ${allProducts.length} products and ${allCustomers.length} customers`
    );

    console.log(`🧹 Clearing previous 'sale' transactions...`);
    // Get all sale transaction IDs (now integers)
    const saleTransactions = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.type, "sale"));
    const saleTransactionIds: number[] = saleTransactions.map((t) => t.id);

    // Delete items associated with sale transactions
    if (saleTransactionIds.length > 0) {
      await db
        .delete(transactionItems)
        .where(inArray(transactionItems.transactionId, saleTransactionIds));
      await db
        .delete(transactions)
        .where(inArray(transactions.id, saleTransactionIds));
      console.log(
        `🗑️  Deleted ${saleTransactionIds.length} previous sale transactions`
      );
    }

    console.log(
      "💳 Generating random sale transactions for the last 3 months..."
    );
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3);

    // Generate all transaction data first
    const transactionsToInsert: {
      transactionDate: Date;
      customer: (typeof allCustomers)[0];
      totalAmount: number;
      items: {
        productId: number;
        quantity: number;
        price: string;
        subtotal: string;
      }[];
    }[] = [];

    for (let i = 0; i < 150; i++) {
      const transactionDate = getRandomDate(startDate, endDate);
      const customer = getRandomElement(allCustomers);
      const numItems = Math.floor(Math.random() * 5) + 1;

      let totalAmount = 0;
      const items: {
        productId: number;
        quantity: number;
        price: string;
        subtotal: string;
      }[] = [];

      for (let j = 0; j < numItems; j++) {
        const product = getRandomElement(allProducts);
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(product.sellingPrice);
        const subtotal = price * quantity;

        totalAmount += subtotal;
        items.push({
          productId: product.id,
          quantity,
          price: price.toFixed(2),
          subtotal: subtotal.toFixed(2),
        });
      }

      transactionsToInsert.push({
        transactionDate,
        customer,
        totalAmount,
        items,
      });
    }

    // Sort by date (oldest first) so IDs are sequential by date
    transactionsToInsert.sort(
      (a, b) => a.transactionDate.getTime() - b.transactionDate.getTime()
    );

    console.log(
      "📅 Transactions will be inserted in chronological order (by date)"
    );

    // Insert in sorted order
    const generatedTransactions = [];

    for (const txData of transactionsToInsert) {
      const [newTransaction] = await db
        .insert(transactions)
        .values({
          type: "sale",
          customerId: txData.customer.id,
          totalAmount: txData.totalAmount.toFixed(2),
          paymentStatus: "paid",
          paidAmount: txData.totalAmount.toFixed(2),
          transactionDate: txData.transactionDate,
        })
        .returning();

      for (const item of txData.items) {
        await db.insert(transactionItems).values({
          ...item,
          transactionId: newTransaction.id,
        });
      }

      generatedTransactions.push(newTransaction);
    }

    console.log(
      `✅ Generated and inserted ${generatedTransactions.length} new sale transactions.`
    );
    console.log("✨ Advanced seeding for charts completed successfully!");
  } catch (error) {
    console.error("❌ Error during advanced seeding:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("👋 Seeding process finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
