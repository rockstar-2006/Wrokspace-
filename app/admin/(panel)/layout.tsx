import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin/adminEmails";
import { AdminDataProvider } from "@/components/admin/AdminDataContext";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/** Server-side gate for every Host console page (in addition to middleware). */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/admin/login");
  if (!isAdminEmail(email)) redirect("/admin/login?error=not_admin");

  const admin = {
    email,
    name: session!.user!.name || email.split("@")[0],
    image: session!.user!.image || undefined,
  };

  return (
    <ToastProvider>
      <AdminDataProvider admin={admin}>
        <AdminShell>{children}</AdminShell>
      </AdminDataProvider>
    </ToastProvider>
  );
}
