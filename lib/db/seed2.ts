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

  try {
    const allProducts = await db.select().from(products);
    const allCustomers = await db.select().from(customers);

    if (allProducts.length === 0 || allCustomers.length === 0) {
      console.error(
        "❌ Products or customers not found. Please run the initial seed script first."
      );
      return;
    }

    console.log(`🧹 Clearing previous 'sale' transactions...`);
    // Get all sale transaction IDs
    const saleTransactions = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.type, "sale"));
    const saleTransactionIds = saleTransactions.map((t) => t.id);

    // Delete items associated with sale transactions
    if (saleTransactionIds.length > 0) {
      await db
        .delete(transactionItems)
        .where(inArray(transactionItems.transactionId, saleTransactionIds));
      await db
        .delete(transactions)
        .where(inArray(transactions.id, saleTransactionIds));
    }

    console.log(
      "💳 Generating random sale transactions for the last 3 months..."
    );
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3);

    const generatedTransactions = [];

    for (let i = 0; i < 150; i++) {
      // Generate 150 random transactions
      const transactionDate = getRandomDate(startDate, endDate);
      const customer = getRandomElement(allCustomers);
      const numItems = Math.floor(Math.random() * 5) + 1; // 1 to 5 items per transaction

      let totalAmount = 0;
      const itemsToInsert = [];

      for (let j = 0; j < numItems; j++) {
        const product = getRandomElement(allProducts);
        const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 units per item
        const price = parseFloat(product.sellingPrice);
        const subtotal = price * quantity;

        totalAmount += subtotal;
        itemsToInsert.push({
          productId: product.id,
          quantity,
          price: price.toFixed(2),
          subtotal: subtotal.toFixed(2),
        });
      }

      const [newTransaction] = await db
        .insert(transactions)
        .values({
          type: "sale",
          customerId: customer.id,
          totalAmount: totalAmount.toFixed(2),
          paymentStatus: "paid", // Assuming all are paid for simplicity
          paidAmount: totalAmount.toFixed(2),
          transactionDate,
        })
        .returning();

      for (const item of itemsToInsert) {
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
