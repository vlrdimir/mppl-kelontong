import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import auth from "@/proxy";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body as {
      name?: string;
      description?: string;
    };

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Validate duplicate name if name is being updated
    if (name && name.trim() !== "") {
      const duplicateCategory = await db.query.categories.findFirst({
        where: (categories, { and, ne }) =>
          and(
            ilike(categories.name, name.trim()),
            ne(categories.id, categoryId)
          ),
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: `Kategori "${name}" sudah ada` },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    const updatedCategory = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/categories/[id]">
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is still being used by products
    const productsUsingCategory = await db.query.products.findFirst({
      where: eq(products.categoryId, categoryId),
    });

    if (productsUsingCategory) {
      return NextResponse.json(
        {
          error:
            "Kategori tidak dapat dihapus karena masih digunakan oleh produk",
        },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
