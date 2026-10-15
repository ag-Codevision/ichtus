/**
 * Módulo de Integração com o Banco de Imagens Gratuito (Unsplash API)
 * Conforme especificado em SDD.md (seção 5.2) e SPEC.md (RF-02.2)
 */

export interface UnsplashImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  altText: string;
  photographerName: string;
  photographerUrl: string;
  downloadLocation?: string;
}

// Imagens de fallback curadas em alta definição caso a cota da API se esgote
const FALLBACK_IMAGES: UnsplashImageResult[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80",
    altText: "Fachada moderna com placas estruturadas em ACM e iluminação arquitetônica",
    photographerName: "Ricardo Gomez Angel",
    photographerUrl: "https://unsplash.com/@ripato",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=600&q=80",
    altText: "Letreiro luminoso corporativo com luz de fundo LED de alto contraste",
    photographerName: "Andrej Lišakov",
    photographerUrl: "https://unsplash.com/@andrej_lisakov",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    altText: "Edifício comercial imponente com pórticos metálicos e sinalização de vidro",
    photographerName: "Sean Pollock",
    photographerUrl: "https://unsplash.com/@seanpollock",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    altText: "Instalação arquitetônica luminosa em ambiente corporativo moderno",
    photographerName: "Alexandre Chambon",
    photographerUrl: "https://unsplash.com/@alexandre_chambon",
  },
];

/**
 * Busca uma imagem de alta qualidade no Unsplash para o artigo
 * @param query Termo de busca em inglês (ex: "modern store facade signage led")
 */
export async function searchUnsplashImage(query: string): Promise<UnsplashImageResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("[Unsplash] Chave UNSPLASH_ACCESS_KEY não configurada. Usando fallback.");
    return getRandomFallback();
  }

  try {
    const encodedQuery = encodeURIComponent(query || "modern commercial facade architecture");
    const endpoint = `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=5&orientation=landscape`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Unsplash] Erro na requisição: ${response.status}. Usando fallback.`);
      return getRandomFallback();
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      console.info(`[Unsplash] Nenhuma foto para "${query}". Usando fallback.`);
      return getRandomFallback();
    }

    // Seleciona a primeira foto relevante
    const photo = data.results[0];

    return {
      imageUrl: photo.urls.regular || photo.urls.full,
      thumbnailUrl: photo.urls.small,
      altText: photo.alt_description || photo.description || "Fachada comercial de alto padrão executada pela Glessios",
      photographerName: photo.user?.name || "Unsplash Creator",
      photographerUrl: photo.user?.links?.html || "https://unsplash.com",
      downloadLocation: photo.links?.download_location,
    };
  } catch (error) {
    console.error("[Unsplash] Falha na comunicação:", error);
    return getRandomFallback();
  }
}

function getRandomFallback(): UnsplashImageResult {
  const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
  return FALLBACK_IMAGES[randomIndex];
}
