import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CinemaDashboard } from "@/components/dashboard/cinema-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  console.log("[DEBUG] Dashboard Page - Session:", {
    exists: !!session,
    userExists: !!session?.user,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userRole: session?.user?.role,
    roleType: typeof session?.user?.role
  });

  const userRole = session?.user?.role || "USER";
  
  console.log("[DEBUG] Dashboard - userRole check:", {
    userRole,
    isAdmin: userRole === "ADMIN",
    isNgo: userRole === "NGO",
    shouldAllow: userRole === "ADMIN" || userRole === "NGO"
  });

  if (!session) {
    console.log("[DEBUG] No session - redirecting to login");
    redirect('/login');
  }

  if (userRole !== "ADMIN" && userRole !== "NGO") {
    console.log(`[DEBUG] Role "${userRole}" not allowed - redirecting to home`);
    redirect('/');
  }

  return <CinemaDashboard />;
}
