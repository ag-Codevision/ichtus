# 📋 ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE (SPEC)
## PROJETO: PLATAFORMA INTEGRADA GLESSIOS — COMUNICAÇÃO VISUAL
**Versão:** 1.0.0  
**Status:** Aprovado para Desenvolvimento  
**Data:** Outubro de 2026  
**Stack Base:** Next.js (App Router / TypeScript) | PostgreSQL | Tailwind CSS | VPS Linux  

---

## 1. Visão Geral e Objetivos do Produto

A **Glessios** é uma empresa especializada em comunicação visual (fachadas comerciais, luminosos, letreiros em ACM/acrílico, banners, adesivagem de frotas, corte laser/router e sinalização arquitetônica).

O objetivo deste projeto é desenvolver uma solução web unificada, composta por:
1. **Website & Portfólio Institucional Cinematográfico:** Vitrine pública de alta performance e apelo visual premium (alinhada às diretrizes de [DESIGN.md](file:///f:/_CLIENTES/Glessios/Site/DESIGN.md) e [Animaçoes.md](file:///f:/_CLIENTES/Glessios/Site/Anima%C3%A7oes.md)), com captação ativa de leads e agendamento de serviços.
2. **Blog Autônomo com Inteligência Artificial:** Pipeline automatizado que gera pautas, redige artigos com rigor técnico em SEO utilizando a **API da NVIDIA** (NVIDIA NIM / LLM) e seleciona imagens de alta resolução em bancos gratuitos, mantendo o domínio relevante e bem posicionado no Google sem intervenção manual diária.
3. **Painel Administrativo Operacional e ERP:** Central de gestão completa para o administrador e equipe interna, englobando:
   - **CRM com Funil Kanban:** Gestão de oportunidades comerciais com conversão automática de negócios em Ordens de Serviço (OS).
   - **Gestão de Ordens de Serviço & Fluxo de Produção:** Acompanhamento dos estágios de design/arte, corte, impressão, montagem, acabamento e instalação.
   - **Controle de Estoque de Insumos:** Registro e baixa automática de materiais (chapas de ACM, bobinas de lona, vinil adesivo, acrílico, perfis metálicos, LEDs, tintas).
   - **Módulo Financeiro Consolidado:** Orçamentos, faturas, contas a pagar/receber, fluxo de caixa e relatórios analíticos de rentabilidade.
   - **Agendamento de Serviços e Instalações:** Cronograma de atendimentos técnicos e equipes de campo.
4. **Portal / Dashboard Exclusivo do Cliente:** Área restrita onde o cliente acompanha em tempo real o status de suas OSs, visualiza e aprova provas digitais de artes, gerencia faturas e solicita novos agendamentos com notificações sincronizadas via plataforma e **WhatsApp**.

---

## 2. Perfis de Usuário e Matriz de Acessos (RBAC)

O sistema opera com controle de acesso baseado em funções (Role-Based Access Control - RBAC):

| Função / Perfil | Permissões e Acessos |
|---|---|
| **Administrador (Admin)** | Acesso total irrestrito: configurações do sistema, usuários, financeiro completo, estoque, fluxo de produção, CRM, blog IA, galeria do portfólio e relatórios globais. |
| **Operacional / Designer** | Acesso ao fluxo de produção de artes, ordens de serviço, upload de provas digitais, baixa de estoque e visualização do calendário de produção. |
| **Cliente** | Acesso restrito ao Portal do Cliente: visualização de suas próprias OSs, aprovação/rejeição de provas de arte, download de faturas, histórico financeiro pessoal e solicitação de agendamentos. |

---

## 3. Requisitos Funcionais Detalhados (RF)

### 3.1. RF-01 — Website Público & Portfólio Cinematográfico
- **RF-01.1 — Hero Section Cinematográfica:** Apresentação da marca com direção de arte editorial dark (#0B0C0D) e acentos em laranja vibrante (#FF650F), tipografia Manrope, microinterações, profundidade visual e animações refinadas orientadas à conversão.
- **RF-01.2 — Galeria Dinâmica de Projetos:** Catálogo visual categorizado (ex: Fachadas ACM, Envelopamento, Letreiros Luminosos, Displays, Totens). Cada projeto deve conter:
  - Título, cliente, categoria, descrição das técnicas e materiais aplicados.
  - Carrossel/lightbox de fotos em alta definição com zoom e comparativos antes/depois.
- **RF-01.3 — Captação de Leads:** Formulário de contato rápido e solicitação de orçamento com campos estruturados (Nome, WhatsApp, E-mail, Tipo de Serviço, Descrição e Upload de arquivo de referência), inserindo o lead diretamente no CRM Kanban.
- **RF-01.4 — Agendamento de Serviços pelo Cliente:** Formulário público ou autenticado para agendamento de visita técnica, medição no local ou consulta de projeto, respeitando disponibilidade de agenda.

### 3.2. RF-02 — Blog Autônomo com IA (NVIDIA API & SEO)
- **RF-02.1 — Motor de Geração Autônomo:** Serviço em background (Cron Job) que pesquisa tendências ou consome matrizes de tópicos de comunicação visual e aciona a **API da NVIDIA** (modelos Llama 3 / Mistral / Nemotron via NVIDIA NIM) para gerar artigos completos em Markdown.
- **RF-02.2 — Integração com Banco de Imagens Gratuito:** O motor extrai palavras-chave do artigo gerado e consulta APIs de bancos gratuitos (ex: Unsplash API / Pexels API) para recuperar e vincular imagens de alta qualidade com tags ALT automáticas.
- **RF-02.3 — Otimização de SEO Automatizada:**
  - Geração automática de `meta title`, `meta description`, `canonical URL` e `slug` amigável.
  - Estruturação semântica com H1, H2, H3, listas e bullet points.
  - Injeção de dados estruturados JSON-LD (`Article`, `BreadcrumbList`, `Organization`).
  - Atualização automática do arquivo `sitemap.xml` e RSS feed a cada publicação.
- **RF-02.4 — Fluxo de Publicação:**
  - Modo 100% autônomo (publicação direta agendada) ou Modo Rascunho com validação/aprovação do Admin.
  - Painel de edição rica (Rich Text/Markdown) para intervenções manuais pontuais pelo Admin.

### 3.3. RF-03 — CRM de Vendas com Funil Kanban
- **RF-03.1 — Colunas Padrão do Funil:**
  1. `Novo Lead` (leads vindos do site ou cadastrados manualmente).
  2. `Briefing / Qualificação` (detalhamento das necessidades e medidas).
  3. `Proposta Enviada` (orçamento emitido e aguardando retorno).
  4. `Aprovado` (fechamento comercial).
  5. `Em Produção` (acompanhamento integrado à fábrica).
  6. `Entregue / Concluído` (projeto finalizado).
  7. `Perdido` (motivo do descarte registrado).
- **RF-03.2 — Gestão e Customização de Colunas:** Possibilidade de criar, renomear, reordenar ou excluir etapas do funil pelo Admin.
- **RF-03.3 — Conversão Automática para OS e Financeiro:** Ao mover o card para a coluna `Aprovado`, o sistema deve automaticamente:
  - Abrir uma Ordem de Serviço (OS) correspondente no módulo de produção.
  - Gerar o lançamento de Contas a Receber ou Fatura no módulo financeiro.
  - Criar o cadastro do cliente e enviar e-mail/WhatsApp com link de boas-vindas ao Portal do Cliente.

### 3.4. RF-04 — Ordem de Serviço (OS) & Fluxo de Produção de Artes
- **RF-04.1 — Estrutura da Ordem de Serviço:**
  - Código único sequencial (ex: `OS-2026-0042`).
  - Dados do cliente, prazos de entrega e instalação.
  - Lista de itens do pedido (serviço, dimensões em metros/cm, acabamentos).
  - Anexos técnicos (vetores, gabaritos, arquivos PDF/EPS/Corel/Illustrator).
- **RF-04.2 — Etapas do Fluxo de Produção (Pipeline Industrial):**
  1. `Criação / Ajuste de Arte`
  2. `Aprovação de Prova Digital pelo Cliente`
  3. `Corte / Router / Gravação`
  4. `Impressão Digital / Laminação`
  5. `Serralheria / Montagem / Elétrica`
  6. `Controle de Qualidade / Acabamento`
  7. `Pronto para Envio / Instalação em Campo`
  8. `Instalado / Concluído`
- **RF-04.3 — Aprovação de Prova Digital de Arte:**
  - O designer faz o upload da arte final renderizada (imagem/mockup PDF).
  - O cliente é notificado na dashboard e por WhatsApp.
  - No Portal do Cliente, há visualizador com botões claros de **Aprovar Arte** ou **Solicitar Alterações** (com campo obrigatório para descrever as mudanças).
- **RF-04.4 — Notificações de Status:** A cada transição de etapa da OS, o sistema dispara atualização para o dashboard do cliente e mensagem automatizada via WhatsApp.

### 3.5. RF-05 — Controle de Estoque de Materiais
- **RF-05.1 — Cadastro de Materiais:**
  - Identificação: Nome, SKU, Categoria (Lonas, Adesivos, ACM, Acrílicos, Tintas, Ferragens, Iluminação LED, Suprimentos).
  - Unidade de Medida: m², metro linear, placa/chapa, litro, unidade, rolo.
  - Parâmetros: Quantidade atual, estoque mínimo de segurança, custo unitário médio e fornecedor principal.
- **RF-05.2 — Baixa Automática por OS:** Possibilidade de vincular matérias-primas à Ordem de Serviço. Ao iniciar a fabricação, o sistema deduz os insumos consumidos.
- **RF-05.3 — Gestão de Entradas e Ajustes Manuais:** Registro de compras de reposição com histórico de data, valor e fornecedor. Alerta visual quando o estoque atingir o nível crítico/mínimo.

### 3.6. RF-06 — Módulo Financeiro, Faturas e Fluxo de Caixa
- **RF-06.1 — Orçamentos e Propostas:**
  - Emissão de propostas comerciais detalhadas com cálculo automático de margem, materiais e mão de obra.
  - Geração de PDF profissional personalizado com a identidade visual da Glessios.
  - Link público seguro com botão para aprovação direta pelo cliente.
- **RF-06.2 — Contas a Receber e Faturas:**
  - Gestão de parcelas e faturas atreladas às OSs.
  - Formas de pagamento suportadas: PIX com QR Code dinâmico, Boleto Bancário e Cartão de Crédito.
  - Conciliação e baixa manual ou automática via webhook de gateway.
- **RF-06.3 — Contas a Pagar:**
  - Registro de custos fixos e variáveis (fornecedores de materiais, energia, folhas, manutenção de maquinário, aluguel).
- **RF-06.4 — Fluxo de Caixa e Relatórios:**
  - Visão diária, semanal e mensal de entradas, saídas e saldo projetado.
  - Relatório de DRE Simplificado (Demonstrativo do Resultado do Exercício).
  - Análise de faturamento por tipo de serviço e margem de contribuição.

### 3.7. RF-07 — Sistema de Agendamentos & Calendário de Campo
- **RF-07.1 — Tipos de Agendamentos:**
  - `Visita Técnica e Medição` (visita prévia ao cliente para orçamentação).
  - `Produção Interna` (reserva de maquinário como Router CNC ou Impressora UV).
  - `Instalação Externa` (deslocamento de equipe de instaladores para fixação de fachadas/luminosos).
  - `Entrega / Retirada` de materiais na sede da empresa.
- **RF-07.2 — Visões da Agenda:** Visualização em grade mensal, semanal, diária e lista de compromissos com filtros por equipe/responsável e status.

### 3.8. RF-08 — Portal / Dashboard do Cliente
- **RF-08.1 — Acesso e Autenticação:** Login seguro via e-mail e senha ou Magic Link (token único enviado ao WhatsApp/e-mail).
- **RF-08.2 — Visão Geral de Pedidos:** Listagem de todas as OSs ativas com timeline visual interativa do progresso de fabricação.
- **RF-08.3 — Central de Provas e Aprovação de Artes:** Galeria de artes aguardando decisão do cliente com histórico de versões.
- **RF-08.4 — Financeiro do Cliente:** Visualização de faturas pendentes, botões para cópia de código PIX Copia-e-Cola e recibos de pagamento emitidos.
- **RF-08.5 — Solicitação de Novo Serviço:** Abertura rápida de novo pedido ou agendamento de visita diretamente pela dashboard.

### 3.9. RF-09 — Motor de Notificações Multicanal (WhatsApp & In-App)
- **RF-09.1 — Integração WhatsApp:** Disparo de mensagens automáticas via API (ex: Evolution API / Z-API / Twilio) para eventos-chave:
  - Criação de orçamento / link de aprovação.
  - Prova de arte pronta para aprovação.
  - OS em rota para instalação.
  - Fatura gerada com código PIX.
- **RF-09.2 — Notificações Internas (In-App):** Centro de notificações no painel administrativo e no portal do cliente com contadores em tempo real.

---

## 4. Requisitos Não Funcionais (RNF)

| Identificador | Categoria | Descrição e Métrica |
|---|---|---|
| **RNF-01** | **Performance** | O site institucional público deve atingir pontuação ≥ 90 no Google PageSpeed Insights (Mobile e Desktop), LCP < 2.0s, CLS < 0.05 e FID/INP < 100ms. |
| **RNF-02** | **Segurança** | Autenticação com senhas criptografadas em bcrypt/Argon2, sessões via JWT em cookies `HttpOnly`, `SameSite=Lax`, proteção contra CSRF, XSS e injeção SQL via ORM tipado. Conformidade com a LGPD. |
| **RNF-03** | **SEO & Acessibilidade** | Código semântico HTML5, meta tags OpenGraph/Twitter Cards, renderização SSR/SSG no Next.js para indexação instantânea por crawlers, conformidade WCAG 2.1 AA para contrastes e acessibilidade por teclado. |
| **RNF-04** | **Confiabilidade & Resiliência** | Mecanismos de retry exponencial para chamadas à API da NVIDIA e bancos de imagem. Em caso de indisponibilidade de IA, o sistema registra logs estruturados e mantém o site operacional. |
| **RNF-05** | **Infraestrutura & Deploy** | Toda a aplicação deve ser empacotada em containers Docker e orquestrada via Docker Compose em VPS Ubuntu com Nginx como Reverse Proxy e certificado SSL Let's Encrypt automatizado. |
| **RNF-06** | **Responsividade** | Interface 100% responsiva e adaptada para dispositivos móveis (smartphones), tablets e monitores widescreen de alta densidade de pixels. |

---

## 5. Mapeamento de Edge Cases e Tratamento de Exceções

1. **Falha ou Alucinação na API da NVIDIA:**
   - *Risco:* O modelo de IA retornar texto truncado, com erros gramaticais ou conteúdo fora das diretrizes da marca.
   - *Mitigação:* Pipeline de validação com sanitização de Markdown, filtro de moderação de palavras e tamanho mínimo/máximo obrigatório. Todo artigo gerado passa pelo status `draft` antes da publicação ou requer aprovação do Admin se o índice de confiança for baixo.
2. **Esgotamento de Quota / Limite de Requisições de Imagens:**
   - *Risco:* Falha na API do Unsplash/Pexels.
   - *Mitigação:* Fallback para repositório local de imagens curadas padrão de comunicação visual da Glessios, garantindo que nenhum post seja publicado sem capa.
3. **Conflito de Horários em Agendamentos Simultâneos:**
   - *Risco:* Dois clientes agendarem a mesma equipe de instalação para a mesma data/hora.
   - *Mitigação:* Bloqueio pessimista de transação no banco de dados e validação de disponibilidade por slot no momento do checkout do agendamento.
4. **Tentativa de Baixa em Estoque Insuficiente:**
   - *Risco:* Uma OS exigir 50m² de ACM e o estoque físico/digital indicar apenas 10m².
   - *Mitigação:* O sistema não bloqueia bruscamente a produção, mas marca a OS com aviso crítico `Insumo em Falta`, gerando automaticamente um alerta de reposição urgente para o Admin no módulo de compras.
5. **Rejeição Recorrente de Provas de Arte:**
   - *Risco:* O cliente solicitar múltiplas revisões de arte consecutivas sem convergência.
   - *Mitigação:* Contador de iterações de arte visível na OS; a partir da 3ª solicitação de alteração, um alerta é emitido para contato direto do gerente de contas com o cliente.

---

## 6. Critérios de Aceite em Formato BDD (Gherkin)

```gherkin
Funcionalidade: Geração e Publicação Automatizada do Blog com IA
  Como administrador da Glessios
  Quero que a IA crie e publique artigos com SEO e imagens otimizadas
  Para aumentar o tráfego orgânico sem demandar esforço editorial manual

  Cenário: Geração autônoma com sucesso
    Dado que o agendador de tarefas (Cron) é disparado às 06:00
    E a cota da API da NVIDIA está disponível
    Quando o serviço solicita a geração de pauta e artigo técnico de comunicação visual
    E busca uma imagem relevante no banco gratuito com dimensões mínimas de 1200x630
    Então o artigo deve ser salvo no banco de dados
    E as tags de OpenGraph, schema JSON-LD e slug amigável devem ser criadas
    E o sitemap.xml do site deve incluir a nova URL em até 30 segundos.

Funcionalidade: Transição de Lead para OS e Faturamento no CRM Kanban
  Como gestor de atendimento
  Quero mover um card para Aprovado no Kanban
  Para iniciar automaticamente a produção e a cobrança

  Cenário: Conversão automática de negócio fechado
    Dado que existe um lead "Academia Iron - Fachada ACM" na coluna "Proposta Enviada"
    Quando o administrador arrasta o card para a coluna "Aprovado"
    Então o sistema deve criar uma nova Ordem de Serviço vinculada ao cliente
    E deve criar um registro de Contas a Receber correspondente ao valor orçado
    E deve disparar uma notificação via WhatsApp para o cliente com as credenciais de acesso ao Portal.

Funcionalidade: Aprovação de Prova de Arte pelo Portal do Cliente
  Como cliente da Glessios
  Quero visualizar e aprovar a prévia digital da minha fachada
  Para que o projeto entre na linha de corte e impressão

  Cenário: Cliente aprova arte digital
    Dado que o cliente está autenticado em sua dashboard
    E visualiza a OS-2026-0042 com status "Aguardando Aprovação de Arte"
    Quando o cliente clica no botão "Aprovar Arte Sem Ressalvas"
    Então o status da OS muda imediatamente para "Em Produção - Corte/Impressão"
    E a equipe interna recebe um alerta em tempo real na tela de produção
    E uma mensagem de confirmação com estimativa de instalação é enviada para o WhatsApp do cliente.
```