import { GoogleIcon } from "@/components/icons/google";
import { signIn } from "@/server/auth";

const errorMessages: Record<string, { title: string; message: string }> = {
  AccessDenied: {
    title: "Akses Ditolak",
    message: "Anda tidak memiliki izin untuk mengakses halaman ini.",
  },
  Default: {
    title: "Terjadi Kesalahan",
    message: "Silakan coba lagi beberapa saat.",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { error } = (await searchParams) ?? {};
  const errorInfo = error && errorMessages[error] ? errorMessages[error] : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-sm text-muted-foreground">
            Gunakan akun Google Anda untuk melanjutkan
          </p>
        </div>

        {errorInfo && (
          <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            <p className="font-semibold">{errorInfo.title}</p>
            <p>{errorInfo.message}</p>
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Masuk dengan Google</span>
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Dengan masuk, Anda menyetujui ketentuan penggunaan.
        </p>
      </div>
    </div>
  );
}
