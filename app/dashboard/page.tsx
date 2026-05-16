import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CinemaDashboard } from "@/components/dashboard/cinema-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  const userRole = session?.user?.role || "USER";
  if (!session || (userRole !== "ADMIN" && userRole !== "NGO")) {
    redirect('/');
  }

  return <CinemaDashboard />;
}
