import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { asc, count } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get total count
    const [{ value: totalCount }] = await db.select({ value: count() }).from(products)

    // Get paginated products
    const allProducts = await db.query.products.findMany({
      orderBy: [asc(products.name)],
      limit: limit,
      offset: offset,
    })

    return NextResponse.json({
      data: allProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, stock, purchasePrice, sellingPrice } = body

    const newProduct = await db
      .insert(products)
      .values({
        name,
        category,
        stock,
        purchasePrice,
        sellingPrice,
      })
      .returning()

    return NextResponse.json(newProduct[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
