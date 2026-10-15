import { PrismaClient, UserRole, PriorityLevel, LeadSource, StockUnit, PostStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados Glessios...");

  // 1. Usuário Administrador Padrão
  const adminPasswordHash = await bcrypt.hash("Admin@Glessios2026!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@glessios.com.br" },
    update: {},
    create: {
      name: "Administrador Geral Glessios",
      email: "admin@glessios.com.br",
      passwordHash: adminPasswordHash,
      phone: "5541999990000",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`👤 Administrador criado: ${adminUser.email}`);

  // 2. Colunas do Kanban CRM (conforme RF-03.1 da SPEC.md)
  const columns = [
    { name: "Novo Lead", order: 1, color: "#3B82F6", isSystem: true },
    { name: "Briefing / Qualificação", order: 2, color: "#8B5CF6", isSystem: true },
    { name: "Proposta Enviada", order: 3, color: "#F59E0B", isSystem: true },
    { name: "Aprovado", order: 4, color: "#10B981", isSystem: true },
    { name: "Em Produção", order: 5, color: "#FF650F", isSystem: true },
    { name: "Entregue / Concluído", order: 6, color: "#059669", isSystem: true },
    { name: "Perdido", order: 7, color: "#EF4444", isSystem: true },
  ];

  for (const col of columns) {
    const existing = await prisma.kanbanColumn.findFirst({
      where: { name: col.name },
    });
    if (!existing) {
      await prisma.kanbanColumn.create({
        data: col,
      });
    }
  }
  console.log(`📋 ${columns.length} colunas do CRM Kanban configuradas.`);

  // 3. Insumos Básicos de Comunicação Visual (Estoque)
  const stockItems = [
    {
      sku: "ACM-PRATA-3MM",
      name: "Chapa ACM 3mm Prata Brilho (1.22x5.00m)",
      category: "Chapas",
      unit: StockUnit.M2,
      currentQuantity: 120.0,
      minQuantity: 30.0,
      averageUnitCost: 110.0,
      supplier: "Alucomex Indústria",
      location: "Galpão A - Prateleira 01",
    },
    {
      sku: "ACM-PRETO-3MM",
      name: "Chapa ACM 3mm Preto Fosco (1.22x5.00m)",
      category: "Chapas",
      unit: StockUnit.M2,
      currentQuantity: 95.0,
      minQuantity: 25.0,
      averageUnitCost: 115.0,
      supplier: "Alucomex Indústria",
      location: "Galpão A - Prateleira 02",
    },
    {
      sku: "LONA-440G-FOSCA",
      name: "Bobina Lona 440g Frontlight Fosca (3.20x50m)",
      category: "Lonas",
      unit: StockUnit.M2,
      currentQuantity: 320.0,
      minQuantity: 80.0,
      averageUnitCost: 14.5,
      supplier: "Vinilsul Distribuidora",
      location: "Galpão B - Racks de Bobinas",
    },
    {
      sku: "VINIL-ADES-BRANCO",
      name: "Vinil Adesivo Polimérico Branco Brilho (1.52x50m)",
      category: "Adesivos",
      unit: StockUnit.M2,
      currentQuantity: 220.0,
      minQuantity: 50.0,
      averageUnitCost: 18.0,
      supplier: "Alltak",
      location: "Galpão B - Racks de Vinil",
    },
    {
      sku: "LED-MOD-2835-12V",
      name: "Módulo LED 2835 1.5W 12V 6500K Injetado IP68",
      category: "LEDs",
      unit: StockUnit.UNIT,
      currentQuantity: 1500.0,
      minQuantity: 300.0,
      averageUnitCost: 2.8,
      supplier: "Neon Iluminação",
      location: "Bancada Elétrica - Gaveta 04",
    },
    {
      sku: "FONTE-12V-400W",
      name: "Fonte Chaveada Slim Blindada 12V 33.3A 400W IP67",
      category: "Fontes",
      unit: StockUnit.UNIT,
      currentQuantity: 40.0,
      minQuantity: 10.0,
      averageUnitCost: 135.0,
      supplier: "Neon Iluminação",
      location: "Bancada Elétrica - Gaveta 01",
    },
    {
      sku: "ACRILICO-CRISTAL-4MM",
      name: "Chapa Acrílico Cast Cristal 4mm (2.00x1.00m)",
      category: "Acrílicos",
      unit: StockUnit.SHEET,
      currentQuantity: 18.0,
      minQuantity: 5.0,
      averageUnitCost: 320.0,
      supplier: "AcrilSul",
      location: "Galpão A - Prateleira Acrílicos",
    },
  ];

  for (const item of stockItems) {
    await prisma.stockItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }
  console.log(`📦 ${stockItems.length} insumos de estoque cadastrados.`);

  // 4. Projeto Piloto de Portfólio
  await prisma.portfolioProject.upsert({
    where: { slug: "fachada-corporativa-acm-tech-tower" },
    update: {},
    create: {
      title: "Fachada Estruturada em ACM & Letreiro LED — Tech Tower",
      slug: "fachada-corporativa-acm-tech-tower",
      category: "Fachadas",
      clientName: "Tech Tower Empreendimentos",
      description:
        "Projeto arquitetônico executado com 180m² de ACM 4mm grafite metálico, letras bloco em aço inoxidável escovado com retroiluminação LED 6000K e pórtico de entrada de alta durabilidade.",
      featuredImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
      galleryImages: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      ],
      tags: ["ACM Grafite", "Letra Caixa Inox", "LED Indireto", "Curitiba"],
      isFeatured: true,
      completedAt: new Date("2026-08-15"),
    },
  });
  console.log("🎨 Projeto de portfólio criado.");

  // 5. Post de Blog Inicial
  await prisma.blogPost.upsert({
    where: { slug: "tendencias-fachadas-acm-iluminacao-led-2027" },
    update: {},
    create: {
      title: "Tendências de Fachadas em ACM com Iluminação LED Indireta para 2027",
      slug: "tendencias-fachadas-acm-iluminacao-led-2027",
      excerpt:
        "Descubra como o ACM combinado à iluminação indireta transforma a fachada do seu imóvel comercial em uma referência arquitetônica memorável.",
      contentMarkdown: `## A Revolução Arquitetônica do ACM no Varejo e Serviços

A fachada de um empreendimento é o primeiro ponto de contato sensorial entre a marca e o consumidor. Em um mercado altamente visual e competitivo, materiais como o **ACM (Alumínio Composto)** deixaram de ser apenas acabamento para se tornarem a espinha dorsal da identidade corporativa.

### Vantagens do ACM de Alta Performance:
- **Resistência Mecânica:** Não empena e suporta ventos e intempéries sem perder planicidade.
- **Isolamento Térmico e Acústico:** Proporciona conforto energético ao interior da edificação.
- **Variedade de Acabamentos:** Desde o grafite escovado até cores corporativas personalizadas.

### O Poder do LED Indireto
A iluminação por trás das letras-caixa (efeito *halo* ou contraluz) cria profundidade dramática durante a noite, destacando a marca a centenas de metros sem agredir a visão com reflexos excessivos.`,
      coverImageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
      imageAlt: "Fachada moderna com placas de ACM e iluminação linear",
      imagePhotographer: "Unsplash Pro",
      status: PostStatus.PUBLISHED,
      metaTitle: "Fachadas em ACM com LED Indireto: Tendências e Guia Técnico",
      metaDescription:
        "Descubra como o ACM combinado com iluminação LED indireta transforma a fachada do seu negócio e valoriza sua marca com durabilidade de 15 anos.",
      tags: ["ACM", "LED", "Comunicação Visual", "Arquitetura Comercial"],
      readingTimeMin: 5,
      viewCount: 120,
    },
  });
  console.log("✍️ Post inicial do blog cadastrado.");

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
