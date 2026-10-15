# 🏗️ DOCUMENTO DE DESIGN DE SISTEMA (SDD)
## PROJETO: PLATAFORMA INTEGRADA GLESSIOS — COMUNICAÇÃO VISUAL
**Versão:** 1.0.0  
**Data:** Outubro de 2026  
**Status:** Arquitetura Aprovada  
**Documento de Requisitos de Referência:** [SPEC.md](file:///f:/_CLIENTES/Glessios/Site/SPEC.md)  
**Diretrizes Visuais e Motion:** [DESIGN.md](file:///f:/_CLIENTES/Glessios/Site/DESIGN.md) & [Animaçoes.md](file:///f:/_CLIENTES/Glessios/Site/Anima%C3%A7oes.md)  

---

## 1. Visão Geral da Arquitetura

O sistema adota uma **Arquitetura Modular Monolítica em Next.js (App Router)** orientada a domínios (Domain-Driven Design simplificado). Essa escolha garante máxima eficiência para implantação em VPS única, baixa latência, suporte a SSR/SSG nativo para o portal público com SEO de elite e uma base de código unificada em TypeScript com tipagem estrita de ponta a ponta.

### 1.1. Diagrama de Containers e Camadas (C4 Model)

```mermaid
graph TB
    subgraph Cliente["Navegadores & Dispositivos"]
        WebPublico["Site Público & Portfólio (SSR/SSG)"]
        PainelAdmin["Painel Admin / ERP (React / Dashboard)"]
        PortalCliente["Portal do Cliente (SPA / Mobile Responsive)"]
    end

    subgraph ServidorVPS["Infraestrutura VPS (Ubuntu Linux / Docker)"]
        Nginx["Reverse Proxy (Nginx + SSL Let's Encrypt)"]
        
        subgraph NextApp["Aplicação Next.js (Node.js Container)"]
            Router["App Router & Middleware de Segurança"]
            PublicPages["Páginas Públicas & SEO Engine"]
            AdminPages["Módulos ERP/CRM/Produção"]
            ClientPages["Dashboard do Cliente"]
            APIRoutes["Endpoints de API (/api/v1/*)"]
            CronWorker["Background Job Runner (Blog IA / Notificações)"]
        end

        subgraph Dados["Armazenamento & Cache"]
            PostgreSQL[(Banco de Dados PostgreSQL 16)]
            Redis[(Cache & Filas Redis 7)]
            StorageVolume[(Volume Local de Mídias / Artes / Uploads)]
        end

        subgraph ServicosLocais["Microserviço Auxiliar"]
            EvolutionAPI["Evolution API (Gateway WhatsApp)"]
        end
    end

    subgraph ProvedoresExternos["Serviços em Nuvem & APIs Externas"]
        NVIDIA["NVIDIA NIM API (LLM Llama 3 / Mistral)"]
        ImageBank["Unsplash / Pexels API (Banco de Imagens)"]
        PaymentGW["Gateway Pagamento (PIX / Boleto / Cartão)"]
    end

    WebPublico --> Nginx
    PainelAdmin --> Nginx
    PortalCliente --> Nginx

    Nginx --> Router
    Router --> PublicPages
    Router --> AdminPages
    Router --> ClientPages
    Router --> APIRoutes

    APIRoutes --> PostgreSQL
    APIRoutes --> Redis
    APIRoutes --> StorageVolume
    CronWorker --> PostgreSQL
    CronWorker --> Redis
    
    CronWorker --> NVIDIA
    CronWorker --> ImageBank
    APIRoutes --> EvolutionAPI
    APIRoutes --> PaymentGW
```

---

## 2. Diagramas de Sequência e Fluxos Operacionais

### 2.1. Fluxo 1: Motor Autônomo do Blog com IA e Banco de Imagens

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Cron Worker (BullMQ/Schedule)
    participant AIService as BlogAIService
    participant NVIDIA as NVIDIA NIM API (LLM)
    participant ImageAPI as Unsplash / Pexels API
    participant DB as PostgreSQL
    participant Cache as Next.js Revalidate & Sitemap

    Cron->>AIService: Disparar rotina diária de geração de pauta
    AIService->>NVIDIA: Solicitar artigo completo em Markdown + Palavras-Chave de Imagem
    NVIDIA-->>AIService: Retorna: Título, Conteúdo, Meta Description e Query de Busca
    AIService->>ImageAPI: Buscar imagem de alta resolução com a Query extraída
    ImageAPI-->>AIService: Retorna URL da imagem, fotógrafo e Alt Text
    AIService->>AIService: Sanitizar Markdown, gerar Slug único e calcular tempo de leitura
    AIService->>DB: Inserir novo registro em `BlogPost` (status: PUBLISHED ou DRAFT)
    AIService->>Cache: Invocar revalidatePath('/blog') e reconstruir sitemap.xml
    AIService-->>Cron: Artigo publicado com sucesso com tags de SEO e Schema JSON-LD
```

### 2.2. Fluxo 2: Do Lead Comercial à Ordem de Serviço (OS) e Faturamento

```mermaid
sequenceDiagram
    autonumber
    participant Cliente as Visitante / Cliente
    participant CRM as CRM Kanban
    participant Admin as Administrador / Vendas
    participant OSModule as Módulo de Produção (OS)
    participant Estoque as Módulo de Estoque
    participant Financeiro as Módulo Financeiro
    participant Wpp as Evolution API (WhatsApp)

    Cliente->>CRM: Envia solicitação de orçamento pelo formulário do site
    CRM->>Admin: Notifica novo lead na coluna "Novo Lead"
    Admin->>CRM: Qualifica e arrasta para "Proposta Enviada" (gera PDF)
    Cliente->>Admin: Aprova proposta comercial
    Admin->>CRM: Move card para a coluna "Aprovado"
    CRM->>OSModule: Cria Ordem de Serviço (OS-2026-XXXX) vinculada ao cliente
    OSModule->>Estoque: Reserva materiais previstos (Lona, ACM, Vinil)
    CRM->>Financeiro: Cria Fatura e Título em Contas a Receber
    Financeiro->>Wpp: Dispara mensagem com dados da OS e credenciais do Portal
    Wpp-->>Cliente: Mensagem no WhatsApp com link de acesso e boas-vindas
```

### 2.3. Fluxo 3: Aprovação de Prova Digital de Arte e Notificações

```mermaid
sequenceDiagram
    autonumber
    participant Designer as Designer / Operacional
    participant OS as Ordem de Serviço
    participant Storage as File Storage
    participant Wpp as Evolution API (WhatsApp)
    participant Cliente as Portal do Cliente
    participant Fabrica as Linha de Corte e Impressão

    Designer->>Storage: Upload de mockup renderizado (PDF/Imagem)
    Designer->>OS: Cadastra nova `ArtworkProof` na OS (v1, v2...)
    OS->>Wpp: Dispara alerta com link de aprovação direta
    Wpp-->>Cliente: "Sua prova de arte está pronta para aprovação!"
    Cliente->>Cliente: Acessa Portal do Cliente e visualiza arte
    alt Cliente Aprova
        Cliente->>OS: Clica em "Aprovar Arte Sem Ressalvas"
        OS->>OS: Atualiza status da OS para "Em Produção - Corte/Impressão"
        OS->>Fabrica: Emite alerta e libera lote para maquinário
        OS->>Wpp: Confirma aprovação e envia previsão de instalação
    else Cliente Solicita Alteração
        Cliente->>OS: Envia feedback detalhado de correção
        OS->>OS: Altera status para "Ajuste de Arte Solicitado"
        OS->>Designer: Notifica designer com as observações do cliente
    end
```

---

## 3. Modelagem Relacional de Dados (PostgreSQL / Prisma Schema)

Abaixo está a definição completa do modelo relacional, projetada para atender integralmente todas as entidades operacionais, fiscais e produtivas do negócio:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// ENUMS DO SISTEMA
// ----------------------------------------------------

enum UserRole {
  ADMIN
  OPERATIONAL_DESIGNER
  CUSTOMER
}

enum LeadSource {
  WEBSITE_FORM
  WHATSAPP
  MANUAL_ADMIN
  INSTAGRAM_FACEBOOK
  INDICATION
}

enum PriorityLevel {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum OSStage {
  BRIEFING_ARTWORK
  ARTWORK_APPROVAL
  CNC_ROUTER_CUTTING
  DIGITAL_PRINTING
  ASSEMBLY_STRUCTURE
  QUALITY_CONTROL
  READY_FOR_INSTALLATION
  INSTALLED_COMPLETED
  CANCELLED
}

enum ArtworkStatus {
  PENDING_CUSTOMER_REVIEW
  APPROVED
  REVISION_REQUESTED
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  PIX
  BOLETO
  CREDIT_CARD
  BANK_TRANSFER
  CASH
}

enum FinancialTransactionType {
  INCOME
  EXPENSE
}

enum AppointmentType {
  TECHNICAL_VISIT_MEASUREMENT
  INTERNAL_PRODUCTION_RUN
  EXTERNAL_INSTALLATION
  DELIVERY_PICKUP
}

enum AppointmentStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}

enum StockUnit {
  M2          // Metros quadrados (Lona, ACM, Vinil)
  LINEAR_METER // Metros lineares (Perfis, Fitas)
  UNIT        // Peças (LEDs, Fontes, Ilhoses)
  LITER       // Tintas e Vernizes
  SHEET       // Placas inteiras de ACM/Acrílico
  ROLL        // Rolos fechados
}

enum MovementType {
  INCOMING_PURCHASE
  OUTGOING_PRODUCTION_OS
  OUTGOING_LOSS_DEFECT
  MANUAL_ADJUSTMENT
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ----------------------------------------------------
// USUÁRIOS E AUTENTICAÇÃO
// ----------------------------------------------------

model User {
  id              String      @id @default(cuid())
  name            String
  email           String      @unique
  passwordHash    String
  phone           String?     // Formato internacional: 5541999999999
  role            UserRole    @default(CUSTOMER)
  avatarUrl       String?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  customerProfile Customer?
  createdOS       ServiceOrder[] @relation("CreatedBy")
  assignedLeads   Lead[]
  notifications   Notification[]
  stockMovements  StockMovement[]

  @@map("users")
}

model Customer {
  id             String         @id @default(cuid())
  userId         String         @unique
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName    String?        // Razão Social
  tradeName      String?        // Nome Fantasia
  documentNumber String?        // CPF ou CNPJ
  street         String?
  number         String?
  neighborhood   String?
  city           String?
  state          String?
  zipCode        String?
  notes          String?        @db.Text
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  serviceOrders  ServiceOrder[]
  invoices       Invoice[]
  appointments   Appointment[]

  @@map("customers")
}

// ----------------------------------------------------
// CRM KANBAN & LEADS
// ----------------------------------------------------

model KanbanColumn {
  id        String       @id @default(cuid())
  name      String       // Ex: Novo Lead, Briefing, Proposta Enviada, Aprovado
  order     Int          // Ordenação visual no board
  color     String?      // Cor hexadecimal para visualização
  isSystem  Boolean      @default(false)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  leads     Lead[]

  @@map("kanban_columns")
}

model Lead {
  id              String        @id @default(cuid())
  columnId        String
  column          KanbanColumn  @relation(fields: [columnId], references: [id])
  title           String        // Ex: "Fachada Loja Tech - Letreiro Luminoso"
  contactName     String
  contactPhone    String
  contactEmail    String?
  source          LeadSource    @default(WEBSITE_FORM)
  estimatedValue  Decimal?      @db.Decimal(12, 2)
  priority        PriorityLevel @default(MEDIUM)
  notes           String?       @db.Text
  assignedToId    String?
  assignedTo      User?         @relation(fields: [assignedToId], references: [id])
  orderInColumn   Int           @default(0)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  serviceOrders   ServiceOrder[]

  @@map("leads")
}

// ----------------------------------------------------
// ORDENS DE SERVIÇO & FLUXO DE PRODUÇÃO
// ----------------------------------------------------

model ServiceOrder {
  id               String         @id @default(cuid())
  code             String         @unique // Ex: "OS-2026-0001"
  customerId       String
  customer         Customer       @relation(fields: [customerId], references: [id])
  leadId           String?
  lead             Lead?          @relation(fields: [leadId], references: [id])
  createdById      String
  createdBy        User           @relation("CreatedBy", fields: [createdById], references: [id])
  title            String
  description      String?        @db.Text
  currentStage     OSStage        @default(BRIEFING_ARTWORK)
  priority         PriorityLevel  @default(MEDIUM)
  deadline         DateTime?
  installationDate DateTime?
  totalAmount      Decimal        @db.Decimal(12, 2)
  discount         Decimal        @default(0.00) @db.Decimal(12, 2)
  netAmount        Decimal        @db.Decimal(12, 2)
  notes            String?        @db.Text
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  items            ServiceOrderItem[]
  artworkProofs    ArtworkProof[]
  invoices         Invoice[]
  appointments     Appointment[]
  stockMovements   StockMovement[]

  @@map("service_orders")
}

model ServiceOrderItem {
  id             String       @id @default(cuid())
  serviceOrderId String
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id], onDelete: Cascade)
  description    String       // Ex: "Letreiro Caixa Alta Acrílico com LED"
  unit           String       // "un", "m²", etc.
  quantity       Decimal      @db.Decimal(10, 2)
  widthMeters    Decimal?     @db.Decimal(10, 3)
  heightMeters   Decimal?     @db.Decimal(10, 3)
  unitPrice      Decimal      @db.Decimal(12, 2)
  totalPrice     Decimal      @db.Decimal(12, 2)

  @@map("service_order_items")
}

model ArtworkProof {
  id             String        @id @default(cuid())
  serviceOrderId String
  serviceOrder   ServiceOrder  @relation(fields: [serviceOrderId], references: [id], onDelete: Cascade)
  version        Int           @default(1)
  title          String        // Ex: "Layout Fachada Versão 1"
  fileUrl        String        // Link do PDF/Imagem no Storage
  previewUrl     String        // Thumbnail para o portal
  status         ArtworkStatus @default(PENDING_CUSTOMER_REVIEW)
  customerNotes  String?       @db.Text
  reviewedAt     DateTime?
  createdAt      DateTime      @default(now())

  @@map("artwork_proofs")
}

// ----------------------------------------------------
// ESTOQUE DE MATERIAIS DE COMUNICAÇÃO VISUAL
// ----------------------------------------------------

model StockItem {
  id              String          @id @default(cuid())
  name            String          // Ex: "Chapa ACM 3mm Prata Brilho", "Lona 440g Fosca"
  sku             String          @unique
  category        String          // "Chapas", "Lonas", "Adesivos", "Ferragens", "LEDs"
  unit            StockUnit
  currentQuantity Decimal         @db.Decimal(12, 3)
  minQuantity     Decimal         @db.Decimal(12, 3) // Alerta de reposição
  averageUnitCost Decimal         @db.Decimal(12, 2)
  supplier        String?
  location        String?         // Galpão A, Prateleira 2
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  movements       StockMovement[]

  @@map("stock_items")
}

model StockMovement {
  id             String       @id @default(cuid())
  stockItemId    String
  stockItem      StockItem    @relation(fields: [stockItemId], references: [id])
  serviceOrderId String?
  serviceOrder   ServiceOrder? @relation(fields: [serviceOrderId], references: [id])
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  type           MovementType
  quantity       Decimal      @db.Decimal(12, 3)
  unitCost       Decimal      @db.Decimal(12, 2)
  totalCost      Decimal      @db.Decimal(12, 2)
  notes          String?
  createdAt      DateTime     @default(now())

  @@map("stock_movements")
}

// ----------------------------------------------------
// MÓDULO FINANCEIRO, FATURAS E FLUXO DE CAIXA
// ----------------------------------------------------

model Invoice {
  id               String                 @id @default(cuid())
  code             String                 @unique // Ex: "FAT-2026-0042"
  serviceOrderId   String
  serviceOrder     ServiceOrder           @relation(fields: [serviceOrderId], references: [id])
  customerId       String
  customer         Customer               @relation(fields: [customerId], references: [id])
  amount           Decimal                @db.Decimal(12, 2)
  dueDate          DateTime
  paidDate         DateTime?
  status           InvoiceStatus          @default(PENDING)
  paymentMethod    PaymentMethod?
  pixQrCodeBase64  String?                @db.Text
  pixCopyPasteCode String?                @db.Text
  pdfUrl           String?
  notes            String?
  createdAt        DateTime               @default(now())
  updatedAt        DateTime               @updatedAt

  transactions     FinancialTransaction[]

  @@map("invoices")
}

model FinancialTransaction {
  id          String                   @id @default(cuid())
  invoiceId   String?
  invoice     Invoice?                 @relation(fields: [invoiceId], references: [id])
  type        FinancialTransactionType
  category    String                   // "Vendas", "Fornecedores", "Salários", "Energia"
  description String
  amount      Decimal                  @db.Decimal(12, 2)
  entryDate   DateTime                 @default(now())
  bankAccount String?                  // Conta bancária / Caixa
  receiptUrl  String?
  createdAt   DateTime                 @default(now())

  @@map("financial_transactions")
}

// ----------------------------------------------------
// AGENDAMENTOS E CALENDÁRIO DE CAMPO
// ----------------------------------------------------

model Appointment {
  id             String            @id @default(cuid())
  title          String            // Ex: "Instalação Fachada Luminosa"
  type           AppointmentType
  status         AppointmentStatus @default(SCHEDULED)
  customerId     String?
  customer       Customer?         @relation(fields: [customerId], references: [id])
  serviceOrderId String?
  serviceOrder   ServiceOrder?     @relation(fields: [serviceOrderId], references: [id])
  scheduledAt    DateTime
  durationMinutes Int              @default(60)
  locationAddress String?
  assignedTeam   String?           // Equipe de instaladores
  notes          String?           @db.Text
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@map("appointments")
}

// ----------------------------------------------------
// PORTFÓLIO & BLOG AUTÔNOMO COM IA
// ----------------------------------------------------

model PortfolioProject {
  id             String   @id @default(cuid())
  title          String
  slug           String   @unique
  category       String   // "Fachadas", "Envelopamento", "Luminosos", "Stands"
  clientName     String?
  description    String   @db.Text
  featuredImage  String
  galleryImages  String[] // URLs adicionais
  tags           String[]
  isFeatured     Boolean  @default(false)
  completedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("portfolio_projects")
}

model BlogPost {
  id              String     @id @default(cuid())
  title           String
  slug            String     @unique
  excerpt         String     @db.Text
  contentMarkdown String     @db.Text
  coverImageUrl   String
  imageAlt        String
  imagePhotographer String?
  status          PostStatus @default(PUBLISHED)
  metaTitle       String
  metaDescription String
  canonicalUrl    String?
  tags            String[]
  readingTimeMin  Int        @default(4)
  viewCount       Int        @default(0)
  publishedAt     DateTime   @default(now())
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@map("blog_posts")
}

// ----------------------------------------------------
// NOTIFICAÇÕES MULTICANAL (IN-APP & WHATSAPP)
// ----------------------------------------------------

model Notification {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title             String
  message           String    @db.Text
  linkUrl           String?
  isRead            Boolean   @default(false)
  sentViaWhatsapp   Boolean   @default(false)
  whatsappStatus    String?   // "SENT", "DELIVERED", "FAILED"
  createdAt         DateTime  @default(now())

  @@map("notifications")
}
```

---

## 4. Contratos de API RESTful e Schemas JSON

A arquitetura de API segue convenções RESTful em `/api/v1/*`, com validação rigorosa de entrada via **Zod** e tipagem estrita de resposta.

### 4.1. Blog IA — Trigger de Geração Autônoma
- **Endpoint:** `POST /api/v1/cron/generate-article`
- **Autenticação:** Header `Authorization: Bearer <CRON_SECRET_TOKEN>`
- **Request Body:** Opcional (se vazio, a IA define a pauta com base na matriz de palavras-chave de comunicação visual).
```json
{
  "forcedTopic": "Tendências de Fachadas em ACM com Iluminação LED Indireta para 2027",
  "publishImmediately": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx001blog992",
    "title": "Tendências de Fachadas em ACM com Iluminação LED Indireta para 2027",
    "slug": "tendencias-fachadas-acm-iluminacao-led-2027",
    "coverImageUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6",
    "imageAlt": "Fachada moderna com placas de ACM e iluminação linear",
    "readingTimeMin": 5,
    "status": "PUBLISHED",
    "seo": {
      "metaTitle": "Fachadas em ACM com LED Indireto: Guia Completo e Tendências",
      "metaDescription": "Descubra como o ACM combinado com iluminação LED indireta transforma a fachada do seu negócio e valoriza sua marca."
    }
  }
}
```

### 4.2. CRM — Criação e Conversão de Lead em OS
- **Endpoint:** `POST /api/v1/crm/leads/{id}/convert-to-os`
- **Autenticação:** Sessão de Admin / Cookie HttpOnly
- **Request Body:**
```json
{
  "deadline": "2026-11-15T18:00:00Z",
  "installationDate": "2026-11-16T09:00:00Z",
  "items": [
    {
      "description": "Fachada Estruturada em ACM 3mm Prata com Letras Caixa em Acrílico",
      "unit": "m²",
      "quantity": 18.5,
      "widthMeters": 6.17,
      "heightMeters": 3.00,
      "unitPrice": 480.00,
      "totalPrice": 8880.00
    }
  ],
  "payment": {
    "installments": 2,
    "method": "PIX",
    "downPayment": 4440.00
  },
  "sendWhatsappWelcome": true
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "serviceOrder": {
    "id": "cly87os001",
    "code": "OS-2026-0042",
    "status": "BRIEFING_ARTWORK",
    "customer": {
      "id": "cust_1234",
      "name": "Academia Iron Fit",
      "phone": "+5541999998888"
    },
    "invoices": [
      {
        "code": "FAT-2026-0042-1",
        "amount": 4440.00,
        "status": "PENDING"
      }
    ]
  }
}
```

### 4.3. Prova de Arte — Decisão do Cliente
- **Endpoint:** `POST /api/v1/portal/artworks/{id}/decision`
- **Autenticação:** Sessão de Cliente autenticado
- **Request Body (Aprovação ou Ajuste):**
```json
{
  "decision": "APPROVED", // ou "REVISION_REQUESTED"
  "notes": "Aprovado sem alterações. As cores e proporções estão perfeitas."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "newOSStage": "CNC_ROUTER_CUTTING",
  "message": "Prova aprovada com sucesso! O pedido avançou para a etapa de corte e usinagem."
}
```

---

## 5. Arquitetura de Background Jobs e Integrações

### 5.1. Integração com a API da NVIDIA (NVIDIA NIM)
O módulo de IA utiliza a API de inferência de alta performance da NVIDIA para geração de textos com modelos abertos de classe mundial (ex: `meta/llama-3.1-70b-instruct` ou `mistralai/mixtral-8x22b-instruct`).

- **Base URL:** `https://integrate.api.nvidia.com/v1`
- **Autenticação:** Header `Authorization: Bearer $NVIDIA_API_KEY`
- **Prompt Estruturado (System Prompt):**
  > *"Você é um especialista sênior em comunicação visual, branding arquitetônico, materiais industriais (ACM, lona, acrílico, LED) e redação para SEO técnico. Escreva artigos aprofundados, cativantes e estruturados em Markdown culto em Português do Brasil, gerando meta tags rigorosas e termos para busca visual."*

### 5.2. Integração com APIs de Imagens Gratuitas
1. O gerador extrai uma query fotográfica em inglês (ex: *"modern commercial facade led neon signage acrylic"*).
2. O serviço dispara requisição para a **Unsplash API** (`https://api.unsplash.com/search/photos?query={q}&orientation=landscape&per_page=1`).
3. O payload retornado fornece a URL CDN em 1920x1080 com compressão WebP/AVIF automática, créditos do fotógrafo e alt text para o artigo.

### 5.3. Integração WhatsApp via Evolution API
A **Evolution API** roda em container Docker na mesma VPS, conectada via QR Code a uma linha de WhatsApp oficial da Glessios.
- Comunicação via HTTP REST interno (`http://evolution_api:8080/message/sendText/{instance}`).
- Envio de templates dinâmicos para aprovação de arte, aviso de instalação e cobranças com chave PIX copia-e-cola.

---

## 6. Infraestrutura em VPS & Orquestração Docker

### 6.1. Especificação de Servidor Recomendada
- **Ambiente:** Servidor VPS Ubuntu 24.04 LTS (Hostinger VPS / Hetzner / DigitalOcean).
- **Hardware Mínimo:** 4 vCPU, 8 GB RAM, 80 GB SSD NVMe.

### 6.2. Arquivo `docker-compose.yml` de Produção

```yaml
version: '3.8'

services:
  # 1. Reverse Proxy & SSL Automático
  nginx:
    image: nginx:alpine
    container_name: glessios_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/certbot:/var/www/certbot
    depends_on:
      - app
    networks:
      - glessios_net

  # 2. Aplicação Next.js Principal
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: glessios_app
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      - REDIS_URL=redis://redis:6379
      - NVIDIA_API_KEY=${NVIDIA_API_KEY}
      - UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY}
      - EVOLUTION_API_URL=http://evolution:8080
      - EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://glessios.com.br
    volumes:
      - uploads_data:/app/public/uploads
    depends_on:
      - postgres
      - redis
    networks:
      - glessios_net

  # 3. Banco de Dados PostgreSQL 16
  postgres:
    image: postgres:16-alpine
    container_name: glessios_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - glessios_net

  # 4. Cache & Filas Redis
  redis:
    image: redis:7-alpine
    container_name: glessios_redis
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - glessios_net

  # 5. Gateway WhatsApp Evolution API
  evolution:
    image: atendai/evolution-api:v2.1.0
    container_name: glessios_evolution
    restart: always
    environment:
      - SERVER_URL=https://wpp.glessios.com.br
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=evolution
    depends_on:
      - postgres
    networks:
      - glessios_net

volumes:
  postgres_data:
  redis_data:
  uploads_data:

networks:
  glessios_net:
    driver: bridge
```

---

## 7. Plano de Execução e Cronograma de Sprints

O desenvolvimento é estruturado em 6 sprints consecutivas de alto rendimento:

```
[Sprint 1: Fundação & Design System] ➔ [Sprint 2: Portfólio & Blog IA] ➔ [Sprint 3: CRM & Agendamento]
         ➔ [Sprint 4: OS & Produção de Artes] ➔ [Sprint 5: Estoque & Financeiro] ➔ [Sprint 6: Portal Cliente & Deploy]
```

### Sprint 1: Fundação, Modelagem e Design System
- Setup do repositório Next.js com App Router, TypeScript e Tailwind CSS.
- Configuração do design tokens de cores (Dark Editorial / Laranja Vibrante / Warm Ivory de [DESIGN.md](file:///f:/_CLIENTES/Glessios/Site/DESIGN.md)).
- Implementação dos motion tokens, microinterações e componentes de entrada de [Animaçoes.md](file:///f:/_CLIENTES/Glessios/Site/Anima%C3%A7oes.md).
- Modelagem do banco de dados no Prisma e execução das migrations iniciais no PostgreSQL.
- Sistema de autenticação (NextAuth/Auth.js) com RBAC (Admin e Cliente).

### Sprint 2: Site Institucional, Portfólio e Blog com IA
- Construção da Hero Cinematográfica com arte 3D/sculptural e narrativa de scroll.
- Galeria de Projetos com filtros por categoria de comunicação visual e modal interativo.
- Motor de integração com a API da NVIDIA para geração autônoma de artigos.
- Integração com a API do Unsplash/Pexels para download/vínculo de imagens gratuitas.
- Otimização completa de SEO (Dynamic Sitemap, Schema JSON-LD, RSS Feed).

### Sprint 3: CRM com Funil Kanban e Agendamentos
- Interface drag-and-drop do Kanban com colunas personalizáveis.
- Captação de leads via formulário do site e vinculação instantânea ao Kanban.
- Módulo de Agendamentos (calendário mensal/semanal de visitas técnicas, medições e instalações).
- Disparo de confirmação de agendamento por e-mail e WhatsApp.

### Sprint 4: Ordens de Serviço (OS) e Fluxo de Produção de Artes
- Lógica de conversão automática de Lead Aprovado em Ordem de Serviço (OS).
- Pipeline visual da esteira de fabricação (Briefing ➔ Aprovação de Arte ➔ Corte/Router ➔ Impressão ➔ Montagem ➔ Instalação).
- Módulo de upload de versões de prova de arte pelo designer.
- Mecanismo de notificação de transição de status via Evolution API (WhatsApp).

### Sprint 5: Controle de Estoque e Módulo Financeiro
- Cadastro de materiais de comunicação visual (ACM, lona, acrílico, vinil, tintas, perfis).
- Baixa automática de materiais vinculada aos itens da Ordem de Serviço.
- Alertas de estoque crítico/reposição.
- Emissão de propostas comerciais e orçamentos em PDF com a identidade visual da Glessios.
- Contas a pagar, contas a receber, geração de cobrança PIX e fluxo de caixa consolidado.

### Sprint 6: Portal do Cliente, Testes E2E e Deploy em VPS
- Construção da Dashboard Exclusiva do Cliente (timeline de OS, galeria de aprovação de arte e faturas).
- Testes automatizados de integração e fluxos de aceite (BDD).
- Configuração dos containers Docker, Nginx, SSL e deploy na VPS.
- Treinamento da equipe e entrega final da plataforma em produção.
