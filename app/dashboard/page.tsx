import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CinemaDashboard } from "@/components/dashboard/cinema-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  console.log("[DEBUG] /dashboard - entered page.tsx", {
    now: new Date().toISOString(),
    hasSession: !!session,
    hasUser: !!session?.user,
    userRole: (session?.user as any)?.role,
    userId: (session?.user as any)?.id,
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
