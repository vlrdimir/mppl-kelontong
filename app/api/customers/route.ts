import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { customers } from "@/lib/db/schema"
import { asc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const allCustomers = await db.query.customers.findMany({
      orderBy: [asc(customers.name)],
    })

    return NextResponse.json(allCustomers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address } = body

    const newCustomer = await db
      .insert(customers)
      .values({
        name,
        phone,
        address,
      })
      .returning()

    return NextResponse.json(newCustomer[0], { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
