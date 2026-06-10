import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Navbar from "./components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen">
      <Navbar
        username={session.username}
        profileImageUrl={session.profileImageUrl}
      />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">{children}</main>
    </div>
  );
}
