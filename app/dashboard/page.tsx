"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CinemaDashboard } from "@/components/dashboard/cinema-dashboard";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Verificação de role (segurança extra)
    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role || 'USER';
      if (userRole !== 'ADMIN' && userRole !== 'NGO') {
        router.push('/');
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  // Se usuário sem permissão, não renderiza
  if (status === "authenticated") {
    const userRole = (session?.user as any)?.role || 'USER';
    if (userRole !== 'ADMIN' && userRole !== 'NGO') {
      return null;
    }
  }

  return <CinemaDashboard />;
}
