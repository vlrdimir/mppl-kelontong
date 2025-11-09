import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const findUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    if (findUser.length > 0 && findUser[0].role === "admin") {
      return Response.json({ message: "Login successful" }, { status: 200 });
    } else {
      return Response.json({ message: "Login failed" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching token:", error);
    return Response.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}
