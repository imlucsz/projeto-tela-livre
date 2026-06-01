import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User, { UserRole } from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Apenas ADMIN pode acessar
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    await connectDB();

    // Buscar usuários que solicitaram ser ONG e ainda estão com role USER
    const pendingRequests = await User.find({
      ngoRequested: true,
      role: UserRole.USER,
    }).select("_id name email ngoRequested createdAt").sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests,
    });
  } catch (error) {
    console.error("[ONG REQUESTS GET]", error);
    return NextResponse.json(
      { error: "Erro ao buscar solicitações" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    // Apenas ADMIN pode aprovar/rejeitar
    if (!session || session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action } = body; // action: 'approve' ou 'reject'

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "userId e action (approve/reject) são obrigatórios" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (!user.ngoRequested) {
      return NextResponse.json(
        { error: "Usuário não tem solicitação ativa de ONG" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Aprovar: mudar role para NGO
      user.role = UserRole.NGO;
      user.ngoRequested = false;
      user.showNgoApprovedNotification = true;
      await user.save();

      return NextResponse.json({
        success: true,
        message: "ONG aprovada com sucesso",
        data: {
          userId: user._id,
          name: user.name,
          role: user.role,
        },
      });
    } else {
      // Rejeitar: remover solicitação
      user.ngoRequested = false;
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Solicitação rejeitada",
        data: {
          userId: user._id,
          name: user.name,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.error("[ONG REQUESTS PATCH]", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
