"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, X, Clock, AlertCircle } from "lucide-react";

interface NGORequest {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function NGORequestsComponent() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<NGORequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;
    fetchRequests();
  }, [isAdmin]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ong-requests", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar solicitações");
      }

      const data = await res.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar solicitações de ONG");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string, userName: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/ong-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, action: "approve" }),
      });

      if (!res.ok) {
        throw new Error("Erro ao aprovar");
      }

      toast.success(`✓ ${userName} agora é uma ONG!`);
      setRequests(requests.filter((r) => r._id !== userId));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao aprovar solicitação");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/ong-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, action: "reject" }),
      });

      if (!res.ok) {
        throw new Error("Erro ao rejeitar");
      }

      toast.success(`✗ Solicitação de ${userName} rejeitada`);
      setRequests(requests.filter((r) => r._id !== userId));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao rejeitar solicitação");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-400 animate-spin" />
          <p className="text-amber-200/60">Carregando solicitações...</p>
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-green-400" />
          <p className="text-amber-200/60">Nenhuma solicitação de ONG pendente</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Solicitações de ONG
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
              {requests.length}
            </Badge>
          </h3>
        </div>

        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request._id}
              className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-amber-500/10 hover:bg-black/30 transition-all"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{request.name}</p>
                <p className="text-xs text-amber-200/60 truncate">{request.email}</p>
                <p className="text-xs text-amber-200/40 mt-1">
                  Solicitado em {new Date(request.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  disabled={processingId !== null}
                  onClick={() => handleApprove(request._id, request.name)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 gap-2"
                >
                  <Check className="h-4 w-4" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  disabled={processingId !== null}
                  onClick={() => handleReject(request._id, request.name)}
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                  Rejeitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
