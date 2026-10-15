import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Sincronizando usuários para os 2 roles unificados do sistema...");

  // 1. Role ADMIN (Administração Geral & Gestão Operacional Fabril Completa)
  const adminPass = await bcrypt.hash("Admin@Glessios2026!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@glessios.com.br" },
    update: {
      passwordHash: adminPass,
      isActive: true,
      role: UserRole.ADMIN,
      name: "Administrador Geral & Operações",
    },
    create: {
      name: "Administrador Geral & Operações",
      email: "admin@glessios.com.br",
      passwordHash: adminPass,
      phone: "5541999990000",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ [ADMIN Principal] ${admin.email} (Senha: Admin@Glessios2026!)`);

  // 2. Operador Técnico / Projetista (Unificado sob o papel ADMIN)
  const designerPass = await bcrypt.hash("Designer@Glessios2026!", 10);
  const designer = await prisma.user.upsert({
    where: { email: "projetista@glessios.com.br" },
    update: {
      passwordHash: designerPass,
      isActive: true,
      role: UserRole.ADMIN,
      name: "Carlos Mendes (Admin / Projetista)",
    },
    create: {
      name: "Carlos Mendes (Admin / Projetista)",
      email: "projetista@glessios.com.br",
      passwordHash: designerPass,
      phone: "5541988881111",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ [ADMIN / Projetista] ${designer.email} (Senha: Designer@Glessios2026!)`);

  // 3. Role CUSTOMER (Cliente Contratante - Acesso Exclusivo ao Portal do Cliente)
  const customerPass = await bcrypt.hash("Cliente@Glessios2026!", 10);
  const customerUser = await prisma.user.upsert({
    where: { email: "contato@lojaconcept.com.br" },
    update: {
      passwordHash: customerPass,
      isActive: true,
      role: UserRole.CUSTOMER,
      name: "Renata Vasconcelos",
    },
    create: {
      name: "Renata Vasconcelos",
      email: "contato@lojaconcept.com.br",
      passwordHash: customerPass,
      phone: "5541999998888",
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  // Garante o perfil Customer vinculado
  const existingCust = await prisma.customer.findUnique({
    where: { userId: customerUser.id },
  });

  if (!existingCust) {
    await prisma.customer.create({
      data: {
        userId: customerUser.id,
        companyName: "Concept Batel Comércio de Vestuário Ltda",
        tradeName: "Loja Concept Batel",
        documentNumber: "12.345.678/0001-90",
        street: "Av. do Batel",
        number: "1850",
        neighborhood: "Batel",
        city: "Curitiba",
        state: "PR",
        zipCode: "80420-090",
      },
    });
  }
  console.log(`✅ [CUSTOMER] ${customerUser.email} (Senha: Cliente@Glessios2026!)`);

  // Conta de teste adicional do cliente
  const existingRenata = await prisma.user.findUnique({
    where: { email: "renata@conceptbatel.com.br" },
  });
  if (existingRenata) {
    await prisma.user.update({
      where: { email: "renata@conceptbatel.com.br" },
      data: { passwordHash: customerPass, role: UserRole.CUSTOMER },
    });
    console.log(`✅ [CUSTOMER Demo] renata@conceptbatel.com.br (Senha: Cliente@Glessios2026!)`);
  }

  console.log("\n🎉 Estrutura de papéis unificada com sucesso (ADMIN e CUSTOMER)!");
}

main()
  .catch((e) => {
    console.error("Erro ao sincronizar credenciais:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
