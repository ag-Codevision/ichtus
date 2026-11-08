/**
 * Motor de Inteligência Artificial para Blog Autônomo com SEO (ICTHUS)
 * Estratégia Híbrida Resiliente:
 * 1. Omniroute / Antigravity Gemini Local (ultra rápido, latência baixa)
 * 2. Fallback oficial para API NVIDIA NIM (meta/llama-3.2-90b-vision-instruct)
 */

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

  // 1. Tenta via Omniroute local (se disponível, resposta em 2-3s)
  try {
    const omnirouteRes = await fetch("http://localhost:5000/v1/chat/completions", {
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
      signal: AbortSignal.timeout(45000),
    });

    if (omnirouteRes.ok) {
      const data = await omnirouteRes.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log("[AI Engine] Sucesso via Omniroute Local (Gemini).");
        return content;
      }
    }
  } catch (err: any) {
    console.info("[AI Engine] Omniroute indisponível ou timeout, migrando para NVIDIA NIM...");
  }

  // 2. Fallback oficial: NVIDIA NIM API
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    "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";
  const model = process.env.NVIDIA_MODEL || "meta/llama-3.2-90b-vision-instruct";

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
    signal: AbortSignal.timeout(120000),
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
 * Gera um artigo completo com SEO para o Blog
 */
export async function generateBlogArticleWithNvidia(params?: string | {
  topic?: string;
  category?: string;
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
}): Promise<GeneratedArticle> {
  const p = typeof params === "string" ? { topic: params } : params;
  const topic =
    p?.topic ||
    DEFAULT_TOPIC_IDEAS[Math.floor(Math.random() * DEFAULT_TOPIC_IDEAS.length)];
  const category = p?.category || "Fachadas & Comunicação Visual";
  const keywords = p?.keywords?.length
    ? p.keywords.join(", ")
    : "fachadas em ACM, letreiros luminosos LED, usinagem CNC, comunicação visual comercial";
  const targetAudience = p?.targetAudience || "Empresários, Lojistas, Franquias e Arquitetos";
  const tone = p?.tone || "Técnico Especialista, Didático e Focado em Conversão";

  const systemPrompt = `Você é o diretor sênior de engenharia visual e redação técnica da "ICTHUS Soluções e Design" (empresa líder em fachadas comerciais em ACM, letreiros luminosos em LED, usinagem CNC Router e comunicação visual corporativa de alto impacto).

Sua missão é produzir um artigo aprofundado, técnico, altamente persuasivo e com SEO impecável em Português do Brasil (pt-BR).

REGRAS OBRIGATÓRIAS:
1. Responda EXCLUSIVAMENTE em formato JSON VÁLIDO.
2. Dentro dos campos de texto (especialmente "contentMarkdown"), use "\\n" para quebras de linha, NUNCA quebras literais de linha brutas.
3. No campo "contentMarkdown":
   - Escreva um artigo completo e robusto (mínimo de 800 palavras).
   - Use formatação rica em Markdown: introdução de impacto, subtítulos ## e ###, listas com bullet points e tabelas comparativas com especificações técnicas (ex: espessuras de chapas de ACM 3mm/4mm, durabilidade de LEDs com proteção IP67/IP68).
   - Inclua uma seção de Perguntas Frequentes (FAQ) com 3 dúvidas comuns de clientes.
   - Conclua com uma chamada para ação (CTA) persuasiva direcionando o leitor para solicitar um Estudo Preliminar 3D e orçamento personalizado com a ICTHUS (mencionando o WhatsApp oficial (41) 99655-6102 e o link [Solicitar Estudo 3D](/#orcamento)).
4. No campo "imageQuery": forneça de 3 a 5 palavras-chave em INGLÊS específicas e estéticas para buscar uma foto profissional no banco de imagens Pexels (exemplo: "modern commercial facade architecture led signage").

ESTRUTURA DO JSON DE RESPOSTA:
{
  "title": "Título magnético com palavra-chave principal",
  "slug": "titulo-em-slug-amigavel",
  "excerpt": "Resumo executivo de 2 parágrafos curtos explicando a dor do empresário e as vantagens da solução apresentada",
  "contentMarkdown": "Artigo completo em Markdown rico estruturado...",
  "metaTitle": "Título SEO para Google com até 60 caracteres",
  "metaDescription": "Meta descrição irresistível com até 155 caracteres",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "imageQuery": "commercial building facade modern architecture",
  "readingTimeMin": 5
}`;

  const userPrompt = `Gere o artigo completo com base nos parâmetros:
- Pauta / Tema Principal: "${topic}"
- Categoria: "${category}"
- Palavras-chave prioritárias: "${keywords}"
- Público-Alvo: "${targetAudience}"
- Tom de Voz: "${tone}"`;

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
export async function suggestTopicsWithAI(count = 10): Promise<TopicSuggestion[]> {
  const systemPrompt = `Você é o estrategista chefe de SEO e Inbound Marketing da ICTHUS (fábrica de fachadas em ACM, letreiros LED e comunicação visual).
Sua missão é sugerir exatamente ${count} temas/pautas inéditas de alta demanda e pesquisa no Google para comerciantes, arquitetos e redes corporativas.

Responda EXCLUSIVAMENTE em formato JSON VÁLIDO no seguinte formato:
{
  "topics": [
    {
      "title": "Título sugerido da pauta",
      "category": "Fachadas Comerciais | Letreiros & Iluminação | Engenharia de Materiais | Normas Técnicas",
      "keywords": ["palavra1", "palavra2", "palavra3"],
      "targetAudience": "Empresários, Lojistas e Arquitetos",
      "tone": "Técnico Especialista & Conversão"
    }
  ]
}`;

  const userPrompt = `Gere ${count} pautas estratégicas focadas em atrair orçamentos para a ICTHUS.`;

  const rawContent = await callLLM({
    systemPrompt,
    userPrompt,
    maxTokens: 2000,
    temperature: 0.7,
  });

  const parsed = safeJsonParse(rawContent);
  return parsed.topics || [];
}
