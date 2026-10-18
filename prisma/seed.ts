import {
  PrismaClient,
  UserRole,
  CustomerType,
  PersonType,
  CustomerStatus,
  PriorityLevel,
  LeadSource,
  StockUnit,
  PostStatus,
} from "@prisma/client";
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

  // 1.1 Super Administrador
  const superAdminPasswordHash = await bcrypt.hash("Omeg@256489", 10);
  const superAdminUser = await prisma.user.upsert({
    where: { email: "ag.codevision@gmail.com.br" },
    update: {
      passwordHash: superAdminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      name: "Super Administrador (CodeVision)",
      email: "ag.codevision@gmail.com.br",
      passwordHash: superAdminPasswordHash,
      phone: "5541999998888",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`👑 Super Administrador configurado: ${superAdminUser.email}`);

  // 1.2 Cliente Oficial do Portal do Cliente
  const customerPasswordHash = await bcrypt.hash("Cliente@Glessios2026!", 10);
  const customerUser = await prisma.user.upsert({
    where: { email: "contato@lojaconcept.com.br" },
    update: {
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      name: "Renata Vasconcelos",
      isActive: true,
    },
    create: {
      name: "Renata Vasconcelos",
      email: "contato@lojaconcept.com.br",
      passwordHash: customerPasswordHash,
      phone: "5541999998888",
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  const existingCust = await prisma.customer.findUnique({
    where: { userId: customerUser.id },
  });

  if (!existingCust) {
    await prisma.customer.create({
      data: {
        userId: customerUser.id,
        type: CustomerType.CUSTOMER,
        personType: PersonType.PJ,
        status: CustomerStatus.ACTIVE,
        companyName: "Concept Batel Comércio de Vestuário Ltda",
        tradeName: "Loja Concept Batel",
        documentNumber: "12.345.678/0001-90",
        stateRegistration: "90876543-21",
        contactPerson: "Renata Vasconcelos",
        contactRole: "Proprietária / Diretora",
        whatsapp: "5541999998888",
        phone: "554133445566",
        email: "contato@lojaconcept.com.br",
        street: "Av. do Batel",
        number: "1850",
        neighborhood: "Batel",
        city: "Curitiba",
        state: "PR",
        zipCode: "80420-090",
        referencePoint: "Próximo ao Shopping Pátio Batel",
        paymentTerms: "50% entrada e 50% na conclusão da fachada",
      },
    });
  }
  console.log(`🛍️ Cliente Oficial PJ criado: ${customerUser.email}`);

  // 1.2.1 Fornecedor Oficial de Chapas ACM e Polímeros
  let alucomexSupplier = await prisma.customer.findFirst({
    where: { documentNumber: "22.333.444/0001-55" },
  });

  if (!alucomexSupplier) {
    alucomexSupplier = await prisma.customer.create({
      data: {
        type: CustomerType.SUPPLIER,
        personType: PersonType.PJ,
        status: CustomerStatus.ACTIVE,
        companyName: "Alucomex Distribuidora de Chapas e Polímeros Ltda",
        tradeName: "Alucomex Brasil",
        documentNumber: "22.333.444/0001-55",
        stateRegistration: "10293847-56",
        contactPerson: "Rogério Antunes",
        contactRole: "Gerente Comercial Sul",
        whatsapp: "5541988887777",
        phone: "554132221100",
        email: "vendas@alucomex.com.br",
        financialEmail: "nfe@alucomex.com.br",
        street: "Rodovia BR-116",
        number: "14200",
        neighborhood: "CIC",
        city: "Curitiba",
        state: "PR",
        zipCode: "81350-010",
        pixKeyType: "CNPJ",
        pixKey: "22333444000155",
        bankName: "Itaú Unibanco",
        bankAgency: "0345",
        bankAccount: "12345-6",
        paymentTerms: "Boleto Faturado 28 dias",
        notes: "Fornecedor homologado para chapas ACM 3mm/4mm e bobinas de alumínio com garantia de 5 anos.",
      },
    });
  }
  console.log(`🚚 Fornecedor Homologado criado: Alucomex Brasil`);

  // 1.2.2 Prestador de Serviços Terceirizado (Instalação e Rapel)
  let alphaTeam = await prisma.customer.findFirst({
    where: { documentNumber: "33.444.555/0001-66" },
  });

  if (!alphaTeam) {
    alphaTeam = await prisma.customer.create({
      data: {
        type: CustomerType.SERVICE_PROVIDER,
        personType: PersonType.PJ,
        status: CustomerStatus.ACTIVE,
        companyName: "Equipe Alpha Instalações e Trabalho em Altura ME",
        tradeName: "Alpha Montagens & Rapel",
        documentNumber: "33.444.555/0001-66",
        contactPerson: "Valmir Siqueira",
        contactRole: "Líder Operacional de Campo",
        whatsapp: "5541977776666",
        email: "contato@alphamontagens.com.br",
        street: "Rua Marechal Deodoro",
        number: "500",
        neighborhood: "Centro",
        city: "Curitiba",
        state: "PR",
        zipCode: "80010-010",
        pixKeyType: "PHONE",
        pixKey: "5541977776666",
        bankName: "Nubank",
        paymentTerms: "Pagamento 50% na saída e 50% após termo de instalação",
        notes: "Equipe certificada NR-35 (Trabalho em Altura) e NR-10 (Segurança em Eletricidade para luminosos).",
      },
    });
  }
  console.log(`🔧 Prestador de Serviços parceiro criado: Alpha Montagens`);

  // 1.2.3 Cliente Pessoa Física (PF)
  let drMarcelo = await prisma.customer.findFirst({
    where: { documentNumber: "111.222.333-44" },
  });

  if (!drMarcelo) {
    drMarcelo = await prisma.customer.create({
      data: {
        type: CustomerType.CUSTOMER,
        personType: PersonType.PF,
        status: CustomerStatus.ACTIVE,
        fullName: "Dr. Marcelo Silveira",
        tradeName: "Consultório Odontologia Estética",
        documentNumber: "111.222.333-44",
        rg: "7.890.123-4",
        whatsapp: "5541966665555",
        email: "marcelo.odonto@gmail.com",
        street: "Rua Sete de Setembro",
        number: "4200",
        complement: "Conjunto 804",
        neighborhood: "Batel",
        city: "Curitiba",
        state: "PR",
        zipCode: "80240-000",
        referencePoint: "Próximo à Praça do Japão",
        notes: "Cliente exigente com acabamento em acrílico leitoso e iluminação indireta quente 3000K.",
      },
    });
  }
  console.log(`👤 Cliente Pessoa Física (PF) criado: Dr. Marcelo Silveira`);

  // 1.3 Alias Demo do Cliente
  await prisma.user.upsert({
    where: { email: "renata@conceptbatel.com.br" },
    update: {
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      name: "Renata Vasconcelos",
      isActive: true,
    },
    create: {
      name: "Renata Vasconcelos",
      email: "renata@conceptbatel.com.br",
      passwordHash: customerPasswordHash,
      phone: "5541999998888",
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });
  console.log("🛍️ Alias de e-mail do cliente configurado.");
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
