# 🔐 Guia de Credenciais e Perfis de Acesso (Roles Unificados) — Glessios

No ecossistema da **Glessios — Comunicação Visual**, o próprio Administrador é responsável pela gestão comercial, financeira e pela operação do chão de fábrica e medições de campo. Por isso, os papéis foram **unificados em 2 categorias oficiais**:

1. **`ADMIN` (Administrador & Gestão Operacional Integrada):** Controle total de ponta a ponta.
2. **`CUSTOMER` (Cliente Contratante):** Acesso exclusivo e seguro ao Portal do Cliente.

---

## 👥 Tabela de Perfis e Credenciais

| Perfil (*Role*) | Nome de Exibição | E-mail de Login | Senha Padrão | Escopo e Permissões |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN` (Principal)** | Administrador Geral & Operações | `admin@glessios.com.br` | `Admin@Glessios2026!` | **Acesso Total:** CRM Kanban, Agendamentos de Campo, Linha Fabril (8 etapas), Provas Digitais de Arte (WACLI), Controle de Estoque com baixa de insumos, Módulo Financeiro, PIX, DRE e Propostas A4. |
| **`ADMIN` (Projetista)** | Carlos Mendes (Admin / Projetista) | `projetista@glessios.com.br` | `Designer@Glessios2026!` | **Operação Técnica:** Conta complementar com perfil `ADMIN` para estações de trabalho de corte CNC, serralheria e design técnico. |
| **`CUSTOMER` (Oficial)** | Renata Vasconcelos (Loja Concept) | `contato@lojaconcept.com.br` | `Cliente@Glessios2026!` | **Portal do Cliente:** Acompanhamento da linha de produção da fachada, aprovação/ajuste de maquetes de arte com 1 clique e quitação de faturas via PIX QR Code. |
| **`CUSTOMER` (Atalho Demo)** | Renata Vasconcelos | `renata@conceptbatel.com.br` | `Cliente@Glessios2026!` | **Portal do Cliente:** Atalho instantâneo através do botão *"Acessar com Conta Demo"* na tela de login do portal. |

---

## 🧭 Onde Fazer Login

### 1. Tela de Login do Administrador (`ADMIN`)
- **Endereço Oficial:** [`http://localhost:3005/admin/login`](http://localhost:3005/admin/login)
  - **Acesso Rápido:** Existe o botão **"Entrar com Conta de Admin Demo (1 Clique)"** que preenche as credenciais automaticamente e autentica de imediato.
  - **Acesso Manual:**
    - **E-mail:** `admin@glessios.com.br`
    - **Senha:** `Admin@Glessios2026!`
  - **Redirecionamento:** Após o login, você é encaminhado diretamente para o painel ERP em [`/admin/crm`](http://localhost:3005/admin/crm).
  - **Acesso Direto (Dev/Operação):** Você também pode acessar qualquer tela administrativa diretamente sem fricção (ex: [`/admin/crm`](http://localhost:3005/admin/crm) ou [`/admin/producao`](http://localhost:3005/admin/producao)).

### 2. Tela de Login do Cliente (`CUSTOMER`)
- **Endereço Oficial:** [`http://localhost:3005/portal/login`](http://localhost:3005/portal/login)
  - **Acesso Rápido:** Botão **"Acessar com Conta Demo"**.
  - **Acesso Manual:**
    - **E-mail:** `contato@lojaconcept.com.br`
    - **Senha:** `Cliente@Glessios2026!`
  - **Redirecionamento:** Encaminha para o dashboard exclusivo do cliente em [`/portal/dashboard`](http://localhost:3005/portal/dashboard).
