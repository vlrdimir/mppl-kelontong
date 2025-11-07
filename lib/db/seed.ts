import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import { products, customers, transactions, transactionItems, debts, debtPayments } from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

async function seed() {
  console.log("🌱 Starting database seeding...")

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.delete(debtPayments)
    await db.delete(debts)
    await db.delete(transactionItems)
    await db.delete(transactions)
    await db.delete(customers)
    await db.delete(products)

    // Insert Products
    console.log("📦 Inserting products...")
    const insertedProducts = await db
      .insert(products)
      .values([
        {
          name: "Indomie Goreng",
          category: "Makanan",
          stock: 100,
          purchasePrice: "2500",
          sellingPrice: "3000",
        },
        {
          name: "Indomie Soto",
          category: "Makanan",
          stock: 80,
          purchasePrice: "2500",
          sellingPrice: "3000",
        },
        {
          name: "Pop Mie",
          category: "Makanan",
          stock: 50,
          purchasePrice: "4000",
          sellingPrice: "5000",
        },
        {
          name: "Mie Sedaap Goreng",
          category: "Makanan",
          stock: 60,
          purchasePrice: "2300",
          sellingPrice: "2800",
        },
        {
          name: "Teh Botol Sosro",
          category: "Minuman",
          stock: 120,
          purchasePrice: "3500",
          sellingPrice: "4500",
        },
        {
          name: "Aqua 600ml",
          category: "Minuman",
          stock: 150,
          purchasePrice: "2000",
          sellingPrice: "3000",
        },
        {
          name: "Coca Cola 330ml",
          category: "Minuman",
          stock: 90,
          purchasePrice: "4000",
          sellingPrice: "5500",
        },
        {
          name: "Kopi Kapal Api",
          category: "Minuman",
          stock: 200,
          purchasePrice: "800",
          sellingPrice: "1500",
        },
        {
          name: "Beras 5kg",
          category: "Sembako",
          stock: 30,
          purchasePrice: "50000",
          sellingPrice: "60000",
        },
        {
          name: "Minyak Goreng 2L",
          category: "Sembako",
          stock: 40,
          purchasePrice: "28000",
          sellingPrice: "32000",
        },
        {
          name: "Gula Pasir 1kg",
          category: "Sembako",
          stock: 50,
          purchasePrice: "12000",
          sellingPrice: "15000",
        },
        {
          name: "Telur 1kg",
          category: "Sembako",
          stock: 25,
          purchasePrice: "25000",
          sellingPrice: "30000",
        },
        {
          name: "Susu Dancow",
          category: "Susu",
          stock: 45,
          purchasePrice: "35000",
          sellingPrice: "40000",
        },
        {
          name: "Susu Indomilk",
          category: "Susu",
          stock: 60,
          purchasePrice: "8000",
          sellingPrice: "10000",
        },
        {
          name: "Sabun Mandi Lifebuoy",
          category: "Toiletries",
          stock: 70,
          purchasePrice: "3500",
          sellingPrice: "5000",
        },
        {
          name: "Shampo Pantene Sachet",
          category: "Toiletries",
          stock: 100,
          purchasePrice: "1000",
          sellingPrice: "1500",
        },
        {
          name: "Pasta Gigi Pepsodent",
          category: "Toiletries",
          stock: 55,
          purchasePrice: "8000",
          sellingPrice: "11000",
        },
        {
          name: "Tissue Paseo",
          category: "Toiletries",
          stock: 40,
          purchasePrice: "15000",
          sellingPrice: "18000",
        },
        {
          name: "Rokok Sampoerna Mild",
          category: "Rokok",
          stock: 80,
          purchasePrice: "25000",
          sellingPrice: "28000",
        },
        {
          name: "Rokok Djarum Super",
          category: "Rokok",
          stock: 75,
          purchasePrice: "23000",
          sellingPrice: "26000",
        },
      ])
      .returning()
    console.log(`✅ Inserted ${insertedProducts.length} products`)

    // Insert Customers
    console.log("👥 Inserting customers...")
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
      .returning()
    console.log(`✅ Inserted ${insertedCustomers.length} customers`)

    // Insert Transactions with Items
    console.log("💳 Inserting transactions...")

    // Transaction 1 - Fully Paid
    const [transaction1] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[0].id,
        totalAmount: "27000",
        paymentStatus: "paid",
        paidAmount: "27000",
        notes: "Transaksi lunas",
        transactionDate: new Date("2024-10-01"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction1.id,
        productId: insertedProducts[0].id, // Indomie Goreng
        quantity: 5,
        price: "3000",
        subtotal: "15000",
      },
      {
        transactionId: transaction1.id,
        productId: insertedProducts[4].id, // Teh Botol
        quantity: 2,
        price: "4500",
        subtotal: "9000",
      },
      {
        transactionId: transaction1.id,
        productId: insertedProducts[7].id, // Kopi
        quantity: 2,
        price: "1500",
        subtotal: "3000",
      },
    ])

    // Transaction 2 - Unpaid (Has Debt)
    const [transaction2] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[1].id,
        totalAmount: "95000",
        paymentStatus: "unpaid",
        paidAmount: "0",
        notes: "Belum bayar",
        transactionDate: new Date("2024-10-05"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction2.id,
        productId: insertedProducts[8].id, // Beras
        quantity: 1,
        price: "60000",
        subtotal: "60000",
      },
      {
        transactionId: transaction2.id,
        productId: insertedProducts[9].id, // Minyak
        quantity: 1,
        price: "32000",
        subtotal: "32000",
      },
      {
        transactionId: transaction2.id,
        productId: insertedProducts[7].id, // Kopi
        quantity: 2,
        price: "1500",
        subtotal: "3000",
      },
    ])

    // Create debt for transaction 2
    const [debt1] = await db
      .insert(debts)
      .values({
        customerId: insertedCustomers[1].id,
        transactionId: transaction2.id,
        totalDebt: "95000",
        paidAmount: "0",
        remainingDebt: "95000",
        status: "unpaid",
      })
      .returning()

    // Transaction 3 - Partial Payment (Has Debt)
    const [transaction3] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[2].id,
        totalAmount: "150000",
        paymentStatus: "partial",
        paidAmount: "50000",
        notes: "Bayar sebagian",
        transactionDate: new Date("2024-10-10"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction3.id,
        productId: insertedProducts[8].id, // Beras
        quantity: 2,
        price: "60000",
        subtotal: "120000",
      },
      {
        transactionId: transaction3.id,
        productId: insertedProducts[11].id, // Telur
        quantity: 1,
        price: "30000",
        subtotal: "30000",
      },
    ])

    // Create debt for transaction 3
    const [debt2] = await db
      .insert(debts)
      .values({
        customerId: insertedCustomers[2].id,
        transactionId: transaction3.id,
        totalDebt: "150000",
        paidAmount: "50000",
        remainingDebt: "100000",
        status: "partial",
      })
      .returning()

    // Add debt payment
    await db.insert(debtPayments).values({
      debtId: debt2.id,
      amount: "50000",
      paymentDate: new Date("2024-10-10"),
      notes: "Pembayaran pertama",
    })

    // Transaction 4 - Paid
    const [transaction4] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[3].id,
        totalAmount: "33000",
        paymentStatus: "paid",
        paidAmount: "33000",
        transactionDate: new Date("2024-10-15"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction4.id,
        productId: insertedProducts[6].id, // Coca Cola
        quantity: 3,
        price: "5500",
        subtotal: "16500",
      },
      {
        transactionId: transaction4.id,
        productId: insertedProducts[5].id, // Aqua
        quantity: 5,
        price: "3000",
        subtotal: "15000",
      },
      {
        transactionId: transaction4.id,
        productId: insertedProducts[7].id, // Kopi
        quantity: 1,
        price: "1500",
        subtotal: "1500",
      },
    ])

    // Transaction 5 - Unpaid (Has Debt)
    const [transaction5] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[4].id,
        totalAmount: "78000",
        paymentStatus: "unpaid",
        paidAmount: "0",
        notes: "Hutang",
        transactionDate: new Date("2024-10-20"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction5.id,
        productId: insertedProducts[18].id, // Rokok Sampoerna
        quantity: 2,
        price: "28000",
        subtotal: "56000",
      },
      {
        transactionId: transaction5.id,
        productId: insertedProducts[4].id, // Teh Botol
        quantity: 4,
        price: "4500",
        subtotal: "18000",
      },
      {
        transactionId: transaction5.id,
        productId: insertedProducts[0].id, // Indomie
        quantity: 2,
        price: "3000",
        subtotal: "6000",
      },
    ])

    // Create debt for transaction 5
    await db
      .insert(debts)
      .values({
        customerId: insertedCustomers[4].id,
        transactionId: transaction5.id,
        totalDebt: "78000",
        paidAmount: "0",
        remainingDebt: "78000",
        status: "unpaid",
      })
      .returning()

    // Transaction 6 - Paid
    const [transaction6] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[5].id,
        totalAmount: "62000",
        paymentStatus: "paid",
        paidAmount: "62000",
        transactionDate: new Date("2024-10-25"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction6.id,
        productId: insertedProducts[12].id, // Susu Dancow
        quantity: 1,
        price: "40000",
        subtotal: "40000",
      },
      {
        transactionId: transaction6.id,
        productId: insertedProducts[16].id, // Pasta Gigi
        quantity: 2,
        price: "11000",
        subtotal: "22000",
      },
    ])

    // Transaction 7 - Recent Paid
    const [transaction7] = await db
      .insert(transactions)
      .values({
        type: "sale",
        customerId: insertedCustomers[6].id,
        totalAmount: "45500",
        paymentStatus: "paid",
        paidAmount: "45500",
        transactionDate: new Date("2024-10-28"),
      })
      .returning()

    await db.insert(transactionItems).values([
      {
        transactionId: transaction7.id,
        productId: insertedProducts[2].id, // Pop Mie
        quantity: 5,
        price: "5000",
        subtotal: "25000",
      },
      {
        transactionId: transaction7.id,
        productId: insertedProducts[13].id, // Susu Indomilk
        quantity: 2,
        price: "10000",
        subtotal: "20000",
      },
      {
        transactionId: transaction7.id,
        productId: insertedProducts[15].id, // Shampo
        quantity: 3,
        price: "1500",
        subtotal: "4500",
      },
    ])

    console.log("✅ Inserted 7 transactions with items")
    console.log("✅ Inserted 3 debts with payment history")

    console.log("✨ Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

seed()
  .then(() => {
    console.log("👋 Seeding process finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error)
    process.exit(1)
  })
