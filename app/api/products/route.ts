import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { asc, count, ilike, eq } from "drizzle-orm";
import auth from "@/proxy";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(products);

    // Get paginated products with category relation
    const allProducts = await db.query.products.findMany({
      with: {
        category: true,
      },
      orderBy: [asc(products.name)],
      limit: limit,
      offset: offset,
    });

    return NextResponse.json({
      data: allProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, categoryId, stock, purchasePrice, sellingPrice } = body as {
      name: string;
      categoryId?: number;
      stock: number;
      purchasePrice: string;
      sellingPrice: string;
    };

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Nama produk wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi duplicate name (case-insensitive)
    const existingProduct = await db.query.products.findFirst({
      where: ilike(products.name, name.trim()),
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: `Produk "${name}" sudah ada` },
        { status: 400 }
      );
    }

    const newProduct = await db
      .insert(products)
      .values({
        name: name.trim(),
        categoryId: categoryId || null,
        stock,
        purchasePrice,
        sellingPrice,
      })
      .returning();

    // Fetch with category relation
    const productWithCategory = await db.query.products.findFirst({
      where: eq(products.id, newProduct[0].id),
      with: {
        category: true,
      },
    });

    return NextResponse.json(productWithCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
