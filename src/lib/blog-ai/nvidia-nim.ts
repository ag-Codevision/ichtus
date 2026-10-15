/**
 * Motor de Inteligência Artificial para Blog Autônomo com SEO
 * Integração oficial com a API NVIDIA NIM (NVIDIA Inference Microservices)
 * Conforme especificado em SDD.md (seções 2.1 e 5.1) e SPEC.md (RF-02)
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

// Matriz de temas técnicos de comunicação visual para geração randômica contínua
const TOPIC_IDEAS = [
  "Como o ACM 3mm com LED Indireto Transforma Fachadas de Clínicas e Consultórios Médicos",
  "Guia Técnico de Durabilidade: Por Que o ACM Supera Alvenaria e Madeira em Fachadas Comerciais",
  "Letreiros Caixa Alta em Aço Inox Escovado: Elegância e Resistência para Marcas Corporativas",
  "Usinagem CNC Router vs Corte a Laser: Qual Escolher para Seu Projeto de Comunicação Visual",
  "Iluminação LED Halo (Contraluz): Como Criar Destaque Noturno Sem Cegar o Pedestre",
  "Sinalização Arquitetônica Interna para Prédios Comerciais e Condomínios Empresariais",
  "Envelopamento de Frotas com Vinil Polimérico: Como Proteger a Pintura e Gerar Milhares de Impressões Diárias",
  "Totens Publicitários e Portais de Entrada: Imponência Visual para Concessionárias e Indústrias",
  "Tendências de Cores e Texturas Metálicas para Fachadas Comerciais em 2027",
  "A Importância do Gabarito Técnico e Teste de Carga de Vento em Fachadas de Grande Porte",
];

/**
 * Parser resiliente para JSON gerado por LLMs, tratando quebras de linha literais dentro de strings
 */
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
    // Corrige quebras de linha literais e caracteres de controle em strings JSON
    const fixed = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/gs, (match) => {
      return match
        .replace(/\r?\n/g, "\\n")
        .replace(/\t/g, "\\t");
    });
    return JSON.parse(fixed);
  }
}

export async function generateBlogArticleWithNvidia(
  forcedTopic?: string
): Promise<GeneratedArticle> {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct";

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY não configurada no ambiente.");
  }

  const topic =
    forcedTopic || TOPIC_IDEAS[Math.floor(Math.random() * TOPIC_IDEAS.length)];

  const systemPrompt = `Você é o diretor de engenharia e redação técnica sênior da Glessios, fábrica líder especializada em comunicação visual e fachadas de alto padrão em ACM e LED.
Responda EXCLUSIVAMENTE em formato JSON VÁLIDO.
IMPORTANTE: Dentro dos campos de texto (como "contentMarkdown"), utilize "\\n" para representar quebras de linha, NUNCA quebras de linha literais brutas que invalidem o JSON.

Estrutura obrigatória:
{
  "title": "Título chamativo e memorável",
  "slug": "slug-url-amigavel",
  "excerpt": "Resumo de 2 parágrafos persuasivos destacando a dor e a solução",
  "contentMarkdown": "## Subtítulo\\n\\nArtigo completo em Markdown rico com tópicos H2, listas e comparativos...",
  "metaTitle": "Título SEO para Google com até 60 caracteres",
  "metaDescription": "Meta descrição atrativa para cliques no Google com até 155 caracteres",
  "tags": ["Array", "de", "tags", "relevantes"],
  "imageQuery": "Termo de 3 a 5 palavras em INGLÊS para buscar foto no Unsplash (ex: commercial building facade modern led)",
  "readingTimeMin": 5
}`;

  const userPrompt = `Escreva um artigo técnico completo sobre a pauta: "${topic}".`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 75000);

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha na API da NVIDIA (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("A API da NVIDIA retornou uma resposta sem conteúdo.");
    }

    const parsed: GeneratedArticle = safeJsonParse(rawContent);

    // Sanitização do slug
    if (!parsed.slug || typeof parsed.slug !== "string") {
      parsed.slug = topic
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    } else {
      parsed.slug = parsed.slug
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    // Tempo de leitura
    if (!parsed.readingTimeMin || parsed.readingTimeMin < 1) {
      const words = parsed.contentMarkdown.split(/\s+/).length;
      parsed.readingTimeMin = Math.max(3, Math.ceil(words / 200));
    }

    return parsed;
  } catch (err: any) {
    clearTimeout(timeout);
    console.error("[NVIDIA NIM] Erro durante a geração de artigo:", err);
    throw err;
  }
}
