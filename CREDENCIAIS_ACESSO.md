# 🔐 Guia Oficial de Credenciais, Acessos e Infraestrutura — ICTHUS / Glessios

Documentação centralizada de credenciais de acesso, links dos ambientes (Produção na VPS e Local), perfis de permissão unificados e dados técnicos da infraestrutura.

---

## 🌐 1. Ambientes Disponíveis

| Ambiente | URL Base | Finalidade | Status |
| :--- | :--- | :--- | :--- |
| **Produção (VPS)** | [http://72.62.141.188:3005](http://72.62.141.188:3005) | Servidor na nuvem (Hostinger VPS Ubuntu 24.04) | 🟢 **Online / Operacional** |
| **Desenvolvimento Local** | [http://localhost:3005](http://localhost:3005) | Ambiente local de desenvolvimento | 🟢 **Ativo** |

---

## 👥 2. Tabela de Perfis e Credenciais de Acesso

| Perfil (*Role*) | Nome de Exibição | E-mail de Login | Senha Padrão | Escopo e Permissões |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN` (Principal)** | Administrador Geral & Operações | `admin@glessios.com.br` | `Admin@Glessios2026!` | **Controle Total:** CRM Kanban, Agendamentos de Campo, Linha Fabril (8 etapas), Provas Digitais de Arte (WACLI WhatsApp), Controle de Estoque (ACM, LED, Lonas), Módulo Financeiro, PIX com baixa automática, DRE e Propostas Executivas A4. |
| **`ADMIN` (Projetista)** | Carlos Mendes (Admin / Projetista) | `projetista@glessios.com.br` | `Designer@Glessios2026!` | **Operação Técnica:** Estação de trabalho para corte CNC Router, serralheria, montagem e modelagem técnica. |
| **`CUSTOMER` (Oficial)** | Renata Vasconcelos (Loja Concept) | `contato@lojaconcept.com.br` | `Cliente@Glessios2026!` | **Portal do Cliente:** Acompanhamento do cronograma da fachada, aprovação/ajuste de maquetes 3D em alta resolução e quitação de faturas via PIX QR Code. |
| **`CUSTOMER` (Atalho Demo)** | Renata Vasconcelos | `renata@conceptbatel.com.br` | `Cliente@Glessios2026!` | **Atalho Rápido:** Acesso instantâneo com 1 clique pelo botão *"Acessar com Conta Demo"* na tela do portal. |

---

## 🧭 3. Links Rápidos de Login e Módulos do Sistema

### 🛠️ Acesso Administrativo (`ADMIN`)

* **Tela de Login (Produção):** [http://72.62.141.188:3005/admin/login](http://72.62.141.188:3005/admin/login) *(redirecionamento oficial para `/glessios/login`)*
* **Tela de Login (Local):** [http://localhost:3005/admin/login](http://localhost:3005/admin/login)
  * *Dica:* Na tela de login existe o botão **"Entrar com Conta de Admin Demo (1 Clique)"** que preenche e autentica de forma instantânea.

#### Módulos Operacionais do Painel:
* **CRM Comercial Kanban:** [Acessar em Produção](http://72.62.141.188:3005/admin/crm) • [Acessar Local](http://localhost:3005/admin/crm)
* **Produção & Linha Fabril (8 Fases):** [Acessar em Produção](http://72.62.141.188:3005/admin/producao) • [Acessar Local](http://localhost:3005/admin/producao)
* **Controle de Estoque & Chapas ACM:** [Acessar em Produção](http://72.62.141.188:3005/admin/estoque) • [Acessar Local](http://localhost:3005/admin/estoque)
* **Agendamentos de Campo & Instalação:** [Acessar em Produção](http://72.62.141.188:3005/admin/agendamentos) • [Acessar Local](http://localhost:3005/admin/agendamentos)
* **Gestão Financeira & DRE:** [Acessar em Produção](http://72.62.141.188:3005/admin/financeiro) • [Acessar Local](http://localhost:3005/admin/financeiro)
* **Proposta Comercial Executiva A4:** [Acessar em Produção](http://72.62.141.188:3005/admin/propostas/cm8a7b6c5000108l4f1h20987) • [Acessar Local](http://localhost:3005/admin/propostas/cm8a7b6c5000108l4f1h20987)

---

### 👤 Portal do Cliente Contratante (`CUSTOMER`)

* **Tela de Login (Produção):** [http://72.62.141.188:3005/portal/login](http://72.62.141.188:3005/portal/login)
* **Tela de Login (Local):** [http://localhost:3005/portal/login](http://localhost:3005/portal/login)
  * *Dica:* Botão **"Acessar com Conta Demo"** para autenticação instantânea com 1 clique.
* **Dashboard do Cliente:** [Acessar em Produção](http://72.62.141.188:3005/portal/dashboard) • [Acessar Local](http://localhost:3005/portal/dashboard)

---

## 🖥️ 4. Dados Técnicos da VPS e Deploy

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Servidor / Host** | `72.62.141.188` (`srv1268090.hstgr.cloud`) |
| **Porta SSH** | `22` |
| **Usuário SSH** | `root` |
| **Diretório na VPS** | `/opt/glessios` |
| **Containers Docker** | `glessios_app` (Next.js 15), `glessios_postgres` (PostgreSQL 16), `glessios_migrator` |
| **Porta Externa** | `3005` (`0.0.0.0:3005 -> 3000/tcp`) |
| **Health Check URL** | [http://72.62.141.188:3005/api/v1/health](http://72.62.141.188:3005/api/v1/health) |

### 🚀 Como Atualizar o Deploy em Produção:
Sempre que fizer novas alterações no código local e quiser enviar para a VPS, basta executar no terminal:
```powershell
npm run deploy:vps
```
*O script empacota os arquivos, envia via SSH/SFTP e reconstrói os containers na VPS de forma 100% automatizada.*
