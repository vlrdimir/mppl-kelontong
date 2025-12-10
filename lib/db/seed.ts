import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import {
  categories,
  products,
  customers,
  transactions,
  transactionItems,
  debts,
  debtPayments,
  invoiceSequences,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting database seeding...");
  console.log(
    "📝 Note: products.id and transactions.id are now integers (serial)"
  );
  console.log(
    "📝 Note: products now use categoryId (FK) instead of category (text)"
  );

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(debtPayments);
    await db.delete(debts);
    await db.delete(transactionItems);
    await db.delete(transactions);
    await db.delete(invoiceSequences);
    await db.delete(customers);
    await db.delete(products);
    await db.delete(categories);

    // Insert Categories first
    console.log("🏷️  Inserting categories...");
    const insertedCategories = await db
      .insert(categories)
      .values([
        {
          name: "Makanan",
          description: "Produk makanan instan dan makanan ringan",
        },
        { name: "Minuman", description: "Minuman kemasan dan minuman ringan" },
        { name: "Sembako", description: "Sembako dan bahan pokok" },
        { name: "Susu", description: "Produk susu dan turunannya" },
        {
          name: "Perlengkapan Mandi",
          description: "Produk kebersihan dan perawatan diri",
        },
        { name: "Rokok", description: "Produk rokok" },
      ])
      .returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Create category mapping
    const categoryMap: Record<string, number> = {};
    categoryMap["Makanan"] = insertedCategories.find(
      (c) => c.name === "Makanan"
    )!.id;
    categoryMap["Minuman"] = insertedCategories.find(
      (c) => c.name === "Minuman"
    )!.id;
    categoryMap["Sembako"] = insertedCategories.find(
      (c) => c.name === "Sembako"
    )!.id;
    categoryMap["Susu"] = insertedCategories.find((c) => c.name === "Susu")!.id;
    categoryMap["Perlengkapan Mandi"] = insertedCategories.find(
      (c) => c.name === "Perlengkapan Mandi"
    )!.id;
    categoryMap["Rokok"] = insertedCategories.find(
      (c) => c.name === "Rokok"
    )!.id;

    // Insert Products
    console.log("📦 Inserting products...");
    const insertedProducts = await db
      .insert(products)
      .values([
        {
          name: "Indomie Goreng",
          categoryId: categoryMap["Makanan"],
          stock: 100,
          purchasePrice: "2500",
          sellingPrice: "3000",
        },
        {
          name: "Indomie Soto",
          categoryId: categoryMap["Makanan"],
          stock: 80,
          purchasePrice: "2500",
          sellingPrice: "3000",
        },
        {
          name: "Pop Mie",
          categoryId: categoryMap["Makanan"],
          stock: 50,
          purchasePrice: "4000",
          sellingPrice: "5000",
        },
        {
          name: "Mie Sedaap Goreng",
          categoryId: categoryMap["Makanan"],
          stock: 60,
          purchasePrice: "2300",
          sellingPrice: "2800",
        },
        {
          name: "Teh Botol Sosro",
          categoryId: categoryMap["Minuman"],
          stock: 120,
          purchasePrice: "3500",
          sellingPrice: "4500",
        },
        {
          name: "Aqua 600ml",
          categoryId: categoryMap["Minuman"],
          stock: 150,
          purchasePrice: "2000",
          sellingPrice: "3000",
        },
        {
          name: "Coca Cola 330ml",
          categoryId: categoryMap["Minuman"],
          stock: 90,
          purchasePrice: "4000",
          sellingPrice: "5500",
        },
        {
          name: "Kopi Kapal Api",
          categoryId: categoryMap["Minuman"],
          stock: 200,
          purchasePrice: "800",
          sellingPrice: "1500",
        },
        {
          name: "Beras 5kg",
          categoryId: categoryMap["Sembako"],
          stock: 30,
          purchasePrice: "50000",
          sellingPrice: "60000",
        },
        {
          name: "Minyak Goreng 2L",
          categoryId: categoryMap["Sembako"],
          stock: 40,
          purchasePrice: "28000",
          sellingPrice: "32000",
        },
        {
          name: "Gula Pasir 1kg",
          categoryId: categoryMap["Sembako"],
          stock: 50,
          purchasePrice: "12000",
          sellingPrice: "15000",
        },
        {
          name: "Telur 1kg",
          categoryId: categoryMap["Sembako"],
          stock: 25,
          purchasePrice: "25000",
          sellingPrice: "30000",
        },
        {
          name: "Susu Dancow",
          categoryId: categoryMap["Susu"],
          stock: 45,
          purchasePrice: "35000",
          sellingPrice: "40000",
        },
        {
          name: "Susu Indomilk",
          categoryId: categoryMap["Susu"],
          stock: 60,
          purchasePrice: "8000",
          sellingPrice: "10000",
        },
        {
          name: "Sabun Mandi Lifebuoy",
          categoryId: categoryMap["Perlengkapan Mandi"],
          stock: 70,
          purchasePrice: "3500",
          sellingPrice: "5000",
        },
        {
          name: "Shampo Pantene Sachet",
          categoryId: categoryMap["Perlengkapan Mandi"],
          stock: 100,
          purchasePrice: "1000",
          sellingPrice: "1500",
        },
        {
          name: "Pasta Gigi Pepsodent",
          categoryId: categoryMap["Perlengkapan Mandi"],
          stock: 55,
          purchasePrice: "8000",
          sellingPrice: "11000",
        },
        {
          name: "Tissue Paseo",
          categoryId: categoryMap["Perlengkapan Mandi"],
          stock: 40,
          purchasePrice: "15000",
          sellingPrice: "18000",
        },
        {
          name: "Rokok Sampoerna Mild",
          categoryId: categoryMap["Rokok"],
          stock: 80,
          purchasePrice: "25000",
          sellingPrice: "28000",
        },
        {
          name: "Rokok Djarum Super",
          categoryId: categoryMap["Rokok"],
          stock: 75,
          purchasePrice: "23000",
          sellingPrice: "26000",
        },
      ])
      .returning();
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Insert Customers
    console.log("👥 Inserting customers...");
    const insertedCustomers = await db
      .insert(customers)
      .values([
        {
          name: "Budi Santoso",
          phone: "081234567890",
          address: "Jl. Merdeka No. 123, Jakarta",
        },
        {
          name: "Siti Nurhaliza",
          phone: "081298765432",
          address: "Jl. Sudirman No. 45, Bandung",
        },
        {
          name: "Ahmad Wijaya",
          phone: "081356789012",
          address: "Jl. Gatot Subroto No. 78, Surabaya",
        },
        {
          name: "Dewi Lestari",
          phone: "081445678901",
          address: "Jl. Ahmad Yani No. 90, Yogyakarta",
        },
        {
          name: "Rudi Hartono",
          phone: "081567890123",
          address: "Jl. Diponegoro No. 12, Semarang",
        },
        {
          name: "Ani Kusuma",
          phone: "081678901234",
          address: "Jl. Pahlawan No. 34, Malang",
        },
        {
          name: "Joko Widodo",
          phone: "081789012345",
          address: "Jl. Pemuda No. 56, Solo",
        },
        {
          name: "Sri Mulyani",
          phone: "081890123456",
          address: "Jl. Veteran No. 67, Medan",
        },
      ])
      .returning();
    console.log(`✅ Inserted ${insertedCustomers.length} customers`);

    // Insert Transactions with Items
    console.log("💳 Inserting transactions...");
    console.log(
      "📅 Transactions will be inserted in chronological order (by date)"
    );

    // Define all transactions with their data (sorted by date)
    const transactionsData = [
      {
        // Transaction 1 - Fully Paid (2024-10-01)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[0].id,
          totalAmount: "27000",
          paymentStatus: "paid" as const,
          paidAmount: "27000",
          notes: "Transaksi lunas",
          transactionDate: new Date("2024-10-01"),
        },
        items: [
          {
            productId: insertedProducts[0].id, // Indomie Goreng
            quantity: 5,
            price: "3000",
            subtotal: "15000",
          },
          {
            productId: insertedProducts[4].id, // Teh Botol
            quantity: 2,
            price: "4500",
            subtotal: "9000",
          },
          {
            productId: insertedProducts[7].id, // Kopi
            quantity: 2,
            price: "1500",
            subtotal: "3000",
          },
        ],
        debt: null,
        debtPayment: null,
      },
      {
        // Transaction 2 - Unpaid (2024-10-05)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[1].id,
          totalAmount: "95000",
          paymentStatus: "unpaid" as const,
          paidAmount: "0",
          notes: "Belum bayar",
          transactionDate: new Date("2024-10-05"),
        },
        items: [
          {
            productId: insertedProducts[8].id, // Beras
            quantity: 1,
            price: "60000",
            subtotal: "60000",
          },
          {
            productId: insertedProducts[9].id, // Minyak
            quantity: 1,
            price: "32000",
            subtotal: "32000",
          },
          {
            productId: insertedProducts[7].id, // Kopi
            quantity: 2,
            price: "1500",
            subtotal: "3000",
          },
        ],
        debt: {
          customerId: insertedCustomers[1].id,
          totalDebt: "95000",
          paidAmount: "0",
          remainingDebt: "95000",
          status: "unpaid" as const,
        },
        debtPayment: null,
      },
      {
        // Transaction 3 - Partial Payment (2024-10-10)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[2].id,
          totalAmount: "150000",
          paymentStatus: "partial" as const,
          paidAmount: "50000",
          notes: "Bayar sebagian",
          transactionDate: new Date("2024-10-10"),
        },
        items: [
          {
            productId: insertedProducts[8].id, // Beras
            quantity: 2,
            price: "60000",
            subtotal: "120000",
          },
          {
            productId: insertedProducts[11].id, // Telur
            quantity: 1,
            price: "30000",
            subtotal: "30000",
          },
        ],
        debt: {
          customerId: insertedCustomers[2].id,
          totalDebt: "150000",
          paidAmount: "50000",
          remainingDebt: "100000",
          status: "partial" as const,
        },
        debtPayment: {
          amount: "50000",
          paymentDate: new Date("2024-10-10"),
          notes: "Pembayaran pertama",
        },
      },
      {
        // Transaction 4 - Paid (2024-10-15)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[3].id,
          totalAmount: "33000",
          paymentStatus: "paid" as const,
          paidAmount: "33000",
          transactionDate: new Date("2024-10-15"),
        },
        items: [
          {
            productId: insertedProducts[6].id, // Coca Cola
            quantity: 3,
            price: "5500",
            subtotal: "16500",
          },
          {
            productId: insertedProducts[5].id, // Aqua
            quantity: 5,
            price: "3000",
            subtotal: "15000",
          },
          {
            productId: insertedProducts[7].id, // Kopi
            quantity: 1,
            price: "1500",
            subtotal: "1500",
          },
        ],
        debt: null,
        debtPayment: null,
      },
      {
        // Transaction 5 - Unpaid (2024-10-20)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[4].id,
          totalAmount: "78000",
          paymentStatus: "unpaid" as const,
          paidAmount: "0",
          notes: "Hutang",
          transactionDate: new Date("2024-10-20"),
        },
        items: [
          {
            productId: insertedProducts[18].id, // Rokok Sampoerna
            quantity: 2,
            price: "28000",
            subtotal: "56000",
          },
          {
            productId: insertedProducts[4].id, // Teh Botol
            quantity: 4,
            price: "4500",
            subtotal: "18000",
          },
          {
            productId: insertedProducts[0].id, // Indomie
            quantity: 2,
            price: "3000",
            subtotal: "6000",
          },
        ],
        debt: {
          customerId: insertedCustomers[4].id,
          totalDebt: "78000",
          paidAmount: "0",
          remainingDebt: "78000",
          status: "unpaid" as const,
        },
        debtPayment: null,
      },
      {
        // Transaction 6 - Paid (2024-10-25)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[5].id,
          totalAmount: "62000",
          paymentStatus: "paid" as const,
          paidAmount: "62000",
          transactionDate: new Date("2024-10-25"),
        },
        items: [
          {
            productId: insertedProducts[12].id, // Susu Dancow
            quantity: 1,
            price: "40000",
            subtotal: "40000",
          },
          {
            productId: insertedProducts[16].id, // Pasta Gigi
            quantity: 2,
            price: "11000",
            subtotal: "22000",
          },
        ],
        debt: null,
        debtPayment: null,
      },
      {
        // Transaction 7 - Recent Paid (2024-10-28)
        transaction: {
          type: "sale" as const,
          customerId: insertedCustomers[6].id,
          totalAmount: "45500",
          paymentStatus: "paid" as const,
          paidAmount: "45500",
          transactionDate: new Date("2024-10-28"),
        },
        items: [
          {
            productId: insertedProducts[2].id, // Pop Mie
            quantity: 5,
            price: "5000",
            subtotal: "25000",
          },
          {
            productId: insertedProducts[13].id, // Susu Indomilk
            quantity: 2,
            price: "10000",
            subtotal: "20000",
          },
          {
            productId: insertedProducts[15].id, // Shampo
            quantity: 3,
            price: "1500",
            subtotal: "4500",
          },
        ],
        debt: null,
        debtPayment: null,
      },
    ];

    // Sort transactions by date (oldest first) to ensure ID serial is sequential
    transactionsData.sort(
      (a, b) =>
        a.transaction.transactionDate.getTime() -
        b.transaction.transactionDate.getTime()
    );

    const periodCounters = new Map<string, number>();
    const formatDateStr = (date: Date) => {
      const yy = String(date.getFullYear()).slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `2${yy}${month}${day}`; // contoh 2025-12-10 => 2251210
    };
    const getMonthPeriod = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}${month}01`; // kunci periode bulanan
    };
    const nextInvoiceCode = (date: Date) => {
      const period = getMonthPeriod(date); // reset bulanan
      const current = periodCounters.get(period) ?? 0;
      const next = current + 1;
      periodCounters.set(period, next);
      const dateStr = formatDateStr(date); // tampilkan tanggal aktual
      return {
        period,
        code: `INV-${dateStr}-${String(next).padStart(5, "0")}`,
      };
    };

    // Insert transactions in chronological order
    const insertedTransactions = [];
    const insertedDebts = [];

    for (const txData of transactionsData) {
      // Insert transaction
      const { code: invoiceCode } = nextInvoiceCode(
        txData.transaction.transactionDate
      );
      const [newTransaction] = await db
        .insert(transactions)
        .values({ invoiceCode, ...txData.transaction })
        .returning();

      // Insert transaction items
      await db.insert(transactionItems).values(
        txData.items.map((item) => ({
          ...item,
          transactionId: newTransaction.id,
        }))
      );

      // Insert debt if exists
      if (txData.debt) {
        const [newDebt] = await db
          .insert(debts)
          .values({
            ...txData.debt,
            transactionId: newTransaction.id,
          })
          .returning();

        // Insert debt payment if exists
        if (txData.debtPayment) {
          await db.insert(debtPayments).values({
            ...txData.debtPayment,
            debtId: newDebt.id,
          });
        }

        insertedDebts.push(newDebt);
      }

      insertedTransactions.push(newTransaction);
    }

    if (periodCounters.size > 0) {
      await db.insert(invoiceSequences).values(
        Array.from(periodCounters.entries()).map(([period, lastSeq]) => ({
          period,
          lastSeq,
        }))
      );
    }

    console.log(
      `✅ Inserted ${insertedTransactions.length} transactions with items (in chronological order)`
    );
    console.log(
      `✅ Inserted ${insertedDebts.length} debts with payment history`
    );
    console.log(
      `📊 Transaction IDs are now sequential: ${insertedTransactions
        .map((t) => t.id)
        .join(", ")}`
    );

    console.log("✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("👋 Seeding process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
