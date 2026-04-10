# GitHub Issues — Tracking GO Documentation

> Gerado em 09/04/2026 pelo BaIAninho baseado no [backlog de melhorias](../../docs/backlog-melhorias-vault.md)

## 📋 Visão Geral

Este diretório contém **6 issues estruturadas** para paralelizar o levantamento de informações do Tracking GO entre múltiplos desenvolvedores.

### Distribuição por Prioridade

| Priority | Count | Focus | Can Parallelize |
|----------|--------|-------|-----------------|
| **P1** | 2 issues | Crítico (risco de implementação) | ✅ Assignees específicos |
| **P2** | 2 issues | Research importante | ✅ Times diferentes |
| **P3** | 2 issues | Melhorias de qualidade | ✅ Distribuição livre |

### Issues Overview

| # | Title | Priority | Assignee | Estimate | Type |
|---|-------|----------|----------|----------|------|
| 1 | [Quick Fixes — Inconsistências](01-quick-fixes.md) | P3 | Livre | 15-30 min | fix |
| 2 | [Nomenclatura Crítica — Campos](02-nomenclatura-critica.md) | P1 | @douglas-souza-wolff | 2-4h | fix |
| 3 | [E06/E07 — Admin Discovery](03-admin-discovery.md) | P1 | @juliana-dos-santos | 4-8h | research |
| 4 | [Sistemas Indefinidos](04-sistemas-indefinidos.md) | P2 | @ricardo-tadeu-lima | 3-6h | research |
| 5 | [Validação Técnica — SQL](05-validacao-tecnica.md) | P2 | @douglas-souza-wolff | 2-4h | validation |
| 6 | [Inventário e Assets](06-inventory-assets.md) | P3 | Livre | 1-2h | maintenance |

---

## 🚀 Execução

### Opção 1: Script Automático (PowerShell - Windows)

```powershell
# Navegar para o repositório
cd c:\Projetos\tracking-memory-hackathon

# Dry run (teste sem criar issues)
.\.github\issues\create-all-issues.ps1 -DryRun

# Criar todas as issues
.\.github\issues\create-all-issues.ps1

# Com verbose para debug
.\.github\issues\create-all-issues.ps1 -Verbose
```

### Opção 2: Script Automático (Bash - Linux/Mac)

```bash
# Navegar para o repositório
cd /path/to/tracking-memory-hackathon

# Tornar executável
chmod +x .github/issues/create-all-issues.sh

# Criar todas as issues
./.github/issues/create-all-issues.sh
```

### Opção 3: Manual (GitHub CLI)

```bash
# Issue P1 - Nomenclatura Crítica
gh issue create \
  --title "Nomenclatura Crítica — Campos com Risco de Implementação" \
  --label "P1-high,fix,needs-validation" \
  --assignee douglas-souza-wolff \
  --body-file .github/issues/02-nomenclatura-critica.md

# Issue P1 - Admin Discovery
gh issue create \
  --title "E06/E07 — Admin Discovery (Etapas Vazias)" \
  --label "P1-high,documentation,needs-sme,admin" \
  --assignee juliana-dos-santos \
  --body-file .github/issues/03-admin-discovery.md

# Continue para outras issues...
```

### Opção 4: Interface Web GitHub

1. Acesse: https://github.com/casas-bahia/tracking-memory-hackathon/issues/new
2. Copie content de cada arquivo `.md` como template
3. Adicione labels e assignees conforme documentado

---

## 📊 Labels Strategy

### Priority Labels
- `P1-high` — Crítico, bloqueia implementação
- `P2-medium` — Importante, but não bloqueia
- `P3-low` — Melhoria de qualidade

### Work Type Labels
- `fix` — Corrigir inconsistências ou erros
- `documentation` — Criar/atualizar docs
- `research` — Levantar informações com SMEs
- `validation` — Validar dados técnicos
- `maintenance` — Organizar artefatos

### Special Labels
- `quick-fix` — Resolução < 30 min
- `needs-sme` — Requer Subject Matter Expert
- `sql` — Envolve validação SQL
- `admin` — Sistema Admin específico
- `technical` — Validação técnica/código

---

## 👥 Assignee Strategy

### Issues com Assignee Específico

| Issue | Assignee | Justificativa |
|-------|----------|---------------|
| Nomenclatura Crítica | @douglas-souza-wolff | Referenciado como fonte técnica nos docs |
| Admin Discovery | @juliana-dos-santos | Mencionada como contato do Admin |
| Sistemas Indefinidos | @ricardo-tadeu-lima | Responsável por infra/plataforma |
| Validação SQL | @douglas-souza-wolff | Conhecimento técnico do schema |

### Issues Distribuição Livre
- **Quick Fixes** — Qualquer dev pode pegar
- **Inventário Assets** — Trabalho independente

---

## 🔄 Workflow Sugerido

### 1. Criação das Issues
```bash
# Execute o script para criar todas
.\.github\issues\create-all-issues.ps1
```

### 2. Review e Ajustes
- Verifique assignees estão corretos
- Adicione milestone se necessário
- Configure project board ([GitHub Projects](https://github.com/features/issues))

### 3. Coordenação do Time
- **Weekly sync** para P1/P2 issues
- **Slack/Teams** para coordenação assíncrona
- **Daily updates** nos issues para transparência

### 4. Tracking Progress
```bash
# Ver todas as issues
gh issue list

# Ver issues P1 
gh issue list --label "P1-high"

# Ver issues por assignee
gh issue list --assignee douglas-souza-wolff
```

### 5. Consolidação
- **Dependencies:** Algumas issues dependem de outras (documentado em cada template)
- **Knowledge transfer:** Resultados devem atualizar documentação vault
- **Final review:** Consolidar insights em sessão de team

---

## 🎯 Success Criteria

### Documentation Quality
- [ ] Todos os campos marcados com `*` (a confirmar) resolvidos
- [ ] Frontmatter YAML completo em todos os docs
- [ ] Status `confirmed` em docs com dados reais
- [ ] Wikilinks funcionando no Obsidian

### Technical Validation
- [ ] Queries SQL testadas em DEV
- [ ] Nomes de campo confirmados via banco real
- [ ] Sistemas identificados e documentados
- [ ] APIs/endpoints mapeados

### Team Coordination
- [ ] Cada issue tem progress updates frequentes
- [ ] Dependencies resolvidas sem bloquear outras
- [ ] Knowledge transfer entre assignees
- [ ] Consolidação final em vault

---

## 💡 Tips para Execução

### Para Assignees
- **Read the full issue template** antes de começar
- **Update progress** com comentários no GitHub
- **Ask questions** se contexto insuficiente
- **Cross-reference** outras issues relacionadas

### Para Coordenador
- **Monitor dependencies** entre issues
- **Weekly check-ins** com assignees
- **Remove blockers** quando possível
- **Facilitate knowledge transfer** entre times

### Para Team
- **Parallel work** onde possível
- **Share findings** em outros issues relacionados
- **Document assumptions** when definitive info unavailable
- **Focus on implementation impact** — P1 first

---

## 🧪 Testing the Scripts

### Prerequisites
```bash
# Verificar gh CLI instalado
gh --version

# Verificar autenticação
gh auth status

# Verificar repositório
pwd  # Deve estar em tracking-memory-hackathon root
```

### Dry Run Testing
```powershell
# PowerShell - test without creating
.\.github\issues\create-all-issues.ps1 -DryRun -Verbose
```

### Permissions Required
- **Repository:** Write access to create issues
- **GitHub CLI:** Authenticated with appropriate scopes
- **Assignees:** Users must have repository access

---

## 📞 Support

### Troubleshooting
- **Script fails:** Check authentication and repo permissions
- **Missing body files:** Verify current directory is repo root
- **Wrong assignees:** Update usernames in scripts before execution

### Contact
- **BaIAninho:** Generated scripts e templates
- **Pedro Martins:** Coordenação geral
- **Team leads:** Para ajustar assignees specificos

---

**Last Updated:** 09/04/2026  
**Generated by:** BaIAninho 🤖  
**Source:** [docs/backlog-melhorias-vault.md](../../docs/backlog-melhorias-vault.md)