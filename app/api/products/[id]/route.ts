import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, ilike, and, ne } from "drizzle-orm";
import auth from "@/proxy";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, categoryId, stock, purchasePrice, sellingPrice } =
      body as Partial<{
        name: string;
        categoryId: number;
        stock: number;
        purchasePrice: string;
        sellingPrice: string;
      }>;

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validasi duplicate name jika name diupdate (exclude current product)
    if (name && name.trim() !== "") {
      const duplicateProduct = await db.query.products.findFirst({
        where: (products, { and, ne }) =>
          and(ilike(products.name, name.trim()), ne(products.id, productId)),
      });

      if (duplicateProduct) {
        return NextResponse.json(
          { error: `Produk "${name}" sudah ada` },
          { status: 400 }
        );
      }
    }

    // Hanya set field yang didefinisikan agar PATCH benar-benar partial update
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name !== "undefined") updates.name = name.trim();
    if (typeof categoryId !== "undefined")
      updates.categoryId = categoryId || null;
    if (typeof stock !== "undefined") updates.stock = stock;
    if (typeof purchasePrice !== "undefined")
      updates.purchasePrice = purchasePrice;
    if (typeof sellingPrice !== "undefined")
      updates.sellingPrice = sellingPrice;

    const updatedProduct = await db
      .update(products)
      .set(updates as any)
      .where(eq(products.id, productId))
      .returning();

    // Fetch with category relation
    const productWithCategory = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        category: true,
      },
    });

    if (!updatedProduct.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(productWithCategory);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/products/[id]">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    const deletedProduct = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (!deletedProduct.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
