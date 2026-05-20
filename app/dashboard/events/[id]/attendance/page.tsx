import { redirect } from "next/navigation";
import { auth } from "@/auth";
import EventAttendance from "@/components/dashboard/event-attendance";

interface Params {
  params: {
    id: string;
  };
}

export default async function AttendancePage({ params }: Params) {
  const session = await auth();
  const userRole = session?.user?.role || "USER";

  if (!session || (userRole !== "ADMIN" && userRole !== "NGO")) {
    redirect("/");
  }

  return <EventAttendance eventId={params.id} />;
}
