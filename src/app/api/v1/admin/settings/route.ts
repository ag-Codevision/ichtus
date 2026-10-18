import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/settings/system-settings";

export async function GET() {
  try {
    const settings = getSystemSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao carregar configurações." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveSystemSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Configurações atualizadas com sucesso!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao salvar configurações." },
      { status: 500 }
    );
  }
}
