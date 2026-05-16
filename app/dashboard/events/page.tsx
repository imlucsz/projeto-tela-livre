import { redirect } from "next/navigation";
import { auth } from "@/auth";
import EventsManagement from "@/components/dashboard/events-management";

export default async function EventsPage() {
  const session = await auth();

  // Verificar autenticação e permissão
  const userRole = session?.user?.role || "USER";
  if (!session || (userRole !== "ADMIN" && userRole !== "NGO")) {
    redirect("/");
  }

  return <EventsManagement />;
}
