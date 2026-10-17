# 🔐 Guia Oficial de Credenciais e Acessos — ICTHUS / Glessios

Estrutura oficial de acessos simplificada em **estritamente 2 papéis (*Roles*) e 2 contas oficiais**:

1. **`ADMIN` (Administrador Geral & Operações Integradas):** Controle total de ponta a ponta (**Gestão & Negócios + Fábrica & Operações CNC**) tudo em um único painel.
2. **`CUSTOMER` (Cliente Contratante):** Acesso exclusivo e seguro ao Portal do Cliente.

---

## 👥 1. Tabela de Perfis e Credenciais Oficiais

| Papel (*Role*) | Conta Oficial | Senha Padrão | Escopo de Acesso | O que gerencia no Painel? |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** (Super Admin) | `ag.codevision@gmail.com.br` | `Omeg@256489` | **Acesso Total Super Admin** | **👑 Controle Supremo:** Acesso irrestrito a todos os módulos, configurações, CRM, Finanças, DRE, Fábrica CNC e Estoque. |
| **`ADMIN`** (Operações) | `admin@glessios.com.br` | `Admin@Glessios2026!` | **Acesso Total Unificado** | **🏢 Gestão & Negócios:** CRM Kanban, Propostas A4, Financeiro & DRE, Faturamento e Agendamentos.<br><br>**⚙️ Fábrica & CNC:** Linha de Produção (8 Fases), Provas de Arte WACLI, Corte Router CNC, Impressão UV e Estoque de Insumos (ACM/LED). |
| **`CUSTOMER`** | `contato@lojaconcept.com.br` | `Cliente@Glessios2026!` | **Portal do Cliente** | Linha do tempo de fabricação da fachada, aprovação/ajuste de Maquetes 3D em alta resolução e pagamento de faturas via PIX QR Code. |

*(Para testes do cliente, existe também a conta demo espelho `renata@conceptbatel.com.br` acessível pelo botão de 1 clique).*

---

## 🧭 2. Links Rápidos de Login e Painéis

### 🛠️ Acesso Administrativo (`ADMIN`)

* **Painel Central Unificado (Produção):** [http://72.62.141.188:3005/admin](http://72.62.141.188:3005/admin)
* **Tela de Login (Produção):** [http://72.62.141.188:3005/admin/login](http://72.62.141.188:3005/admin/login) *(ou `/glessios/login`)*
* **Tela de Login (Local):** [http://localhost:3005/admin/login](http://localhost:3005/admin/login)
  * *Atalho Rápido:* Botão **"Entrar com Conta de Admin Demo (1 Clique)"** preenche e autentica automaticamente.

#### Módulos Operacionais do Painel Unificado:
* **Central de Comando (Dashboard):** [Produção](http://72.62.141.188:3005/admin) • [Local](http://localhost:3005/admin)
* **CRM Comercial Kanban:** [Produção](http://72.62.141.188:3005/admin/crm) • [Local](http://localhost:3005/admin/crm)
* **Linha de Produção & Fábrica (8 Fases):** [Produção](http://72.62.141.188:3005/admin/producao) • [Local](http://localhost:3005/admin/producao)
* **Controle de Estoque (ACM, LEDs):** [Produção](http://72.62.141.188:3005/admin/estoque) • [Local](http://localhost:3005/admin/estoque)
* **Gestão Financeira & DRE:** [Produção](http://72.62.141.188:3005/admin/financeiro) • [Local](http://localhost:3005/admin/financeiro)
* **Agendamentos de Campo & Medição:** [Produção](http://72.62.141.188:3005/admin/agendamentos) • [Local](http://localhost:3005/admin/agendamentos)
* **Proposta Comercial Executiva A4:** [Produção](http://72.62.141.188:3005/admin/propostas/cm8a7b6c5000108l4f1h20987) • [Local](http://localhost:3005/admin/propostas/cm8a7b6c5000108l4f1h20987)

---

### 👤 Portal do Cliente Contratante (`CUSTOMER`)

* **Tela de Login (Produção):** [http://72.62.141.188:3005/portal/login](http://72.62.141.188:3005/portal/login)
* **Tela de Login (Local):** [http://localhost:3005/portal/login](http://localhost:3005/portal/login)
  * *Atalho Rápido:* Botão **"Acessar com Conta Demo"**.
* **Dashboard do Cliente:** [Produção](http://72.62.141.188:3005/portal/dashboard) • [Local](http://localhost:3005/portal/dashboard)

---

## 🖥️ 3. Dados Técnicos da VPS e Deploy

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Servidor / Host** | `72.62.141.188` (`srv1268090.hstgr.cloud`) |
| **Porta SSH** | `22` |
| **Usuário SSH** | `root` |
| **Diretório na VPS** | `/opt/glessios` |
| **Containers Docker** | `glessios_app` (Next.js 15), `glessios_postgres` (PostgreSQL 16), `glessios_migrator` |
| **Porta Externa** | `3005` (`0.0.0.0:3005 -> 3000/tcp`) |
| **Health Check URL** | [http://72.62.141.188:3005/api/v1/health](http://72.62.141.188:3005/api/v1/health) |

### 🚀 Atualizar Produção com 1 Comando:
```powershell
npm run deploy:vps
```
