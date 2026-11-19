import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminDataProvider } from "@/components/admin/AdminDataContext";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Host console — ProjectHub",
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  const admin = {
    email: email || "admin@projecthub.internal",
    name: session?.user?.name || (email ? email.split("@")[0] : "Administrator"),
    image: session?.user?.image || undefined,
  };

  return (
    <ToastProvider>
      <AdminDataProvider admin={admin}>
        <AdminShell>{children}</AdminShell>
      </AdminDataProvider>
    </ToastProvider>
  );
}
