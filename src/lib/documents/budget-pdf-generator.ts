import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface BudgetPDFData {
  budgetCode: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  clientTradeName?: string | null;
  clientAddress?: string | null;
  estimatedValue?: number | null;
  priority?: string | null;
  dueDate?: Date | string | null;
  notes?: string | null;
  voltage?: string | null;
  tools?: string[];
  paintDetails?: string | null;
  freightDetails?: string | null;
  helperName?: string | null;
  createdAt?: Date | string | null;
}

export interface BudgetPDFResult {
  fileName: string;
  fileUrl: string;
  absolutePath: string;
  fileSize: number;
  buffer: Buffer;
}

/**
 * Remove caracteres fora da tabela WinAnsi / Latin1 para evitar falha no StandardFonts.Helvetica do pdf-lib
 */
function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos mantendo letras (á -> a, ç -> c)
    .replace(/[^\x20-\x7E\n\r]/g, " ") // mantém apenas caracteres imprimíveis ASCII
    .trim();
}

/**
 * Gerador Oficial de Orçamento e Proposta Técnica em PDF da Ícthus Comunicação Visual
 */
export async function generateBudgetPDF(data: BudgetPDFData): Promise<BudgetPDFResult> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Formato A4 padrão
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Paleta de Cores Ícthus
  const colorOrange = rgb(1.0, 0.396, 0.059); // #FF650F
  const colorDark = rgb(0.09, 0.1, 0.12);     // #17181F
  const colorZinc = rgb(0.42, 0.44, 0.48);     // #6B7280
  const colorLightBg = rgb(0.97, 0.98, 0.99);  // #F8FAFC
  const colorBorder = rgb(0.88, 0.9, 0.93);    // #E2E8F0
  const colorWhite = rgb(1.0, 1.0, 1.0);

  // 1. Faixa Superior de Destaque
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width: width,
    height: 8,
    color: colorOrange,
  });

  // 2. Logotipo da Empresa
  let logoY = height - 70;
  const logoPath = path.join(process.cwd(), "public", "logo-horizontal-escuro.png");
  const fallbackLogoPath = path.join(process.cwd(), "public", "logo.png");

  let embeddedLogo = null;
  try {
    const targetPath = fs.existsSync(logoPath) ? logoPath : (fs.existsSync(fallbackLogoPath) ? fallbackLogoPath : null);
    if (targetPath) {
      const logoBytes = fs.readFileSync(targetPath);
      embeddedLogo = await pdfDoc.embedPng(logoBytes);
    }
  } catch (err) {
    console.warn("[PDF Generator] Aviso ao carregar logo:", err);
  }

  if (embeddedLogo) {
    const logoDims = embeddedLogo.scale(0.18);
    const renderWidth = Math.min(logoDims.width, 160);
    const renderHeight = (renderWidth / logoDims.width) * logoDims.height;
    page.drawImage(embeddedLogo, {
      x: 40,
      y: height - 35 - renderHeight,
      width: renderWidth,
      height: renderHeight,
    });
  } else {
    page.drawText("ICTHUS", {
      x: 40,
      y: height - 55,
      size: 26,
      font: fontBold,
      color: colorOrange,
    });
    page.drawText("COMUNICACAO VISUAL", {
      x: 40,
      y: height - 70,
      size: 10,
      font: fontBold,
      color: colorDark,
    });
  }

  // 3. Card Superior Direito do Orçamento
  const boxWidth = 200;
  const boxHeight = 70;
  const boxX = width - 40 - boxWidth;
  const boxY = height - 90;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: colorLightBg,
    borderColor: colorOrange,
    borderWidth: 1.5,
  });

  page.drawText("ORCAMENTO / PROPOSTA TECNICA", {
    x: boxX + 12,
    y: boxY + boxHeight - 18,
    size: 8,
    font: fontBold,
    color: colorOrange,
  });

  page.drawText(`[${sanitizeText(data.budgetCode || "3000")}]`, {
    x: boxX + 12,
    y: boxY + boxHeight - 36,
    size: 15,
    font: fontBold,
    color: colorDark,
  });

  const emissionDate = formatDate(data.createdAt || new Date());
  page.drawText(`Emissao: ${emissionDate}  |  Validade: 15 dias`, {
    x: boxX + 12,
    y: boxY + 12,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  // Linha separadora do cabeçalho
  page.drawLine({
    start: { x: 40, y: height - 105 },
    end: { x: width - 40, y: height - 105 },
    thickness: 1,
    color: colorBorder,
  });

  // 4. Card: Dados do Cliente e Destino
  let currentY = height - 125;

  page.drawRectangle({
    x: 40,
    y: currentY - 65,
    width: width - 80,
    height: 65,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawText("DADOS DO CLIENTE & DESTINO DA OBRA", {
    x: 52,
    y: currentY - 16,
    size: 9,
    font: fontBold,
    color: colorDark,
  });

  const clientNameStr = sanitizeText(data.clientTradeName || data.contactName || "Cliente");
  const clientPhoneStr = sanitizeText(data.contactPhone || "Nao informado");
  const clientEmailStr = sanitizeText(data.contactEmail || "Nao informado");
  const clientAddrStr = sanitizeText(data.clientAddress || "Curitiba - PR e Regiao Metropolitana");

  page.drawText(`Cliente / Razao Social: ${clientNameStr}`, {
    x: 52,
    y: currentY - 32,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  page.drawText(`WhatsApp / Tel: ${clientPhoneStr}`, {
    x: 52,
    y: currentY - 46,
    size: 8.5,
    font: fontRegular,
    color: colorZinc,
  });

  page.drawText(`E-mail: ${clientEmailStr}`, {
    x: 280,
    y: currentY - 32,
    size: 8.5,
    font: fontRegular,
    color: colorZinc,
  });

  page.drawText(`Local da Instalacao: ${clientAddrStr}`, {
    x: 280,
    y: currentY - 46,
    size: 8.5,
    font: fontRegular,
    color: colorZinc,
  });

  // 5. Card: Escopo do Trabalho e Serviço
  currentY -= 80;

  page.drawRectangle({
    x: 40,
    y: currentY - 80,
    width: width - 80,
    height: 80,
    color: colorWhite,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawText("ESCOPO DO SERVICO & ESPECIFICACOES", {
    x: 52,
    y: currentY - 18,
    size: 9,
    font: fontBold,
    color: colorDark,
  });

  const titleStr = sanitizeText(data.title || "Fabricacao e Instalacao de Comunicacao Visual");
  page.drawText(`Projeto: ${titleStr}`, {
    x: 52,
    y: currentY - 34,
    size: 9,
    font: fontBold,
    color: colorOrange,
  });

  const notesStr = sanitizeText(data.notes || "Fabricacao estrutural, acabamento premium e montagem especializada conforme padroes de engenharia visual Icthus.");
  const truncatedNotes = notesStr.length > 220 ? notesStr.slice(0, 217) + "..." : notesStr;
  
  page.drawText(truncatedNotes, {
    x: 52,
    y: currentY - 50,
    size: 8,
    font: fontRegular,
    color: colorZinc,
    maxWidth: width - 105,
    lineHeight: 11,
  });

  // 6. Grid de Parâmetros Técnicos de Campo
  currentY -= 95;

  const colW = (width - 80 - 15) / 2;
  const paramH = 65;

  // Bloco Esquerdo: Elétrica e Pintura
  page.drawRectangle({
    x: 40,
    y: currentY - paramH,
    width: colW,
    height: paramH,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawText("REQUISITOS TECNICOS NO LOCAL", {
    x: 52,
    y: currentY - 16,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  const voltStr = sanitizeText(data.voltage || "Bivolt (110V / 220V)");
  const paintStr = sanitizeText(data.paintDetails || "Padrao de catalogo automotivo / PU");

  page.drawText(`Voltagem no Ponto: ${voltStr}`, {
    x: 52,
    y: currentY - 32,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  page.drawText(`Acabamento de Tinta: ${paintStr}`, {
    x: 52,
    y: currentY - 46,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  // Bloco Direito: Logística & Ferramentas
  page.drawRectangle({
    x: 40 + colW + 15,
    y: currentY - paramH,
    width: colW,
    height: paramH,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  page.drawText("LOGISTICA & RECURSOS DE MONTAGEM", {
    x: 40 + colW + 27,
    y: currentY - 16,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  const toolsStr = Array.isArray(data.tools) && data.tools.length > 0
    ? sanitizeText(data.tools.slice(0, 4).join(", "))
    : "Escada, Andaime, Furadeira, Fitas Dupla Face";
  const freightStr = sanitizeText(data.freightDetails || "Incluso na regiao de instalacao");

  page.drawText(`Recursos: ${toolsStr}`, {
    x: 40 + colW + 27,
    y: currentY - 32,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  page.drawText(`Frete / Transporte: ${freightStr}`, {
    x: 40 + colW + 27,
    y: currentY - 46,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  // 7. Tabela de Valores e Serviços
  currentY -= 80;

  page.drawText("COMPOSICAO DO INVESTIMENTO", {
    x: 40,
    y: currentY - 12,
    size: 9.5,
    font: fontBold,
    color: colorDark,
  });

  // Cabeçalho da Tabela
  currentY -= 20;
  page.drawRectangle({
    x: 40,
    y: currentY - 20,
    width: width - 80,
    height: 20,
    color: colorDark,
  });

  page.drawText("DESCRICAO DO ITEM / SERVICO", {
    x: 50,
    y: currentY - 14,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText("QTD", {
    x: 360,
    y: currentY - 14,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText("VALOR UNIT.", {
    x: 420,
    y: currentY - 14,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText("TOTAL", {
    x: 505,
    y: currentY - 14,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });

  // Linha 1 da Tabela
  currentY -= 20;
  page.drawRectangle({
    x: 40,
    y: currentY - 26,
    width: width - 80,
    height: 26,
    color: colorLightBg,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  const itemTitle = sanitizeText(data.title.slice(0, 50));
  page.drawText(itemTitle, {
    x: 50,
    y: currentY - 16,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  page.drawText("1 un", {
    x: 362,
    y: currentY - 16,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  const numVal = data.estimatedValue ? Number(data.estimatedValue) : 0;
  const valFormatted = sanitizeText(formatCurrency(numVal));

  page.drawText(valFormatted, {
    x: 418,
    y: currentY - 16,
    size: 8.5,
    font: fontRegular,
    color: colorDark,
  });

  page.drawText(valFormatted, {
    x: 495,
    y: currentY - 16,
    size: 8.5,
    font: fontBold,
    color: colorOrange,
  });

  // 8. Card de Resumo Financeiro & Condições de Pagamento
  currentY -= 45;

  page.drawRectangle({
    x: 40,
    y: currentY - 60,
    width: width - 80,
    height: 60,
    color: colorWhite,
    borderColor: colorOrange,
    borderWidth: 1.5,
  });

  page.drawText("VALOR TOTAL DO INVESTIMENTO:", {
    x: 52,
    y: currentY - 20,
    size: 9,
    font: fontBold,
    color: colorDark,
  });

  page.drawText(valFormatted, {
    x: 52,
    y: currentY - 45,
    size: 18,
    font: fontBold,
    color: colorOrange,
  });

  page.drawText("Condicoes: 50% entrada na aprovacao + 50% na conclusao da instalacao", {
    x: 230,
    y: currentY - 20,
    size: 8,
    font: fontBold,
    color: colorDark,
  });

  page.drawText("Chave PIX: financeiro@icthusbrasil.com (Icthus Comunicacao Visual)", {
    x: 230,
    y: currentY - 34,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  page.drawText("Garantia de Fabrica: 12 meses contra defeitos de montagem e fabricacao", {
    x: 230,
    y: currentY - 48,
    size: 8,
    font: fontRegular,
    color: colorZinc,
  });

  // 9. Rodapé com Assinaturas e Informações Institucionais
  currentY -= 80;

  // Linhas para assinatura
  const sigW = 200;
  page.drawLine({
    start: { x: 50, y: currentY - 25 },
    end: { x: 50 + sigW, y: currentY - 25 },
    thickness: 1,
    color: colorBorder,
  });

  page.drawText("ICTHUS COMUNICACAO VISUAL", {
    x: 75,
    y: currentY - 38,
    size: 8,
    font: fontBold,
    color: colorDark,
  });

  page.drawText("Departamento Comercial & Engenharia", {
    x: 65,
    y: currentY - 48,
    size: 7,
    font: fontRegular,
    color: colorZinc,
  });

  page.drawLine({
    start: { x: width - 50 - sigW, y: currentY - 25 },
    end: { x: width - 50, y: currentY - 25 },
    thickness: 1,
    color: colorBorder,
  });

  page.drawText("DE ACORDO DO CLIENTE", {
    x: width - 50 - sigW + 45,
    y: currentY - 38,
    size: 8,
    font: fontBold,
    color: colorDark,
  });

  page.drawText("Data: _____/_____/2026", {
    x: width - 50 - sigW + 55,
    y: currentY - 48,
    size: 7,
    font: fontRegular,
    color: colorZinc,
  });

  // Faixa Inferior
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 25,
    color: colorDark,
  });

  page.drawText("Icthus Comunicacao Visual - www.icthusbrasil.com - WhatsApp: (41) 99999-9999", {
    x: 130,
    y: 8,
    size: 7.5,
    font: fontRegular,
    color: colorWhite,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  // Garante que o diretório de destino exista
  const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanCode = (data.budgetCode || `OS-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Orcamento_Icthus_${cleanCode}.pdf`;
  const absolutePath = path.join(uploadDir, fileName);

  fs.writeFileSync(absolutePath, buffer);

  return {
    fileName,
    fileUrl: `/uploads/documents/${fileName}`,
    absolutePath,
    fileSize: buffer.length,
    buffer,
  };
}
