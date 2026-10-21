import prisma from "@/lib/prisma";

/**
 * Gera o próximo código de identificação de orçamento sequencial inteligente
 * Regra: Número sequencial a partir de 3000 + dia + mês + ano de 2 dígitos
 * Exemplo: "3000 21 10 26"
 */
export async function generateNextBudgetCode(): Promise<string> {
  const lastLead = await prisma.lead.findFirst({
    where: {
      budgetCode: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      budgetCode: true,
    },
  });

  let nextSeq = 3000;
  if (lastLead?.budgetCode) {
    // Extrai o primeiro grupo numérico (ex: "3000" de "3000 21 10 26" ou "[3000 21 10 26]")
    const match = lastLead.budgetCode.replace(/[\[\]]/g, "").trim().match(/^(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed >= 3000) {
        nextSeq = parsed + 1;
      }
    }
  } else {
    // Se nenhum lead possui budgetCode ainda, parte de 3000 + total de leads
    const totalLeads = await prisma.lead.count();
    nextSeq = 3000 + totalLeads;
  }

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);

  return `${nextSeq} ${dd} ${mm} ${yy}`;
}
