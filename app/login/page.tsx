"use client";

// Halaman Login dengan Firebase Auth (Email/Password)
// KODE LAMA (dikomentari): versi Google Sign-In ada di bawah.
// PERUBAHAN: Mengganti ke form email/password standar.

import { useEffect, useState } from "react";
import { getFirebaseAuth, loginWithEmail } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Hanya login. Pendaftaran akun dinonaktifkan.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      window.location.href = "/";
    } catch (e: any) {
      setError(e?.message ?? "Gagal memproses");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Sudah masuk</h1>
          <p className="text-sm text-muted-foreground">Halo, {user.displayName || user.email}</p>
          <Link href="/" className="text-primary underline">Ke dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-sm text-muted-foreground">Gunakan email dan kata sandi</p>
        </div>
        {error && (
          <div className="rounded border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-md border px-3 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <button
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <span>{loading ? "Memproses..." : "Masuk"}</span>
        </button>
        {/* Pendaftaran dinonaktifkan */}
        <p className="text-center text-xs text-muted-foreground">Dengan masuk, Anda menyetujui ketentuan penggunaan.</p>
      </form>
    </div>
  );
}

// KODE LAMA (dikomentari): Versi Google Sign-In
// const handleGoogleLogin = async () => {
//   setError(null);
//   try {
//     await signInWithGooglePopup();
//     window.location.href = "/";
//   } catch (e: any) {
//     setError(e?.message ?? "Gagal login");
//   }
// };
