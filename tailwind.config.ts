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
        // Material Design 3 Expressive Tokens
        m3: {
          surface: "var(--md-sys-color-surface)",
          "on-surface": "var(--md-sys-color-on-surface)",
          "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
          "surface-dim": "var(--md-sys-color-surface-dim)",
          "surface-bright": "var(--md-sys-color-surface-bright)",
          "container-lowest": "var(--md-sys-color-surface-container-lowest)",
          "container-low": "var(--md-sys-color-surface-container-low)",
          container: "var(--md-sys-color-surface-container)",
          "container-high": "var(--md-sys-color-surface-container-high)",
          "container-highest": "var(--md-sys-color-surface-container-highest)",
          primary: "var(--md-sys-color-primary)",
          "on-primary": "var(--md-sys-color-on-primary)",
          "primary-hover": "var(--m3-primary-hover)",
          "primary-container": "var(--md-sys-color-primary-container)",
          "on-primary-container": "var(--md-sys-color-on-primary-container)",
          secondary: "var(--md-sys-color-secondary)",
          "on-secondary": "var(--md-sys-color-on-secondary)",
          "secondary-container": "var(--md-sys-color-secondary-container)",
          "on-secondary-container": "var(--md-sys-color-on-secondary-container)",
          tertiary: "var(--md-sys-color-tertiary)",
          "on-tertiary": "var(--md-sys-color-on-tertiary)",
          "tertiary-container": "var(--md-sys-color-tertiary-container)",
          "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
          error: "var(--md-sys-color-error)",
          "on-error": "var(--md-sys-color-on-error)",
          "error-container": "var(--md-sys-color-error-container)",
          "on-error-container": "var(--md-sys-color-on-error-container)",
          outline: "var(--md-sys-color-outline)",
          "outline-variant": "var(--md-sys-color-outline-variant)",
          scrim: "var(--md-sys-color-scrim)",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
        display: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "m3-1": "var(--app-shadow-1)",
        "m3-2": "var(--app-shadow-2)",
        "m3-3": "var(--app-shadow-3)",
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
        "m3-none": "var(--md-sys-shape-corner-none)",
        "m3-xs": "var(--md-sys-shape-corner-extra-small)",
        "m3-sm": "var(--md-sys-shape-corner-small)",
        "m3-md": "var(--md-sys-shape-corner-medium)",
        "m3-lg": "var(--md-sys-shape-corner-large)",
        "m3-lg-inc": "var(--md-sys-shape-corner-large-increased)",
        "m3-xl": "var(--md-sys-shape-corner-extra-large)",
        "m3-xl-inc": "var(--md-sys-shape-corner-extra-large-increased)",
        "m3-xxl": "var(--md-sys-shape-corner-extra-extra-large)",
        "m3-full": "var(--md-sys-shape-corner-full)",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
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
