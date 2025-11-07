import {
  pgTable,
  uuid,
  text,
  integer,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category"),
  stock: integer("stock").notNull().default(0),
  purchasePrice: decimal("purchase_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Transactions table
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(), // 'sale' or 'purchase'
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: text("payment_status").notNull(), // 'paid', 'unpaid', 'partial'
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default(
      "0"
    ),
    notes: text("notes"),
    transactionDate: timestamp("transaction_date", {
      withTimezone: true,
    }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_transactions_date").on(table.transactionDate),
    index("idx_transactions_type").on(table.type),
  ]
);

// Transaction items table
export const transactionItems = pgTable(
  "transaction_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_transaction_items_transaction").on(table.transactionId),
    index("idx_transaction_items_product").on(table.productId),
  ]
);

// Debts table
export const debts = pgTable(
  "debts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    totalDebt: decimal("total_debt", { precision: 10, scale: 2 }).notNull(),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default(
      "0"
    ),
    remainingDebt: decimal("remaining_debt", {
      precision: 10,
      scale: 2,
    }).notNull(),
    status: text("status").notNull(), // 'unpaid', 'partial', 'paid'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_debts_customer").on(table.customerId),
    index("idx_debts_status").on(table.status),
  ]
);

// Debt payments table
export const debtPayments = pgTable("debt_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  debtId: uuid("debt_id")
    .notNull()
    .references(() => debts.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions),
  debts: many(debts),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [transactions.customerId],
      references: [customers.id],
    }),
    transactionItems: many(transactionItems),
    debts: many(debts),
  })
);

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionId],
      references: [transactions.id],
    }),
    product: one(products, {
      fields: [transactionItems.productId],
      references: [products.id],
    }),
  })
);

export const debtsRelations = relations(debts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [debts.customerId],
    references: [customers.id],
  }),
  transaction: one(transactions, {
    fields: [debts.transactionId],
    references: [transactions.id],
  }),
  debtPayments: many(debtPayments),
}));

export const debtPaymentsRelations = relations(debtPayments, ({ one }) => ({
  debt: one(debts, {
    fields: [debtPayments.debtId],
    references: [debts.id],
  }),
}));
