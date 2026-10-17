import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Sincronizando usuários para os 2 roles oficiais do sistema (ADMIN e CUSTOMER)...");

  // 1. Role ADMIN Oficial (Administração Geral & Gestão Operacional Fabril Completa)
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
  console.log(`✅ [ADMIN Único] ${admin.email} (Senha: Admin@Glessios2026!)`);

  // Remove ou desativa a conta legada de projetista para manter apenas 1 conta admin
  await prisma.user.deleteMany({
    where: { email: "projetista@glessios.com.br" },
  });
  console.log("ℹ️ Conta de projetista isolada descontinuada. Todo o acesso operacional foi unificado no Admin.");

  // 2. Role CUSTOMER Oficial (Cliente Contratante - Acesso Exclusivo ao Portal do Cliente)
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
  console.log(`✅ [CUSTOMER Oficial] ${customerUser.email} (Senha: Cliente@Glessios2026!)`);

  // Conta demo espelho para o botão de 1 clique do portal
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

  console.log("\n🎉 Estrutura de papéis finalizada com sucesso: Apenas ADMIN e CUSTOMER!");
}

main()
  .catch((e) => {
    console.error("Erro ao sincronizar credenciais:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
