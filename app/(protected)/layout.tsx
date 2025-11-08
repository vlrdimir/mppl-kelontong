"use client";

// Layout terproteksi: render header global + auth guard untuk seluruh segmen
import { useEffect, useState } from "react";
import { getFirebaseAuth, logoutFirebase } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Navigation } from "@/components/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
      if (!u) window.location.href = "/login";
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="container mx-auto px-4 py-2 flex items-center justify-end gap-3">
        {user && (
          <span className="hidden text-sm text-muted-foreground md:inline">
            {user.displayName || user.email}
          </span>
        )}
        <button
          onClick={() => logoutFirebase().then(() => (window.location.href = "/login"))}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Keluar
        </button>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
