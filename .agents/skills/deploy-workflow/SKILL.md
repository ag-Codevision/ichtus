---
name: deploy-workflow
description: "Fluxo oficial de deploy do projeto ICTHUS / Glessios. Restrito e exclusivo para este projeto (F:/_CLIENTES/Glessios/Site). Use sempre que o usuário solicitar deploy, atualização ou publicação da aplicação na VPS ou no ambiente de produção. Executa a sincronização obrigatória com o repositório GitHub de backup (ag-Codevision/ichtus) e o deploy na VPS (72.62.141.188:/opt/glessios)."
version: "1.0.0"
category: deployment
tags: ["deploy", "vps", "github", "backup", "docker", "production"]
complexity: intermediate
risk: safe
---

# Workflow de Deploy Dual — VPS & GitHub (Exclusivo ICTHUS / Glessios)

> **🔒 Escopo Local:** Esta automação e seus destinos são estritamente restritos a este repositório (`F:\_CLIENTES\Glessios\Site`). Não se aplica e não interfere em nenhum outro projeto.

## Diretriz Principal
O deploy da aplicação **nunca** deve ser realizado isoladamente apenas na VPS. Ele **sempre** deve garantir o versionamento e backup imediato no repositório oficial do GitHub da Codevision:
* **GitHub Backup:** `https://github.com/ag-Codevision/ichtus.git`
* **VPS Host:** `72.62.141.188` (caminho: `/opt/glessios`)
* **Domínio de Produção:** `https://icthusbrasil.com`

---

## Passos Operacionais do Deploy

### Passo 1: Validação do Workspace Local e Git
1. Verificar status de arquivos pendentes:
   ```bash
   git status
   ```
2. Caso existam alterações nos arquivos do projeto, preparar commit com mensagem descritiva:
   ```bash
   git add .
   git commit -m "feat/fix: <resumo das alterações>"
   ```

### Passo 2: Sincronização Obrigatória com o GitHub (Backup)
1. Fazer o envio para o repositório remoto:
   ```bash
   git push origin main
   ```
2. Garantir que o repositório remoto receba o snapshot do código atual.

### Passo 3: Execução do Deploy na VPS
1. Executar o script oficial de deploy automatizado:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/deploy-to-vps.ps1
   ```
2. O script empacota o código, envia para a VPS via SCP, executa `scripts/deploy.sh` na VPS (rebuild dos containers Docker `glessios_app` e `glessios_postgres`, migração do Prisma e Health Check na porta 3005).

### Passo 4: Confirmação e Relatório
1. Validar resposta HTTP 200 em `https://icthusbrasil.com`.
2. Confirmar ao usuário que tanto o GitHub quanto a VPS foram atualizados com sucesso.
