import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("🔄 Migrando usuários com papel OPERATIONAL_DESIGNER para ADMIN...");
  const result = await prisma.$executeRawUnsafe(
    `UPDATE users SET role = 'ADMIN' WHERE role = 'OPERATIONAL_DESIGNER'`
  );
  console.log(`✅ ${result} usuário(s) atualizado(s) com sucesso para o papel ADMIN.`);
}

run()
  .catch((e) => {
    console.error("Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
