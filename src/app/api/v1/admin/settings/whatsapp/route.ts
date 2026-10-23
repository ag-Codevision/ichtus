import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/settings/system-settings";
import { sendWhatsAppMessage } from "@/lib/whatsapp/wacli";

/**
 * GET /api/v1/admin/settings/whatsapp
 * Obtém o status da conexão do WhatsApp e o QR Code real de pareamento (Baileys)
 */
export async function GET() {
  try {
    const settings = getSystemSettings();
    const apiUrl =
      process.env.WACLI_API_URL || settings?.whatsapp?.apiUrl || "http://127.0.0.1:3001";
    const sessionName = settings.whatsapp.sessionName || "glessios-wpp";

    let isDaemonOnline = false;
    let finalStatus: "CONNECTED" | "PAIRING_REQUIRED" | "DISCONNECTED" = "DISCONNECTED";
    let qrCodeBase64: string | null = null;
    let connectedNumber: string | null = null;

    // 1. Consulta o microserviço HTTP do Baileys
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${apiUrl}/api/status`, {
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        isDaemonOnline = true;
        const data = await res.json();
        finalStatus = data.connected ? "CONNECTED" : "PAIRING_REQUIRED";
        qrCodeBase64 = data.qrCode || null;
        connectedNumber = data.phone || null;

        // Sincroniza o estado atual no system-settings local
        if (settings.whatsapp.status !== finalStatus || settings.whatsapp.connectedNumber !== connectedNumber) {
          saveSystemSettings({
            whatsapp: {
              ...settings.whatsapp,
              status: finalStatus,
              connectedNumber: connectedNumber || undefined,
              lastConnectedAt: finalStatus === "CONNECTED" ? new Date().toISOString() : settings.whatsapp.lastConnectedAt,
            },
          });
        }
      }
    } catch (fetchErr: any) {
      console.warn("[SETTINGS_WPP] Falha ao consultar microserviço:", fetchErr?.message || fetchErr);
      isDaemonOnline = false;
    }

    if (!isDaemonOnline) {
      finalStatus = "DISCONNECTED";
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      isDaemonOnline,
      sessionName,
      connectedNumber: finalStatus === "CONNECTED" ? connectedNumber : null,
      qrCode: qrCodeBase64,
      lastCheckedAt: new Date().toISOString(),
      instructions: [
        {
          step: 1,
          title: "Abra o WhatsApp",
          desc: "Abra o WhatsApp no aparelho celular oficial da empresa (Android ou iPhone).",
        },
        {
          step: 2,
          title: "Acesse Aparelhos Conectados",
          desc: "Toque nos três pontos ⋮ (Android) ou Ajustes / Configurações ⚙️ (iPhone) e selecione 'Aparelhos Conectados'.",
        },
        {
          step: 3,
          title: "Escanear QR Code",
          desc: "Toque em 'Conectar um Aparelho' e aponte a câmera para o QR Code ao lado. O pareamento é imediato.",
        },
        {
          step: 4,
          title: "Sincronização Automática",
          desc: "Após a leitura, a tela atualizará sozinha e o WhatsApp estará ativo para disparos reais.",
        },
      ],
    });
  } catch (error: any) {
    console.error("[SETTINGS_WPP] Erro ao obter status do WhatsApp:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao consultar status do WhatsApp." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/settings/whatsapp
 * Ações: test_send, disconnect, save_settings
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const currentSettings = getSystemSettings();
    const apiUrl =
      process.env.WACLI_API_URL || currentSettings?.whatsapp?.apiUrl || "http://127.0.0.1:3001";

    if (action === "test_send") {
      const { to, message } = body;
      if (!to || !message) {
        return NextResponse.json(
          { success: false, error: "Informe o número de destino e o texto da mensagem." },
          { status: 400 }
        );
      }

      const result = await sendWhatsAppMessage({ to, message });

      const destinationInfo = result.resolvedJid
        ? result.resolvedJid.split("@")[0]
        : to.replace(/\D/g, "");

      const isSelf = Boolean(result.isSelf);

      return NextResponse.json({
        success: result.success,
        mode: result.mode,
        messageId: result.messageId,
        resolvedJid: result.resolvedJid,
        verified: result.verified,
        isSelf,
        error: result.error,
        message: result.success
          ? isSelf
            ? `Disparo concluído! Atenção: o número de destino (+${destinationInfo}) é o mesmo aparelho pareado no sistema.`
            : `Disparo efetuado com sucesso para o destinatário +${destinationInfo}!`
          : result.error || "Falha no disparo da mensagem.",
      });
    }

    if (action === "disconnect") {
      // Notifica o microserviço Baileys para fazer logout real e limpar tokens
      try {
        await fetch(`${apiUrl}/api/disconnect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).catch(() => null);
      } catch (e) {
        console.warn("[SETTINGS_WPP] Aviso ao enviar disconnect para microserviço:", e);
      }

      const updated = saveSystemSettings({
        whatsapp: {
          ...currentSettings.whatsapp,
          status: "PAIRING_REQUIRED",
          connectedNumber: undefined,
          lastConnectedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        status: updated.whatsapp.status,
        message: "Sessão desconectada. Novo QR Code gerado para pareamento.",
      });
    }

    if (action === "save_settings") {
      const { whatsapp } = body;
      const updated = saveSystemSettings({
        whatsapp: {
          ...currentSettings.whatsapp,
          ...whatsapp,
        },
      });

      return NextResponse.json({
        success: true,
        whatsapp: updated.whatsapp,
        message: "Configurações do WhatsApp salvas com sucesso!",
      });
    }

    return NextResponse.json(
      { success: false, error: `Ação desconhecida: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[SETTINGS_WPP] Erro ao processar requisição:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
