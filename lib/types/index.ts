// Base types
export interface Product {
  id: string
  name: string
  category: string | null
  stock: number
  purchasePrice: string
  sellingPrice: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  address: string | null
  createdAt: string
}

export interface TransactionItem {
  id: string
  transactionId: string
  productId: string
  quantity: number
  price: string
  subtotal: string
  createdAt: string
  product: Product
}

export interface Transaction {
  id: string
  type: string
  customerId: string | null
  totalAmount: string
  paymentStatus: string
  paidAmount: string
  notes: string | null
  transactionDate: string
  createdAt: string
  transactionItems: TransactionItem[]
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: string
  paymentDate: string
  notes: string | null
  createdAt: string
}

export interface Debt {
  id: string
  customerId: string
  transactionId: string
  totalDebt: string
  paidAmount: string
  remainingDebt: string
  status: "unpaid" | "partial" | "paid"
  createdAt: string
  updatedAt: string
  customer: Customer
  transaction: Transaction
  debtPayments: DebtPayment[]
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API Response types
export type TransactionsResponse = Transaction[]
export type DebtsResponse = Debt[]
export type ProductsResponse = Product[]
export type CustomersResponse = Customer[]

// Paginated API Response types
export interface PaginatedProductsResponse {
  data: Product[]
  pagination: PaginationMeta
}

export interface PaginatedTransactionsResponse {
  data: Transaction[]
  pagination: PaginationMeta
}

export interface PaginatedDebtsResponse {
  data: Debt[]
  pagination: PaginationMeta
}

export interface PaginatedCustomersResponse {
  data: Customer[]
  pagination: PaginationMeta
}

// Form input types
export interface CreateProductInput {
  name: string
  category?: string
  stock: number
  purchasePrice: string
  sellingPrice: string
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateCustomerInput {
  name: string
  phone?: string
  address?: string
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export interface CreateTransactionItemInput {
  productId: string
  quantity: number
  price: string
  subtotal: string
}

export interface CreateTransactionInput {
  type: string
  customerId?: string
  totalAmount: string
  paymentStatus: string
  paidAmount?: string
  notes?: string
  items: CreateTransactionItemInput[]
}

export interface CreateDebtInput {
  customerId: string
  transactionId: string
  totalDebt: string
  paidAmount?: string
  remainingDebt: string
  status: string
}

export interface CreateDebtPaymentInput {
  debtId: string
  amount: string
  notes?: string
}

// Dashboard stats type
export interface DashboardStats {
  todayProfit: number
  rangeProfit: number
  totalProductsSold: number
  totalTransactions: number
  totalDebt: number
}

export type DateRangeOption = "today" | "this-month" | "last-month" | "last-2-months" | "last-3-months" | "this-year"
