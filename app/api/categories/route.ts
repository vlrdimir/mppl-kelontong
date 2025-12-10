import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import auth from "@/proxy";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allCategories = await db.query.categories.findMany({
      orderBy: [categories.name],
    });

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const { name, description } = body as {
      name: string;
      description?: string;
    };

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi duplicate name (case-insensitive)
    const existingCategory = await db.query.categories.findFirst({
      where: ilike(categories.name, name.trim()),
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `Kategori "${name}" sudah ada` },
        { status: 400 }
      );
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
