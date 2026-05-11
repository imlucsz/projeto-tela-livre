"use client";

import { useSession } from "next-auth/react";
import { CinemaDashboard } from "@/components/dashboard/cinema-dashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  // Se chegou aqui sem sessão, o middleware já redireciona
  // Renderiza o novo dashboard cinema
  return <CinemaDashboard />;
}
