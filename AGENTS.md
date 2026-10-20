# Diretrizes e Workflows do Projeto ICTHUS / Glessios

> **🔒 Escopo Restrito:** Esta diretriz e workflow são de escopo estritamente local e aplicam-se **única e exclusivamente a este projeto/repositório** (`F:\_CLIENTES\Glessios\Site` / `ag-Codevision/ichtus`). Não deve ser propagado, aplicado ou herdado por nenhum outro projeto ou cliente da máquina.

---

## 🚀 Workflow Obrigatório de Deploy

Sempre que o usuário solicitar a execução do deploy da aplicação (exemplos: *"faça deploy"*, *"sobe pra produção"*, *"atualiza o site"*, *"deploy na vps"* ou variações):

O assistente deve executar **obrigatoriamente** o fluxo de deploy dual em 3 etapas integradas:

### 1. Sincronização e Backup no GitHub
* Verificar se existem alterações pendentes no workspace local (`git status`).
* Se houver alterações válidas de código/configuração, preparar e realizar o commit com mensagem semântica clara em português.
* Enviar a branch atual para o repositório remoto oficial no GitHub:
  ```bash
  git push origin main
  ```
  *(Repositório Oficial: `https://github.com/ag-Codevision/ichtus.git`)*.
* Garantir que o repositório remoto esteja sempre atualizado como backup contínuo do projeto.

### 2. Atualização e Deploy na VPS de Produção
* Executar o script oficial de deploy automatizado:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/deploy-to-vps.ps1
  ```
* O script compacta o projeto, transfere via SCP para o servidor (`72.62.141.188:/opt/glessios`), atualiza os containers Docker com isolamento e executa migrações do Prisma e health check.

### 3. Validação e Feedback ao Usuário
* Confirmar o sucesso de ambas as pontas:
  1. **GitHub:** Código sincronizado e commit registrado na branch remota.
  2. **VPS:** Aplicação ativa em [https://icthusbrasil.com](https://icthusbrasil.com) com status HTTP 200 OK.
