# Migration Guide: Supabase to Drizzle ORM + Neon Database

This guide explains the migration from Supabase to Drizzle ORM with Neon Database and TanStack Query.

## What Changed

### 1. Database Layer
- **Before**: Supabase Client
- **After**: Drizzle ORM with Neon Database

### 2. Data Fetching
- **Before**: Direct Supabase queries in Server Components
- **After**: API Routes + TanStack Query in Client Components

### 3. Architecture
- **Before**: Server-side data fetching in page components
- **After**: Client-side data fetching with proper loading and error states

## Setup Instructions

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string
4. Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@your-neon-database.neon.tech/dbname?sslmode=require
```

### 2. Push Schema to Database

Run the following command to push your schema to the Neon database:

```bash
npm run db:push
```

This will create all the tables based on the schema defined in `lib/db/schema.ts`.

### 3. Migrate Existing Data (Optional)

If you have existing data in Supabase that you want to migrate:

1. Export data from Supabase
2. Use the SQL scripts in the `scripts` folder as reference
3. Import the data into your Neon database

### 4. Start Development Server

```bash
npm run dev
```

## New File Structure

```
lib/
  db/
    schema.ts          # Drizzle schema definitions
    index.ts           # Database connection

app/
  api/
    debts/
      route.ts         # GET, POST /api/debts
      [id]/
        route.ts       # GET, PATCH, DELETE /api/debts/:id
    products/
      route.ts         # GET, POST /api/products
      [id]/
        route.ts       # GET, PATCH, DELETE /api/products/:id
    transactions/
      route.ts         # GET, POST /api/transactions
      [id]/
        route.ts       # GET, PATCH, DELETE /api/transactions/:id

  debts/
    page.tsx           # Server component wrapper
    page-client.tsx    # Client component with TanStack Query

  products/
    page.tsx           # Server component wrapper
    page-client.tsx    # Client component with TanStack Query

  transactions/
    page.tsx           # Server component wrapper
    page-client.tsx    # Client component with TanStack Query

components/
  providers/
    query-provider.tsx # TanStack Query provider

drizzle.config.ts     # Drizzle Kit configuration
```

## API Routes

### Debts API
- `GET /api/debts` - Get all debts with relations
- `POST /api/debts` - Create new debt
- `GET /api/debts/:id` - Get single debt
- `PATCH /api/debts/:id` - Update debt
- `DELETE /api/debts/:id` - Delete debt

### Products API
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Transactions API
- `GET /api/transactions?type=sale` - Get transactions (filtered by type)
- `POST /api/transactions` - Create new transaction with items
- `GET /api/transactions/:id` - Get single transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## TanStack Query Usage

All pages now use TanStack Query for data fetching:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
})
```

Benefits:
- Automatic caching
- Loading and error states
- Background refetching
- Optimistic updates (when implemented)

## Drizzle Commands

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Schema Highlights

The schema (`lib/db/schema.ts`) includes:

- **products** - Product inventory
- **customers** - Customer information
- **transactions** - Sales and purchase transactions
- **transactionItems** - Transaction line items
- **debts** - Customer debt tracking
- **debtPayments** - Debt payment history

All relations are properly defined using Drizzle's relational queries.

## Next Steps

1. Update component forms to use mutations (create, update, delete)
2. Add optimistic updates for better UX
3. Implement error handling and retry logic
4. Add pagination for large datasets
5. Consider adding React Query DevTools for debugging

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL in .env file
- Check Neon database is running
- Ensure IP is whitelisted in Neon (usually automatic)

### Type Errors
- Run `npm run db:generate` to regenerate types
- Check schema.ts for correct type definitions

### API Route Errors
- Check browser console for error messages
- Verify API routes are returning correct data structure
- Check database has data to return
