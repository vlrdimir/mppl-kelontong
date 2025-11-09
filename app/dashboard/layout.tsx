import { Navigation, userProps } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import auth from "@/proxy";

async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  console.log(session);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <Navigation user={session?.user as userProps} />
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <Toaster />
    </div>
  );
}

export default Layout;
