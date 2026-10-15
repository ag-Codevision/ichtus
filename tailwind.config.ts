import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Design Tokens: Dark Editorial + Laranja Vibrante
        glessios: {
          black: "#0B0C0D",           // Deep black - Fundo principal / Hero
          charcoal: "#111214",        // Primary charcoal - Seções escuras padrão
          graphite: "#1B1B1D",        // Raised graphite - Cards, painéis e modais
          "graphite-hover": "#252527",// Elevated graphite - Hover de cards e superfícies
          ivory: "#F7F5F2",           // Warm ivory - Contraponto claro / Seção institucional
          "soft-white": "#FFFEFC",    // Soft white - Cards dentro de seções ivory
          
          // Laranja Vibrante
          orange: {
            DEFAULT: "#FF650F",       // Brand orange - CTA primário, destaques, bordas ativas
            hover: "#FF781B",         // Bright orange - Hover e microinterações
            deep: "#B83C00",          // Deep orange - Texto de destaque com alto contraste em fundos claros
            copper: "#A95024",        // Metallic copper - Reflexos esculturais e gradientes metálicos
            glow: "rgba(255, 101, 15, 0.35)",
          },

          // Tipografia
          text: {
            heading: "#F8F7F5",       // White text em fundo escuro
            body: "#B4B1AE",          // Dark-muted text para leitura no escuro
            light: {
              heading: "#19191A",     // Dark text para títulos em fundo ivory
              body: "#65615E",        // Light-muted text para leitura em fundo ivory
            },
          },

          // Bordas sutis editoriais
          border: {
            dark: "rgba(255, 255, 255, 0.08)",
            "dark-hover": "rgba(255, 255, 255, 0.16)",
            orange: "rgba(255, 101, 15, 0.3)",
            light: "rgba(0, 0, 0, 0.08)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
        display: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "orange-glow": "0 0 35px -5px rgba(255, 101, 15, 0.35)",
        "orange-glow-lg": "0 0 60px -10px rgba(255, 101, 15, 0.5)",
        "card-dark": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      },
      backgroundImage: {
        "orange-gradient": "linear-gradient(115deg, #FF5D09 0%, #FF6B12 55%, #FA6B17 100%)",
        "orange-metallic": "linear-gradient(135deg, #FF781B 0%, #FF650F 40%, #A95024 100%)",
        "dark-surface-gradient": "linear-gradient(180deg, rgba(27, 27, 29, 0.7) 0%, rgba(17, 18, 20, 0.95) 100%)",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      transitionTimingFunction: {
        "cinematic-ease": "cubic-bezier(0.16, 1, 0.3, 1)", // EaseOutExpo para entradas suaves
        "cinematic-inout": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-fade": "glowFade 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowFade: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
