/**
 * Motor de Inteligência Artificial para Blog Autônomo com SEO (ICTHUS)
 * Estratégia Híbrida Resiliente:
 * 1. Omniroute / Antigravity Gemini Local (ultra rápido, latência baixa)
 * 2. Fallback oficial para API NVIDIA NIM (meta/llama-3.2-90b-vision-instruct)
 */

import { matchGuidelinesForArticle } from "./guidelines";

export interface PromptGuidelineInput {
  title: string;
  scope?: string;
  instructions: string;
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  imageQuery: string;
  readingTimeMin: number;
}

export interface TopicSuggestion {
  title: string;
  category: string;
  keywords: string[];
  targetAudience: string;
  tone: string;
}

export const DEFAULT_TOPIC_IDEAS = [
  "Como o ACM 3mm com LED Indireto Transforma Fachadas de Clínicas e Consultórios Médicos",
  "Guia Técnico de Durabilidade: Por Que o ACM Supera Alvenaria e Madeira em Fachadas Comerciais",
  "Letreiros Caixa Alta em Aço Inox Escovado: Elegância e Resistência para Marcas Corporativas",
  "Usinagem CNC Router vs Corte a Laser: Qual Escolher para Seu Projeto de Comunicação Visual",
  "Iluminação LED Halo (Contraluz): Como Criar Destaque Noturno Sem Cegar o Pedestre",
  "Sinalização Arquitetônica Interna para Prédios Comerciais e Condomínios Empresariais",
  "Envelopamento de Frotas com Vinil Polimérico: Proteção e Alta Visibilidade de Marca",
  "Totens Publicitários e Portais de Entrada: Imponência Visual para Concessionárias e Indústrias",
  "Tendências de Cores e Texturas Metálicas para Fachadas Comerciais em 2027",
  "A Importância do Gabarito Técnico e Cálculo de Carga de Vento em Fachadas de Grande Porte",
  "Revitalização de Fachadas Antigas (Retrofit Comercial com ACM): Economia e Valorização Imediata",
  "Como o Letreiro Luminoso em Acrílico com LED de Alta Eficiência Reduz Custos de Energia",
];

function safeJsonParse(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const fixed = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/gs, (match) => {
      return match
        .replace(/\r?\n/g, "\\n")
        .replace(/\t/g, "\\t");
    });
    return JSON.parse(fixed);
  }
}

/**
 * Chamada universal para endpoints compatíveis com OpenAI
 */
async function callLLM(options: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const maxTokens = options.maxTokens || 3500;
  const temperature = options.temperature || 0.4;

  // 1. Tenta via Omniroute local apenas em desenvolvimento ou se OMNIROUTE_URL estiver definido
  const omnirouteUrl = process.env.OMNIROUTE_URL;
  const isLocalDev = process.env.NODE_ENV !== "production" || Boolean(omnirouteUrl);

  if (isLocalDev) {
    try {
      const url = omnirouteUrl || "http://localhost:5000/v1/chat/completions";
      const omnirouteRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "antigravity/gemini-2.5-flash",
          messages: [
            { role: "system", content: options.systemPrompt },
            { role: "user", content: options.userPrompt },
          ],
          stream: false,
          max_tokens: maxTokens,
          temperature,
        }),
        signal: AbortSignal.timeout(3000), // Timeout curto de 3s para fallback instantâneo
      });

      if (omnirouteRes.ok) {
        const data = await omnirouteRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log("[AI Engine] Sucesso via Omniroute Local (Gemini).");
          return content;
        }
      }
    } catch {
      console.info("[AI Engine] Omniroute indisponível, migrando imediatamente para NVIDIA NIM...");
    }
  }

  // 2. Provedor oficial: NVIDIA NIM API (nvidia/nemotron-3.5-bolt-e4b)
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    "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";
  const model = process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-bolt-e4b";

  const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    signal: AbortSignal.timeout(180000), // 3 minutos para gerações extensas
  });

  if (!nvidiaRes.ok) {
    const errorText = await nvidiaRes.text();
    throw new Error(`Falha no LLM NVIDIA NIM (${nvidiaRes.status}): ${errorText}`);
  }

  const data = await nvidiaRes.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("O provedor de IA retornou uma resposta vazia.");
  }

  return content;
}

/**
 * Formata a seção de diretrizes do Cérebro de Diretrizes para injeção nos prompts.
 */
function buildGuidelinesPromptSection(guidelines: PromptGuidelineInput[]): string {
  if (!guidelines || guidelines.length === 0) {
    return "";
  }

  const lines = guidelines.map((guideline) => {
    const scopeLabel =
      String(guideline.scope || "").toUpperCase() === "GLOBAL" ? "GLOBAL" : "TEMA";
    return `- [${scopeLabel}] ${guideline.title}: ${guideline.instructions}`;
  });

  return `\n\nDIRETRIZES ESPECÍFICAS DO CÉREBRO DE DIRETRIZES (CUMPRIMENTO OBRIGATÓRIO):\n${lines.join("\n")}`;
}

/**
 * Gera um artigo completo com SEO para o Blog
 */
export async function generateBlogArticleWithNvidia(params?: string | {
  topic?: string;
  category?: string;
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
  guidelines?: PromptGuidelineInput[];
}): Promise<GeneratedArticle> {
  const p = typeof params === "string" ? { topic: params } : params;
  const topic =
    p?.topic ||
    DEFAULT_TOPIC_IDEAS[Math.floor(Math.random() * DEFAULT_TOPIC_IDEAS.length)];
  const category = p?.category || "Fachadas & Comunicação Visual";
  const keywordsList = p?.keywords?.length
    ? p.keywords
    : ["fachadas em ACM", "letreiros luminosos LED", "usinagem CNC", "comunicação visual comercial"];
  const keywords = keywordsList.join(", ");
  const targetAudience = p?.targetAudience || "Empresários, Lojistas, Franquias, Engenheiros e Arquitetos";
  // Sanitiza tons legados com foco comercial/conversão para manter a linha estritamente educativa
  const rawTone = p?.tone?.trim();
  const tone =
    !rawTone || /convers[aã]o/i.test(rawTone)
      ? "Técnico, Educativo, Didático e Imparcial (Sem Autopromoção)"
      : rawTone;

  // Carrega diretrizes explicitamente informadas ou aciona o Cérebro de Diretrizes com fallback seguro
  let activeGuidelines: PromptGuidelineInput[] = [];
  if (Array.isArray(p?.guidelines)) {
    activeGuidelines = p.guidelines;
  } else {
    try {
      activeGuidelines = await matchGuidelinesForArticle({
        topic,
        category: p?.category,
        keywords: p?.keywords,
      });
    } catch (err) {
      console.warn(
        "[AI Engine] Não foi possível consultar as diretrizes do blog, prosseguindo sem bloqueio:",
        err
      );
      activeGuidelines = [];
    }
  }

  const guidelinesSection = buildGuidelinesPromptSection(activeGuidelines);

  const systemPrompt = `Você é um Engenheiro Sênior e Professor Especialista em Engenharia de Comunicação Visual, Arquitetura Comercial, Materiais (ACM, Acrílico, Aço Inox, Policarbonato, Vinil), Iluminação LED e Processos de Fabricação (Usinagem CNC Router e Corte a Laser).

Sua missão é produzir um artigo técnico, educativo, instrutivo e aprofundado em Português do Brasil (pt-BR), com excelente estrutura de SEO, focado em ensinar conceitos de engenharia, especificações técnicas, normas, comparativos práticos e boas práticas de execução.

PROIBIÇÃO ESTRITA DE AUTOPROMOÇÃO:
- NUNCA mencione o nome da empresa ("ICTHUS", "Ictus", "Glessios" ou qualquer marca própria) em nenhuma parte do artigo ("title", "excerpt", "contentMarkdown", "metaTitle", "metaDescription").
- NUNCA utilize primeira pessoa corporativa ("nós fazemos", "aqui na empresa", "nossa equipe", "nossos projetos") nem linguagem de propaganda, venda ou autopromoção.
- NUNCA inclua chamadas comerciais para orçamento, números de WhatsApp/telefone ou links promocionais como "/#orcamento".
- O texto deve ser 100% imparcial, técnico e educativo, como um guia de engenharia ou aula técnica de referência.${guidelinesSection}

REGRAS OBRIGATÓRIAS:
1. Responda EXCLUSIVAMENTE em formato JSON VÁLIDO.
2. Dentro dos campos de texto (especialmente "contentMarkdown"), use "\\n" para quebras de linha, NUNCA quebras literais de linha brutas.
3. No campo "contentMarkdown":
   - Escreva um artigo completo, didático e robusto (mínimo de 800 palavras).
   - Use formatação rica em Markdown: introdução técnica contextualizando o problema ou conceito, subtítulos ## e ### bem organizados, listas com bullet points e tabelas comparativas com especificações técnicas reais (ex: espessuras de chapas de ACM 3mm/4mm, ligas, graus de proteção IP67/IP68, tolerâncias de corte, critérios dimensionais).
   - Explique o "como" e o "porquê" por trás das escolhas técnicas, apresentando critérios objetivos de decisão e erros comuns a evitar na execução ou especificação.
   - Inclua uma seção de Perguntas Frequentes (FAQ Técnico) com 3 dúvidas técnicas recorrentes sobre o assunto e respostas objetivas.
   - Conclua com uma seção de Síntese Técnica e Checklist Prático de Boas Práticas, consolidando o aprendizado para que o leitor possa aplicar ou avaliar tecnicamente o tema abordado.
4. No campo "imageQuery": forneça de 3 a 5 palavras-chave em INGLÊS específicas e estéticas para buscar uma foto profissional no banco de imagens Pexels (exemplo: "modern commercial facade architecture led signage").

ESTRUTURA DO JSON DE RESPOSTA:
{
  "title": "Título educativo e técnico claro com palavra-chave principal",
  "slug": "titulo-em-slug-amigavel",
  "excerpt": "Resumo técnico e didático de 2 parágrafos curtos contextualizando o tema, o desafio técnico abordado e o que o leitor vai aprender no artigo",
  "contentMarkdown": "Artigo completo em Markdown rico estruturado...",
  "metaTitle": "Título SEO para Google com até 60 caracteres",
  "metaDescription": "Meta descrição educativa e informativa com até 155 caracteres",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "imageQuery": "commercial building facade modern architecture",
  "readingTimeMin": 5
}`;

  const userPrompt = `Gere o artigo técnico e educativo completo com base nos parâmetros:
- Pauta / Tema Principal: "${topic}"
- Categoria: "${category}"
- Palavras-chave prioritárias: "${keywords}"
- Público-Alvo: "${targetAudience}"
- Tom de Voz: "${tone}"
- Diretriz Editorial: "Artigo 100% educativo e técnico. Proibido mencionar a ICTHUS ou fazer autopromoção/vendas."${guidelinesSection}`;

  const rawContent = await callLLM({
    systemPrompt,
    userPrompt,
    maxTokens: 3500,
    temperature: 0.35,
  });

  const parsed: GeneratedArticle = safeJsonParse(rawContent);

  const baseSlug = parsed.slug || topic;
  parsed.slug = baseSlug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (!parsed.readingTimeMin || parsed.readingTimeMin < 1) {
    const words = (parsed.contentMarkdown || "").split(/\s+/).length;
    parsed.readingTimeMin = Math.max(3, Math.ceil(words / 200));
  }

  return parsed;
}

/**
 * Sugere pautas estratégicas utilizando a IA
 */
export async function suggestTopicsWithAI(
  count = 10,
  categories?: string[]
): Promise<TopicSuggestion[]> {
  const availableCategories =
    categories && categories.length > 0
      ? categories
      : [
          "Fachadas Comerciais",
          "Letreiros & Iluminação",
          "Engenharia de Materiais",
          "Usinagem CNC & Corte",
          "Normas Técnicas & ROI",
        ];

  const categoriesPattern = availableCategories.join(" | ");

  const systemPrompt = `Você é um editor-chefe técnico especializado em engenharia de comunicação visual, fachadas em ACM, letreiros LED, materiais arquitetônicos e processos de fabricação (usinagem CNC e corte a laser).
Sua missão é sugerir exatamente ${count} temas/pautas educativas, técnicas e instrutivas de alta relevância e busca para arquitetos, engenheiros, projetistas, fabricantes e empresários.
Não sugira pautas promocionais nem mencione nomes de empresas.

Responda EXCLUSIVAMENTE em formato JSON VÁLIDO no seguinte formato:
{
  "topics": [
    {
      "title": "Título educativo/técnico sugerido da pauta",
      "category": "${categoriesPattern}",
      "keywords": ["palavra1", "palavra2", "palavra3"],
      "targetAudience": "Arquitetos, Engenheiros, Projetistas e Empresários",
      "tone": "Técnico, Educativo e Didático"
    }
  ]
}`;

  const userPrompt = `Gere ${count} pautas técnicas e educativas focadas em ensinar especificações, processos de fabricação, boas práticas de instalação, normas e engenharia de materiais. Escolha obrigatoriamente o campo "category" de cada pauta entre: ${categoriesPattern}.`;

  try {
    const rawContent = await callLLM({
      systemPrompt,
      userPrompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    const parsed = safeJsonParse(rawContent);
    if (parsed.topics && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
      return parsed.topics;
    }
  } catch (err) {
    console.warn("[AI Engine] Erro na geração dinâmica de pautas via LLM, aplicando acervo estratégico curado:", err);
  }

  // Fallback educativo curado com foco em engenharia e instrução técnica
  return DEFAULT_TOPIC_IDEAS.slice(0, count).map((ideaTitle, idx) => ({
    title: ideaTitle,
    category: availableCategories[idx % availableCategories.length],
    keywords: ["fachadas em acm", "letreiro luminoso", "comunicação visual", "engenharia de materiais"],
    targetAudience: "Arquitetos, Engenheiros, Projetistas e Empresários",
    tone: "Técnico, Educativo e Didático",
  }));
}
