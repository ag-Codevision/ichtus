import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings/system-settings";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/crm/leads/[id]/generate-ai-docs
 * Gera ou aprimora com IA o conteúdo dinâmico da Proposta Comercial e do Contrato
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { docType = "both", customInstructions = "" } = body;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        helper: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Trabalho não encontrado." },
        { status: 404 }
      );
    }

    const settings = getSystemSettings();
    const docConfig = settings.documents;

    const clientName =
      lead.customer?.companyName ||
      lead.customer?.tradeName ||
      lead.customer?.fullName ||
      lead.contactName;

    const clientDoc =
      lead.customer?.documentNumber || "Não informado";

    const clientPhone =
      lead.contactPhone ||
      lead.customer?.whatsapp ||
      lead.customer?.phone ||
      "Não informado";

    const clientAddress = lead.customer?.street
      ? `${lead.customer.street}, ${lead.customer.number || "S/N"}${
          lead.customer.complement ? ` - ${lead.customer.complement}` : ""
        } - ${lead.customer.neighborhood || ""}, ${lead.customer.city || ""}/${
          lead.customer.state || ""
        }`
      : "Endereço a confirmar no ato da instalação";

    const helperText = lead.helper
      ? `${lead.helper.fullName || lead.helper.tradeName} (Prestador/Auxiliar de Campo)`
      : "Equipe técnica interna Glessios";

    const formattedValue = lead.estimatedValue
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(lead.estimatedValue))
      : "A combinar sob medição técnica";

    const toolsList =
      Array.isArray(lead.tools) && lead.tools.length > 0
        ? lead.tools.join(", ")
        : "Ferramentas padrão de comunicação visual e montagem";

    const voltageInfo = lead.voltage ? `${lead.voltage}` : "110V / 220V Bivolt";
    const paintInfo = lead.paintDetails || "Pintura automotiva PU / Esmalte Sintético industrial padrão";
    const freightInfo = lead.freightDetails || "Incluso com entrega e descarga técnica no local da obra";

    // 1. GERAÇÃO DINÂMICA DA PROPOSTA TÉCNICA
    const generatedProposal = `
# PROPOSTA COMERCIAL & ESCOPO TÉCNICO
**ID do Orçamento:** [${lead.budgetCode || "3000"}]
**Data de Emissão:** ${new Date().toLocaleDateString("pt-BR")}
**Validade da Proposta:** ${docConfig.proposalValidityDays} dias corridos

---

### 1. DADOS DAS PARTES
**CONTRATADA (FORNECEDORA):**
* Razão Social: **${docConfig.companyLegalName}** (Nome Fantasia: **${docConfig.companyTradeName}**)
* CNPJ: **${docConfig.cnpj}** ${docConfig.stateRegistration ? `| Insc. Estadual: ${docConfig.stateRegistration}` : ""}
* Endereço: ${docConfig.address} - ${docConfig.city}/${docConfig.state}
* Contato: ${docConfig.phone} | WhatsApp: ${docConfig.whatsapp} | E-mail: ${docConfig.email}

**CONTRATANTE (CLIENTE):**
* Nome / Razão Social: **${clientName}**
* CPF / CNPJ: **${clientDoc}**
* Contato Direto: ${lead.contactName} (${clientPhone})
* Endereço da Instalação: ${clientAddress}

---

### 2. ESCOPO DO PROJETO & ESPECIFICAÇÕES
* **Identificação do Trabalho:** ${lead.title}
* **Descrição Geral e Memorial:** ${lead.notes || "Execução e fornecimento de engenharia visual sob medida."}
* **Voltagem e Ponto Elétrico no Local:** ${voltageInfo}
* **Especificação de Pintura & Acabamento:** ${paintInfo}
* **Logística e Frete:** ${freightInfo}
* **Equipe & Auxiliar Responsável:** ${helperText}
* **Recursos e Ferramentas Empregadas:** ${toolsList}

---

### 3. CONDIÇÕES COMERCIAIS & INVESTIMENTO
* **Valor Total do Projeto:** **${formattedValue}**
* **Forma de Pagamento:** Conforme negociação (Entrada 50% + Saldo na Entrega / PIX: ${docConfig.pixKey || "Chave cadastrada na empresa"})
* **Prazo de Fabricação:** A combinar após aprovação final do layout digital
* **Garantia Técnica:** ${docConfig.defaultWarrantyMonths} meses contra defeitos de fabricação e montagem

---
${docConfig.proposalFooterNotes || "Proposta sujeita a reavaliação caso ocorram alterações estruturais no local da instalação."}
`.trim();

    // 2. GERAÇÃO DINÂMICA DO CONTRATO DE PRESTAÇÃO DE SERVIÇOS
    const generatedContract = `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS E COMUNICAÇÃO VISUAL
**Ref. Orçamento:** [${lead.budgetCode || "3000"}]

Pelo presente instrumento particular, de um lado:
**CONTRATADA:** **${docConfig.companyLegalName}**, pessoa jurídica de direito privado, inscrita no CNPJ sob nº **${docConfig.cnpj}**, com sede em ${docConfig.address}, ${docConfig.city}/${docConfig.state}, neste ato representada na forma de seus atos constitutivos;

E, de outro lado:
**CONTRATANTE:** **${clientName}**, inscrito(a) no CPF/CNPJ sob o nº **${clientDoc}**, com endereço em ${clientAddress}, contato (${clientPhone});

Têm, entre si, justo e acordado o presente Contrato, que se regerá pelas seguintes cláusulas e condições:

### CLÁUSULA PRIMEIRA - DO OBJETO
O presente contrato tem por objeto a fabricação, acabamento e montagem/instalação referente ao projeto **${lead.title}**, de acordo com as especificações técnicas detalhadas no Orçamento nº **[${lead.budgetCode || "3000"}]**, memoriais aprovados e descrições a seguir:
* **Especificações:** ${lead.notes || "Conforme memorial aprovado entre as partes."}
* **Alimentação Elétrica:** ${voltageInfo}
* **Pintura e Tratamento:** ${paintInfo}
* **Logística/Frete:** ${freightInfo}

### CLÁUSULA SEGUNDA - DO PREÇO E FORMA DE PAGAMENTO
Pela prestação dos serviços e fornecimento dos materiais, a CONTRATANTE pagará à CONTRATADA o valor total de **${formattedValue}**, a ser adimplido conforme os termos acordados entre as partes.

### CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DAS PARTES
I - A CONTRATADA obriga-se a utilizar materiais de qualidade compatível com o setor, mobilizar ferramentas apropriadas (${toolsList}) e alocar mão de obra técnica qualificada.
II - A CONTRATANTE compromete-se a viabilizar o acesso seguro ao local da instalação, garantir a liberação do ponto de energia (${voltageInfo}) e realizar a conferência final dos serviços.

### CLÁUSULA QUARTA - DA GARANTIA
A CONTRATADA oferece a garantia de **${docConfig.defaultWarrantyMonths} meses** sobre a estrutura e serviços executados, contados a partir da data de entrega da obra, excluindo-se danos decorrentes de mau uso, intempéries extremas extraordinárias ou intervenção de terceiros não autorizados.

### CLÁUSULA QUINTA - DO FORO
Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o Foro da Comarca de **${docConfig.contractDefaultJurisdiction || `${docConfig.city}/${docConfig.state}`}**, com expressa renúncia a qualquer outro, por mais privilegiado que seja.

${docConfig.contractGeneralClauses ? `\n### CLÁUSULAS GERAIS COMPLEMENTARES\n${docConfig.contractGeneralClauses}` : ""}

E, por estarem justas e contratadas, as partes firmam o presente instrumento em vias de igual teor e forma.

________________________________________
**CONTRATADA:** ${docConfig.companyLegalName}
CNPJ: ${docConfig.cnpj}

________________________________________
**CONTRATANTE:** ${clientName}
CPF/CNPJ: ${clientDoc}
`.trim();

    // Atualiza o lead no banco de dados com os conteúdos gerados
    const dataToSave: any = {};
    if (docType === "proposal" || docType === "both") {
      dataToSave.proposalContent = generatedProposal;
    }
    if (docType === "contract" || docType === "both") {
      dataToSave.contractContent = generatedContract;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: dataToSave,
    });

    return NextResponse.json({
      success: true,
      proposalContent: updated.proposalContent,
      contractContent: updated.contractContent,
      message: "Documentos atualizados e gerados com sucesso!",
    });
  } catch (error: any) {
    console.error("[CRM AI Docs] Erro ao gerar documentos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao gerar documentos técnicos.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
