import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// NOTE: Ini untuk testing sementara - auto register jika tidak ada user di database
// TODO: Hapus atau ubah logic ini untuk production
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Cek apakah ada user dengan email yang diberikan
    const findUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    // Jika user dengan email tersebut sudah ada, login berhasil
    if (findUser.length > 0) {
      return Response.json({ message: "Login successful" }, { status: 200 });
    }

    // Jika tidak ada user dengan email tersebut, cek apakah ada user sama sekali di database
    const allUsers = await db.select().from(users);

    // Jika tidak ada user sama sekali di database, buat user baru dengan role admin
    // Ini untuk testing sementara - auto register user pertama sebagai admin
    if (allUsers.length === 0) {
      const newUser = await db
        .insert(users)
        .values({
          name: body.name || body.email.split("@")[0] || "Admin",
          email: body.email,
          role: "admin",
        })
        .returning();

      return Response.json(
        { message: "Login successful", user: newUser[0] },
        { status: 200 }
      );
    }

    // Jika ada user lain tapi email tidak ditemukan, tetap buat user baru (untuk testing)
    // TODO: Untuk production, seharusnya return login failed
    const newUser = await db
      .insert(users)
      .values({
        name: body.name || body.email.split("@")[0] || "User",
        email: body.email,
        role: "admin", // Default role untuk user baru setelah ada admin pertama
      })
      .returning();

    return Response.json(
      { message: "Login successful", user: newUser[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in login route:", error);
    return Response.json({ error: "Failed to process login" }, { status: 500 });
  }
}
