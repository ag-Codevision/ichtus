/**
 * Módulo de Integração com o Banco de Imagens Gratuito (Pexels API)
 * Busca fotos profissionais em alta resolução com atribuição de fotógrafo
 */

export interface PexelsImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  altText: string;
  photographerName: string;
  photographerUrl: string;
}

// Fallbacks de alta resolução caso a cota se esgote ou a rede oscile
const FALLBACK_PEXELS_IMAGES: PexelsImageResult[] = [
  {
    imageUrl: "https://images.pexels.com/photos/12903905/pexels-photo-12903905.jpeg?auto=compress&cs=tinysrgb&w=1600",
    thumbnailUrl: "https://images.pexels.com/photos/12903905/pexels-photo-12903905.jpeg?auto=compress&cs=tinysrgb&w=500",
    altText: "Fachada comercial contemporânea com revestimento estruturado em ACM e design moderno",
    photographerName: "Pexels Creator",
    photographerUrl: "https://www.pexels.com",
  },
  {
    imageUrl: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600",
    thumbnailUrl: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=500",
    altText: "Edifício comercial moderno com estrutura arquitetônica envidraçada e acabamento técnico",
    photographerName: "Expect Best",
    photographerUrl: "https://www.pexels.com/@expect-best-79877",
  },
  {
    imageUrl: "https://images.pexels.com/photos/208674/pexels-photo-208674.jpeg?auto=compress&cs=tinysrgb&w=1600",
    thumbnailUrl: "https://images.pexels.com/photos/208674/pexels-photo-208674.jpeg?auto=compress&cs=tinysrgb&w=500",
    altText: "Instalação arquitetônica e iluminação externa de alto impacto",
    photographerName: "Pixabay",
    photographerUrl: "https://www.pexels.com/@pixabay",
  },
  {
    imageUrl: "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1600",
    thumbnailUrl: "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=500",
    altText: "Fachada corporativa contemporânea com materiais nobres e comunicação visual integrada",
    photographerName: "SevenStorm JUHASZIMRUS",
    photographerUrl: "https://www.pexels.com/@sevenstormphotography",
  },
];

function getRandomFallback(): PexelsImageResult {
  const index = Math.floor(Math.random() * FALLBACK_PEXELS_IMAGES.length);
  return FALLBACK_PEXELS_IMAGES[index];
}

/**
 * Busca fotos no Pexels com base no termo de pesquisa
 * @param query Termo de busca em inglês ou português (ex: "modern commercial facade architecture")
 */
export async function searchPexelsImage(query: string): Promise<PexelsImageResult> {
  const apiKey =
    process.env.PEXELS_API_KEY ||
    "UZjcWgFMxA7NOfzlCQpVnCsDsFFTctMVZdV06ue4lyxmr7yRtxKyuO4N";

  if (!apiKey) {
    console.warn("[Pexels] PEXELS_API_KEY não configurada. Usando fallback.");
    return getRandomFallback();
  }

  try {
    const cleanQuery = query && query.trim().length > 0 ? query.trim() : "modern commercial facade architecture";
    const encoded = encodeURIComponent(cleanQuery);
    const url = `https://api.pexels.com/v1/search?query=${encoded}&orientation=landscape&per_page=15`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Pexels] Status ${res.status}. Usando fallback.`);
      return getRandomFallback();
    }

    const data = await res.json();
    if (!data.photos || data.photos.length === 0) {
      console.info(`[Pexels] Nenhuma foto encontrada para '${cleanQuery}'. Tentando busca genérica de arquitetura...`);
      // Tentativa de fallback com busca genérica
      const fallbackRes = await fetch("https://api.pexels.com/v1/search?query=modern+commercial+building+facade&orientation=landscape&per_page=10", {
        headers: { Authorization: apiKey },
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.photos && fallbackData.photos.length > 0) {
          const p = fallbackData.photos[Math.floor(Math.random() * fallbackData.photos.length)];
          return {
            imageUrl: p.src.large2x || p.src.large || p.src.original,
            thumbnailUrl: p.src.medium || p.src.small,
            altText: p.alt || "Fachada comercial de alto padrão executada pela ICTHUS",
            photographerName: p.photographer || "Pexels Creator",
            photographerUrl: p.photographer_url || "https://www.pexels.com",
          };
        }
      }
      return getRandomFallback();
    }

    // Escolhe aleatoriamente entre as melhores primeiras fotos retornadas para variar o feed
    const pool = data.photos.slice(0, Math.min(data.photos.length, 5));
    const photo = pool[Math.floor(Math.random() * pool.length)];

    return {
      imageUrl: photo.src.large2x || photo.src.large || photo.src.original,
      thumbnailUrl: photo.src.medium || photo.src.small,
      altText: photo.alt || "Fachada comercial de alto padrão executada pela ICTHUS Soluções e Design",
      photographerName: photo.photographer || "Pexels Creator",
      photographerUrl: photo.photographer_url || "https://www.pexels.com",
    };
  } catch (error) {
    console.error("[Pexels] Erro ao buscar foto:", error);
    return getRandomFallback();
  }
}
