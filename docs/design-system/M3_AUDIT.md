# M3 AUDIT — Diagnóstico de Design System & Baseline

> **Projeto:** Plataforma Integrada Glessios — Comunicação Visual & Indústria  
> **Data:** 17/10/2026  
> **Status:** Concluído · Baseline para Migração M3 Expressive  

---

## 1. Inventário da Stack Atual

| Recurso | Detalhes | Observações M3 Expressive |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.2.0 (App Router, React 19) | Compatível com SSR e ThemeProvider unificado |
| **Estilização** | Tailwind CSS 3.4.17 + PostCSS | Mapeamento semântico de tokens via CSS Variables |
| **Motion** | Framer Motion 12.4.7 | Ideal para implementar MotionScheme (Springs físicos) |
| **Ícones** | Lucide React 0.475.0 | Consistente, sem necessidade de importar novas fontes pesadas |
| **Banco / ORM** | PostgreSQL 16 + Prisma 6.4.1 | Intacto; nenhuma alteração de schema necessária |

---

## 2. Diagnóstico Visual & Oportunidades de Melhoria

1. **Hierarquia de Contenção vs. Bordas Duras:**
   - *Anteriormente:* As telas dependiam fortemente de bordas pretas (`border-black/10` ou `border-white/10`) para separar cards e seções, criando excesso de ruído visual.
   - *Oportunidade M3:* Aplicar o conceito de **Superfícies Tonais de Contenção** (`surfaceContainerLowest`, `Low`, `Default`, `High`), permitindo que a elevação e a profundidade sejam percebidas pela tonalidade da superfície, com bordas extremamente sutis (`outlineVariant`).

2. **Consistência do Modo Claro (Light Mode):**
   - *Anteriormente:* Havia classes escuras hardcoded sem o prefixo `dark:`. O Light Mode já foi inicialmente corrigido, mas necessita de tokens padronizados oficiais M3 (`--md-sys-color-*`).
   - *Oportunidade M3:* Definir pares semânticos estritos (`primary` + `onPrimary`, `surface` + `onSurface`, etc.) para garantir contraste WCAG 2.2 AA (mínimo 4.5:1) em ambos os temas.

3. **Motion Baseado em Física (Springs):**
   - *Anteriormente:* Transições pontuais baseadas em `transition-all duration-200 ease-in-out` de CSS genérico.
   - *Oportunidade M3:* Centralizar o `MotionScheme` oficial com molas elásticas (*spring physics*) em `src/lib/motion.ts`, separando movimentos espaciais (`spatial`) de efeitos cromáticos/opacidade (`effects`).

4. **Controles Segmentados & Navegação:**
   - *Oportunidade M3:* Pílulas ativas elásticas com `layoutId` para alternar entre visão executiva e chão de fábrica CNC, e na Sidebar administrativa.

---

## 3. Matriz de Mapeamento de Cores da Marca

A identidade corporativa Glessios é baseada no **Laranja Vibrante Industrial** e superfícies editoriais profundas:

- **Fonte Primária (Brand Key):** `#FF650F` (Laranja Vibrante)
- **Superfície Light Base:** `#FDF9F6` (Warm Sand / Ivory Tonal)
- **Superfície Dark Base:** `#0E0F12` (Deep Charcoal Tonal)

---

## 4. Escopo & Riscos Mitigados

- **Site Público Preservado:** `/`, `/blog`, landing pages e marketing não sofrerão nenhuma intervenção de layout ou componentes.
- **Zero Regressão Funcional:** Rotas de API, autenticação JWT, Prisma seeds e regras de cálculo do DRE/CRM permanecem 100% preservadas.
