import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Validação de conectividade real com o PostgreSQL
    const userCount = await prisma.user.count();
    const columnsCount = await prisma.kanbanColumn.count();
    const stockItemsCount = await prisma.stockItem.count();

    return NextResponse.json({
      status: "online",
      system: "Plataforma Integrada Glessios - Comunicação Visual",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        stats: {
          users: userCount,
          kanbanColumns: columnsCount,
          stockItems: stockItemsCount,
        },
      },
      tokens: {
        theme: "Dark Editorial + Laranja Vibrante + Warm Ivory",
        primaryColor: "#FF650F",
        baseBackground: "#0B0C0D",
      },
    });
  } catch (error) {
    console.error("Erro no health check:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Falha na conexão com os serviços essenciais",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
