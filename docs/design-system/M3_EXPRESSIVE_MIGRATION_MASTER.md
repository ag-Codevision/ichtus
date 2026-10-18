# MATERIAL 3 EXPRESSIVE — DESIGN SYSTEM + PROMPT MASTER DE MIGRAÇÃO

> **Versão:** 1.0 · **Idioma:** pt-BR · **Atualizado:** 17/10/2026  
> **Uso:** aplicar a linguagem visual, os estados e o motion do **Material Design 3 Expressive** em um projeto **já existente**, sem reconstruí-lo do zero.  
> **Alvo principal:** interfaces web, SaaS, dashboards, sistemas administrativos, aplicativos responsivos. Também há orientações para Android/Compose.  
> **Como usar:** anexe este documento ao seu agente de código (Codex, OpenCode, Claude Code etc.), abra a pasta do repositório e execute o **PROMPT MASTER** da seção 18. Se houver um `DESIGN.md` ou design system atual, forneça-o também.

---

## 0. Leitura crítica e origem das recomendações

### 0.1 O que o Material 3 Expressive realmente propõe

O **M3 Expressive** amplia o Material 3 com **hierarquia mais intencional, cor expressiva, tipografia flexível, formas contrastantes, superfícies de contenção, componentes adaptativos e movimento baseado em física**. Não se resume a deixar tudo mais arredondado, colorido ou animado. A expressividade deve indicar **prioridade, agrupamento, função, resultado e continuidade entre estados**.

A pesquisa publicada pelo Google identifica cinco recursos centrais: **color, shape, size, motion e containment**. Ela também alerta que desrespeitar padrões familiares de navegação ou esconder rótulos pode **reduzir a usabilidade**, mesmo quando a tela parece mais moderna.

**Princípio de projeto:** `Expressividade = hierarquia + feedback + continuidade + identidade`, e não `expressividade = decoração`.

### 0.2 Separação obrigatória entre fonte e proposta

- **[OFICIAL]**: nome de conceitos, famílias de papéis de cor, escala tipográfica M3, variantes de superfície, semântica de motion (`spatial`/`effects`), uso de Material Symbols e padrões documentados pelo Google/Android.
- **[ADAPTAÇÃO WEB]**: nomes de variáveis CSS, breakpoints CSS, bibliotecas web, estilos exemplificativos e arquitetura de aplicação para projetos existentes.
- **[PARÂMETRO INICIAL]**: valores operacionais propostos neste guia (por exemplo duração de fallback, gaps, sombras CSS e configuração de animações web), que devem ser calibrados conforme a marca, contexto e testes. **Não os apresente como tokens oficiais universais do Google.**

> **Limitação de verificação:** a página `m3.material.io` exige JavaScript e não expõe seu artigo completo ao leitor textual utilizado nesta análise. A interpretação foi conferida com o resumo indexado do artigo indicado e, principalmente, com publicações e documentação oficiais acessíveis do Google Design e Android Developers, com referências ao final. Não trate trechos inacessíveis do artigo como citações literais.

### 0.3 Escala de expressividade recomendada para o produto

| Perfil de interface | Intensidade | Tratamento |
|---|---|---|
| Financeiro, jurídico, saúde, operações críticas | **Contida** | Superfícies tonais, forte contraste, motion discreto, estados inequívocos. |
| Dashboard, SaaS, CRM, portal, produtividade | **Equilibrada (padrão)** | Componentes expressivos nos focos, motion em mudanças de estado, contenção consistente. |
| Conteúdo, criatividade, mídia, onboarding e marketing | **Alta e contextual** | Mais variação de cor/forma, tipografia ampla e transições de destaque, sem sacrificar legibilidade. |

**O nível nunca é aplicado cegamente à interface inteira.** Uma dashboard pode ter uma tela inicial expressiva e tabelas de dados deliberadamente sóbrias.

---

## 1. Contrato de migração: adaptar o que existe, nunca substituir sem necessidade

1. Inspecionar arquivos reais antes de escrever código: framework, roteamento, componentes, bibliotecas UI, tokens, CSS, fontes, ícones, breakpoints, animações, formulários, testes e documentação.
2. Identificar elementos **imutáveis**: identidade da marca, logo, cópias, rotas, contratos API, autenticação, permissões, dados, formulários, regras de negócio e interações existentes.
3. Caso haja `DESIGN.md`, `design-tokens.json`, `theme.ts`, `tailwind.config.*`, CSS variables, Figma tokens ou padrões de componentes, **usar esses artefatos como fonte da verdade**. O M3 entra como camada de semântica e refinamento.
4. Reaproveitar componentes da stack instalada. **Não instalar MUI, Radix, shadcn, Motion/Framer Motion ou outra dependência só porque este documento os menciona.** Avaliar a necessidade primeiro.
5. Não remodelar fluxos ou substituir padrões de navegação úteis apenas para parecer Expressive.
6. Migrar em etapas com alterações pequenas, reversíveis e comparáveis visualmente; usar flags/temas, se fizer sentido.
7. Ajustar light/dark de forma real: não inverter cores nem presumir que o mesmo HEX funcionará nos dois temas.
8. Anotar todas as adaptações que diferem dos padrões oficiais e registrar motivos.

**Ordem de precedência:** requisitos de negócio e acessibilidade → funcionalidades estáveis → identidade e design system existentes → papéis e princípios M3 Expressive → escolhas estéticas opcionais.

---

## 2. Arquitetura de tokens: fonte única da verdade

A separação evita cores arbitrárias em componentes e permite alterar a expressão da interface sem reescrever dezenas de telas.

```text
BRAND / SOURCE COLORS
  └── PALETAS TONAIS (primary, secondary, tertiary, neutral, neutral-variant, error)
       └── TOKENS SEMÂNTICOS (primary, onPrimary, surfaceContainerHigh, ...)
            └── TOKENS DE COMPONENTE (button.filled.bg, card.bg, nav.active.bg, ...)
                 └── COMPONENTES / TELAS / ESTADOS

ESCALAS INDEPENDENTES
  ├── typography
  ├── shape
  ├── spacing / layout
  ├── elevation
  ├── state-layer
  ├── motion
  └── iconography
```

**Convenção recomendada para web:** `--md-sys-color-*`, `--md-sys-typescale-*`, `--md-sys-shape-corner-*`, `--app-space-*`, `--app-motion-*`. Prefixos `--app-*` nos tokens autorais; não falsificar procedência oficial.

**Regra:** nunca referenciar HEX diretamente em um componente se existir papel semântico. Exemplo: o botão usa `primary` e `onPrimary`, não `#6750A4` e `white`.

---

## 3. COLOR SYSTEM — geração e papéis de cor

### 3.1 Construção da paleta [OFICIAL]

1. Ler a(s) cor(es) da marca do projeto atual. Não forçar o roxo de demonstração do Material.
2. Gerar cores-chave e paletas tonais para **primary, secondary, tertiary, neutral, neutral-variant e error**. O sistema M3 deriva tonalidades utilizadas em papéis semânticos de cada tema.
3. Preferir o **Material Theme Builder / Material Color Utilities** ou tooling equivalente para gerar pares acessíveis. Não tentar “resolver” a paleta com simples transparências da mesma cor base.
4. Suportar pelo menos **light** e **dark**; adotar dynamic color de forma opcional quando a plataforma suportar e a marca permitir. O recurso de cores dinâmicas por wallpaper é próprio de plataformas compatíveis, não obrigação universal de sites web.
5. Validar visualmente cada par e o contraste calculado. Não supor que qualquer override manual será acessível.

### 3.2 Inventário de papéis obrigatórios

| Família | Papéis semânticos | Função |
|---|---|---|
| Primária | `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer` | CTA principal, seleção, destaque de primeiro nível. |
| Secundária | `secondary`, `onSecondary`, `secondaryContainer`, `onSecondaryContainer` | Filtros, ações secundárias e diferenciação de controles. |
| Terciária | `tertiary`, `onTertiary`, `tertiaryContainer`, `onTertiaryContainer` | Destaques contrastantes pontuais e agrupamentos selecionados. |
| Erro | `error`, `onError`, `errorContainer`, `onErrorContainer` | Erros reais, campos inválidos e ações destrutivas. |
| Base | `surface`, `onSurface`, `onSurfaceVariant` | Fundo, texto padrão e informação secundária. |
| Superfícies tonais | `surfaceDim`, `surfaceBright`, `surfaceContainerLowest`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh`, `surfaceContainerHighest` | Separação de planos sem depender de sombras. |
| Contorno | `outline`, `outlineVariant` | Bordas funcionais, divisão de campos e delimitação sutil. |
| Inversão | `inverseSurface`, `inverseOnSurface`, `inversePrimary` | Superfícies contrastantes, como alguns feedbacks. |
| Overlay | `scrim`, `surfaceTint` quando suportado/necessário | Cobertura modal e tintas de elevação em implementações compatíveis. |
| Tons fixos (quando úteis) | `primaryFixed`, `primaryFixedDim`, `onPrimaryFixed`, `onPrimaryFixedVariant` e equivalentes `secondary`/`tertiary` | Manter tonalidade estável entre light/dark em contextos específicos. |

**Não misturar indevidamente pares.** Fundo `primary` pede conteúdo `onPrimary`; fundo `primaryContainer` pede `onPrimaryContainer`; `surfaceContainer*` pede em geral `onSurface` / `onSurfaceVariant`. Aplicar princípios equivalentes aos demais papéis.

### 3.3 Hierarquia recomendada de aplicação [ADAPTAÇÃO WEB]

| Elemento | Contêiner | Conteúdo |
|---|---|---|
| Fundo da aplicação | `surface` | `onSurface` |
| Área de navegação | `surfaceContainerLow` / `surfaceContainer` | `onSurface` / `onSurfaceVariant` |
| Card comum | `surfaceContainerLow` | `onSurface` |
| Card destacado | `primaryContainer` ou `secondaryContainer` | Papel `on*Container` correspondente |
| Cabeçalho e painéis | `surfaceContainer` | `onSurface` |
| Menu/popover | `surfaceContainerHigh` | `onSurface` |
| Dialog/sheet | `surfaceContainerHigh` | `onSurface` |
| CTA primário | `primary` | `onPrimary` |
| CTA tonal | `secondaryContainer` | `onSecondaryContainer` |
| Campo em erro | superfície apropriada + `error` | `onSurface` + explicação de erro |
| Seleção em lista | `secondaryContainer` / `primaryContainer` | `onSecondaryContainer` / `onPrimaryContainer` |

### 3.4 Regras visuais decisivas

- Preservar zonas de descanso visual; **não pintar todos os cards com cores saturadas**.
- Preferir superfícies tonais neutras com ênfase cromática nos pontos de decisão.
- Usar `tertiary` intencionalmente: diferencial da tela, gráfico selecionado ou destaque contextual, nunca um terceiro CTA concorrente.
- Status **success / warning / info** podem existir como **extensões autorais**, separadas do inventário canônico M3. Não chamar esses papéis de cores oficiais universais.
- Não comunicar status somente por cor: incluir texto/ícone/forma quando necessário.
- Gráficos precisam de paleta independente, legendas, marcação e contrastes validados; não assumir que `primary`, `secondary`, `tertiary` bastam para várias séries.
- Em fundos suaves e coloridos, preferir variações tonais com saturação controlada e texto `onSurface`. A suavidade não deve prejudicar o contraste.

---

## 4. SHAPE SYSTEM — cantos, contêineres e morphing

### 4.1 Escala de shape [OFICIAL, valores em dp; uso CSS px aproximado]

| Token | Valor | Uso típico |
|---|---:|---|
| `none` | `0` | Divisões estruturais, borda reta quando intencional. |
| `extraSmall` | `4` | Campos compactos, menus auxiliares. |
| `small` | `8` | Chips e componentes utilitários. |
| `medium` | `12` | Cards densos e controles menores. |
| `large` | `16` | Blocos mais evidentes. |
| `largeIncreased` | `20` | Expansão Expressive em contêineres. |
| `extraLarge` | `28` | Dialogs, sheets e cards de destaque. |
| `extraLargeIncreased` | `32` | Seções hero e contêineres expressivos. |
| `extraExtraLarge` | `48` | Superfícies de grande destaque, conforme espaço. |
| `full` | metade da altura / formato pleno | Pills, FABs arredondados e botões totalmente arredondados. |

**Observação de versão:** exemplos mais antigos do M3/Compose podem mostrar `large=16` e `extraLarge=24`. O sistema Expressive amplia a escala com níveis intermediários e `extraExtraLarge`. A escolha final depende da versão da biblioteca e do componente.

### 4.2 Uso de forma como linguagem

- Tamanhos/cantos mais expressivos destacam **agrupamentos e ações principais**.
- Misturar **pills**, cantos médios e grandes com intenção; evitar raio de 32px em toda a UI.
- Formas assimétricas, recortes e shapes especiais apenas quando representam identidade ou um foco visual real.
- A biblioteca de formas Expressive oferece dezenas de formas, inclusive formas geométricas e orgânicas; não implementá-las todas por obrigação.
- Botões agrupados podem ajustar seus contornos e larguras quando pressionados/selecionados, sem deslocar a informação de forma imprevisível.
- **Shape morphing** deve preservar continuidade visual. Se a interpolação de polígonos/paths for cara ou difícil, usar transições de `border-radius` e tamanho em vez de fingir morphing geométrico.
- `overflow: hidden` / clipping precisa respeitar sombras, foco, ripples e menu popover; evitar cortar foco ou conteúdo.

---

## 5. TYPOGRAPHY — tipografia semântica e Expressive

### 5.1 Escala base do Material 3 [OFICIAL]

| Estilo | Font-size / line-height |
|---|---|
| `displayLarge` | `57 / 64` |
| `displayMedium` | `45 / 52` |
| `displaySmall` | `36 / 44` |
| `headlineLarge` | `32 / 40` |
| `headlineMedium` | `28 / 36` |
| `headlineSmall` | `24 / 32` |
| `titleLarge` | `22 / 28` |
| `titleMedium` | `16 / 24` |
| `titleSmall` | `14 / 20` |
| `bodyLarge` | `16 / 24` |
| `bodyMedium` | `14 / 20` |
| `bodySmall` | `12 / 16` |
| `labelLarge` | `14 / 20` |
| `labelMedium` | `12 / 16` |
| `labelSmall` | `11 / 16` |

Unidade: Android normalmente usa **sp** para tamanho textual; os números acima podem servir como **referência inicial em px no CSS**, respeitando `rem`, zoom, dimensionamento do usuário e contexto web.

### 5.2 Aplicação Expressive [ADAPTAÇÃO WEB]

- **Preservar a família tipográfica da marca**, quando ela já existe. Roboto/Roboto Flex são referências possíveis, não uma substituição obrigatória.
- Diferenciar `display`, `headline`, `title`, `body` e `label` por função, não só por tamanho.
- Usar variantes **emphasized** quando suportadas ou criar variantes próprias como `titleStrong`, sem alterar os tokens base de forma indiscriminada.
- Títulos podem combinar peso maior, largura variável e tamanho responsivo. Não animar a legibilidade de textos extensos.
- Fontes variáveis podem transicionar `wght`/`wdth` em controles e títulos curtos **se a fonte instalada suportar os eixos**.
- Limitar a duas ou três ênfases em uma mesma seção; controlar largura de linha para textos longos.
- Evitar todo texto em caixa alta, tracking exagerado, fontes menores que o aceitável ou contraste pobre.

---

## 6. SPACING, DENSITY E RESPONSIVIDADE

### 6.1 Escala de espaçamento de implementação [PARÂMETRO INICIAL]

```text
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px
```

| Espaço | Aplicação típica |
|---:|---|
| 4–8 | Ícone + texto, microgrupos, elementos dentro de chips. |
| 12–16 | Espaço interno de botões, pequenos cards, campos e listas compactas. |
| 20–24 | Gap entre controles relacionados e padding de cards. |
| 32–48 | Distância entre grupos e seções. |
| 64–96 | Respiro em páginas de alto impacto; diminuir em telas compactas. |

**Nota:** a escala acima é **um conjunto coerente recomendado para a migração**, não uma lista de valores obrigatórios do M3 Expressive. Se o produto já possuir spacing tokens, mapear ao invés de duplicar.

### 6.2 Densidade

- **Comfortable:** touch, formulários simples, onboarding; mais altura e separação.
- **Default:** apps web / SaaS; prioridade à clareza e produtividade.
- **Compact:** tabelas financeiras, monitoramento, listas de dados; mais densidade **sem reduzir a área clicável indispensável**.
- Nunca aumentar todos os controles indiscriminadamente: destaque apenas o mais relevante.

### 6.3 Layout adaptativo [REFERÊNCIA M3]

| Classe | Largura de janela aproximada | Adaptação típica |
|---|---:|---|
| Compact | `< 600` | 1 coluna, ação prioritária acessível, navegação condensada. |
| Medium | `600–839` | 2 painéis quando houver espaço, nav rail ou navegação adaptada. |
| Expanded | `840–1199` | Layout multipainel, sidebar/rail e conteúdo. |
| Large | `1200–1599` | Maior densidade e organização em colunas. |
| Extra-large | `≥ 1600` | Largura máxima, visualização simultânea e layouts específicos. |

Para web, usar **container queries quando o componente depende do contêiner**, e media queries quando depende da viewport. Breakpoints são referências adaptáveis, não motivo para quebrar layout legado que já funciona.

---

## 7. ELEVATION — hierarquia por superfícies antes de sombras

### 7.1 Modelo semântico [OFICIAL]

No M3, elevação pode ser expressa por **variação tonal** e por **sombras**. Famílias como `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh` e `surfaceContainerHighest` são fundamentais para separar planos. Não equiparar automaticamente `surfaceContainerHigh` a um número universal de `box-shadow`.

### 7.2 Estratégia de implementação [ADAPTAÇÃO WEB]

| Plano funcional | Cor/tom | Sombra sugerida |
|---|---|---|
| App background | `surface` | nenhuma |
| Containers estáveis | `surfaceContainerLow`/`surfaceContainer` | nenhuma ou mínima |
| Cards elevados sob hover | `surfaceContainer`/`High` | sutil, apenas se útil |
| Popover e menu flutuante | `surfaceContainerHigh` | média e controlada |
| Modal, sheet, overlay | `surfaceContainerHigh`/`Highest` + `scrim` | média/alta somente para separar planos |
| Elemento arrastado | papel de origem + feedback | elevar transitoriamente |

A sombra é apoio contextual; o contraste da superfície deve sobreviver quando a sombra não é percebida. **Evitar neumorfismo e sombras enormes** como substitutos de hierarquia.

---

## 8. ICONOGRAPHY — Material Symbols e comportamento

### 8.1 Sistema de ícones [OFICIAL]

Material Symbols oferece estilos **Outlined, Rounded e Sharp** e eixos variáveis: `FILL`, `wght`, `GRAD` e `opsz`. Valores publicados pelo Google incluem `FILL` entre 0 e 1, `wght` entre 100 e 700 e `opsz` entre 20 e 48; `GRAD` altera a espessura com maior granularidade.

**Orientação de migração:** se o projeto usa Lucide, Phosphor ou ícones proprietários, só migrar para Material Symbols quando fizer sentido visual e técnico. Nunca misturar famílias sem controle.

### 8.2 Regras operacionais

- Tamanhos de referência: **20px** para UI densa, **24px** padrão, **28–32px** em ações expressivas, conforme contexto.
- Semântica de seleção: ícone **outlined → filled** pode indicar ativo, acompanhado de cor/label.
- Padronizar peso/grade na interface; reservar alterações animadas para mudanças de estado.
- Botões apenas com ícone devem ter `aria-label`, tooltip contextual e alvo de interação apropriado.
- Ícones não podem substituir texto de operações ambíguas como “exportar”, “aprovar”, “liquidar”, “excluir permanentemente”.
- Carregar só os ícones/variantes usados; evitar baixar a fonte variável inteira sem necessidade.

---

## 9. MOTION SYSTEM — arquitetura física, tokens e intenção

### 9.1 O centro do M3 Expressive [OFICIAL]

O M3 Expressive privilegia animações baseadas em **spring physics**, em vez de expressar toda a linguagem por durações e curvas de easing isoladas. A documentação do `MotionScheme` expõe dois esquemas: **standard** e **expressive**.

Cada esquema possui seis categorias:

| Token lógico | Muda geometria/posição? | Uso |
|---|---|---|
| `fastSpatial` | Sim | botões, pequenos deslocamentos e press-feedback |
| `defaultSpatial` | Sim | expansão, seleção, reposicionamento de componentes |
| `slowSpatial` | Sim | grandes contêineres, transições espaciais amplas |
| `fastEffects` | Não | resposta rápida de cor/alpha |
| `defaultEffects` | Não | feedback visual normal de cor/alpha |
| `slowEffects` | Não | efeitos graduais em elementos maiores |

**Spatial:** posição, tamanho, forma, bounds e reposicionamentos.  
**Effects:** alpha, cor e outros efeitos sem alteração de limites geométricos.  
**Regra:** usar velocidade default na maioria das interações; fast em elementos pequenos; slow com critério em superfícies maiores.

O Google distingue o `expressive` para interações de destaque e o `standard` para UI utilitária recorrente. Misturar por intenção é preferível a animações elásticas em todos os cliques.

### 9.2 Parâmetros Android de referência (não transportar diretamente para web)

Uma implementação oficial versionada de `MotionScheme.kt` documenta, por exemplo, para o esquema Expressive: `defaultSpatial` com **dampingRatio 0.8 / stiffness 380**, `fastSpatial` com **0.6 / 800** e `slowSpatial` com **0.8 / 200**. Esses números são de **um arquivo-fonte versionado específico** e não devem ser tratados como contrato fixo para todas as versões, plataformas ou bibliotecas. A física de um `spring` em CSS/JavaScript não necessariamente usa a mesma parametrização do Compose.

### 9.3 Matriz de movimento [ADAPTAÇÃO WEB]

| Interação | Tipo | Intenção | Regra |
|---|---|---|---|
| Pressionar CTA | fastSpatial + fastEffects | reconhecimento imediato | escala muito discreta + state layer |
| Hover no card | defaultEffects; spatial opcional | sinalizar interatividade | tonalidade/sombra primeiro; leve deslocamento opcional |
| Selecionar tab/chip | defaultSpatial | continuidade do indicador | mover highlight sem salto abrupto |
| Abrir menu | fastSpatial + effects | continuidade da origem | revelar perto do botão de origem |
| Abrir modal/dialog | defaultSpatial + effects | foco e hierarquia | expandir/surgir com scrim, sem bounce exagerado |
| Expandir accordion | defaultSpatial | preservar relação item/conteúdo | altura e conteúdo sincronizados |
| Navegar entre vistas | defaultSpatial / shared element | continuidade espacial | preservar foco e histórico; não atrasar navegação |
| Alternar tema | defaultEffects | continuidade cromática | transição suave de cor, sem flash |
| Resultado de ação | fastEffects | feedback causal | toast/snackbar/estado, sem efeitos infinitos |
| Reordenação drag-and-drop | defaultSpatial | indicar posse e destino | seguir gesto e velocidade; snap final legível |
| Loading | loop contido e parcimonioso | expectativa de espera | escolher indicador de acordo com duração e contexto |
| Gráfico atualizado | defaultEffects/spatial | evidenciar mudança de dados | animar só o delta relevante; evitar reconstrução teatral |

### 9.4 Regras de motion obrigatórias

1. **Causalidade:** cada movimento precisa responder a ação, estado ou navegação identificável.
2. **Continuidade:** um elemento que se transforma deve parecer ser o mesmo objeto, e não dois objetos piscando.
3. **Interrupção:** interações rápidas/repetidas precisam atualizar alvos sem aguardar o fim da animação anterior.
4. **Velocidade coerente:** elementos próximos e pertencentes ao mesmo grupo reagem como sistema.
5. **Hierarquia temporal:** componentes de destaque podem ter motion mais notável; elementos de rotina não.
6. **Sem scroll-jacking:** preservar scroll natural, gestos e navegação do browser.
7. **Redução de movimento:** respeitar `prefers-reduced-motion`; suprimir movimentos decorativos, mantendo feedback mínimo essencial.
8. **Performance:** priorizar `transform` e `opacity` quando apropriado; animar layout/border-radius apenas onde necessário e sem thrash.
9. **Sem bloquear a UI:** botões e formulários não devem ficar indisponíveis aguardando uma animação cosmética.
10. **Sem loop decorativo permanente** em telas de trabalho, exceto indicadores funcionais.

### 9.5 Presets sugeridos para web (NÃO oficiais)

| Preset | Implementação preferencial | Uso |
|---|---|---|
| `motion.fast` | spring curta ou 120–180 ms de fallback | press/hover/ícones |
| `motion.default` | spring moderada ou 180–280 ms | menus, seleção, accordion |
| `motion.slow` | spring longa ou 280–420 ms | modal e grandes superfícies |
| `motion.color` | transição não espacial de 120–240 ms | tema, overlay, state layers |
| `motion.none` | instantânea ou imperceptível | redução de movimento e navegação crítica |

Tempos acima são **fallbacks propostos**, não durações mandatórias do Material 3 Expressive.

---

## 10. INTERACTION STATES — state layers e foco

Estados a cobrir em cada controle: **enabled, hovered, focused/keyboard-focused, pressed, selected/checked, disabled, loading, error** e **dragged**, quando aplicáveis.

| Estado | Tratamento | Referência útil |
|---|---|---|
| Hover | `state layer` sutil | opacidade `0.08` |
| Focus | `state layer` + foco **visível** | opacidade `0.10`; outline separado |
| Pressed | resposta mais concentrada + leve scale, se apropriado | opacidade `0.10` |
| Dragged | destaque de superfície | opacidade `0.16` |
| Disabled | menor ênfase e ação inacessível | conteúdo ~`0.38`; contêiner ~`0.12` em referências de tokens |
| Selected | mudança clara de container/ícone/label | não depender apenas de opacidade |

Essas opacidades são referências comuns dos **state layers M3**; são distintas da espessura do outline de foco. A solução final deve passar em verificações de contraste e acessibilidade.

**Não remover `outline` do teclado** para alcançar estética clean. `:focus-visible` deve ser perceptível mesmo quando houver state layer.

---

## 11. COMPONENTES — matriz de adaptação M3 Expressive

| Componente existente | Como adaptar | Motion/estado principal |
|---|---|---|
| Filled / tonal / outlined / text button | Semântica de ênfase coerente, shapes, espaçamentos e state layer | press feedback, loading, disabled |
| Icon button / toggle | Ícone consistente, alvo confortável, selected claro | fill/shape sutil, fastSpatial |
| Button group / connected group | Agrupar ações relacionadas, alternar seleção, evitar overflow | indicador ou contorno com spring |
| Split button | Ação principal + menu de alternativas relacionadas | rotação de chevron + menu; sem conflito de clique |
| FAB / Extended FAB | Apenas se existir **uma ação principal contextual** | entrada/expansão e contração sob scroll |
| Top app bar | Hierarquia título/ações; adensar conforme rolagem | transição de altura/alinhamento opcional |
| Navigation drawer/rail/bar | Adaptar por largura e número de destinos | active indicator espacial |
| Floating / docked toolbar | Agrupar ações contextuais reais; respeitar sobreposição | reveal/hide associado a contexto |
| Card | Usar papel tonal correto e shape sistemático | hover só se for clicável; selected distinto |
| Dialog / bottom sheet | Forma ampla e scrim, foco gerenciado | spatial + effects; fechamento previsível |
| Text field / select | label, helper, erro, placeholder, autofill preservados | borda/foco/erro sem layout shift |
| Search bar | Estado fechado/aberto, sugestões e feedback | expansão ancorada à origem |
| Chips (assist/filter/input/suggestion) | Cor, contorno e seleção consistentes | state layer + highlight |
| Tabs | Indicador de seleção com continuidade | slide/transform discreto |
| Carousel | Densidade/peeking útil, keyboard/touch, sem autoplay imposto | transições de cards, gesto natural |
| Slider / switch / checkbox / radio | Superfícies, alvos e estados acessíveis | micro-morph ou state transition |
| Menu / popover / tooltip | Hierarquia e legibilidade; proximidade ao trigger | reveal suave, esc/aria/foco |
| Snackbar / toast | Feedback sem bloquear tarefa | effects + leve spatial |
| Loading indicator / progress | Escolha adequada à duração/progresso | shape morph só onde houver suporte |
| Linear/wavy progress | Progresso com leitura objetiva | animação controlada, sem falsificar progresso |
| Tabela / data grid | Preservar densidade, escaneabilidade e ordenação | motion mínimo, realce de linhas alteradas |
| Empty state | Ícone/ilustração + texto e ação | destaque opcional sem distração |
| Charts / KPIs | Superfície tonal, cor semanticamente codificada | animar deltas e seleção, preservar interpretação |

**Loading indicador Expressive:** documentação de componentes do Google descreve o novo indicador como apropriado para esperas curtas, em especial inferiores a cerca de cinco segundos; não usá-lo para ocultar operações longas sem status, cancelamento ou feedback útil.

---

## 12. GUIA DE ART DIRECTION E ESTÉTICA

O aspecto esperado é **profissional, limpo, vivo, acessível e intencional**:

- Fundos suavemente tonalizados; diferenciação de profundidade principalmente por `surfaceContainer*`.
- Cards que parecem pertencer à mesma família, sem excesso de bordas, sombras ou transparências.
- Cor concentrada em ações e trechos importantes, não saturação uniforme.
- Alternar formas mais retas e mais arredondadas para comunicar relações e foco.
- Tipografia expressiva nas áreas de destaque, textos operacionais muito legíveis.
- Microinterações úteis e motion coerente; evitar a estética “todos os elementos flutuam”.
- Ilustrações, gradientes, 3D e blur **não são obrigatórios** no M3 Expressive. Não inventar esses recursos se o projeto não os contém.
- Em sites corporativos premium, preservar a identidade existente e aplicar Expressive principalmente em hierarquia, estados, superfícies, microinterações e navegação.

---

## 13. EXEMPLO DE TOKENS CSS — estrutura pronta para customização

O bloco a seguir demonstra **a arquitetura**, usando **cores do tema M3 de exemplo**, não uma paleta obrigatória para seu projeto. **Na migração, substituir as cores por light/dark gerados das cores reais da marca e validar contraste.**

```css
/* material-expressive.tokens.css */
:root,
[data-theme="light"] {
  color-scheme: light;

  /* DEMONSTRAÇÃO: nunca impor estes HEX sem ler a identidade do projeto. */
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;
  --md-sys-color-secondary: #625b71;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #e8def8;
  --md-sys-color-on-secondary-container: #1d192b;
  --md-sys-color-tertiary: #7d5260;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #ffd8e4;
  --md-sys-color-on-tertiary-container: #31111d;
  --md-sys-color-error: #b3261e;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #f9dedc;
  --md-sys-color-on-error-container: #410e0b;

  --md-sys-color-surface: #fef7ff;
  --md-sys-color-on-surface: #1d1b20;
  --md-sys-color-on-surface-variant: #49454f;
  --md-sys-color-surface-dim: #ded8e1;
  --md-sys-color-surface-bright: #fef7ff;
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f7f2fa;
  --md-sys-color-surface-container: #f3edf7;
  --md-sys-color-surface-container-high: #ece6f0;
  --md-sys-color-surface-container-highest: #e6e0e9;
  --md-sys-color-outline: #79747e;
  --md-sys-color-outline-variant: #cac4d0;
  --md-sys-color-inverse-surface: #322f35;
  --md-sys-color-inverse-on-surface: #f5eff7;
  --md-sys-color-inverse-primary: #d0bcff;
  --md-sys-color-scrim: #000000;
}

[data-theme="dark"] {
  color-scheme: dark;
  --md-sys-color-primary: #d0bcff;
  --md-sys-color-on-primary: #381e72;
  --md-sys-color-primary-container: #4f378b;
  --md-sys-color-on-primary-container: #eaddff;
  --md-sys-color-secondary: #ccc2dc;
  --md-sys-color-on-secondary: #332d41;
  --md-sys-color-secondary-container: #4a4458;
  --md-sys-color-on-secondary-container: #e8def8;
  --md-sys-color-tertiary: #efb8c8;
  --md-sys-color-on-tertiary: #492532;
  --md-sys-color-tertiary-container: #633b48;
  --md-sys-color-on-tertiary-container: #ffd8e4;
  --md-sys-color-error: #f2b8b5;
  --md-sys-color-on-error: #601410;
  --md-sys-color-error-container: #8c1d18;
  --md-sys-color-on-error-container: #f9dedc;

  --md-sys-color-surface: #141218;
  --md-sys-color-on-surface: #e6e0e9;
  --md-sys-color-on-surface-variant: #cac4d0;
  --md-sys-color-surface-dim: #141218;
  --md-sys-color-surface-bright: #3b383e;
  --md-sys-color-surface-container-lowest: #0f0d13;
  --md-sys-color-surface-container-low: #1d1b20;
  --md-sys-color-surface-container: #211f26;
  --md-sys-color-surface-container-high: #2b2930;
  --md-sys-color-surface-container-highest: #36343b;
  --md-sys-color-outline: #938f99;
  --md-sys-color-outline-variant: #49454f;
  --md-sys-color-inverse-surface: #e6e0e9;
  --md-sys-color-inverse-on-surface: #322f35;
  --md-sys-color-inverse-primary: #6750a4;
  --md-sys-color-scrim: #000000;
}

:root {
  /* Shapes — tokens M3 */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-large-increased: 20px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-extra-large-increased: 32px;
  --md-sys-shape-corner-extra-extra-large: 48px;
  --md-sys-shape-corner-full: 9999px;

  /* Spacing — convenção de projeto, não token M3 oficial. */
  --app-space-1: 4px;
  --app-space-2: 8px;
  --app-space-3: 12px;
  --app-space-4: 16px;
  --app-space-5: 20px;
  --app-space-6: 24px;
  --app-space-8: 32px;
  --app-space-10: 40px;
  --app-space-12: 48px;
  --app-space-16: 64px;

  /* Motion web: fallback temporal; calibrar springs na biblioteca real. */
  --app-motion-fast: 150ms;
  --app-motion-default: 230ms;
  --app-motion-slow: 360ms;
  --app-motion-effects-ease: cubic-bezier(.2, 0, 0, 1);
  --app-state-hover-opacity: .08;
  --app-state-focus-opacity: .10;
  --app-state-pressed-opacity: .10;
  --app-state-dragged-opacity: .16;

  /* Sombras WEB ilustrativas — não correspondem a níveis M3 exatos. */
  --app-shadow-1: 0 1px 3px rgb(0 0 0 / .08);
  --app-shadow-2: 0 6px 18px rgb(0 0 0 / .10);
  --app-shadow-3: 0 16px 42px rgb(0 0 0 / .16);
}

/* Se a preferência do SO deve comandar e NÃO houver override manual,
   a integração real deve escolher data-theme; não criar regras em conflito. */
```

**Tokens complementares:** criar aliases de componente em `components.tokens.css` como `--app-button-primary-bg`, `--app-card-bg`, `--app-nav-active-bg`, `--app-dialog-bg`, `--app-field-border` apontando aos tokens semânticos. Incluir também as variantes `Fixed` somente onde forem utilizadas e geradas corretamente para ambos os temas.

### 13.1 Componentes CSS: exemplo mínimo funcional

```css
.app-surface {
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

.app-card {
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-large);
  padding: var(--app-space-6);
}

.app-button-primary {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--app-space-2);
  min-height: 44px; /* para touch, preferir área efetiva >= 48px quando aplicável */
  padding: 0 var(--app-space-6);
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  cursor: pointer;
  transition: transform var(--app-motion-fast) var(--app-motion-effects-ease);
}

/* Overlay decorativo, não intercepta cliques. */
.app-button-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--md-sys-color-on-primary);
  opacity: 0;
  transition: opacity var(--app-motion-fast) ease;
}

.app-button-primary:hover::after { opacity: var(--app-state-hover-opacity); }
.app-button-primary:active::after { opacity: var(--app-state-pressed-opacity); }
.app-button-primary:active { transform: scale(.985); }
.app-button-primary:focus-visible {
  outline: 3px solid var(--md-sys-color-outline);
  outline-offset: 3px;
}
.app-button-primary:focus-visible::after { opacity: var(--app-state-focus-opacity); }
.app-button-primary:disabled {
  cursor: not-allowed;
  transform: none;
  /* Ajustar disabled colors por tokens específicos; não confiar só em opacity. */
  opacity: .5;
}

@media (prefers-reduced-motion: reduce) {
  .app-button-primary,
  .app-button-primary::after {
    transition-duration: 0.01ms;
  }
  .app-button-primary:active { transform: none; }
}
```

### 13.2 Presets de movimento para React (opcional)

Se o repositório **já utiliza Motion para React** (ou após justificativa de adoção), prefira reunir a física em um arquivo central. Estes valores são **calibração inicial de biblioteca web**, **não** uma conversão 1:1 dos springs Android.

```ts
// app-motion.ts — presets de PROJETO, não tokens oficiais da API Android
export const appMotion = {
  standard: {
    fastSpatial: { type: 'spring' as const, stiffness: 520, damping: 36, mass: 1 },
    defaultSpatial: { type: 'spring' as const, stiffness: 360, damping: 36, mass: 1 },
    slowSpatial: { type: 'spring' as const, stiffness: 230, damping: 32, mass: 1 },
  },
  expressive: {
    fastSpatial: { type: 'spring' as const, stiffness: 560, damping: 27, mass: 1 },
    defaultSpatial: { type: 'spring' as const, stiffness: 350, damping: 27, mass: 1 },
    slowSpatial: { type: 'spring' as const, stiffness: 190, damping: 25, mass: 1 },
  },
  effects: {
    fast: { duration: 0.14, ease: 'easeOut' as const },
    default: { duration: 0.22, ease: 'easeOut' as const },
    slow: { duration: 0.34, ease: 'easeOut' as const },
  },
};
```

**Importante:** analisar a API/versão instalada da biblioteca antes de usar; aplicar redução de movimento por hook/media query; evitar conflito entre CSS `transition` e o motor JS no mesmo atributo animado.

### 13.3 Ícones variáveis — Material Symbols (opcional)

```css
/* Exige a fonte Material Symbols carregada e compatível. */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.material-symbols-outlined[data-selected="true"] {
  font-variation-settings: 'FILL' 1, 'wght' 450, 'GRAD' 0, 'opsz' 24;
}
```

Carregar a fonte via estratégia já definida no projeto, preferindo subsetting/ícones usados. Quando a fonte não for variável, usar variantes estáticas e não forçar animação de eixos inexistentes.

---

## 14. IMPLEMENTAÇÃO POR STACK

### 14.1 Web HTML/CSS/JavaScript

- Criar tema semântico em CSS custom properties.
- Usar classes/atributos para estados (`data-selected`, `aria-expanded`, `data-state`) e semântica nativa.
- Implementar CSS transitions para effects; CSS ou JS spring para movimentos espaciais de maior relevância.
- Se não houver engine spring, usar fallback temporal discreto **sem alegar fidelidade física total**.
- Garantir focus management, `Escape`, retorno de foco, scroll lock e stacking contexts em overlays.

### 14.2 React / Next.js / Vite

- Usar provider de tema da stack existente; evitar re-render global desnecessário.
- Centralizar design tokens, motion presets, `Button`, `Card`, `Dialog`, `Tabs`, `Sidebar`, `Sheet`, `Icon`.
- Se houver Motion/Framer Motion, preferir `layout`, `layoutId`, `AnimatePresence`/recursos equivalentes **onde a API instalada suportar**, priorizando shared element genuíno.
- Para Next.js/SSR, prevenir flash de tema e hydration mismatch; tema inicial deve ser consistente com o servidor e/ou script de bootstrap.
- Não reinstalar tudo caso use MUI/shadcn/Tailwind; ajustar theme/tokens/componentes existentes.

### 14.3 Tailwind CSS

- Mapear tokens semânticos a utilitários ou variáveis CSS. Evitar espalhar `bg-purple-*`, `rounded-[32px]` e `duration-300` por todas as telas.
- Migrar de classes ad hoc para classes/component variants reutilizáveis.
- Validar versão real do Tailwind; não assumir sintaxe de configuração da versão anterior.

### 14.4 Android / Jetpack Compose

- Preferir `MaterialTheme(colorScheme, typography, shapes, motionScheme)` onde **a versão instalada** expuser `motionScheme`.
- Consultar API e opt-ins experimentais exigidos (`@ExperimentalMaterial3Api` ou variantes Expressive, conforme versão).
- Usar `MotionScheme.standard()` / `MotionScheme.expressive()` **somente se existirem na versão exata do projeto**; APIs anteriores podem usar outros nomes.
- Aplicar `fast/default/slowSpatialSpec` e `fast/default/slowEffectsSpec` por semântica, respeitando a API disponível.
- Considerar dynamic color Android e adaptações de janela via Window Size Classes.

### 14.5 Flutter e outras stacks

- Usar sistema nativo de tema e componentes atualizados na versão presente.
- Mapear `ColorScheme`, `TextTheme`, shapes e motion sem prometer paridade completa com Compose.
- Extensões third-party exigem auditoria de manutenção, acessibilidade, tamanho e licença.

---

## 15. PLANO DE MIGRAÇÃO INCREMENTAL

### Fase 0 — Auditoria (sem modificar código)

- Identificar framework, árvore do projeto e scripts de build/test.
- Localizar tokens, estilos globais, fontes, ícones, bibliotecas e `DESIGN.md`.
- Listar as páginas/fluxos mais importantes e suas condições de responsividade.
- Fazer baseline visual das telas e estados principais.
- Gerar `M3_AUDIT.md` com: ativos existentes, problemas visuais, incompatibilidades, oportunidades e riscos de regressão.

### Fase 1 — Fundação

- Gerar/migrar papéis de cor reais para light/dark, escalas de tipo, shape, spacing, elevation, states e motion.
- Criar bridge entre tokens atuais e tokens M3, sem quebrar código antigo.
- Resolver o tema inicial, zoom, fonts, contraste e preferências de movimento.

### Fase 2 — Componentes estruturais

- Atualizar app shell: page backgrounds, navbar, sidebar, header, conteúdo, agrupamentos e superfícies.
- Atualizar componentes primitivos: botão, ícone, input, card, chip, tooltip, select, dialog, sheet.
- Garantir variantes: hover/focus/pressed/selected/disabled/loading/error/dark.

### Fase 3 — Motion

- Criar os presets centralizados.
- Implementar nas interações prioritárias: botões, seleção, drawer, modal, menu, tabs e transições de cards.
- Reutilizar springs entre componentes de intenção equivalente.
- Rever motion em sequência rápida, com gestos interrompidos e modo reduced-motion.

### Fase 4 — Adaptação de páginas

- Migrar tela por tela; preservar layout quando já funciona.
- Aplicar níveis de expressividade por contexto (densidade de informação/criticidade).
- Revisar tablet e mobile, sem converter todo layout desktop em cards gigantes.

### Fase 5 — Testes e polimento

- Executar lint, typecheck, testes e build.
- Fazer testes visuais light/dark + responsividade e interação por teclado.
- Validar contraste, performance, animações, formulários e regressões funcionais.
- Documentar decisões e mudanças no `DESIGN.md`/arquivos da equipe.

---

## 16. QUALITY GATES — critérios de aceite

### Visual e design system

- [ ] A marca original está reconhecível; nenhuma paleta demo foi imposta inadvertidamente.
- [ ] Todas as cores relevantes são referenciadas por papéis, não HEX arbitrário.
- [ ] Light e dark usam paletas reais; a alternância não gera flash relevante.
- [ ] `on*` corresponde ao fundo de cada componente.
- [ ] Superfícies distinguem níveis sem depender apenas de sombra.
- [ ] Shapes, espaçamentos e estilos tipográficos usam escalas consistentes.
- [ ] Densidade da informação permaneceu adequada; não surgiram cartões desnecessariamente enormes.
- [ ] Ícones pertencem a famílias coerentes e têm rótulos onde necessário.

### Motion e interação

- [ ] Spatial/effects têm funções distintas; não há animações aleatórias.
- [ ] Movimentos podem ser interrompidos e não atrasam ações essenciais.
- [ ] Estado pressed/selected/expanded possui feedback inequívoco.
- [ ] Popovers, modals e menus preservam foco, ESC e gestos naturais.
- [ ] `prefers-reduced-motion` está respeitado.
- [ ] Não há scroll-jacking, layout shift excessivo ou animações infinitas gratuitas.

### Acessibilidade e funcionamento

- [ ] Contraste: **WCAG AA** em texto normal (em geral 4,5:1), texto grande (3:1) e elementos gráficos/controles quando aplicável (3:1); checar exceções e definição da norma.
- [ ] Navegação por teclado, ordem de foco, `aria-*`/labels e leitores de tela testados.
- [ ] Controles touch têm alvo adequado; planejar **48×48 CSS px/dp** onde o contexto exigir (referência ergonômica), sem confundir com o mínimo normativo WCAG 2.2.
- [ ] Zoom de 200–400%, reflow e textos longos não quebram telas.
- [ ] Rotas, API, autenticação, permissões, upload, formulários, filtros, paginação e dados preservados.
- [ ] Build e testes passam; não surgiram novas dependências injustificadas.

### Performance

- [ ] Reflows/forced layout e cálculos de animação não degradam rolagem.
- [ ] Movimentos em listas grandes foram reduzidos/virtualizados quando necessário.
- [ ] Bundle de ícones/fontes não aumentou sem justificativa.
- [ ] Medir antes/depois de métricas de carregamento e interação reais; não inventar ganho de performance.

---

## 17. ANTIPADRÕES — o que o agente **não** deve fazer

1. Substituir a identidade visual existente por um tema roxo genérico.
2. Aplicar `border-radius: 32px` e sombra forte em qualquer elemento.
3. Colocar hover com `translateY(-8px)` em todas as linhas, cards e listas.
4. Animar todos os blocos ao entrar na viewport, especialmente dashboards densos.
5. Trocar todo componente nativo por componente custom sem paridade de acessibilidade.
6. Criar transitions globais `* { transition: all ... }`.
7. Usar interpolação de `height:auto`/path morph sem avaliar compatibilidade e performance.
8. Inventar API de biblioteca, importar componentes incompatíveis ou instalar pacote não solicitado.
9. Misturar `onPrimary` em `primaryContainer` sem verificar contraste.
10. Desrespeitar o tema dark, reduzir `focus-visible` ou remover labels de ações.
11. Comprometer responsividade para inserir elementos expressivos.
12. Reescrever backend, rotas ou lógica apenas por decisão de design.
13. Confundir exemplos e presets **autorais** com regras oficiais do M3 Expressive.

---

## 18. PROMPT MASTER — COLE NO SEU AGENTE DE CÓDIGO

> **Instrução:** copiar integralmente o bloco abaixo para o agente com acesso ao repositório. Este bloco é autossuficiente, mas a implementação deverá consultar as seções 0–17 deste arquivo como especificação detalhada.

```text
# PAPEL
Você é um Lead Product Designer, Design Systems Architect, Frontend Engineer e Motion Designer sênior. É especialista em Material Design 3 (M3) Expressive, migração incremental de aplicações existentes, acessibilidade WCAG, design tokens, web performance e animação baseada em física.

# OBJETIVO
Evolua visualmente MEU PROJETO EXISTENTE para incorporar os princípios e padrões do Material 3 Expressive: Color System, Color Roles, Surface Containers, Typography, Shape System, Spacing, Density, Adaptive Layouts, Elevation, State Layers, Material Symbols/Iconography, Components, Motion Schemes, Springs, Spatial Transitions, Effects, Shape Morphing, Interactions e UX responsiva.

NÃO crie um novo projeto. NÃO refaça a aplicação do zero. NÃO altere funções, regras de negócio, APIs, rotas, autenticação, integrações ou conteúdo sem necessidade. A solução deve parecer uma evolução cuidadosa do produto atual, e não um template genérico do Google.

# FONTE DA VERDADE E PRECEDÊNCIA
1. Código, funcionalidades e requisitos reais do projeto.
2. Branding existente, identidade visual, CSS/tokens e DESIGN.md atual.
3. Diretrizes oficiais do Material 3 Expressive, reinterpretadas conforme contexto e plataforma.
4. Este documento de migração como especificação complementar.
5. Preferências autorais apenas onde não houver definição anterior.

Leia o conteúdo de M3_EXPRESSIVE_MIGRATION_MASTER.md, se presente no repositório, e consulte os links oficiais de referência. Não finja ter lido arquivos ausentes. Identifique o stack real antes de propor APIs, instalar pacotes ou modificar arquivos.

# ETAPA 1 — AUDITORIA DO PROJETO
Examine a árvore de pastas e identifique framework, componentes, stylesheet, temas, bibliotecas UI, fontes, ícones, roteamento, animações atuais, breakpoints, testes e documentação. Registre os riscos e os fluxos que não podem sofrer regressão.

Procure explicitamente DESIGN.md, tokens existentes, tema light/dark e cores reais da marca. Se encontrar design system consolidado, FAÇA MAPEAMENTO dos tokens para papéis M3 ao invés de substituir o branding.

Produza um resumo objetivo antes das alterações: o que será mantido, o que será migrado, dependências já existentes, planos por arquivo/componente e critérios de QA. Em ambiente automatizado, prossiga implementando por etapas sem pedir aprovação desnecessária.

# ETAPA 2 — FOUNDATION TOKENS
Implemente uma arquitetura de tokens dividida em:
- Cores-chave e paletas tonais coerentes com a marca;
- papéis `primary/onPrimary/primaryContainer/onPrimaryContainer`, secundário, terciário, erro;
- `surface/onSurface/onSurfaceVariant` e todos os níveis úteis `surfaceContainerLowest/Low/Default/High/Highest`, `surfaceDim`, `surfaceBright`;
- `outline`, `outlineVariant`, `scrim`, papéis inversos e fixed onde necessário;
- light/dark separados, suporte a preferências reais do usuário;
- typography scale, emphasis, shape scale M3 Expressive, spacing, density, elevation;
- state layers, iconography e presets de motion.

Nunca imponha valores HEX de demonstração. Gere ou valide cores acessíveis a partir da identidade do projeto. Nunca presuma que as mesmas cores manterão contraste em temas opostos.

# ETAPA 3 — HIERARQUIA E CONTENÇÃO
Reorganize a EXPRESSÃO VISUAL, não os fluxos de negócio:
- superfícies tonais para distinguir app shell, navegação, painéis, cards e overlays;
- diferenças de cor, tamanho e shape para priorizar CTAs importantes;
- espaços de descanso visual; hierarquia legível, escaneável e responsiva;
- densidade compacta em tabelas e dados operacionais; layout mais amplo onde fizer sentido;
- toque expressivo em momentos de destaque, sem excesso decorativo.

# ETAPA 4 — COMPONENTES E ESTADOS
Atualize/adapte os componentes REAIS existentes:
Button, IconButton, Toggle, ButtonGroup, SplitButton quando útil, Card, Navigation, Sidebar, Header, Dialog, Sheet, Popover, Tooltip, Inputs, Selects, Chips, Tabs, FAB quando justificado, Search, Snackbar, Loading, Progress, Carousel, tabelas, gráficos e estados vazios.

Para cada componente entregue todos os estados aplicáveis: default, hover, focus-visible, pressed, active, selected, disabled, loading, error e dragged. Garanta semântica e navegação por teclado.

Não substitua UI primitiva estável por implementação inferior. Reuse a stack instalada; só considere dependência nova com justificativa de custo, bundle, manutenção e acessibilidade.

# ETAPA 5 — MOTION SYSTEM (PRIORITÁRIA)
Use o modelo conceitual oficial de MotionScheme: STANDARD e EXPRESSIVE, cada um com fast/default/slowSpatial e fast/default/slowEffects.

- Spatial: movimento de posição, tamanho, geometria e continuidade espacial.
- Effects: cor, alpha e realces sem alteração espacial.
- Escolha STANDARD para operações frequentes e utilitárias.
- Escolha EXPRESSIVE para CTAs principais, transições significativas, abertura de superfícies, seleção e hero moments.
- Preferir springs físicos interruptíveis onde a stack oferecer suporte confiável.
- Se a stack não tiver springs, usar fallback CSS discreto e documentar a diferença; não fingir paridade com Compose.
- Implementar feedback de press, estado ativo, indicadores deslizantes, acordeões, menus, dialogs, navegação contextual e/ou shared transitions SOMENTE onde agreguem continuidade.
- Não animar cada componente apenas por decorar.
- Respeitar prefers-reduced-motion, touch, teclado e alto custo de layout.
- Evitar transition: all, loops decorativos, scroll-jacking e dependências não necessárias.

# ETAPA 6 — TIPOGRAFIA, SHAPES E ÍCONES
Mapeie a tipografia atual à escala Display / Headline / Title / Body / Label; preserve a fonte da marca. Use pesos, larguras variáveis e emphasized typography somente onde legíveis e tecnicamente suportados.

Adote shape tokens consistentes: 0, 4, 8, 12, 16, 20, 28, 32, 48 e full, selecionando por função e contexto. Morphing de shape deve indicar mudança de estado, não ser aleatório.

Preserve a biblioteca de ícones existente caso seja coerente. Caso opte por Material Symbols, escolha família e eixos consistentes; cuide de bundle, aria-label e estados selected (outlined/filled).

# ETAPA 7 — RESPONSIVIDADE, ACESSIBILIDADE, DARK MODE
Teste compact, medium, expanded e large; não obrigue breakpoint fixo se a interface precisar de container queries. Verifique reflow/zoom, tabelas, modals, menu, touch e navegação. Cumprir WCAG 2.2 AA no que couber (contraste, foco, teclado, labels, tamanhos de alvo, reduced motion e comunicação não baseada apenas em cor).

Light e dark são ambos produtos completos. Corrija flash de tema e hydration mismatch quando aplicável.

# ETAPA 8 — IMPLEMENTAÇÃO INCREMENTAL
Implemente na ordem: AUDITORIA → TOKENS → APP SHELL → PRIMITIVOS → MOTION → TELAS → TESTES → DOCUMENTAÇÃO.
Trabalhe nos arquivos existentes, usando o padrão do repositório. Evite refactors amplos não relacionados à migração visual. Ao final de cada fase, verifique compilação e principais fluxos.

# ETAPA 9 — CRITÉRIOS DE ENTREGA
Entregar:
1. Alterações reais no código (não apenas mockups).
2. Design tokens e theme centralizados, documentados e reutilizáveis.
3. Componentes refatorados com variantes e estados.
4. Motion presets e mecanismos de acessibilidade.
5. Adaptação das telas prioritárias, mantendo as funcionalidades.
6. Um `M3_MIGRATION_REPORT.md` com mudanças, decisões, divergências intencionais das diretrizes, dependências e próximos passos.
7. Relatório dos comandos de lint, typecheck, testes e build efetivamente executados; falhas remanescentes listadas honestamente.

# CHECKLIST FINAL OBRIGATÓRIO
[ ] Projeto continua funcionando.
[ ] Branding original preservado.
[ ] Tokens semânticos para cores, shape, type, spacing, elevation e motion.
[ ] Light/dark acessíveis.
[ ] UI expressiva sem poluição visual.
[ ] Component states e foco visível.
[ ] Springs e transitions causais, coerentes e interruptíveis.
[ ] `prefers-reduced-motion` respeitado.
[ ] Responsividade preservada.
[ ] Nenhum pacote desnecessário.
[ ] Build/testes realizados quando disponíveis.

Comece agora lendo o repositório e identificando os arquivos de design system. Em seguida implemente as melhorias progressivamente. Quando houver ausência de contexto, faça a melhor adaptação fundamentada e documente as suposições; nunca invente que inspecionou arquivos que não existem.
```

---

## 19. REFERÊNCIAS E LINKS PARA AUDITORIA

### Material e pesquisa oficial

1. [Material 3 Expressive — artigo solicitado: Start building with M3 Expressive](https://m3.material.io/blog/building-with-m3-expressive) — visão geral e ponto de partida (a página depende de JavaScript).
2. [Google Design — The research behind expressive design](https://design.google/library/expressive-material-design-google-research) — fundamento dos cinco recursos expressivos e alerta sobre preservação de usabilidade.
3. [Material Design 3 — portal oficial](https://m3.material.io/) — especificações, componentes e estilos.
4. [Material 3 — Color roles](https://m3.material.io/styles/color/roles) — papéis semânticos.
5. [Material 3 — Motion, how it works](https://m3.material.io/styles/motion/overview/how-it-works) — springs espaciais e de efeitos.
6. [Material Design 3 in Jetpack Compose — Android Developers](https://developer.android.com/develop/ui/compose/designsystems/material3) — paletas, tipografia, formas, elevação, componentes e acessibilidade.
7. [Material 3 MotionScheme — referência Android](https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme) — standard/expressive e seis categorias de animação.
8. [MotionScheme.kt — código-fonte Android versionado](https://android.googlesource.com/platform/frameworks/support/+/43a3dc60a427d3fffa9cbc3f83e5f9a1c5cec29a/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt) — valores de uma implementação específica.
9. [Material 3 Shapes — referência Android](https://developer.android.com/reference/kotlin/androidx/compose/material3/Shapes) — escalas de shape e extensões Expressive.
10. [Material Symbols — guia oficial Google Fonts](https://developers.google.com/fonts/docs/material_symbols) — eixos variáveis, famílias e web font.
11. [Material Color System — codelab Android](https://developer.android.com/codelabs/m3-design-theming) — geração e aplicação de paleta para marca.
12. [Android — Compose Material3 release notes](https://developer.android.com/jetpack/androidx/releases/compose-material3) — versões e compatibilidade de APIs.
13. [Android — Guide to animations in Compose](https://developer.android.com/develop/ui/compose/animation/quick-guide) — animações por spring, tween e interrupção.
14. [Material components Android — Button groups](https://github.com/material-components/material-components-android/blob/master/docs/components/ButtonGroup.md) — updates Expressive.
15. [Material components Android — Loading indicators](https://github.com/material-components/material-components-android/blob/master/docs/components/LoadingIndicator.md) — indicador Expressive para esperas curtas.
16. [Material components Android — Color theming](https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md) — superfícies tonais e variantes.

### Referências de acessibilidade

17. [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/) — contraste, navegação e critérios de acessibilidade.
18. [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — implementação web.

---

## 20. ENTREGA RECOMENDADA AO TIME / AGENTE

**Arquivos desejáveis no repositório após a migração** (adaptar nomes à stack):

```text
/docs
  /design-system
    M3_EXPRESSIVE_MIGRATION_MASTER.md   # esta especificação
    M3_AUDIT.md                         # situação anterior + mapeamento
    M3_MIGRATION_REPORT.md              # mudanças implementadas + QA
  DESIGN.md                             # atualizar o atual; não substituir cegamente
/src
  /styles  ou /theme
    color.tokens.*
    typography.tokens.*
    shape.tokens.*
    spacing.tokens.*
    elevation.tokens.*
    state.tokens.*
    motion.tokens.*
  /components
    ...                                  # os existentes, sem nova biblioteca forçada
```

**Critério de sucesso final:** o produto deve **continuar sendo o mesmo produto**, com identidade preservada, porém com hierarquia mais clara, componentes e superfícies coerentes, interação perceptivelmente melhor e movimento expressivo a serviço da experiência.
