/**
 * Design Tokens Centrais - Plataforma Integrada Glessios
 * Baseado estritamente em DESIGN.md e Animaçoes.md
 * Estilo: Dark Editorial + Laranja Vibrante + Contraponto Warm Ivory
 */

export const COLORS = {
  // Superfícies Escuras Primárias
  deepBlack: "#0B0C0D",           // Fundo base e Hero
  primaryCharcoal: "#111214",     // Seções escuras padrão
  raisedGraphite: "#1B1B1D",      // Cards e painéis
  elevatedGraphite: "#252527",    // Hover e camadas superiores

  // Contraponto Claro Editorial
  warmIvory: "#F7F5F2",           // Fundo da seção de serviços / institucional
  softWhite: "#FFFEFC",           // Cards sobre fundo ivory

  // Tipografia
  textWhite: "#F8F7F5",           // Headings no escuro
  textDark: "#19191A",            // Headings no claro
  textMutedDark: "#B4B1AE",       // Descrições no escuro
  textMutedLight: "#65615E",      // Descrições no claro

  // Acentos de Alta Energia (Laranja Vibrante)
  brandOrange: "#FF650F",         // CTA principal, badges, highlights
  brightOrange: "#FF781B",        // Hover de botões e brilhos
  deepOrange: "#B83C00",          // Texto laranja com alto contraste para fundo ivory
  metallicCopper: "#A95024",      // Elementos esculturais 3D / gradientes

  // Bordas Editoriais
  borderDark: "rgba(255, 255, 255, 0.08)",
  borderDarkHover: "rgba(255, 255, 255, 0.16)",
  borderOrange: "rgba(255, 101, 15, 0.3)",
  borderLight: "rgba(0, 0, 0, 0.08)",
} as const;

export const GRADIENTS = {
  orangeAction: "linear-gradient(115deg, #FF5D09 0%, #FF6B12 55%, #FA6B17 100%)",
  orangeMetallic: "linear-gradient(135deg, #FF781B 0%, #FF650F 40%, #A95024 100%)",
  darkSurface: "linear-gradient(180deg, rgba(27, 27, 29, 0.7) 0%, rgba(17, 18, 20, 0.95) 100%)",
  heroVignette: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 101, 15, 0.15), transparent 70%)",
} as const;

export const MOTION = {
  // Curvas Bezier Cinematográficas (Animaçoes.md)
  easeOutExpo: [0.16, 1, 0.3, 1] as const,       // Entradas cinematográficas
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,   // Transições de estado
  bounceSpring: { type: "spring", stiffness: 400, damping: 25 },

  // Durações Padronizadas
  durationMicro: 0.15,     // 150ms - Microinterações, toggles, hover
  durationStandard: 0.3,   // 300ms - Expansão de cards, modais
  durationEmphasis: 0.5,   // 500ms - Destaques, transições de aba
  durationCinematic: 0.8,  // 800ms - Revelações de seções, hero entry
} as const;
