import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import auth from "@/proxy";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, stock, purchasePrice, sellingPrice } =
      body as Partial<{
        name: string;
        category: string;
        stock: number;
        purchasePrice: string;
        sellingPrice: string;
      }>;

    // Hanya set field yang didefinisikan agar PATCH benar-benar partial update
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof name !== "undefined") updates.name = name;
    if (typeof category !== "undefined") updates.category = category;
    if (typeof stock !== "undefined") updates.stock = stock;
    if (typeof purchasePrice !== "undefined")
      updates.purchasePrice = purchasePrice;
    if (typeof sellingPrice !== "undefined")
      updates.sellingPrice = sellingPrice;

    if (Object.keys(updates).length === 1) {
      // Tidak ada field yang diupdate selain updatedAt → tetap lanjut agar menyentuh updatedAt
    }

    const updatedProduct = await db
      .update(products)
      .set(updates as any)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deletedProduct = await db
      .delete(products)
      .where(eq(products.id, id))
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
