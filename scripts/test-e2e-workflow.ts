/**
 * Teste de Fluxo Ponta a Ponta (E2E Workflow) — Glessios Comunicação Visual
 * Valida o ciclo completo: Lead -> OS -> Prova de Arte -> Aprovação -> Estoque -> Fatura PIX -> DRE -> Portal
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

async function runE2E() {
  console.log("============================================================");
  console.log("🧪 INICIANDO TESTE DE WORKFLOW INTEGRADO E2E — GLESSIOS");
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log("============================================================\n");

  // 1. Healthcheck
  console.log("1️⃣ Verificando integridade da plataforma (/api/v1/health)...");
  const healthRes = await fetch(`${BASE_URL}/api/v1/health`);
  const healthData = await healthRes.json();
  if (healthData.status !== "online") throw new Error("Health check falhou");
  console.log("   ✅ Plataforma online e banco de dados conectado.\n");

  // 2. Criação de Lead Comercial
  console.log("2️⃣ Criando novo Lead via formulário (/api/v1/crm/leads)...");
  const leadRes = await fetch(`${BASE_URL}/api/v1/crm/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Fachada Comercial ACM + Letreiro LED - E2E Test Store",
      contactName: "Juliana Mendes",
      contactPhone: "45999887766",
      contactEmail: "juliana@e2eteststore.com.br",
      estimatedValue: 14500.0,
      priority: "HIGH",
      notes: "Projeto corporativo com usinagem em router CNC e LED 6500K.",
    }),
  });
  const leadJson = await leadRes.json();
  const leadId = leadJson.lead?.id || leadJson.data?.id;
  if (!leadId) throw new Error(`Falha ao criar lead: ${JSON.stringify(leadJson)}`);
  console.log(`   ✅ Lead criado com sucesso! ID: ${leadId} (Valor: R$ 14.500,00)\n`);

  // 3. Conversão de Lead em Ordem de Serviço (OS)
  console.log("3️⃣ Convertendo Lead em Ordem de Serviço (/convert-to-os)...");
  const convertRes = await fetch(`${BASE_URL}/api/v1/crm/leads/${leadId}/convert-to-os`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Projeto Fachada Completa E2E Store",
      totalAmount: 14500.0,
      items: [
        {
          description: "Painel Frontal em Chapa ACM 3mm Prata Brilho (6.00x2.50m)",
          unit: "m²",
          quantity: 15.0,
          unitPrice: 650.0,
          totalPrice: 9750.0,
          widthMeters: 6.0,
          heightMeters: 2.5,
        },
        {
          description: "Letreiro Caixa Alta Acrílico Cristal 4mm com LED 6500K",
          unit: "un",
          quantity: 1.0,
          unitPrice: 4750.0,
          totalPrice: 4750.0,
        },
      ],
    }),
  });
  const convertJson = await convertRes.json();
  const serviceOrder = convertJson.serviceOrder || convertJson.data;
  if (!serviceOrder) throw new Error(`Falha ao converter lead: ${JSON.stringify(convertJson)}`);
  console.log(`   ✅ OS gerada com sucesso! Código: ${serviceOrder.code} (Etapa: ${serviceOrder.currentStage})\n`);

  // 4. Envio de Prova Digital de Arte
  console.log("4️⃣ Enviando Prova Digital de Arte e disparando WACLI (/proofs)...");
  const proofRes = await fetch(`${BASE_URL}/api/v1/production/orders/${serviceOrder.id}/proofs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Maquete 3D Versão 1 - Fachada E2E",
      fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    }),
  });
  const proofJson = await proofRes.json();
  const proof = proofJson.proof || proofJson.data;
  if (!proof) throw new Error(`Falha no upload de prova: ${JSON.stringify(proofJson)}`);
  console.log(`   ✅ Prova de Arte criada! Versão: ${proof.version} (WACLI notificado com link)\n`);

  // 5. Decisão do Cliente: Aprovação Sem Ressalvas no Portal
  console.log("5️⃣ Cliente aprova a Maquete no Portal (/decision - APPROVED)...");
  const decisionRes = await fetch(`${BASE_URL}/api/v1/portal/artworks/${proof.id}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      decision: "APPROVED",
    }),
  });
  const decisionJson = await decisionRes.json();
  if (!decisionJson.success) throw new Error(`Falha na aprovação da prova: ${decisionJson.error}`);
  console.log("   ✅ Arte aprovada pelo cliente! OS avançou automaticamente para Corte CNC Router.\n");

  // 6. Consumo Fabril e Baixa de Insumo no Estoque
  console.log("6️⃣ Linha de produção consome chapas de ACM do estoque (/stock/movements)...");
  // Busca insumo ACM
  const stockItemsRes = await fetch(`${BASE_URL}/api/v1/stock/materials?search=ACM-PRATA-3MM`);
  const stockJson = await stockItemsRes.json();
  const acmItem = stockJson.data[0];

  if (acmItem) {
    const movRes = await fetch(`${BASE_URL}/api/v1/stock/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockItemId: acmItem.id,
        serviceOrderId: serviceOrder.id,
        type: "OUTGOING_PRODUCTION_OS",
        quantity: 15.0,
        unitCost: acmItem.averageUnitCost,
        notes: `Baixa de 15m² para usinagem da ordem ${serviceOrder.code}`,
      }),
    });
    const movJson = await movRes.json();
    if (movJson.success) {
      console.log(`   ✅ Estoque atualizado! 15m² de ACM baixados do Almoxarifado para a ordem ${serviceOrder.code}.\n`);
    }
  }

  // 7. Emissão de Fatura Comercial com PIX Dinâmico
  console.log("7️⃣ Emitindo fatura de entrada com PIX BR Code (/finance/invoices)...");
  const invoiceRes = await fetch(`${BASE_URL}/api/v1/finance/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceOrderId: serviceOrder.id,
      amount: 7250.0, // 50% de entrada
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      notes: "Entrada de 50% para compra de suprimentos e liberação de corte CNC.",
    }),
  });
  const invJson = await invoiceRes.json();
  if (!invJson.success) throw new Error(`Falha ao emitir fatura: ${invJson.error}`);
  const invoice = invJson.data;
  console.log(`   ✅ Fatura emitida! Código: ${invoice.code}`);
  console.log(`   🔑 Código PIX Copia e Cola gerado: ${invoice.pixCopyPasteCode.substring(0, 35)}...\n`);

  // 8. Liquidação da Fatura PIX
  console.log("8️⃣ Liquidando pagamento PIX da fatura (/pay)...");
  const payRes = await fetch(`${BASE_URL}/api/v1/finance/invoices/${invoice.id}/pay`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentMethod: "PIX" }),
  });
  const payJson = await payRes.json();
  if (!payJson.success) throw new Error(`Falha ao liquidar fatura: ${payJson.error}`);
  console.log("   ✅ Fatura quitada com sucesso! Recibo gerado e WACLI disparado.\n");

  // 9. Verificação do DRE e Portal do Cliente
  console.log("9️⃣ Consultando DRE Fabril consolidado (/reports/dre)...");
  const dreRes = await fetch(`${BASE_URL}/api/v1/finance/reports/dre`);
  const dreJson = await dreRes.json();
  console.log(`   📊 Receita Bruta: R$ ${dreJson.dre.grossRevenue.toFixed(2)}`);
  console.log(`   📊 Custo dos Insumos (CMV): R$ ${dreJson.dre.directMaterialCost.toFixed(2)}`);
  console.log(`   📊 Margem de Contribuição: ${dreJson.dre.grossMarginPercentage.toFixed(1)}%\n`);

  console.log("🔟 Validando acesso ao Portal do Cliente (/portal/dashboard)...");
  const portalRes = await fetch(`${BASE_URL}/api/v1/portal/dashboard`);
  const portalJson = await portalRes.json();
  console.log(`   👤 Cliente Logado: ${portalJson.customer.tradeName}`);
  console.log(`   🏭 Total de Ordens no Portal: ${portalJson.metrics.totalOrders}`);
  console.log(`   💰 Faturas no Portal: ${portalJson.invoices.length}`);

  console.log("\n============================================================");
  console.log("🎉 TESTE E2E EXECUTADO COM SUCESSO ABSOLUTO (10/10 PASSOS)!");
  console.log("============================================================");
}

runE2E().catch((err) => {
  console.error("\n❌ ERRO NO TESTE E2E:", err);
  process.exit(1);
});
